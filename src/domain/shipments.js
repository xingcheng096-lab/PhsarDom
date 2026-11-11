export const SHIPMENT_TRANSITIONS = {
  Draft: ['Ready to Dispatch', 'Cancelled'],
  'Ready to Dispatch': ['Dispatched', 'Cancelled'],
  Dispatched: ['In Transit'],
  'In Transit': ['Partially Delivered', 'Delivered', 'Delivery Exception'],
  'Partially Delivered': ['Delivered', 'Delivery Exception'],
  'Delivery Exception': ['In Transit', 'Delivered'],
  Delivered: [],
  Cancelled: [],
}

const staffRoles = new Set(['admin', 'logistics', 'warehouse', 'manager'])
const integer = (value) => Number.isInteger(Number(value)) && Number(value) > 0

export function reconcilePOShipment(po, packing, shipments) {
  const ordered = Number(po?.ordered ?? po?.quantity ?? 0)
  const packed = (packing || []).filter((row) => String(row.po) === String(po?.number) && ['Ready to Ship', 'Packed'].includes(row.status)).reduce((sum, row) => sum + Number(row.packed ?? row.qty ?? 0), 0)
  const allocated = (shipments || []).filter((row) => String(row.poId) === String(po?.id)).reduce((sum, row) => sum + Number(row.packedQuantity || 0), 0)
  const dispatched = (shipments || []).filter((row) => String(row.poId) === String(po?.id)).reduce((sum, row) => sum + Number(row.dispatchedQuantity || 0), 0)
  const delivered = (shipments || []).filter((row) => String(row.poId) === String(po?.id)).reduce((sum, row) => sum + Number(row.deliveredQuantity || 0), 0)
  return { ordered, packed, allocated, dispatched, delivered, remainingShippable: Math.max(0, packed - allocated), remainingUnfulfilled: Math.max(0, ordered - delivered) }
}

export function shipmentActionAllowed(actor, action) {
  if (!actor?.id || !staffRoles.has(actor.role)) return false
  if (action === 'view') return true
  return ['create', 'dispatch', 'deliver', 'edit'].includes(action)
}

export function shippableForLine(packing, shipments, poId, lineId, sku, poNumber = poId) {
  const matchesPo = (value) => String(value) === String(poId) || String(value) === String(poNumber)
  const packed = (packing || []).filter((row) => matchesPo(row.poId ?? row.po) && (!sku || row.sku === sku) && (row.status === 'Ready to Ship' || row.status === 'Packed'))
    .reduce((sum, row) => sum + Number(row.packed ?? row.qty ?? 0), 0)
  const shipped = (shipments || []).flatMap((row) => row.shipmentLines || [])
    .filter((row) => String(row.poId ?? row.po) === String(poId) && (!sku || row.productId === sku) && (lineId == null || row.lineId == null || String(row.lineId) === String(lineId)))
    .reduce((sum, row) => sum + Number(row.quantity ?? row.dispatchedQuantity ?? 0), 0)
  return Math.max(0, packed - shipped)
}

export function createShipmentTransaction(state, input, actor, now = new Date().toISOString()) {
  if (!shipmentActionAllowed(actor, 'create')) throw new Error('Unauthorized shipment action.')
  const po = (state.purchaseOrders || []).find((row) => String(row.id) === String(input.poId) || String(row.number) === String(input.poId))
  if (!po) throw new Error('Purchase order not found.')
  if (po.buyerId == null && input.buyerId == null) throw new Error('Shipment buyer identity is required.')
  const buyerId = input.buyerId ?? po.buyerId
  if (String(po.buyerId) !== String(buyerId) && po.buyerId != null) throw new Error('Shipment buyer does not match the purchase order.')
  if (!input.transactionId) throw new Error('Shipment transaction reference is required.')
  if ((state.shipments || []).some((row) => row.transactionId === input.transactionId)) return { state, shipment: state.shipments.find((row) => row.transactionId === input.transactionId), duplicate: true }
  if (!input.warehouseId || !input.carrier || !input.trackingNumber) throw new Error('Warehouse, carrier and tracking number are required.')
  if ((state.shipments || []).some((row) => row.trackingNumber === input.trackingNumber)) throw new Error('Tracking number is already in use.')
  const lines = (input.shipmentLines || []).map((line) => ({ ...line, quantity: Number(line.quantity) }))
  if (!lines.length || lines.some((line) => !integer(line.quantity) || shippableForLine(state.packing, state.shipments, po.id, line.lineId, line.productId, po.number) < line.quantity)) throw new Error('Shipment quantity exceeds packed quantity.')
  const shipment = { shipmentId: `SHP-${Date.now()}`, shipmentNumber: `SHP-2026-${String(8000 + (state.shipments || []).length).padStart(4, '0')}`, transactionId: input.transactionId, poId: po.id, buyerId, warehouseId: input.warehouseId, carrier: input.carrier, serviceLevel: input.serviceLevel || 'Standard', trackingNumber: input.trackingNumber, shippingAddress: input.shippingAddress || '', shipmentLines: lines, packedQuantity: lines.reduce((sum, line) => sum + line.quantity, 0), dispatchedQuantity: 0, deliveredQuantity: 0, status: 'Ready to Dispatch', createdBy: actor, createdAt: now, statusHistory: [{ status: 'Ready to Dispatch', actor, timestamp: now }], proofOfDelivery: null, discrepancyRecords: [] }
  const audit = { id: `${shipment.shipmentId}:created`, actor, action: 'SHIPMENT_CREATED', entityType: 'shipment', entityId: shipment.shipmentId, poId: po.id, buyerId, warehouseId: input.warehouseId, timestamp: now, before: null, after: { status: shipment.status, packedQuantity: shipment.packedQuantity } }
  return { state: { ...state, shipments: [shipment, ...(state.shipments || [])], audit: [audit, ...(state.audit || [])] }, shipment, duplicate: false }
}

export function transitionShipment(state, shipmentId, target, actor, data = {}, now = new Date().toISOString()) {
  if (!shipmentActionAllowed(actor, target === 'Dispatched' ? 'dispatch' : target === 'Delivered' ? 'deliver' : 'edit')) throw new Error('Unauthorized shipment action.')
  const current = (state.shipments || []).find((row) => row.shipmentId === shipmentId || row.shipmentNumber === shipmentId)
  if (!current) throw new Error('Shipment not found.')
  if ((target === 'Delivered' || target === 'Partially Delivered') && current.proofOfDelivery) throw new Error('Proof of delivery has already been submitted.')
  if (!(SHIPMENT_TRANSITIONS[current.status] || []).includes(target)) throw new Error(`Invalid shipment transition: ${current.status} to ${target}.`)
  if (target === 'Dispatched' && current.packedQuantity <= current.dispatchedQuantity) throw new Error('No packed quantity is available for dispatch.')
  if (target === 'Delivered' || target === 'Partially Delivered') {
    if (!data.proofOfDelivery?.receiverName) throw new Error('Receiver name is required.')
    const delivered = Number(data.deliveredQuantity || 0)
    if (!Number.isInteger(delivered) || delivered <= 0 || delivered > Number(current.dispatchedQuantity || 0)) throw new Error('Delivered quantity exceeds dispatched quantity.')
  }
  const updated = { ...current, ...data, status: target, dispatchedQuantity: target === 'Dispatched' ? current.packedQuantity : current.dispatchedQuantity, dispatchedAt: target === 'Dispatched' ? now : current.dispatchedAt, deliveredAt: target === 'Delivered' ? now : current.deliveredAt, statusHistory: [...(current.statusHistory || []), { status: target, actor, timestamp: now }] }
  const audit = { id: `${current.shipmentId}:${target}:${now}`, actor, action: `SHIPMENT_${target.toUpperCase().replaceAll(' ', '_')}`, entityType: 'shipment', entityId: current.shipmentId, poId: current.poId, buyerId: current.buyerId, warehouseId: current.warehouseId, timestamp: now, before: { status: current.status, dispatchedQuantity: current.dispatchedQuantity, deliveredQuantity: current.deliveredQuantity }, after: { status: updated.status, dispatchedQuantity: updated.dispatchedQuantity, deliveredQuantity: updated.deliveredQuantity } }
  return { ...state, shipments: state.shipments.map((row) => row.shipmentId === current.shipmentId ? updated : row), audit: [audit, ...(state.audit || [])] }
}

export function recordShipmentDiscrepancy(state, shipmentId, input, actor, now = new Date().toISOString()) {
  if (!shipmentActionAllowed(actor, 'edit')) throw new Error('Unauthorized shipment action.')
  const current = (state.shipments || []).find((row) => row.shipmentId === shipmentId || row.shipmentNumber === shipmentId)
  if (!current) throw new Error('Shipment not found.')
  if (!['Partially Delivered', 'Delivered', 'Delivery Exception'].includes(current.status)) throw new Error('A discrepancy requires a delivery record.')
  if (current.discrepancyRecords?.some((row) => row.reference === input.reference)) return { state, duplicate: true }
  const missing = Number(input.missingQuantity || 0)
  const damaged = Number(input.damagedQuantity || 0)
  if (![missing, damaged].every((value) => Number.isInteger(value) && value >= 0) || missing + damaged > current.dispatchedQuantity - current.deliveredQuantity) throw new Error('Discrepancy quantities are invalid.')
  const discrepancy = { reference: input.reference || `${current.shipmentId}:DISCREPANCY:${Date.now()}`, type: input.type || 'Missing', missingQuantity: missing, damagedQuantity: damaged, reason: input.reason || '', notes: input.notes || '', createdBy: actor, createdAt: now, resolved: false }
  const updated = { ...current, discrepancyRecords: [discrepancy, ...(current.discrepancyRecords || [])], status: 'Delivery Exception' }
  const audit = { id: `${discrepancy.reference}:audit`, actor, action: 'SHIPMENT_DISCREPANCY_RECORDED', entityType: 'shipment', entityId: current.shipmentId, poId: current.poId, buyerId: current.buyerId, warehouseId: current.warehouseId, timestamp: now, before: { status: current.status, discrepancyCount: current.discrepancyRecords?.length || 0 }, after: { status: updated.status, discrepancyCount: updated.discrepancyRecords.length, missingQuantity: missing, damagedQuantity: damaged } }
  return { state: { ...state, shipments: state.shipments.map((row) => row.shipmentId === current.shipmentId ? updated : row), audit: [audit, ...(state.audit || [])] }, duplicate: false, discrepancy }
}

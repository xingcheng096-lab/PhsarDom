export function availableStock(row) { return Math.max(0, Number(row?.available || 0)) }
export function canReserve(row, quantity) { return Number(quantity) > 0 && Number(quantity) <= availableStock(row) }
export function canPick(row, quantity) { return Number(quantity) > 0 && Number(quantity) <= Number(row?.reserved || 0) }
export function remainingQuantity(ordered, shipped = 0, planned = 0) { return Math.max(0, Number(ordered || 0) - Number(shipped || 0) - Number(planned || 0)) }
export function warehouseAvailable(rows, warehouseId, sku) {
  return (rows || []).filter((row) => (!warehouseId || row.warehouse === warehouseId) && (!sku || row.sku === sku)).reduce((sum, row) => sum + availableStock(row), 0)
}
export function reservationDelta(row, quantity) {
  const qty = Number(quantity)
  if (!canReserve(row, qty)) return { ok: false, reason: 'Insufficient available stock.' }
  return { ok: true, reserved: Number(row.reserved || 0) + qty, available: availableStock(row) - qty }
}
export function releaseDelta(row, quantity) {
  const qty = Number(quantity)
  if (qty <= 0 || qty > Number(row?.reserved || 0)) return { ok: false, reason: 'Release exceeds reserved stock.' }
  return { ok: true, reserved: Number(row.reserved || 0) - qty, available: availableStock(row) + qty }
}
export function pickDelta(row, quantity) {
  const qty = Number(quantity)
  if (!canPick(row, qty)) return { ok: false, reason: 'Pick exceeds reserved stock.' }
  return { ok: true, reserved: Number(row.reserved || 0) - qty, picked: qty }
}
export function backorderQuantity(ordered, available) { return Math.max(0, Number(ordered || 0) - Number(available || 0)) }
export function allocateAcrossWarehouses(rows, quantity, { sku, poId, lineId } = {}) {
  let remaining = Math.max(0, Number(quantity || 0))
  const allocations = []
  for (const row of (rows || []).filter((item) => (!sku || item.sku === sku) && availableStock(item) > 0)) {
    if (!remaining) break
    const qty = Math.min(remaining, availableStock(row))
    if (qty > 0) allocations.push({ poId, lineId, warehouseId: row.warehouse, sku: row.sku, qty })
    remaining -= qty
  }
  return { allocations, backordered: remaining }
}
export function reservationIdentity(poId, lineId, warehouseId) { return `${poId}:${lineId}:${warehouseId}` }
export function transferInventory(state, input = {}, currentActor = {}) {
  const { transactionId = `TR-${Date.now()}`, sku, sourceWarehouse, destinationWarehouse, quantity } = input
  const qty = Number(quantity)
  if (!['admin', 'warehouse', 'inventory', 'manager'].includes(currentActor.role)) return { state, result: { ok: false, reason: 'Unauthorized warehouse action.' } }
  if (!sku || !sourceWarehouse || !destinationWarehouse || sourceWarehouse === destinationWarehouse || !Number.isInteger(qty) || qty <= 0) return { state, result: { ok: false, reason: 'Invalid warehouse transfer.' } }
  if ((state.movements || []).some((movement) => movement.type === 'Transfer' && movement.transactionId === transactionId)) return { state, result: { ok: true, duplicate: true, transactionId } }
  const source = state.inventoryOps.find((row) => row.sku === sku && row.warehouse === sourceWarehouse)
  const destination = state.inventoryOps.find((row) => row.sku === sku && row.warehouse === destinationWarehouse)
  if (!source || availableStock(source) < qty) return { state, result: { ok: false, reason: 'Insufficient available stock.' } }
  const now = new Date().toISOString()
  const inventoryOps = state.inventoryOps.map((row) => row === source ? { ...row, available: row.available - qty } : row === destination ? { ...row, available: row.available + qty, onHand: row.onHand + qty } : row).concat(!destination ? [{ ...source, id: `${source.id}-${destinationWarehouse}`, warehouse: destinationWarehouse, available: qty, reserved: 0, allocated: 0, onHand: qty }] : [])
  const movement = { id: transactionId, transactionId, date: now, sku, quantity: qty, type: 'Transfer', reference: transactionId, warehouse: `${sourceWarehouse} → ${destinationWarehouse}`, user: currentActor.name, actor: currentActor }
  const audit = { id: `${transactionId}-audit`, actor: currentActor, action: 'WAREHOUSE_TRANSFER', entityType: 'inventory', entityId: sku, timestamp: now, quantity: qty, sourceWarehouse, destinationWarehouse, before: { sourceAvailable: source.available, destinationOnHand: destination?.onHand || 0 }, after: { sourceAvailable: source.available - qty, destinationOnHand: (destination?.onHand || 0) + qty } }
  return { state: { ...state, inventoryOps, movements: [movement, ...(state.movements || [])], audit: [audit, ...(state.audit || [])] }, result: { ok: true, duplicate: false, transactionId } }
}

import { createContext, useContext, useEffect, useState } from 'react'
import { inventory } from '../data'
import {
  seedBackorders, seedCarriers, seedCreditNotes, seedCreditRequests,
  seedDeliveries, seedExceptions, seedPacking, seedPayments, seedPicking,
  seedPlans, seedReceiving, seedReservations, seedStockCounts, seedStockMovements,
} from '../data/erpData'

const KEY = 'phsardom-erpv1'
const SEED_VERSION = 'v2-p1'
const TODAY = '2026-09-11'

function initialInventoryOps() {
  return inventory.map((row) => ({
    ...row,
    onHand: row.available + row.reserved + row.allocated,
  }))
}

function initialState() {
  return {
    version: SEED_VERSION,
    creditRequests: seedCreditRequests,
    creditNotes: seedCreditNotes,
    payments: seedPayments,
    reservations: seedReservations,
    receiving: seedReceiving,
    picking: seedPicking,
    packing: seedPacking,
    stockCounts: seedStockCounts,
    backorders: seedBackorders,
    plans: seedPlans,
    deliveries: seedDeliveries,
    exceptions: seedExceptions,
    carriers: seedCarriers,
    movements: seedStockMovements,
    inventoryOps: initialInventoryOps(),
    invoiceOverrides: {},
  }
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (raw && raw.version === SEED_VERSION) return { ...initialState(), ...raw }
  } catch {
    /* ignore corrupt storage */
  }
  return initialState()
}

const ErpContext = createContext(null)

export function ErpProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage may be unavailable */
    }
  }, [state])

  const patch = (slice, fn) =>
    setState((prev) => ({ ...prev, [slice]: typeof fn === 'function' ? fn(prev[slice]) : fn }))

  const mutate = (slice, id, update) =>
    patch(slice, (list) => list.map((item) => (item.id === id ? { ...item, ...(typeof update === 'function' ? update(item) : update) } : item)))

  const pushMovement = (m) => patch('movements', (list) => [{ id: Date.now() + Math.round(Math.random() * 1000), date: `${TODAY} ${new Date().toTimeString().slice(0, 5)}`, user: 'System', ...m }, ...list])

  const inventoryPatch = (sku, update) => {
    patch('inventoryOps', (list) =>
      list.map((row) => (row.sku === sku ? { ...row, ...(typeof update === 'function' ? update(row) : update) } : row)),
    )
  }

  const erp = {
    ...state,

    reset: () => setState(initialState()),

    // ---------- Credit requests ----------
    createCreditRequest: (input) => {
      const max = state.creditRequests.reduce((m, r) => Math.max(m, Number(r.number.slice(-3)) || 0), 0)
      const number = `CR-2026-${String(max + 1).padStart(3, '0')}`
      patch('creditRequests', (list) => [
        { id: Date.now(), number, status: 'Pending', priority: 'Medium', submitted: TODAY, requestedBy: 'Elena Petrova', history: [{ user: 'Elena Petrova', action: 'Submitted', comment: 'Credit request created from finance workspace.', time: `${TODAY} 09:30` }], ...input },
        ...list,
      ])
      return number
    },

    applyCreditDecision: (id, status, comment = '', delegateTo = '') =>
      setState((prev) => ({
        ...prev,
        creditRequests: prev.creditRequests.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                decidedOn: TODAY,
                decidedBy: 'Elena Petrova',
                decisionComment: comment,
                delegateTo,
                history: [...(r.history || []), { user: 'Elena Petrova', action: status, comment: comment || (status === 'Approved' ? 'Approved.' : 'Rejected.'), time: `${TODAY} 09:00` }],
              }
            : r,
        ),
      })),

    // ---------- Stock counts ----------
    submitStockCount: (id) =>
      mutate('stockCounts', id, { adjudicated: true, adjustment: 'Pending' }),

    createStockCount: ({ sku, counted, bin = '', warehouse = '' }) => {
      const row = state.inventoryOps.find((r) => r.sku === sku)
      const systemQty = Number(row?.onHand ?? 0)
      const c = Number(counted)
      const number = `SC-2026-${String(10 + state.stockCounts.length).padStart(3, '0')}`
      patch('stockCounts', (list) => [
        { id: Date.now(), number, sku, product: row?.product || sku, warehouse: warehouse || row?.warehouse || '', bin: bin || row?.bin || '', countedAt: TODAY, systemQty, counted: c, variance: c - systemQty, status: c === systemQty ? 'Matched' : 'Variance', adjudicated: c === systemQty, adjustment: c === systemQty ? 'Approved' : '', adjustmentAt: c === systemQty ? TODAY : '', inventoryRef: number },
        ...list,
      ])
      return number
    },

    applyStockDecision: (id, status, comment = '') => {
      setState((prev) => {
        const c = prev.stockCounts.find((s) => s.id === id)
        const v = Number(c?.variance || 0)
        const approved = status === 'Approved'
        return {
          ...prev,
          stockCounts: prev.stockCounts.map((item) =>
            item.id === id
              ? { ...item, adjudicated: true, adjustment: approved ? 'Approved' : 'Rejected', adjustmentAt: TODAY, adjustmentNote: comment, systemQty: approved ? item.counted : item.systemQty }
              : item,
          ),
          inventoryOps: approved && c
            ? prev.inventoryOps.map((row) => (row.sku === c.sku ? { ...row, available: Math.max(0, row.available + v), onHand: Math.max(0, row.onHand + v) } : row))
            : prev.inventoryOps,
          movements: approved && c
            ? [{ id: Date.now() + Math.round(Math.random() * 99), date: `${TODAY} 09:40`, sku: c.sku, product: c.product, quantity: v, type: 'Adjustment', reference: c.number, user: 'Robert King', warehouse: c.warehouse }, ...prev.movements]
            : prev.movements,
        }
      })
    },

    // ---------- Credit notes ----------
    issueCreditNote: (input) => {
      const number = `CN-2026-${String(316 + state.creditNotes.length).padStart(3, '0')}`
      patch('creditNotes', (list) => [
        { id: Date.now(), number, status: 'Pending Approval', issued: '', history: [{ user: 'Elena Petrova', action: 'Submitted', comment: 'Drafted by finance.', time: `${TODAY} 10:15` }], ...input },
        ...list,
      ])
      return number
    },

    applyCreditNoteDecision: (id, status, comment = '') =>
      mutate('creditNotes', id, {
        status: status === 'Approved' ? 'Issued' : 'Cancelled',
        issued: status === 'Approved' ? TODAY : '',
        history: (item) => [...(item.history || []), { user: 'Elena Petrova', action: status === 'Approved' ? 'Issued' : 'Cancelled', comment, time: `${TODAY} 11:00` }],
      }),

    // ---------- Payments ----------
    recordPayment: (input) => {
      const { invoiceNumber, amount } = input
      const number = `PAY-2026-${String(121 + state.payments.length).padStart(3, '0')}`
      patch('payments', (list) => [{ id: Date.now(), number, date: TODAY, ...input }, ...list])
      setState((prev) => ({
        ...prev,
        invoiceOverrides: {
          ...prev.invoiceOverrides,
          [invoiceNumber]: { paid: (prev.invoiceOverrides[invoiceNumber]?.paid ?? 0) + amount },
        },
      }))
      return number
    },

    voidInvoice: (number) =>
      setState((prev) => ({
        ...prev,
        invoiceOverrides: { ...prev.invoiceOverrides, [number]: { ...prev.invoiceOverrides[number], voided: true } },
      })),

    // ---------- Reservations ----------
    approveReservation: (id) => {
      const res = state.reservations.find((r) => r.id === id)
      mutate('reservations', id, { status: 'Reserved' })
      if (res) {
        inventoryPatch(res.sku, (row) => ({
          reserved: row.reserved + Number(res.qty),
          available: Math.max(0, row.available - Number(res.qty)),
          onHand: Math.max(0, row.onHand),
        }))
        pushMovement({ sku: res.sku, product: res.product, quantity: -Number(res.qty), type: 'Reservation', reference: res.number, warehouse: res.warehouse })
      }
    },

    releaseReservation: (id) => {
      const res = state.reservations.find((r) => r.id === id)
      mutate('reservations', id, { status: 'Released' })
      if (res) {
        inventoryPatch(res.sku, (row) => ({
          reserved: Math.max(0, row.reserved - Number(res.qty)),
          available: row.available + Number(res.qty),
        }))
        pushMovement({ sku: res.sku, product: res.product, quantity: Number(res.qty), type: 'Release', reference: res.number, warehouse: res.warehouse })
      }
    },

    reallocateReservation: (id) =>
      mutate('reservations', id, { status: 'Allocated' }),
    rejectReservation: (id) =>
      mutate('reservations', id, { status: 'Rejected' }),

    // ---------- Receiving ----------
    arriveReceiving: (id) =>
      mutate('receiving', id, (r) => ({ status: r.status === 'Expected' ? 'Arrived' : r.status })),
    startInboundInspection: (id) =>
      mutate('receiving', id, { status: 'Inspecting' }),
    recordReceived: (id, qty) =>
      mutate('receiving', id, (r) => ({ received: Math.min(Number(r.qty), qty + Number(r.received)) })),
    flagDiscrepancy: (id, note) =>
      mutate('receiving', id, { status: 'Discrepancy', discrepancyNote: note }),
    resolveDiscrepancy: (id) =>
      mutate('receiving', id, { status: 'Inspecting', discrepancyNote: undefined }),
    completeReceiving: (id, bin) => {
      const rec = state.receiving.find((r) => r.id === id)
      mutate('receiving', id, { status: 'Completed', bin: bin || rec?.bin })
      if (rec) {
        inventoryPatch(rec.sku, (row) => ({
          available: row.available + Number(rec.received || 0),
          onHand: row.onHand + Number(rec.received || 0),
          status: row.available + Number(rec.received || 0) >= row.reorderPoint ? 'Healthy' : row.status,
        }))
        pushMovement({ sku: rec.sku, product: rec.product, quantity: Number(rec.received || 0), type: 'Receiving', reference: rec.number, warehouse: rec.warehouse })
      }
    },

    // ---------- Picking ----------
    startPick: (id) =>
      mutate('picking', id, { status: 'Picking' }),
    recordPicked: (id, qty) =>
      mutate('picking', id, (r) => ({ picked: Math.min(Number(r.qty), qty + Number(r.picked)) })),
    reportShortage: (id, reason) =>
      mutate('picking', id, { status: 'Shortage', shortageReason: reason }),
    completePick: (id) => {
      const pk = state.picking.find((p) => p.id === id)
      mutate('picking', id, { status: 'Picked' })
      if (pk) {
        inventoryPatch(pk.sku, (row) => ({ reserved: Math.max(0, row.reserved - Number(pk.picked || 0)) }))
        pushMovement({ sku: pk.sku, product: pk.product, quantity: -(Number(pk.picked) || 0), type: 'Pick', reference: pk.number, warehouse: pk.warehouse })
      }
    },

    // ---------- Packing ----------
    startPacking: (id) =>
      mutate('packing', id, { status: 'Packing' }),
    completePacking: (id) =>
      mutate('packing', id, { status: 'Ready to Ship' }),
    preparePlan: (id) => mutate('plans', id, { status: 'Packed' }),

    // ---------- Shipment planning ----------
    createPlan: (input) => {
      const number = `SHP-2026-${String(7722 + state.plans.length).padStart(3, '0')}`
      patch('plans', (list) => [
        { id: Date.now(), number, status: 'Planned', priority: 'Medium', events: [{ label: 'Plan created', detail: 'Created from shipment planning workspace', time: `${TODAY} 08:00` }], ...input },
        ...list,
      ])
      return number
    },
    advancePlan: (id, status, note = '') =>
      mutate('plans', id, (p) => ({
        status,
        events: [...(p.events || []), { label: status, detail: note || p.number, time: `${TODAY} 12:00` }],
      })),
    cancelPlan: (id) =>
      mutate('plans', id, { status: 'Cancelled' }),

    // ---------- Deliveries ----------
    markDelivery: (id, pod) =>
      mutate('deliveries', id, { status: 'Delivered', pod: pod || 'Signed — delivered', date: TODAY }),

    // ---------- Exceptions ----------
    assignException: (id, owner) =>
      mutate('exceptions', id, { status: 'Assigned', owner }),
    addExceptionNote: (id, text) =>
      mutate('exceptions', id, (e) => ({
        note: text,
        timeline: [...(e.timeline || []), { time: `${TODAY} 14:00`, by: 'Lucas Meyer', text }],
      })),
    resolveException: (id, text) =>
      mutate('exceptions', id, (e) => ({
        status: 'Resolved',
        resolutionNote: text,
        timeline: [...(e.timeline || []), { time: `${TODAY} 16:30`, by: 'Lucas Meyer', text: text || 'Resolved.' }],
      })),
  }

  return <ErpContext.Provider value={erp}>{children}</ErpContext.Provider>
}

export function useErp() {
  const ctx = useContext(ErpContext)
  if (!ctx) throw new Error('useErp must be used inside <ErpProvider>')
  return ctx
}

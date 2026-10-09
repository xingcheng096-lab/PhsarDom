import { describe, expect, it } from 'vitest'
import { agingBuckets, buyerExposure, fulfillment, invoiceView, outstanding } from '../src/utils/erp.js'

describe('ERP financial calculations', () => {
  it('derives paid, partial, overdue, and cancelled invoice states', () => {
    const invoice = { number: 'INV-1', amount: 1000, paid: 0, due: '2026-09-01', status: 'Issued' }
    expect(invoiceView(invoice, { 'INV-1': { paid: 1000 } }).status).toBe('Paid')
    expect(invoiceView(invoice, { 'INV-1': { paid: 250 } }).status).toBe('Partially Paid')
    expect(invoiceView(invoice, { 'INV-1': { paid: 0 } }).status).toBe('Overdue')
    expect(invoiceView(invoice, { 'INV-1': { voided: true } }).status).toBe('Cancelled')
    expect(outstanding(invoice, { 'INV-1': { paid: 250 } })).toBe(750)
  })

  it('places open invoices into aging buckets and excludes paid invoices', () => {
    const rows = [
      { number: 'current', amount: 100, paid: 0, due: '2026-09-11', status: 'Issued' },
      { number: 'old', amount: 300, paid: 0, due: '2026-06-01', status: 'Issued' },
      { number: 'paid', amount: 500, paid: 500, due: '2026-01-01', status: 'Paid' },
    ]
    const buckets = agingBuckets(rows)
    expect(buckets.find((b) => b.name === 'Current').amount).toBe(100)
    expect(buckets.find((b) => b.name === '90+ days').amount).toBe(300)
    expect(buckets.reduce((sum, bucket) => sum + bucket.amount, 0)).toBe(400)
  })

  it('subtracts issued credit notes from buyer exposure', () => {
    const invoices = [{ number: 'INV-1', buyer: 'Acme', amount: 1000, paid: 200, due: '2026-12-01', status: 'Issued' }]
    const result = buyerExposure('Acme', invoices, {}, [
      { buyer: 'Acme', amount: 100, status: 'Issued' },
      { buyer: 'Acme', amount: 50, status: 'Pending Approval' },
    ])
    expect(result).toEqual({ open: 800, credits: 100, net: 700 })
  })
})

describe('ERP shipment fulfillment calculations', () => {
  it('calculates shipped, planned, and remaining quantities', () => {
    const po = { number: 'PO-1', ordered: 1000 }
    const shipments = [{ po: 'PO-1', number: 'S-1' }]
    const plans = [
      { po: 'PO-1', qty: 200, status: 'Planned' },
      { po: 'PO-1', qty: 100, status: 'Delivered' },
    ]
    expect(fulfillment(po, shipments, { 'S-1': 300 }, plans)).toMatchObject({ shipped: 300, planned: 200, remaining: 500 })
  })
})

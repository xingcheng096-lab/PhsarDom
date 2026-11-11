const money = (value) => Math.round((Number(value) || 0) * 100) / 100
const inRange = (value, filters = {}) => {
  const date = value ? new Date(value).getTime() : 0
  if (filters.from && date < new Date(filters.from).getTime()) return false
  if (filters.to && date > new Date(`${filters.to}T23:59:59`).getTime()) return false
  return true
}

export function buildSalesReport(state = {}, filters = {}) {
  if (filters.from && filters.to && new Date(filters.from) > new Date(filters.to)) throw new Error('Report start date must be before end date.')
  const matchesText = (row, key, value) => !value || String(row[key] ?? '').toLowerCase().includes(String(value).toLowerCase())
  const pos = (state.purchaseOrders || []).filter((row) => ['Confirmed', 'Approved', 'Processing', 'Partially Shipped', 'Completed', 'Accepted'].includes(row.status) && inRange(row.created, filters) && (!filters.buyerId || String(row.buyerId) === String(filters.buyerId) || String(row.buyer) === String(filters.buyerId)) && (!filters.status || row.status === filters.status) && matchesText(row, 'product', filters.product) && matchesText(row, 'salesperson', filters.salesperson))
  const invoices = (state.invoices || []).filter((row) => inRange(row.issueDate || row.createdAt, filters) && (!filters.buyerId || String(row.buyerId) === String(filters.buyerId) || String(row.buyer) === String(filters.buyerId)) && (!filters.invoiceStatus || row.status === filters.invoiceStatus) && matchesText(row, 'product', filters.product))
  const payments = (state.payments || []).filter((row) => inRange(row.date || row.createdAt, filters))
  const creditNotes = state.creditNotes || []
  const confirmedPOValue = money(pos.reduce((sum, row) => sum + Number(row.amount || row.total || 0), 0))
  const invoicedAmount = money(invoices.reduce((sum, row) => sum + Number(row.total || row.amount || 0), 0))
  const paymentsCollected = money(payments.reduce((sum, row) => sum + Number(row.amount || 0), 0))
  const credits = money(creditNotes.filter((row) => row.status === 'Issued' || row.status === 'Approved').reduce((sum, row) => sum + Number(row.amount || 0), 0))
  const outstandingReceivables = money(Math.max(0, invoices.reduce((sum, row) => sum + Number(row.outstanding ?? row.total ?? row.amount ?? 0), 0) - paymentsCollected - credits))
  const quotes = state.quotations || []
  const accepted = quotes.filter((row) => row.status === 'Accepted').length
  const conversion = quotes.length ? Math.round((accepted / quotes.length) * 100) : 0
  const byBuyer = Object.values(pos.reduce((map, row) => { const key = row.buyerId ?? row.buyer ?? 'unknown'; map[key] ||= { buyer: row.buyer, buyerId: row.buyerId, value: 0, orders: 0 }; map[key].value += Number(row.amount || 0); map[key].orders += 1; return map }, {})).sort((a, b) => b.value - a.value)
  return { confirmedPOValue, invoicedAmount, paymentsCollected, outstandingReceivables, credits, activeBuyers: new Set(pos.map((row) => row.buyerId ?? row.buyer)).size, quoteConversion: conversion, topBuyers: byBuyer, orders: pos, invoices, payments }
}

import { buyers, inventory, invoices, products, purchaseOrders, quotations, reportData, rfqs } from './index'

export const revenueSeries = reportData.map((item) => ({ ...item, period: `${item.month} 2026`, newBuyers: 0 }))
revenueSeries.forEach((item, index) => { item.newBuyers = index === 0 ? 12 : item.buyers - revenueSeries[index - 1].buyers })

export const buyerGrowthSeries = revenueSeries.map(({ period, buyers: activeBuyers, newBuyers }) => ({ period, activeBuyers, newBuyers }))
export const orderSeries = revenueSeries.map(({ period, orders }, index) => ({ period, purchaseOrders: orders, completed: Math.round(orders * (0.82 + index * 0.015)) }))
export const conversionSeries = revenueSeries.map(({ period, conversion }) => ({ period, conversion }))

export const dealPipeline = [
  { stage: 'RFQs', count: rfqs.length, value: rfqs.reduce((sum, item) => sum + item.quantity * item.targetPrice, 0) },
  { stage: 'Quoted', count: quotations.length, value: quotations.reduce((sum, item) => sum + item.amount, 0) },
  { stage: 'Negotiating', count: quotations.filter((item) => item.status === 'Negotiating').length, value: quotations.filter((item) => item.status === 'Negotiating').reduce((sum, item) => sum + item.amount, 0) },
  { stage: 'Accepted', count: quotations.filter((item) => item.status === 'Accepted').length, value: quotations.filter((item) => item.status === 'Accepted').reduce((sum, item) => sum + item.amount, 0) },
  { stage: 'Converted to PO', count: purchaseOrders.length, value: purchaseOrders.reduce((sum, item) => sum + item.amount, 0) }
]

export const assignedPipeline = dealPipeline.map((item, index) => ({ ...item, count: Math.max(0, item.count - (index < 2 ? 2 : 0)), value: Math.round(item.value * 0.42) }))
export const buyerPipeline = [{ stage: 'RFQs', count: 1, value: 37920 }, { stage: 'Quotations', count: 1, value: 39120 }, { stage: 'Purchase Orders', count: 1, value: 68400 }]

export const categoryRevenue = Object.values(quotations.reduce((result, quote) => { const request=rfqs.find((item)=>item.number===quote.rfq); const product=products.find((item)=>item.name===request?.product); const category=product?.category||'Other'; result[category] ||= { category, value:0 }; result[category].value += quote.amount; return result }, {})).sort((a,b)=>b.value-a.value)
export const invoiceStatus = Object.values(invoices.reduce((result, invoice) => { const status=invoice.status==='Issued'?'Outstanding':invoice.status; result[status] ||= { name:status, value:0, amount:0 }; result[status].value += 1; result[status].amount += invoice.amount; return result }, {}))

export const inventoryByWarehouse = Object.values(inventory.reduce((result, item) => { result[item.warehouse] ||= { warehouse:item.warehouse, available:0, reserved:0, allocated:0 }; result[item.warehouse].available += item.available; result[item.warehouse].reserved += item.reserved; result[item.warehouse].allocated += item.allocated; return result }, {}))
export const inventoryValueByProduct = inventory.map((item) => ({ product:item.product, value:item.available * (products.find((product)=>product.sku===item.sku)?.price||0) })).sort((a,b)=>b.value-a.value)
export const receivablesByMonth = Object.values(invoices.reduce((result, invoice) => { const month=new Intl.DateTimeFormat('en-US',{month:'short'}).format(new Date(`${invoice.due}T12:00:00`)); result[month] ||= { period:month, outstanding:0, overdue:0 }; result[month].outstanding += invoice.amount; if(invoice.status==='Overdue')result[month].overdue += invoice.amount; return result }, {}))
export const bookedValueByRep = Object.values(purchaseOrders.reduce((result, order) => { const rep=buyers.find((buyer)=>buyer.business===order.buyer)?.rep||'Unassigned'; result[rep] ||= { name:rep, value:0 }; result[rep].value += order.amount; return result }, {})).sort((a,b)=>b.value-a.value)
export const rfqStatusData = Object.values(rfqs.reduce((result, item) => { result[item.status] ||= { name:item.status, value:0 }; result[item.status].value += 1; return result }, {}))

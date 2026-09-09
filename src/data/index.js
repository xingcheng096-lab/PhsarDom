export const products = [
  { id: 1, sku: 'ELEC-HD440', name: 'Industrial USB-C Docking Station', category: 'Electronics', supplier: 'Vertex Supply Co.', moq: 50, price: 89.5, stock: 1240, status: 'In Stock', unit: 'unit', image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=600&q=80', description: 'Enterprise-grade 12-port docking station with dual 4K display support and 100W power delivery.', tiers: [{ min: 50, max: 99, price: 89.5 }, { min: 100, max: 499, price: 82 }, { min: 500, max: 999, price: 76.5 }, { min: 1000, max: null, price: 71 }] },
  { id: 2, sku: 'SAFE-V220', name: 'ANSI Safety Vest - Class 2', category: 'Safety Equipment', supplier: 'Northstar Industrial', moq: 100, price: 8.75, stock: 5300, status: 'In Stock', unit: 'piece', image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=600&q=80', description: 'High visibility mesh vest for warehouse, construction, and logistics operations.', tiers: [{ min: 100, max: 499, price: 8.75 }, { min: 500, max: 999, price: 7.9 }, { min: 1000, max: null, price: 7.15 }] },
  { id: 3, sku: 'PACK-CT32', name: 'Double Wall Shipping Cartons', category: 'Packaging', supplier: 'PackRight Solutions', moq: 250, price: 2.4, stock: 8900, status: 'In Stock', unit: 'carton', image: 'https://images.unsplash.com/photo-1607166452427-7e4477079cb9?auto=format&fit=crop&w=600&q=80', description: 'Heavy-duty corrugated cartons rated for commercial shipping and warehouse storage.', tiers: [{ min: 250, max: 499, price: 2.4 }, { min: 500, max: 999, price: 2.15 }, { min: 1000, max: null, price: 1.85 }] },
  { id: 4, sku: 'FURN-ERG8', name: 'Ergonomic Task Chair', category: 'Office Furniture', supplier: 'Workspace Partners', moq: 20, price: 184, stock: 186, status: 'Low Stock', unit: 'chair', image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=600&q=80', description: 'Commercial ergonomic chair with adjustable lumbar support and breathable mesh back.', tiers: [{ min: 20, max: 49, price: 184 }, { min: 50, max: 99, price: 169 }, { min: 100, max: null, price: 154 }] },
  { id: 5, sku: 'CLEAN-PRO5', name: 'Commercial Surface Cleaner 5L', category: 'Cleaning Supplies', supplier: 'Allied Facility Goods', moq: 24, price: 31.25, stock: 720, status: 'In Stock', unit: 'container', image: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?auto=format&fit=crop&w=600&q=80', description: 'Concentrated professional multi-surface cleaner for institutional use.', tiers: [{ min: 24, max: 99, price: 31.25 }, { min: 100, max: 249, price: 28.5 }, { min: 250, max: null, price: 26 }] },
  { id: 6, sku: 'TOOL-DR18', name: '18V Cordless Drill Kit', category: 'Tools', supplier: 'Northstar Industrial', moq: 25, price: 119, stock: 0, status: 'Backordered', unit: 'kit', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80', description: 'Professional cordless drill kit with two batteries, charger, and carrying case.', tiers: [{ min: 25, max: 99, price: 119 }, { min: 100, max: null, price: 106 }] }
]

export const buyers = [
  { id: 1, business: 'Atlas Hospitality Group', contact: 'Maya Chen', email: 'maya@atlashospitality.com', industry: 'Hospitality', creditLimit: 250000, status: 'Approved', rep: 'Daniel Brooks', registered: '2026-01-12', phone: '+1 312 555 0142' },
  { id: 2, business: 'Summit BuildWorks LLC', contact: 'Liam Patel', email: 'liam@summitbuildworks.com', industry: 'Construction', creditLimit: 175000, status: 'Approved', rep: 'Sophia Turner', registered: '2025-11-03', phone: '+1 415 555 0188' },
  { id: 3, business: 'Greenline Retail Partners', contact: 'Olivia Martin', email: 'olivia@greenlineretail.com', industry: 'Retail', creditLimit: 100000, status: 'Pending', rep: 'Unassigned', registered: '2026-08-29', phone: '+1 206 555 0161' },
  { id: 4, business: 'Redwood Health Network', contact: 'Noah Williams', email: 'noah@redwoodhealth.org', industry: 'Healthcare', creditLimit: 320000, status: 'Approved', rep: 'Daniel Brooks', registered: '2025-08-17', phone: '+1 617 555 0109' },
  { id: 5, business: 'Coastal Education Services', contact: 'Emma Rodriguez', email: 'emma@coastaledu.com', industry: 'Education', creditLimit: 85000, status: 'Suspended', rep: 'Marcus Reed', registered: '2025-10-22', phone: '+1 305 555 0124' },
  { id: 6, business: 'BluePeak Logistics Inc.', contact: 'Ethan Foster', email: 'ethan@bluepeaklogistics.com', industry: 'Logistics', creditLimit: 210000, status: 'Approved', rep: 'Sophia Turner', registered: '2026-02-08', phone: '+1 718 555 0173' }
]

export const rfqs = [
  { id: 1, number: 'RFQ-2026-1048', buyer: 'Atlas Hospitality Group', product: 'Ergonomic Task Chair', quantity: 240, targetPrice: 158, rep: 'Daniel Brooks', status: 'Negotiating', created: '2026-09-05' },
  { id: 2, number: 'RFQ-2026-1047', buyer: 'Summit BuildWorks LLC', product: 'ANSI Safety Vest - Class 2', quantity: 1800, targetPrice: 6.8, rep: 'Sophia Turner', status: 'Under Review', created: '2026-09-04' },
  { id: 3, number: 'RFQ-2026-1046', buyer: 'Redwood Health Network', product: 'Commercial Surface Cleaner 5L', quantity: 500, targetPrice: 24.5, rep: 'Daniel Brooks', status: 'Quoted', created: '2026-09-03' },
  { id: 4, number: 'RFQ-2026-1045', buyer: 'BluePeak Logistics Inc.', product: 'Double Wall Shipping Cartons', quantity: 5000, targetPrice: 1.65, rep: 'Sophia Turner', status: 'New', created: '2026-09-02' },
  { id: 5, number: 'RFQ-2026-1044', buyer: 'Coastal Education Services', product: 'Industrial USB-C Docking Station', quantity: 120, targetPrice: 78, rep: 'Marcus Reed', status: 'Rejected', created: '2026-08-30' }
]

export const quotations = [
  { id: 1, number: 'QT-2026-0832', buyer: 'Atlas Hospitality Group', rfq: 'RFQ-2026-1048', amount: 39120, discount: 11, expiry: '2026-09-20', status: 'Negotiating' },
  { id: 2, number: 'QT-2026-0831', buyer: 'Redwood Health Network', rfq: 'RFQ-2026-1046', amount: 12875, discount: 16, expiry: '2026-09-18', status: 'Sent' },
  { id: 3, number: 'QT-2026-0830', buyer: 'Summit BuildWorks LLC', rfq: 'RFQ-2026-1043', amount: 22750, discount: 9, expiry: '2026-09-14', status: 'Accepted' },
  { id: 4, number: 'QT-2026-0829', buyer: 'BluePeak Logistics Inc.', rfq: 'RFQ-2026-1041', amount: 9100, discount: 12, expiry: '2026-09-12', status: 'Draft' }
]

export const purchaseOrders = [
  { id: 1, number: 'PO-2026-2142', buyer: 'Summit BuildWorks LLC', quote: 'QT-2026-0830', amount: 22750, terms: 'Net-30', delivery: '2026-09-25', status: 'Processing', created: '2026-09-01' },
  { id: 2, number: 'PO-2026-2141', buyer: 'Atlas Hospitality Group', quote: 'QT-2026-0826', amount: 68400, terms: 'Net-60', delivery: '2026-09-18', status: 'Partially Shipped', created: '2026-08-29' },
  { id: 3, number: 'PO-2026-2140', buyer: 'Redwood Health Network', quote: 'QT-2026-0821', amount: 34200, terms: 'Net-30', delivery: '2026-09-15', status: 'Approved', created: '2026-08-27' },
  { id: 4, number: 'PO-2026-2139', buyer: 'BluePeak Logistics Inc.', quote: 'QT-2026-0819', amount: 91500, terms: 'Net-90', delivery: '2026-09-30', status: 'Pending', created: '2026-08-24' }
]

export const contracts = [
  { id: 1, number: 'CTR-2026-121', buyer: 'Atlas Hospitality Group', start: '2026-01-01', end: '2026-12-31', value: 480000, terms: 'Net-60', status: 'Active' },
  { id: 2, number: 'CTR-2026-120', buyer: 'Redwood Health Network', start: '2026-03-01', end: '2027-02-28', value: 720000, terms: 'Net-30', status: 'Active' },
  { id: 3, number: 'CTR-2025-098', buyer: 'BluePeak Logistics Inc.', start: '2025-10-01', end: '2026-09-30', value: 315000, terms: 'Net-90', status: 'Expiring' },
  { id: 4, number: 'CTR-2026-126', buyer: 'Summit BuildWorks LLC', start: '2026-10-01', end: '2027-09-30', value: 525000, terms: 'Net-30', status: 'Pending Approval' }
]

export const warehouses = [
  { id: 1, code: 'WH-CHI-01', name: 'Central Distribution Center', location: 'Chicago, IL', manager: 'Robert King', status: 'Active' },
  { id: 2, code: 'WH-NJ-02', name: 'Northeast Fulfillment Hub', location: 'Newark, NJ', manager: 'Amelia Scott', status: 'Active' },
  { id: 3, code: 'WH-LA-03', name: 'West Coast Warehouse', location: 'Los Angeles, CA', manager: 'James Liu', status: 'Active' },
  { id: 4, code: 'WH-DAL-04', name: 'Southern Cross-Dock', location: 'Dallas, TX', manager: 'Ava Mitchell', status: 'Maintenance' }
]

export const inventory = products.map((product, i) => ({ id: product.id, sku: product.sku, product: product.name, warehouse: warehouses[i % 3].code, bin: `A${i + 1}-${10 + i}`, available: product.stock, reserved: [180, 600, 1250, 82, 140, 350][i], allocated: [100, 400, 800, 45, 72, 200][i], backordered: product.stock ? 0 : 125, reorderPoint: [500, 1000, 2000, 250, 300, 200][i], status: product.stock === 0 ? 'Backordered' : product.stock < 300 ? 'Low Stock' : 'Healthy' }))

export const invoices = [
  { id: 1, number: 'INV-2026-3901', buyer: 'Atlas Hospitality Group', po: 'PO-2026-2141', amount: 68400, terms: 'Net-60', due: '2026-10-28', status: 'Partially Paid' },
  { id: 2, number: 'INV-2026-3900', buyer: 'Redwood Health Network', po: 'PO-2026-2137', amount: 34200, terms: 'Net-30', due: '2026-09-26', status: 'Issued' },
  { id: 3, number: 'INV-2026-3887', buyer: 'BluePeak Logistics Inc.', po: 'PO-2026-2128', amount: 91500, terms: 'Net-90', due: '2026-11-18', status: 'Issued' },
  { id: 4, number: 'INV-2026-3821', buyer: 'Coastal Education Services', po: 'PO-2026-2077', amount: 18750, terms: 'Net-30', due: '2026-08-30', status: 'Overdue' }
]

export const shipments = [
  { id: 1, number: 'SHP-2026-7712', po: 'PO-2026-2141', buyer: 'Atlas Hospitality Group', carrier: 'DHL Freight', tracking: 'DHL984520117', dispatch: '2026-09-04', expected: '2026-09-10', status: 'In Transit' },
  { id: 2, number: 'SHP-2026-7711', po: 'PO-2026-2140', buyer: 'Redwood Health Network', carrier: 'FedEx Freight', tracking: 'FXF774210829', dispatch: '2026-09-06', expected: '2026-09-12', status: 'Dispatched' },
  { id: 3, number: 'SHP-2026-7708', po: 'PO-2026-2136', buyer: 'Summit BuildWorks LLC', carrier: 'XPO Logistics', tracking: 'XPO448190031', dispatch: '2026-09-01', expected: '2026-09-07', status: 'Delivered' },
  { id: 4, number: 'SHP-2026-7704', po: 'PO-2026-2132', buyer: 'BluePeak Logistics Inc.', carrier: 'Old Dominion', tracking: 'ODF112809342', dispatch: '2026-08-28', expected: '2026-09-04', status: 'Delayed' }
]

export const users = [
  { id: 1, name: 'Alex Morgan', email: 'alex@phsardom.com', role: 'Super Admin', department: 'Administration', status: 'Active', lastLogin: '2026-09-08 08:42' },
  { id: 2, name: 'Rachel Evans', email: 'rachel@phsardom.com', role: 'Sales Manager', department: 'Sales', status: 'Active', lastLogin: '2026-09-08 08:21' },
  { id: 3, name: 'Daniel Brooks', email: 'daniel@phsardom.com', role: 'Account Executive', department: 'Sales', status: 'Active', lastLogin: '2026-09-07 17:55' },
  { id: 4, name: 'Sophia Turner', email: 'sophia@phsardom.com', role: 'Account Executive', department: 'Sales', status: 'Active', lastLogin: '2026-09-08 07:48' },
  { id: 5, name: 'Maya Chen', email: 'maya@atlashospitality.com', role: 'Verified Buyer', department: 'Purchasing', status: 'Active', lastLogin: '2026-09-07 14:12' }
]

export const activityLogs = [
  { id: 1, time: '2026-09-08 09:12', user: 'Rachel Evans', role: 'Sales Manager', module: 'Approvals', action: 'Approved', description: 'Approved pricing exception for QT-2026-0832', ip: '10.24.18.42' },
  { id: 2, time: '2026-09-08 08:56', user: 'Daniel Brooks', role: 'Account Executive', module: 'Quotations', action: 'Updated', description: 'Revised payment terms on QT-2026-0832', ip: '10.24.21.17' },
  { id: 3, time: '2026-09-08 08:42', user: 'Alex Morgan', role: 'Super Admin', module: 'Buyers', action: 'Approved', description: 'Verified BluePeak Logistics Inc.', ip: '10.24.11.5' },
  { id: 4, time: '2026-09-08 08:15', user: 'System', role: 'System', module: 'Inventory', action: 'Alert', description: 'Reorder threshold reached for FURN-ERG8', ip: '127.0.0.1' },
  { id: 5, time: '2026-09-07 17:32', user: 'Sophia Turner', role: 'Account Executive', module: 'RFQs', action: 'Assigned', description: 'Accepted assignment for RFQ-2026-1047', ip: '10.24.21.29' }
]

export const reportData = [
  { month: 'Apr', revenue: 418000, orders: 142, buyers: 236, conversion: 54 },
  { month: 'May', revenue: 452000, orders: 151, buyers: 248, conversion: 57 },
  { month: 'Jun', revenue: 439000, orders: 147, buyers: 259, conversion: 55 },
  { month: 'Jul', revenue: 501000, orders: 169, buyers: 271, conversion: 61 },
  { month: 'Aug', revenue: 538000, orders: 181, buyers: 286, conversion: 64 },
  { month: 'Sep', revenue: 572000, orders: 193, buyers: 304, conversion: 67 }
]

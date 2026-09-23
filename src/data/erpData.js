// Phase 2 operational seeds — finance, warehouse, inventory, logistics.
// These feed the ErpProvider (src/services/erpStore.jsx) and stay consistent with
// the static enterprise records in ./index.js (buyers, POs, invoices, shipments).

/* eslint-disable no-unused-vars */

export const shipmentQty = {
  'SHP-2026-7712': 500,
  'SHP-2026-7711': 1000,
  'SHP-2026-7708': 250,
  'SHP-2026-7704': 30000,
}

export const seedCreditRequests = [
  { id: 1, number: 'CR-2026-016', approvalId: 'APR-2026-503', buyer: 'BluePeak Logistics Inc.', currentLimit: 210000, requestedLimit: 270000, terms: 'Net-90', risk: 'Medium', status: 'Pending', priority: 'Medium', submitted: '2026-09-06', requestedBy: 'Sophia Turner', purpose: 'Annual packaging contract ($315k) volume growth — backs PO-2026-2139.', impact: 'Exposure stays under the proposed limit; DSO impact moderate.', history: [
    { user: 'Sophia Turner', action: 'Submitted', comment: 'Credit increase requested for annual contract renewal.', time: '2026-09-06 10:30' },
    { user: 'Elena Petrova', action: 'Risk screening', comment: 'Payment history clean; 0 accounts overdue.', time: '2026-09-06 15:12' },
  ] },
  { id: 2, number: 'CR-2026-017', buyer: 'Greenline Retail Partners', currentLimit: 100000, requestedLimit: 150000, terms: 'Net-30', risk: 'Medium', status: 'Approved', priority: 'High', submitted: '2026-09-08', requestedBy: 'System (Application)', purpose: 'New-account onboarding credit line sized to projected Q4 order flow.', impact: 'Unlocks $150k purchasing power once buyer verification completes.', decidedOn: '2026-09-10', decidedBy: 'Elena Petrova', history: [
    { user: 'System', action: 'Submitted', comment: 'Credit broker recommendation on registration.', time: '2026-09-08 09:00' },
    { user: 'Elena Petrova', action: 'Approved', comment: 'Onboarding credit authorized pending verification.', time: '2026-09-10 09:30' },
  ] },
  { id: 3, number: 'CR-2026-015', buyer: 'Redwood Health Network', currentLimit: 320000, requestedLimit: 400000, terms: 'Net-30', risk: 'Low', status: 'Approved', priority: 'Medium', submitted: '2026-09-05', requestedBy: 'Daniel Brooks', purpose: 'FY renewal program at $720k contract value.', impact: 'Supports cleaner/consumables program with contract pricing.', decidedOn: '2026-09-09', decidedBy: 'Elena Petrova', history: [
    { user: 'Daniel Brooks', action: 'Submitted', comment: 'Annual renewal request.', time: '2026-09-05 14:00' },
    { user: 'Elena Petrova', action: 'Approved', comment: '39% of limit in use; strong payment history.', time: '2026-09-09 09:20' },
  ] },
  { id: 4, number: 'CR-2026-014', buyer: 'Summit BuildWorks LLC', currentLimit: 175000, requestedLimit: 250000, terms: 'Net-30', risk: 'Low', status: 'Approved', priority: 'Low', submitted: '2026-09-03', requestedBy: 'Sophia Turner', purpose: 'Safety-equipment rollout across four active construction sites.', impact: 'Covers Q4 drill-kit and PPE ordering.', decidedOn: '2026-09-05', decidedBy: 'Elena Petrova', history: [
    { user: 'Sophia Turner', action: 'Submitted', comment: 'Q4 PPE rollout.', time: '2026-09-03 11:30' },
    { user: 'Elena Petrova', action: 'Approved', comment: 'Low risk profile.', time: '2026-09-05 13:45' },
  ] },
  { id: 5, number: 'CR-2026-013', buyer: 'Coastal Education Services', currentLimit: 85000, requestedLimit: 120000, terms: 'Net-30', risk: 'High', status: 'Rejected', priority: 'High', submitted: '2026-09-01', requestedBy: 'Marcus Reed', purpose: 'Reactivation requested for computer-lab refresh. Account suspended.', impact: 'Account is suspended with 90+ day overdue balance.', decidedOn: '2026-09-02', decidedBy: 'Elena Petrova', history: [
    { user: 'Marcus Reed', action: 'Submitted', comment: 'Reactivation attempt.', time: '2026-09-01 12:10' },
    { user: 'Elena Petrova', action: 'Rejected', comment: '90+ overdue; suspension upheld pending settlement.', time: '2026-09-02 10:00' },
  ] },
  { id: 6, number: 'CR-2026-012', buyer: 'Atlas Hospitality Group', currentLimit: 250000, requestedLimit: 300000, terms: 'Net-60', risk: 'Low', status: 'Approved', priority: 'Medium', submitted: '2026-09-02', requestedBy: 'Daniel Brooks', purpose: 'Q4 furniture refresh program under CTR-2026-121.', impact: 'Backs PO-2026-2141 ($68,400) plus season pipeline.', decidedOn: '2026-09-03', decidedBy: 'Elena Petrova', history: [
    { user: 'Daniel Brooks', action: 'Submitted', comment: 'Furniture refresh.', time: '2026-09-02 16:20' },
    { user: 'Elena Petrova', action: 'Approved', comment: 'Low risk; 20% of limit in use.', time: '2026-09-03 08:55' },
  ] },
]

export const seedPayments = [
  { id: 1, number: 'PAY-2026-120', invoice: 'INV-2026-3901', buyer: 'Atlas Hospitality Group', amount: 34200, date: '2026-09-03', method: 'Wire transfer', reference: 'REF-88213' },
  { id: 2, number: 'PAY-2026-119', invoice: 'INV-2026-3821', buyer: 'Coastal Education Services', amount: 12500, date: '2026-08-15', method: 'ACH', reference: 'REF-77410' },
  { id: 3, number: 'PAY-2026-118', invoice: 'INV-2026-3850', buyer: 'Summit BuildWorks LLC', amount: 12800, date: '2026-07-02', method: 'Wire transfer', reference: 'REF-69122' },
  { id: 4, number: 'PAY-2026-117', invoice: 'INV-2026-3890', buyer: 'Summit BuildWorks LLC', amount: 9750, date: '2026-07-20', method: 'ACH', reference: 'REF-68990' },
]

export const seedCreditNotes = [
  { id: 1, number: 'CN-2026-0312', buyer: 'Atlas Hospitality Group', invoice: 'INV-2026-3901', amount: 1200, reason: 'Freight adjustment — customer pickup on SHP-2026-7712.', status: 'Issued', issued: '2026-09-03', related: 'SHP-2026-7712', history: [
    { user: 'Daniel Brooks', action: 'Submitted', comment: 'Freight adjustment.', time: '2026-09-02 16:00' },
    { user: 'Elena Petrova', action: 'Approved', comment: 'Matches contract freight terms.', time: '2026-09-03 09:12' },
  ] },
  { id: 2, number: 'CN-2026-0313', approvalId: 'APR-2026-507', buyer: 'Coastal Education Services', invoice: 'INV-2026-3821', amount: 1200, reason: 'Freight delay credit on SHP-2026-7704 (weather rebook).', status: 'Pending Approval', issued: '', related: 'SHP-2026-7704', history: [
    { user: 'Daniel Brooks', action: 'Submitted', comment: 'Goodwill credit to education buyer.', time: '2026-09-08 10:05' },
  ] },
  { id: 3, number: 'CN-2026-0314', buyer: 'BluePeak Logistics Inc.', invoice: 'INV-2026-3895', amount: 2400, reason: 'Q2 carton volume rebate (contract CTR-2025-098).', status: 'Issued', issued: '2026-09-02', related: 'PO-2026-2128', history: [
    { user: 'Elena Petrova', action: 'Issued', comment: 'Volume rebate executed.', time: '2026-09-02 11:00' },
  ] },
  { id: 4, number: 'CN-2026-0315', buyer: 'Summit BuildWorks LLC', invoice: 'INV-2026-3890', amount: 750, reason: 'Damaged units on delivery — warranty credit.', status: 'Applied', issued: '2026-08-20', related: 'SHP-2026-7708', history: [
    { user: 'Liam Patel', action: 'Requested', comment: 'Two units damaged on receipt.', time: '2026-08-18 10:00' },
    { user: 'Elena Petrova', action: 'Issued', comment: 'Warranty credit applied.', time: '2026-08-20 14:30' },
  ] },
]

export const seedReservations = [
  { id: 1, number: 'RSV-2026-815', po: 'PO-2026-2141', buyer: 'Atlas Hospitality Group', product: 'Ergonomic Task Chair', sku: 'FURN-ERG8', warehouse: 'WH-CHI-01', bin: 'A4-13', qty: 740, status: 'Pending', priority: 'High', requested: '2026-09-08', neededBy: '2026-09-12', note: 'Backfills partial shipment; recovers 740 remaining on the chair order.' },
  { id: 2, number: 'RSV-2026-816', po: 'PO-2026-2140', buyer: 'Redwood Health Network', product: 'Commercial Surface Cleaner 5L', sku: 'CLEAN-PRO5', warehouse: 'WH-NJ-02', bin: 'A5-14', qty: 1000, status: 'Pending', priority: 'Medium', requested: '2026-09-06', neededBy: '2026-09-15', note: 'Healthcare program order IN-2026-3900.' },
  { id: 3, number: 'RSV-2026-817', po: 'PO-2026-2142', buyer: 'Summit BuildWorks LLC', product: '18V Cordless Drill Kit', sku: 'TOOL-DR18', warehouse: 'WH-DAL-04', bin: 'A6-15', qty: 250, status: 'Pending', priority: 'High', requested: '2026-09-07', neededBy: '2026-09-18', note: 'SKU backordered — holds against inbound replenishment.' },
  { id: 4, number: 'RSV-2026-811', po: 'PO-2026-2139', buyer: 'BluePeak Logistics Inc.', product: 'Double Wall Shipping Cartons', sku: 'PACK-CT32', warehouse: 'WH-CHI-01', bin: 'A3-12', qty: 30000, status: 'Pending', priority: 'Medium', requested: '2026-09-04', neededBy: '2026-09-20', note: 'Annual packaging release 01.' },
  { id: 5, number: 'RSV-2026-813', po: 'PO-2026-2141', buyer: 'Atlas Hospitality Group', product: 'Ergonomic Task Chair', sku: 'FURN-ERG8', warehouse: 'WH-CHI-01', bin: 'A4-13', qty: 500, status: 'Allocated', priority: 'High', requested: '2026-09-02', neededBy: '2026-09-04', note: 'First partial shipment 500 units.' },
  { id: 6, number: 'RSV-2026-812', po: 'PO-2026-2136', buyer: 'Summit BuildWorks LLC', product: 'ANSI Safety Vest - Class 2', sku: 'SAFE-V220', warehouse: 'WH-LA-03', bin: 'A2-12', qty: 250, status: 'Released', priority: 'Low', requested: '2026-08-31', neededBy: '2026-09-05', note: 'Released — partial fulfillment confirmed.' },
]

export const seedReceiving = [
  { id: 1, number: 'RCV-2026-2201', po: 'PO-2026-2147', supplier: 'Workspace Partners', product: 'Ergonomic Task Chair', sku: 'FURN-ERG8', qty: 740, received: 0, warehouse: 'WH-CHI-01', bin: 'A4-13', expected: '2026-09-14', carrier: 'Workspace Partners LTL', status: 'Expected', note: 'Inbound replenishment feeding RSV-2026-815.' },
  { id: 2, number: 'RCV-2026-2202', po: 'PO-2026-2126', supplier: 'Vertex Supply Co.', product: 'Industrial USB-C Docking Station', sku: 'ELEC-HD440', qty: 400, received: 0, warehouse: 'WH-NJ-02', bin: 'B2-12', expected: '2026-09-12', carrier: 'Vertex Supply Trucking', status: 'Arrived', note: 'Arrived on dock; release paperwork signed.' },
  { id: 3, number: 'RCV-2026-2203', po: 'PO-2026-2139', supplier: 'PackRight Solutions', product: 'Double Wall Shipping Cartons', sku: 'PACK-CT32', qty: 30000, received: 0, warehouse: 'WH-CHI-01', bin: 'A3-12', expected: '2026-09-10', carrier: 'PackRight Fleet', status: 'Expected', note: 'Packaging release 01 for PO-2026-2139.' },
  { id: 4, number: 'RCV-2026-2204', po: 'PO-2026-2144', supplier: 'Northstar Industrial', product: 'ANSI Safety Vest - Class 2', sku: 'SAFE-V220', qty: 1800, received: 900, warehouse: 'WH-LA-03', bin: 'C3-8', expected: '2026-09-09', carrier: 'Northstar Fleet', status: 'Inspecting', note: 'First pallet received; QC sampling in progress.' },
  { id: 5, number: 'RCV-2026-2199', po: 'PO-2026-2140', supplier: 'Allied Facility Goods', product: 'Commercial Surface Cleaner 5L', sku: 'CLEAN-PRO5', qty: 1000, received: 1000, warehouse: 'WH-NJ-02', bin: 'A5-14', expected: '2026-09-05', carrier: 'Allied Fleet', status: 'Completed', note: 'Put away 1000 units to A5-14.' },
]

export const seedPicking = [
  { id: 1, number: 'PK-2026-901', po: 'PO-2026-2141', buyer: 'Atlas Hospitality Group', product: 'Ergonomic Task Chair', sku: 'FURN-ERG8', warehouse: 'WH-CHI-01', bin: 'A4-13', qty: 740, picked: 0, priority: 'High', status: 'Waiting', neededBy: '2026-09-12', note: 'Full remaining balance of PO-2026-2141.' },
  { id: 2, number: 'PK-2026-902', po: 'PO-2026-2140', buyer: 'Redwood Health Network', product: 'Commercial Surface Cleaner 5L', sku: 'CLEAN-PRO5', warehouse: 'WH-NJ-02', bin: 'A5-14', qty: 1000, picked: 0, priority: 'Medium', status: 'Assigned', neededBy: '2026-09-15', note: 'Assigned to Sofia Reyes.' },
  { id: 3, number: 'PK-2026-903', po: 'PO-2026-2142', buyer: 'Summit BuildWorks LLC', product: '18V Cordless Drill Kit', sku: 'TOOL-DR18', warehouse: 'WH-DAL-04', bin: 'A6-15', qty: 250, picked: 0, priority: 'High', status: 'Waiting', neededBy: '2026-09-18', note: 'Holds pick against backorder replenishment.' },
  { id: 4, number: 'PK-2026-904', po: 'PO-2026-2139', buyer: 'BluePeak Logistics Inc.', product: 'Double Wall Shipping Cartons', sku: 'PACK-CT32', warehouse: 'WH-CHI-01', bin: 'A3-12', qty: 30000, picked: 0, priority: 'Medium', status: 'Waiting', neededBy: '2026-09-20', note: 'Packaging release 01 wave.' },
  { id: 5, number: 'PK-2026-900', po: 'PO-2026-2141', buyer: 'Atlas Hospitality Group', product: 'Ergonomic Task Chair', sku: 'FURN-ERG8', warehouse: 'WH-CHI-01', bin: 'A4-13', qty: 500, picked: 500, priority: 'High', status: 'Picked', neededBy: '2026-09-04', note: 'Picked and packed for SHP-2026-7712.' },
]

export const seedPacking = [
  { id: 1, number: 'PKG-2026-501', pick: 'PK-2026-901', po: 'PO-2026-2141', buyer: 'Atlas Hospitality Group', product: 'Ergonomic Task Chair', sku: 'FURN-ERG8', qty: 740, packages: 12, weight: '1,940 kg', status: 'Waiting', priority: 'High', warehouse: 'WH-CHI-01', note: 'Palletized build for remaining 740 chairs.' },
  { id: 2, number: 'PKG-2026-502', pick: 'PK-2026-902', po: 'PO-2026-2140', buyer: 'Redwood Health Network', product: 'Commercial Surface Cleaner 5L', sku: 'CLEAN-PRO5', qty: 1000, packages: 8, weight: '910 kg', status: 'Packing', priority: 'Medium', warehouse: 'WH-NJ-02', note: '8 pallets in packout.' },
  { id: 3, number: 'PKG-2026-500', pick: 'PK-2026-900', po: 'PO-2026-2141', buyer: 'Atlas Hospitality Group', product: 'Ergonomic Task Chair', sku: 'FURN-ERG8', qty: 500, packages: 9, weight: '1,860 kg', status: 'Ready to Ship', priority: 'High', warehouse: 'WH-CHI-01', note: 'Tendered to DHL Freight (SHP-2026-7712).' },
]

export const seedStockCounts = [
  { id: 1, number: 'SC-2026-009', sku: 'CLEAN-PRO5', product: 'Commercial Surface Cleaner 5L', warehouse: 'WH-NJ-02', bin: 'A5-14', countedAt: '2026-09-10', systemQty: 720, counted: 725, variance: 5, status: 'Variance', adjudicated: false },
  { id: 2, number: 'SC-2026-008', sku: 'PACK-CT32', product: 'Double Wall Shipping Cartons', warehouse: 'WH-CHI-01', bin: 'A3-12', countedAt: '2026-09-10', systemQty: 8900, counted: 8900, variance: 0, status: 'Matched', adjudicated: true },
  { id: 3, number: 'SC-2026-007', sku: 'SAFE-V220', product: 'ANSI Safety Vest - Class 2', warehouse: 'WH-LA-03', bin: 'C3-8', countedAt: '2026-09-09', systemQty: 5300, counted: 5295, variance: -5, status: 'Variance', adjudicated: true, adjustment: 'Pending', adjustmentAt: '2026-09-10' },
  { id: 4, number: 'SC-2026-006', sku: 'FURN-ERG8', product: 'Ergonomic Task Chair', warehouse: 'WH-CHI-01', bin: 'A4-13', countedAt: '2026-09-08', systemQty: 186, counted: 174, variance: -12, status: 'Variance', adjudicated: false },
]

export const seedBackorders = [
  { id: 1, number: 'BO-2026-011', sku: 'TOOL-DR18', product: '18V Cordless Drill Kit', buyer: 'Summit BuildWorks LLC', po: 'PO-2026-2142', qty: 250, available: 0, priority: 'High', expected: '2026-09-20', status: 'Open', note: 'Supplier replenishment committed for the week of 09/15.' },
  { id: 2, number: 'BO-2026-010', sku: 'FURN-ERG8', product: 'Ergonomic Task Chair', buyer: 'Atlas Hospitality Group', po: 'PO-2026-2141', qty: 740, available: 186, priority: 'High', expected: '2026-09-14', status: 'Open', note: 'Covered by inbound RCV-2026-2201 (740 units).' },
]

export const seedPlans = [
  { id: 1, number: 'SHP-2026-7720', po: 'PO-2026-2141', qty: 500, carrier: 'TransCon Logistics', service: 'Express LTL', site: 'Chicago, IL → Chicago, IL', shipDate: '2026-09-12', eta: '2026-09-16', status: 'Planned', priority: 'High', events: [{ label: 'Plan created', detail: 'Partial shipment 500 of 740 remaining', time: '2026-09-11 08:00' }] },
  { id: 2, number: 'SHP-2026-7721', po: 'PO-2026-2140', qty: 1000, carrier: 'FedEx Freight', service: 'Standard LTL', site: 'Newark, NJ → Boston, MA', shipDate: '2026-09-12', eta: '2026-09-18', status: 'Packed', priority: 'Medium', events: [{ label: 'Plan created', detail: 'Full order 1000 containers', time: '2026-09-10 14:20' }, { label: 'Packed', detail: '8 pallets weighbridge complete', time: '2026-09-11 09:40' }] },
]

export const seedExceptions = [
  { id: 1, number: 'EXC-2026-041', shipment: 'SHP-2026-7704', buyer: 'BluePeak Logistics Inc.', type: 'Delay', severity: 'High', reporter: 'Amelia Scott', reported: '2026-09-01', status: 'Open', owner: '', note: 'Weather delay at regional hub; rebooked for 09-08.', timeline: [{ time: '2026-09-01 16:40', by: 'Amelia Scott', text: 'Weather delay logged at hub.' }] },
  { id: 2, number: 'EXC-2026-042', shipment: 'SHP-2026-7712', buyer: 'Atlas Hospitality Group', type: 'Quantity Shortage', severity: 'Medium', reporter: 'Grace Kim', reported: '2026-09-08', status: 'Open', owner: '', note: 'Partial shipment 500 units; remainder 740 to follow.', timeline: [{ time: '2026-09-08 11:20', by: 'Grace Kim', text: 'POD shows 500 units of 1,240.' }] },
  { id: 3, number: 'EXC-2026-043', shipment: 'SHP-2026-7708', buyer: 'Summit BuildWorks LLC', type: 'POD Missing', severity: 'Low', reporter: 'Lucas Meyer', reported: '2026-09-07', status: 'Open', owner: '', note: 'Proof of delivery not uploaded within 48h.', timeline: [{ time: '2026-09-07 13:10', by: 'Lucas Meyer', text: 'Carrier POD backlog.' }] },
  { id: 4, number: 'EXC-2026-044', shipment: 'SHP-2026-7711', buyer: 'Redwood Health Network', type: 'Failed Delivery', severity: 'Medium', reporter: 'Amelia Scott', reported: '2026-09-10', status: 'Assigned', owner: 'Amelia Scott', note: 'Consignee closed on first attempt; reattempt scheduled.', timeline: [{ time: '2026-09-10 15:00', by: 'Amelia Scott', text: 'First attempt failed, reattempt 09-12.' }] },
  { id: 5, number: 'EXC-2026-040', shipment: 'SHP-2026-7702', buyer: 'Atlas Hospitality Group', type: 'Damaged', severity: 'High', reporter: 'Grace Kim', reported: '2026-08-22', status: 'Resolved', owner: 'Grace Kim', note: 'Two cartons damaged; credit issued on freight.', timeline: [{ time: '2026-08-22 09:30', by: 'Grace Kim', text: 'Damaged cartons photographed.' }, { time: '2026-08-24 12:00', by: 'Grace Kim', text: 'Resolved — credit note issued.' }] },
]

export const seedCarriers = [
  { id: 1, name: 'DHL Freight', service: 'Express LTL', onTime: '96.2%', active: 1, status: 'Active', contact: 'dispatch@dhlfreight.demo' },
  { id: 2, name: 'FedEx Freight', service: 'Standard LTL', onTime: '98.1%', active: 1, status: 'Active', contact: 'dispatch@fedexfreight.demo' },
  { id: 3, name: 'XPO Logistics', service: 'Standard LTL', onTime: '93.4%', active: 0, status: 'Active', contact: 'dispatch@xpo.demo' },
  { id: 4, name: 'Old Dominion', service: 'Full Truckload', onTime: '88.9%', active: 1, status: 'Active', contact: 'dispatch@odfl.demo' },
  { id: 5, name: 'TransCon Logistics', service: 'Express LTL', onTime: '99.7%', active: 1, status: 'Active', contact: 'dispatch@transcon.demo' },
]

export const seedDeliveries = [
  { id: 1, number: 'DLV-2026-881', shipment: 'SHP-2026-7708', buyer: 'Summit BuildWorks LLC', truck: 'TRK-117', driver: 'Hector Ruiz', date: '2026-09-07', status: 'Delivered', pod: 'Signed — L. Patel', site: 'Denver, CO' },
  { id: 2, number: 'DLV-2026-880', shipment: 'SHP-2026-7711', buyer: 'Redwood Health Network', truck: 'TRK-204', driver: 'Dana Kim', date: '2026-09-12', status: 'Scheduled', pod: '—', site: 'Boston, MA' },
  { id: 3, number: 'DLV-2026-879', shipment: 'SHP-2026-7712', buyer: 'Atlas Hospitality Group', truck: 'TRK-088', driver: 'Manny Ortiz', date: '2026-09-10', status: 'In Transit', pod: '—', site: 'Chicago, IL' },
  { id: 4, number: 'DLV-2026-878', shipment: 'SHP-2026-7704', buyer: 'BluePeak Logistics Inc.', truck: 'TRK-301', driver: 'Jonas Weber', date: '2026-09-08', status: 'Reattempt', pod: '—', site: 'Brooklyn, NY' },
]

export const seedStockMovements = [
  { id: 101, date: '2026-09-08 09:12', sku: 'FURN-ERG8', product: 'Ergonomic Task Chair', quantity: -50, type: 'Reservation', reference: 'RSV-2026-814', user: 'Robert King', warehouse: 'WH-CHI-01' },
  { id: 102, date: '2026-09-08 08:40', sku: 'PACK-CT32', product: 'Double Wall Shipping Cartons', quantity: -800, type: 'Shipment', reference: 'SHP-2026-7712', user: 'Amelia Scott', warehouse: 'WH-NJ-02' },
  { id: 103, date: '2026-09-10 09:00', sku: 'CLEAN-PRO5', product: 'Commercial Surface Cleaner 5L', quantity: -1000, type: 'Pick', reference: 'PK-2026-902', user: 'Sofia Reyes', warehouse: 'WH-NJ-02' },
  { id: 104, date: '2026-09-10 14:40', sku: 'PACK-CT32', product: 'Double Wall Shipping Cartons', quantity: -30000, type: 'Allocation', reference: 'RSV-2026-811', user: 'Robert King', warehouse: 'WH-CHI-01' },
]
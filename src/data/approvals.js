export const approvalTypes = [
  { key: 'buyer', label: 'Buyer Approval', module: 'buyers', tone: 'blue' },
  { key: 'quote', label: 'Quote Discount Approval', module: 'quotations', tone: 'violet' },
  { key: 'credit', label: 'Credit Limit Approval', module: 'credit', tone: 'amber' },
  { key: 'contract', label: 'Contract Approval', module: 'contracts', tone: 'emerald' },
  { key: 'po', label: 'Purchase Order Approval', module: 'purchaseOrders', tone: 'green' },
  { key: 'stock', label: 'Stock Adjustment Approval', module: 'inventory', tone: 'orange' },
  { key: 'creditnote', label: 'Credit Note Approval', module: 'invoices', tone: 'red' },
  { key: 'reservation', label: 'Stock Reservation Approval', module: 'inventory', tone: 'violet' },
]

export const approvalTypeByKey = Object.fromEntries(approvalTypes.map((t) => [t.key, t]))

function h(user, action, comment, day) {
  return { user, action, comment, time: `${day} · ${['09:10', '11:24', '14:05', '16:47', '08:30'][Math.floor(Math.random() * 5)]}` }
}

export const approvalRequests = [
  {
    id: 1, requestId: 'APR-2026-501', typeKey: 'buyer', related: 'Greenline Retail Partners', relatedId: 'B-1003',
    requestedBy: 'System (Application)', department: 'Sales', date: '2026-08-29', priority: 'High', status: 'Pending',
    reason: 'New buyer application awaiting business-license verification. License document currently under review.',
    impact: 'Unlocks $100,000 wholesale credit limit and access to contract pricing.',
    history: [
      h('System', 'Submitted', 'Buyer application created from registration form.', '2026-08-29 09:00'),
      h('System', 'Intake Review', 'Document checklist compiled; business license flagged for manual verification.', '2026-08-29 12:15'),
      h('Grace Kim', 'Queued', 'Application assigned to buyer-approval queue after intake triage.', '2026-09-02 08:40'),
    ],
  },
  {
    id: 2, requestId: 'APR-2026-502', typeKey: 'quote', related: 'QT-2026-0832', relatedId: 'QT-2026-0832',
    requestedBy: 'Daniel Brooks', department: 'Sales', date: '2026-09-07', priority: 'High', status: 'Pending',
    reason: '11% pricing exception requested on Ergonomic Task Chair (list $184 → proposed $163) to secure a 240-unit Q4 order.',
    impact: 'Expected order value $39,120; discount within the 10–15% pricing-exception band.',
    history: [
      h('Daniel Brooks', 'Submitted', 'Pricing exception referenced standard list price $184, proposed $163.', '2026-09-07 11:45'),
      h('Daniel Brooks', 'Supporting note', 'Buyer committed to Net-60 terms and fall-conference delivery.', '2026-09-07 12:02'),
      h('Rachel Evans', 'Awaiting decision', 'Exception is above the $160 counter threshold in negotiation thread.', '2026-09-08 09:15'),
    ],
  },
  {
    id: 4, requestId: 'APR-2026-504', typeKey: 'contract', related: 'CTR-2026-126', relatedId: 'CTR-2026-126',
    requestedBy: 'Daniel Brooks', department: 'Sales', date: '2026-09-05', priority: 'Medium', status: 'Pending',
    reason: 'New annual contract with Summit BuildWorks LLC — $525,000 (MOQ 2,500 units). Legal review drafted.',
    impact: 'Locks FY27 revenue; standard contract terms (Net-30, annual commitment).',
    history: [
      h('Daniel Brooks', 'Submitted', 'Contract terms drafted after Q4 safety-equipment rollout.', '2026-09-05 09:30'),
      h('Legal (Draft)', 'Legal review', 'Standard template; no redlined clauses flagged.', '2026-09-06 13:45'),
    ],
  },
  {
    id: 5, requestId: 'APR-2026-505', typeKey: 'po', related: 'PO-2026-2142', relatedId: 'PO-2026-2142',
    requestedBy: 'Sophia Turner', department: 'Sales', date: '2026-09-05', priority: 'Low', status: 'Pending',
    reason: 'Follow-on purchase order for drill-kit shipment under existing matrix pricing. No exception requested.',
    impact: 'Off-contract PO; requires manager sign-off before supplier release.',
    history: [
      h('Sophia Turner', 'Submitted', 'PO generated from accepted quote QT-2026-0830.', '2026-09-05 11:00'),
      h('System', 'Compliance check', 'Payment terms Net-30; deposit schedule attached.', '2026-09-05 11:05'),
    ],
  },
  {
    id: 7, requestId: 'APR-2026-498', typeKey: 'buyer', related: 'Summit BuildWorks LLC', relatedId: 'B-1002',
    requestedBy: 'Marcus Reed', department: 'Sales', date: '2026-08-20', priority: 'Low', status: 'Rejected',
    reason: 'Initial application lacked valid tax certificate documentation.',
    impact: 'Re-submission invited after documentation is corrected.',
    history: [
      h('Marcus Reed', 'Submitted', 'Application forwarded for verification.', '2026-08-20 09:00'),
      h('Grace Kim', 'Rejected', 'Tax certificate out of date; buyer notified to resubmit.', '2026-08-21 14:30'),
    ],
  },
  {
    id: 9, requestId: 'APR-2026-497', typeKey: 'creditnote', related: 'CN-2026-0312', relatedId: 'CN-2026-0312',
    requestedBy: 'Daniel Brooks', department: 'Sales', date: '2026-09-02', priority: 'Medium', status: 'Approved',
    reason: 'Freight adjustment on Atlas Hospitality shipment — $1,200 credit against INV-2026-3901.',
    impact: 'Reduces receivable; matches contract freight terms.',
    history: [
      h('Daniel Brooks', 'Submitted', 'Credit note drafted.', '2026-09-02 16:00'),
      h('Elena Petrova', 'Approved', 'Terms match contract; applied to INV-2026-3901.', '2026-09-03 09:12'),
    ],
  },
  {
    id: 10, requestId: 'APR-2026-496', typeKey: 'quote', related: 'QT-2026-0831', relatedId: 'QT-2026-0831',
    requestedBy: 'Daniel Brooks', department: 'Sales', date: '2026-09-03', priority: 'Medium', status: 'Approved',
    reason: 'Volume-tier pricing (16%) for Redwood Health annual order. Within approved band.',
    impact: 'Locks $12,875 order; no exception to matrix.',
    history: [
      h('Daniel Brooks', 'Submitted', 'Quote auto-routed for approval.', '2026-09-03 10:00'),
      h('Rachel Evans', 'Approved', 'Within approved volume tier; approved with no changes.', '2026-09-03 11:30'),
    ],
  },
  {
    id: 11, requestId: 'APR-2026-495', typeKey: 'stock', related: 'CLEAN-PRO5', relatedId: 'CLEAN-PRO5',
    requestedBy: 'James Liu', department: 'Warehouse', date: '2026-08-28', priority: 'Low', status: 'Revision Requested',
    reason: 'Suggested +120 adjustment for receipt variance; documentation insufficient.',
    impact: 'Adjustment on hold pending rework of receipt reference.',
    history: [
      h('James Liu', 'Submitted', 'Receiving variance +120 units.', '2026-08-28 13:00'),
      h('Robert King', 'Requested Revision', 'Missing reference document; request updated and resubmitted.', '2026-08-29 10:20'),
    ],
  },
]

export const delegates = [
  { key: 'manager', label: 'Rachel Evans · Sales Manager' },
  { key: 'sales', label: 'Daniel Brooks · Account Executive' },
  { key: 'sales2', label: 'Sophia Turner · Account Executive' },
  { key: 'finance', label: 'Elena Petrova · Finance / Credit Officer' },
  { key: 'warehouse', label: 'Robert King · Warehouse Supervisor' },
  { key: 'admin', label: 'Alex Morgan · Super Admin' },
]

export function approvalByTypeLabel(typeKey) {
  return approvalTypeByKey[typeKey]?.label || typeKey
}
import { ROLES } from './session'

export const ERP_MODULES = [
  'buyers', 'products', 'pricing', 'rfqs', 'quotations', 'purchaseOrders',
  'contracts', 'credit', 'inventory', 'warehouses', 'invoices', 'shipments',
  'carriers', 'reports', 'activity', 'tasks',
]

export const ACTIONS = ['view', 'create', 'edit', 'delete', 'approve', 'export']

const FULL = ['view', 'create', 'edit', 'delete', 'approve', 'export']

export const permissionMatrix = {
  admin: { '*': FULL },
  manager: {
    buyerApproval: FULL, buyers: ['view'], quotations: ['view', 'edit', 'approve'],
    contracts: ['view', 'edit', 'approve'], purchaseOrders: ['view', 'approve'],
    rfqs: ['view'], credit: ['view'], invoices: ['view'], inventory: ['view'], reports: ['view'],
    activity: ['view'], pricing: ['view', 'edit'],
  },
  sales: {
    buyers: ['view', 'create', 'edit'], quotations: ['view', 'create', 'edit'],
    contracts: ['view', 'create'], rfqs: ['view', 'create'], pricing: ['view'],
    purchaseOrders: ['view'], invoices: ['view'], shipments: ['view'], activity: ['view'],
  },
  buyer: {
    products: ['view'], pricing: ['view'], rfqs: ['view', 'create'], quotations: ['view'],
    purchaseOrders: ['view'], invoices: ['view'], contracts: ['view'], credit: ['view'], shipments: ['view'],
  },
  finance: {
    credit: ['view', 'edit', 'approve'], invoices: ['view', 'edit', 'approve'],
    quotations: ['view'], purchaseOrders: ['view'], buyers: ['view'], reports: ['view'],
    activity: ['view'], contracts: ['view'],
  },
  warehouse: {
    warehouses: ['view', 'create', 'edit'], inventory: ['view', 'edit', 'approve'],
    purchaseOrders: ['view'], shipments: ['view'], reports: ['view'], activity: ['view'],
  },
  inventory: {
    inventory: ['view', 'create', 'edit'], warehouses: ['view'], purchaseOrders: ['view'], activity: ['view'],
  },
  logistics: {
    shipments: ['view', 'create', 'edit', 'approve'], carriers: ['view', 'edit'],
    purchaseOrders: ['view'], inventory: ['view'], reports: ['view'], activity: ['view'],
  },
  support: {
    '*': ['view', 'export'], activity: ['view', 'export'],
    buyrfqs: ['view'], buyers: ['view'], orders: ['view'], shipments: ['view'], invoices: ['view'],
  },
}

export function can(roleKey, module, action) {
  if (!roleKey || !module || !action) return false
  const perms = permissionMatrix[roleKey]
  if (!perms) return false
  const wildcard = perms['*']
  if (wildcard && (wildcard.includes(action) || wildcard.includes('all'))) return true
  const mod = perms[module]
  if (!mod) return false
  return mod.includes(action)
}

export const FIELD_ACCESS = [
  { field: 'Internal Cost Price', levels: { admin: 'View', manager: 'View', sales: 'Restricted', finance: 'Hidden', buyer: 'Hidden', warehouse: 'Hidden', inventory: 'Hidden', logistics: 'Hidden', support: 'Hidden' } },
  { field: 'Credit Limit', levels: { admin: 'Edit', manager: 'View', sales: 'View', finance: 'Edit', buyer: 'View own', warehouse: 'Hidden', inventory: 'Hidden', logistics: 'Hidden', support: 'Hidden' } },
  { field: 'Unit Cost (MOQ pricing)', levels: { admin: 'View', manager: 'View', sales: 'View', finance: 'Restricted', buyer: 'View own', warehouse: 'Hidden', inventory: 'Hidden', logistics: 'Hidden', support: 'Hidden' } },
  { field: 'Stock Adjustment', levels: { admin: 'Approve', manager: 'Hidden', sales: 'Hidden', finance: 'Restricted', buyer: 'Hidden', warehouse: 'Approve', inventory: 'Request', logistics: 'Hidden', support: 'Hidden' } },
  { field: 'Customer Risk Score', levels: { admin: 'View', manager: 'View', sales: 'View', finance: 'View', buyer: 'Hidden', warehouse: 'Hidden', inventory: 'Hidden', logistics: 'Hidden', support: 'Restricted' } },
  { field: 'Negotiation / Internal Notes', levels: { admin: 'View', manager: 'View', sales: 'Edit', finance: 'Hidden', buyer: 'Hidden', warehouse: 'Hidden', inventory: 'Hidden', logistics: 'Hidden', support: 'Restricted' } },
]

export function fieldAccess(roleKey, fieldName) {
  const f = FIELD_ACCESS.find((x) => x.field === fieldName)
  if (!f || !roleKey) return 'Hidden'
  return f.levels[roleKey] || 'Hidden'
}
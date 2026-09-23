import { Activity, Banknote, BarChart3, Bell, Boxes, BriefcaseBusiness, Building2, ClipboardCheck, ClipboardList, Contact, CreditCard, FileCheck2, FileText, Gauge, Headphones, Landmark, LifeBuoy, Package, PackageSearch, Receipt, Route, ScanLine, Settings, ShieldCheck, ShoppingCart, Tags, Truck, UserCog, Users, Warehouse } from 'lucide-react'

export const buyerNav = [
  { label: 'MAIN', items: [{ label: 'Dashboard', path: '/buyer/dashboard', icon: Gauge }] },
  { label: 'CATALOG', items: [{ label: 'Catalog', icon: Package, children: [{ label: 'Products', path: '/buyer/products' }, { label: 'Categories', path: '/buyer/categories' }] }] },
  { label: 'PURCHASING', items: [{ label: 'RFQs', path: '/buyer/rfqs', icon: ClipboardList }, { label: 'Quotations', path: '/buyer/quotations', icon: FileText }, { label: 'Purchase Orders', path: '/buyer/purchase-orders', icon: ShoppingCart }, { label: 'Contracts', path: '/buyer/contracts', icon: FileCheck2 }] },
  { label: 'FINANCE & LOGISTICS', items: [{ label: 'Invoices', path: '/buyer/invoices', icon: Receipt }, { label: 'Credit Status', path: '/buyer/credit', icon: CreditCard }, { label: 'Shipments', path: '/buyer/shipments', icon: Truck }] },
  { label: 'ACCOUNT', items: [{ label: 'Business Profile', path: '/buyer/profile', icon: Building2 }, { label: 'Documents', path: '/buyer/documents', icon: FileText }, { label: 'Notifications', path: '/buyer/notifications', icon: Bell }] }
]

export const salesNav = [
  { label: 'MAIN', items: [{ label: 'Dashboard', path: '/sales/dashboard', icon: Gauge }] },
  { label: 'BUYER MANAGEMENT', items: [{ label: 'Buyers', icon: Users, children: [{ label: 'My Buyers', path: '/sales/buyers' }, { label: 'Buyer Profiles', path: '/sales/buyers/profiles' }] }] },
  { label: 'SALES', items: [{ label: 'RFQs', icon: ClipboardList, children: [{ label: 'All RFQs', path: '/sales/rfqs' }, { label: 'New RFQs', path: '/sales/rfqs?status=New' }, { label: 'Assigned RFQs', path: '/sales/rfqs?assigned=me' }] }, { label: 'Quotations', icon: FileText, children: [{ label: 'All Quotations', path: '/sales/quotations' }, { label: 'Draft Quotes', path: '/sales/quotations?status=Draft' }, { label: 'Negotiations', path: '/sales/quotations?status=Negotiating' }] }, { label: 'Purchase Orders', path: '/sales/purchase-orders', icon: ShoppingCart }, { label: 'Contracts', path: '/sales/contracts', icon: FileCheck2 }] },
  { label: 'WORKSPACE', items: [{ label: 'Tasks', path: '/sales/tasks', icon: ClipboardCheck }, { label: 'Notifications', path: '/sales/notifications', icon: Bell }, { label: 'Profile', path: '/sales/profile', icon: Contact }] }
]

export const managerNav = [
  { label: 'MAIN', items: [{ label: 'Dashboard', path: '/manager/dashboard', icon: Gauge }] },
  { label: 'APPROVAL CENTER', items: [{ label: 'Approvals', icon: ClipboardCheck, children: [{ label: 'All Approvals', path: '/manager/approvals' }, { label: 'Pricing Approvals', path: '/manager/approvals/pricing' }, { label: 'Quote Approvals', path: '/manager/approvals/quotations' }, { label: 'Credit Reviews', path: '/manager/approvals/credit' }] }] },
  { label: 'SALES', items: [{ label: 'RFQs', path: '/manager/rfqs', icon: ClipboardList }, { label: 'Quotations', path: '/manager/quotations', icon: FileText }, { label: 'Purchase Orders', path: '/manager/purchase-orders', icon: ShoppingCart }, { label: 'Contracts', path: '/manager/contracts', icon: FileCheck2 }] },
  { label: 'SALES TEAM', items: [{ label: 'Account Executives', path: '/manager/team', icon: Users }, { label: 'Performance', path: '/manager/performance', icon: BarChart3 }] },
  { label: 'REPORTS', items: [{ label: 'Reports', path: '/manager/reports', icon: BarChart3 }, { label: 'Notifications', path: '/manager/notifications', icon: Bell }] }
]

export const adminNav = [
  { label: 'MAIN', items: [{ label: 'Dashboard', path: '/admin/dashboard', icon: Gauge }] },
  { label: 'BUYER MANAGEMENT', items: [{ label: 'Buyers', icon: Users, children: [{ label: 'All Buyers', path: '/admin/buyers' }, { label: 'Pending Verification', path: '/admin/buyers/pending' }, { label: 'Approved Buyers', path: '/admin/buyers/approved' }, { label: 'Rejected Buyers', path: '/admin/buyers/rejected' }, { label: 'Suspended Buyers', path: '/admin/buyers/suspended' }] }] },
  { label: 'CATALOG', items: [{ label: 'Products', path: '/admin/products', icon: Package }, { label: 'Categories', path: '/admin/categories', icon: Tags }, { label: 'Pricing Tiers', path: '/admin/pricing-tiers', icon: CreditCard }] },
  { label: 'SALES', items: [{ label: 'RFQs', path: '/admin/rfqs', icon: ClipboardList }, { label: 'Quotations', path: '/admin/quotations', icon: FileText }, { label: 'Purchase Orders', path: '/admin/purchase-orders', icon: ShoppingCart }, { label: 'Contracts', path: '/admin/contracts', icon: FileCheck2 }] },
  { label: 'INVENTORY', items: [{ label: 'Warehouses', path: '/admin/warehouses', icon: Warehouse }, { label: 'Locations / Bins', path: '/admin/locations', icon: Building2 }, { label: 'Stock', path: '/admin/inventory', icon: Boxes }, { label: 'Reservations', path: '/admin/reservations', icon: ClipboardCheck }, { label: 'Backorders', path: '/admin/backorders', icon: Package }] },
  { label: 'FINANCE', items: [{ label: 'Invoices', path: '/admin/invoices', icon: Receipt }, { label: 'Credit Limits', path: '/admin/credit', icon: CreditCard }, { label: 'Credit Notes', path: '/admin/credit-notes', icon: FileText }, { label: 'Payment Terms', path: '/admin/payment-terms', icon: BriefcaseBusiness }] },
  { label: 'LOGISTICS', items: [{ label: 'Shipments', path: '/admin/shipments', icon: Truck }, { label: 'Carriers', path: '/admin/carriers', icon: Truck }, { label: 'Deliveries', path: '/admin/deliveries', icon: Package }] },
  { label: 'REPORTS', items: [{ label: 'Analytics', icon: BarChart3, children: [{ label: 'Sales Reports', path: '/admin/reports/sales' }, { label: 'Buyer Reports', path: '/admin/reports/buyers' }, { label: 'Inventory Reports', path: '/admin/reports/inventory' }, { label: 'Finance Reports', path: '/admin/reports/finance' }, { label: 'Executive Reports', path: '/admin/reports/executive' }] }] },
  { label: 'SYSTEM', items: [{ label: 'Users', path: '/admin/users', icon: UserCog }, { label: 'Roles', path: '/admin/roles', icon: ShieldCheck }, { label: 'Permissions', path: '/admin/permissions', icon: ShieldCheck }, { label: 'Activity Logs', path: '/admin/activity-logs', icon: Activity }, { label: 'Settings', path: '/admin/settings', icon: Settings }] }
]

export const financeNav = [
  { label: 'MAIN', items: [{ label: 'Dashboard', path: '/finance/dashboard', icon: Gauge }] },
  { label: 'CREDIT & RISK', items: [{ label: 'Credit Requests', path: '/finance/credit-requests', icon: Landmark }, { label: 'Buyer Credit', path: '/finance/buyers', icon: Users }, { label: 'Aging / Exposure', path: '/finance/aging', icon: BarChart3 }] },
  { label: 'FINANCE', items: [{ label: 'Invoices', path: '/finance/invoices', icon: Receipt }, { label: 'Credit Notes', path: '/finance/credit-notes', icon: FileText }, { label: 'Payment Terms', path: '/finance/payment-terms', icon: BriefcaseBusiness }] },
  { label: 'WORKSPACE', items: [{ label: 'Approvals', path: '/approvals', icon: ShieldCheck }, { label: 'Tasks', path: '/finance/tasks', icon: ClipboardCheck }, { label: 'Reports', path: '/finance/reports', icon: BarChart3 }, { label: 'Notifications', path: '/finance/notifications', icon: Bell }] }
]

export const warehouseNav = [
  { label: 'MAIN', items: [{ label: 'Dashboard', path: '/warehouse/dashboard', icon: Gauge }] },
  { label: 'WAREHOUSE OPS', items: [{ label: 'Locations & Bins', path: '/warehouse/locations', icon: Building2 }, { label: 'Receiving', path: '/warehouse/receiving', icon: PackageSearch }, { label: 'Reservations', path: '/warehouse/reservations', icon: ClipboardCheck }, { label: 'Picking', path: '/warehouse/picking', icon: ScanLine }, { label: 'Packing', path: '/warehouse/packing', icon: Package }] },
  { label: 'STOCK', items: [{ label: 'Stock Levels', path: '/warehouse/stock', icon: Boxes }, { label: 'Backorders', path: '/warehouse/backorders', icon: Package }, { label: 'Stock Movements', path: '/warehouse/stock-movements', icon: ClipboardList }, { label: 'Adjustments', path: '/warehouse/adjustments', icon: ShieldCheck }] },
  { label: 'WORKSPACE', items: [{ label: 'Tasks', path: '/warehouse/tasks', icon: ClipboardCheck }, { label: 'Notifications', path: '/warehouse/notifications', icon: Bell }] }
]

export const inventoryNav = [
  { label: 'MAIN', items: [{ label: 'Dashboard', path: '/inventory-staff/dashboard', icon: Gauge }] },
  { label: 'OPERATIONS', items: [{ label: 'Receiving', path: '/inventory-staff/receiving', icon: PackageSearch }, { label: 'Picking', path: '/inventory-staff/picking', icon: ScanLine }, { label: 'Packing', path: '/inventory-staff/packing', icon: Package }] },
  { label: 'STOCK', items: [{ label: 'Stock Count', path: '/inventory-staff/stock-count', icon: ClipboardList }, { label: 'Movements', path: '/inventory-staff/movements', icon: Boxes }, { label: 'Stock Levels', path: '/inventory-staff/stock', icon: BarChart3 }] },
  { label: 'WORKSPACE', items: [{ label: 'Tasks', path: '/inventory-staff/tasks', icon: ClipboardCheck }, { label: 'Notifications', path: '/inventory-staff/notifications', icon: Bell }] }
]

export const logisticsNav = [
  { label: 'MAIN', items: [{ label: 'Dashboard', path: '/logistics/dashboard', icon: Gauge }] },
  { label: 'OPERATIONS', items: [{ label: 'Shipment Planning', path: '/logistics/shipment-planning', icon: Route }, { label: 'Shipments', path: '/logistics/shipments', icon: Truck }, { label: 'Carriers', path: '/logistics/carriers', icon: Truck }] },
  { label: 'DELIVERY', items: [{ label: 'Deliveries', path: '/logistics/deliveries', icon: Package }, { label: 'Delivery Exceptions', path: '/logistics/discrepancies', icon: LifeBuoy }] },
  { label: 'WORKSPACE', items: [{ label: 'Tasks', path: '/logistics/tasks', icon: ClipboardCheck }, { label: 'Reports', path: '/logistics/reports', icon: BarChart3 }, { label: 'Notifications', path: '/logistics/notifications', icon: Bell }] }
]

export const supportNav = [
  { label: 'MAIN', items: [{ label: 'Dashboard', path: '/support/dashboard', icon: Gauge }] },
  { label: 'CUSTOMER SERVICE', items: [{ label: 'Buyers', path: '/support/buyers', icon: Users }, { label: 'Orders', path: '/support/orders', icon: ShoppingCart }, { label: 'Shipments', path: '/support/shipments', icon: Truck }, { label: 'Invoices', path: '/support/invoices', icon: Receipt }, { label: 'Credit Notes', path: '/support/credit-notes', icon: FileText }] },
  { label: 'AUDIT & SUPPORT', items: [{ label: 'Activity', path: '/support/activity', icon: Activity }, { label: 'Help Center', path: '/support/help', icon: Headphones }] },
  { label: 'WORKSPACE', items: [{ label: 'Tasks', path: '/support/tasks', icon: ClipboardCheck }, { label: 'Notifications', path: '/support/notifications', icon: Bell }] }
]

export const departmentNav = {
  finance: financeNav,
  warehouse: warehouseNav,
  inventory: inventoryNav,
  logistics: logisticsNav,
  support: supportNav,
}

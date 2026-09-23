import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import BuyerLayout from './layouts/BuyerLayout'
import { ManagerLayout, SalesLayout } from './layouts/StaffLayout'
import AdminLayout from './layouts/AdminLayout'
import { FinanceLayout, InventoryLayout, LogisticsLayout, SupportLayout, WarehouseLayout, DepartmentLayoutFor } from './layouts/DepartmentLayout'
import RoleGuard from './components/common/RoleGuard'
import { SessionProvider, useSession } from './services/session'
import { ErpProvider } from './services/erpStore'
import { AboutPage, CategoriesPage, CategoryPage, HomePage, LegalPage, ProductDetailPage, ProductsPage } from './pages/public/PublicPages'
import { ForgotPasswordPage, LoginPage, PendingApprovalPage, RegisterPage } from './pages/auth/AuthPages'
import ResourcePage from './pages/shared/ResourcePage'
import DetailPage from './pages/shared/DetailPage'
import CreditNoteDetailPage from './pages/shared/CreditNoteDetailPage'
import { ProductFormPage, QuotationFormPage, RfqFormPage } from './pages/shared/FormPages'
import { PermissionsPage, ProfilePage, SettingsPage } from './pages/shared/AccountPages'
import ApprovalsPage from './pages/manager/ApprovalsPage'
import ApprovalCenterPage from './pages/approvals/ApprovalCenterPage'
import DepartmentHome from './pages/shared/DepartmentHome'
import NotFoundPage from './pages/NotFoundPage'
import LoadingState from './components/ui/LoadingState'
import FinanceInvoicesPage from './pages/finance/FinanceInvoicesPage'
import CreditRequestsPage from './pages/finance/CreditRequestsPage'
import CreditRequestDetailPage from './pages/finance/CreditRequestDetailPage'
import FinanceBuyerDetailPage from './pages/finance/FinanceBuyerDetailPage'
import CreditNotesPage from './pages/finance/CreditNotesPage'
import AgingPage from './pages/finance/AgingPage'
import LocationsPage from './pages/warehouse/LocationsPage'
import ReceivingPage from './pages/warehouse/ReceivingPage'
import ReservationsPage from './pages/warehouse/ReservationsPage'
import BackordersPage from './pages/warehouse/BackordersPage'
import StockMovementsPage from './pages/warehouse/StockMovementsPage'
import PickingPage from './pages/inventory/PickingPage'
import PackingPage from './pages/inventory/PackingPage'
import StockCountPage from './pages/inventory/StockCountPage'
import ShipmentPlanningPage from './pages/logistics/ShipmentPlanningPage'
import ShipmentsPage from './pages/logistics/ShipmentsPage'
import ShipmentDetailPage from './pages/logistics/ShipmentDetailPage'
import CarriersPage from './pages/logistics/CarriersPage'
import DeliveriesPage from './pages/logistics/DeliveriesPage'
import ExceptionsPage from './pages/logistics/ExceptionsPage'
import HelpCenterPage from './pages/support/HelpCenterPage'
import DashboardLayout from './layouts/DashboardLayout'
import { adminNav, financeNav, managerNav, warehouseNav } from './routes/navigation'
import { ROLE_MAP } from './services/session'

const DashboardPage = lazy(() => import('./pages/shared/DashboardPage'))
const ReportPage = lazy(() => import('./pages/shared/ReportPage'))

const resource = (type, title, basePath, props={}) => <ResourcePage type={type} title={title} basePath={basePath} {...props}/>

function ApprovalLayout({ children }) {
  const { user } = useSession()
  const roleKey = user?.key || 'manager'
  const role = ROLE_MAP[roleKey] || ROLE_MAP.manager
  const navigation = roleKey === 'admin' ? adminNav : roleKey === 'finance' ? financeNav : roleKey === 'warehouse' ? warehouseNav : managerNav
  return <DashboardLayout navigation={navigation} role={role.label} name={role.name} roleKey={roleKey}><Outlet /></DashboardLayout>
}

const dept = (root, roleKey, children) => (
  <Route path={root} element={<RoleGuard roles={[roleKey]}><DepartmentLayoutFor roleKey={roleKey} /></RoleGuard>}>
    <Route index element={<Navigate to="dashboard" replace/>}/>
    <Route path="dashboard" element={<DepartmentHome roleKey={roleKey}/>}/>
    {children}
    <Route path="tasks" element={<ResourcePage type="tasks" title="Tasks"/>}/>
    <Route path="notifications" element={<ResourcePage type="notifications" title="Notifications"/>}/>
    <Route path="*" element={<NotFoundPage/>}/>
  </Route>
)

export default function App() {
  return <SessionProvider><ErpProvider><Suspense fallback={<div className="p-6"><LoadingState /></div>}><Routes>
    <Route element={<PublicLayout/>}>
      <Route index element={<HomePage/>}/><Route path="products" element={<ProductsPage/>}/><Route path="products/:id" element={<ProductDetailPage/>}/><Route path="categories" element={<CategoriesPage/>}/><Route path="categories/:slug" element={<CategoryPage/>}/><Route path="about" element={<AboutPage/>}/><Route path="privacy" element={<LegalPage type="Privacy Policy"/>}/><Route path="terms" element={<LegalPage type="Terms of Service"/>}/>
    </Route>
    <Route path="login" element={<LoginPage/>}/><Route path="register" element={<RegisterPage/>}/><Route path="pending-approval" element={<PendingApprovalPage/>}/><Route path="forgot-password" element={<ForgotPasswordPage/>}/>

    <Route path="approvals" element={<RoleGuard roles={['manager','admin','finance','warehouse']}><ApprovalLayout/></RoleGuard>}>
      <Route index element={<ApprovalCenterPage/>}/><Route path=":kind" element={<ApprovalCenterPage/>}/>
    </Route>

    <Route path="buyer" element={<RoleGuard roles={['buyer']}><BuyerLayout/></RoleGuard>}>
      <Route index element={<Navigate to="dashboard" replace/>}/><Route path="dashboard" element={<DashboardPage role="buyer"/>}/>
      <Route path="products" element={resource('products','Product Catalog','/buyer/products')}/><Route path="products/:id" element={<DetailPage type="products" title="Product"/>}/><Route path="categories" element={resource('categories','Product Categories')}/>
      <Route path="rfqs" element={resource('rfqs','Requests for Quote','/buyer/rfqs',{addLabel:'Create RFQ'})}/><Route path="rfqs/new" element={<RfqFormPage/>}/><Route path="rfqs/:id" element={<DetailPage type="rfqs" title="RFQ"/>}/>
      <Route path="quotations" element={resource('quotations','Quotations','/buyer/quotations')}/><Route path="quotations/:id" element={<DetailPage type="quotations" title="Quotation"/>}/>
      <Route path="purchase-orders" element={resource('purchaseOrders','Purchase Orders','/buyer/purchase-orders')}/><Route path="purchase-orders/:id" element={<DetailPage type="purchaseOrders" title="Purchase Order"/>}/>
      <Route path="contracts" element={resource('contracts','Contracts','/buyer/contracts')}/><Route path="contracts/:id" element={<DetailPage type="contracts" title="Contract"/>}/>
      <Route path="invoices" element={resource('invoices','Invoices','/buyer/invoices')}/><Route path="invoices/:id" element={<DetailPage type="invoices" title="Invoice"/>}/><Route path="credit" element={resource('credit','Credit Status')}/>
      <Route path="shipments" element={resource('shipments','Shipments','/buyer/shipments')}/><Route path="shipments/:id" element={<DetailPage type="shipments" title="Shipment"/>}/>
      <Route path="profile" element={<ProfilePage/>}/><Route path="documents" element={resource('documents','Business Documents')}/><Route path="notifications" element={resource('notifications','Notifications')}/>
    </Route>

    <Route path="sales" element={<RoleGuard roles={['sales']}><SalesLayout/></RoleGuard>}>
      <Route index element={<Navigate to="dashboard" replace/>}/><Route path="dashboard" element={<DashboardPage role="sales"/>}/>
      <Route path="buyers" element={resource('buyers','My Buyers','/sales/buyers')}/><Route path="buyers/profiles" element={resource('buyers','Buyer Profiles','/sales/buyers')}/><Route path="buyers/:id" element={<DetailPage type="buyers" title="Buyer"/>}/>
      <Route path="rfqs" element={resource('rfqs','RFQs','/sales/rfqs')}/><Route path="rfqs/:id" element={<DetailPage type="rfqs" title="RFQ"/>}/>
      <Route path="quotations" element={resource('quotations','Quotations','/sales/quotations',{addLabel:'Create Quotation'})}/><Route path="quotations/new" element={<QuotationFormPage/>}/><Route path="quotations/:id" element={<DetailPage type="quotations" title="Quotation"/>}/>
      <Route path="purchase-orders" element={resource('purchaseOrders','Purchase Orders','/sales/purchase-orders')}/><Route path="purchase-orders/:id" element={<DetailPage type="purchaseOrders" title="Purchase Order"/>}/><Route path="contracts" element={resource('contracts','Contracts','/sales/contracts')}/><Route path="contracts/:id" element={<DetailPage type="contracts" title="Contract"/>}/>
      <Route path="tasks" element={resource('tasks','Tasks')}/><Route path="notifications" element={resource('notifications','Notifications')}/><Route path="profile" element={<ProfilePage staff/>}/>
    </Route>

    <Route path="manager" element={<RoleGuard roles={['manager']}><ManagerLayout/></RoleGuard>}>
      <Route index element={<Navigate to="dashboard" replace/>}/><Route path="dashboard" element={<DashboardPage role="manager"/>}/>
      <Route path="approvals" element={<ApprovalsPage/>}/><Route path="approvals/pricing" element={<ApprovalsPage kind="Pricing"/>}/><Route path="approvals/quotations" element={<ApprovalsPage kind="Quotation"/>}/><Route path="approvals/credit" element={<ApprovalsPage kind="Credit"/>}/>
      <Route path="rfqs" element={resource('rfqs','RFQs','/manager/rfqs')}/><Route path="rfqs/:id" element={<DetailPage type="rfqs" title="RFQ"/>}/><Route path="quotations" element={resource('quotations','Quotations','/manager/quotations')}/><Route path="quotations/:id" element={<DetailPage type="quotations" title="Quotation"/>}/><Route path="purchase-orders" element={resource('purchaseOrders','Purchase Orders','/manager/purchase-orders')}/><Route path="purchase-orders/:id" element={<DetailPage type="purchaseOrders" title="Purchase Order"/>}/><Route path="contracts" element={resource('contracts','Contracts','/manager/contracts')}/><Route path="contracts/:id" element={<DetailPage type="contracts" title="Contract"/>}/>
      <Route path="team" element={resource('users','Account Executives')}/><Route path="performance" element={<ReportPage type="sales"/>}/><Route path="reports" element={<ReportPage type="executive"/>}/><Route path="notifications" element={resource('notifications','Notifications')}/>
      <Route path="profile" element={<ProfilePage staff/>}/>
    </Route>

    <Route path="admin" element={<RoleGuard roles={['admin']}><AdminLayout/></RoleGuard>}>
      <Route index element={<Navigate to="dashboard" replace/>}/><Route path="dashboard" element={<DashboardPage role="admin"/>}/>
      <Route path="buyers" element={resource('buyers','All Buyers','/admin/buyers')}/><Route path="buyers/pending" element={resource('buyers','Pending Buyer Verification','/admin/buyers',{filterStatus:'Pending'})}/><Route path="buyers/approved" element={resource('buyers','Approved Buyers','/admin/buyers',{filterStatus:'Approved'})}/><Route path="buyers/rejected" element={resource('buyers','Rejected Buyers','/admin/buyers',{filterStatus:'Rejected'})}/><Route path="buyers/suspended" element={resource('buyers','Suspended Buyers','/admin/buyers',{filterStatus:'Suspended'})}/><Route path="buyers/:id" element={<DetailPage type="buyers" title="Buyer Verification"/>}/>
      <Route path="products" element={resource('products','Products','/admin/products',{addLabel:'Create Product'})}/><Route path="products/new" element={<ProductFormPage/>}/><Route path="products/:id" element={<DetailPage type="products" title="Product"/>}/><Route path="categories" element={resource('categories','Categories')}/><Route path="pricing-tiers" element={resource('pricing','Pricing Tiers')}/>
      <Route path="rfqs" element={resource('rfqs','RFQs','/admin/rfqs')}/><Route path="rfqs/:id" element={<DetailPage type="rfqs" title="RFQ"/>}/><Route path="quotations" element={resource('quotations','Quotations','/admin/quotations')}/><Route path="quotations/:id" element={<DetailPage type="quotations" title="Quotation"/>}/><Route path="purchase-orders" element={resource('purchaseOrders','Purchase Orders','/admin/purchase-orders')}/><Route path="purchase-orders/:id" element={<DetailPage type="purchaseOrders" title="Purchase Order"/>}/><Route path="contracts" element={resource('contracts','Contracts','/admin/contracts')}/><Route path="contracts/:id" element={<DetailPage type="contracts" title="Contract"/>}/>
      <Route path="warehouses" element={resource('warehouses','Warehouses','/admin/warehouses')}/><Route path="warehouses/:id" element={<DetailPage type="warehouses" title="Warehouse"/>}/><Route path="locations" element={resource('locations','Locations and Bins')}/><Route path="inventory" element={resource('inventory','Inventory Stock','/admin/inventory')}/><Route path="inventory/:id" element={<DetailPage type="inventory" title="Stock Detail"/>}/><Route path="reservations" element={resource('reservations','Stock Reservations')}/><Route path="backorders" element={resource('inventory','Backorders',null,{filterStatus:'Backordered'})}/>
      <Route path="invoices" element={resource('invoices','Invoices','/admin/invoices')}/><Route path="invoices/:id" element={<DetailPage type="invoices" title="Invoice"/>}/><Route path="credit" element={resource('credit','Credit Limits')}/><Route path="credit-notes" element={resource('creditNotes','Credit Notes')}/><Route path="payment-terms" element={resource('paymentTerms','Payment Terms')}/>
      <Route path="shipments" element={resource('shipments','Shipments','/admin/shipments')}/><Route path="shipments/:id" element={<DetailPage type="shipments" title="Shipment"/>}/><Route path="carriers" element={resource('carriers','Carriers')}/><Route path="deliveries" element={resource('deliveries','Deliveries')}/>
      <Route path="reports/sales" element={<ReportPage type="sales"/>}/><Route path="reports/buyers" element={<ReportPage type="buyers"/>}/><Route path="reports/inventory" element={<ReportPage type="inventory"/>}/><Route path="reports/finance" element={<ReportPage type="finance"/>}/><Route path="reports/executive" element={<ReportPage type="executive"/>}/>
      <Route path="users" element={resource('users','System Users')}/><Route path="roles" element={resource('roles','Roles')}/><Route path="permissions" element={<PermissionsPage/>}/><Route path="activity-logs" element={resource('activity','Activity Logs')}/><Route path="settings" element={<SettingsPage/>}/><Route path="profile" element={<ProfilePage staff/>}/><Route path="notifications" element={resource('notifications','Notifications')}/>
    </Route>

    {dept('finance','finance',(<>
        <Route path="invoices" element={<FinanceInvoicesPage/>}/>
        <Route path="credit-requests" element={<CreditRequestsPage/>}/>
        <Route path="credit-requests/:id" element={<CreditRequestDetailPage/>}/>
        <Route path="buyers" element={<ResourcePage type="buyers" title="Buyer Credit" basePath="/finance/buyers"/>}/>
        <Route path="buyers/:id" element={<FinanceBuyerDetailPage/>}/>
        <Route path="credit-notes" element={<CreditNotesPage/>}/>
        <Route path="credit-notes/:number" element={<CreditNoteDetailPage/>}/>
        <Route path="aging" element={<AgingPage/>}/>
        <Route path="payment-terms" element={<ResourcePage type="paymentTerms" title="Payment Terms"/>}/>
        <Route path="reports" element={<ReportPage type="finance"/>}/>
      </>))}
    {dept('warehouse','warehouse',(<>
        <Route path="locations" element={<LocationsPage/>}/>
        <Route path="receiving" element={<ReceivingPage/>}/>
        <Route path="reservations" element={<ReservationsPage/>}/>
        <Route path="picking" element={<PickingPage/>}/>
        <Route path="packing" element={<PackingPage/>}/>
        <Route path="backorders" element={<BackordersPage/>}/>
        <Route path="stock" element={<LocationsPage/>}/>
        <Route path="stock-movements" element={<StockMovementsPage/>}/>
        <Route path="adjustments" element={<Navigate to="/approvals/stock" replace/>}/>
      </>))}
    {dept('inventory-staff','inventory',(<>
        <Route path="receiving" element={<ReceivingPage/>}/>
        <Route path="picking" element={<PickingPage/>}/>
        <Route path="packing" element={<PackingPage/>}/>
        <Route path="stock-count" element={<StockCountPage/>}/>
        <Route path="movements" element={<StockMovementsPage/>}/>
        <Route path="stock" element={<LocationsPage/>}/>
      </>))}
    {dept('logistics','logistics',(<>
        <Route path="shipment-planning" element={<ShipmentPlanningPage/>}/>
        <Route path="shipments" element={<ShipmentsPage/>}/>
        <Route path="shipments/:id" element={<ShipmentDetailPage/>}/>
        <Route path="carriers" element={<CarriersPage/>}/>
        <Route path="deliveries" element={<DeliveriesPage/>}/>
        <Route path="discrepancies" element={<ExceptionsPage/>}/>
        <Route path="reports" element={<ReportPage type="logistics"/>}/>
      </>))}
    {dept('support','support',(<>
        <Route path="buyers" element={<ResourcePage type="buyers" title="Buyers" basePath="/support/buyers"/>}/>
        <Route path="buyers/:id" element={<DetailPage type="buyers" title="Buyer"/>}/>
        <Route path="orders" element={<ResourcePage type="purchaseOrders" title="Orders" basePath="/support/purchase-orders"/>}/>
        <Route path="orders/:id" element={<DetailPage type="purchaseOrders" title="Order"/>}/>
        <Route path="purchase-orders/:id" element={<DetailPage type="purchaseOrders" title="Order"/>}/>
        <Route path="shipments" element={<ResourcePage type="shipments" title="Shipments" basePath="/support/shipments"/>}/>
        <Route path="shipments/:id" element={<DetailPage type="shipments" title="Shipment"/>}/>
        <Route path="invoices" element={<ResourcePage type="invoices" title="Invoices" basePath="/support/invoices"/>}/>
        <Route path="invoices/:id" element={<DetailPage type="invoices" title="Invoice"/>}/>
        <Route path="credit-notes" element={<CreditNotesPage/>}/>
        <Route path="credit-notes/:number" element={<CreditNoteDetailPage/>}/>
        <Route path="activity" element={<ResourcePage type="activity" title="Activity Logs"/>}/>
        <Route path="help" element={<HelpCenterPage/>}/>
      </>))}

    <Route path="*" element={<NotFoundPage/>}/>
  </Routes></Suspense></ErpProvider></SessionProvider>
}

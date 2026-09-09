import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import BuyerLayout from './layouts/BuyerLayout'
import { ManagerLayout, SalesLayout } from './layouts/StaffLayout'
import AdminLayout from './layouts/AdminLayout'
import { AboutPage, CategoriesPage, CategoryPage, HomePage, LegalPage, ProductDetailPage, ProductsPage } from './pages/public/PublicPages'
import { ForgotPasswordPage, LoginPage, PendingApprovalPage, RegisterPage } from './pages/auth/AuthPages'
import ResourcePage from './pages/shared/ResourcePage'
import DetailPage from './pages/shared/DetailPage'
import { ProductFormPage, QuotationFormPage, RfqFormPage } from './pages/shared/FormPages'
import { PermissionsPage, ProfilePage, SettingsPage } from './pages/shared/AccountPages'
import ApprovalsPage from './pages/manager/ApprovalsPage'
import NotFoundPage from './pages/NotFoundPage'
import LoadingState from './components/ui/LoadingState'

const DashboardPage = lazy(() => import('./pages/shared/DashboardPage'))
const ReportPage = lazy(() => import('./pages/shared/ReportPage'))

const resource = (type, title, basePath, props={}) => <ResourcePage type={type} title={title} basePath={basePath} {...props}/>

export default function App() {
  return <Suspense fallback={<div className="p-6"><LoadingState /></div>}><Routes>
    <Route element={<PublicLayout/>}>
      <Route index element={<HomePage/>}/><Route path="products" element={<ProductsPage/>}/><Route path="products/:id" element={<ProductDetailPage/>}/><Route path="categories" element={<CategoriesPage/>}/><Route path="categories/:slug" element={<CategoryPage/>}/><Route path="about" element={<AboutPage/>}/><Route path="privacy" element={<LegalPage type="Privacy Policy"/>}/><Route path="terms" element={<LegalPage type="Terms of Service"/>}/>
    </Route>
    <Route path="login" element={<LoginPage/>}/><Route path="register" element={<RegisterPage/>}/><Route path="pending-approval" element={<PendingApprovalPage/>}/><Route path="forgot-password" element={<ForgotPasswordPage/>}/>

    <Route path="buyer" element={<BuyerLayout/>}>
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

    <Route path="sales" element={<SalesLayout/>}>
      <Route index element={<Navigate to="dashboard" replace/>}/><Route path="dashboard" element={<DashboardPage role="sales"/>}/>
      <Route path="buyers" element={resource('buyers','My Buyers','/sales/buyers')}/><Route path="buyers/profiles" element={resource('buyers','Buyer Profiles','/sales/buyers')}/><Route path="buyers/:id" element={<DetailPage type="buyers" title="Buyer"/>}/>
      <Route path="rfqs" element={resource('rfqs','RFQs','/sales/rfqs')}/><Route path="rfqs/:id" element={<DetailPage type="rfqs" title="RFQ"/>}/>
      <Route path="quotations" element={resource('quotations','Quotations','/sales/quotations',{addLabel:'Create Quotation'})}/><Route path="quotations/new" element={<QuotationFormPage/>}/><Route path="quotations/:id" element={<DetailPage type="quotations" title="Quotation"/>}/>
      <Route path="purchase-orders" element={resource('purchaseOrders','Purchase Orders','/sales/purchase-orders')}/><Route path="purchase-orders/:id" element={<DetailPage type="purchaseOrders" title="Purchase Order"/>}/><Route path="contracts" element={resource('contracts','Contracts','/sales/contracts')}/><Route path="contracts/:id" element={<DetailPage type="contracts" title="Contract"/>}/>
      <Route path="tasks" element={resource('tasks','Tasks')}/><Route path="notifications" element={resource('notifications','Notifications')}/><Route path="profile" element={<ProfilePage staff/>}/>
    </Route>

    <Route path="manager" element={<ManagerLayout/>}>
      <Route index element={<Navigate to="dashboard" replace/>}/><Route path="dashboard" element={<DashboardPage role="manager"/>}/>
      <Route path="approvals" element={<ApprovalsPage/>}/><Route path="approvals/pricing" element={<ApprovalsPage kind="Pricing"/>}/><Route path="approvals/quotations" element={<ApprovalsPage kind="Quotation"/>}/><Route path="approvals/credit" element={<ApprovalsPage kind="Credit"/>}/>
      <Route path="rfqs" element={resource('rfqs','RFQs','/manager/rfqs')}/><Route path="rfqs/:id" element={<DetailPage type="rfqs" title="RFQ"/>}/><Route path="quotations" element={resource('quotations','Quotations','/manager/quotations')}/><Route path="quotations/:id" element={<DetailPage type="quotations" title="Quotation"/>}/><Route path="purchase-orders" element={resource('purchaseOrders','Purchase Orders','/manager/purchase-orders')}/><Route path="purchase-orders/:id" element={<DetailPage type="purchaseOrders" title="Purchase Order"/>}/><Route path="contracts" element={resource('contracts','Contracts','/manager/contracts')}/><Route path="contracts/:id" element={<DetailPage type="contracts" title="Contract"/>}/>
      <Route path="team" element={resource('users','Account Executives')}/><Route path="performance" element={<ReportPage type="sales"/>}/><Route path="reports" element={<ReportPage type="executive"/>}/><Route path="notifications" element={resource('notifications','Notifications')}/>
      <Route path="profile" element={<ProfilePage staff/>}/>
    </Route>

    <Route path="admin" element={<AdminLayout/>}>
      <Route index element={<Navigate to="dashboard" replace/>}/><Route path="dashboard" element={<DashboardPage role="admin"/>}/>
      <Route path="buyers" element={resource('buyers','All Buyers','/admin/buyers')}/><Route path="buyers/pending" element={resource('buyers','Pending Buyer Verification','/admin/buyers',{filterStatus:'Pending'})}/><Route path="buyers/approved" element={resource('buyers','Approved Buyers','/admin/buyers',{filterStatus:'Approved'})}/><Route path="buyers/rejected" element={resource('buyers','Rejected Buyers','/admin/buyers',{filterStatus:'Rejected'})}/><Route path="buyers/suspended" element={resource('buyers','Suspended Buyers','/admin/buyers',{filterStatus:'Suspended'})}/><Route path="buyers/:id" element={<DetailPage type="buyers" title="Buyer Verification"/>}/>
      <Route path="products" element={resource('products','Products','/admin/products',{addLabel:'Create Product'})}/><Route path="products/new" element={<ProductFormPage/>}/><Route path="products/:id" element={<DetailPage type="products" title="Product"/>}/><Route path="categories" element={resource('categories','Categories')}/><Route path="pricing-tiers" element={resource('pricing','Pricing Tiers')}/>
      <Route path="rfqs" element={resource('rfqs','RFQs','/admin/rfqs')}/><Route path="rfqs/:id" element={<DetailPage type="rfqs" title="RFQ"/>}/><Route path="quotations" element={resource('quotations','Quotations','/admin/quotations')}/><Route path="quotations/:id" element={<DetailPage type="quotations" title="Quotation"/>}/><Route path="purchase-orders" element={resource('purchaseOrders','Purchase Orders','/admin/purchase-orders')}/><Route path="purchase-orders/:id" element={<DetailPage type="purchaseOrders" title="Purchase Order"/>}/><Route path="contracts" element={resource('contracts','Contracts','/admin/contracts')}/><Route path="contracts/:id" element={<DetailPage type="contracts" title="Contract"/>}/>
      <Route path="warehouses" element={resource('warehouses','Warehouses','/admin/warehouses')}/><Route path="warehouses/:id" element={<DetailPage type="warehouses" title="Warehouse"/>}/><Route path="locations" element={resource('locations','Locations and Bins')}/><Route path="inventory" element={resource('inventory','Inventory Stock')}/><Route path="reservations" element={resource('reservations','Stock Reservations')}/><Route path="backorders" element={resource('inventory','Backorders',null,{filterStatus:'Backordered'})}/>
      <Route path="invoices" element={resource('invoices','Invoices','/admin/invoices')}/><Route path="invoices/:id" element={<DetailPage type="invoices" title="Invoice"/>}/><Route path="credit" element={resource('credit','Credit Limits')}/><Route path="credit-notes" element={resource('creditNotes','Credit Notes')}/><Route path="payment-terms" element={resource('paymentTerms','Payment Terms')}/>
      <Route path="shipments" element={resource('shipments','Shipments','/admin/shipments')}/><Route path="shipments/:id" element={<DetailPage type="shipments" title="Shipment"/>}/><Route path="carriers" element={resource('carriers','Carriers')}/><Route path="deliveries" element={resource('deliveries','Deliveries')}/>
      <Route path="reports/sales" element={<ReportPage type="sales"/>}/><Route path="reports/buyers" element={<ReportPage type="buyers"/>}/><Route path="reports/inventory" element={<ReportPage type="inventory"/>}/><Route path="reports/finance" element={<ReportPage type="finance"/>}/><Route path="reports/executive" element={<ReportPage type="executive"/>}/>
      <Route path="users" element={resource('users','System Users')}/><Route path="roles" element={resource('roles','Roles')}/><Route path="permissions" element={<PermissionsPage/>}/><Route path="activity-logs" element={resource('activity','Activity Logs')}/><Route path="settings" element={<SettingsPage/>}/><Route path="profile" element={<ProfilePage staff/>}/><Route path="notifications" element={resource('notifications','Notifications')}/>
    </Route>
    <Route path="*" element={<NotFoundPage/>}/>
  </Routes></Suspense>
}

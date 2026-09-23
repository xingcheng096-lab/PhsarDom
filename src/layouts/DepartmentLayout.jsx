import DashboardLayout from './DashboardLayout'
import { departmentNav } from '../routes/navigation'
import { ROLES, ROLE_MAP } from '../services/session'

export function FinanceLayout() { const r = ROLE_MAP.finance; return <DashboardLayout navigation={departmentNav.finance} role={r.label} name={r.name} roleKey="finance"/> }
export function WarehouseLayout() { const r = ROLE_MAP.warehouse; return <DashboardLayout navigation={departmentNav.warehouse} role={r.label} name={r.name} roleKey="warehouse"/> }
export function InventoryLayout() { const r = ROLE_MAP.inventory; return <DashboardLayout navigation={departmentNav.inventory} role={r.label} name={r.name} roleKey="inventory"/> }
export function LogisticsLayout() { const r = ROLE_MAP.logistics; return <DashboardLayout navigation={departmentNav.logistics} role={r.label} name={r.name} roleKey="logistics"/> }
export function SupportLayout() { const r = ROLE_MAP.support; return <DashboardLayout navigation={departmentNav.support} role={r.label} name={r.name} roleKey="support"/> }

export const DEPARTMENT_LAYOUTS = {
  finance: FinanceLayout,
  warehouse: WarehouseLayout,
  inventory: InventoryLayout,
  logistics: LogisticsLayout,
  support: SupportLayout,
}

export function DepartmentLayoutFor({ roleKey }) {
  const Layout = DEPARTMENT_LAYOUTS[roleKey] || FinanceLayout
  return <Layout />
}

export default FinanceLayout
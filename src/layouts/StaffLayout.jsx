import DashboardLayout from './DashboardLayout'
import { managerNav, salesNav } from '../routes/navigation'
export function SalesLayout() { return <DashboardLayout navigation={salesNav} role="Account Executive" name="Daniel Brooks" roleKey="sales"/> }
export function ManagerLayout() { return <DashboardLayout navigation={managerNav} role="Sales Manager" name="Rachel Evans" roleKey="manager"/> }
export default SalesLayout

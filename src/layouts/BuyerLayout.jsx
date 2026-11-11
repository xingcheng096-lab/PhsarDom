import DashboardLayout from './DashboardLayout'
import { buyerNav } from '../routes/navigation'
import { useSession } from '../services/session'
export default function BuyerLayout() {
  const { user } = useSession()
  const status = user?.buyerStatus || 'Pending'
  return <DashboardLayout navigation={buyerNav} role={status === 'Approved' ? 'Verified Buyer' : `Buyer · ${status}`} name={user?.name || 'Buyer'} roleKey="buyer"/>
}

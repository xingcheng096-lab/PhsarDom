import { Bell } from 'lucide-react'
import DropdownMenu from './DropdownMenu'
export default function NotificationDropdown({ notifications = [] }) { return <DropdownMenu label={<><Bell size={15}/> Notifications</>} items={notifications.map((x) => ({ label: x.title || x.message }))}/> }

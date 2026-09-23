import { useEffect, useRef, useState } from 'react'
import { Bell, Expand, LogOut, Mail, Menu, Plus, Search, Settings, User, Repeat } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Avatar, IconButton } from '../ui'
import { ROLES } from '../../services/session'
import { useSession } from '../../services/session'

const ROLE_BY_LABEL = Object.fromEntries(ROLES.map((r) => [r.label, r.key]))
const quickRoutes = {
  buyer: ['New RFQ', '/buyer/rfqs/new'],
  sales: ['New Quote', '/sales/quotations/new'],
  manager: ['Review Approvals', '/manager/approvals'],
  admin: ['Add Product', '/admin/products/new'],
  finance: ['Review Approvals', '/approvals'],
}
const searchItems = {
  buyer: [['Products', 'products'], ['RFQs', 'rfqs'], ['Quotations', 'quotations'], ['Purchase Orders', 'purchase-orders'], ['Invoices', 'invoices'], ['Shipments', 'shipments']],
  sales: [['Buyers', 'buyers'], ['RFQs', 'rfqs'], ['Quotations', 'quotations'], ['Purchase Orders', 'purchase-orders'], ['Contracts', 'contracts']],
  manager: [['Approvals', 'approvals'], ['RFQs', 'rfqs'], ['Quotations', 'quotations'], ['Purchase Orders', 'purchase-orders'], ['Contracts', 'contracts']],
  admin: [['Products', 'products'], ['Buyers', 'buyers'], ['RFQs', 'rfqs'], ['Purchase Orders', 'purchase-orders'], ['Invoices', 'invoices'], ['Shipments', 'shipments']],
  finance: [['Credit Requests', 'credit-requests'], ['Invoices', 'invoices'], ['Credit Notes', 'credit-notes'], ['Aging', 'aging'], ['Reports', 'reports']],
  warehouse: [['Locations', 'locations'], ['Receiving', 'receiving'], ['Backorders', 'backorders'], ['Stock Movements', 'stock-movements'], ['Adjustments', 'adjustments']],
  inventory: [['Receiving', 'receiving'], ['Stock Count', 'stock-count'], ['Movements', 'movements'], ['Stock Levels', 'stock']],
  logistics: [['Shipments', 'shipments'], ['Carriers', 'carriers'], ['Deliveries', 'deliveries'], ['Shipment Planning', 'shipment-planning']],
  support: [['Buyers', 'buyers'], ['Orders', 'orders'], ['Shipments', 'shipments'], ['Invoices', 'invoices'], ['Activity', 'activity']],
}
const SALES_ROLES = ['buyer', 'sales', 'manager', 'admin']

export default function TopNavbar({ onToggle, role, name, title, roleKey }) {
  const [open, setOpen] = useState(null); const [query, setQuery] = useState(''); const [counts, setCounts] = useState({ messages: 3, notifications: 7 })
  const navigate = useNavigate(); const location = useLocation(); const { login, logout } = useSession()
  const root = roleKey || ROLE_BY_LABEL[role] || 'buyer'
  const wrapRef = useRef(null)
  const quick = quickRoutes[root]
  useEffect(() => setOpen(null), [location.pathname, location.search])
  useEffect(() => { const outside = (e) => !wrapRef.current?.contains(e.target) && setOpen(null); const key = (e) => e.key === 'Escape' && setOpen(null); document.addEventListener('mousedown', outside); document.addEventListener('keydown', key); return () => { document.removeEventListener('mousedown', outside); document.removeEventListener('keydown', key) } }, [])
  const fullscreen = async () => { try { if (!document.fullscreenEnabled) return; if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen() } catch { return } }
  const goSearch = (item) => { navigate(`/${root}/${item[1]}`); setQuery(''); setOpen(null) }
  const switchRole = (r) => { setOpen(null); login(r.key); navigate(r.home) }
  const dropdown = (key, Icon, content, onViewAll) => <div className="relative"><IconButton label={key === 'messages' ? 'Messages' : 'Notifications'} aria-expanded={open === key} onClick={() => setOpen(open === key ? null : key)} className="relative"><Icon size={18} />{counts[key] > 0 && <span className="absolute right-1 top-1 min-w-4 rounded-full bg-red-600 px-1 text-center text-[9px] font-bold leading-4 text-white">{counts[key]}</span>}</IconButton>{open === key && <div className="popover-enter fixed right-2 top-[60px] w-80 max-w-[calc(100vw-1rem)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-float md:absolute md:right-0 md:top-11"><div className="flex items-center justify-between border-b px-4 py-3"><strong className="text-xs uppercase tracking-wide text-slate-700">{key}</strong><button onClick={() => setCounts({ ...counts, [key]: 0 })} className="text-xs font-semibold text-brand-700">Mark all read</button></div>{content}<button onClick={onViewAll} className="w-full border-t px-4 py-3 text-xs font-semibold text-brand-700 hover:bg-slate-50">View all</button></div>}</div>
  return <header ref={wrapRef} className="app-navbar sticky top-0 z-30 flex h-16 items-center border-b border-slate-200/90 bg-white/95 px-3 backdrop-blur sm:px-5">
    <IconButton label="Toggle navigation" onClick={onToggle}><Menu size={20} /></IconButton>
    <div className="ml-2 hidden min-w-0 sm:block"><span className="block truncate text-[13px] font-semibold text-slate-800">{title}</span><small className="text-[11px] text-slate-500">PhsarDom · {role} workspace</small></div>
    <div className="relative ml-auto hidden lg:block"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Global search" value={query} onFocus={() => setOpen('search')} onChange={(e) => { setQuery(e.target.value); setOpen('search') }} className="h-9 w-64 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10" placeholder="Search modules..." />{open === 'search' && query && <div className="popover-enter absolute right-0 top-11 w-64 rounded-lg border bg-white p-1.5 shadow-float">{(searchItems[root] || searchItems.buyer).filter(([label]) => label.toLowerCase().includes(query.toLowerCase())).map((item) => <button key={item[0]} onClick={() => goSearch(item)} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs hover:bg-slate-50"><Search size={13} />{item[0]}</button>)}</div>}</div>
    <div className="ml-auto flex items-center gap-0.5 lg:ml-3">{quick && <button onClick={() => navigate(quick[1])} className="btn-primary mr-1 hidden md:inline-flex"><Plus size={14} />{quick[0]}</button>}<IconButton label="Toggle fullscreen" onClick={fullscreen} className="hidden md:inline-flex"><Expand size={17} /></IconButton>{SALES_ROLES.includes(root) && dropdown('messages', Mail, <div className="p-3"><p className="rounded-md bg-slate-50 p-3 text-xs text-slate-600"><strong className="block text-slate-800">Daniel Brooks</strong>Pricing review requested for QT-2026-0832.</p></div>, () => navigate(`/${root}/rfqs/1`))}{dropdown('notifications', Bell, <div className="p-3"><p className="rounded-md bg-blue-50 p-3 text-xs text-blue-800">RFQ-2026-1048 requires your attention.</p></div>, () => navigate(`/${root}/notifications`))}<div className="relative"><button aria-expanded={open === 'profile'} onClick={() => setOpen(open === 'profile' ? null : 'profile')} className="ml-1 flex min-h-10 items-center gap-2 rounded-md px-1.5 transition hover:bg-slate-100"><Avatar name={name} size="sm" /><span className="hidden text-left xl:block"><strong className="block text-xs text-slate-800">{name}</strong><small className="text-[10px] text-slate-500">{role}</small></span></button>{open === 'profile' && <div className="popover-enter absolute right-0 top-12 w-64 overflow-hidden rounded-lg border bg-white p-1.5 shadow-float"><div className="mb-1 border-b px-3 py-2"><strong className="block text-xs">{name}</strong><small>{role}</small></div><button onClick={() => navigate(`/${root}/profile`)} className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs hover:bg-slate-50"><User size={15} />Profile</button>{root !== 'buyer' && <button onClick={() => navigate(root === 'admin' ? '/admin/settings' : `/${root}/profile`)} className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs hover:bg-slate-50"><Settings size={15} />Account Settings</button>}<div className="my-1 border-t border-slate-100" /><div className="px-3 py-1.5"><span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400"><Repeat size={11} />Switch role (demo)</span></div><div className="grid grid-cols-2 gap-1 px-2 pb-2">{ROLES.map((r) => <button key={r.key} onClick={() => switchRole(r)} className={`rounded-md px-2 py-1.5 text-left text-[11px] font-medium transition ${r.key === root ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200' : 'text-slate-600 hover:bg-slate-50'}`}>{r.label}</button>)}</div><button onClick={() => { logout(); navigate('/login') }} className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs text-red-700 hover:bg-red-50"><LogOut size={15} />Sign Out</button></div>}</div></div>
  </header>
}
import { useEffect, useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import BrandLogo from '../components/common/BrandLogo'
import Footer from '../components/layout/Footer'
import { IconButton } from '../components/ui'

const links = [['Home', '/'], ['Products', '/products'], ['Categories', '/categories'], ['About', '/about']]

export default function PublicLayout() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    const key = (event) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [])

  const submit = (event) => {
    event.preventDefault()
    navigate(`/products${search ? `?search=${encodeURIComponent(search)}` : ''}`)
  }
  const linkClass = ({ isActive }) => `relative py-6 text-sm font-medium transition after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 ${isActive ? 'text-brand-700 after:bg-brand-600' : 'text-slate-600 after:bg-transparent hover:text-brand-700'}`
  const mobileLinkClass = ({ isActive }) => `block rounded-md px-3 py-3 font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'}`

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2 text-brand-800">
            <BrandLogo variant="public" />
            <span><strong className="block text-[14px] leading-4 tracking-wide">PhsarDom</strong><small className="block text-[10px] leading-3 text-slate-500">B2B Wholesale</small></span>
          </Link>
          <nav className="ml-10 hidden items-center gap-7 md:flex">
            {links.map(([label, path]) => <NavLink key={path} to={path} className={linkClass}>{label}</NavLink>)}
          </nav>
          <form onSubmit={submit} className="relative ml-auto hidden lg:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input aria-label="Search catalog" value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 w-48 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10" placeholder="Search catalog" />
          </form>
          <div className="ml-3 hidden items-center gap-2 md:flex"><Link to="/login" className="btn-ghost">Login</Link><Link to="/register" className="btn-primary">Create Business Account</Link></div>
          <IconButton label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)} className="ml-auto md:hidden">{open ? <X /> : <Menu />}</IconButton>
        </div>
        {open && <nav className="popover-enter border-t border-slate-200 bg-white p-4 md:hidden">
          {links.map(([label, path]) => <NavLink key={path} to={path} className={mobileLinkClass}>{label}</NavLink>)}
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3"><Link to="/login" className="btn-secondary">Login</Link><Link to="/register" className="btn-primary">Create Account</Link></div>
        </nav>}
      </header>
      <div className="flex-1"><Outlet /></div>
      <Footer publicView />
    </div>
  )
}

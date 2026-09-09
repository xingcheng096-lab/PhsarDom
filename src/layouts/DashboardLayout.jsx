import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import MainSidebar from '../components/layout/MainSidebar'
import TopNavbar from '../components/layout/TopNavbar'
import Footer from '../components/layout/Footer'
import { titleCase } from '../utils/format'

export default function DashboardLayout({ navigation, role, name }) {
  const [collapsed,setCollapsed]=useState(false); const [mobile,setMobile]=useState(false); const [desktop,setDesktop]=useState(()=>window.matchMedia('(min-width: 1024px)').matches); const location=useLocation(); const segments=location.pathname.split('/').filter(Boolean); const last=segments.at(-1); const title=titleCase(/^\d+$/.test(last)?segments.at(-2):last||'Dashboard')
  useEffect(()=>{const media=window.matchMedia('(min-width: 1024px)');const update=()=>{setDesktop(media.matches);if(media.matches)setMobile(false)};media.addEventListener('change',update);return()=>media.removeEventListener('change',update)},[])
  useEffect(()=>setMobile(false),[location.pathname])
  return <div className="min-h-screen"><MainSidebar navigation={navigation} collapsed={collapsed} mobileOpen={mobile} onClose={()=>setMobile(false)} onCollapse={()=>setCollapsed(!collapsed)} role={role} name={name}/>{mobile&&<button aria-label="Close navigation" onClick={()=>setMobile(false)} className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"/>}<div className={`app-content-shell flex min-h-screen flex-col transition-[margin] duration-200 ${collapsed?'lg:ml-[76px]':'lg:ml-[264px]'}`}><TopNavbar onToggle={()=>desktop?setCollapsed(!collapsed):setMobile(true)} role={role} name={name} title={title}/><main className="page-enter flex-1 p-4 sm:p-5 xl:p-6" key={location.pathname+location.search}><div className="mx-auto w-full max-w-[1680px]"><Outlet/></div></main><Footer/></div></div>
}

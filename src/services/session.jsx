import { createContext, useContext, useEffect, useState } from 'react'
import { buyers as seedBuyers } from '../data'
import { authApi } from './apiClient'

export const ROLES = [
  { key: 'buyer', label: 'Verified Buyer', name: 'Maya Chen', home: '/buyer/dashboard', department: 'Purchasing', origin: 'Customer' },
  { key: 'sales', label: 'Account Executive', name: 'Daniel Brooks', home: '/sales/dashboard', department: 'Sales', origin: 'Internal' },
  { key: 'manager', label: 'Sales Manager', name: 'Rachel Evans', home: '/manager/dashboard', department: 'Sales', origin: 'Internal' },
  { key: 'admin', label: 'Super Admin', name: 'Alex Morgan', home: '/admin/dashboard', department: 'Administration', origin: 'Internal' },
  { key: 'finance', label: 'Finance / Credit Officer', name: 'Elena Petrova', home: '/finance/dashboard', department: 'Finance', origin: 'Internal' },
  { key: 'warehouse', label: 'Warehouse Manager', name: 'Omar Haddad', home: '/warehouse/dashboard', department: 'Warehouse', origin: 'Internal' },
  { key: 'inventory', label: 'Inventory Staff', name: 'Priya Nair', home: '/inventory-staff/dashboard', department: 'Warehouse', origin: 'Internal' },
  { key: 'logistics', label: 'Logistics Coordinator', name: 'Lucas Meyer', home: '/logistics/dashboard', department: 'Logistics', origin: 'Internal' },
  { key: 'support', label: 'Customer Support / Audit Viewer', name: 'Grace Kim', home: '/support/dashboard', department: 'Administration', origin: 'Internal' },
]

export const ROLE_MAP = Object.fromEntries(ROLES.map((r) => [r.key, r]))
export const ROLE_BY_HOME = Object.fromEntries(ROLES.map((r) => [r.home.split('/')[1], r.key]))
export const SESSION_KEY = 'phsardom-session'

const SessionContext = createContext(null)

function readStored() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function buyerRecord(id) {
  try {
    const stored = JSON.parse(localStorage.getItem('meridian-demo-buyers') || '[]')
    const storedIds = new Set(stored.map((item) => String(item.id)))
    return [...stored, ...seedBuyers.filter((item) => !storedIds.has(String(item.id)))].find((item) => String(item.id) === String(id))
  } catch { return seedBuyers.find((item) => String(item.id) === String(id)) }
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(readStored)
  const [initializing, setInitializing] = useState(Boolean(import.meta.env.VITE_API_BASE_URL))

  const mapApiUser = (apiUser) => {
    const apiRole = apiUser?.roles?.[0]?.name || 'buyer'
    const key = apiRole === 'super_admin' ? 'admin' : apiRole
    const role = ROLE_MAP[key] || ROLE_MAP.buyer
    const business = apiUser.buyer_businesses?.[0]
    return { key, label: role.label, name: apiUser.name, home: role.home, department: role.department, accountId: apiUser.id, email: apiUser.email, buyerId: business?.id, buyerBusiness: business?.legal_name, buyerStatus: business?.status, loginAt: new Date().toISOString() }
  }

  useEffect(() => {
    if (!import.meta.env.VITE_API_BASE_URL) return
    authApi.me().then((response) => setSession(mapApiUser(response.user))).catch(() => setSession(null)).finally(() => setInitializing(false))
  }, [])

  useEffect(() => {
    try {
      if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      else localStorage.removeItem(SESSION_KEY)
    } catch {
      /* demo only — storage may be unavailable */
    }
  }, [session])

  const login = (key, selectedBuyerId) => {
    const role = ROLE_MAP[key]
    if (!role) return null
    const record = key === 'buyer' ? buyerRecord(selectedBuyerId ?? 1) : null
    const next = { key, label: role.label, name: role.name, home: role.home, department: role.department, buyerId: key === 'buyer' ? record?.id : undefined, buyerBusiness: key === 'buyer' ? record?.business : undefined, buyerStatus: key === 'buyer' ? record?.status : undefined, loginAt: new Date().toISOString() }
    setSession(next)
    return next
  }

  const loginWithApi = async (credentials) => {
    const response = await authApi.login(credentials)
    const next = mapApiUser(response.user)
    setSession(next)
    return next
  }

  const revalidate = () => setSession((current) => { const record = current?.key === 'buyer' ? buyerRecord(current.buyerId) : null; return current?.key === 'buyer' ? { ...current, buyerStatus: record ? record.status : current.buyerStatus } : current })
  useEffect(() => { const onStorage = () => revalidate(); window.addEventListener('storage', onStorage); return () => window.removeEventListener('storage', onStorage) }, [])
  const logout = () => setSession(null)

  const value = { session, user: session, initializing, login, loginWithApi, logout, switchTo: login, revalidate }
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  return useContext(SessionContext)
}

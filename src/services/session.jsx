import { createContext, useContext, useEffect, useState } from 'react'

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

export function SessionProvider({ children }) {
  const [session, setSession] = useState(readStored)

  useEffect(() => {
    try {
      if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
      else localStorage.removeItem(SESSION_KEY)
    } catch {
      /* demo only — storage may be unavailable */
    }
  }, [session])

  const login = (key) => {
    const role = ROLE_MAP[key]
    if (!role) return null
    const next = { key, label: role.label, name: role.name, home: role.home, department: role.department, loginAt: new Date().toISOString() }
    setSession(next)
    return next
  }

  const logout = () => setSession(null)

  const value = { session, user: session, login, logout, switchTo: login }
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  return useContext(SessionContext)
}
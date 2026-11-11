const configuredBase = import.meta.env.VITE_API_BASE_URL || ''
const API_ORIGIN = configuredBase.startsWith('http') ? configuredBase.replace(/\/api\/?$/, '') : window.location.origin
const API_BASE_URL = configuredBase.startsWith('http') ? `${API_ORIGIN}/api` : '/api'

let csrfReady = false

function apiOrigin(path) {
  return new URL(path, API_ORIGIN).toString()
}

async function ensureCsrf() {
  if (csrfReady) return
  const response = await fetch(apiOrigin('/sanctum/csrf-cookie'), { credentials: 'include' })
  if (!response.ok) throw new Error('Unable to initialize secure session.')
  csrfReady = true
}

function xsrfToken() {
  const cookie = document.cookie.split('; ').find((entry) => entry.startsWith('XSRF-TOKEN='))
  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : undefined
}

export async function apiRequest(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) await ensureCsrf()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method,
    credentials: 'include',
    headers: { Accept: 'application/json', ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(xsrfToken() ? { 'X-XSRF-TOKEN': xsrfToken() } : {}), ...(options.headers || {}) },
  })
  if (response.status === 401) throw Object.assign(new Error('Authentication required.'), { status: 401 })
  if (response.status === 403) throw Object.assign(new Error('You are not authorized for this action.'), { status: 403 })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw Object.assign(new Error(body.message || 'Request failed.'), { status: response.status, errors: body.errors || {} })
  return body
}

export const authApi = {
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => apiRequest('/auth/me'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
}

export const buyerApi = {
  business: (payload) => apiRequest('/buyer-businesses', { method: 'POST', body: JSON.stringify(payload) }),
  submitKyc: (businessId, payload) => apiRequest(`/buyer-businesses/${businessId}/kyc`, { method: 'POST', body: JSON.stringify(payload) }),
}

export const adminApi = {
  kyc: (query = '') => apiRequest(`/admin/kyc-submissions${query ? `?${query}` : ''}`),
  reviewKyc: (submissionId, payload) => apiRequest(`/kyc-submissions/${submissionId}/review`, { method: 'POST', body: JSON.stringify(payload) }),
}

export const procurementApi = {
  createRfq: (payload) => apiRequest('/rfqs', { method: 'POST', body: JSON.stringify(payload) }),
  rfqs: () => apiRequest('/rfqs'),
  quotations: () => apiRequest('/quotations'),
  issueQuotation: (payload) => apiRequest('/quotations', { method: 'POST', body: JSON.stringify(payload) }),
  acceptQuotation: (id) => apiRequest(`/quotations/${id}/accept`, { method: 'POST', body: JSON.stringify({}) }),
  purchaseOrders: () => apiRequest('/purchase-orders'),
}

export const catalogApi = {
  list: (query = '') => apiRequest(`/products${query ? `?${query}` : ''}`),
  detail: (id) => apiRequest(`/products/${id}`),
  categories: () => apiRequest('/categories'),
}

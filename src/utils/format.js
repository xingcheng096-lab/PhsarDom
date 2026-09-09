export const currency = (value) => value === null || value === undefined || value === '' ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
export const number = (value) => new Intl.NumberFormat('en-US').format(value || 0)
export const titleCase = (value = '') => value.replace(/[-_/]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
export const date = (value) => { const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value; return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(normalized)) }

const key = (type) => `meridian-demo-${type}`

export function getStoredRecords(type, defaults) {
  try {
    const stored = JSON.parse(localStorage.getItem(key(type)) || '[]')
    return [...stored.filter((item) => !item._deleted), ...defaults.filter((item) => !stored.some((saved) => saved.id === item.id))]
  } catch {
    return defaults
  }
}

export function saveRecord(type, record) {
  const stored = getStoredRecords(type, [])
  const normalized = { ...record, id: record.id || Date.now() }
  const next = stored.some((item) => item.id === normalized.id) ? stored.map((item) => item.id === normalized.id ? normalized : item) : [normalized, ...stored]
  localStorage.setItem(key(type), JSON.stringify(next))
  return normalized
}

export function removeRecord(type, id) {
  const stored = getStoredRecords(type, [])
  const existing = stored.find((item) => item.id === id)
  const next = existing ? stored.map((item) => item.id === id ? { ...item, _deleted: true } : item) : [{ id, _deleted: true }, ...stored]
  localStorage.setItem(key(type), JSON.stringify(next))
}

export function validateQuantity(quantity, moq = 1) {
  const value = Number(quantity)
  const minimum = Number(moq)
  if (!Number.isInteger(value) || value <= 0) return { ok: false, reason: 'Quantity must be a positive whole number.' }
  if (value < minimum) return { ok: false, reason: `Minimum order quantity is ${minimum}.` }
  return { ok: true, quantity: value }
}

export function validateTiers(tiers = []) {
  const sorted = [...tiers].sort((a, b) => Number(a.min) - Number(b.min))
  for (let i = 0; i < sorted.length; i += 1) {
    const tier = sorted[i]
    if (!Number.isInteger(Number(tier.min)) || Number(tier.min) < 1 || Number(tier.price) <= 0) return { ok: false, reason: 'Tier minimum and price must be valid.' }
    if (tier.max != null && tier.max !== '' && Number(tier.max) < Number(tier.min)) return { ok: false, reason: 'Tier maximum must be greater than or equal to its minimum.' }
    if (i && Number(tier.min) <= Number(sorted[i - 1].max || Infinity)) return { ok: false, reason: 'Pricing tiers cannot overlap.' }
    if (i && Number(tier.price) > Number(sorted[i - 1].price)) return { ok: false, reason: 'Higher quantities cannot cost more than lower tiers.' }
  }
  return { ok: true, tiers: sorted }
}

export function priceForQuantity(quantity, product, buyerGroup) {
  const valid = validateQuantity(quantity, product?.moq || 1)
  if (!valid.ok) return { ...valid, total: 0 }
  const groupTier = product?.buyerGroups?.[buyerGroup]?.find((tier) => valid.quantity >= tier.min && (!tier.max || valid.quantity <= tier.max))
  const tier = groupTier || product?.tiers?.find((item) => valid.quantity >= item.min && (!item.max || valid.quantity <= item.max))
  const unitPrice = Number(tier?.price ?? product?.price ?? 0)
  return { ok: unitPrice > 0, quantity: valid.quantity, unitPrice, total: Math.round(unitPrice * valid.quantity * 100) / 100 }
}

export function discountPercent(listPrice, unitPrice) { return Number(listPrice) > 0 ? Math.round((1 - Number(unitPrice) / Number(listPrice)) * 10000) / 100 : 0 }

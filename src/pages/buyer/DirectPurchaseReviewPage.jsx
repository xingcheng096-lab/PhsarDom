import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Card, StatusBadge } from '../../components/ui'
import { products as seedProducts } from '../../data'
import { getStoredRecords } from '../../services/mockStore'
import { useSession } from '../../services/session'
import { useErp } from '../../services/erpStore'
import { priceForQuantity } from '../../domain/pricing'
import { currency, number } from '../../utils/format'

export default function DirectPurchaseReviewPage() {
  const [params] = useSearchParams(); const navigate = useNavigate(); const { user } = useSession(); const erp = useErp(); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false)
  const product = useMemo(() => getStoredRecords('products', seedProducts).find((item) => String(item.id) === String(params.get('productId'))), [params])
  const quantity = Number(params.get('quantity')); const pricing = product ? priceForQuantity(quantity, product, '') : { ok: false, reason: 'Product not found.' }; const key = params.get('purchaseKey') || ''
  const confirm = () => {
    if (busy) return
    setBusy(true); setNotice('')
    const result = erp.createDirectPurchaseOrder({ productId: product?.id, quantity, idempotencyKey: key }, { actor: { ...user, id: user?.id || user?.buyerId, role: user?.key, name: user?.name, buyerId: user?.buyerId } })
    if (!result.ok) { setNotice(result.reason); setBusy(false); return }
    navigate(`/buyer/purchase-orders/${result.purchaseOrder.id}`)
  }
  if (!product || !pricing.ok || !key) return <div className="surface-card p-8"><h1 className="text-xl font-bold">Order review unavailable</h1><p className="mt-2 text-sm text-slate-600">{!product ? 'Product not found.' : pricing.reason || 'This purchase review is incomplete.'}</p><Link className="btn-primary mt-5 inline-flex" to="/buyer/products">Back to catalog</Link></div>
  return <div className="mx-auto max-w-4xl space-y-5"><Link to={`/buyer/products/${product.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"><ArrowLeft size={15}/> Back to product</Link><div><p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Direct purchase</p><h1 className="mt-1 text-3xl font-black text-slate-900">Review your order</h1><p className="mt-2 text-sm text-slate-500">Confirm the details before creating your purchase order.</p></div>{notice && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{notice}</p>}<div className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><Card title="Product"><div className="flex gap-4"><img src={product.image} alt={product.name} className="h-24 w-24 rounded-lg object-cover"/><div><h2 className="font-bold">{product.name}</h2><p className="text-xs text-slate-500">SKU: {product.sku}</p><p className="mt-2 text-sm">Quantity: <strong>{number(quantity)} {product.unit}s</strong></p><StatusBadge status={product.status}/></div></div></Card><Card title="Buyer details"><p className="font-semibold">{user?.buyerBusiness}</p><p className="mt-1 text-sm text-slate-500">{user?.name}</p><p className="mt-3 text-xs text-slate-500">Payment terms</p><strong>{erp.getCreditAccount(user?.buyerId, {}).approvedTerms || 'Net-30'}</strong></Card></div><Card title="Pricing summary"><div className="space-y-3 text-sm"><div className="flex justify-between"><span>Applied unit price</span><strong>{currency(pricing.unitPrice)}</strong></div><div className="flex justify-between"><span>Quantity</span><strong>{number(quantity)}</strong></div><div className="flex justify-between"><span>Subtotal</span><strong>{currency(pricing.total)}</strong></div><div className="flex justify-between border-t pt-3 text-base"><span className="font-semibold">Estimated total</span><strong>{currency(pricing.total)}</strong></div></div><p className="mt-4 text-xs text-slate-500">Inventory, buyer approval, credit and current pricing will be revalidated when you confirm.</p><button type="button" className="btn-primary mt-5 w-full justify-center" disabled={busy} onClick={confirm}><CheckCircle2 size={16}/>{busy ? 'Creating purchase order…' : 'Confirm Purchase Order'}</button></Card></div>
}

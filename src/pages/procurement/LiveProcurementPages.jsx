import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import { Alert, Button, Card, EmptyState, StatusBadge, TextInput } from '../../components/ui'
import { procurementApi } from '../../services/apiClient'

const live = Boolean(import.meta.env.VITE_API_BASE_URL)

export function BuyerLiveRfqsPage() {
  const [rows, setRows] = useState([]); const [error, setError] = useState('');
  useEffect(() => { if (live) procurementApi.rfqs().then((body) => setRows(body.data || [])).catch((e) => setError(e.message)) }, [])
  if (!live) return <EmptyState title="Live API is not configured" text="Set VITE_API_BASE_URL to view PostgreSQL RFQs." />
  return <div className="space-y-5"><PageHeader title="My RFQs" description="Requests loaded from the Laravel procurement API." />{error && <Alert type="error">{error}</Alert>}{rows.length ? rows.map((row) => <Card key={row.id} title={`RFQ #${row.id}`} subtitle={row.status}><div className="text-sm">{row.items?.map((item) => <p key={item.id}>{item.product?.name || `Product ${item.product_id}`} · {item.quantity}</p>)}</div></Card>) : <EmptyState title="No RFQs found" text="Create a request from the buyer catalog." />}</div>
}

export function AdminLiveProcurementPage() {
  const [rfqs, setRfqs] = useState([]); const [prices, setPrices] = useState({}); const [notice, setNotice] = useState(''); const [error, setError] = useState('');
  const refresh = () => procurementApi.rfqs().then((body) => setRfqs(body.data || [])).catch((e) => setError(e.message))
  useEffect(() => { if (live) refresh() }, [])
  if (!live) return <EmptyState title="Live API is not configured" text="Set VITE_API_BASE_URL to manage PostgreSQL RFQs." />
  const issue = async (rfq) => { try { const items = (rfq.items || []).map((item) => ({ product_id: item.product_id, quantity: item.quantity, unit_price: Number(prices[item.id] || 0) })); await procurementApi.issueQuotation({ rfq_id: rfq.id, items }); setNotice(`Quotation issued for RFQ #${rfq.id}`); refresh() } catch (e) { setError(e.message) } }
  return <div className="space-y-5"><PageHeader title="Procurement RFQs" description="Review buyer RFQs and issue quotations through Laravel." />{notice && <Alert type="success">{notice}</Alert>}{error && <Alert type="error">{error}</Alert>}{rfqs.map((rfq) => <Card key={rfq.id} title={`RFQ #${rfq.id}`} subtitle={rfq.status}><div className="space-y-3">{(rfq.items || []).map((item) => <TextInput key={item.id} label={`${item.product?.name || `Product ${item.product_id}`} · Qty ${item.quantity}`} type="number" min="0.01" step="0.01" value={prices[item.id] || ''} onChange={(e) => setPrices((p) => ({ ...p, [item.id]: e.target.value }))} />)}<Button disabled={rfq.status !== 'Submitted'} onClick={() => issue(rfq)}>Issue quotation</Button></div></Card>)}</div>
}

import { useMemo, useState } from 'react'
import { BookOpen, ChevronRight, LifeBuoy, Mail, MessageSquare, Search } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import { Card, EmptyState, Modal } from '../../components/ui'

const articles = [
  { id: 1, title: 'Managing buyer approvals', category: 'Accounts', summary: 'Review documents, approve organizations, and record verification notes.' },
  { id: 2, title: 'Creating and negotiating a quotation', category: 'Sales', summary: 'Use counter-offers, approval requests, and expiry dates to close a deal.' },
  { id: 3, title: 'Receiving inventory into a warehouse', category: 'Inventory', summary: 'Move inbound receipts through arrival, QC, discrepancy, and put-away.' },
  { id: 4, title: 'Tracking a shipment and capturing POD', category: 'Logistics', summary: 'Advance milestones, review delivery exceptions, and record proof of delivery.' },
  { id: 5, title: 'Invoices, credit limits, and payment terms', category: 'Finance', summary: 'Understand Net-30, Net-60, and Net-90 exposure and overdue balances.' },
  { id: 6, title: 'Using reports and exporting data', category: 'Reports', summary: 'Filter KPI views by period and export a CSV snapshot for review.' },
]

export default function HelpCenterPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [article, setArticle] = useState(null)
  const categories = ['All', ...new Set(articles.map((article) => article.category))]
  const filtered = useMemo(() => articles.filter((article) => {
    const text = `${article.title} ${article.summary} ${article.category}`.toLowerCase()
    return (!query || text.includes(query.toLowerCase())) && (category === 'All' || article.category === category)
  }), [query, category])

  return <>
    <PageHeader title="Help Center" description="Guides and support resources for day-to-day wholesale operations." breadcrumbs={[{ label: 'Help Center' }]} />
    <div className="mb-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card bodyClassName="p-5">
        <div className="flex items-center gap-3"><div className="rounded-lg bg-brand-50 p-2 text-brand-700"><LifeBuoy size={20} /></div><div><h2 className="font-semibold text-slate-900">How can we help?</h2><p className="text-xs text-slate-500">Search operational guides and workflow answers.</p></div></div>
        <label className="relative mt-4 block"><span className="sr-only">Search help articles</span><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="form-control pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search help articles" /></label>
      </Card>
      <Card title="Contact support" bodyClassName="p-5"><p className="text-sm text-slate-600">Need help with an order, account, or shipment?</p><div className="mt-4 flex flex-wrap gap-2"><button className="btn-primary" onClick={() => setArticle({ title: 'Contact support', summary: 'Describe your issue and include the related buyer, order, or shipment reference. A support request will be added to your workspace queue.' })}><MessageSquare size={15} />Open a request</button><a className="btn-secondary" href="mailto:support@phsardom.demo"><Mail size={15} />Email support</a></div></Card>
    </div>
    <div className="mb-4 flex flex-wrap gap-2" aria-label="Filter help articles">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${category === item ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>{item}</button>)}</div>
    {filtered.length ? <div className="grid gap-4 md:grid-cols-2">{filtered.map((item) => <Card key={item.id} bodyClassName="p-5"><div className="flex items-start justify-between gap-3"><div><span className="text-[10px] font-bold uppercase tracking-wide text-brand-700">{item.category}</span><h3 className="mt-1 font-semibold text-slate-900">{item.title}</h3></div><BookOpen size={18} className="shrink-0 text-slate-400" /></div><p className="mt-2 text-sm leading-5 text-slate-600">{item.summary}</p><button className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-700" onClick={() => setArticle(item)}>Read guide <ChevronRight size={14} /></button></Card>)}</div> : <EmptyState title="No guides found" text="Try a different search term or category." />}
    <Modal open={!!article} title={article?.title || ''} onClose={() => setArticle(null)}>{article && <div className="space-y-4"><span className="text-xs font-bold uppercase tracking-wide text-brand-700">Support guide</span><p className="text-sm leading-6 text-slate-600">{article.summary}</p><div className="rounded-lg bg-slate-50 p-4 text-xs leading-5 text-slate-600">Follow the related workflow from your sidebar. Changes are saved locally in this frontend demo and can be reviewed in the relevant activity or detail page.</div><button className="btn-primary" onClick={() => setArticle(null)}>Close guide</button></div>}</Modal>
  </>
}

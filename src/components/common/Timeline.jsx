import { Check } from 'lucide-react'

export function Timeline({ items, active = 2 }) {
  return <ol className="space-y-0">
    {items.map((item, index) => <li className="relative flex gap-3 pb-5 last:pb-0" key={typeof item === 'string' ? item : item.label}>
      <span className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${index <= active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-400'}`}>{index < active ? <Check size={12}/> : index + 1}</span>
      {index < items.length - 1 && <span className={`absolute left-[11px] top-6 h-full w-0.5 ${index < active ? 'bg-brand-200' : 'bg-slate-200'}`}/>} 
      <span className="min-w-0"><strong className="block text-xs font-semibold text-slate-800">{typeof item === 'string' ? item : item.label}</strong><small className="mt-0.5 block text-slate-500">{typeof item === 'string' ? (index <= active ? 'Completed' : 'Pending') : item.meta}</small></span>
    </li>)}
  </ol>
}

export function Stepper({ items, active = 2 }) {
  return <ol className="flex min-w-[680px] items-start">
    {items.map((item, index) => <li className="relative flex flex-1 flex-col items-center text-center" key={item}>
      <span className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold ${index <= active ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-400'}`}>{index < active ? <Check size={13}/> : index + 1}</span>
      {index < items.length - 1 && <span className={`absolute left-1/2 top-3 h-0.5 w-full ${index < active ? 'bg-brand-500' : 'bg-slate-200'}`}/>} 
      <span className={`mt-2 px-1 text-[11px] font-medium ${index <= active ? 'text-slate-800' : 'text-slate-400'}`}>{item}</span>
    </li>)}
  </ol>
}

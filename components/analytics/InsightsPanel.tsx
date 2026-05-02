import { Lightbulb, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Insight } from '@/lib/analytics'

const ICON: Record<Insight['type'], React.ReactNode> = {
  good: <CheckCircle    className='w-4 h-4 shrink-0 mt-0.5' aria-hidden='true' />,
  warn: <AlertTriangle  className='w-4 h-4 shrink-0 mt-0.5' aria-hidden='true' />,
  bad:  <XCircle        className='w-4 h-4 shrink-0 mt-0.5' aria-hidden='true' />,
  info: <Info           className='w-4 h-4 shrink-0 mt-0.5' aria-hidden='true' />,
}

const STYLE: Record<Insight['type'], string> = {
  good: 'bg-green-950/40 border-green-900 text-green-300',
  warn: 'bg-amber-950/40 border-amber-900 text-amber-300',
  bad:  'bg-red-950/40 border-red-900 text-red-300',
  info: 'bg-blue-950/40 border-blue-900 text-blue-300',
}

export default function InsightsPanel({ insights }: { insights: Insight[] }) {
  return (
    <div className='card p-4 sm:p-5'>
      <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-3 flex items-center gap-2'>
        <Lightbulb className='w-3.5 h-3.5' aria-hidden='true' />
        Auto Insights ({insights.length})
      </h2>
      <ul className='space-y-2' role='list'>
        {insights.map((ins, i) => (
          <li key={i} className={cn('flex gap-2.5 items-start p-2.5 rounded-lg border text-xs leading-relaxed', STYLE[ins.type])}>
            {ICON[ins.type]}
            <span>{ins.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

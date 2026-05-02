import { Clock } from 'lucide-react'
import { cn, formatPnl, pnlColor } from '@/lib/utils'
import type { HourBucket } from '@/lib/analytics-deep'

const ZONE_LABEL: Record<HourBucket['zone'], { label: string; cls: string }> = {
  asia:    { label: 'Asia',     cls: 'bg-purple-950 text-purple-400 border-purple-900' },
  london:  { label: 'London',   cls: 'bg-blue-950 text-blue-400 border-blue-900' },
  newyork: { label: 'New York', cls: 'bg-green-950 text-green-400 border-green-900' },
  overlap: { label: 'LDN/NY',   cls: 'bg-amber-950 text-amber-400 border-amber-900' },
  off:     { label: 'Off',      cls: 'bg-zinc-900 text-zinc-500 border-zinc-800' },
}

export default function HourHeatmap({ data }: { data: HourBucket[] }) {
  const totalTraded = data.reduce((a, b) => a + b.trades, 0)
  if (totalTraded === 0) {
    return (
      <div className='card p-4 sm:p-5'>
        <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-3 flex items-center gap-2'>
          <Clock className='w-3.5 h-3.5' aria-hidden='true' />
          Hour-Based Performance
        </h2>
        <p className='text-xs text-zinc-600'>Belum ada trade dengan jam ter-record.</p>
        <p className='text-xs text-zinc-600 mt-1'>💡 Tambahkan field <span className='mono text-zinc-400'>Trade Time</span> saat input trade.</p>
      </div>
    )
  }

  const maxAbs = Math.max(...data.map(b => Math.abs(b.pnl)), 1)

  // Best & worst hours
  const traded = data.filter(b => b.trades > 0)
  const bestHour  = [...traded].sort((a, b) => b.pnl - a.pnl)[0]
  const worstHour = [...traded].sort((a, b) => a.pnl - b.pnl)[0]

  return (
    <div className='card p-4 sm:p-5 space-y-4'>
      <div>
        <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-1 flex items-center gap-2'>
          <Clock className='w-3.5 h-3.5' aria-hidden='true' />
          Hour-Based Performance
        </h2>
        <p className='text-xs text-zinc-600'>Performa berdasarkan jam entry (UTC). Tap bar untuk detail.</p>
      </div>

      {/* Best/Worst */}
      {bestHour && worstHour && bestHour.hour !== worstHour.hour && (
        <div className='grid grid-cols-2 gap-2'>
          <div className='p-3 rounded-lg bg-green-950/40 border border-green-900'>
            <p className='text-xs text-green-400 font-semibold mb-0.5'>Best Hour</p>
            <p className='mono text-sm font-bold text-zinc-100'>{bestHour.label}</p>
            <p className='text-xs text-zinc-500 mt-0.5'>
              {formatPnl(bestHour.pnl)} · {bestHour.winRate.toFixed(0)}% WR · {bestHour.trades}T
            </p>
          </div>
          <div className='p-3 rounded-lg bg-red-950/40 border border-red-900'>
            <p className='text-xs text-red-400 font-semibold mb-0.5'>Worst Hour</p>
            <p className='mono text-sm font-bold text-zinc-100'>{worstHour.label}</p>
            <p className='text-xs text-zinc-500 mt-0.5'>
              {formatPnl(worstHour.pnl)} · {worstHour.winRate.toFixed(0)}% WR · {worstHour.trades}T
            </p>
          </div>
        </div>
      )}

      {/* Hour grid */}
      <div className='space-y-1'>
        {data.map(b => {
          const has = b.trades > 0
          const z   = ZONE_LABEL[b.zone]
          return (
            <div key={b.hour} className='flex items-center gap-2'>
              <span className='mono text-xs text-zinc-500 w-12 shrink-0'>{b.label}</span>
              <span className={cn('text-xs px-1.5 py-0.5 rounded border w-16 text-center shrink-0', z.cls)}>{z.label}</span>
              <div className='flex-1 h-5 bg-zinc-900 rounded relative overflow-hidden border border-zinc-800'>
                {has && (
                  <div className='absolute inset-y-0 left-0 rounded transition-all'
                    style={{ width: `${(Math.abs(b.pnl) / maxAbs) * 100}%`, background: b.pnl >= 0 ? '#16a34a' : '#dc2626', opacity: 0.7 }}
                  />
                )}
                {has && (
                  <div className='absolute inset-0 flex items-center justify-between px-2 text-xs'>
                    <span className={cn('mono font-semibold', pnlColor(b.pnl))}>{formatPnl(b.pnl)}</span>
                    <span className='mono text-zinc-400'>{b.trades}T · {b.winRate.toFixed(0)}%</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Zone legend */}
      <div className='flex flex-wrap gap-2 text-xs text-zinc-500 pt-2 border-t border-zinc-800'>
        {(Object.keys(ZONE_LABEL) as HourBucket['zone'][]).filter(z => z !== 'off').map(z => (
          <span key={z} className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded border', ZONE_LABEL[z].cls)}>
            {ZONE_LABEL[z].label}
          </span>
        ))}
      </div>
    </div>
  )
}

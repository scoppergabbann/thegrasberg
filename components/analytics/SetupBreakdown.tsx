import { Layers } from 'lucide-react'
import { cn, formatPnl, pnlColor } from '@/lib/utils'
import type { SetupPerformance } from '@/lib/analytics'

export default function SetupBreakdown({ data }: { data: SetupPerformance[] }) {
  return (
    <div className='card p-4 sm:p-5'>
      <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-3 flex items-center gap-2'>
        <Layers className='w-3.5 h-3.5' aria-hidden='true' />
        Setup / Strategy Breakdown
      </h2>
      {data.length === 0 ? (
        <p className='text-xs text-zinc-600'>Belum ada setup yang di-tag pada trade</p>
      ) : (
        <>
          <div className='space-y-3'>
            {data.map(s => (
              <div key={s.setup} className={cn('p-3 rounded-lg border',
                s.pnl >= 0 ? 'bg-green-950/20 border-green-900/50' : 'bg-red-950/20 border-red-900/50')}>
                <div className='flex items-center justify-between gap-2 mb-2'>
                  <span className='text-sm font-semibold text-zinc-100'>{s.setup}</span>
                  <span className={cn('mono text-sm font-bold', pnlColor(s.pnl))}>{formatPnl(s.pnl)}</span>
                </div>
                <div className='grid grid-cols-3 gap-2 text-xs'>
                  <div>
                    <p className='text-zinc-500'>Win Rate</p>
                    <p className={cn('mono font-semibold', s.winRate >= 50 ? 'text-green-400' : 'text-red-400')}>{s.winRate.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className='text-zinc-500'>Trades</p>
                    <p className='mono font-semibold text-zinc-300'>{s.trades}</p>
                  </div>
                  <div>
                    <p className='text-zinc-500'>Expectancy</p>
                    <p className={cn('mono font-semibold', s.expectancy > 0 ? 'text-green-400' : 'text-red-400')}>
                      {s.expectancy >= 0 ? '+' : '-'}${Math.abs(s.expectancy).toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {data.some(s => s.setup === 'Tanpa Setup') && (
            <p className='text-xs text-zinc-600 mt-3'>
              💡 Tip: tambahkan field <span className='mono text-zinc-400'>Setup Type</span> saat input trade untuk analisa lebih dalam.
            </p>
          )}
        </>
      )}
    </div>
  )
}

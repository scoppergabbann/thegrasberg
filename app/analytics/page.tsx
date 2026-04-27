import { getAllTrades, getAllNotes, getMonthTrades } from '@/lib/db'
import { MONTHS } from '@/lib/constants'
import { formatPnl, pnlColor, cn } from '@/lib/utils'

interface Props { searchParams: { year?: string } }

export default async function AnalyticsPage({ searchParams }: Props) {
  const now  = new Date()
  const year = parseInt(searchParams.year ?? String(now.getFullYear()))

  const [trades, notes, monthlyRaw] = await Promise.all([
    getAllTrades(),
    getAllNotes(),
    Promise.all(MONTHS.map((_, m) =>
      getMonthTrades(year, m).then(ts => ({ label: MONTHS[m].slice(0, 3), pnl: ts.reduce((a, t) => a + Number(t.pnl), 0) }))
    )),
  ])

  const wins    = trades.filter(t => Number(t.pnl) > 0)
  const losses  = trades.filter(t => Number(t.pnl) < 0)
  const winRate = trades.length ? Math.round(wins.length / trades.length * 100) : 0
  const avgWin  = wins.length   ? wins.reduce((a, t) => a + Number(t.pnl), 0) / wins.length : 0
  const avgLoss = losses.length ? Math.abs(losses.reduce((a, t) => a + Number(t.pnl), 0) / losses.length) : 0
  const rr      = avgWin && avgLoss ? avgWin / avgLoss : 0

  const pairMap: Record<string, { pnl: number; count: number }> = {}
  trades.forEach(t => { if (!pairMap[t.pair]) pairMap[t.pair] = { pnl: 0, count: 0 }; pairMap[t.pair].pnl += Number(t.pnl); pairMap[t.pair].count += 1 })
  const pairs = Object.entries(pairMap).sort((a, b) => Math.abs(b[1].pnl) - Math.abs(a[1].pnl)).slice(0, 8)
  const maxP  = pairs.length ? Math.max(...pairs.map(p => Math.abs(p[1].pnl))) : 1

  const mistakeMap: Record<string, number> = {}
  notes.forEach(n => (n.tags as any[]).filter((t: any) => t.type === 'mistake').forEach((t: any) => { mistakeMap[t.value] = (mistakeMap[t.value] || 0) + 1 }))
  const mistakes = Object.entries(mistakeMap).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxM = mistakes.length ? mistakes[0][1] : 1

  const maxBar   = Math.max(...monthlyRaw.map(m => Math.abs(m.pnl)), 1)
  const curMonth = now.getMonth()

  return (
    <div className='max-w-4xl mx-auto space-y-4 sm:space-y-5'>
      <div>
        <h1 className='text-lg sm:text-xl font-semibold text-zinc-100'>Analytics</h1>
        <p className='text-xs sm:text-sm text-zinc-500 mt-0.5'>Statistik performa — {year}</p>
      </div>

      <div className='card p-4 sm:p-5'>
        <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-3 sm:mb-4'>Monthly PNL — {year}</h2>
        <div className='flex items-end gap-1 h-20 sm:h-24' role='img' aria-label='Monthly PNL chart'>
          {monthlyRaw.map((m, i) => {
            const h     = Math.max(4, Math.round(Math.abs(m.pnl) / maxBar * 80))
            const isNow = i === curMonth && year === now.getFullYear()
            return (
              <div key={i} className='flex-1 flex flex-col items-center gap-1'>
                <div className='w-full rounded-sm transition-all'
                  style={{ height: h, background: m.pnl >= 0 ? '#16a34a' : '#dc2626', opacity: isNow ? 1 : 0.4 }}
                  aria-label={`${m.label}: ${m.pnl >= 0 ? '+' : ''}$${Math.abs(m.pnl).toFixed(0)}`} />
                <span className={cn('text-xs mono', isNow ? 'text-zinc-200' : 'text-zinc-600')}>{m.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4'>
        <div className='card p-4 sm:p-5'>
          <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-3 sm:mb-4'>By Pair</h2>
          {pairs.length === 0 ? <p className='text-xs text-zinc-600'>No data yet</p> : (
            <div className='space-y-2.5'>
              {pairs.map(([name, { pnl, count }]) => (
                <div key={name} className='flex items-center gap-2'>
                  <span className='mono text-xs font-semibold text-zinc-200 w-14 sm:w-16 shrink-0'>{name}</span>
                  <div className='flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden'>
                    <div className='h-full rounded-full' style={{ width: `${Math.round(Math.abs(pnl) / maxP * 100)}%`, background: pnl >= 0 ? '#16a34a' : '#dc2626' }} />
                  </div>
                  <span className={cn('mono text-xs font-semibold w-16 sm:w-20 text-right shrink-0', pnlColor(pnl))}>{formatPnl(pnl)}</span>
                  <span className='text-xs text-zinc-600 w-6 text-right shrink-0'>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='card p-4 sm:p-5'>
          <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-3 sm:mb-4'>Trade Statistics</h2>
          <dl className='space-y-2.5'>
            {([
              ['Total Trades', trades.length, 'text-zinc-200'],
              ['Winning', wins.length, 'text-green-400'],
              ['Losing', losses.length, 'text-red-400'],
              ['Win Rate', `${winRate}%`, winRate >= 50 ? 'text-green-400' : 'text-red-400'],
              ['Avg Win', `$${avgWin.toFixed(2)}`, 'text-green-400'],
              ['Avg Loss', `$${avgLoss.toFixed(2)}`, 'text-red-400'],
              ['Risk:Reward', rr ? `1 : ${rr.toFixed(2)}` : '—', 'text-zinc-200'],
            ] as [string, string | number, string][]).map(([l, v, c]) => (
              <div key={l} className='flex justify-between items-center'>
                <dt className='text-xs text-zinc-500'>{l}</dt>
                <dd className={cn('mono text-xs font-semibold', c)}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {mistakes.length > 0 && (
        <div className='card p-4 sm:p-5'>
          <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-3 sm:mb-4'>Top Mistakes</h2>
          <div className='space-y-3'>
            {mistakes.map(([name, count]) => (
              <div key={name}>
                <div className='flex justify-between mb-1'>
                  <span className='text-xs text-zinc-300'>{name}</span>
                  <span className='mono text-xs text-red-400 font-semibold'>{count}x</span>
                </div>
                <div className='h-1 bg-zinc-800 rounded-full overflow-hidden'>
                  <div className='h-full bg-red-600 rounded-full' style={{ width: `${Math.round(count / maxM * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

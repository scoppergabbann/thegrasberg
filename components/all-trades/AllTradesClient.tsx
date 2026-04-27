'use client'
import { useState, useTransition, useMemo } from 'react'
import { Trash2, Calendar } from 'lucide-react'
import { actionDeleteTrade } from '@/lib/actions'
import { formatPnl, pnlColor, cn } from '@/lib/utils'
import { MONTHS } from '@/lib/constants'
import type { Trade, Direction } from '@/types'

type MonthFilter = 'all' | string  // 'all' | 'YYYY-MM'

interface Props { initialTrades: Trade[] }

export default function AllTradesClient({ initialTrades }: Props) {
  const [trades, setTrades]           = useState<Trade[]>(initialTrades)
  const [filterPair, setFilterPair]   = useState('All')
  const [filterDir, setFilterDir]     = useState<'All' | Direction>('All')
  const [filterMonth, setFilterMonth] = useState<MonthFilter>('all')
  const [pending, startT]             = useTransition()

  const availableMonths = useMemo(() => {
    const set = new Set<string>()
    trades.forEach(t => set.add(t.trade_date.slice(0, 7)))
    return Array.from(set).sort().reverse()
  }, [trades])

  const pairs = useMemo(
    () => ['All', ...Array.from(new Set(trades.map(t => t.pair))).sort()],
    [trades]
  )

  const filtered = useMemo(() => trades.filter(t => {
    if (filterPair !== 'All' && t.pair !== filterPair) return false
    if (filterDir  !== 'All' && t.direction !== filterDir) return false
    if (filterMonth !== 'all' && !t.trade_date.startsWith(filterMonth)) return false
    return true
  }), [trades, filterPair, filterDir, filterMonth])

  const totalPnl = filtered.reduce((a, t) => a + Number(t.pnl), 0)
  const winRate  = filtered.length ? Math.round(filtered.filter(t => t.pnl > 0).length / filtered.length * 100) : 0

  function handleDelete(id: string) {
    setTrades(p => p.filter(t => t.id !== id))
    startT(async () => { await actionDeleteTrade(id) })
  }

  function formatMonthLabel(yyyymm: string) {
    const [y, m] = yyyymm.split('-')
    return `${MONTHS[parseInt(m) - 1]} ${y}`
  }

  return (
    <>
      {/* Stats */}
      <div className='grid grid-cols-3 gap-2 sm:gap-3'>
        <div className='stat-card'>
          <p className={cn('mono text-base sm:text-lg font-semibold', pnlColor(totalPnl))}>{formatPnl(totalPnl)}</p>
          <p className='text-xs text-zinc-500 mt-0.5'>Filtered PNL</p>
        </div>
        <div className='stat-card'>
          <p className='mono text-base sm:text-lg font-semibold text-zinc-200'>{filtered.length}</p>
          <p className='text-xs text-zinc-500 mt-0.5'>Trades</p>
        </div>
        <div className='stat-card'>
          <p className={cn('mono text-base sm:text-lg font-semibold', winRate >= 50 ? 'text-green-400' : 'text-red-400')}>{winRate}%</p>
          <p className='text-xs text-zinc-500 mt-0.5'>Win Rate</p>
        </div>
      </div>

      {/* Month chips */}
      {availableMonths.length > 0 && (
        <div>
          <div className='flex items-center gap-1.5 mb-2 text-xs text-zinc-500'>
            <Calendar className='w-3.5 h-3.5' aria-hidden='true' />
            <span className='font-medium'>Filter by Month</span>
          </div>
          <div
            className='flex gap-1.5 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1'
            role='group'
            aria-label='Filter berdasarkan bulan'
          >
            <button
              onClick={() => setFilterMonth('all')}
              aria-pressed={filterMonth === 'all'}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all shrink-0 focus-visible:outline-2 focus-visible:outline-zinc-400',
                filterMonth === 'all'
                  ? 'bg-zinc-700 border-zinc-500 text-zinc-100'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300'
              )}
            >
              All Months
            </button>
            {availableMonths.map(m => {
              const monthTrades = trades.filter(t => t.trade_date.startsWith(m))
              const monthPnl    = monthTrades.reduce((a, t) => a + Number(t.pnl), 0)
              const isActive    = filterMonth === m
              return (
                <button
                  key={m}
                  onClick={() => setFilterMonth(m)}
                  aria-pressed={isActive}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all shrink-0 flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-zinc-400',
                    isActive
                      ? monthPnl >= 0
                        ? 'bg-green-950 border-green-600 text-green-300'
                        : 'bg-red-950 border-red-600 text-red-300'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  <span>{formatMonthLabel(m)}</span>
                  <span className={cn(
                    'mono text-xs font-semibold',
                    isActive ? '' : monthPnl >= 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {monthPnl >= 0 ? '+' : '-'}${Math.abs(monthPnl) >= 1000 ? (Math.abs(monthPnl) / 1000).toFixed(1) + 'k' : Math.abs(monthPnl).toFixed(0)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Pair + Direction filters */}
      <div className='flex gap-2 flex-wrap items-center'>
        <select
          className='form-select w-auto text-xs'
          value={filterPair}
          onChange={e => setFilterPair(e.target.value)}
          aria-label='Filter by pair'
        >
          {pairs.map(p => <option key={p}>{p}</option>)}
        </select>
        <div className='flex gap-1.5' role='group' aria-label='Filter direction'>
          {(['All', 'BUY', 'SELL'] as const).map(d => (
            <button
              key={d}
              onClick={() => setFilterDir(d)}
              aria-pressed={filterDir === d}
              className={cn(
                'px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border transition-all focus-visible:outline-2',
                filterDir === d
                  ? d === 'BUY'
                    ? 'bg-green-950 border-green-700 text-green-400'
                    : d === 'SELL'
                      ? 'bg-red-950 border-red-700 text-red-400'
                      : 'bg-zinc-700 border-zinc-500 text-zinc-200'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300'
              )}
            >
              {d}
            </button>
          ))}
        </div>
        {(filterPair !== 'All' || filterDir !== 'All' || filterMonth !== 'all') && (
          <button
            onClick={() => { setFilterPair('All'); setFilterDir('All'); setFilterMonth('all') }}
            className='text-xs text-zinc-500 hover:text-zinc-300 ml-auto px-2 py-1 rounded focus-visible:outline-2 focus-visible:outline-zinc-400'
          >
            Reset filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className='card p-8 sm:p-12 text-center'>
          <p className='text-zinc-400'>
            {trades.length === 0 ? 'Belum ada trade tersimpan' : 'Tidak ada trade yang cocok dengan filter'}
          </p>
          <p className='text-xs text-zinc-600 mt-1'>
            {trades.length === 0 ? 'Buka kalender → klik tanggal → tambah trade' : 'Coba reset filter atau pilih bulan lain'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop: table */}
          <div className='card overflow-hidden hidden md:block'>
            <table className='w-full text-sm' role='table'>
              <thead>
                <tr className='border-b border-zinc-800'>
                  {['Date', 'Pair', 'Dir', 'Session', 'Lot', 'Note', 'PNL', ''].map((h, i) => (
                    <th key={i} scope='col' className='px-4 py-3 text-left text-xs font-semibold text-zinc-500 mono'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className='border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors'>
                    <td className='px-4 py-2.5 mono text-xs text-zinc-400'>{t.trade_date}</td>
                    <td className='px-4 py-2.5 mono text-xs font-semibold text-zinc-200'>{t.pair}</td>
                    <td className='px-4 py-2.5'>
                      <span className={cn('text-xs px-2 py-0.5 rounded font-semibold', t.direction === 'BUY' ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400')}>
                        {t.direction}
                      </span>
                    </td>
                    <td className='px-4 py-2.5 text-xs text-zinc-500'>{t.session}</td>
                    <td className='px-4 py-2.5 mono text-xs text-zinc-500'>{t.lot_size ?? '—'}</td>
                    <td className='px-4 py-2.5 text-xs text-zinc-400 max-w-[140px] truncate'>{t.note || '—'}</td>
                    <td className={cn('px-4 py-2.5 mono text-xs font-semibold', pnlColor(Number(t.pnl)))}>{formatPnl(Number(t.pnl))}</td>
                    <td className='px-4 py-2.5'>
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={pending}
                        className='w-6 h-6 flex items-center justify-center rounded text-zinc-600 hover:text-red-400 hover:bg-red-950 transition-all focus-visible:outline-2 focus-visible:outline-red-500'
                        aria-label={`Hapus trade ${t.pair}`}
                      >
                        <Trash2 className='w-3.5 h-3.5' aria-hidden='true' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: card list */}
          <ul className='space-y-2 md:hidden' role='list'>
            {filtered.map(t => (
              <li key={t.id} className='card p-3'>
                <div className='flex items-center justify-between gap-2 mb-1.5'>
                  <div className='flex items-center gap-2 min-w-0'>
                    <span className='mono text-sm font-semibold text-zinc-200'>{t.pair}</span>
                    <span className={cn('text-xs px-1.5 py-0.5 rounded font-semibold shrink-0', t.direction === 'BUY' ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400')}>
                      {t.direction}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 shrink-0'>
                    <span className={cn('mono text-sm font-semibold', pnlColor(Number(t.pnl)))}>{formatPnl(Number(t.pnl))}</span>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={pending}
                      className='w-7 h-7 flex items-center justify-center rounded text-zinc-600 hover:text-red-400 hover:bg-red-950'
                      aria-label={`Hapus trade ${t.pair}`}
                    >
                      <Trash2 className='w-3.5 h-3.5' aria-hidden='true' />
                    </button>
                  </div>
                </div>
                <div className='flex items-center gap-3 text-xs text-zinc-500 flex-wrap'>
                  <span className='mono'>{t.trade_date}</span>
                  <span>{t.session}</span>
                  {t.lot_size && <span>{t.lot_size}L</span>}
                </div>
                {t.note && <p className='text-xs text-zinc-400 mt-1.5'>{t.note}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

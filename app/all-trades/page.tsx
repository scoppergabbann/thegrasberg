'use client'
import { useEffect, useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { actionDeleteTrade } from '@/lib/actions'
import { formatPnl, pnlColor, cn } from '@/lib/utils'
import type { Trade, Direction } from '@/types'

export default function AllTradesPage() {
  const [trades,    setTrades]    = useState<Trade[]>([])
  const [loading,   setLoading]   = useState(true)
  const [filterPair,setFilterPair]= useState('All')
  const [filterDir, setFilterDir] = useState<'All'|Direction>('All')
  const [pending,   startT]       = useTransition()

  useEffect(() => {
    supabase.from('trades').select('*').order('trade_date',{ascending:false})
      .then(({data})=>{ setTrades((data||[]).map(r=>({...r,pnl:Number(r.pnl)})) as Trade[]); setLoading(false) })
  }, [])

  const pairs    = ['All', ...Array.from(new Set(trades.map(t=>t.pair))).sort()]
  const filtered = trades.filter(t=>(filterPair==='All'||t.pair===filterPair)&&(filterDir==='All'||t.direction===filterDir))
  const totalPnl = filtered.reduce((a,t)=>a+Number(t.pnl),0)
  const winRate  = filtered.length ? Math.round(filtered.filter(t=>t.pnl>0).length/filtered.length*100) : 0

  function handleDelete(id:string) {
    setTrades(p=>p.filter(t=>t.id!==id))
    startT(async()=>{ await actionDeleteTrade(id) })
  }

  return (
    <div className='max-w-4xl mx-auto space-y-4 sm:space-y-5'>
      <div><h1 className='text-lg sm:text-xl font-semibold text-zinc-100'>All Trades</h1><p className='text-xs sm:text-sm text-zinc-500 mt-0.5'>Riwayat trade dari Supabase</p></div>
      <div className='grid grid-cols-3 gap-2 sm:gap-3'>
        <div className='stat-card'><p className={cn('mono text-base sm:text-lg font-semibold', pnlColor(totalPnl))}>{formatPnl(totalPnl)}</p><p className='text-xs text-zinc-500 mt-0.5'>Filtered PNL</p></div>
        <div className='stat-card'><p className='mono text-base sm:text-lg font-semibold text-zinc-200'>{filtered.length}</p><p className='text-xs text-zinc-500 mt-0.5'>Trades</p></div>
        <div className='stat-card'><p className={cn('mono text-base sm:text-lg font-semibold', winRate>=50?'text-green-400':'text-red-400')}>{winRate}%</p><p className='text-xs text-zinc-500 mt-0.5'>Win Rate</p></div>
      </div>
      <div className='flex gap-2 flex-wrap items-center'>
        <select className='form-select w-auto text-xs' value={filterPair} onChange={e=>setFilterPair(e.target.value)} aria-label='Filter by pair'>
          {pairs.map(p=><option key={p}>{p}</option>)}
        </select>
        <div className='flex gap-1.5' role='group' aria-label='Filter direction'>
          {(['All','BUY','SELL'] as const).map(d=>(
            <button key={d} onClick={()=>setFilterDir(d)} aria-pressed={filterDir===d}
              className={cn('px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border transition-all focus-visible:outline-2', filterDir===d?(d==='BUY'?'bg-green-950 border-green-700 text-green-400':d==='SELL'?'bg-red-950 border-red-700 text-red-400':'bg-zinc-700 border-zinc-500 text-zinc-200'):'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300')}>{d}</button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className='card p-8 sm:p-12 flex items-center justify-center gap-2 text-zinc-500'><Loader2 className='w-5 h-5 animate-spin' aria-hidden='true' /> Memuat data...</div>
      ) : filtered.length===0 ? (
        <div className='card p-8 sm:p-12 text-center'><p className='text-zinc-400'>Tidak ada trade yang cocok</p></div>
      ) : (
        <>
          {/* Desktop: table */}
          <div className='card overflow-hidden hidden md:block'>
            <table className='w-full text-sm' role='table'>
              <thead>
                <tr className='border-b border-zinc-800'>
                  {['Date','Pair','Dir','Session','Lot','Note','PNL',''].map((h,i)=>(
                    <th key={i} scope='col' className='px-4 py-3 text-left text-xs font-semibold text-zinc-500 mono'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t=>(
                  <tr key={t.id} className='border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors'>
                    <td className='px-4 py-2.5 mono text-xs text-zinc-400'>{t.trade_date}</td>
                    <td className='px-4 py-2.5 mono text-xs font-semibold text-zinc-200'>{t.pair}</td>
                    <td className='px-4 py-2.5'><span className={cn('text-xs px-2 py-0.5 rounded font-semibold', t.direction==='BUY'?'bg-green-950 text-green-400':'bg-red-950 text-red-400')}>{t.direction}</span></td>
                    <td className='px-4 py-2.5 text-xs text-zinc-500'>{t.session}</td>
                    <td className='px-4 py-2.5 mono text-xs text-zinc-500'>{t.lot_size??'—'}</td>
                    <td className='px-4 py-2.5 text-xs text-zinc-400 max-w-[140px] truncate'>{t.note||'—'}</td>
                    <td className={cn('px-4 py-2.5 mono text-xs font-semibold', pnlColor(Number(t.pnl)))}>{formatPnl(Number(t.pnl))}</td>
                    <td className='px-4 py-2.5'>
                      <button onClick={()=>handleDelete(t.id)} disabled={pending}
                        className='w-6 h-6 flex items-center justify-center rounded text-zinc-600 hover:text-red-400 hover:bg-red-950 transition-all focus-visible:outline-2 focus-visible:outline-red-500'
                        aria-label={`Hapus trade ${t.pair}`}>
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
                    <span className={cn('text-xs px-1.5 py-0.5 rounded font-semibold shrink-0', t.direction==='BUY'?'bg-green-950 text-green-400':'bg-red-950 text-red-400')}>{t.direction}</span>
                  </div>
                  <div className='flex items-center gap-2 shrink-0'>
                    <span className={cn('mono text-sm font-semibold', pnlColor(Number(t.pnl)))}>{formatPnl(Number(t.pnl))}</span>
                    <button onClick={()=>handleDelete(t.id)} disabled={pending} className='w-7 h-7 flex items-center justify-center rounded text-zinc-600 hover:text-red-400 hover:bg-red-950' aria-label={`Hapus trade ${t.pair}`}>
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
    </div>
  )
}

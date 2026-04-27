
'use client'
import { useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { actionAddTrade, actionDeleteTrade } from '@/lib/actions'
import { PAIRS } from '@/lib/constants'
import { formatPnl, pnlColor, cn } from '@/lib/utils'
import type { Trade, Direction, Session } from '@/types'

interface Props { year:number; month:number; day:number; dateKey:string; existingTrades:Trade[] }

export default function TradesPanel({ year, month, day, dateKey, existingTrades }: Props) {
  const [pair,    setPair]    = useState('XAUUSD')
  const [dir,     setDir]     = useState<Direction>('BUY')
  const [pnl,     setPnl]     = useState('')
  const [lot,     setLot]     = useState('')
  const [session, setSession] = useState<Session>('New York')
  const [note,    setNote]    = useState('')
  const [err,     setErr]     = useState('')
  const [pending, startT]     = useTransition()

  // Optimistic trades list (starts with server data, updates immediately on add/delete)
  const [trades, setTrades]   = useState<Trade[]>(existingTrades)
  const totalPnl = trades.reduce((a,t)=>a+Number(t.pnl),0)

  const mm = String(month+1).padStart(2,'0'), dd = String(day).padStart(2,'0')

  function handleAdd() {
    const num = parseFloat(pnl)
    if (!pair || isNaN(num)) { setErr('Pilih pair dan masukkan nilai PNL.'); return }
    setErr('')
    const optimistic: Trade = {
      id: `opt-${Date.now()}`, trade_date:`${year}-${mm}-${dd}`,
      pair, direction:dir, pnl:num, lot_size:lot?parseFloat(lot):null, session, note,
    }
    setTrades(prev => [...prev, optimistic])
    startT(async () => {
      await actionAddTrade({ trade_date:`${year}-${mm}-${dd}`, pair, direction:dir, pnl:num, lot_size:lot?parseFloat(lot):null, session, note })
    })
    setPnl(''); setNote(''); setLot('')
  }

  function handleDelete(id: string) {
    setTrades(prev => prev.filter(t=>t.id!==id))
    startT(async () => { await actionDeleteTrade(id) })
  }

  return (
    <div className='p-5 space-y-4'>
      <fieldset className='space-y-3'>
        <legend className='text-xs font-semibold text-zinc-400 mb-2'>Tambah Trade Baru</legend>
        <div className='grid grid-cols-3 gap-2'>
          <div><label htmlFor='pair' className='block text-[11px] text-zinc-500 mb-1'>Pair</label>
            <select id='pair' className='form-select' value={pair} onChange={e=>setPair(e.target.value)}>
              {PAIRS.map(p=><option key={p}>{p}</option>)}
            </select></div>
          <div><label htmlFor='dir' className='block text-[11px] text-zinc-500 mb-1'>Direction</label>
            <select id='dir' className='form-select' value={dir} onChange={e=>setDir(e.target.value as Direction)}>
              <option value='BUY'>BUY</option><option value='SELL'>SELL</option>
            </select></div>
          <div><label htmlFor='sess' className='block text-[11px] text-zinc-500 mb-1'>Session</label>
            <select id='sess' className='form-select' value={session} onChange={e=>setSession(e.target.value as Session)}>
              {['Asia','London','New York','London/NY'].map(s=><option key={s}>{s}</option>)}
            </select></div>
        </div>
        <div className='grid grid-cols-2 gap-2'>
          <div><label htmlFor='pnl' className='block text-[11px] text-zinc-500 mb-1'>PNL ($)</label>
            <input id='pnl' type='number' className='form-input' placeholder='245.50' step='0.01' value={pnl} onChange={e=>setPnl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAdd()} /></div>
          <div><label htmlFor='lot' className='block text-[11px] text-zinc-500 mb-1'>Lot Size</label>
            <input id='lot' type='number' className='form-input' placeholder='0.10' step='0.01' value={lot} onChange={e=>setLot(e.target.value)} /></div>
        </div>
        <div><label htmlFor='tnote' className='block text-[11px] text-zinc-500 mb-1'>Quick Note</label>
          <input id='tnote' type='text' className='form-input' placeholder='Setup, entry reason...' value={note} onChange={e=>setNote(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAdd()} /></div>
        {err && <p className='text-xs text-red-400' role='alert'>{err}</p>}
        <button className='btn-primary flex items-center justify-center gap-2' onClick={handleAdd} disabled={pending} aria-busy={pending}>
          {pending && <Loader2 className='w-3.5 h-3.5 animate-spin' aria-hidden='true' />}
          + Tambah Trade
        </button>
      </fieldset>

      {trades.length > 0 && (
        <section aria-label='Daftar trade hari ini'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-xs font-semibold text-zinc-400'>{trades.length} Trade{trades.length>1?'s':''} Hari Ini</h3>
            <span className={cn('mono text-sm font-semibold', pnlColor(totalPnl))}>{formatPnl(totalPnl)}</span>
          </div>
          <ul className='space-y-1.5' role='list'>
            {trades.map(t => (
              <li key={t.id} className='flex items-center gap-2 px-3 py-2 bg-zinc-900 rounded-lg border border-zinc-800'>
                <span className='mono text-xs font-semibold text-zinc-200 w-16 shrink-0'>{t.pair}</span>
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0', t.direction==='BUY'?'bg-green-950 text-green-400':'bg-red-950 text-red-400')}>{t.direction}</span>
                {t.lot_size && <span className='text-[10px] text-zinc-500 shrink-0'>{t.lot_size}L</span>}
                <span className='text-[10px] text-zinc-500 shrink-0'>{t.session}</span>
                {t.note && <span className='text-xs text-zinc-400 truncate min-w-0'>{t.note}</span>}
                <span className={cn('mono text-xs font-semibold ml-auto shrink-0', pnlColor(Number(t.pnl)))}>{formatPnl(Number(t.pnl))}</span>
                <button onClick={()=>handleDelete(t.id)}
                  className='w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-950 transition-all focus-visible:outline-2 focus-visible:outline-red-500 shrink-0'
                  aria-label={`Hapus trade ${t.pair} ${formatPnl(Number(t.pnl))}`}
                  disabled={t.id.startsWith('opt-')}>
                  <Trash2 className='w-3 h-3' aria-hidden='true' />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

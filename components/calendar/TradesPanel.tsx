'use client'
import { useState, useTransition } from 'react'
import { Trash2, Loader2, X, Plus } from 'lucide-react'
import { actionAddTrade, actionDeleteTrade } from '@/lib/actions'
import { PAIRS } from '@/lib/constants'
import { formatPnl, pnlColor, cn } from '@/lib/utils'
import type { Trade, Direction, Session, SetupType } from '@/types'

const SETUP_TYPES: SetupType[] = ['Breakout', 'Pullback', 'Reversal', 'News', 'Range', 'Trend', 'Other']

interface Props { year: number; month: number; day: number; dateKey: string; existingTrades: Trade[] }

export default function TradesPanel({ year, month, day, dateKey, existingTrades }: Props) {
  const [pair, setPair]       = useState('XAUUSD')
  const [dir, setDir]         = useState<Direction>('BUY')
  const [pnl, setPnl]         = useState('')
  const [lot, setLot]         = useState('')
  const [session, setSession] = useState<Session>('New York')
  const [setup, setSetup]     = useState<SetupType | ''>('')
  const [tradeTime, setTradeTime] = useState('')
  const [entry, setEntry]     = useState('')
  const [sl, setSl]           = useState('')
  const [tp, setTp]           = useState('')
  const [riskPct, setRiskPct] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags]       = useState<string[]>([])
  const [note, setNote]       = useState('')
  const [err, setErr]         = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [pending, startT]     = useTransition()
  const [trades, setTrades]   = useState<Trade[]>(existingTrades)

  const totalPnl = trades.reduce((a, t) => a + Number(t.pnl), 0)
  const mm = String(month + 1).padStart(2, '0'), dd = String(day).padStart(2, '0')

  function addTag() {
    const t = tagInput.trim()
    if (!t || tags.includes(t)) { setTagInput(''); return }
    setTags([...tags, t])
    setTagInput('')
  }

  function removeTag(t: string) {
    setTags(tags.filter(x => x !== t))
  }

  function handleAdd() {
    const num = parseFloat(pnl)
    if (!pair || isNaN(num)) { setErr('Pilih pair dan masukkan nilai PNL.'); return }
    setErr('')

    const newTrade: Omit<Trade, 'id' | 'created_at'> = {
      trade_date:  `${year}-${mm}-${dd}`,
      trade_time:  tradeTime || null,
      pair, direction: dir, pnl: num,
      lot_size:    lot ? parseFloat(lot) : null,
      session, note,
      setup_type:  setup || null,
      entry_price: entry ? parseFloat(entry) : null,
      sl_price:    sl ? parseFloat(sl) : null,
      tp_price:    tp ? parseFloat(tp) : null,
      risk_pct:    riskPct ? parseFloat(riskPct) : null,
      custom_tags: tags,
    }
    const optimistic: Trade = { ...newTrade, id: `opt-${Date.now()}` }
    setTrades(prev => [...prev, optimistic])
    startT(async () => { await actionAddTrade(newTrade) })
    // Reset form
    setPnl(''); setNote(''); setLot(''); setEntry(''); setSl(''); setTp('')
    setRiskPct(''); setTags([]); setTradeTime('')
  }

  function handleDelete(id: string) {
    setTrades(prev => prev.filter(t => t.id !== id))
    startT(async () => { await actionDeleteTrade(id) })
  }

  return (
    <div className='p-5 space-y-4'>
      <fieldset className='space-y-3'>
        <legend className='text-xs font-semibold text-zinc-400 mb-2'>Tambah Trade Baru</legend>

        <div className='grid grid-cols-3 gap-2'>
          <div>
            <label htmlFor='pair' className='block text-xs text-zinc-500 mb-1'>Pair</label>
            <select id='pair' className='form-select' value={pair} onChange={e => setPair(e.target.value)}>
              {PAIRS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor='dir' className='block text-xs text-zinc-500 mb-1'>Direction</label>
            <select id='dir' className='form-select' value={dir} onChange={e => setDir(e.target.value as Direction)}>
              <option value='BUY'>BUY</option><option value='SELL'>SELL</option>
            </select>
          </div>
          <div>
            <label htmlFor='sess' className='block text-xs text-zinc-500 mb-1'>Session</label>
            <select id='sess' className='form-select' value={session} onChange={e => setSession(e.target.value as Session)}>
              {['Asia','London','New York','London/NY'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className='grid grid-cols-3 gap-2'>
          <div>
            <label htmlFor='setup' className='block text-xs text-zinc-500 mb-1'>Setup</label>
            <select id='setup' className='form-select' value={setup} onChange={e => setSetup(e.target.value as SetupType)}>
              <option value=''>—</option>
              {SETUP_TYPES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor='pnl' className='block text-xs text-zinc-500 mb-1'>PNL ($)</label>
            <input id='pnl' type='number' className='form-input' placeholder='245.50' step='0.01' value={pnl} onChange={e => setPnl(e.target.value)} />
          </div>
          <div>
            <label htmlFor='lot' className='block text-xs text-zinc-500 mb-1'>Lot</label>
            <input id='lot' type='number' className='form-input' placeholder='0.10' step='0.01' value={lot} onChange={e => setLot(e.target.value)} />
          </div>
        </div>

        {/* Custom tags */}
        <div>
          <label htmlFor='tag-input' className='block text-xs text-zinc-500 mb-1'>
            Custom Tags <span className='text-zinc-700'>(opsional, mis: FOMO, Disiplin)</span>
          </label>
          <div className='flex gap-2'>
            <input
              id='tag-input' type='text' className='form-input flex-1'
              placeholder='Tambah tag, lalu Enter'
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            />
            <button type='button' onClick={addTag}
              className='px-3 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-medium hover:bg-zinc-700 transition-all shrink-0 inline-flex items-center gap-1'>
              <Plus className='w-3.5 h-3.5' aria-hidden='true' /> Tag
            </button>
          </div>
          {tags.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-1.5'>
              {tags.map(t => (
                <span key={t} className='inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium bg-blue-950 text-blue-400 border border-blue-900'>
                  {t}
                  <button type='button' onClick={() => removeTag(t)} className='hover:text-blue-200' aria-label={`Hapus tag ${t}`}>
                    <X className='w-3 h-3' aria-hidden='true' />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Advanced toggle */}
        <button type='button' onClick={() => setShowAdvanced(s => !s)}
          className='text-xs text-zinc-500 hover:text-zinc-300 transition-colors'>
          {showAdvanced ? '− Sembunyikan' : '+ Tambah'} Time / Entry / SL / TP / Risk %
        </button>

        {showAdvanced && (
          <div className='space-y-2'>
            <div className='grid grid-cols-2 gap-2'>
              <div>
                <label htmlFor='time' className='block text-xs text-zinc-500 mb-1'>Trade Time (HH:mm UTC)</label>
                <input id='time' type='time' className='form-input mono' value={tradeTime} onChange={e => setTradeTime(e.target.value)} />
              </div>
              <div>
                <label htmlFor='risk' className='block text-xs text-zinc-500 mb-1'>Risk %</label>
                <input id='risk' type='number' className='form-input' placeholder='1.0' step='0.1' value={riskPct} onChange={e => setRiskPct(e.target.value)} />
              </div>
            </div>
            <div className='grid grid-cols-3 gap-2'>
              <div>
                <label htmlFor='entry' className='block text-xs text-zinc-500 mb-1'>Entry Price</label>
                <input id='entry' type='number' className='form-input' step='any' value={entry} onChange={e => setEntry(e.target.value)} />
              </div>
              <div>
                <label htmlFor='sl' className='block text-xs text-red-400 mb-1'>Stop Loss</label>
                <input id='sl' type='number' className='form-input' step='any' value={sl} onChange={e => setSl(e.target.value)} />
              </div>
              <div>
                <label htmlFor='tp' className='block text-xs text-green-400 mb-1'>Take Profit</label>
                <input id='tp' type='number' className='form-input' step='any' value={tp} onChange={e => setTp(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor='tnote' className='block text-xs text-zinc-500 mb-1'>Quick Note</label>
          <input id='tnote' type='text' className='form-input' placeholder='Setup, alasan entry...' value={note} onChange={e => setNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        </div>

        {err && <p className='text-xs text-red-400' role='alert'>{err}</p>}
        <button className='btn-primary flex items-center justify-center gap-2' onClick={handleAdd} disabled={pending}>
          {pending && <Loader2 className='w-3.5 h-3.5 animate-spin' aria-hidden='true' />}
          + Tambah Trade
        </button>
      </fieldset>

      {trades.length > 0 && (
        <section aria-label='Daftar trade hari ini'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='text-xs font-semibold text-zinc-400'>{trades.length} Trade{trades.length > 1 ? 's' : ''} Hari Ini</h3>
            <span className={cn('mono text-sm font-semibold', pnlColor(totalPnl))}>{formatPnl(totalPnl)}</span>
          </div>
          <ul className='space-y-1.5' role='list'>
            {trades.map(t => (
              <li key={t.id} className='px-3 py-2 bg-zinc-900 rounded-lg border border-zinc-800'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <span className='mono text-xs font-semibold text-zinc-200 w-16 shrink-0'>{t.pair}</span>
                  <span className={cn('text-xs px-1.5 py-0.5 rounded font-semibold shrink-0', t.direction === 'BUY' ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400')}>{t.direction}</span>
                  {t.setup_type && <span className='text-xs px-1.5 py-0.5 rounded font-medium shrink-0 bg-blue-950 text-blue-400'>{t.setup_type}</span>}
                  {t.trade_time && <span className='text-xs text-zinc-500 mono shrink-0'>{t.trade_time}</span>}
                  {t.lot_size && <span className='text-xs text-zinc-500 shrink-0'>{t.lot_size}L</span>}
                  <span className='text-xs text-zinc-500 shrink-0'>{t.session}</span>
                  {t.note && <span className='text-xs text-zinc-400 truncate min-w-0 flex-1'>{t.note}</span>}
                  <span className={cn('mono text-xs font-semibold ml-auto shrink-0', pnlColor(Number(t.pnl)))}>{formatPnl(Number(t.pnl))}</span>
                  <button onClick={() => handleDelete(t.id)} disabled={t.id.startsWith('opt-')}
                    className='w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-950 transition-all shrink-0'
                    aria-label={`Hapus trade ${t.pair}`}>
                    <Trash2 className='w-3 h-3' aria-hidden='true' />
                  </button>
                </div>
                {t.custom_tags && t.custom_tags.length > 0 && (
                  <div className='flex flex-wrap gap-1 mt-1.5 ml-[64px]'>
                    {t.custom_tags.map(tag => (
                      <span key={tag} className='text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700'>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

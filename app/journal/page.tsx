
import { getAllNotes, getAllTrades } from '@/lib/db'
import { MOOD_COLORS } from '@/lib/constants'
import { formatPnl, pnlColor, cn } from '@/lib/utils'

export default async function JournalPage() {
  const [notes, trades] = await Promise.all([getAllNotes(), getAllTrades()])
  const tradeByDate: Record<string,number> = {}
  trades.forEach(t => { tradeByDate[t.trade_date] = (tradeByDate[t.trade_date]||0) + Number(t.pnl) })

  return (
    <div className='max-w-3xl mx-auto space-y-5'>
      <div>
        <h1 className='text-xl font-semibold text-zinc-100'>Daily Journal</h1>
        <p className='text-sm text-zinc-500 mt-0.5'>Review perjalanan trading — analisa, eksekusi, dan pelajaran</p>
      </div>
      <p className='text-xs text-zinc-500'>{notes.length} journal entries</p>
      {notes.length === 0 ? (
        <div className='card p-12 text-center'>
          <p className='text-zinc-400 font-medium'>Belum ada journal entries</p>
          <p className='text-xs text-zinc-600 mt-1'>Buka kalender → klik hari mana saja → tab Journal</p>
        </div>
      ) : (
        <ul className='space-y-3' role='list'>
          {notes.map(note => {
            const pnl = tradeByDate[note.note_date] || 0
            const tc  = trades.filter(t=>t.trade_date===note.note_date).length
            return (
              <li key={note.note_date} className='card p-4 space-y-3 hover:border-zinc-700 transition-colors'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='mono text-sm font-semibold text-zinc-200'>{note.note_date}</span>
                    {note.mood && <span className={cn('text-xs font-semibold', MOOD_COLORS[note.mood]||'text-zinc-400')}>{note.mood}</span>}
                    <span className='text-xs text-zinc-600'>{tc} trade{tc!==1?'s':''}</span>
                  </div>
                  <span className={cn('mono text-sm font-semibold shrink-0', pnlColor(pnl))}>{formatPnl(pnl)}</span>
                </div>
                {note.analysis && <p className='text-sm text-zinc-400 leading-relaxed line-clamp-2'>{note.analysis}</p>}
                {note.tags?.length>0 && (
                  <div className='flex flex-wrap gap-1.5'>
                    {(note.tags as any[]).map((t:any,i:number)=>(
                      <span key={i} className={cn('text-xs px-2 py-0.5 rounded font-medium', t.type==='mistake'?'bg-red-950 text-red-400':'bg-green-950 text-green-400')}>{t.value}</span>
                    ))}
                  </div>
                )}
                {note.lesson && <p className='text-xs text-amber-400/80 italic border-l-2 border-amber-700 pl-3'>{note.lesson}</p>}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

import { getAllPsych, getAllTrades } from '@/lib/db'
import { verdictStyle, formatPnl, pnlColor, cn } from '@/lib/utils'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default async function PsychHistoryPage() {
  const [results, trades] = await Promise.all([getAllPsych(), getAllTrades()])
  const tradeByDate: Record<string,{pnl:number;count:number}> = {}
  trades.forEach(t => {
    if (!tradeByDate[t.trade_date]) tradeByDate[t.trade_date]={pnl:0,count:0}
    tradeByDate[t.trade_date].pnl   += Number(t.pnl)
    tradeByDate[t.trade_date].count += 1
  })
  const avg = results.length ? Math.round(results.reduce((a,r)=>a+r.score,0)/results.length) : 0

  return (
    <div className='max-w-3xl mx-auto space-y-4 sm:space-y-5'>
      <div>
        <h1 className='text-lg sm:text-xl font-semibold text-zinc-100'>Psychology Test History</h1>
        <p className='text-xs sm:text-sm text-zinc-500 mt-0.5'>Riwayat kesiapan mental sebelum trading</p>
      </div>
      <div className='grid grid-cols-3 gap-2 sm:gap-3'>
        <div className='stat-card'><p className='mono text-base sm:text-lg font-semibold text-blue-400'>{results.length}</p><p className='text-xs text-zinc-500 mt-0.5'>Total Tests</p></div>
        <div className='stat-card'><p className='mono text-base sm:text-lg font-semibold text-green-400'>{avg}/24</p><p className='text-xs text-zinc-500 mt-0.5'>Avg Score</p></div>
        <div className='stat-card'><p className='mono text-base sm:text-lg font-semibold text-red-400'>{results.filter(r=>!r.allowed&&(tradeByDate[r.result_date]?.count||0)>0).length}</p><p className='text-xs text-zinc-500 mt-0.5'>Trade After Warn</p></div>
      </div>
      {results.length===0 ? (
        <div className='card p-8 sm:p-12 text-center'>
          <p className='text-zinc-400 font-medium'>Belum ada psych test</p>
          <p className='text-xs text-zinc-600 mt-1'>Kalender → klik hari → tab "Psych"</p>
        </div>
      ) : (
        <ul className='space-y-3' role='list'>
          {results.map(r => {
            const s  = verdictStyle(r.verdict)
            const td = tradeByDate[r.result_date]
            return (
              <li key={r.result_date} className='card p-3 sm:p-4'>
                <div className='flex items-center gap-3 sm:gap-4'>
                  <div className={cn('w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex flex-col items-center justify-center shrink-0', s.ring)}>
                    <span className={cn('mono text-xs sm:text-sm font-bold leading-none', s.text)}>{r.score}</span>
                    <span className={cn('text-xs', s.text)}>/{r.max_score}</span>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <span className='mono text-xs sm:text-sm font-semibold text-zinc-200'>{r.result_date}</span>
                      <span className={cn('text-xs font-semibold', s.text)}>{r.verdict}</span>
                    </div>
                    <div className='flex items-center gap-3 mt-1 flex-wrap'>
                      <span className='text-xs text-zinc-500'>{r.percentage}% kesiapan</span>
                      {td?.count ? <span className={cn('text-xs font-medium', pnlColor(td.pnl))}>{formatPnl(td.pnl)} · {td.count}T</span> : <span className='text-xs text-zinc-600'>Tidak trading</span>}
                    </div>
                  </div>
                </div>
                {(r.feedback as any[]).length>0 && (
                  <div className='mt-3 space-y-1.5 sm:pl-16'>
                    {(r.feedback as any[]).map((f:any,i:number)=>(
                      <div key={i} className={cn('flex gap-2 items-start text-xs', f.type==='good'?'text-green-400':f.type==='bad'?'text-red-400':'text-amber-400')}>
                        {f.type==='good'?<CheckCircle className='w-3.5 h-3.5 shrink-0 mt-0.5' aria-hidden='true'/>:f.type==='bad'?<XCircle className='w-3.5 h-3.5 shrink-0 mt-0.5' aria-hidden='true'/>:<AlertCircle className='w-3.5 h-3.5 shrink-0 mt-0.5' aria-hidden='true'/>}
                        {f.text}
                      </div>
                    ))}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

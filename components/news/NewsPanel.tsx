// import { AlertTriangle, Info, ExternalLink } from 'lucide-react'
// import { NEWS_DB, NEWS_TIPS } from '@/lib/constants'
// import { fetchDayEvents } from '@/lib/news-api'
// import { cn } from '@/lib/utils'
// //import type { NewsEvent } from '@/types'

// const CUR_STYLE: Record<string, { bg: string; text: string }> = {
//   USD: { bg: 'bg-green-950',  text: 'text-green-400' },
//   EUR: { bg: 'bg-blue-950',   text: 'text-blue-400' },
//   JPY: { bg: 'bg-red-950',    text: 'text-red-400' },
//   GBP: { bg: 'bg-purple-950', text: 'text-purple-400' },
//   CAD: { bg: 'bg-orange-950', text: 'text-orange-400' },
//   AUD: { bg: 'bg-amber-950',  text: 'text-amber-400' },
//   NZD: { bg: 'bg-teal-950',   text: 'text-teal-400' },
//   CHF: { bg: 'bg-pink-950',   text: 'text-pink-400' },
// }

// interface Props { year: number; month: number; day: number }

// export default async function NewsPanel({ year, month, day }: Props) {
//   const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

//   // Try live API first; fallback to static NEWS_DB if API fails or empty
//   let events: NewsEvent[] = []
//   let isLive = false
//   try {
//     events = await fetchDayEvents(key)
//     if (events.length > 0) isLive = true
//   } catch {
//     // ignore
//   }

//   // Fallback to static seed data
//   if (events.length === 0) {
//     events = NEWS_DB[key] || []
//   }

//   const hi = events.some(e => e.impact === 'high') ? 'high'
//            : events.some(e => e.impact === 'medium') ? 'medium'
//            : events.length ? 'low' : 'none'

//   return (
//     <div className='p-5 space-y-3'>
//       <div className='flex items-center justify-between'>
//         <h3 className='text-xs font-semibold text-zinc-400'>Economic Events</h3>
//         {isLive && (
//           <span className='text-xs text-green-400 inline-flex items-center gap-1'>
//             <span className='w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse' aria-hidden='true' />
//             Live
//           </span>
//         )}
//       </div>

//       {events.length === 0 ? (
//         <div className='py-6 text-center'>
//           <Info className='w-8 h-8 text-zinc-600 mx-auto mb-2' aria-hidden='true' />
//           <p className='text-sm text-zinc-500'>Tidak ada scheduled news hari ini</p>
//           {!process.env.FINNHUB_API_KEY && (
//             <p className='text-xs text-amber-500 mt-2'>
//               ⚠ FINNHUB_API_KEY belum di-set di .env.local
//             </p>
//           )}
//         </div>
//       ) : (
//         <ul className='space-y-2' role='list'>
//           {events.map((ev, i) => {
//             const cs = CUR_STYLE[ev.currency] || { bg: 'bg-zinc-800', text: 'text-zinc-300' }
//             return (
//               <li key={i} className={cn(
//                 'p-3 rounded-lg border-l-[3px] bg-zinc-900/60',
//                 ev.impact === 'high' ? 'border-red-500'
//                   : ev.impact === 'medium' ? 'border-amber-500'
//                   : 'border-zinc-600'
//               )}>
//                 <div className='flex items-start gap-2 mb-1'>
//                   <span className='mono text-xs text-zinc-500 shrink-0 w-12'>{ev.time}</span>
//                   <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded shrink-0', cs.bg, cs.text)}>
//                     {ev.currency}
//                   </span>
//                   <span className='text-xs font-medium text-zinc-100 flex-1'>{ev.title}</span>
//                   <span className={cn(
//                     'shrink-0 text-xs font-semibold px-2 py-0.5 rounded border',
//                     ev.impact === 'high' ? 'badge-high'
//                       : ev.impact === 'medium' ? 'badge-medium'
//                       : 'badge-low'
//                   )}>
//                     {ev.impact.toUpperCase()}
//                   </span>
//                 </div>
//                 <p className='text-xs text-zinc-400 leading-relaxed pl-14'>{ev.description}</p>
//                 {(ev.previous || ev.forecast) && (
//                   <div className='flex gap-4 mt-1 pl-14'>
//                     {ev.previous && (
//                       <span className='text-xs text-zinc-500'>
//                         Prev: <span className='mono text-zinc-300'>{ev.previous}</span>
//                       </span>
//                     )}
//                     {ev.forecast && (
//                       <span className='text-xs text-zinc-500'>
//                         Forecast: <span className='mono text-amber-400'>{ev.forecast}</span>
//                       </span>
//                     )}
//                   </div>
//                 )}
//               </li>
//             )
//           })}
//         </ul>
//       )}

//       <div className={cn(
//         'flex gap-2.5 p-3 rounded-lg border',
//         hi === 'high' ? 'bg-red-950/40 border-red-900'
//           : hi === 'medium' ? 'bg-amber-950/40 border-amber-900'
//           : 'bg-zinc-900 border-zinc-800'
//       )} role='note'>
//         <AlertTriangle className={cn(
//           'w-4 h-4 shrink-0 mt-0.5',
//           hi === 'high' ? 'text-red-400' : 'text-amber-400'
//         )} aria-hidden='true' />
//         <p className='text-xs text-zinc-300 leading-relaxed'>{NEWS_TIPS[hi] || NEWS_TIPS.none}</p>
//       </div>

//       {/* Attribution */}
//       {isLive && (
//         <p className='text-xs text-zinc-600 text-center pt-1 flex items-center justify-center gap-1'>
//           Data dari{' '}
//           <a href='https://finnhub.io' target='_blank' rel='noopener noreferrer'
//             className='text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-0.5'>
//             Finnhub <ExternalLink className='w-3 h-3' aria-hidden='true' />
//           </a>
//         </p>
//       )}
//     </div>
//   )
// }

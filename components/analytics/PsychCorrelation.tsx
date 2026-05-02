import { Brain, Heart } from 'lucide-react'
import { cn, formatPnl, pnlColor, verdictStyle } from '@/lib/utils'
import type { MoodPerformance, PsychPerformance } from '@/lib/analytics'

const MOOD_COLOR: Record<string, { bg: string; text: string }> = {
  Focused:   { bg: '#3b82f640', text: 'text-blue-400'   },
  Confident: { bg: '#22c55e40', text: 'text-green-400'  },
  Anxious:   { bg: '#f59e0b40', text: 'text-amber-400'  },
  FOMO:      { bg: '#f9731640', text: 'text-orange-400' },
  Revenge:   { bg: '#ef444440', text: 'text-red-400'    },
  'Tanpa Journal': { bg: '#52525240', text: 'text-zinc-500' },
}

interface Props { byMood: MoodPerformance[]; byPsych: PsychPerformance[] }

export default function PsychCorrelation({ byMood, byPsych }: Props) {
  if (byMood.length === 0 && byPsych.length === 0) return null

  return (
    <div className='card p-4 sm:p-5'>
      <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mono mb-4 flex items-center gap-2'>
        <Brain className='w-3.5 h-3.5' aria-hidden='true' />
        Psychological Correlation
      </h2>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
        {/* By Mood */}
        {byMood.length > 0 && (
          <div>
            <p className='text-xs font-semibold text-zinc-400 mb-3 flex items-center gap-1.5'>
              <Heart className='w-3 h-3' aria-hidden='true' />
              Performa berdasarkan Mood Journal
            </p>
            <div className='space-y-2.5'>
              {byMood.map(m => {
                const color = MOOD_COLOR[m.mood] || MOOD_COLOR['Tanpa Journal']
                return (
                  <div key={m.mood}>
                    <div className='flex items-center justify-between gap-2 mb-1'>
                      <span className={cn('text-xs font-semibold', color.text)}>{m.mood}</span>
                      <div className='flex items-center gap-3 text-xs'>
                        <span className={cn('mono font-semibold', m.winRate >= 50 ? 'text-green-400' : 'text-red-400')}>
                          {m.winRate.toFixed(0)}% WR
                        </span>
                        <span className={cn('mono font-semibold w-20 text-right', pnlColor(m.pnl))}>{formatPnl(m.pnl)}</span>
                        <span className='text-zinc-500 mono w-8 text-right'>{m.trades}T</span>
                      </div>
                    </div>
                    <div className='h-1.5 bg-zinc-800 rounded-full overflow-hidden'>
                      <div className='h-full rounded-full transition-all'
                        style={{ width: `${m.winRate}%`, background: m.winRate >= 50 ? '#22c55e' : '#ef4444' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* By Psych verdict */}
        {byPsych.length > 0 && (
          <div>
            <p className='text-xs font-semibold text-zinc-400 mb-3 flex items-center gap-1.5'>
              <Brain className='w-3 h-3' aria-hidden='true' />
              Performa berdasarkan Psych Test
            </p>
            <div className='space-y-2.5'>
              {byPsych.map(p => {
                const s = p.verdict !== 'Tanpa Test' ? verdictStyle(p.verdict as any) : null
                return (
                  <div key={p.verdict}>
                    <div className='flex items-center justify-between gap-2 mb-1'>
                      <span className={cn('text-xs font-semibold', s?.text ?? 'text-zinc-500')}>{p.verdict}</span>
                      <div className='flex items-center gap-3 text-xs'>
                        <span className={cn('mono font-semibold', p.winRate >= 50 ? 'text-green-400' : 'text-red-400')}>
                          {p.winRate.toFixed(0)}% WR
                        </span>
                        <span className={cn('mono font-semibold w-20 text-right', pnlColor(p.pnl))}>{formatPnl(p.pnl)}</span>
                        <span className='text-zinc-500 mono w-8 text-right'>{p.trades}T</span>
                      </div>
                    </div>
                    <div className='h-1.5 bg-zinc-800 rounded-full overflow-hidden'>
                      <div className='h-full rounded-full transition-all'
                        style={{ width: `${p.winRate}%`, background: p.winRate >= 50 ? '#22c55e' : '#ef4444' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

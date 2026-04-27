
'use client'
import { useState, useTransition } from 'react'
import { CheckCircle, XCircle, AlertCircle, RotateCcw, TrendingUp, Loader2 } from 'lucide-react'
import { PSYCH_QUESTIONS } from '@/lib/constants'
import { verdictStyle, cn } from '@/lib/utils'
import { actionSavePsych, actionDeletePsych } from '@/lib/actions'
import type { PsychResult } from '@/types'

interface Props { year:number; month:number; day:number; existing:PsychResult|null }

export default function PsychTest({ year, month, day, existing }: Props) {
  const [result,   setResult]   = useState<PsychResult|null>(existing)
  const [step,     setStep]     = useState(0)
  const [answers,  setAnswers]  = useState<number[]>([])
  const [selected, setSelected] = useState<number|null>(null)
  const [pending,  startT]      = useTransition()
  const date = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`

  if (result) {
    const s = verdictStyle(result.verdict)
    return (
      <div className='p-5 space-y-4'>
        <div className='text-center py-4'>
          <div className={cn('w-20 h-20 rounded-full border-2 mx-auto mb-3 flex flex-col items-center justify-center', s.ring)}>
            <span className={cn('mono text-2xl font-bold', s.text)}>{result.score}</span>
            <span className={cn('text-xs', s.text)}>/{result.max_score}</span>
          </div>
          <h3 className={cn('text-lg font-bold mb-1', s.text)}>{result.verdict}</h3>
          <p className='text-xs text-zinc-500'>{result.percentage}% kesiapan</p>
        </div>
        <div className='space-y-2'>
          {result.feedback.map((f,i)=>(
            <div key={i} className={cn('flex gap-2.5 items-start p-3 rounded-lg border text-xs', f.type==='good'?'bg-green-950/40 border-green-900 text-green-300':f.type==='bad'?'bg-red-950/40 border-red-900 text-red-300':'bg-amber-950/40 border-amber-900 text-amber-300')}>
              {f.type==='good'?<CheckCircle className='w-4 h-4 shrink-0' aria-hidden='true'/>:f.type==='bad'?<XCircle className='w-4 h-4 shrink-0' aria-hidden='true'/>:<AlertCircle className='w-4 h-4 shrink-0' aria-hidden='true'/>}
              {f.text}
            </div>
          ))}
        </div>
        <div className='flex gap-2'>
          <button className={cn('flex-1 py-2.5 rounded-lg text-sm font-semibold border flex items-center justify-center gap-2 transition-all', result.allowed?'bg-green-950 border-green-700 text-green-400 hover:bg-green-900':'bg-amber-950 border-amber-700 text-amber-400 hover:bg-amber-900')}>
            <TrendingUp className='w-4 h-4' aria-hidden='true' />
            {result.allowed ? 'Lanjut ke Trading' : 'Observe Dulu'}
          </button>
          <button onClick={()=>{ startT(async()=>{ await actionDeletePsych(date); setResult(null); setStep(0); setAnswers([]); setSelected(null) }) }} className='btn-secondary flex items-center gap-1.5' aria-label='Ulangi test' disabled={pending}>
            {pending?<Loader2 className='w-3.5 h-3.5 animate-spin' aria-hidden='true'/>:<RotateCcw className='w-3.5 h-3.5' aria-hidden='true'/>} Ulangi
          </button>
        </div>
      </div>
    )
  }

  if (step >= PSYCH_QUESTIONS.length) {
    startT(async () => {
      await actionSavePsych(date, answers)
    })
    return <div className='p-5 flex items-center justify-center gap-2 text-zinc-400'><Loader2 className='w-4 h-4 animate-spin' aria-hidden='true' /> Menyimpan hasil...</div>
  }

  const q   = PSYCH_QUESTIONS[step]
  const pct = Math.round(step / PSYCH_QUESTIONS.length * 100)

  function next() {
    if (selected===null) return
    const newAnswers = [...answers, q.options[selected].score]
    setAnswers(newAnswers)
    setSelected(null)
    if (step+1 >= PSYCH_QUESTIONS.length) {
      // compute locally for instant display
      const { computePsychResult } = require('@/lib/utils')
      const r = computePsychResult(newAnswers)
      setResult({ ...r, result_date:date })
      startT(async () => { await actionSavePsych(date, newAnswers) })
    } else {
      setStep(s=>s+1)
    }
  }

  return (
    <div className='p-5 space-y-5'>
      <div>
        <div className='flex justify-between mb-2'>
          <span className='text-xs text-zinc-500 mono'>{step+1} / {PSYCH_QUESTIONS.length}</span>
          <span className='text-xs text-zinc-500'>{pct}%</span>
        </div>
        <div className='h-1 bg-zinc-800 rounded-full overflow-hidden' role='progressbar' aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className='h-full bg-green-500 rounded-full transition-all duration-300' style={{width:`${pct}%`}} />
        </div>
      </div>
      <div>
        <h3 className='text-sm font-semibold text-zinc-100 leading-relaxed mb-1'>{q.question}</h3>
        <p className='text-xs text-zinc-500 leading-relaxed'>{q.subtitle}</p>
      </div>
      <div className='space-y-2' role='radiogroup' aria-label={q.question}>
        {q.options.map((opt,i)=>(
          <button key={i} role='radio' aria-checked={selected===i} onClick={()=>setSelected(i)}
            className={cn('w-full text-left p-3 rounded-lg border text-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-1',
              selected===i ? (opt.level==='good'?'bg-green-950/60 border-green-600 text-green-300 focus-visible:outline-green-500':opt.level==='bad'?'bg-red-950/60 border-red-600 text-red-300 focus-visible:outline-red-500':'bg-amber-950/60 border-amber-600 text-amber-300 focus-visible:outline-amber-500')
              : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 focus-visible:outline-zinc-400')}>
            {opt.text}
          </button>
        ))}
      </div>
      <div className='flex justify-between items-center'>
        <span className='text-xs text-zinc-600'>Jawab jujur untuk hasil akurat</span>
        <button onClick={next} disabled={selected===null}
          className={cn('px-5 py-2 rounded-lg text-sm font-semibold border transition-all focus-visible:outline-2 focus-visible:outline-green-500',
            selected!==null?'bg-green-950 border-green-700 text-green-400 hover:bg-green-900':'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed')}>
          {step<PSYCH_QUESTIONS.length-1?'Lanjut →':'Selesai'}
        </button>
      </div>
    </div>
  )
}

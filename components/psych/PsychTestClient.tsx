'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { CheckCircle, XCircle, AlertCircle, RotateCcw, TrendingUp, Loader2, Settings, AlertTriangle } from 'lucide-react'
import { actionSavePsych, actionDeletePsychResult } from '@/lib/actions'
import { computePsychResult, verdictStyle, cn } from '@/lib/utils'
import type { PsychQuestion, PsychResult } from '@/types'

const TODAY = new Date().toISOString().slice(0, 10)

interface Props { questions: PsychQuestion[]; todayResult: PsychResult | null }

export default function PsychTestClient({ questions, todayResult }: Props) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [result, setResult] = useState<PsychResult | null>(todayResult)
  const [pending, startT] = useTransition()

  const maxScore = questions.reduce((acc, q) => {
    const max = Math.max(...q.options.map(o => o.score))
    return acc + (max > 0 ? max : 0)
  }, 0)

  // No questions configured
  if (questions.length === 0) {
    return (
      <div className='card p-8 sm:p-12 text-center space-y-4'>
        <AlertTriangle className='w-12 h-12 text-amber-400 mx-auto' aria-hidden='true' />
        <div>
          <p className='text-zinc-300 font-medium'>Belum ada pertanyaan tes</p>
          <p className='text-xs text-zinc-500 mt-1'>Tambahkan kriteria psikotes sesuai kebutuhanmu</p>
        </div>
        <Link href='/psych-questions' className='inline-flex items-center gap-2 px-4 py-2 bg-blue-950 border border-blue-700 text-blue-400 rounded-lg text-sm font-semibold hover:bg-blue-900'>
          <Settings className='w-4 h-4' aria-hidden='true' />
          Kelola Pertanyaan
        </Link>
      </div>
    )
  }

  // Show result if exists
  if (result) {
    const s = verdictStyle(result.verdict)
    return (
      <div className='space-y-4'>
        <div className='card p-5 sm:p-6 space-y-5'>
          <div className='text-center'>
            <div className={cn('w-24 h-24 rounded-full border-4 mx-auto mb-3 flex flex-col items-center justify-center', s.ring)}>
              <span className={cn('mono text-2xl sm:text-3xl font-bold', s.text)}>{result.score}</span>
              <span className={cn('text-xs', s.text)}>/ {result.max_score}</span>
            </div>
            <h2 className={cn('text-xl font-bold', s.text)}>{result.verdict}</h2>
            <p className='text-xs text-zinc-500 mt-1'>{result.percentage}% kesiapan</p>
          </div>
          <div className='space-y-2'>
            {result.feedback.map((f, i) => (
              <div key={i} className={cn('flex gap-2.5 items-start p-3 rounded-lg border text-sm',
                f.type === 'good' ? 'bg-green-950/40 border-green-900 text-green-300' :
                f.type === 'bad'  ? 'bg-red-950/40 border-red-900 text-red-300' :
                                    'bg-amber-950/40 border-amber-900 text-amber-300')}>
                {f.type === 'good' ? <CheckCircle className='w-4 h-4 shrink-0 mt-0.5' aria-hidden='true' /> :
                 f.type === 'bad'  ? <XCircle className='w-4 h-4 shrink-0 mt-0.5' aria-hidden='true' /> :
                                     <AlertCircle className='w-4 h-4 shrink-0 mt-0.5' aria-hidden='true' />}
                {f.text}
              </div>
            ))}
          </div>
          <div className='flex gap-2 flex-wrap'>
            <button
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-semibold border flex items-center justify-center gap-2 transition-all',
                result.allowed
                  ? 'bg-green-950 border-green-700 text-green-400 hover:bg-green-900'
                  : 'bg-amber-950 border-amber-700 text-amber-400 hover:bg-amber-900'
              )}
            >
              <TrendingUp className='w-4 h-4' aria-hidden='true' />
              {result.allowed ? 'Lanjut ke Trading' : 'Observe Dulu'}
            </button>
            <button
              onClick={() => startT(async () => {
                await actionDeletePsychResult(TODAY)
                setResult(null); setStep(0); setAnswers([]); setSelected(null)
              })}
              disabled={pending}
              className='inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-700'
            >
              {pending ? <Loader2 className='w-3.5 h-3.5 animate-spin' aria-hidden='true' /> : <RotateCcw className='w-3.5 h-3.5' aria-hidden='true' />}
              Ulangi
            </button>
          </div>
        </div>

        <Link href='/psych-history' className='block text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors'>
          Lihat riwayat psikotes →
        </Link>
      </div>
    )
  }

  // Test in progress
  if (step >= questions.length) {
    const r = computePsychResult(answers, maxScore)
    startT(async () => { await actionSavePsych(TODAY, answers, maxScore) })
    setResult({ ...r, result_date: TODAY })
    return null
  }

  const q   = questions[step]
  const pct = Math.round(step / questions.length * 100)

  function next() {
    if (selected === null) return
    const newAnswers = [...answers, q.options[selected].score]
    setAnswers(newAnswers)
    setSelected(null)
    if (step + 1 >= questions.length) {
      const r = computePsychResult(newAnswers, maxScore)
      setResult({ ...r, result_date: TODAY })
      startT(async () => { await actionSavePsych(TODAY, newAnswers, maxScore) })
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div className='card p-5 sm:p-6 space-y-5'>
      <div className='flex items-center justify-between'>
        <span className='text-xs text-zinc-500 mono'>Pertanyaan {step + 1} / {questions.length}</span>
        <Link href='/psych-questions' className='text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1' title='Kelola pertanyaan'>
          <Settings className='w-3 h-3' aria-hidden='true' />
          Kelola
        </Link>
      </div>

      <div className='h-1.5 bg-zinc-800 rounded-full overflow-hidden' role='progressbar' aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className='h-full bg-green-500 rounded-full transition-all duration-300' style={{ width: `${pct}%` }} />
      </div>

      <div>
        <h2 className='text-base sm:text-lg font-semibold text-zinc-100 leading-relaxed mb-2'>{q.question}</h2>
        {q.subtitle && <p className='text-xs sm:text-sm text-zinc-500 leading-relaxed'>{q.subtitle}</p>}
      </div>

      <div className='space-y-2' role='radiogroup' aria-label={q.question}>
        {q.options.map((opt, i) => (
          <button
            key={i} role='radio' aria-checked={selected === i} onClick={() => setSelected(i)}
            className={cn(
              'w-full text-left p-3 rounded-lg border text-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-1',
              selected === i
                ? opt.level === 'good'
                  ? 'bg-green-950/60 border-green-600 text-green-300 focus-visible:outline-green-500'
                  : opt.level === 'bad'
                    ? 'bg-red-950/60 border-red-600 text-red-300 focus-visible:outline-red-500'
                    : 'bg-amber-950/60 border-amber-600 text-amber-300 focus-visible:outline-amber-500'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 focus-visible:outline-zinc-400'
            )}
          >
            {opt.text}
          </button>
        ))}
      </div>

      <div className='flex justify-between items-center'>
        <span className='text-xs text-zinc-600'>Jawab jujur untuk hasil akurat</span>
        <button
          onClick={next} disabled={selected === null}
          className={cn(
            'px-5 py-2 rounded-lg text-sm font-semibold border transition-all focus-visible:outline-2 focus-visible:outline-green-500',
            selected !== null ? 'bg-green-950 border-green-700 text-green-400 hover:bg-green-900' : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
          )}
        >
          {step < questions.length - 1 ? 'Lanjut →' : 'Selesai'}
        </button>
      </div>
    </div>
  )
}

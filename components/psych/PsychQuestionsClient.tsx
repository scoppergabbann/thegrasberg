'use client'

import { useState, useTransition, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, GripVertical, Eye, EyeOff } from 'lucide-react'
import {
  actionCreatePsychQuestion,
  actionUpdatePsychQuestion,
  actionDeletePsychQuestion,
  actionTogglePsychQuestion,
} from '@/lib/actions'
import { cn } from '@/lib/utils'
import type { PsychQuestion, PsychOption } from '@/types'

const EMPTY_QUESTION: PsychQuestion = {
  question: '',
  subtitle: '',
  options: [
    { text: 'Sangat baik', score: 3, level: 'good' },
    { text: 'Cukup baik', score: 2, level: 'good' },
    { text: 'Kurang baik', score: 0, level: 'warn' },
    { text: 'Buruk', score: -2, level: 'bad' },
  ],
  is_active: true,
}

export default function PsychQuestionsClient({ initialQuestions }: { initialQuestions: PsychQuestion[] }) {
  const [questions, setQuestions] = useState(initialQuestions)
  const [editing, setEditing] = useState<PsychQuestion | null>(null)
  const [creating, setCreating] = useState(false)

  const handleNew = () => { setCreating(true); setEditing({ ...EMPTY_QUESTION, sort_order: questions.length + 1 }) }

  const onSaved = (saved: PsychQuestion) => {
    setQuestions(prev => {
      const idx = prev.findIndex(q => q.id === saved.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next }
      return [...prev, saved].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99))
    })
    setEditing(null); setCreating(false)
  }

  const onDeleted = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id))
    setEditing(null)
  }

  const onToggle = (q: PsychQuestion) => {
    if (!q.id) return
    const newState = !q.is_active
    setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, is_active: newState } : item))
    actionTogglePsychQuestion(q.id, newState).catch(() => {
      setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, is_active: !newState } : item))
    })
  }

  const activeCount = questions.filter(q => q.is_active).length
  const maxScore = questions
    .filter(q => q.is_active)
    .reduce((acc, q) => acc + Math.max(...q.options.map(o => o.score)), 0)

  return (
    <>
      <div className='flex items-center justify-between gap-2'>
        <p className='text-xs text-zinc-500'>
          {activeCount} pertanyaan aktif · Max score:{' '}
          <span className='mono text-zinc-300 font-semibold'>{maxScore}</span>
        </p>
        <button onClick={handleNew} className='inline-flex items-center gap-2 px-4 py-2 bg-blue-950 border border-blue-700 text-blue-400 rounded-lg text-sm font-semibold hover:bg-blue-900 transition-all focus-visible:outline-2 focus-visible:outline-blue-500'>
          <Plus className='w-4 h-4' aria-hidden='true' />
          Tambah Pertanyaan
        </button>
      </div>

      {questions.length === 0 ? (
        <div className='card p-8 sm:p-12 text-center'>
          <p className='text-zinc-400 font-medium'>Belum ada pertanyaan</p>
          <p className='text-xs text-zinc-600 mt-1'>Klik "Tambah Pertanyaan" untuk mulai membuat kriteria psikotesmu</p>
        </div>
      ) : (
        <ul className='space-y-2.5' role='list'>
          {questions.map((q, idx) => (
            <li key={q.id ?? idx} className={cn('card p-3 sm:p-4', !q.is_active && 'opacity-50')}>
              <div className='flex items-start gap-3'>
                <div className='shrink-0 w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center mono text-xs text-zinc-500 font-semibold mt-0.5'>
                  {idx + 1}
                </div>
                <div className='flex-1 min-w-0 space-y-2'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='min-w-0 flex-1'>
                      <h3 className='text-sm font-semibold text-zinc-100'>{q.question}</h3>
                      {q.subtitle && <p className='text-xs text-zinc-500 mt-0.5'>{q.subtitle}</p>}
                    </div>
                    {q.is_default && (
                      <span className='shrink-0 text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded font-medium'>
                        Default
                      </span>
                    )}
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    {q.options.map((opt, i) => (
                      <span
                        key={i}
                        className={cn(
                          'text-xs px-2 py-0.5 rounded inline-flex items-center gap-1 border',
                          opt.level === 'good' ? 'bg-green-950/60 text-green-400 border-green-900' :
                          opt.level === 'bad'  ? 'bg-red-950/60 text-red-400 border-red-900' :
                                                  'bg-amber-950/60 text-amber-400 border-amber-900'
                        )}
                      >
                        {opt.text}
                        <span className='mono font-semibold'>({opt.score >= 0 ? '+' : ''}{opt.score})</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className='shrink-0 flex items-center gap-1'>
                  <button
                    onClick={() => onToggle(q)}
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center transition-all focus-visible:outline-2',
                      q.is_active ? 'text-green-400 hover:bg-green-950 focus-visible:outline-green-500' : 'text-zinc-600 hover:text-zinc-300 focus-visible:outline-zinc-400'
                    )}
                    aria-label={q.is_active ? 'Nonaktifkan pertanyaan' : 'Aktifkan pertanyaan'}
                    aria-pressed={q.is_active}
                    title={q.is_active ? 'Aktif - klik untuk nonaktifkan' : 'Nonaktif - klik untuk aktifkan'}
                  >
                    {q.is_active ? <Eye className='w-4 h-4' aria-hidden='true' /> : <EyeOff className='w-4 h-4' aria-hidden='true' />}
                  </button>
                  <button
                    onClick={() => setEditing(q)}
                    className='w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-amber-400 hover:bg-amber-950 transition-all focus-visible:outline-2 focus-visible:outline-amber-500'
                    aria-label='Edit pertanyaan'
                  >
                    <Pencil className='w-3.5 h-3.5' aria-hidden='true' />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <QuestionEditor
          question={editing}
          isCreating={creating}
          onSaved={onSaved}
          onDeleted={onDeleted}
          onClose={() => { setEditing(null); setCreating(false) }}
        />
      )}
    </>
  )
}

// ─── Editor Modal ─────────────────────────────────────────────

interface EditorProps {
  question: PsychQuestion
  isCreating: boolean
  onSaved: (q: PsychQuestion) => void
  onDeleted: (id: string) => void
  onClose: () => void
}

function QuestionEditor({ question, isCreating, onSaved, onDeleted, onClose }: EditorProps) {
  const [questionText, setQuestionText] = useState(question.question)
  const [subtitle, setSubtitle] = useState(question.subtitle)
  const [options, setOptions] = useState<PsychOption[]>(question.options)
  const [pending, startT] = useTransition()
  const [confirmDel, setConfirmDel] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey) }
  }, [onClose])

  function updateOpt(i: number, patch: Partial<PsychOption>) {
    setOptions(prev => prev.map((o, idx) => idx === i ? { ...o, ...patch } : o))
  }

  function addOpt() {
    setOptions(prev => [...prev, { text: '', score: 0, level: 'warn' }])
  }

  function removeOpt(i: number) {
    setOptions(prev => prev.filter((_, idx) => idx !== i))
  }

  function handleSave() {
    if (!questionText.trim()) { alert('Pertanyaan tidak boleh kosong'); return }
    if (options.length < 2)   { alert('Minimal 2 pilihan jawaban'); return }
    if (options.some(o => !o.text.trim())) { alert('Semua pilihan harus diisi'); return }

    const payload: Omit<PsychQuestion, 'id' | 'created_at' | 'updated_at'> = {
      question: questionText.trim(),
      subtitle: subtitle.trim(),
      options,
      sort_order: question.sort_order,
      is_active: question.is_active ?? true,
      is_default: question.is_default ?? false,
    }
    startT(async () => {
      if (isCreating) {
        await actionCreatePsychQuestion(payload)
        onSaved({ ...payload, id: crypto.randomUUID() })
      } else if (question.id) {
        await actionUpdatePsychQuestion(question.id, payload)
        onSaved({ ...question, ...payload })
      }
    })
  }

  function handleDelete() {
    if (!question.id) return
    startT(async () => {
      await actionDeletePsychQuestion(question.id!)
      onDeleted(question.id!)
    })
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-end sm:items-start justify-center sm:p-4 sm:pt-12 overflow-y-auto bg-black/75'
      role='dialog' aria-modal='true' aria-labelledby='qe-title'
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className='w-full sm:max-w-2xl bg-[#111] border border-zinc-700 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col'>
        <div className='flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-zinc-800 shrink-0'>
          <h2 id='qe-title' className='text-sm font-semibold'>
            {isCreating ? 'Tambah Pertanyaan Baru' : 'Edit Pertanyaan'}
          </h2>
          <button onClick={onClose} className='w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800' aria-label='Tutup'>
            <X className='w-4 h-4' aria-hidden='true' />
          </button>
        </div>

        <div className='overflow-y-auto flex-1 p-4 sm:p-5 space-y-4'>
          <div>
            <label htmlFor='qe-q' className='block text-xs text-zinc-500 font-medium mb-1.5'>
              Pertanyaan <span className='text-red-400'>*</span>
            </label>
            <input id='qe-q' className='form-input' value={questionText} onChange={e => setQuestionText(e.target.value)} placeholder='Contoh: Apakah kamu sudah cukup makan hari ini?' />
          </div>

          <div>
            <label htmlFor='qe-s' className='block text-xs text-zinc-500 font-medium mb-1.5'>Subtitle / Penjelasan (opsional)</label>
            <input id='qe-s' className='form-input' value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder='Konteks atau penjelasan tambahan...' />
          </div>

          <div>
            <div className='flex items-center justify-between mb-2'>
              <label className='block text-xs text-zinc-500 font-medium'>
                Pilihan Jawaban <span className='text-red-400'>*</span>
              </label>
              <button onClick={addOpt} disabled={options.length >= 6} className='text-xs text-blue-400 hover:text-blue-300 disabled:opacity-30 inline-flex items-center gap-1'>
                <Plus className='w-3 h-3' aria-hidden='true' /> Tambah Pilihan
              </button>
            </div>
            <ul className='space-y-2' role='list'>
              {options.map((opt, i) => (
                <li key={i} className='card-inner p-3 space-y-2'>
                  <div className='flex items-center gap-2'>
                    <span className='shrink-0 w-6 h-6 rounded bg-zinc-800 flex items-center justify-center mono text-xs text-zinc-500 font-semibold'>{i + 1}</span>
                    <input
                      type='text' value={opt.text}
                      onChange={e => updateOpt(i, { text: e.target.value })}
                      placeholder='Teks pilihan jawaban'
                      className='form-input flex-1'
                      aria-label={`Teks pilihan ${i + 1}`}
                    />
                    {options.length > 2 && (
                      <button onClick={() => removeOpt(i)} className='shrink-0 w-7 h-7 rounded flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-950' aria-label={`Hapus pilihan ${i + 1}`}>
                        <Trash2 className='w-3.5 h-3.5' aria-hidden='true' />
                      </button>
                    )}
                  </div>
                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <label className='block text-xs text-zinc-500 font-medium mb-1'>Score</label>
                      <input
                        type='number' value={opt.score}
                        onChange={e => updateOpt(i, { score: parseInt(e.target.value) || 0 })}
                        className='form-input mono' step='1'
                      />
                    </div>
                    <div>
                      <label className='block text-xs text-zinc-500 font-medium mb-1'>Level</label>
                      <select className='form-select' value={opt.level} onChange={e => updateOpt(i, { level: e.target.value as 'good' | 'warn' | 'bad' })}>
                        <option value='good'>Good (hijau)</option>
                        <option value='warn'>Warning (kuning)</option>
                        <option value='bad'>Bad (merah)</option>
                      </select>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className='text-xs text-zinc-600 mt-2'>
              <strong>Tip:</strong> Score positif (+1, +2, +3) untuk jawaban baik. Score negatif (-1, -2, -3) untuk jawaban buruk. Level menentukan warna highlight.
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2 px-4 sm:px-5 py-3 border-t border-zinc-800 shrink-0'>
          {!isCreating && question.id && (
            confirmDel ? (
              <>
                <button onClick={handleDelete} disabled={pending} className='px-3 py-2 bg-red-950 border border-red-700 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-900'>
                  Yakin hapus?
                </button>
                <button onClick={() => setConfirmDel(false)} className='px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300'>Batal</button>
              </>
            ) : (
              <button onClick={() => setConfirmDel(true)} className='inline-flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-500 hover:text-red-400 transition-colors rounded'>
                <Trash2 className='w-3.5 h-3.5' aria-hidden='true' /> Hapus
              </button>
            )
          )}
          <button onClick={handleSave} disabled={pending} className='ml-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-blue-950 border border-blue-700 text-blue-400 rounded-lg text-sm font-semibold hover:bg-blue-900 disabled:opacity-50'>
            {pending && <Loader2 className='w-3.5 h-3.5 animate-spin' aria-hidden='true' />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

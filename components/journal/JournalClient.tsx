'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, Search } from 'lucide-react'
import { actionSaveNote, actionDeleteNote } from '@/lib/actions'
import { MISTAKE_TAGS, GOOD_TAGS, MOOD_COLORS } from '@/lib/constants'
import { cn, formatPnl, pnlColor } from '@/lib/utils'
import type { DayNote, Mood, Tag } from '@/types'

const MOODS: Mood[] = ['Focused', 'Confident', 'Anxious', 'FOMO', 'Revenge']
const TODAY = new Date().toISOString().slice(0, 10)

type FilterMode = 'all' | 'mistakes' | 'wins' | 'losses'

interface Props {
  initialNotes: DayNote[]
  tradeByDate: Record<string, { pnl: number; count: number }>
  focusDate?: string
}

export default function JournalClient({ initialNotes, tradeByDate, focusDate }: Props) {
  const [notes, setNotes] = useState<DayNote[]>(initialNotes)
  const [editing, setEditing] = useState<DayNote | null>(null)
  const [creating, setCreating] = useState(false)
  const [filter, setFilter] = useState<FilterMode>('all')
  const [search, setSearch] = useState('')

  // Auto-open the focus date from query param
  useEffect(() => {
    if (focusDate) {
      const found = notes.find(n => n.note_date === focusDate)
      if (found) setEditing(found)
    }
  }, [focusDate, notes])

  function handleNew() {
    setCreating(true)
    setEditing({ note_date: TODAY, mood: null, analysis: '', execution: '', lesson: '', tags: [] })
  }

  function handleSaved(saved: DayNote) {
    setNotes(prev => {
      const idx = prev.findIndex(n => n.note_date === saved.note_date)
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next }
      return [saved, ...prev].sort((a, b) => b.note_date.localeCompare(a.note_date))
    })
    setEditing(null); setCreating(false)
  }

  function handleDeleted(date: string) {
    setNotes(prev => prev.filter(n => n.note_date !== date))
    setEditing(null)
  }

  const filtered = notes.filter(n => {
    const td = tradeByDate[n.note_date]
    if (filter === 'mistakes' && !n.tags.some(t => t.type === 'mistake')) return false
    if (filter === 'wins'     && (!td || td.pnl <= 0)) return false
    if (filter === 'losses'   && (!td || td.pnl >= 0)) return false
    if (search) {
      const q = search.toLowerCase()
      const hay = `${n.analysis} ${n.execution} ${n.lesson} ${n.tags.map(t => t.value).join(' ')}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  return (
    <>
      {/* Header actions */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600' aria-hidden='true' />
          <input
            type='text'
            placeholder='Cari analisa, lesson, tag...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='form-input pl-9'
            aria-label='Cari journal'
          />
        </div>
        <button onClick={handleNew} className='inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-950 border border-amber-700 text-amber-400 rounded-lg text-sm font-semibold hover:bg-amber-900 transition-all focus-visible:outline-2 focus-visible:outline-amber-500 shrink-0'>
          <Plus className='w-4 h-4' aria-hidden='true' />
          Tulis Journal Baru
        </button>
      </div>

      {/* Filter chips */}
      <div className='flex gap-1.5 flex-wrap' role='group' aria-label='Filter journal'>
        {([
          ['all',      `Semua (${notes.length})`],
          ['mistakes', `Ada Kesalahan (${notes.filter(n => n.tags.some(t => t.type === 'mistake')).length})`],
          ['wins',     `Win Days (${notes.filter(n => (tradeByDate[n.note_date]?.pnl ?? 0) > 0).length})`],
          ['losses',   `Loss Days (${notes.filter(n => (tradeByDate[n.note_date]?.pnl ?? 0) < 0).length})`],
        ] as [FilterMode, string][]).map(([k, label]) => (
          <button
            key={k} onClick={() => setFilter(k)} aria-pressed={filter === k}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all focus-visible:outline-2 focus-visible:outline-zinc-400',
              filter === k ? 'bg-zinc-700 border-zinc-500 text-zinc-100' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className='card p-8 sm:p-12 text-center'>
          <p className='text-zinc-400 font-medium'>
            {notes.length === 0 ? 'Belum ada journal entries' : 'Tidak ada journal yang cocok'}
          </p>
          <p className='text-xs text-zinc-600 mt-1'>
            {notes.length === 0 ? 'Klik "Tulis Journal Baru" untuk mulai' : 'Coba ubah filter atau kata kunci'}
          </p>
        </div>
      ) : (
        <ul className='space-y-3' role='list'>
          {filtered.map(note => {
            const td = tradeByDate[note.note_date]
            return (
              <li key={note.note_date}>
                <button
                  onClick={() => setEditing(note)}
                  className='card p-3 sm:p-4 w-full text-left space-y-3 hover:border-zinc-700 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <span className='mono text-xs sm:text-sm font-semibold text-zinc-200'>{note.note_date}</span>
                      {note.mood && <span className={cn('text-xs font-semibold', MOOD_COLORS[note.mood] || 'text-zinc-400')}>{note.mood}</span>}
                      {td && <span className='text-xs text-zinc-600'>{td.count} trade{td.count !== 1 ? 's' : ''}</span>}
                    </div>
                    {td && <span className={cn('mono text-xs sm:text-sm font-semibold shrink-0', pnlColor(td.pnl))}>{formatPnl(td.pnl)}</span>}
                  </div>
                  {note.analysis && <p className='text-sm text-zinc-400 leading-relaxed line-clamp-2'>{note.analysis}</p>}
                  {note.tags.length > 0 && (
                    <div className='flex flex-wrap gap-1.5'>
                      {note.tags.map((t, i) => (
                        <span key={i} className={cn('text-xs px-2 py-0.5 rounded font-medium', t.type === 'mistake' ? 'bg-red-950 text-red-400' : 'bg-green-950 text-green-400')}>
                          {t.value}
                        </span>
                      ))}
                    </div>
                  )}
                  {note.lesson && <p className='text-xs text-amber-400/80 italic border-l-2 border-amber-700 pl-3'>{note.lesson}</p>}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {editing && (
        <NoteEditor
          note={editing}
          isCreating={creating}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
          onClose={() => { setEditing(null); setCreating(false) }}
        />
      )}
    </>
  )
}

// ─── Editor Modal ──────────────────────────────────────────────

interface EditorProps {
  note: DayNote
  isCreating: boolean
  onSaved: (n: DayNote) => void
  onDeleted: (date: string) => void
  onClose: () => void
}

function NoteEditor({ note, isCreating, onSaved, onDeleted, onClose }: EditorProps) {
  const [date,      setDate]      = useState(note.note_date)
  const [mood,      setMood]      = useState<Mood | null>(note.mood)
  const [analysis,  setAnalysis]  = useState(note.analysis)
  const [execution, setExecution] = useState(note.execution)
  const [lesson,    setLesson]    = useState(note.lesson)
  const [tags,      setTags]      = useState<Tag[]>(note.tags)
  const [pending,   startT]       = useTransition()
  const [confirmDel, setConfirmDel] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey) }
  }, [onClose])

  function toggleTag(type: 'mistake' | 'good', value: string) {
    setTags(prev => prev.some(t => t.value === value) ? prev.filter(t => t.value !== value) : [...prev, { type, value }])
  }

  function handleSave() {
    const payload: Omit<DayNote, 'id' | 'updated_at'> = { note_date: date, mood, analysis, execution, lesson, tags }
    startT(async () => {
      await actionSaveNote(payload)
      onSaved({ ...payload, updated_at: new Date().toISOString() })
    })
  }

  function handleDelete() {
    startT(async () => {
      await actionDeleteNote(date)
      onDeleted(date)
    })
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-end sm:items-start justify-center sm:p-4 sm:pt-12 overflow-y-auto bg-black/75'
      role='dialog' aria-modal='true' aria-labelledby='editor-title'
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div ref={ref} className='w-full sm:max-w-2xl bg-[#111] border border-zinc-700 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col'>
        <div className='flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-zinc-800 shrink-0'>
          <h2 id='editor-title' className='text-sm font-semibold'>
            {isCreating ? 'Tulis Journal Baru' : 'Edit Journal'}
          </h2>
          <button onClick={onClose} className='w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all focus-visible:outline-2 focus-visible:outline-zinc-400' aria-label='Tutup editor'>
            <X className='w-4 h-4' aria-hidden='true' />
          </button>
        </div>

        <div className='overflow-y-auto flex-1 p-4 sm:p-5 space-y-4'>
          {/* Date picker */}
          <div>
            <label htmlFor='ne-date' className='block text-xs text-zinc-500 font-medium mb-1.5'>Tanggal</label>
            <input
              id='ne-date' type='date' className='form-input mono'
              value={date} onChange={e => setDate(e.target.value)}
              max={TODAY}
            />
          </div>

          {/* Mood */}
          <div>
            <p className='text-xs text-zinc-500 mb-2 font-medium'>Mindset hari ini</p>
            <div className='flex gap-1.5 flex-wrap' role='group' aria-label='Pilih mood'>
              {MOODS.map(m => (
                <button
                  key={m} onClick={() => setMood(mood === m ? null : m)} aria-pressed={mood === m}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all focus-visible:outline-2 focus-visible:outline-zinc-400',
                    mood === m ? 'bg-zinc-700 border-zinc-500 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor='ne-analysis' className='block text-xs text-zinc-500 font-medium mb-1'>Market Analysis &amp; Setup</label>
            <textarea id='ne-analysis' className='form-textarea' rows={4} placeholder='Bias, key levels, struktur, confluences...' value={analysis} onChange={e => setAnalysis(e.target.value)} />
          </div>

          <div>
            <label htmlFor='ne-execution' className='block text-xs text-zinc-500 font-medium mb-1'>Eksekusi — apa yang terjadi?</label>
            <textarea id='ne-execution' className='form-textarea' rows={3} placeholder='Follow plan? Entry timing? Yang berhasil/gagal...' value={execution} onChange={e => setExecution(e.target.value)} />
          </div>

          <div>
            <p className='text-xs text-zinc-500 font-medium mb-1.5'>Kesalahan hari ini</p>
            <div className='flex flex-wrap gap-1.5' role='group'>
              {MISTAKE_TAGS.map(v => (
                <button
                  key={v} onClick={() => toggleTag('mistake', v)} aria-pressed={tags.some(t => t.value === v)}
                  className={cn(
                    'px-2.5 py-1 rounded text-xs font-medium border transition-all focus-visible:outline-2 focus-visible:outline-red-500',
                    tags.some(t => t.value === v) ? 'bg-red-950 border-red-700 text-red-400' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className='text-xs text-zinc-500 font-medium mb-1.5'>Yang berjalan baik</p>
            <div className='flex flex-wrap gap-1.5' role='group'>
              {GOOD_TAGS.map(v => (
                <button
                  key={v} onClick={() => toggleTag('good', v)} aria-pressed={tags.some(t => t.value === v)}
                  className={cn(
                    'px-2.5 py-1 rounded text-xs font-medium border transition-all focus-visible:outline-2 focus-visible:outline-green-500',
                    tags.some(t => t.value === v) ? 'bg-green-950 border-green-700 text-green-400' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor='ne-lesson' className='block text-xs text-zinc-500 font-medium mb-1'>Key Lesson untuk Besok</label>
            <textarea id='ne-lesson' className='form-textarea' rows={2} placeholder='Apa yang akan kamu lakukan berbeda besok?' value={lesson} onChange={e => setLesson(e.target.value)} />
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center gap-2 px-4 sm:px-5 py-3 border-t border-zinc-800 shrink-0'>
          {!isCreating && (
            confirmDel ? (
              <>
                <button onClick={handleDelete} disabled={pending} className='px-3 py-2 bg-red-950 border border-red-700 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-900'>
                  Yakin hapus?
                </button>
                <button onClick={() => setConfirmDel(false)} className='px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300'>Batal</button>
              </>
            ) : (
              <button onClick={() => setConfirmDel(true)} className='inline-flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-500 hover:text-red-400 transition-colors focus-visible:outline-2 focus-visible:outline-red-500 rounded'>
                <Trash2 className='w-3.5 h-3.5' aria-hidden='true' /> Hapus
              </button>
            )
          )}
          <button onClick={handleSave} disabled={pending} className='ml-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-amber-950 border border-amber-700 text-amber-400 rounded-lg text-sm font-semibold hover:bg-amber-900 transition-all focus-visible:outline-2 focus-visible:outline-amber-500 disabled:opacity-50'>
            {pending && <Loader2 className='w-3.5 h-3.5 animate-spin' aria-hidden='true' />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useTransition, useEffect } from 'react'
import { X, Plus, Trash2, Loader2, Star } from 'lucide-react'
import { actionCreateLesson, actionUpdateLesson, actionDeleteLesson } from '@/lib/lesson-actions'
import { cn } from '@/lib/utils'
import type { Lesson, SourceType, Highlight } from '@/types'

const SOURCE_TYPES: { value: SourceType; label: string }[] = [
  { value: 'youtube', label: 'YouTube'   },
  { value: 'book',    label: 'Buku'      },
  { value: 'podcast', label: 'Podcast'   },
  { value: 'article', label: 'Artikel'   },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'course',  label: 'Course'    },
  { value: 'other',   label: 'Lainnya'   },
]

interface Props {
  lesson:     Lesson
  isCreating: boolean
  onSaved:    (l: Lesson) => void
  onDeleted:  (id: string) => void
  onClose:    () => void
}

export default function LessonEditor({ lesson, isCreating, onSaved, onDeleted, onClose }: Props) {
  const [sourceType, setSourceType] = useState<SourceType>(lesson.source_type)
  const [sourceName, setSourceName] = useState(lesson.source_name)
  const [sourceUrl,  setSourceUrl]  = useState(lesson.source_url ?? '')
  const [title,      setTitle]      = useState(lesson.title)
  const [summary,    setSummary]    = useState(lesson.summary)
  const [highlights, setHighlights] = useState<Highlight[]>(lesson.highlights.length ? lesson.highlights : [])
  const [highlightInput, setHighlightInput] = useState('')
  const [highlightTime,  setHighlightTime]  = useState('')
  const [myNotes,    setMyNotes]    = useState(lesson.my_notes)
  const [takeaway,   setTakeaway]   = useState(lesson.takeaway)
  const [tags,       setTags]       = useState<string[]>(lesson.tags)
  const [tagInput,   setTagInput]   = useState('')
  const [rating,     setRating]     = useState(lesson.rating)
  const [isFavorite, setIsFavorite] = useState(lesson.is_favorite)
  const [dateConsumed, setDateConsumed] = useState(lesson.date_consumed ?? '')
  const [durationMin,  setDurationMin]  = useState(lesson.duration_min ? String(lesson.duration_min) : '')
  const [confirmDel, setConfirmDel] = useState(false)
  const [pending, startT] = useTransition()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey) }
  }, [onClose])

  function addHighlight() {
    const text = highlightInput.trim()
    if (!text) return
    setHighlights([...highlights, { text, timestamp: highlightTime.trim() || undefined }])
    setHighlightInput(''); setHighlightTime('')
  }

  function removeHighlight(i: number) {
    setHighlights(highlights.filter((_, idx) => idx !== i))
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (!t || tags.includes(t)) { setTagInput(''); return }
    setTags([...tags, t])
    setTagInput('')
  }

  function removeTag(t: string) {
    setTags(tags.filter(x => x !== t))
  }

  function handleSave() {
    if (!title.trim())      { alert('Judul tidak boleh kosong'); return }
    if (!sourceName.trim()) { alert('Sumber (nama channel/penulis) tidak boleh kosong'); return }

    const payload: Omit<Lesson, 'id' | 'created_at' | 'updated_at'> = {
      source_type:   sourceType,
      source_name:   sourceName.trim(),
      source_url:    sourceUrl.trim() || null,
      title:         title.trim(),
      summary:       summary.trim(),
      highlights,
      my_notes:      myNotes.trim(),
      takeaway:      takeaway.trim(),
      tags,
      rating,
      is_favorite:   isFavorite,
      date_consumed: dateConsumed || null,
      duration_min:  durationMin ? parseInt(durationMin) : null,
    }

    startT(async () => {
      try {
        if (isCreating) {
          const created = await actionCreateLesson(payload)
          onSaved(created)
        } else if (lesson.id) {
          const updated = await actionUpdateLesson(lesson.id, payload)
          onSaved(updated)
        }
      } catch (e) {
        alert('Gagal menyimpan: ' + (e as Error).message)
      }
    })
  }

  function handleDelete() {
    if (!lesson.id) return
    startT(async () => {
      await actionDeleteLesson(lesson.id!)
      onDeleted(lesson.id!)
    })
  }

  return (
    <div
      className='fixed inset-0 z-[60] flex items-end sm:items-start justify-center sm:p-4 sm:pt-12 overflow-y-auto bg-black/75'
      role='dialog' aria-modal='true' aria-labelledby='le-title'
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className='w-full sm:max-w-3xl bg-[#111] border border-zinc-700 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col'>
        <div className='flex items-center justify-between gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-zinc-800 shrink-0'>
          <h2 id='le-title' className='text-sm font-semibold'>
            {isCreating ? 'Tambah Pelajaran Baru' : 'Edit Pelajaran'}
          </h2>
          <button onClick={onClose} className='w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all focus-visible:outline-2 focus-visible:outline-zinc-400' aria-label='Tutup'>
            <X className='w-4 h-4' aria-hidden='true' />
          </button>
        </div>

        <div className='overflow-y-auto flex-1 p-4 sm:p-5 space-y-5'>
          {/* SOURCE INFO */}
          <fieldset className='space-y-3'>
            <legend className='text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1'>Sumber</legend>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
              <div>
                <label htmlFor='le-st' className='block text-xs text-zinc-500 font-medium mb-1.5'>Tipe Sumber</label>
                <select id='le-st' className='form-select' value={sourceType} onChange={e => setSourceType(e.target.value as SourceType)}>
                  {SOURCE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className='sm:col-span-2'>
                <label htmlFor='le-sn' className='block text-xs text-zinc-500 font-medium mb-1.5'>
                  Nama Sumber <span className='text-red-400'>*</span>
                </label>
                <input id='le-sn' className='form-input' value={sourceName} onChange={e => setSourceName(e.target.value)}
                  placeholder='Nama channel YouTube / penulis buku / host podcast' />
              </div>
            </div>

            <div>
              <label htmlFor='le-url' className='block text-xs text-zinc-500 font-medium mb-1.5'>URL (opsional)</label>
              <input id='le-url' type='url' className='form-input mono' value={sourceUrl} onChange={e => setSourceUrl(e.target.value)}
                placeholder='https://youtube.com/watch?v=... / https://amazon.com/...' />
            </div>

            <div>
              <label htmlFor='le-title' className='block text-xs text-zinc-500 font-medium mb-1.5'>
                Judul <span className='text-red-400'>*</span>
              </label>
              <input id='le-title' className='form-input' value={title} onChange={e => setTitle(e.target.value)}
                placeholder='Judul video / chapter buku / episode podcast' />
            </div>
          </fieldset>

          {/* CONTENT */}
          <fieldset className='space-y-3'>
            <legend className='text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1'>Konten</legend>

            <div>
              <label htmlFor='le-take' className='block text-xs text-amber-400 font-medium mb-1.5'>
                💡 Key Takeaway / Actionable Insight
              </label>
              <textarea id='le-take' className='form-textarea' rows={2}
                placeholder='Satu pelajaran utama yang bisa langsung kamu apply...'
                value={takeaway} onChange={e => setTakeaway(e.target.value)} />
            </div>

            <div>
              <label htmlFor='le-sum' className='block text-xs text-zinc-500 font-medium mb-1.5'>Ringkasan</label>
              <textarea id='le-sum' className='form-textarea' rows={3}
                placeholder='Ringkasan singkat tentang konten...'
                value={summary} onChange={e => setSummary(e.target.value)} />
            </div>

            {/* Highlights */}
            <div>
              <p className='text-xs text-zinc-500 font-medium mb-1.5'>Highlights / Quotes</p>
              <div className='card-inner p-3 space-y-2'>
                <div className='grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2'>
                  <input
                    type='text' className='form-input'
                    placeholder='Quote atau poin penting...'
                    value={highlightInput}
                    onChange={e => setHighlightInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addHighlight() } }}
                  />
                  <input
                    type='text' className='form-input mono w-full sm:w-24'
                    placeholder='12:45 / p.42'
                    value={highlightTime}
                    onChange={e => setHighlightTime(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addHighlight() } }}
                    aria-label='Timestamp atau halaman'
                  />
                  <button type='button' onClick={addHighlight}
                    className='px-3 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-medium hover:bg-zinc-700 transition-all inline-flex items-center justify-center gap-1'>
                    <Plus className='w-3.5 h-3.5' aria-hidden='true' /> Add
                  </button>
                </div>

                {highlights.length > 0 && (
                  <ul className='space-y-1.5' role='list'>
                    {highlights.map((h, i) => (
                      <li key={i} className='flex gap-2 items-start p-2 rounded bg-zinc-900 border border-zinc-800'>
                        <span className='shrink-0 mono text-xs text-zinc-500'>#{i + 1}</span>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm text-zinc-200 leading-relaxed'>{h.text}</p>
                          {h.timestamp && <p className='text-xs text-zinc-600 mono mt-0.5'>⏱ {h.timestamp}</p>}
                        </div>
                        <button type='button' onClick={() => removeHighlight(i)}
                          className='shrink-0 w-6 h-6 rounded flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-950'
                          aria-label='Hapus highlight'>
                          <Trash2 className='w-3 h-3' aria-hidden='true' />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div>
              <label htmlFor='le-notes' className='block text-xs text-zinc-500 font-medium mb-1.5'>My Notes (catatan personal)</label>
              <textarea id='le-notes' className='form-textarea' rows={3}
                placeholder='Catatan pribadi: bagaimana ini relate dengan trading kamu? Apa yang kamu setujui/tidak setujui?'
                value={myNotes} onChange={e => setMyNotes(e.target.value)} />
            </div>
          </fieldset>

          {/* META */}
          <fieldset className='space-y-3'>
            <legend className='text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1'>Categorization</legend>

            {/* Tags */}
            <div>
              <label htmlFor='le-tag' className='block text-xs text-zinc-500 font-medium mb-1.5'>
                Tags <span className='text-zinc-700'>(mis: scalping, risk-mgmt, psychology)</span>
              </label>
              <div className='flex gap-2'>
                <input id='le-tag' type='text' className='form-input flex-1'
                  placeholder='Tambah tag, lalu Enter'
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} />
                <button type='button' onClick={addTag}
                  className='px-3 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-medium hover:bg-zinc-700 inline-flex items-center gap-1 shrink-0'>
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

            {/* Rating + Favorite */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <p className='text-xs text-zinc-500 font-medium mb-1.5'>Rating</p>
                <div className='flex items-center gap-1'>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type='button' onClick={() => setRating(rating === n ? 0 : n)}
                      className='p-1 focus-visible:outline-2 focus-visible:outline-amber-500 rounded'
                      aria-label={`Rating ${n} bintang`}>
                      <Star className='w-5 h-5'
                        fill={n <= rating ? '#f59e0b' : 'none'}
                        stroke={n <= rating ? '#f59e0b' : '#52525b'}
                        aria-hidden='true' />
                    </button>
                  ))}
                  {rating > 0 && (
                    <button type='button' onClick={() => setRating(0)}
                      className='ml-2 text-xs text-zinc-500 hover:text-zinc-300'>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div>
                <p className='text-xs text-zinc-500 font-medium mb-1.5'>Favorit</p>
                <button type='button' onClick={() => setIsFavorite(!isFavorite)}
                  aria-pressed={isFavorite}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all',
                    isFavorite
                      ? 'bg-amber-950 border-amber-600 text-amber-400'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300'
                  )}>
                  <Star className='w-4 h-4' fill={isFavorite ? 'currentColor' : 'none'} aria-hidden='true' />
                  {isFavorite ? 'Difavoritkan' : 'Tandai favorit'}
                </button>
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label htmlFor='le-date' className='block text-xs text-zinc-500 font-medium mb-1.5'>Tanggal Konsumsi</label>
                <input id='le-date' type='date' className='form-input mono' value={dateConsumed} onChange={e => setDateConsumed(e.target.value)} />
              </div>
              <div>
                <label htmlFor='le-dur' className='block text-xs text-zinc-500 font-medium mb-1.5'>Durasi (menit, opsional)</label>
                <input id='le-dur' type='number' className='form-input' min='1' value={durationMin} onChange={e => setDurationMin(e.target.value)} placeholder='30' />
              </div>
            </div>
          </fieldset>
        </div>

        {/* Footer */}
        <div className='flex items-center gap-2 px-4 sm:px-5 py-3 border-t border-zinc-800 shrink-0'>
          {!isCreating && lesson.id && (
            confirmDel ? (
              <>
                <button onClick={handleDelete} disabled={pending}
                  className='px-3 py-2 bg-red-950 border border-red-700 text-red-400 rounded-lg text-xs font-semibold hover:bg-red-900'>
                  Yakin hapus?
                </button>
                <button onClick={() => setConfirmDel(false)} className='px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300'>Batal</button>
              </>
            ) : (
              <button onClick={() => setConfirmDel(true)}
                className='inline-flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-500 hover:text-red-400 transition-colors rounded'>
                <Trash2 className='w-3.5 h-3.5' aria-hidden='true' /> Hapus
              </button>
            )
          )}
          <button onClick={handleSave} disabled={pending}
            className='ml-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-blue-950 border border-blue-700 text-blue-400 rounded-lg text-sm font-semibold hover:bg-blue-900 disabled:opacity-50'>
            {pending && <Loader2 className='w-3.5 h-3.5 animate-spin' aria-hidden='true' />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Star, BookOpen, Youtube, Mic, Newspaper, Twitter, GraduationCap, Sparkles } from 'lucide-react'
import { actionToggleLessonFavorite } from '@/lib/lesson-actions'
import { cn } from '@/lib/utils'
import type { Lesson, SourceType } from '@/types'
import LessonEditor from './LessonEditor'
import LessonDetail from './LessonDetail'

const SOURCE_META: Record<SourceType, { label: string; icon: React.ComponentType<any>; cls: string }> = {
  youtube: { label: 'YouTube',  icon: Youtube,        cls: 'bg-red-950 text-red-400 border-red-900' },
  book:    { label: 'Book',     icon: BookOpen,       cls: 'bg-amber-950 text-amber-400 border-amber-900' },
  podcast: { label: 'Podcast',  icon: Mic,            cls: 'bg-purple-950 text-purple-400 border-purple-900' },
  article: { label: 'Article',  icon: Newspaper,      cls: 'bg-blue-950 text-blue-400 border-blue-900' },
  twitter: { label: 'Twitter/X',icon: Twitter,        cls: 'bg-sky-950 text-sky-400 border-sky-900' },
  course:  { label: 'Course',   icon: GraduationCap,  cls: 'bg-green-950 text-green-400 border-green-900' },
  other:   { label: 'Other',    icon: Sparkles,       cls: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
}

type Filter = 'all' | 'favorites' | SourceType

interface Props {
  initialLessons: Lesson[]
  focusId?: string
  focusSource?: string
  focusTag?: string
}

export default function LessonsClient({ initialLessons, focusId, focusSource, focusTag }: Props) {
  const [lessons,   setLessons]   = useState<Lesson[]>(initialLessons)
  const [editing,   setEditing]   = useState<Lesson | null>(null)
  const [creating,  setCreating]  = useState(false)
  const [viewing,   setViewing]   = useState<Lesson | null>(null)
  const [filter,    setFilter]    = useState<Filter>(
    focusSource && SOURCE_META[focusSource as SourceType] ? (focusSource as SourceType) : 'all'
  )
  const [tagFilter, setTagFilter] = useState<string | null>(focusTag ?? null)
  const [search,    setSearch]    = useState('')

  // Auto-open lesson detail if focusId provided
  useEffect(() => {
    if (focusId) {
      const found = lessons.find(l => l.id === focusId)
      if (found) setViewing(found)
    }
  }, [focusId, lessons])

  // All unique tags for filter chips
  const allTags = useMemo(() => {
    const set = new Set<string>()
    lessons.forEach(l => l.tags.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [lessons])

  // Source counts
  const sourceCounts = useMemo(() => {
    const counts: Record<string, number> = { all: lessons.length, favorites: lessons.filter(l => l.is_favorite).length }
    Object.keys(SOURCE_META).forEach(k => {
      counts[k] = lessons.filter(l => l.source_type === k).length
    })
    return counts
  }, [lessons])

  const filtered = useMemo(() => lessons.filter(l => {
    if (filter === 'favorites' && !l.is_favorite) return false
    if (filter !== 'all' && filter !== 'favorites' && l.source_type !== filter) return false
    if (tagFilter && !l.tags.includes(tagFilter)) return false
    if (search) {
      const q = search.toLowerCase()
      const hay = `${l.title} ${l.source_name} ${l.summary} ${l.takeaway} ${l.my_notes} ${l.tags.join(' ')} ${l.highlights.map(h => h.text).join(' ')}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  }), [lessons, filter, tagFilter, search])

  function handleNew() {
    setCreating(true)
    setEditing({
      source_type: 'youtube',
      source_name: '',
      source_url:  null,
      title:       '',
      summary:     '',
      highlights:  [],
      my_notes:    '',
      takeaway:    '',
      tags:        [],
      rating:      0,
      is_favorite: false,
      date_consumed: new Date().toISOString().slice(0, 10),
      duration_min: null,
    })
  }

  function handleSaved(saved: Lesson) {
    setLessons(prev => {
      const idx = prev.findIndex(l => l.id === saved.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next }
      return [saved, ...prev]
    })
    setEditing(null); setCreating(false)
    if (viewing?.id === saved.id) setViewing(saved)
  }

  function handleDeleted(id: string) {
    setLessons(prev => prev.filter(l => l.id !== id))
    setEditing(null); setViewing(null)
  }

  function toggleFavorite(l: Lesson) {
    if (!l.id) return
    const newState = !l.is_favorite
    setLessons(prev => prev.map(item => item.id === l.id ? { ...item, is_favorite: newState } : item))
    if (viewing?.id === l.id) setViewing({ ...l, is_favorite: newState })
    actionToggleLessonFavorite(l.id, newState).catch(() => {
      setLessons(prev => prev.map(item => item.id === l.id ? { ...item, is_favorite: !newState } : item))
    })
  }

  return (
    <>
      {/* Top bar */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search className='w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600' aria-hidden='true' />
          <input
            type='text' placeholder='Cari judul, sumber, highlight, atau notes...'
            value={search} onChange={e => setSearch(e.target.value)}
            className='form-input pl-9' aria-label='Cari pelajaran'
          />
        </div>
        <button onClick={handleNew}
          className='inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-950 border border-blue-700 text-blue-400 rounded-lg text-sm font-semibold hover:bg-blue-900 transition-all focus-visible:outline-2 focus-visible:outline-blue-500 shrink-0'>
          <Plus className='w-4 h-4' aria-hidden='true' />
          Tambah Pelajaran
        </button>
      </div>

      {/* Source filter chips */}
      <div className='flex gap-1.5 flex-wrap items-center' role='group' aria-label='Filter sumber'>
        <FilterChip active={filter === 'all'}       onClick={() => setFilter('all')}>
          Semua ({sourceCounts.all})
        </FilterChip>
        <FilterChip active={filter === 'favorites'} onClick={() => setFilter('favorites')} variant='favorite'>
          <Star className='w-3 h-3' fill={filter === 'favorites' ? 'currentColor' : 'none'} aria-hidden='true' />
          Favorit ({sourceCounts.favorites})
        </FilterChip>
        {(Object.keys(SOURCE_META) as SourceType[]).filter(s => sourceCounts[s] > 0).map(s => {
          const meta  = SOURCE_META[s]
          const Icon  = meta.icon
          const active = filter === s
          return (
            <FilterChip key={s} active={active} onClick={() => setFilter(s)}>
              <Icon className='w-3 h-3' aria-hidden='true' />
              {meta.label} ({sourceCounts[s]})
            </FilterChip>
          )
        })}
      </div>

      {/* Tag filter row (kalau ada) */}
      {allTags.length > 0 && (
        <div className='flex gap-1.5 flex-wrap items-center'>
          <span className='text-xs text-zinc-500 font-medium'>Tag:</span>
          <button
            onClick={() => setTagFilter(null)}
            className={cn(
              'text-xs px-2 py-0.5 rounded font-medium transition-all',
              !tagFilter ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            Semua
          </button>
          {allTags.map(tag => (
            <button
              key={tag} onClick={() => setTagFilter(tag === tagFilter ? null : tag)}
              className={cn(
                'text-xs px-2 py-0.5 rounded font-medium border transition-all',
                tag === tagFilter
                  ? 'bg-blue-950 text-blue-300 border-blue-700'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-zinc-200 hover:border-zinc-600'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className='card p-8 sm:p-12 text-center'>
          {lessons.length === 0 ? (
            <>
              <Sparkles className='w-10 h-10 text-zinc-600 mx-auto mb-3' aria-hidden='true' />
              <p className='text-zinc-400 font-medium'>Belum ada pelajaran tercatat</p>
              <p className='text-xs text-zinc-600 mt-1 max-w-md mx-auto'>
                Catat insight dari video YouTube favorit, buku trading, podcast, atau artikel — agar bisa kamu baca kembali sebelum trading
              </p>
            </>
          ) : (
            <>
              <p className='text-zinc-400 font-medium'>Tidak ada hasil</p>
              <p className='text-xs text-zinc-600 mt-1'>Coba ubah filter atau kata kunci</p>
            </>
          )}
        </div>
      ) : (
        <ul className='grid grid-cols-1 md:grid-cols-2 gap-3' role='list'>
          {filtered.map(lesson => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onView={() => setViewing(lesson)}
              onToggleFav={() => toggleFavorite(lesson)}
            />
          ))}
        </ul>
      )}

      {/* Modals */}
      {viewing && !editing && (
        <LessonDetail
          lesson={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => setEditing(viewing)}
          onToggleFav={() => toggleFavorite(viewing)}
          onTagClick={(tag) => { setTagFilter(tag); setViewing(null) }}
        />
      )}

      {editing && (
        <LessonEditor
          lesson={editing}
          isCreating={creating}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
          onClose={() => { setEditing(null); setCreating(false) }}
        />
      )}
    </>
  )
}

// ─── Sub-components ──────────────────────────────────────────

function FilterChip({ children, active, onClick, variant }: {
  children: React.ReactNode; active: boolean; onClick: () => void; variant?: 'favorite'
}) {
  return (
    <button
      onClick={onClick} aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all focus-visible:outline-2 focus-visible:outline-zinc-400',
        active
          ? variant === 'favorite' ? 'bg-amber-950 border-amber-600 text-amber-400' : 'bg-zinc-700 border-zinc-500 text-zinc-100'
          : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300'
      )}
    >
      {children}
    </button>
  )
}

function LessonCard({ lesson, onView, onToggleFav }: { lesson: Lesson; onView: () => void; onToggleFav: () => void }) {
  const meta = SOURCE_META[lesson.source_type]
  const Icon = meta.icon

  return (
    <li>
      <article className='card p-3 sm:p-4 h-full hover:border-zinc-700 transition-colors flex flex-col'>
        <div className='flex items-start justify-between gap-2 mb-2'>
          <div className='flex items-center gap-2 min-w-0 flex-wrap'>
            <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border shrink-0', meta.cls)}>
              <Icon className='w-3 h-3' aria-hidden='true' />
              {meta.label}
            </span>
            <span className='text-xs text-zinc-500 truncate'>{lesson.source_name}</span>
          </div>
          <button
            onClick={onToggleFav}
            className={cn(
              'shrink-0 w-7 h-7 rounded flex items-center justify-center transition-all focus-visible:outline-2 focus-visible:outline-amber-500',
              lesson.is_favorite ? 'text-amber-400 hover:text-amber-300' : 'text-zinc-600 hover:text-amber-400'
            )}
            aria-label={lesson.is_favorite ? 'Unfavorite' : 'Favorite'}
            aria-pressed={lesson.is_favorite}
          >
            <Star className='w-4 h-4' fill={lesson.is_favorite ? 'currentColor' : 'none'} aria-hidden='true' />
          </button>
        </div>

        <button onClick={onView} className='text-left flex-1 focus-visible:outline-2 focus-visible:outline-blue-500 rounded'>
          <h3 className='text-sm font-semibold text-zinc-100 mb-1 line-clamp-2'>{lesson.title}</h3>

          {lesson.takeaway && (
            <p className='text-xs text-amber-400/90 italic border-l-2 border-amber-700 pl-2.5 my-2 line-clamp-2'>
              💡 {lesson.takeaway}
            </p>
          )}

          {!lesson.takeaway && lesson.summary && (
            <p className='text-xs text-zinc-400 leading-relaxed line-clamp-3'>{lesson.summary}</p>
          )}
        </button>

        <div className='flex items-center justify-between gap-2 mt-3 pt-3 border-t border-zinc-800'>
          {lesson.rating > 0 ? (
            <span className='inline-flex items-center gap-0.5'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className='w-3 h-3' fill={i < lesson.rating ? '#f59e0b' : 'none'} stroke={i < lesson.rating ? '#f59e0b' : '#52525b'} aria-hidden='true' />
              ))}
            </span>
          ) : (
            <span className='text-xs text-zinc-600'>{lesson.highlights.length} highlights</span>
          )}

          {lesson.tags.length > 0 && (
            <div className='flex gap-1 flex-wrap items-center justify-end'>
              {lesson.tags.slice(0, 3).map(t => (
                <span key={t} className='text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700'>{t}</span>
              ))}
              {lesson.tags.length > 3 && (
                <span className='text-xs text-zinc-600'>+{lesson.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </article>
    </li>
  )
}

'use client'

import { useEffect, useRef } from 'react'
import {
  X, Star, Pencil, ExternalLink, BookOpen, Youtube, Mic, Newspaper, Twitter,
  GraduationCap, Sparkles, Calendar, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Lesson, SourceType } from '@/types'

const SOURCE_META: Record<SourceType, { label: string; icon: React.ComponentType<any>; cls: string }> = {
  youtube: { label: 'YouTube',  icon: Youtube,        cls: 'bg-red-950 text-red-400 border-red-900' },
  book:    { label: 'Book',     icon: BookOpen,       cls: 'bg-amber-950 text-amber-400 border-amber-900' },
  podcast: { label: 'Podcast',  icon: Mic,            cls: 'bg-purple-950 text-purple-400 border-purple-900' },
  article: { label: 'Article',  icon: Newspaper,      cls: 'bg-blue-950 text-blue-400 border-blue-900' },
  twitter: { label: 'Twitter/X',icon: Twitter,        cls: 'bg-sky-950 text-sky-400 border-sky-900' },
  course:  { label: 'Course',   icon: GraduationCap,  cls: 'bg-green-950 text-green-400 border-green-900' },
  other:   { label: 'Other',    icon: Sparkles,       cls: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
}

interface Props {
  lesson:      Lesson
  onClose:     () => void
  onEdit:      () => void
  onToggleFav: () => void
  onTagClick:  (tag: string) => void
}

export default function LessonDetail({ lesson, onClose, onEdit, onToggleFav, onTagClick }: Props) {
  const meta = SOURCE_META[lesson.source_type]
  const Icon = meta.icon
  const ref  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey) }
  }, [onClose])

  return (
    <div
      className='fixed inset-0 z-50 flex items-end sm:items-start justify-center sm:p-4 sm:pt-12 overflow-y-auto bg-black/75'
      role='dialog' aria-modal='true' aria-labelledby='detail-title'
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div ref={ref} className='w-full sm:max-w-2xl bg-[#111] border border-zinc-700 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-zinc-800 shrink-0'>
          <div className='flex items-center gap-2 min-w-0'>
            <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border shrink-0', meta.cls)}>
              <Icon className='w-3 h-3' aria-hidden='true' />
              {meta.label}
            </span>
            <span className='text-xs text-zinc-500 truncate'>{lesson.source_name}</span>
          </div>
          <div className='flex items-center gap-1 shrink-0'>
            <button onClick={onToggleFav}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all focus-visible:outline-2 focus-visible:outline-amber-500',
                lesson.is_favorite ? 'text-amber-400' : 'text-zinc-500 hover:text-amber-400'
              )}
              aria-label={lesson.is_favorite ? 'Unfavorite' : 'Favorite'}
            >
              <Star className='w-4 h-4' fill={lesson.is_favorite ? 'currentColor' : 'none'} aria-hidden='true' />
            </button>
            <button onClick={onEdit}
              className='w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-blue-400 hover:bg-blue-950 transition-all focus-visible:outline-2 focus-visible:outline-blue-500'
              aria-label='Edit pelajaran'
            >
              <Pencil className='w-4 h-4' aria-hidden='true' />
            </button>
            <button onClick={onClose}
              className='w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all focus-visible:outline-2 focus-visible:outline-zinc-400'
              aria-label='Tutup'
            >
              <X className='w-4 h-4' aria-hidden='true' />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='overflow-y-auto flex-1 p-4 sm:p-5 space-y-4'>
          {/* Title + Rating */}
          <div>
            <h1 id='detail-title' className='text-base sm:text-lg font-bold text-zinc-100 mb-2'>{lesson.title}</h1>

            <div className='flex flex-wrap items-center gap-3 text-xs text-zinc-500'>
              {lesson.rating > 0 && (
                <span className='inline-flex items-center gap-0.5'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className='w-3.5 h-3.5'
                      fill={i < lesson.rating ? '#f59e0b' : 'none'}
                      stroke={i < lesson.rating ? '#f59e0b' : '#52525b'}
                      aria-hidden='true' />
                  ))}
                </span>
              )}
              {lesson.date_consumed && (
                <span className='inline-flex items-center gap-1'>
                  <Calendar className='w-3 h-3' aria-hidden='true' />
                  {lesson.date_consumed}
                </span>
              )}
              {lesson.duration_min && (
                <span className='inline-flex items-center gap-1'>
                  <Clock className='w-3 h-3' aria-hidden='true' />
                  {lesson.duration_min} min
                </span>
              )}
              {lesson.source_url && (
                <a href={lesson.source_url} target='_blank' rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 text-blue-400 hover:text-blue-300'>
                  <ExternalLink className='w-3 h-3' aria-hidden='true' />
                  Buka sumber
                </a>
              )}
            </div>
          </div>

          {/* Takeaway — paling penting, ditampilkan duluan */}
          {lesson.takeaway && (
            <div className='p-4 rounded-lg bg-amber-950/30 border border-amber-900'>
              <p className='text-xs font-semibold text-amber-400 mb-1.5 uppercase tracking-wide'>💡 Key Takeaway</p>
              <p className='text-sm text-amber-100 leading-relaxed whitespace-pre-wrap'>{lesson.takeaway}</p>
            </div>
          )}

          {/* Summary */}
          {lesson.summary && (
            <div>
              <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2'>Ringkasan</h2>
              <p className='text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap'>{lesson.summary}</p>
            </div>
          )}

          {/* Highlights */}
          {lesson.highlights.length > 0 && (
            <div>
              <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2'>
                Highlights ({lesson.highlights.length})
              </h2>
              <ul className='space-y-2' role='list'>
                {lesson.highlights.map((h, i) => (
                  <li key={i} className='flex gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800'>
                    <span className='shrink-0 w-6 h-6 rounded bg-zinc-800 flex items-center justify-center mono text-xs text-zinc-500 font-semibold'>
                      {i + 1}
                    </span>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm text-zinc-200 leading-relaxed'>{h.text}</p>
                      {h.timestamp && (
                        <p className='text-xs text-zinc-600 mono mt-1'>⏱ {h.timestamp}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* My Notes */}
          {lesson.my_notes && (
            <div>
              <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2'>My Notes</h2>
              <div className='p-3 rounded-lg bg-zinc-900 border border-zinc-800'>
                <p className='text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap'>{lesson.my_notes}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {lesson.tags.length > 0 && (
            <div>
              <h2 className='text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2'>Tags</h2>
              <div className='flex flex-wrap gap-1.5'>
                {lesson.tags.map(t => (
                  <button
                    key={t} onClick={() => onTagClick(t)}
                    className='text-xs px-2 py-0.5 rounded font-medium bg-blue-950 text-blue-400 border border-blue-900 hover:bg-blue-900 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500'
                    title={`Filter by tag: ${t}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

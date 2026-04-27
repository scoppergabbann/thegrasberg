
'use client'
import { useState, useTransition } from 'react'
import { Pencil, Loader2 } from 'lucide-react'
import { actionSaveNote } from '@/lib/actions'
import { MISTAKE_TAGS, GOOD_TAGS, MOOD_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { DayNote, Mood, Tag } from '@/types'

const MOODS: Mood[] = ['Focused','Confident','Anxious','FOMO','Revenge']

interface Props { year:number; month:number; day:number; existing:DayNote|null }

export default function JournalPanel({ year, month, day, existing }: Props) {
  const [editing,   setEditing]   = useState(!existing)
  const [saved,     setSaved]     = useState<DayNote|null>(existing)
  const [mood,      setMood]      = useState<Mood|null>(existing?.mood||null)
  const [analysis,  setAnalysis]  = useState(existing?.analysis||'')
  const [execution, setExecution] = useState(existing?.execution||'')
  const [lesson,    setLesson]    = useState(existing?.lesson||'')
  const [tags,      setTags]      = useState<Tag[]>(existing?.tags||[])
  const [pending,   startT]       = useTransition()
  const note_date = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`

  function toggleTag(type:'mistake'|'good', value:string) {
    setTags(p => p.some(t=>t.value===value) ? p.filter(t=>t.value!==value) : [...p,{type,value}])
  }

  async function handleSave() {
    const note: Omit<DayNote,'id'|'updated_at'> = { note_date, mood, analysis, execution, lesson, tags }
    setSaved({...note})
    setEditing(false)
    startT(async () => { await actionSaveNote(note) })
  }

  const display = saved

  if (!editing && display) {
    return (
      <div className='p-5 space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-xs font-semibold text-zinc-400'>Journal Entry {pending && <span className='text-zinc-600 text-xs'>(menyimpan...)</span>}</h3>
          <button onClick={()=>setEditing(true)} className='flex items-center gap-1 text-xs text-zinc-500 hover:text-amber-400 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500 rounded px-2 py-1'>
            <Pencil className='w-3 h-3' aria-hidden='true' /> Edit
          </button>
        </div>
        {display.mood && <p className={cn('text-sm font-semibold', MOOD_COLORS[display.mood]||'text-zinc-300')}>{display.mood}</p>}
        {display.analysis && <div><p className='text-xs text-zinc-500 font-semibold uppercase tracking-wide mb-1'>Analysis</p><p className='text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap'>{display.analysis}</p></div>}
        {display.execution && <div><p className='text-xs text-zinc-500 font-semibold uppercase tracking-wide mb-1'>Execution</p><p className='text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap'>{display.execution}</p></div>}
        {display.tags.length>0 && <div className='flex flex-wrap gap-1.5'>{display.tags.map((t,i)=><span key={i} className={cn('text-xs px-2 py-0.5 rounded font-medium', t.type==='mistake'?'bg-red-950 text-red-400':'bg-green-950 text-green-400')}>{t.value}</span>)}</div>}
        {display.lesson && <div className='p-3 bg-amber-950/30 border border-amber-900/50 rounded-lg'><p className='text-xs text-amber-400 font-semibold mb-0.5'>Key Lesson</p><p className='text-xs text-amber-200/80 leading-relaxed italic'>{display.lesson}</p></div>}
      </div>
    )
  }

  return (
    <div className='p-5 space-y-4'>
      <h3 className='text-xs font-semibold text-zinc-400'>Tulis Journal Hari Ini</h3>
      <div>
        <p className='text-xs text-zinc-500 mb-2 font-medium'>Mindset hari ini</p>
        <div className='flex gap-1.5 flex-wrap' role='group' aria-label='Pilih mood'>
          {MOODS.map(m=><button key={m} onClick={()=>setMood(mood===m?null:m)} aria-pressed={mood===m} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all focus-visible:outline-2 focus-visible:outline-zinc-400', mood===m?'bg-zinc-700 border-zinc-500 text-white':'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200')}>{m}</button>)}
        </div>
      </div>
      <div><label htmlFor='ja' className='block text-xs text-zinc-500 font-medium mb-1'>Market Analysis &amp; Setup</label>
        <textarea id='ja' className='form-textarea' rows={3} placeholder='Bias, key levels, struktur, confluences...' value={analysis} onChange={e=>setAnalysis(e.target.value)} /></div>
      <div><label htmlFor='je' className='block text-xs text-zinc-500 font-medium mb-1'>Eksekusi — apa yang terjadi?</label>
        <textarea id='je' className='form-textarea' rows={2} placeholder='Follow plan? Entry timing?' value={execution} onChange={e=>setExecution(e.target.value)} /></div>
      <div><p className='text-xs text-zinc-500 font-medium mb-1.5'>Kesalahan hari ini</p>
        <div className='flex flex-wrap gap-1.5' role='group'>
          {MISTAKE_TAGS.map(v=><button key={v} onClick={()=>toggleTag('mistake',v)} aria-pressed={tags.some(t=>t.value===v)} className={cn('px-2.5 py-1 rounded text-xs font-medium border transition-all focus-visible:outline-2 focus-visible:outline-red-500', tags.some(t=>t.value===v)?'bg-red-950 border-red-700 text-red-400':'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300')}>{v}</button>)}
        </div></div>
      <div><p className='text-xs text-zinc-500 font-medium mb-1.5'>Yang berjalan baik</p>
        <div className='flex flex-wrap gap-1.5' role='group'>
          {GOOD_TAGS.map(v=><button key={v} onClick={()=>toggleTag('good',v)} aria-pressed={tags.some(t=>t.value===v)} className={cn('px-2.5 py-1 rounded text-xs font-medium border transition-all focus-visible:outline-2 focus-visible:outline-green-500', tags.some(t=>t.value===v)?'bg-green-950 border-green-700 text-green-400':'bg-zinc-900 border-zinc-700 text-zinc-500 hover:text-zinc-300')}>{v}</button>)}
        </div></div>
      <div><label htmlFor='jl' className='block text-xs text-zinc-500 font-medium mb-1'>Key Lesson</label>
        <textarea id='jl' className='form-textarea' rows={2} placeholder='Apa yang berbeda besok?' value={lesson} onChange={e=>setLesson(e.target.value)} /></div>
      <button className='btn-amber flex items-center justify-center gap-2' onClick={handleSave} disabled={pending} aria-busy={pending}>
        {pending && <Loader2 className='w-3.5 h-3.5 animate-spin' aria-hidden='true' />}
        Simpan Journal
      </button>
    </div>
  )
}

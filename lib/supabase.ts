
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  throw new Error(
    'Missing Supabase env vars. Add to .env.local:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...'
  )
}

export const supabase = createClient(url, key)

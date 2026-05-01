/**
 * Economic News fetcher menggunakan Finnhub API (Free Tier)
 * 
 * Setup:
 * 1. Daftar gratis di https://finnhub.io/register
 * 2. Copy API key dari dashboard
 * 3. Tambahkan ke .env.local: FINNHUB_API_KEY=your-key
 * 
 * Free tier: 60 requests/minute, no credit card required
 */

import type { NewsEvent, NewsImpact } from '@/types'

// Finnhub API response type
interface FinnhubEconomicEvent {
  actual:    number | null
  country:   string
  estimate:  number | null
  event:     string
  impact:    'low' | 'medium' | 'high'
  prev:      number | null
  time:      string   // 'YYYY-MM-DD HH:mm:ss' UTC
  unit:      string
}

interface FinnhubResponse {
  economicCalendar: FinnhubEconomicEvent[]
}

// Map country code → currency
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US:'USD', EU:'EUR', GB:'GBP', JP:'JPY', AU:'AUD', NZ:'NZD',
  CA:'CAD', CH:'CHF', DE:'EUR', FR:'EUR', IT:'EUR', ES:'EUR',
  CN:'CNH', HK:'HKD', SG:'SGD', IN:'INR',
}

/**
 * Fetch economic events for a date range
 * @param from YYYY-MM-DD
 * @param to   YYYY-MM-DD
 */
export async function fetchEconomicEvents(from: string, to: string): Promise<Record<string, NewsEvent[]>> {
  const key = process.env.FINNHUB_API_KEY
  if (!key) {
    console.warn('FINNHUB_API_KEY not set — returning empty news data')
    return {}
  }

  const url = `https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${key}`

  try {
    // Use Next.js fetch with revalidation — cache 1 hour
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) {
      console.error('Finnhub API error:', res.status, res.statusText)
      return {}
    }
    const data = await res.json() as FinnhubResponse

    // Group by date 'YYYY-MM-DD'
    const grouped: Record<string, NewsEvent[]> = {}
    const events = data.economicCalendar ?? []

    for (const ev of events) {
      const [date, timeStr] = ev.time.split(' ')
      if (!date) continue

      // Convert UTC to local time string
      const eventTime = formatTime(ev.time)
      const currency = COUNTRY_TO_CURRENCY[ev.country] || ev.country

      const event: NewsEvent = {
        time:        eventTime,
        currency,
        title:       ev.event,
        impact:      ev.impact as NewsImpact,
        previous:    formatValue(ev.prev, ev.unit),
        forecast:    formatValue(ev.estimate, ev.unit),
        description: buildDescription(ev),
      }

      if (!grouped[date]) grouped[date] = []
      grouped[date].push(event)
    }

    // Sort each day by time
    for (const date in grouped) {
      grouped[date].sort((a, b) => a.time.localeCompare(b.time))
    }

    return grouped
  } catch (err) {
    console.error('Failed to fetch news:', err)
    return {}
  }
}

function formatTime(utcTime: string): string {
  try {
    const d = new Date(utcTime + 'Z')
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  } catch { return '—' }
}

function formatValue(val: number | null, unit: string): string | undefined {
  if (val === null || val === undefined) return undefined
  const formatted = val.toLocaleString('en-US', { maximumFractionDigits: 2 })
  return unit ? `${formatted}${unit}` : formatted
}

function buildDescription(ev: FinnhubEconomicEvent): string {
  const country = COUNTRY_TO_CURRENCY[ev.country] || ev.country
  const impact  = ev.impact === 'high' ? 'HIGH IMPACT' : ev.impact === 'medium' ? 'MEDIUM IMPACT' : 'LOW IMPACT'
  let desc = `${impact} — Data ekonomi ${country}.`

  if (ev.estimate !== null && ev.prev !== null) {
    desc += ` Forecast: ${ev.estimate}${ev.unit}, Previous: ${ev.prev}${ev.unit}.`
  } else if (ev.prev !== null) {
    desc += ` Previous: ${ev.prev}${ev.unit}.`
  }

  if (ev.impact === 'high') {
    desc += ' Hindari entry 15-30 menit sebelum/sesudah rilis.'
  }

  return desc
}

/**
 * Fetch events untuk satu bulan
 * Returns object like: { '2026-04-04': [event1, event2], '2026-04-05': [...] }
 */
export async function fetchMonthEvents(year: number, month: number): Promise<Record<string, NewsEvent[]>> {
  const mm = String(month + 1).padStart(2, '0')
  const lastDay = new Date(year, month + 1, 0).getDate()
  const from = `${year}-${mm}-01`
  const to   = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`
  return fetchEconomicEvents(from, to)
}

/**
 * Fetch events untuk satu hari
 */
export async function fetchDayEvents(dateKey: string): Promise<NewsEvent[]> {
  const grouped = await fetchEconomicEvents(dateKey, dateKey)
  return grouped[dateKey] || []
}

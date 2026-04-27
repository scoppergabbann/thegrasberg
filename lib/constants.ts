
export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
export const PAIRS  = ['XAUUSD','EURUSD','GBPUSD','USDJPY','USDCHF','AUDUSD','NZDUSD','USDCAD','EURJPY','GBPJPY','EURGBP','XAGUSD','US30','NAS100','BTCUSD','Other']
export const MISTAKE_TAGS = ['Entered too early','Entered too late','No SL placed','Overtraded','Revenge traded','Chased entry','Ignored confluences','Sized up too big','Cut winner early','Let loser run','Moved SL too soon','Against HTF trend']
export const GOOD_TAGS = ['Followed my plan','Waited for confirmation','Good risk management','Patient entry','Let winner run','Respected SL','Correct bias']
export const MOOD_COLORS: Record<string,string> = { Focused:'text-blue-400', Confident:'text-green-400', Anxious:'text-amber-400', FOMO:'text-orange-400', Revenge:'text-red-400' }

import type { NewsEvent, PsychQuestion } from '@/types'

export const NEWS_DB: Record<string, NewsEvent[]> = {
  '2026-03-04': [
    { time:'15:30', currency:'USD', title:'Non-Farm Payrolls', impact:'high', previous:'200K', forecast:'210K', description:'Data lapangan kerja AS — rilis paling berpengaruh di forex. Angka di atas ekspektasi bullish USD.' },
    { time:'15:30', currency:'USD', title:'Unemployment Rate', impact:'high', previous:'4.1%', forecast:'4.1%', description:'Rilis bersamaan NFP — efek double pada USD dan Gold.' },
    { time:'10:00', currency:'EUR', title:'Eurozone CPI Flash', impact:'medium', previous:'2.5%', forecast:'2.4%', description:'Inflasi flash zona euro. Memengaruhi ekspektasi ECB.' },
  ],
  '2026-03-10': [
    { time:'14:30', currency:'USD', title:'CPI m/m', impact:'high', previous:'0.3%', forecast:'0.3%', description:'Inflasi bulanan AS — sangat berpengaruh ke XAUUSD dan EURUSD.' },
    { time:'14:30', currency:'USD', title:'Core CPI m/m', impact:'high', previous:'0.3%', forecast:'0.3%', description:'Inflasi inti ex food & energy — indikator utama The Fed.' },
  ],
  '2026-03-17': [
    { time:'14:30', currency:'USD', title:'Retail Sales m/m', impact:'high', previous:'-0.9%', forecast:'0.6%', description:'Penjualan ritel AS — indikator konsumsi terkuat.' },
  ],
  '2026-03-18': [
    { time:'20:00', currency:'USD', title:'FOMC Rate Decision', impact:'high', previous:'5.25%', forecast:'5.00%', description:'⚠️ EVENT TERBESAR — semua pair akan sangat volatile. Hindari trading 30 menit sebelum & sesudah.' },
    { time:'20:30', currency:'USD', title:'FOMC Press Conference', impact:'high', description:'Konferensi pers Jerome Powell — bisa balikkan reaksi awal market.' },
  ],
  '2026-03-19': [
    { time:'03:00', currency:'JPY', title:'BOJ Rate Decision', impact:'high', previous:'-0.1%', forecast:'0.0%', description:'Potensi hike = strong JPY. Berpengaruh besar ke USDJPY, EURJPY, GBPJPY.' },
  ],
  '2026-03-26': [
    { time:'14:30', currency:'USD', title:'Core PCE Price Index m/m', impact:'high', previous:'0.3%', forecast:'0.3%', description:'Indikator inflasi FAVORIT The Fed — sangat berpengaruh ke ekspektasi rate cut.' },
  ],
}

export const NEWS_TIPS: Record<string,string> = {
  high:   'Ada HIGH impact news hari ini. Hindari entry 15–30 menit sebelum rilis. Pertimbangkan reduce lot size.',
  medium: 'Ada medium impact news. Monitor pair terdampak, gunakan SL lebih longgar dari biasanya.',
  low:    'Tidak ada news berdampak besar. Kondisi ideal untuk trading teknikal murni.',
  none:   'Tidak ada scheduled news hari ini. Kondisi ideal untuk trading teknikal murni.',
}

export const PSYCH_QUESTIONS: PsychQuestion[] = [
  { question:'Bagaimana kondisi tidurmu semalam?', subtitle:'Kurang tidur menurunkan kemampuan pengambilan keputusan secara signifikan.', options:[
    { text:'Tidur nyenyak 7–8 jam, merasa segar', score:3, level:'good' },
    { text:'Cukup, 5–6 jam', score:2, level:'good' },
    { text:'Kurang, di bawah 5 jam', score:0, level:'warn' },
    { text:'Begadang atau hampir tidak tidur', score:-2, level:'bad' },
  ]},
  { question:'Bagaimana kondisi emosionalmu saat ini?', subtitle:'Emosi tidak stabil adalah penyebab utama kerugian — impulsif, revenge trade, oversize.', options:[
    { text:'Tenang, netral, siap menganalisa', score:3, level:'good' },
    { text:'Semangat tapi masih terkontrol', score:2, level:'good' },
    { text:'Sedikit cemas atau gelisah', score:1, level:'warn' },
    { text:'Marah, frustasi, atau sangat euforia', score:-2, level:'bad' },
  ]},
  { question:'Adakah tekanan finansial/emosional di luar trading?', subtitle:'Masalah eksternal mengalihkan fokus dan mempengaruhi keputusan secara tidak sadar.', options:[
    { text:'Tidak ada — kondisi hidup stabil', score:3, level:'good' },
    { text:'Ada sedikit, bisa di-handle', score:2, level:'good' },
    { text:'Ada tekanan cukup besar', score:0, level:'warn' },
    { text:'Tekanan sangat berat hari ini', score:-2, level:'bad' },
  ]},
  { question:'Sudah review chart dan buat analisa sebelum trading?', subtitle:'Trading tanpa persiapan = gambling.', options:[
    { text:'Ya — analisa HTF & LTF, punya plan jelas', score:3, level:'good' },
    { text:'Sudah lihat chart, ada gambaran bias', score:2, level:'good' },
    { text:'Belum, mau lihat saat trading', score:-1, level:'warn' },
    { text:'Tidak — mau entry based on feeling', score:-3, level:'bad' },
  ]},
  { question:'Performa tradingmu 3 hari terakhir?', subtitle:'Streak negatif memicu revenge trade. Streak positif memicu overconfidence.', options:[
    { text:'Profit atau break even — konsisten baik', score:3, level:'good' },
    { text:'Campur — beberapa menang, beberapa kalah', score:2, level:'good' },
    { text:'Mostly loss tapi dalam batas toleransi', score:0, level:'warn' },
    { text:'Beberapa loss besar berturut-turut', score:-2, level:'bad' },
  ]},
  { question:'Seberapa kuat doronganmu untuk trading hari ini?', subtitle:'Kebutuhan "harus profit hari ini" adalah tanda bahaya terbesar.', options:[
    { text:'Normal — hanya entry jika ada setup valid', score:3, level:'good' },
    { text:'Lumayan ingin, tapi bisa sabar menunggu', score:2, level:'good' },
    { text:'Merasa harus trading hari ini', score:-1, level:'warn' },
    { text:'Ingin balas dendam atau kejar target', score:-3, level:'bad' },
  ]},
  { question:'Sudah tetapkan max loss untuk hari ini?', subtitle:'Risk management dimulai sebelum market buka.', options:[
    { text:'Ya — ada daily max loss jelas, akan berhenti jika tercapai', score:3, level:'good' },
    { text:'Ada gambaran meski tidak tertulis', score:1, level:'good' },
    { text:'Belum — nanti lihat situasi', score:-1, level:'warn' },
    { text:'Tidak perlu, saya yakin akan profit', score:-3, level:'bad' },
  ]},
  { question:'Bagaimana level konsentrasimu saat ini?', subtitle:'Membaca price action butuh fokus penuh.', options:[
    { text:'Fokus penuh — tidak ada distraksi', score:3, level:'good' },
    { text:'Cukup fokus — distraksi ringan', score:2, level:'good' },
    { text:'Agak sulit fokus — banyak di pikiran', score:0, level:'warn' },
    { text:'Tidak fokus sama sekali', score:-2, level:'bad' },
  ]},
]

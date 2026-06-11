'use client'

import { useState, useMemo, type CSSProperties } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  PieChart as PieIcon,
  SlidersHorizontal,
  LineChart as LineIcon,
  AlertTriangle,
  Info,
  ChevronDown,
  TrendingUp,
  Wallet,
  ArrowUpRight,
} from 'lucide-react'

type SubTab = 'current' | 'sim'

/* ---------- Current operation data ---------- */
const periods = {
  '6m': {
    label: '6개월',
    data: [
      { name: '12월', ours: 3.1, target: 3.5, ind: 2.9 },
      { name: '1월', ours: 3.4, target: 3.5, ind: 3.1 },
      { name: '2월', ours: 3.8, target: 3.5, ind: 3.3 },
      { name: '3월', ours: 4.0, target: 3.5, ind: 3.5 },
      { name: '4월', ours: 3.9, target: 3.5, ind: 3.4 },
      { name: '5월', ours: 4.2, target: 3.5, ind: 3.5 },
    ],
    summary: '최근 6개월 평균 3.9% · 최고 4.2%(5월) · 목표 초과 4개월',
  },
  '1y': {
    label: '1년',
    data: [
      { name: '6월', ours: 2.8, target: 3.5, ind: 2.7 },
      { name: '7월', ours: 2.9, target: 3.5, ind: 2.8 },
      { name: '8월', ours: 3.2, target: 3.5, ind: 3.0 },
      { name: '9월', ours: 3.0, target: 3.5, ind: 2.9 },
      { name: '10월', ours: 3.3, target: 3.5, ind: 3.1 },
      { name: '11월', ours: 3.2, target: 3.5, ind: 3.1 },
      { name: '12월', ours: 3.1, target: 3.5, ind: 2.9 },
      { name: '1월', ours: 3.4, target: 3.5, ind: 3.1 },
      { name: '2월', ours: 3.8, target: 3.5, ind: 3.3 },
      { name: '3월', ours: 4.0, target: 3.5, ind: 3.5 },
      { name: '4월', ours: 3.9, target: 3.5, ind: 3.4 },
      { name: '5월', ours: 4.2, target: 3.5, ind: 3.5 },
    ],
    summary: '최근 1년 평균 3.4% · 동업종 대비 +0.5%p 우위',
  },
  '3y': {
    label: '3년',
    data: [
      { name: '23 1Q', ours: 2.1, target: 3.5, ind: 2.0 },
      { name: '2Q', ours: 2.4, target: 3.5, ind: 2.2 },
      { name: '3Q', ours: 2.6, target: 3.5, ind: 2.3 },
      { name: '4Q', ours: 2.8, target: 3.5, ind: 2.5 },
      { name: '24 1Q', ours: 3.0, target: 3.5, ind: 2.7 },
      { name: '2Q', ours: 3.1, target: 3.5, ind: 2.8 },
      { name: '3Q', ours: 3.2, target: 3.5, ind: 2.9 },
      { name: '4Q', ours: 3.3, target: 3.5, ind: 3.0 },
      { name: '25 1Q', ours: 3.7, target: 3.5, ind: 3.2 },
      { name: '2Q', ours: 4.1, target: 3.5, ind: 3.4 },
    ],
    summary: '3년 누적 수익률 11.2% · 동업종 누적 대비 +1.8%p · 매년 목표 초과 달성',
  },
} as const

type PeriodKey = keyof typeof periods

const portfolio = [
  { name: '원리금보장형', pct: 72, amt: '30.7억', color: '#2563eb' },
  { name: '실적배당형', pct: 21, amt: '9.0억', color: '#0ea5e9' },
  { name: '채권형', pct: 7, amt: '3.0억', color: '#94a3b8' },
]

/* ---------- Simulation data ---------- */
interface Product {
  id: string
  name: string
  ret: number
  tag: string
}
interface AssetClass {
  name: string
  risk: boolean
  multi: boolean
  color: string
  products: Product[]
}

const CLASSES: Record<string, AssetClass> = {
  deposit: {
    name: '원리금보장형',
    risk: false,
    multi: false,
    color: '#2563eb',
    products: [
      { id: 'd1', name: 'IBK 정기예금 1년', ret: 3.6, tag: '기본' },
      { id: 'd2', name: 'IBK GIC 2년', ret: 3.4, tag: '' },
      { id: 'd3', name: 'ELB 지수연계형', ret: 4.1, tag: '수익률 1위' },
    ],
  },
  bond: {
    name: '채권형',
    risk: false,
    multi: false,
    color: '#64748b',
    products: [
      { id: 'b1', name: 'KODEX 28-12 회사채(AA-)', ret: 5.8, tag: '수익률 1위' },
      { id: 'b2', name: 'ACE 국고채10년', ret: 4.9, tag: '안정' },
      { id: 'b3', name: '국공채 펀드', ret: 4.0, tag: '' },
    ],
  },
  mixed: {
    name: '혼합형/TDF',
    risk: true,
    multi: true,
    color: '#6366f1',
    products: [
      { id: 'm1', name: 'TIGER 글로벌멀티에셋TDF2040', ret: 11.3, tag: 'TDF' },
      { id: 'm2', name: 'KODEX TRF3070', ret: 8.4, tag: '안정혼합' },
      { id: 'm3', name: '한국밸런스 혼합펀드', ret: 6.8, tag: '' },
    ],
  },
  domEq: {
    name: '국내주식형',
    risk: true,
    multi: true,
    color: '#0ea5e9',
    products: [
      { id: 'k1', name: 'KODEX 200', ret: 8.2, tag: '대표지수' },
      { id: 'k2', name: 'TIGER 코스피', ret: 7.9, tag: '' },
      { id: 'k3', name: 'KODEX 코스닥150', ret: 11.4, tag: '수익률 1위' },
      { id: 'k4', name: 'ACE 배당성장', ret: 9.1, tag: '배당' },
    ],
  },
  ovsEq: {
    name: '해외주식형',
    risk: true,
    multi: true,
    color: '#06b6d4',
    products: [
      { id: 'o1', name: 'TIGER 미국나스닥100', ret: 21.5, tag: '수익률 1위' },
      { id: 'o2', name: 'KODEX 미국S&P500TR', ret: 17.2, tag: '보수 최저' },
      { id: 'o3', name: 'SOL 미국배당다우존스', ret: 11.9, tag: '월배당' },
      { id: 'o4', name: 'ACE 미국테크TOP10', ret: 24.1, tag: '고변동' },
      { id: 'o5', name: 'TIGER 차이나전기차', ret: 6.2, tag: '' },
    ],
  },
}

type Weights = Record<string, number>
type Selected = Record<string, string[]>

const PRESETS: Record<string, { weights: Weights; selected: Selected }> = {
  safe: {
    weights: { deposit: 65, bond: 25, mixed: 10, domEq: 0, ovsEq: 0 },
    selected: { deposit: ['d1'], bond: ['b2'], mixed: ['m2'], domEq: ['k1'], ovsEq: ['o2'] },
  },
  balanced: {
    weights: { deposit: 40, bond: 20, mixed: 15, domEq: 10, ovsEq: 15 },
    selected: { deposit: ['d1'], bond: ['b1'], mixed: ['m1'], domEq: ['k1', 'k4'], ovsEq: ['o1', 'o2'] },
  },
  growth: {
    weights: { deposit: 20, bond: 10, mixed: 10, domEq: 20, ovsEq: 40 },
    selected: { deposit: ['d1'], bond: ['b1'], mixed: ['m1'], domEq: ['k1', 'k3'], ovsEq: ['o1', 'o2', 'o3'] },
  },
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, (n >> 16) + amt)
  const g = Math.min(255, ((n >> 8) & 255) + amt)
  const b = Math.min(255, (n & 255) + amt)
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

export function AssetManagement() {
  const [sub, setSub] = useState<SubTab>('current')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 animate-slide-up">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow-blue transition-transform duration-300 hover:scale-105">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">자산 운용</h2>
          <p className="text-muted-foreground">퇴직연금 적립금의 운용 현황과 시뮬레이션을 확인합니다</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="inline-flex gap-1 p-1 rounded-xl bg-white/50 border border-white/50 animate-slide-up" style={{ animationDelay: '80ms' }}>
        {[
          { id: 'current' as SubTab, label: '현재 운용', icon: PieIcon },
          { id: 'sim' as SubTab, label: '자산운용 시뮬레이션', icon: SlidersHorizontal },
        ].map((t) => {
          const Icon = t.icon
          const on = sub === t.id
          return (
            <button
              key={t.id}
              onClick={() => setSub(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                on
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {sub === 'current' ? <CurrentPane /> : <SimPane />}
    </div>
  )
}

/* =========================================================
   현재 운용
   ========================================================= */
function CurrentPane() {
  const [period, setPeriod] = useState<PeriodKey>('3y')
  const p = periods[period]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="glass border-0 card-interactive bg-gradient-to-br from-primary/15 to-primary/5 animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm px-2.5 py-1 rounded-lg font-medium bg-emerald-100 text-emerald-600">
                <ArrowUpRight className="w-3 h-3" />
                <span>+1.4억</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">총 적립금</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                42.7<span className="text-lg font-normal text-muted-foreground ml-1">억</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">전월 대비 증가</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0 card-interactive bg-gradient-to-br from-sky-500/15 to-sky-500/5 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-400 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-sm px-2.5 py-1 rounded-lg font-medium bg-emerald-100 text-emerald-600">
                <ArrowUpRight className="w-3 h-3" />
                <span>+0.7%p</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">당기 수익률</p>
              <p className="text-3xl font-bold text-foreground mt-1">4.2%</p>
              <p className="text-xs text-muted-foreground mt-1">목표 대비 초과 달성</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Return trend */}
        <Card className="glass border-0 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                  <LineIcon className="w-4 h-4 text-white" />
                </div>
                수익률 추이
              </CardTitle>
              <div className="inline-flex rounded-lg bg-white/50 border border-white/50 p-0.5">
                {(Object.keys(periods) as PeriodKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setPeriod(k)}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                      period === k ? 'bg-gradient-to-r from-primary to-accent text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {periods[k].label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <Legendish color="#2563eb" label="우리 회사" />
              <Legendish dashed label="목표 3.5%" />
              <Legendish color="#94a3b8" label="동업종 평균" />
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={p.data} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[1.5, 5.5]} tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.95)', fontSize: 12 }}
                    formatter={(v: number) => `${v}%`}
                  />
                  <Line type="monotone" dataKey="ours" name="우리 회사" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: '#2563eb' }} />
                  <Line type="monotone" dataKey="target" name="목표" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 4" dot={false} />
                  <Line type="monotone" dataKey="ind" name="동업종" stroke="#cbd5e1" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 rounded-xl bg-white/50 border border-white/50 text-xs text-muted-foreground leading-relaxed">
              {p.summary}
            </div>
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card className="glass border-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-400 flex items-center justify-center shadow-md">
                  <PieIcon className="w-4 h-4 text-white" />
                </div>
                자산 포트폴리오
              </CardTitle>
              <span className="text-xs text-muted-foreground">총 42.7억</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-[130px] h-[130px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={portfolio} dataKey="pct" nameKey="name" innerRadius={40} outerRadius={62} paddingAngle={2} stroke="none">
                      {portfolio.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.95)', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1">
                {portfolio.map((d) => (
                  <div key={d.name} className="flex items-center justify-between py-2 border-b border-white/40 last:border-0 text-sm">
                    <div className="flex items-center gap-2 text-foreground">
                      <span className="w-2.5 h-2.5 rounded" style={{ background: d.color }} />
                      {d.name}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-foreground w-9 text-right">{d.pct}%</span>
                      <span className="text-xs text-muted-foreground w-12 text-right">{d.amt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 p-3 rounded-xl bg-white/50 border border-white/50 text-xs text-muted-foreground">
              위험자산 비중 <strong className="text-foreground">28%</strong> · 법정 한도 70% 대비 여유 충분
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Legendish({ color, dashed, label }: { color?: string; dashed?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {dashed ? (
        <span className="inline-block w-3.5 border-t-2 border-dashed border-muted-foreground/60" />
      ) : (
        <span className="w-3.5 h-1 rounded-sm" style={{ background: color }} />
      )}
      {label}
    </div>
  )
}

/* =========================================================
   자산운용 시뮬레이션
   ========================================================= */
function SimPane() {
  const [weights, setWeights] = useState<Weights>({ deposit: 50, bond: 20, mixed: 10, domEq: 8, ovsEq: 12 })
  const [selected, setSelected] = useState<Selected>({ deposit: ['d1'], bond: ['b1'], mixed: ['m1'], domEq: ['k1'], ovsEq: ['o1', 'o2'] })
  const [open, setOpen] = useState<Record<string, boolean>>({})

  const classRet = (key: string) => {
    const sel = selected[key] || []
    const prods = CLASSES[key].products.filter((p) => sel.includes(p.id))
    if (!prods.length) return null
    return prods.reduce((s, p) => s + p.ret, 0) / prods.length
  }

  const total = Object.values(weights).reduce((s, v) => s + v, 0)
  const riskSum = Object.entries(weights).reduce((s, [k, v]) => s + (CLASSES[k].risk ? v : 0), 0)

  const expReturn = useMemo(() => {
    let wRetSum = 0
    let wUsed = 0
    Object.entries(weights).forEach(([k, w]) => {
      if (!w) return
      const r = classRet(k)
      if (r === null) return
      wRetSum += r * w
      wUsed += w
    })
    return wUsed > 0 ? (wRetSum / wUsed).toFixed(1) + '%' : '—'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weights, selected])

  const pieData = useMemo(() => {
    const out: { name: string; value: number; color: string }[] = []
    Object.entries(weights).forEach(([k, w]) => {
      if (!w) return
      const prods = CLASSES[k].products.filter((p) => (selected[k] || []).includes(p.id))
      if (!prods.length) return
      const each = w / prods.length
      prods.forEach((p, i) => {
        out.push({ name: p.name, value: +each.toFixed(1), color: shade(CLASSES[k].color, i * 22) })
      })
    })
    return out
  }, [weights, selected])

  const concMsgs = useMemo(() => {
    const msgs: string[] = []
    Object.entries(weights).forEach(([k, w]) => {
      if (CLASSES[k].risk && CLASSES[k].multi && w >= 15 && (selected[k] || []).length <= 1) {
        msgs.push(`${CLASSES[k].name} ${w}% 집중`)
      }
    })
    return msgs
  }, [weights, selected])

  const updateWeight = (key: string, val: number) => setWeights((w) => ({ ...w, [key]: val }))
  const toggleOpen = (key: string) => setOpen((o) => ({ ...o, [key]: !o[key] }))
  const toggleProd = (key: string, pid: string, multi: boolean) => {
    setSelected((s) => {
      if (multi) {
        const cur = s[key] || []
        return { ...s, [key]: cur.includes(pid) ? cur.filter((x) => x !== pid) : [...cur, pid] }
      }
      return { ...s, [key]: [pid] }
    })
  }
  const normalize = () => {
    if (!total) return
    const keys = Object.keys(weights)
    const next: Weights = {}
    keys.forEach((k) => (next[k] = Math.round((weights[k] / total) * 100)))
    const diff = 100 - Object.values(next).reduce((s, v) => s + v, 0)
    next[keys[0]] += diff
    setWeights(next)
  }
  const applyPreset = (name: keyof typeof PRESETS) => {
    setWeights({ ...PRESETS[name].weights })
    setSelected(JSON.parse(JSON.stringify(PRESETS[name].selected)))
  }

  return (
    <div className="space-y-4">
      {/* Top: expected return + adjusted pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="glass border-0 bg-gradient-to-br from-primary/15 to-accent/5 animate-slide-up">
          <CardContent className="p-6 h-full flex flex-col justify-center">
            <p className="text-xs text-muted-foreground mb-2">예상 연 수익률</p>
            <p className="text-5xl font-bold gradient-text leading-none">{expReturn}</p>
            <p className="text-xs text-muted-foreground mt-3">선택 상품 3년 평균 가중 기준</p>
          </CardContent>
        </Card>

        <Card className="glass border-0 lg:col-span-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                <PieIcon className="w-4 h-4 text-white" />
              </div>
              조정 포트폴리오
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[170px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={66} paddingAngle={2} stroke="none">
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.95)', fontSize: 12 }} />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string, _e, i) => {
                      const item = pieData[i as number]
                      const short = value.length > 13 ? value.slice(0, 13) + '…' : value
                      return <span style={{ fontSize: 10, color: '#64748b' }}>{`${short} ${item?.value}%`}</span>
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Composition */}
      <Card className="glass border-0 animate-slide-up" style={{ animationDelay: '150ms' }}>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-400 flex items-center justify-center shadow-md">
                <SlidersHorizontal className="w-4 h-4 text-white" />
              </div>
              포트폴리오 구성
            </CardTitle>
            <div className="flex gap-2">
              {([
                ['safe', '안정형'],
                ['balanced', '균형형'],
                ['growth', '수익추구형'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-white/50 bg-white/40 text-muted-foreground hover:bg-white/70 hover:text-foreground transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">자산군 비중을 조절하고 편입 상품을 선택하세요 · 고위험 자산군은 복수 상품 분산이 가능합니다</p>

          <div className="space-y-3">
            {Object.entries(CLASSES).map(([key, cls]) => {
              const w = weights[key] || 0
              const sel = selected[key] || []
              const selProds = cls.products.filter((p) => sel.includes(p.id))
              const cRet = classRet(key)
              const isOpen = open[key]
              const selNames = selProds.length ? selProds.map((p) => p.name).join(', ') : '상품 미선택'
              const splitTxt = cls.multi && selProds.length > 1 ? ` · ${selProds.length}개 분산 (각 ${(w / selProds.length).toFixed(1)}%)` : ''
              return (
                <div key={key} className="rounded-xl border border-white/50 bg-white/40 p-3">
                  <div className="grid grid-cols-[minmax(110px,140px)_1fr_auto] items-start gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground pt-1">
                      <span className="w-2.5 h-2.5 rounded shrink-0" style={{ background: cls.color }} />
                      {cls.name}
                      {cls.risk && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-red-100 text-red-500">위험</span>
                      )}
                    </div>
                    <div className="relative w-full pb-3.5">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={w}
                        onChange={(e) => updateWeight(key, parseInt(e.target.value))}
                        aria-label={`${cls.name} 비중`}
                        className="cd-slider"
                        style={{ '--val': `${w}%`, '--color': cls.color } as CSSProperties}
                      />
                      <div className="absolute bottom-0 left-0.5 right-0.5 flex justify-between">
                        {[0, 25, 50, 75, 100].map((t) => (
                          <span key={t} className="text-[9px] text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 justify-end pt-1">
                      <span className="text-sm font-semibold text-foreground w-9 text-right">{w}%</span>
                      <span className="text-xs text-muted-foreground w-16 text-right">{cRet !== null ? `적용 ${cRet.toFixed(1)}%` : '—'}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/50">
                    {w === 0 ? (
                      <p className="text-xs text-muted-foreground">{cls.name} 상품의 비중이 0입니다.</p>
                    ) : (
                      <>
                        <button onClick={() => toggleOpen(key)} className="w-full flex items-center justify-between text-xs text-muted-foreground">
                          <span className="text-left">{selNames}{splitTxt}</span>
                          <span className="flex items-center gap-1 text-primary font-medium shrink-0 ml-2">
                            {isOpen ? '접기' : '상품 변경'}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                          </span>
                        </button>

                        {isOpen && (
                          <div className="mt-2 space-y-0.5">
                            {cls.products.map((p) => {
                              const checked = sel.includes(p.id)
                              return (
                                <label key={p.id} className="flex items-center gap-2.5 py-1.5 text-xs border-b border-white/40 last:border-0 cursor-pointer">
                                  <input
                                    type={cls.multi ? 'checkbox' : 'radio'}
                                    name={`sel-${key}`}
                                    checked={checked}
                                    onChange={() => toggleProd(key, p.id, cls.multi)}
                                    className="w-3.5 h-3.5 accent-primary cursor-pointer shrink-0"
                                  />
                                  <span className="flex-1 text-foreground">{p.name}</span>
                                  {p.tag && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                                      p.tag === '수익률 1위' ? 'bg-primary/15 text-primary' : 'bg-white/60 text-muted-foreground'
                                    }`}>
                                      {p.tag}
                                    </span>
                                  )}
                                  <span className="w-12 text-right font-semibold text-emerald-600">+{p.ret.toFixed(1)}%</span>
                                </label>
                              )
                            })}
                            {cls.multi && (
                              <p className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1.5">
                                <Info className="w-3 h-3" />
                                복수 선택 시 자산군 비중을 균등 분산합니다
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Total bar */}
          <div className="flex items-center justify-between mt-4 p-3 rounded-xl bg-white/50 border border-white/50 text-sm">
            <span className="text-muted-foreground">
              합계 <span className={total === 100 ? 'text-emerald-600 font-semibold' : 'text-destructive font-semibold'}>{total}%</span>
              {' · '}위험자산 <span className="font-medium text-foreground">{riskSum}%</span> / 한도 70%
            </span>
            <button onClick={normalize} className="text-xs text-primary font-medium hover:underline">
              100%로 자동 조정
            </button>
          </div>

          {riskSum > 70 && (
            <div className="flex items-center gap-2 mt-2 p-2.5 rounded-xl bg-red-100 text-red-500 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              위험자산 비중이 법정 한도 70%를 초과했습니다
            </div>
          )}
          {concMsgs.length > 0 && (
            <div className="flex items-center gap-2 mt-2 p-2.5 rounded-xl bg-amber-100 text-amber-700 text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              분산투자 권장: {concMsgs.join(' · ')} → 2개 이상 상품 선택을 권장합니다
            </div>
          )}
        </CardContent>
      </Card>

      <button className="w-full py-3 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition-all duration-300">
        이 구성으로 추천 의견 받기 ↗
      </button>
    </div>
  )
}

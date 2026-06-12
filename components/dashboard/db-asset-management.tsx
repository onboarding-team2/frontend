'use client'

import { useState, useMemo, useEffect, useRef, type CSSProperties } from 'react'
import {
  getAssetsCurrent,
  updateTargetReturnRate,
  getSimulationOptions,
  saveSimulation,
  listSimulations,
  deleteSimulation,
  type AssetsCurrent,
  type AssetClassOption,
  type Simulation,
} from '@/lib/api'
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
  ReferenceLine,
} from 'recharts'
import {
  PieChart as PieIcon,
  SlidersHorizontal,
  LineChart as LineIcon,
  AlertTriangle,
  Info,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  Target,
  Pencil,
  Minus,
  Plus,
  Save,
  FolderOpen,
  Trash2,
  Check,
  X,
} from 'lucide-react'

type SubTab = 'current' | 'sim'
type PeriodKey = '6m' | '1y' | '3y'

// ── helpers ─────────────────────────────────────────────────────────────────

function toEok(won: number): string {
  return (won / 100_000_000).toFixed(1)
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, (n >> 16) + amt)
  const g = Math.min(255, ((n >> 8) & 255) + amt)
  const b = Math.min(255, (n & 255) + amt)
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

function formatMonthLabel(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}월`
}

function formatQuarterLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const q = Math.ceil((d.getMonth() + 1) / 3)
  return `${String(d.getFullYear()).slice(2)} ${q}Q`
}

// ── types for simulation state ───────────────────────────────────────────────
type Weights = Record<string, number>
type Selected = Record<string, number[]>  // product IDs (DB IDs)

const PRESETS_BY_CODE: Record<string, Record<string, number>> = {
  safe:     { DEPOSIT: 65, BOND: 25, MIXED: 10, DOM_EQ: 0,  OVS_EQ: 0  },
  balanced: { DEPOSIT: 40, BOND: 20, MIXED: 15, DOM_EQ: 10, OVS_EQ: 15 },
  growth:   { DEPOSIT: 20, BOND: 10, MIXED: 10, DOM_EQ: 20, OVS_EQ: 40 },
}

// ── main component ───────────────────────────────────────────────────────────

export function AssetManagement() {
  const [sub, setSub] = useState<SubTab>('current')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 animate-slide-up">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow-blue transition-transform duration-300 hover:scale-105">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">자산 운용</h2>
          <p className="text-muted-foreground">퇴직연금 적립금의 운용 현황과 시뮬레이션을 확인합니다</p>
        </div>
      </div>

      <div className="inline-flex gap-1 p-1 rounded-xl bg-white/50 border border-white/50 animate-slide-up">
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

// ── 현재 운용 ────────────────────────────────────────────────────────────────

function CurrentPane() {
  const [period, setPeriod] = useState<PeriodKey>('1y')
  const [assets, setAssets] = useState<AssetsCurrent | null>(null)
  const [loading, setLoading] = useState(true)

  const [targetReturn, setTargetReturn] = useState<number | null>(null)
  const [editingTarget, setEditingTarget] = useState(false)
  const [targetDraft, setTargetDraft] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    getAssetsCurrent(controller.signal)
      .then((data) => {
        setAssets(data)
        setTargetReturn(data.target_return_rate)
        setTargetDraft(data.target_return_rate.toFixed(1))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const currentReturn = assets?.current_return_rate ?? 0
  const targetVal = targetReturn ?? assets?.target_return_rate ?? 0
  const diff = +(currentReturn - targetVal).toFixed(1)
  const overAchieved = diff >= 0

  const commitTarget = async () => {
    const v = parseFloat(targetDraft)
    if (!isNaN(v) && v >= 0 && v <= 100) {
      const rounded = +v.toFixed(1)
      setTargetReturn(rounded)
      setEditingTarget(false)
      try {
        await updateTargetReturnRate(rounded)
      } catch {
        // silently ignore
      }
    } else {
      setTargetDraft((targetReturn ?? 0).toString())
      setEditingTarget(false)
    }
  }

  const chartData = useMemo(() => {
    if (!assets?.return_history?.length) return []
    const history = assets.return_history
    const now = new Date()

    const filtered: typeof history = (() => {
      if (period === '6m') return history.slice(-6)
      if (period === '1y') return history.slice(-12)
      return history
    })()

    return filtered.map((h) => ({
      name: period === '3y' ? formatQuarterLabel(h.base_date) : formatMonthLabel(h.base_date),
      ours: h.return_rate,
      target: targetVal,
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets, period, targetVal])

  const PERIOD_LABELS: Record<PeriodKey, string> = { '6m': '6개월', '1y': '1년', '3y': '3년' }

  return (
    <div className="space-y-6">
      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass border-0 card-interactive py-2 bg-gradient-to-br from-primary/15 to-primary/5 animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">총 적립금</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {assets ? toEok(assets.total_amount) : '-'}
                <span className="text-lg font-normal text-muted-foreground ml-1">억</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0 card-interactive py-2 bg-gradient-to-br from-sky-500/15 to-sky-500/5 animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-400 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              {assets && (
                <div className={`flex items-center gap-1 text-sm px-2.5 py-1 rounded-lg font-medium ${overAchieved ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                  <ArrowUpRight className={`w-3 h-3 ${overAchieved ? '' : 'rotate-90'}`} />
                  <span>{overAchieved ? '+' : ''}{diff}%p</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">당기 수익률</p>
              <p className="text-3xl font-bold text-foreground mt-1">{loading ? '-' : `${currentReturn}%`}</p>
              {assets && (
                <p className="text-xs text-muted-foreground mt-1">
                  목표 대비 {Math.abs(diff)}%p {overAchieved ? '초과 달성' : '미달'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0 card-interactive py-2 bg-gradient-to-br from-indigo-500/15 to-indigo-500/5 animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-400 flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              {!editingTarget && (
                <button
                  onClick={() => { setTargetDraft((targetReturn ?? 0).toFixed(1)); setEditingTarget(true) }}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium bg-white/60 text-muted-foreground hover:text-foreground hover:bg-white/80 transition-all"
                >
                  <Pencil className="w-3 h-3" />
                  수정
                </button>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">목표 수익률</p>
              {editingTarget ? (
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const v = parseFloat(targetDraft)
                      if (!isNaN(v) && v - 0.1 >= 0) setTargetDraft((v - 0.1).toFixed(1))
                    }}
                    className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
                    aria-label="0.1 감소"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex items-baseline gap-0.5">
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      max={100}
                      autoFocus
                      value={targetDraft}
                      onChange={(e) => setTargetDraft(e.target.value)}
                      onBlur={commitTarget}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitTarget()
                        if (e.key === 'Escape') { setTargetDraft((targetReturn ?? 0).toFixed(1)); setEditingTarget(false) }
                      }}
                      className="w-16 text-3xl font-bold text-foreground text-center bg-transparent border-b-2 border-primary/40 focus:border-primary outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      aria-label="목표 수익률 입력"
                    />
                    <span className="text-3xl font-bold text-foreground">%</span>
                  </div>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const v = parseFloat(targetDraft)
                      if (!isNaN(v) && v + 0.1 <= 100) setTargetDraft((v + 0.1).toFixed(1))
                    }}
                    className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
                    aria-label="0.1 증가"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-3xl font-bold text-foreground mt-1">{loading ? '-' : `${targetVal}%`}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {editingTarget ? 'Enter로 저장 · Esc로 취소' : '연간 운용 목표'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 수익률 추이 */}
        <Card className="glass border-0 animate-slide-up">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                  <LineIcon className="w-4 h-4 text-white" />
                </div>
                수익률 추이
              </CardTitle>
              <div className="inline-flex rounded-lg bg-white/50 border border-white/50 p-0.5">
                {(['6m', '1y', '3y'] as PeriodKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setPeriod(k)}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                      period === k ? 'bg-gradient-to-r from-primary to-accent text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {PERIOD_LABELS[k]}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <Legendish color="#2563eb" label="우리 회사" />
              <Legendish dashed label={`목표 ${targetVal}%`} />
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.95)', fontSize: 12 }}
                    formatter={(v) => [`${v}%`]}
                  />
                  <Line type="monotone" dataKey="ours" name="우리 회사" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: '#2563eb' }} />
                  <ReferenceLine y={targetVal} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 자산 포트폴리오 */}
        <Card className="glass border-0 animate-slide-up">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-400 flex items-center justify-center shadow-md">
                  <PieIcon className="w-4 h-4 text-white" />
                </div>
                자산 포트폴리오
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                총 {assets ? toEok(assets.total_amount) : '-'}억
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-[130px] h-[130px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assets?.portfolio_by_class ?? []}
                      dataKey="pct"
                      nameKey="class_name"
                      innerRadius={40}
                      outerRadius={62}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {(assets?.portfolio_by_class ?? []).map((d) => (
                        <Cell key={d.class_code} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.95)', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1">
                {(assets?.portfolio_by_class ?? []).map((d) => (
                  <div key={d.class_code} className="py-2 border-b border-white/40 last:border-0">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-foreground">
                        <span className="w-2.5 h-2.5 rounded shrink-0" style={{ background: d.color }} />
                        {d.class_name}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground w-9 text-right">{d.pct}%</span>
                        <span className="text-xs text-muted-foreground w-14 text-right">{toEok(d.amount)}억</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {assets && (
              <div className="mt-3 p-3 rounded-xl bg-white/50 border border-white/50 text-xs text-muted-foreground">
                위험자산 비중 <strong className="text-foreground">{assets.risk_asset_ratio}%</strong> · 법정 한도 70% 대비{' '}
                {assets.risk_asset_ratio <= 70 ? '여유 충분' : <span className="text-red-500 font-semibold">한도 초과</span>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 유형별 운용 상품 */}
      <Card className="glass border-0 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            유형별 운용 상품
            <span className="text-xs font-normal text-muted-foreground">현재 투자 중인 상품 내역</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {(assets?.holdings_by_class ?? []).map((group) => (
              <div
                key={group.class_code}
                className="rounded-2xl border-2 bg-white/40 overflow-hidden"
                style={{ borderColor: group.color }}
              >
                <div
                  className="flex items-center gap-2 px-3 py-2.5"
                  style={{ background: `${group.color}1a` }}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: group.color }} />
                  <span className="text-sm font-semibold text-foreground truncate">{group.class_name}</span>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">{group.products.length}개</span>
                </div>
                <div className="p-2.5 space-y-2">
                  {group.products.map((item) => (
                    <div
                      key={item.product_name}
                      className="px-3 py-2.5 rounded-xl border border-border bg-white/70"
                    >
                      <p className="text-sm text-foreground leading-snug">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground mb-1">{item.provider}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-emerald-600">+{item.return_rate}%</span>
                        <span className="text-xs text-muted-foreground">{toEok(item.amount)}억</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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

// ── 자산운용 시뮬레이션 ──────────────────────────────────────────────────────

function SimPane() {
  const [classes, setClasses] = useState<AssetClassOption[]>([])
  const [weights, setWeights] = useState<Weights>({})
  const [selected, setSelected] = useState<Selected>({})

  const [saved, setSaved] = useState<Simulation[]>([])
  const [saveOpen, setSaveOpen] = useState(false)
  const [loadOpen, setLoadOpen] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [activeId, setActiveId] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const loadRef = useRef<HTMLDivElement>(null)

  // load options + saved list
  useEffect(() => {
    const controller = new AbortController()
    getSimulationOptions(controller.signal).then((opts) => {
      setClasses(opts.classes)
      const initWeights: Weights = {}
      const initSelected: Selected = {}
      opts.classes.forEach((cls) => {
        initWeights[cls.class_code] = 0
        initSelected[cls.class_code] = []
      })
      initWeights['DEPOSIT'] = 50
      initWeights['BOND'] = 20
      initWeights['MIXED'] = 10
      initWeights['DOM_EQ'] = 8
      initWeights['OVS_EQ'] = 12
      // default product: first product in each class
      opts.classes.forEach((cls) => {
        if (cls.products.length > 0) {
          initSelected[cls.class_code] = [cls.products[0].id]
        }
      })
      setWeights(initWeights)
      setSelected(initSelected)
    }).catch(() => {})

    listSimulations(controller.signal).then(setSaved).catch(() => {})
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!saveOpen && !loadOpen) return
    const handler = (e: MouseEvent) => {
      if (loadRef.current && !loadRef.current.contains(e.target as Node)) {
        setSaveOpen(false)
        setLoadOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [saveOpen, loadOpen])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast])

  const classReturnByCode = (code: string) => {
    const cls = classes.find((c) => c.class_code === code)
    if (!cls) return null
    const selIds = selected[code] || []
    const prods = cls.products.filter((p) => selIds.includes(p.id))
    if (!prods.length) return null
    return prods.reduce((s, p) => s + p.return_rate, 0) / prods.length
  }

  const total = Object.values(weights).reduce((s, v) => s + v, 0)
  const riskSum = classes.reduce((s, cls) => s + (cls.is_risk ? (weights[cls.class_code] || 0) : 0), 0)

  const expReturn = useMemo(() => {
    let wRetSum = 0
    let wUsed = 0
    classes.forEach((cls) => {
      const w = weights[cls.class_code] || 0
      if (!w) return
      const r = classReturnByCode(cls.class_code)
      if (r === null) return
      wRetSum += r * w
      wUsed += w
    })
    return wUsed > 0 ? (wRetSum / wUsed).toFixed(1) + '%' : '—'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weights, selected, classes])

  const expReturnNum = useMemo(() => {
    let wRetSum = 0
    let wUsed = 0
    classes.forEach((cls) => {
      const w = weights[cls.class_code] || 0
      if (!w) return
      const r = classReturnByCode(cls.class_code)
      if (r === null) return
      wRetSum += r * w
      wUsed += w
    })
    return wUsed > 0 ? wRetSum / wUsed : 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weights, selected, classes])

  // Pie shows only asset class weights (not individual products)
  const pieData = useMemo(() => {
    return classes
      .map((cls) => {
        const w = weights[cls.class_code] || 0
        if (!w) return null
        const selIds = selected[cls.class_code] || []
        if (!selIds.length) return null
        return { name: cls.class_name, value: w, color: cls.color }
      })
      .filter(Boolean) as { name: string; value: number; color: string }[]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weights, selected, classes])

  const concMsgs = useMemo(() => {
    const msgs: string[] = []
    classes.forEach((cls) => {
      const w = weights[cls.class_code] || 0
      if (cls.is_risk && cls.allow_multi && w >= 15 && (selected[cls.class_code] || []).length <= 1) {
        msgs.push(`${cls.class_name} ${w}% 집중`)
      }
    })
    return msgs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weights, selected, classes])

  const buildSimItems = () => {
    const items: { asset_class_id: number; product_master_id: number | null; weight_pct: number; applied_return: number }[] = []
    classes.forEach((cls) => {
      const w = weights[cls.class_code] || 0
      if (!w) return
      const selIds = selected[cls.class_code] || []
      if (!selIds.length) return
      const prods = cls.products.filter((p) => selIds.includes(p.id))
      const each = prods.length > 0 ? w / prods.length : w
      prods.forEach((p) => {
        items.push({
          asset_class_id: cls.id,
          product_master_id: p.id,
          weight_pct: +each.toFixed(2),
          applied_return: +p.return_rate.toFixed(2),
        })
      })
    })
    return items
  }

  const handleSave = async () => {
    const name = nameDraft.trim() || `포트폴리오 ${saved.length + 1}`
    setSaving(true)
    try {
      const result = await saveSimulation({
        simulation_name: name,
        preset_type: 'CUSTOM',
        expected_return_rate: +expReturnNum.toFixed(2),
        risk_asset_ratio: +riskSum.toFixed(2),
        items: buildSimItems(),
      })
      setSaved((prev) => [result, ...prev])
      setActiveId(result.id)
      setNameDraft('')
      setSaveOpen(false)
      setToast(`'${name}' 저장 완료`)
    } catch {
      setToast('저장에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleLoad = (sim: Simulation) => {
    const newWeights: Weights = {}
    const newSelected: Selected = {}
    classes.forEach((cls) => { newWeights[cls.class_code] = 0; newSelected[cls.class_code] = [] })

    // aggregate weights by class_code and collect product IDs
    const classWeights: Record<string, number> = {}
    const classProducts: Record<string, number[]> = {}
    sim.items.forEach((item) => {
      classWeights[item.class_code] = (classWeights[item.class_code] || 0) + item.weight_pct
      if (item.product_master_id != null) {
        classProducts[item.class_code] = classProducts[item.class_code] || []
        if (!classProducts[item.class_code].includes(item.product_master_id)) {
          classProducts[item.class_code].push(item.product_master_id)
        }
      }
    })
    Object.assign(newWeights, classWeights)
    Object.assign(newSelected, classProducts)

    setWeights(newWeights)
    setSelected(newSelected)
    setActiveId(sim.id)
    setLoadOpen(false)
    setToast(`'${sim.simulation_name}' 불러옴`)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteSimulation(id)
      setSaved((prev) => prev.filter((s) => s.id !== id))
      if (activeId === id) setActiveId(null)
    } catch {
      setToast('삭제에 실패했습니다')
    }
  }

  const updateWeight = (code: string, val: number) => {
    setActivePreset(null)
    setWeights((w) => ({ ...w, [code]: val }))
  }
  const toggleProd = (code: string, pid: number, multi: boolean) => {
    setSelected((s) => {
      if (multi) {
        const cur = s[code] || []
        return { ...s, [code]: cur.includes(pid) ? cur.filter((x) => x !== pid) : [...cur, pid] }
      }
      return { ...s, [code]: [pid] }
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
  const applyPreset = (name: keyof typeof PRESETS_BY_CODE) => {
    setActivePreset(name)
    const pw = PRESETS_BY_CODE[name]
    const newWeights: Weights = {}
    classes.forEach((cls) => { newWeights[cls.class_code] = pw[cls.class_code] ?? 0 })
    setWeights(newWeights)
    const newSelected: Selected = {}
    classes.forEach((cls) => {
      if (name === 'balanced') {
        if (cls.class_code === 'MIXED') {
          const ids = cls.products
            .filter((p) => p.name.includes('TDF2040') || p.name.includes('TRF3070'))
            .map((p) => p.id)
          newSelected[cls.class_code] = ids.length > 0 ? ids : cls.products.length > 0 ? [cls.products[0].id] : []
        } else if (cls.class_code === 'OVS_EQ') {
          const ids = cls.products
            .filter((p) => p.name.includes('나스닥100') || p.name.includes('S&P500'))
            .map((p) => p.id)
          newSelected[cls.class_code] = ids.length > 0 ? ids : cls.products.length > 0 ? [cls.products[0].id] : []
        } else {
          newSelected[cls.class_code] = cls.products.length > 0 ? [cls.products[0].id] : []
        }
      } else if (name === 'growth') {
        if (cls.class_code === 'DOM_EQ') {
          const ids = cls.products
            .filter((p) => p.name.includes('코스닥150') || p.name.includes('KODEX 200') || p.name.includes('코덱스 200'))
            .map((p) => p.id)
          newSelected[cls.class_code] = ids.length > 0 ? ids : cls.products.length > 0 ? [cls.products[0].id] : []
        } else if (cls.class_code === 'OVS_EQ') {
          const ids = cls.products
            .filter((p) => p.name.includes('나스닥100') || p.name.includes('테크TOP10') || p.name.includes('Tech TOP10') || p.name.includes('미국테크'))
            .map((p) => p.id)
          newSelected[cls.class_code] = ids.length > 0 ? ids : cls.products.length > 0 ? [cls.products[0].id] : []
        } else {
          newSelected[cls.class_code] = cls.products.length > 0 ? [cls.products[0].id] : []
        }
      } else {
        newSelected[cls.class_code] = cls.products.length > 0 ? [cls.products[0].id] : []
      }
    })
    setSelected(newSelected)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <Card className="glass border-0 bg-gradient-to-br from-primary/15 to-accent/5 animate-slide-up">
          <CardContent className="p-4 h-full flex flex-col justify-center">
            <p className="text-[15.5px] text-muted-foreground mb-2">예상 연 수익률</p>
            <div className="flex items-end gap-3 flex-wrap">
              <p className="text-5xl font-bold gradient-text leading-none">{expReturn}</p>
            </div>
            <p className="text-[13.5px] text-muted-foreground mt-3">선택 상품 연 수익률 가중 기준</p>
          </CardContent>
        </Card>

        <Card className="glass border-0 lg:col-span-3 animate-slide-up">
          <CardHeader className="pb-1 px-4 pt-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-[17.5px] flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                  <PieIcon className="w-4 h-4 text-white" />
                </div>
                조정 포트폴리오
              </CardTitle>
              <div className="relative flex items-center gap-2">
                <button
                  onClick={() => { setSaveOpen((v) => !v); setLoadOpen(false) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[13.5px] rounded-lg bg-gradient-to-r from-primary to-accent text-white font-medium shadow-md hover:opacity-90 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  저장
                </button>
                <div className="relative" ref={loadRef}>
                  <button
                    onClick={() => { setLoadOpen((v) => !v); setSaveOpen(false) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[13.5px] rounded-lg border border-white/50 bg-white/40 text-muted-foreground hover:bg-white/70 hover:text-foreground transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    불러오기
                    {saved.length > 0 && (
                      <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold leading-none">
                        {saved.length}
                      </span>
                    )}
                  </button>
                  {saveOpen && (
                    <div className="absolute top-full right-0 mt-1 z-30 w-72 p-3 rounded-xl border border-white/60 bg-white/95 backdrop-blur shadow-lg animate-slide-up">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-foreground">현재 구성을 저장합니다</p>
                        <button
                          onClick={() => setSaveOpen(false)}
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/70 transition-all shrink-0"
                          aria-label="저장 취소"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={nameDraft}
                          placeholder="포트폴리오 이름 입력"
                          onChange={(e) => setNameDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave()
                            if (e.key === 'Escape') setSaveOpen(false)
                          }}
                          className="flex-1 px-3 py-2 text-sm rounded-lg border border-white/60 bg-white/70 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="flex items-center justify-center gap-1 px-3 py-2 text-xs rounded-lg bg-primary text-white font-medium hover:opacity-90 transition-all disabled:opacity-60 shrink-0"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {saving ? '저장 중...' : '저장'}
                        </button>
                      </div>
                    </div>
                  )}
                  {loadOpen && (
                    <div className="absolute top-full right-0 mt-1 z-30 w-72 p-3 rounded-xl border border-white/60 bg-white/95 backdrop-blur shadow-lg animate-slide-up">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-medium text-foreground">저장된 포트폴리오</p>
                        {saved.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold leading-none">
                            {saved.length}
                          </span>
                        )}
                      </div>
                      {saved.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4 text-center">저장된 포트폴리오가 없습니다.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {saved.map((sim) => {
                            const isActive = sim.id === activeId
                            return (
                              <div
                                key={sim.id}
                                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                                  isActive ? 'border-primary/50 bg-primary/10' : 'border-white/50 bg-white/50'
                                }`}
                              >
                                <button onClick={() => handleLoad(sim)} className="flex-1 min-w-0 text-left">
                                  <p className="text-xs font-medium text-foreground truncate">
                                    {sim.simulation_name}
                                    {isActive && <span className="ml-1.5 text-[9px] text-primary font-semibold">적용됨</span>}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {new Date(sim.created_at).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })}
                                    {' · '}수익 {sim.expected_return_rate.toFixed(1)}%
                                  </p>
                                </button>
                                <button
                                  onClick={() => handleDelete(sim.id)}
                                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-white/70 transition-all shrink-0"
                                  aria-label={`${sim.simulation_name} 삭제`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 pt-1 pb-3">
            <div className="grid grid-cols-4 items-center gap-3">
              {/* col 1: 파이차트 */}
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={38} outerRadius={60} paddingAngle={2} stroke="none">
                      {pieData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.95)', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* col 2: 범례 */}
              <div className="space-y-1.5">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-[15px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="truncate">{d.name} {d.value}%</span>
                  </div>
                ))}
              </div>
              {/* col 3-4: 경고/적정 카드 2개 */}
              <div className="col-span-2 space-y-2">
                {riskSum > 70 ? (
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-gradient-to-r from-red-50 to-rose-50/40 border border-red-200/60">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-red-600">위험자산 비중 한도 초과</p>
                      <p className="text-[13px] text-red-500/80 mt-0.5">법정 한도 70% / 현재 <span className="font-semibold text-red-600">{riskSum}%</span></p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50/40 border border-emerald-200/60">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-emerald-700">위험자산 비중 한도 적정</p>
                      <p className="text-[13px] text-emerald-600/80 mt-0.5">법정 한도 70% / 현재 <span className="font-semibold">{riskSum}%</span></p>
                    </div>
                  </div>
                )}
                {concMsgs.length > 0 ? (
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/40 border border-amber-200/60">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-amber-700">분산투자 권장</p>
                      <p className="text-[13px] text-amber-600/80 mt-0.5">{concMsgs.join(' · ')} · 2개 이상 상품 선택을 권장합니다</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50/40 border border-emerald-200/60">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-emerald-700">분산투자 적정</p>
                      <p className="text-[13px] text-emerald-600/80 mt-0.5">다양한 자산에 투자되어 균형 있는 포트폴리오를 유지하고 있습니다</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 포트폴리오 구성 */}
      <Card className="glass border-0 animate-slide-up">
        <CardHeader className="pb-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <CardTitle className="text-lg flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-400 flex items-center justify-center shadow-md">
                  <SlidersHorizontal className="w-4 h-4 text-white" />
                </div>
                포트폴리오 구성
              </CardTitle>
              <p className="text-[13.5px] text-muted-foreground truncate">자산군 비중을 조절하고 편입 상품을 선택하세요 · 고위험 자산군은 복수 분산 가능</p>
            </div>
            <div className="flex gap-2">
              {([['safe', '안정형'], ['balanced', '균형형'], ['growth', '수익추구형']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                    activePreset === key
                      ? 'border-primary bg-primary text-white shadow-sm'
                      : 'border-primary/30 bg-white text-primary hover:bg-primary/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          <div className={`flex items-center gap-4 mb-3 px-4 py-3 rounded-xl border transition-colors ${
            total === 100 ? 'bg-emerald-50/60 border-emerald-200/60' : 'bg-red-50/40 border-red-200/40'
          }`}>
            {/* 합계 블록 */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[13.5px] text-muted-foreground">합계</span>
              <span className={`tabular-nums inline-block min-w-[3.5ch] text-right text-[15.5px] font-bold ${
                total === 100 ? 'text-emerald-600' : 'text-destructive'
              }`}>
                {total}%
              </span>
            </div>
            {/* 구분선 */}
            <span className="w-px h-5 bg-border/40 shrink-0" />
            {/* 위험자산 블록 */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[13.5px] text-muted-foreground">위험자산</span>
              <span className={`tabular-nums inline-block min-w-[3ch] text-right text-[15.5px] font-bold ${
                riskSum > 70 ? 'text-destructive' : 'text-foreground'
              }`}>
                {riskSum}%
              </span>
              <span className="text-[13.5px] text-muted-foreground">/ 한도 70%</span>
              <div className="w-16 h-1.5 rounded-full bg-black/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${riskSum > 70 ? 'bg-red-400' : 'bg-emerald-400'}`}
                  style={{ width: `${Math.min((riskSum / 70) * 100, 100)}%` }}
                />
              </div>
            </div>
            {/* 버튼 */}
            <button
              onClick={normalize}
              className={`ml-auto shrink-0 px-3 py-1 text-[13.5px] rounded-lg font-medium hover:opacity-90 transition-all ${
                total === 100
                  ? 'bg-transparent text-emerald-600 border border-emerald-300 opacity-30'
                  : 'bg-destructive/70 text-white/100'
              }`}
            >
              100%로 자동 조정
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {classes.map((cls) => {
              const w = weights[cls.class_code] || 0
              const sel = selected[cls.class_code] || []
              const selProds = cls.products.filter((p) => sel.includes(p.id))
              const cRet = classReturnByCode(cls.class_code)
              return (
                <div
                  key={cls.class_code}
                  className="rounded-2xl border bg-white/40 overflow-hidden"
                  style={{ borderColor: `${cls.color}70` }}
                >
                  {/* 헤더 */}
                  <div
                    className="flex items-center gap-2 px-3 py-2.5"
                    style={{ background: `${cls.color}1a` }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cls.color }} />
                    <span className="text-[13.5px] font-semibold text-foreground truncate">{cls.class_name}</span>
                    {cls.is_risk && (
                      <span className="text-[10.5px] font-medium px-1.5 py-0.5 rounded-md bg-red-100 text-red-500 shrink-0">위험</span>
                    )}
                    <span className="ml-auto text-[15.5px] font-bold text-foreground shrink-0">{w}%</span>
                  </div>

                  {/* 슬라이더 */}
                  <div className="px-3 pt-3 pb-1">
                    <div className="relative pb-4">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={w}
                        onChange={(e) => updateWeight(cls.class_code, parseInt(e.target.value))}
                        aria-label={`${cls.class_name} 비중`}
                        className="cd-slider w-full"
                        style={{ '--val': `${w}%`, '--color': cls.color } as CSSProperties}
                      />
                      <div className="absolute bottom-0 left-0.5 right-0.5 flex justify-between">
                        {[0, 25, 50, 75, 100].map((t) => (
                          <span key={t} className="text-[10.5px] text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    </div>
                    {cRet !== null && (
                      <p className="text-[11.5px] text-muted-foreground mb-1">적용 수익률 <span className="font-semibold text-emerald-600">+{cRet.toFixed(1)}%</span></p>
                    )}
                  </div>

                  {/* 상품 목록 */}
                  <div className="p-2.5 space-y-1.5">
                    {w === 0 ? (
                      <p className="text-[13.5px] text-muted-foreground text-center py-3">비중 0%</p>
                    ) : (
                      <>
                        {cls.products.map((p) => {
                          const checked = sel.includes(p.id)
                          return (
                            <label
                              key={p.id}
                              className={`flex flex-col gap-1 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                                checked
                                  ? 'border-primary/40 bg-primary/5'
                                  : 'border-border bg-white/70 hover:bg-white/90'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <input
                                  type={cls.allow_multi ? 'checkbox' : 'radio'}
                                  name={`sel-${cls.class_code}`}
                                  checked={checked}
                                  onChange={() => toggleProd(cls.class_code, p.id, cls.allow_multi)}
                                  className="w-3.5 h-3.5 accent-primary cursor-pointer shrink-0 mt-0.5"
                                />
                                <span className="text-[13.5px] text-foreground leading-snug">{p.name}</span>
                              </div>
                              <div className="flex items-center justify-between pl-5">
                                <span className="text-[13.5px] font-semibold text-emerald-600">+{p.return_rate.toFixed(1)}%</span>
                                {p.tag && (
                                  <span className={`text-[11.5px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                                    p.tag === '수익률 1위' ? 'bg-primary/15 text-primary' : 'bg-white/60 text-muted-foreground'
                                  }`}>
                                    {p.tag}
                                  </span>
                                )}
                              </div>
                            </label>
                          )
                        })}
                        {cls.allow_multi && selProds.length > 1 && (
                          <p className="flex items-center gap-1 text-[11.5px] text-primary pt-0.5">
                            <Info className="w-3 h-3" />
                            {selProds.length}개 분산 · 각 {(w / selProds.length).toFixed(1)}%
                          </p>
                        )}
                        {cls.allow_multi && selProds.length <= 1 && (
                          <p className="flex items-center gap-1 text-[11.5px] text-muted-foreground pt-0.5">
                            <Info className="w-3 h-3" />
                            복수 선택 시 균등 분산
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

        </CardContent>
      </Card>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium shadow-lg animate-slide-up">
          <Check className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  )
}

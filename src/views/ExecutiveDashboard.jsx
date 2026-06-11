import React, { useState } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useOperationalMetrics } from '../hooks/useOperationalMetrics';
import { UPD_TARGET, HC_DESIGN_TOTAL, HPT_OBJECTIVE } from '../data/constants';
import { historicalDays } from '../data/mockData';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  Users,
  Zap,
  Activity,
  Target,
  Clock
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────

/** Standard KPI card with a bottom accent line and delta indicator */
function KpiCard({ label, value, sub, accent = false, deltaType = 'neutral', icon: Icon, footnote }) {
  const colorMap = {
    success: { bar: 'bg-emerald-500', text: 'text-emerald-400', icon: 'text-emerald-400' },
    danger: { bar: 'bg-red-700', text: 'text-red-400', icon: 'text-red-400' },
    warning: { bar: 'bg-yellow-500', text: 'text-yellow-400', icon: 'text-yellow-400' },
    neutral: { bar: 'bg-brand-accent', text: 'text-brand-accent', icon: 'text-brand-accent' },
    fixed: { bar: 'bg-blue-500', text: 'text-blue-400', icon: 'text-blue-400' },
  };
  const c = colorMap[deltaType] || colorMap.neutral;
  return (
    <div className={`relative bg-brand-card rounded border border-brand-border flex flex-col justify-between p-4 h-28 overflow-hidden group hover:border-opacity-80 transition-all`}>
      {/* Accent top border */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${c.bar}`} />
      {/* Label row */}
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary leading-tight pr-2">{label}</span>
        {Icon && <Icon size={14} className={c.icon} />}
      </div>
      {/* Value */}
      <div className={`text-2xl font-extrabold tracking-tight ${c.text}`}>{value}</div>
      {/* Sub-label / footnote */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-brand-text-muted leading-tight">{sub}</span>
        {footnote && <span className="text-[9px] text-brand-text-muted/60 italic">{footnote}</span>}
      </div>
    </div>
  );
}

/** Operational traffic light badge */
function StatusBadge({ status, label }) {
  const map = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    danger: 'bg-red-700/10 text-red-400 border-red-700/30',
  };
  const dotMap = {
    success: 'bg-emerald-400',
    warning: 'bg-yellow-400',
    danger: 'bg-red-500 animate-pulse',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${map[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotMap[status]}`} />
      {label}
    </span>
  );
}

/** Coverage colour logic (shared between heatmap and risk table) */
function getCoverageStatus(coverage, isCritical) {
  if (coverage < 85) return 'danger';
  if (coverage < 91) return 'warning';
  return 'success';
}

const statusLabels = { success: 'Normal', warning: 'Alert', danger: 'Critical' };

/** Heatmap card per area */
function AreaHeatCard({ area, onClick, isSelected }) {
  const coverage = area.hcExpected > 0 ? (area.actualPresent / area.hcExpected) * 100 : 0;
  const status = getCoverageStatus(coverage, area.isCritical);
  const barColor = {
    success: 'bg-emerald-500',
    warning: 'bg-yellow-400',
    danger: 'bg-red-600',
  }[status];
  const ringColor = {
    success: 'border-emerald-500/50',
    warning: 'border-yellow-400/50',
    danger: 'border-red-600/60',
  }[status];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-brand-bg rounded border p-4 transition-all hover:border-opacity-80 cursor-pointer ${
        isSelected ? `border-brand-accent` : `border-brand-border hover:${ringColor}`
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-brand-text-primary">{area.nombre}</span>
            {area.isCritical && (
              <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-800/40 tracking-wide">
                Critical
              </span>
            )}
          </div>
          <div className="text-[10px] text-brand-text-muted mt-0.5">
            {area.actualPresent} / {area.hcExpected} operators
          </div>
        </div>
        <StatusBadge status={status} label={statusLabels[status]} />
      </div>

      {/* Coverage progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-brand-text-muted">Coverage</span>
          <span className={`font-bold ${status === 'danger' ? 'text-red-400' : status === 'warning' ? 'text-yellow-400' : 'text-emerald-400'}`}>
            {coverage.toFixed(1)}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-brand-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(coverage, 100)}%` }}
          />
        </div>
      </div>

      {/* HC mini stats row */}
      <div className="mt-3 flex gap-3 text-[9px] text-brand-text-muted">
        <span>Design: <b className="text-brand-text-secondary">{area.hcDesign}</b></span>
        <span>Exp: <b className="text-brand-text-secondary">{area.hcExpected}</b></span>
        <span>Real: <b className="text-brand-text-secondary">{area.actualPresent}</b></span>
        <span>Δ: <b className={status === 'success' ? 'text-emerald-400' : 'text-red-400'}>{area.actualPresent - area.hcExpected}</b></span>
      </div>
    </button>
  );
}

/** Risk impact table — ranked by coverage gap */
function RiskImpactTable({ areas, totalExpected, hptObjective, hptActual }) {
  const ranked = [...areas]
    .map(a => {
      const coverage = a.hcExpected > 0 ? (a.actualPresent / a.hcExpected) * 100 : 0;
      const deficit = a.hcExpected - a.actualPresent;
      const areaHptWeight = a.hcDesign / HC_DESIGN_TOTAL;
      const hptImpact = deficit > 0 ? ((deficit * 8) / 49) * areaHptWeight : 0;
      const status = getCoverageStatus(coverage, a.isCritical);
      return { ...a, coverage, deficit, hptImpact, status };
    })
    .sort((a, b) => b.hptImpact - a.hptImpact);

  const maxImpact = Math.max(...ranked.map(a => a.hptImpact), 1);

  return (
    <div className="space-y-2.5">
      {ranked.map((area) => (
        <div key={area.nombre} className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`h-2.5 w-2.5 rounded-sm flex-shrink-0 ${
                area.status === 'success' ? 'bg-emerald-500' : area.status === 'warning' ? 'bg-yellow-400' : 'bg-red-600'
              }`} />
              <span className="text-xs font-medium text-brand-text-primary truncate">{area.nombre}</span>
              {area.isCritical && <span className="text-[8px] text-red-400">●</span>}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className={`text-xs font-bold tabular-nums ${
                area.status === 'danger' ? 'text-red-400' : area.status === 'warning' ? 'text-yellow-400' : 'text-emerald-400'
              }`}>{area.coverage.toFixed(1)}%</span>
              <span className={`text-[10px] tabular-nums ${area.hptImpact > 2 ? 'text-red-400' : 'text-brand-text-muted'}`}>
                {area.hptImpact > 0 ? `+${area.hptImpact.toFixed(1)} h` : '—'}
              </span>
              <StatusBadge status={area.status} label={statusLabels[area.status]} />
            </div>
          </div>
          {/* Horizontal impact bar */}
          <div className="h-1 w-full bg-brand-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                area.status === 'success' ? 'bg-emerald-500' : area.status === 'warning' ? 'bg-yellow-400' : 'bg-red-600'
              }`}
              style={{ width: `${Math.min((area.hptImpact / maxImpact) * 100, 100)}%` }}
            />
          </div>
        </div>
      ))}
      <div className="border-t border-brand-border pt-2.5 mt-1 flex justify-between text-[10px] text-brand-text-muted">
        <span>● = Critical Area (Bottleneck)</span>
        <span className="text-brand-text-secondary font-semibold">Δ HPT vs Obj: {(hptActual - hptObjective) > 0 ? '+' : ''}{(hptActual - hptObjective).toFixed(1)} h</span>
      </div>
    </div>
  );
}

/** Custom recharts tooltip styled to match Fabric dark theme */
const FabricTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1D1D1D] border border-[#2D2D2D] rounded shadow-2xl px-3 py-2.5 text-xs font-segoe">
      <div className="text-[#A19F9D] mb-1.5 font-semibold">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-[#A19F9D]">{p.name}:</span>
          <span className="font-bold text-[#F3F2F1]">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}{p.unit || ''}</span>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Main Dashboard Component
// ─────────────────────────────────────────────────────────────────

export default function ExecutiveDashboard() {
  const { displaySnapshot } = useApp();
  const metrics = useOperationalMetrics(displaySnapshot);
  const [selectedArea, setSelectedArea] = useState(null);

  const hcContratado = displaySnapshot?.hcContratado ?? HC_DESIGN_TOTAL;

  // KPI Row 1 — Headcount chain
  const kpiRowOne = [
    {
      id: 'upd',
      label: 'UPD Target',
      value: `${UPD_TARGET.toFixed(0)}`,
      sub: 'Units per day — Fixed',
      icon: Target,
      deltaType: 'fixed',
    },
    {
      id: 'hc-design',
      label: 'Design HC',
      value: HC_DESIGN_TOTAL.toLocaleString(),
      sub: 'Industrial Engineering Standard',
      icon: Users,
      deltaType: 'fixed',
    },
    {
      id: 'hc-contratado',
      label: 'Contracted HC',
      value: hcContratado.toLocaleString(),
      sub: `Gap: ${HC_DESIGN_TOTAL - hcContratado} vacancies vs design`,
      icon: Users,
      deltaType: HC_DESIGN_TOTAL - hcContratado > 50 ? 'danger' : HC_DESIGN_TOTAL - hcContratado > 20 ? 'warning' : 'success',
    },
    {
      id: 'hc-expected',
      label: 'Expected Shift HC',
      value: (displaySnapshot?.hcExpectedTotal ?? 0).toLocaleString(),
      sub: `Vs Design: ${HC_DESIGN_TOTAL - (displaySnapshot?.hcExpectedTotal ?? 0)} people`,
      icon: Clock,
      deltaType: 'neutral',
    },
    {
      id: 'hc-presente',
      label: 'Present HC',
      value: metrics.totalPresent.toLocaleString(),
      sub: `Deficit: ${metrics.totalExpected - metrics.totalPresent} operators`,
      icon: Users,
      deltaType: metrics.coberturaGeneral < 85 ? 'danger' : metrics.coberturaGeneral < 91 ? 'warning' : 'success',
    },
    {
      id: 'cobertura',
      label: 'Operational Coverage',
      value: `${metrics.coberturaGeneral.toFixed(1)}%`,
      sub: `vs Expected Shift HC`,
      icon: Activity,
      deltaType: metrics.coberturaGeneral < 85 ? 'danger' : metrics.coberturaGeneral < 91 ? 'warning' : 'success',
    },
  ];

  // KPI Row 2 — HPT & Risk
  const hptDelta = metrics.hptActual - HPT_OBJECTIVE;
  const kpiRowTwo = [
    {
      id: 'hpt-obj',
      label: 'Target HPT',
      value: `${HPT_OBJECTIVE.toFixed(1)} hrs`,
      sub: `Design hrs / 49 UPD`,
      icon: Target,
      deltaType: 'fixed',
    },
    {
      id: 'hpt-actual',
      label: 'Actual HPT',
      value: `${metrics.hptActual.toFixed(1)} hrs`,
      sub: `With ${displaySnapshot?.otHabilitada ? 'OT enabled' : 'No OT'} — active shift`,
      icon: Clock,
      deltaType: hptDelta > 20 ? 'danger' : hptDelta > 8 ? 'warning' : 'success',
    },
    {
      id: 'hpt-variacion',
      label: 'HPT Variation',
      value: `${hptDelta > 0 ? '+' : ''}${metrics.hptDiferencia.toFixed(1)}%`,
      sub: `${hptDelta > 0 ? '+' : ''}${hptDelta.toFixed(1)} hrs over target`,
      icon: hptDelta > 0 ? TrendingUp : hptDelta < 0 ? TrendingDown : Minus,
      deltaType: hptDelta > 20 ? 'danger' : hptDelta > 8 ? 'warning' : hptDelta > 0 ? 'warning' : 'success',
    },
    {
      id: 'riesgo',
      label: 'Operational Risk',
      value: `${metrics.riesgoScore}%`,
      sub: `Level: ${metrics.riesgoNivel}`,
      icon: metrics.riesgoScore >= 70 ? XCircle : metrics.riesgoScore >= 45 ? AlertTriangle : CheckCircle,
      deltaType: metrics.riesgoScore >= 70 ? 'danger' : metrics.riesgoScore >= 45 ? 'warning' : 'success',
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── ROW 1: Headcount KPI Cards ── */}
      <section>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text-muted">
            Headcount Chain
          </span>
          <ChevronRight size={10} className="text-brand-text-muted" />
          <span className="text-[10px] text-brand-text-muted/60">Design HC → Contracted → Expected → Present → Coverage</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {kpiRowOne.map((kpi) => (
            <KpiCard key={kpi.id} {...kpi} />
          ))}
        </div>
      </section>

      {/* ── ROW 2: HPT & Risk KPI Cards ── */}
      <section>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text-muted">
            Hours Per Truck (HPT) and Operational Risk
          </span>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {kpiRowTwo.map((kpi) => (
            <KpiCard key={kpi.id} {...kpi} />
          ))}
        </div>
      </section>

      {/* ── ROW 3: Heatmap + Risk Table ── */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Heatmap — occupies 3/5 */}
        <div className="lg:col-span-3 bg-brand-card border border-brand-border rounded">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">
                Operational Plant Heatmap
              </h3>
              <p className="text-[10px] text-brand-text-muted mt-0.5">
                Coverage vs Expected HC by Area — active shift
              </p>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-brand-text-muted">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-500" /> &ge;95%</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-yellow-400" /> 90–95%</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-600" /> &lt;90%</span>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(() => {
              const ramas = metrics.ramasEnriched || [];

              // 3 subAreas of ASSEMBLY: ASSEMBLY w/ KF LOGS, KF LOGISTICS, ASSEMBLY INDIRECT
              const assembly = ramas.find(r => r.id === 'assembly');
              const assemblySubAreas = (assembly?.subAreas || []);

              // FABRICATION as a single block (no drill-down here)
              const fabrication = ramas.find(r => r.id === 'fabrication');

              const heatCards = [
                ...assemblySubAreas,
                ...(fabrication ? [fabrication] : []),
              ];

              return heatCards.map((area) => (
                <AreaHeatCard
                  key={area.id || area.nombre}
                  area={area}
                  isSelected={selectedArea === area.nombre}
                  onClick={() => setSelectedArea(prev => prev === area.nombre ? null : area.nombre)}
                />
              ));
            })()}
          </div>
        </div>

        {/* Risk Impact Table — occupies 2/5 */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">
                Top Risk by Area
              </h3>
              <p className="text-[10px] text-brand-text-muted mt-0.5">
                Ranked by HPT impact — highest deviation first
              </p>
            </div>
            <div className={`text-[10px] font-bold px-2.5 py-1 rounded border ${
              metrics.riesgoNivel === 'Critical'
                ? 'bg-red-900/20 text-red-400 border-red-700/40'
                : metrics.riesgoNivel === 'High'
                ? 'bg-yellow-900/20 text-yellow-400 border-yellow-600/40'
                : 'bg-emerald-900/20 text-emerald-400 border-emerald-700/40'
            }`}>
              {metrics.riesgoNivel}
            </div>
          </div>
          <div className="flex-1 px-5 py-4 overflow-y-auto">
            <RiskImpactTable
              areas={metrics.details || []}
              totalExpected={metrics.totalExpected}
              hptObjective={HPT_OBJECTIVE}
              hptActual={metrics.hptActual}
            />
          </div>
          {/* OT Status Footer */}
          <div className={`px-5 py-3 border-t border-brand-border text-[10px] flex items-center gap-2 ${
            displaySnapshot?.otHabilitada ? 'text-yellow-400' : 'text-brand-text-muted'
          }`}>
            <Zap size={11} className={displaySnapshot?.otHabilitada ? 'text-yellow-400' : 'text-brand-text-muted'} />
            <span>
              Overtime: <b>{displaySnapshot?.otHabilitada ? 'Enabled — compensating deficit' : 'Disabled — higher risk'}</b>
            </span>
          </div>
        </div>
      </section>

      {/* ── ROW 4: 30-Day Historical Trend ── */}
      <section className="bg-brand-card border border-brand-border rounded">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">
              Historical Trend — Last 30 Days
            </h3>
            <p className="text-[10px] text-brand-text-muted mt-0.5">
              Operational Coverage (%) and Actual HPT (hrs) — reference line HPT Obj: {HPT_OBJECTIVE}
            </p>
          </div>
          <div className="flex items-center gap-4 text-[9px] text-brand-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-5 bg-brand-accent inline-block rounded-full" />
              Coverage %
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-5 bg-yellow-400 inline-block rounded-full" />
              Actual HPT
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-5 bg-red-600 inline-block rounded-full border-dashed" style={{ borderTop: '1px dashed' }} />
              Obj HPT {HPT_OBJECTIVE}
            </span>
          </div>
        </div>

        <div className="p-5" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={historicalDays} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="covGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#118DFF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#118DFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#2D2D2D"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: '#605E5C', fontFamily: 'Segoe UI' }}
                axisLine={{ stroke: '#2D2D2D' }}
                tickLine={false}
                interval={3}
              />
              <YAxis
                yAxisId="left"
                domain={[80, 100]}
                tick={{ fontSize: 9, fill: '#605E5C', fontFamily: 'Segoe UI' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                width={36}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[230, 300]}
                tick={{ fontSize: 9, fill: '#605E5C', fontFamily: 'Segoe UI' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}h`}
                width={38}
              />
              <Tooltip content={<FabricTooltip />} />
              <ReferenceLine
                yAxisId="right"
                y={HPT_OBJECTIVE}
                stroke="#A80000"
                strokeDasharray="4 3"
                strokeWidth={1.5}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="coberturaReal"
                name="Coverage"
                unit="%"
                stroke="#118DFF"
                strokeWidth={2}
                fill="url(#covGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: '#118DFF' }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="actualHpt"
                name="Actual HPT"
                unit=" hrs"
                stroke="#F1C40F"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: '#F1C40F' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats strip below chart */}
        <div className="border-t border-brand-border px-5 py-3 grid grid-cols-4 gap-4 text-[10px]">
          {[
            {
              label: '30d Average Coverage',
              value: `${(historicalDays.reduce((s, d) => s + d.coberturaReal, 0) / historicalDays.length).toFixed(1)}%`,
              col: 'text-brand-accent'
            },
            {
              label: '30d Average HPT',
              value: `${(historicalDays.reduce((s, d) => s + d.actualHpt, 0) / historicalDays.length).toFixed(1)} hrs`,
              col: 'text-yellow-400'
            },
            {
              label: 'Days over Target HPT',
              value: `${historicalDays.filter(d => d.actualHpt > HPT_OBJECTIVE).length}/${historicalDays.length}`,
              col: 'text-red-400'
            },
            {
              label: 'Days with Coverage < 90%',
              value: `${historicalDays.filter(d => d.coberturaReal < 90).length}/${historicalDays.length}`,
              col: 'text-red-400'
            }
          ].map((item, i) => (
            <div key={i} className="space-y-0.5">
              <div className="text-brand-text-muted">{item.label}</div>
              <div className={`font-bold text-sm ${item.col}`}>{item.value}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

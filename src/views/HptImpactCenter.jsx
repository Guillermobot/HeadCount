import React, { useState } from 'react';
import {
  ComposedChart,
  ScatterChart,
  Scatter,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useOperationalMetrics } from '../hooks/useOperationalMetrics';
import { HC_DESIGN_TOTAL, HPT_OBJECTIVE, HOURS_PER_SHIFT } from '../data/constants';
import { historicalDays } from '../data/mockData';
import {
  TrendingUp, TrendingDown, Minus,
  Zap, AlertTriangle, CheckCircle,
  Info
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

const FabricTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1D1D1D] border border-[#2D2D2D] rounded shadow-2xl px-3 py-2.5 text-xs font-segoe min-w-[160px]">
      <div className="text-[#A19F9D] font-semibold mb-1.5">{label}</div>
      {payload.map((p) => (
        <div key={p.name || p.dataKey} className="flex items-center justify-between gap-3 py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
            <span className="text-[#A19F9D]">{p.name}</span>
          </span>
          <span className="font-bold text-[#F3F2F1] tabular-nums">
            {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}{p.unit || ''}
          </span>
        </div>
      ))}
    </div>
  );
};

const ScatterTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-[#1D1D1D] border border-[#2D2D2D] rounded shadow-2xl px-3 py-2.5 text-xs">
      <div className="text-[#A19F9D] font-semibold mb-1.5">{d.label}</div>
      <div className="space-y-0.5">
        <div className="flex justify-between gap-4">
          <span className="text-[#A19F9D]">Cobertura:</span>
          <span className="font-bold text-[#118DFF]">{d.x?.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#A19F9D]">HPT Actual:</span>
          <span className="font-bold text-[#F1C40F]">{d.y?.toFixed(1)} hrs</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#A19F9D]">Riesgo:</span>
          <span className={`font-bold ${d.riskScore >= 70 ? 'text-red-400' : d.riskScore >= 45 ? 'text-yellow-400' : 'text-emerald-400'}`}>
            {d.riskScore}%
          </span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────

export default function HptImpactCenter() {
  const { displaySnapshot, filters } = useApp();
  const metrics = useOperationalMetrics(displaySnapshot);
  const [activeSection, setActiveSection] = useState('waterfall'); // 'waterfall' | 'scatter'

  const hptDelta = metrics.hptActual - HPT_OBJECTIVE;
  const hptDeltaPct = metrics.hptDiferencia;

  // ── Waterfall data: start from HPT Obj, each area adds its contribution ──
  const waterfallData = (() => {
    const areas = metrics.details || [];
    let running = HPT_OBJECTIVE;
    const bars = [];

    bars.push({
      name: 'HPT Objetivo',
      base: 0,
      value: HPT_OBJECTIVE,
      fill: '#118DFF',
      isStart: true,
    });

    areas.forEach((area) => {
      const deficit = Math.max(0, area.hcExpected - area.actualPresent);
      // Contribution formula: area's weight in design × deficit hours / 49 UPD
      const areaWeight = area.hcDesign / HC_DESIGN_TOTAL;
      const contribution = displaySnapshot?.otHabilitada
        ? (deficit * HOURS_PER_SHIFT * 1.2 * areaWeight) / 49
        : 0;

      if (contribution > 0.05) {
        bars.push({
          name: area.nombre,
          base: running,
          value: parseFloat(contribution.toFixed(2)),
          fill: area.status === 'danger' ? '#A80000' : area.status === 'warning' ? '#F1C40F' : '#107C41',
          isCritical: area.isCritical,
        });
        running += contribution;
      }
    });

    bars.push({
      name: 'HPT Actual',
      base: 0,
      value: parseFloat(metrics.hptActual.toFixed(2)),
      fill: hptDelta > 20 ? '#A80000' : hptDelta > 8 ? '#F1C40F' : '#107C41',
      isEnd: true,
    });

    return bars;
  })();

  // ── Scatter plot data from history ──
  const scatterData = historicalDays.map((d) => ({
    label: d.label,
    x: d.coberturaReal,      // Coverage %
    y: d.actualHpt,           // HPT
    riskScore: d.riskScore,
    fill: d.riskScore >= 70 ? '#A80000' : d.riskScore >= 45 ? '#F1C40F' : '#107C41',
  }));

  // Today's point highlighted
  const todayPoint = {
    label: 'Hoy',
    x: parseFloat(metrics.coberturaGeneral.toFixed(1)),
    y: parseFloat(metrics.hptActual.toFixed(1)),
    riskScore: metrics.riesgoScore,
    fill: '#118DFF',
    isToday: true,
  };

  // ── Area impact table ──
  const areaImpacts = (metrics.details || []).map((area) => {
    const deficit = Math.max(0, area.hcExpected - area.actualPresent);
    const areaWeight = area.hcDesign / HC_DESIGN_TOTAL;
    const hptContrib = displaySnapshot?.otHabilitada
      ? (deficit * HOURS_PER_SHIFT * 1.2 * areaWeight) / 49
      : 0;
    return { ...area, deficit, hptContrib };
  }).sort((a, b) => b.hptContrib - a.hptContrib);

  const maxContrib = Math.max(...areaImpacts.map((a) => a.hptContrib), 1);

  return (
    <div className="space-y-5">

      {/* ── ROW 1: KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          {
            label: 'HPT Objetivo',
            value: `${HPT_OBJECTIVE.toFixed(1)} hrs`,
            sub: 'Estándar fijo — 1,498 HC × 8h ÷ 49 UPD',
            color: 'text-blue-400',
            bar: 'bg-blue-500',
            icon: <Minus size={14} className="text-blue-400" />,
          },
          {
            label: 'HPT Actual',
            value: `${metrics.hptActual.toFixed(1)} hrs`,
            sub: `${displaySnapshot?.otHabilitada ? 'Con OT habilitado' : 'Sin OT — déficit directo'}`,
            color: hptDelta > 20 ? 'text-red-400' : hptDelta > 8 ? 'text-yellow-400' : 'text-emerald-400',
            bar: hptDelta > 20 ? 'bg-red-600' : hptDelta > 8 ? 'bg-yellow-400' : 'bg-emerald-500',
            icon: hptDelta > 0
              ? <TrendingUp size={14} className="text-red-400" />
              : <TrendingDown size={14} className="text-emerald-400" />,
          },
          {
            label: 'Variación HPT',
            value: `${hptDelta > 0 ? '+' : ''}${hptDeltaPct.toFixed(1)}%`,
            sub: `${hptDelta > 0 ? '+' : ''}${hptDelta.toFixed(1)} hrs sobre el objetivo`,
            color: hptDelta > 20 ? 'text-red-400' : hptDelta > 8 ? 'text-yellow-400' : 'text-emerald-400',
            bar: hptDelta > 20 ? 'bg-red-600' : hptDelta > 8 ? 'bg-yellow-400' : 'bg-emerald-500',
            icon: hptDelta > 8
              ? <AlertTriangle size={14} className="text-yellow-400" />
              : <CheckCircle size={14} className="text-emerald-400" />,
          },
          {
            label: 'Tiempo Extra (OT)',
            value: displaySnapshot?.otHabilitada ? 'Habilitado' : 'Deshabilitado',
            sub: displaySnapshot?.otHabilitada
              ? 'Mitiga déficit — eleva HPT por ineficiencia'
              : 'Sin compensación — riesgo de no completar 49 UPD',
            color: displaySnapshot?.otHabilitada ? 'text-yellow-400' : 'text-brand-text-secondary',
            bar: displaySnapshot?.otHabilitada ? 'bg-yellow-400' : 'bg-brand-border',
            icon: <Zap size={14} className={displaySnapshot?.otHabilitada ? 'text-yellow-400' : 'text-brand-text-muted'} />,
          },
        ].map((k, i) => (
          <div key={i} className="relative bg-brand-card border border-brand-border rounded p-4 h-28 flex flex-col justify-between overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${k.bar}`} />
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary pr-2 leading-tight">{k.label}</span>
              {k.icon}
            </div>
            <div className={`text-2xl font-extrabold tracking-tight ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-brand-text-muted leading-tight">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── ROW 2: Waterfall + Area Impact Table ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* Waterfall Chart — 3/5 */}
        <div className="xl:col-span-3 bg-brand-card border border-brand-border rounded flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">
                Cascada de Impacto en HPT por Área
              </h3>
              <p className="text-[10px] text-brand-text-muted mt-0.5">
                Cómo el déficit de personal de cada área suma horas al HPT Objetivo de {HPT_OBJECTIVE} hrs
              </p>
            </div>
            {/* OT Warning */}
            {!displaySnapshot?.otHabilitada && (
              <div className="flex items-center gap-1.5 text-[10px] text-yellow-400 bg-yellow-900/10 border border-yellow-700/30 px-2.5 py-1 rounded">
                <Info size={10} />
                Sin OT — no se computa cascada de horas extra
              </div>
            )}
          </div>

          <div className="p-5" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={waterfallData} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: '#605E5C', fontFamily: 'Segoe UI' }}
                  axisLine={{ stroke: '#2D2D2D' }}
                  tickLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={42}
                />
                <YAxis
                  domain={[230, Math.ceil(metrics.hptActual + 10)]}
                  tick={{ fontSize: 9, fill: '#605E5C' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}h`}
                  width={38}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <div className="bg-[#1D1D1D] border border-[#2D2D2D] rounded px-3 py-2 text-xs">
                        <div className="text-[#A19F9D] font-semibold mb-1">{d?.name}</div>
                        {d?.isStart && <div className="text-[#118DFF] font-bold">HPT Objetivo: {d.value} hrs</div>}
                        {d?.isEnd && <div className="font-bold" style={{ color: d.fill }}>HPT Actual: {d.value} hrs</div>}
                        {!d?.isStart && !d?.isEnd && (
                          <>
                            <div className="text-[#A19F9D]">Contribución: <b className="text-[#F3F2F1]">+{d?.value?.toFixed(2)} hrs</b></div>
                            {d?.isCritical && <div className="text-red-400 mt-0.5 text-[9px]">⚠ Área Crítica</div>}
                          </>
                        )}
                      </div>
                    );
                  }}
                />
                <ReferenceLine y={HPT_OBJECTIVE} stroke="#118DFF" strokeDasharray="4 3" strokeWidth={1.5} />
                {/* Base (invisible spacer) */}
                <Bar dataKey="base" stackId="stack" fill="transparent" />
                {/* Value bar */}
                <Bar dataKey="value" stackId="stack" radius={[3, 3, 0, 0]}>
                  {waterfallData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="top"
                    style={{ fontSize: 8, fill: '#A19F9D', fontFamily: 'Segoe UI' }}
                    formatter={(v, entry) => {
                      const d = waterfallData.find(w => w.value === v);
                      if (d?.isStart || d?.isEnd) return `${v}h`;
                      return v > 0.1 ? `+${v.toFixed(1)}h` : '';
                    }}
                  />
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Summary below chart */}
          <div className="border-t border-brand-border px-5 py-3 grid grid-cols-3 gap-4 text-[10px]">
            <div>
              <div className="text-brand-text-muted">HPT Objetivo</div>
              <div className="font-bold text-blue-400 text-sm">{HPT_OBJECTIVE.toFixed(1)} hrs</div>
            </div>
            <div>
              <div className="text-brand-text-muted">Desviación Absoluta</div>
              <div className={`font-bold text-sm ${hptDelta > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {hptDelta > 0 ? '+' : ''}{hptDelta.toFixed(1)} hrs
              </div>
            </div>
            <div>
              <div className="text-brand-text-muted">HPT Actual</div>
              <div className={`font-bold text-sm ${hptDelta > 20 ? 'text-red-400' : hptDelta > 8 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                {metrics.hptActual.toFixed(1)} hrs
              </div>
            </div>
          </div>
        </div>

        {/* Area Impact Table — 2/5 */}
        <div className="xl:col-span-2 bg-brand-card border border-brand-border rounded flex flex-col">
          <div className="px-5 py-3.5 border-b border-brand-border">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">
              Impacto HPT por Área
            </h3>
            <p className="text-[10px] text-brand-text-muted mt-0.5">
              Ordenado por contribución — mayor impacto primero
            </p>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-4 gap-2 px-5 py-2 border-b border-brand-border bg-brand-bg/30 text-[9px] font-bold uppercase tracking-wider text-brand-text-muted">
            <span className="col-span-2">Área</span>
            <span className="text-center">Déficit</span>
            <span className="text-right">+HPT</span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
            {areaImpacts.map((area) => {
              const fillColor = area.status === 'danger' ? '#A80000' : area.status === 'warning' ? '#F1C40F' : '#107C41';
              const textColor = area.status === 'danger' ? 'text-red-400' : area.status === 'warning' ? 'text-yellow-400' : 'text-emerald-400';
              return (
                <div key={area.nombre} className="space-y-1">
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <div className="col-span-2 flex items-center gap-1.5 min-w-0">
                      <div className="h-2 w-2 rounded-sm flex-shrink-0" style={{ backgroundColor: fillColor }} />
                      <span className="text-[10px] text-brand-text-primary truncate">{area.nombre}</span>
                      {area.isCritical && <span className="text-[8px] text-red-400 flex-shrink-0">●</span>}
                    </div>
                    <div className="text-center">
                      <span className={`text-[11px] font-bold tabular-nums ${area.deficit > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {area.deficit > 0 ? `-${area.deficit}` : '0'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[11px] font-bold tabular-nums ${textColor}`}>
                        {area.hptContrib > 0.05 ? `+${area.hptContrib.toFixed(1)}h` : '—'}
                      </span>
                    </div>
                  </div>
                  {/* Impact bar */}
                  <div className="h-1 w-full bg-brand-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((area.hptContrib / maxContrib) * 100, 100)}%`,
                        backgroundColor: fillColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-brand-border px-5 py-3 text-[10px] text-brand-text-muted flex justify-between">
            <span>● = Área Crítica (Bottleneck)</span>
            <span className="text-brand-text-secondary">
              Total: <b className={hptDelta > 0 ? 'text-red-400' : 'text-emerald-400'}>
                {hptDelta > 0 ? '+' : ''}{hptDelta.toFixed(1)} hrs
              </b>
            </span>
          </div>
        </div>
      </div>

      {/* ── ROW 3: Scatter Plot + Historical Trend ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* Scatter Plot — 2/5 */}
        <div className="xl:col-span-2 bg-brand-card border border-brand-border rounded flex flex-col">
          <div className="px-5 py-3.5 border-b border-brand-border">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">
              Correlación: Cobertura vs HPT
            </h3>
            <p className="text-[10px] text-brand-text-muted mt-0.5">
              30 días — zona verde = operación estable
            </p>
          </div>
          <div className="flex-1 p-4" style={{ minHeight: 240 }}>
            <ResponsiveContainer width="100%" height={240}>
              <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                {/* Comfort zone shading */}
                <ReferenceArea
                  x1={93} x2={100}
                  y1={230} y2={250}
                  fill="#107C41"
                  fillOpacity={0.07}
                  stroke="#107C41"
                  strokeOpacity={0.2}
                  strokeDasharray="3 3"
                  label={{ value: 'Zona Estable', position: 'insideTopLeft', fontSize: 8, fill: '#107C41' }}
                />
                <ReferenceArea
                  x1={85} x2={93}
                  y1={250} y2={295}
                  fill="#A80000"
                  fillOpacity={0.05}
                  stroke="#A80000"
                  strokeOpacity={0.15}
                  strokeDasharray="3 3"
                />
                <XAxis
                  type="number" dataKey="x"
                  domain={[82, 100]}
                  tick={{ fontSize: 8, fill: '#605E5C' }}
                  axisLine={{ stroke: '#2D2D2D' }}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  label={{ value: 'Cobertura %', position: 'insideBottom', offset: -2, fontSize: 8, fill: '#605E5C' }}
                />
                <YAxis
                  type="number" dataKey="y"
                  domain={[230, 295]}
                  tick={{ fontSize: 8, fill: '#605E5C' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}h`}
                  width={34}
                />
                <Tooltip content={<ScatterTooltip />} />
                <ReferenceLine y={HPT_OBJECTIVE} stroke="#118DFF" strokeDasharray="4 2" strokeWidth={1} />
                {/* Historical dots */}
                <Scatter data={scatterData} name="Histórico">
                  {scatterData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} fillOpacity={0.7} />
                  ))}
                </Scatter>
                {/* Today highlighted */}
                <Scatter data={[todayPoint]} name="Hoy">
                  <Cell fill="#118DFF" />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="border-t border-brand-border px-5 py-2.5 flex gap-4 text-[9px] text-brand-text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-600" /> Bajo Riesgo</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow-400" /> Medio</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-600" /> Crítico</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400" /> Hoy</span>
          </div>
        </div>

        {/* Historical Line — 3/5 */}
        <div className="xl:col-span-3 bg-brand-card border border-brand-border rounded flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">
                Tendencia HPT — Últimos 30 Días
              </h3>
              <p className="text-[10px] text-brand-text-muted mt-0.5">
                HPT real diario vs. referencia fija de {HPT_OBJECTIVE} hrs
              </p>
            </div>
            <div className="flex items-center gap-4 text-[9px] text-brand-text-muted">
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-yellow-400 inline-block" /> HPT Real</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-red-600 inline-block border-dashed border-t" /> Objetivo {HPT_OBJECTIVE}</span>
            </div>
          </div>
          <div className="flex-1 p-5" style={{ minHeight: 240 }}>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={historicalDays} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="hptGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F1C40F" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F1C40F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: '#605E5C' }}
                  axisLine={{ stroke: '#2D2D2D' }}
                  tickLine={false}
                  interval={3}
                />
                <YAxis
                  domain={[230, 295]}
                  tick={{ fontSize: 9, fill: '#605E5C' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}h`}
                  width={38}
                />
                <Tooltip content={<FabricTooltip />} />
                <ReferenceLine y={HPT_OBJECTIVE} stroke="#A80000" strokeDasharray="4 3" strokeWidth={1.5} />
                <Area
                  type="monotone"
                  dataKey="actualHpt"
                  name="HPT Real"
                  unit=" hrs"
                  stroke="#F1C40F"
                  strokeWidth={2}
                  fill="url(#hptGrad)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: '#F1C40F' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          {/* Stats strip */}
          <div className="border-t border-brand-border px-5 py-3 grid grid-cols-4 gap-4 text-[10px]">
            {[
              {
                label: 'Promedio HPT 30d',
                value: `${(historicalDays.reduce((s, d) => s + d.actualHpt, 0) / historicalDays.length).toFixed(1)} hrs`,
                color: 'text-yellow-400',
              },
              {
                label: 'Días sobre Objetivo',
                value: `${historicalDays.filter((d) => d.actualHpt > HPT_OBJECTIVE).length}/${historicalDays.length}`,
                color: 'text-red-400',
              },
              {
                label: 'HPT Máx. 30d',
                value: `${Math.max(...historicalDays.map((d) => d.actualHpt)).toFixed(1)} hrs`,
                color: 'text-red-400',
              },
              {
                label: 'HPT Mín. 30d',
                value: `${Math.min(...historicalDays.map((d) => d.actualHpt)).toFixed(1)} hrs`,
                color: 'text-emerald-400',
              },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-brand-text-muted">{item.label}</div>
                <div className={`font-bold text-sm mt-0.5 ${item.color}`}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

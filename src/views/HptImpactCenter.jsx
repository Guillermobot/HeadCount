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
  Info, ChevronDown, ChevronRight,
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
          <span className="text-[#A19F9D]">Coverage:</span>
          <span className="font-bold text-[#118DFF]">{d.x?.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#A19F9D]">HPT Actual:</span>
          <span className="font-bold text-[#F1C40F]">{d.y?.toFixed(1)} hrs</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#A19F9D]">Risk:</span>
          <span className={`font-bold ${d.riskScore >= 70 ? 'text-red-400' : d.riskScore >= 45 ? 'text-yellow-400' : 'text-emerald-400'}`}>
            {d.riskScore}%
          </span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Node metric calculator
// ─────────────────────────────────────────────────────────────────

/** Given any node with hcDesign / hcExpected / actualPresent, compute the 3 KPIs */
function calcNodeMetrics(node, otEnabled) {
  const expected = node.hcExpected || 0;
  const present  = node.actualPresent || 0;
  const design   = node.hcDesign || 0;

  const attendance     = expected > 0 ? (present / expected) * 100 : 100;
  const opCapacity     = design   > 0 ? (present / design)   * 100 : 100;
  const deficit        = Math.max(0, expected - present);
  const designWeight   = HC_DESIGN_TOTAL > 0 ? design / HC_DESIGN_TOTAL : 0;
  const hptImpact      = otEnabled
    ? (deficit * HOURS_PER_SHIFT * 1.2 * designWeight) / 49
    : 0;

  const status =
    opCapacity < 85 ? 'danger' :
    opCapacity < 92 ? 'warning' : 'success';

  return { attendance, opCapacity, hptImpact, deficit, status };
}

// ─────────────────────────────────────────────────────────────────
// StatusPill
// ─────────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg = {
    success: 'bg-emerald-900/20 text-emerald-400 border-emerald-700/40',
    warning: 'bg-yellow-900/20 text-yellow-400 border-yellow-600/40',
    danger:  'bg-red-900/20   text-red-400   border-red-700/40',
  }[status];
  const label = { success: 'Normal', warning: 'Alert', danger: 'Critical' }[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${cfg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'danger' ? 'bg-red-500 animate-pulse' : status === 'warning' ? 'bg-yellow-400' : 'bg-emerald-400'}`} />
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// MetricMini — compact KPI pill used in drill-down rows
// ─────────────────────────────────────────────────────────────────
function MetricMini({ label, value, color }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[8px] text-brand-text-muted uppercase tracking-wider leading-none">{label}</span>
      <span className={`text-[11px] font-bold tabular-nums mt-0.5 ${color}`}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// HierarchyRow — one expandable row for a rama / subArea
// ─────────────────────────────────────────────────────────────────
function HierarchyRow({ node, depth = 0, otEnabled, expandedSet, onToggle, selectedNode, onSelect }) {
  const m = calcNodeMetrics(node, otEnabled);
  const covColor  = m.status === 'danger' ? 'text-red-400'    : m.status === 'warning' ? 'text-yellow-400' : 'text-emerald-400';
  const barColor  = m.status === 'danger' ? 'bg-red-600'      : m.status === 'warning' ? 'bg-yellow-400'   : 'bg-emerald-500';

  // Children to show when expanded — prefer subAreas, then grupos
  const children = node.subAreas?.length  ? node.subAreas
                 : node.grupos?.length     ? node.grupos
                 : [];
  const hasChildren = children.length > 0;
  const isExpanded  = expandedSet.has(node.id || node.nombre);
  const isSelected  = selectedNode?.id === node.id && selectedNode?.nombre === node.nombre;

  const paddingLeft = depth === 0 ? 'pl-4' : depth === 1 ? 'pl-8' : 'pl-12';

  const handleClick = () => {
    // Always select — also toggle expand if has children
    onSelect(node);
    if (hasChildren) onToggle(node.id || node.nombre);
  };

  return (
    <>
      <div
        className={`border-b border-brand-border transition-colors ${
          isSelected
            ? 'bg-brand-accent/10 border-l-2 border-l-brand-accent'
            : depth === 0 ? 'bg-brand-card' : depth === 1 ? 'bg-brand-bg' : 'bg-[#161616]'
        } hover:bg-brand-card/80`}
      >
        <button
          className={`w-full flex items-center gap-3 py-3 ${paddingLeft} pr-4 text-left`}
          onClick={handleClick}
        >
          {/* Expand chevron */}
          <div className="flex-shrink-0 w-4">
            {hasChildren
              ? (isExpanded ? <ChevronDown size={12} className="text-brand-text-muted" /> : <ChevronRight size={12} className="text-brand-text-muted" />)
              : <span className="w-3 inline-block" />
            }
          </div>

          {/* Left accent bar */}
          <div className={`h-7 w-0.5 flex-shrink-0 rounded-full ${barColor}`} />

          {/* Name + critical badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold text-brand-text-primary truncate ${depth === 0 ? 'font-bold' : ''}`}>
                {node.nombre}
              </span>
              {node.isCritical && (
                <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-800/40 tracking-wide flex-shrink-0">
                  Critical
                </span>
              )}
            </div>
            {/* Mini progress bar */}
            <div className="mt-1.5 h-1 w-full bg-brand-border rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(m.opCapacity, 100)}%` }} />
            </div>
          </div>

          {/* Metrics columns */}
          <div className="flex items-center gap-5 flex-shrink-0">
            <MetricMini
              label="Attendance"
              value={`${m.attendance.toFixed(1)}%`}
              color={m.attendance < 88 ? 'text-red-400' : m.attendance < 93 ? 'text-yellow-400' : 'text-emerald-400'}
            />
            <MetricMini
              label="Op. Capacity"
              value={`${m.opCapacity.toFixed(1)}%`}
              color={covColor}
            />
            <MetricMini
              label="HPT Impact"
              value={m.hptImpact > 0.05 ? `+${m.hptImpact.toFixed(1)}h` : '—'}
              color={m.hptImpact > 5 ? 'text-red-400' : m.hptImpact > 2 ? 'text-yellow-400' : 'text-emerald-400'}
            />
            <div className="flex-shrink-0">
              <StatusPill status={m.status} />
            </div>
          </div>
        </button>
      </div>

      {/* Recursive children */}
      {isExpanded && hasChildren && children.map((child) => (
        <HierarchyRow
          key={child.id || child.nombre}
          node={child}
          depth={depth + 1}
          otEnabled={otEnabled}
          expandedSet={expandedSet}
          onToggle={onToggle}
          selectedNode={selectedNode}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────

export default function HptImpactCenter() {
  const { displaySnapshot, filters } = useApp();
  const metrics = useOperationalMetrics(displaySnapshot);
  const otEnabled = !!displaySnapshot?.otHabilitada;

  const hptDelta    = metrics.hptActual - HPT_OBJECTIVE;
  const hptDeltaPct = metrics.hptDiferencia;

  // Drill-down state
  const [expandedSet, setExpandedSet] = useState(new Set(['assembly', 'fabrication']));
  const [selectedNode, setSelectedNode] = useState(null);

  const toggleNode = (key) => setExpandedSet(prev => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  const handleSelect = (node) => {
    setSelectedNode(prev =>
      prev?.id === node.id && prev?.nombre === node.nombre ? null : node
    );
  };

  // Top-level ramas for the drill-down panel
  const ramas = metrics.ramasEnriched || [];

  // ── Waterfall source: children of selected node, or top-level ramas ──
  const waterfallSource = (() => {
    if (!selectedNode) return ramas;
    const children = selectedNode.subAreas?.length ? selectedNode.subAreas
                   : selectedNode.grupos?.length   ? selectedNode.grupos
                   : [];
    return children.length > 0 ? children : [selectedNode];
  })();

  const waterfallLabel = selectedNode ? selectedNode.nombre : 'All Areas';

  // ── Waterfall data ──
  const waterfallData = (() => {
    const bars = [];
    let running = HPT_OBJECTIVE;

    bars.push({ name: 'HPT Obj.', base: 0, value: HPT_OBJECTIVE, fill: '#118DFF', isStart: true });

    waterfallSource.forEach((node) => {
      const m = calcNodeMetrics(node, otEnabled);
      if (m.hptImpact > 0.01) {
        const shortName = node.nombre
          .replace('ASSEMBLY w/ KF LOGS', 'w/ KF LOGS')
          .replace('ASSEMBLY INDIRECT', 'Indirect')
          .replace('FABRICATION', 'Fabrication')
          .replace('FABRICATION DIRECT', 'FAB Direct')
          .replace('FABRICATION INDIRECT', 'FAB Indirect');
        bars.push({
          name: shortName,
          base: running,
          value: parseFloat(m.hptImpact.toFixed(2)),
          fill: m.status === 'danger' ? '#A80000' : m.status === 'warning' ? '#F1C40F' : '#107C41',
          isCritical: node.isCritical,
        });
        running += m.hptImpact;
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

  // ── Scatter plot ──
  const scatterData = historicalDays.map((d) => ({
    label: d.label,
    x: d.coberturaReal,
    y: d.actualHpt,
    riskScore: d.riskScore,
    fill: d.riskScore >= 70 ? '#A80000' : d.riskScore >= 45 ? '#F1C40F' : '#107C41',
  }));

  const todayPoint = {
    label: 'Today',
    x: parseFloat(metrics.coberturaGeneral.toFixed(1)),
    y: parseFloat(metrics.hptActual.toFixed(1)),
    riskScore: metrics.riesgoScore,
    fill: '#118DFF',
  };

  return (
    <div className="space-y-5">

      {/* ── ROW 1: KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          {
            label: 'HPT Objective',
            value: `${HPT_OBJECTIVE.toFixed(1)} hrs`,
            sub: 'Fixed standard — 1,498 HC × 8h ÷ 49 UPD',
            color: 'text-blue-400',
            bar: 'bg-blue-500',
            icon: <Minus size={14} className="text-blue-400" />,
          },
          {
            label: 'HPT Actual',
            value: `${metrics.hptActual.toFixed(1)} hrs`,
            sub: `${otEnabled ? 'OT enabled — excess hours absorbed' : 'No OT — direct deficit impact'}`,
            color: hptDelta > 20 ? 'text-red-400' : hptDelta > 8 ? 'text-yellow-400' : 'text-emerald-400',
            bar:   hptDelta > 20 ? 'bg-red-600'   : hptDelta > 8 ? 'bg-yellow-400'   : 'bg-emerald-500',
            icon: hptDelta > 0
              ? <TrendingUp   size={14} className="text-red-400"     />
              : <TrendingDown size={14} className="text-emerald-400" />,
          },
          {
            label: 'HPT Variation',
            value: `${hptDelta > 0 ? '+' : ''}${hptDeltaPct.toFixed(1)}%`,
            sub: `${hptDelta > 0 ? '+' : ''}${hptDelta.toFixed(1)} hrs over target`,
            color: hptDelta > 20 ? 'text-red-400' : hptDelta > 8 ? 'text-yellow-400' : 'text-emerald-400',
            bar:   hptDelta > 20 ? 'bg-red-600'   : hptDelta > 8 ? 'bg-yellow-400'   : 'bg-emerald-500',
            icon: hptDelta > 8
              ? <AlertTriangle size={14} className="text-yellow-400"  />
              : <CheckCircle   size={14} className="text-emerald-400" />,
          },
          {
            label: 'Overtime (OT)',
            value: otEnabled ? 'Enabled' : 'Disabled',
            sub: otEnabled
              ? 'Mitigating deficit — raises HPT via inefficiency factor'
              : 'No compensation — risk of missing 49 UPD',
            color: otEnabled ? 'text-yellow-400' : 'text-brand-text-secondary',
            bar:   otEnabled ? 'bg-yellow-400'   : 'bg-brand-border',
            icon: <Zap size={14} className={otEnabled ? 'text-yellow-400' : 'text-brand-text-muted'} />,
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

      {/* ── ROW 2: Waterfall + Drill-Down Panel ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* Waterfall Chart — 3/5 */}
        <div className="xl:col-span-3 bg-brand-card border border-brand-border rounded flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">
                HPT Impact Waterfall
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[10px] text-brand-text-muted">
                  {selectedNode
                    ? <><span className="text-brand-text-muted">All Areas</span><span className="text-brand-text-muted mx-1">›</span><span className="text-brand-accent font-semibold">{selectedNode.nombre}</span> — sub-area breakdown</>
                    : <>Attendance gap contribution per area — {HPT_OBJECTIVE} hrs target</>}
                </p>
                {selectedNode && (
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-[9px] text-brand-text-muted hover:text-brand-text-primary underline ml-1 flex-shrink-0"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
            {!otEnabled && (
              <div className="flex items-center gap-1.5 text-[10px] text-yellow-400 bg-yellow-900/10 border border-yellow-700/30 px-2.5 py-1 rounded">
                <Info size={10} />
                No OT — overtime cascade not computed
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
                  angle={-20}
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
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <div className="bg-[#1D1D1D] border border-[#2D2D2D] rounded px-3 py-2 text-xs">
                        <div className="text-[#A19F9D] font-semibold mb-1">{d?.name}</div>
                        {d?.isStart && <div className="text-[#118DFF] font-bold">HPT Objective: {d.value} hrs</div>}
                        {d?.isEnd   && <div className="font-bold" style={{ color: d.fill }}>HPT Actual: {d.value} hrs</div>}
                        {!d?.isStart && !d?.isEnd && (
                          <>
                            <div className="text-[#A19F9D]">Contribution: <b className="text-[#F3F2F1]">+{d?.value?.toFixed(2)} hrs</b></div>
                            {d?.isCritical && <div className="text-red-400 mt-0.5 text-[9px]">⚠ Critical Area</div>}
                          </>
                        )}
                      </div>
                    );
                  }}
                />
                <ReferenceLine y={HPT_OBJECTIVE} stroke="#118DFF" strokeDasharray="4 3" strokeWidth={1.5} />
                <Bar dataKey="base"  stackId="stack" fill="transparent" />
                <Bar dataKey="value" stackId="stack" radius={[3, 3, 0, 0]}>
                  {waterfallData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="top"
                    style={{ fontSize: 8, fill: '#A19F9D', fontFamily: 'Segoe UI' }}
                    formatter={(v) => {
                      const d = waterfallData.find(w => w.value === v);
                      if (d?.isStart || d?.isEnd) return `${v}h`;
                      return v > 0.1 ? `+${v.toFixed(1)}h` : '';
                    }}
                  />
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Summary strip */}
          <div className="border-t border-brand-border px-5 py-3 grid grid-cols-3 gap-4 text-[10px]">
            <div>
              <div className="text-brand-text-muted">HPT Objective</div>
              <div className="font-bold text-blue-400 text-sm">{HPT_OBJECTIVE.toFixed(1)} hrs</div>
            </div>
            <div>
              <div className="text-brand-text-muted">Absolute Deviation</div>
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

        {/* ── Drill-Down Panel — 2/5 ── */}
        <div className="xl:col-span-2 bg-brand-card border border-brand-border rounded flex flex-col">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">
                Area Drill-Down
              </h3>
              <p className="text-[10px] text-brand-text-muted mt-0.5">
                Click any row to drill waterfall chart — {filters?.turno ?? 'All shifts'}
              </p>
            </div>
            {/* Column legend */}
            <div className="hidden lg:flex items-center gap-3 text-[9px] text-brand-text-muted">
              <span>Attend.</span>
              <span>Op. Cap.</span>
              <span>HPT Δ</span>
            </div>
          </div>

          {/* Column headers row */}
          <div className="grid grid-cols-[1fr_auto] px-4 py-2 border-b border-brand-border bg-brand-bg/30">
            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-text-muted">Area / Group</span>
            <div className="flex gap-5 pr-1 text-[9px] font-bold uppercase tracking-wider text-brand-text-muted">
              <span className="w-14 text-center">Attend.</span>
              <span className="w-14 text-center">Op. Cap.</span>
              <span className="w-12 text-center">HPT Δ</span>
              <span className="w-16 text-right">Status</span>
            </div>
          </div>

          {/* Hierarchical rows */}
          <div className="flex-1 overflow-y-auto">
            {ramas.map((rama) => (
              <HierarchyRow
                key={rama.id || rama.nombre}
                node={rama}
                depth={0}
                otEnabled={otEnabled}
                expandedSet={expandedSet}
                onToggle={toggleNode}
                selectedNode={selectedNode}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-brand-border px-5 py-2.5 flex items-center justify-between text-[10px] text-brand-text-muted">
            <span>● = Critical bottleneck area</span>
            <span className="text-brand-text-secondary font-semibold">
              Total HPT Δ:&nbsp;
              <b className={hptDelta > 0 ? 'text-red-400' : 'text-emerald-400'}>
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
              Coverage vs HPT Correlation
            </h3>
            <p className="text-[10px] text-brand-text-muted mt-0.5">
              30 days — green zone = stable operation
            </p>
          </div>
          <div className="flex-1 p-4" style={{ minHeight: 240 }}>
            <ResponsiveContainer width="100%" height={240}>
              <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                <ReferenceArea
                  x1={93} x2={100} y1={230} y2={250}
                  fill="#107C41" fillOpacity={0.07}
                  stroke="#107C41" strokeOpacity={0.2} strokeDasharray="3 3"
                  label={{ value: 'Stable Zone', position: 'insideTopLeft', fontSize: 8, fill: '#107C41' }}
                />
                <ReferenceArea
                  x1={85} x2={93} y1={250} y2={295}
                  fill="#A80000" fillOpacity={0.05}
                  stroke="#A80000" strokeOpacity={0.15} strokeDasharray="3 3"
                />
                <XAxis
                  type="number" dataKey="x"
                  domain={[82, 100]}
                  tick={{ fontSize: 8, fill: '#605E5C' }}
                  axisLine={{ stroke: '#2D2D2D' }}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                  label={{ value: 'Coverage %', position: 'insideBottom', offset: -2, fontSize: 8, fill: '#605E5C' }}
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
                <Scatter data={scatterData} name="Historical">
                  {scatterData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} fillOpacity={0.7} />
                  ))}
                </Scatter>
                <Scatter data={[todayPoint]} name="Today">
                  <Cell fill="#118DFF" />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="border-t border-brand-border px-5 py-2.5 flex gap-4 text-[9px] text-brand-text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-600" /> Low Risk</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow-400" /> Medium</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-600" /> Critical</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-400" /> Today</span>
          </div>
        </div>

        {/* Historical Line — 3/5 */}
        <div className="xl:col-span-3 bg-brand-card border border-brand-border rounded flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">
                HPT Trend — Last 30 Days
              </h3>
              <p className="text-[10px] text-brand-text-muted mt-0.5">
                Daily HPT actual vs. fixed reference of {HPT_OBJECTIVE} hrs
              </p>
            </div>
            <div className="flex items-center gap-4 text-[9px] text-brand-text-muted">
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-yellow-400 inline-block" /> HPT Actual</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-red-600 inline-block border-dashed border-t" /> Target {HPT_OBJECTIVE}</span>
            </div>
          </div>
          <div className="flex-1 p-5" style={{ minHeight: 240 }}>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={historicalDays} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="hptGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F1C40F" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F1C40F" stopOpacity={0}   />
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
                  name="HPT Actual"
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
              { label: 'Avg HPT 30d',      value: `${(historicalDays.reduce((s, d) => s + d.actualHpt, 0) / historicalDays.length).toFixed(1)} hrs`, color: 'text-yellow-400' },
              { label: 'Days over Target', value: `${historicalDays.filter(d => d.actualHpt > HPT_OBJECTIVE).length}/${historicalDays.length}`,             color: 'text-red-400' },
              { label: 'Max HPT 30d',      value: `${Math.max(...historicalDays.map(d => d.actualHpt)).toFixed(1)} hrs`,                                    color: 'text-red-400' },
              { label: 'Min HPT 30d',      value: `${Math.min(...historicalDays.map(d => d.actualHpt)).toFixed(1)} hrs`,                                    color: 'text-emerald-400' },
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

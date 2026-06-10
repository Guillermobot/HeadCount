import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useOperationalMetrics } from '../hooks/useOperationalMetrics';
import { HC_DESIGN_TOTAL, HPT_OBJECTIVE } from '../data/constants';
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Zap,
  ArrowRight,
  Info
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function getStatus(coverage, isCritical) {
  if (isCritical) {
    if (coverage < 90) return 'danger';
    if (coverage < 95) return 'warning';
    return 'success';
  }
  if (coverage < 85) return 'danger';
  if (coverage < 90) return 'warning';
  return 'success';
}

const STATUS_CONFIG = {
  success: {
    label: 'Normal',
    bar: 'bg-emerald-500',
    text: 'text-emerald-400',
    fill: '#107C41',
    badge: 'bg-emerald-900/20 text-emerald-400 border-emerald-700/40',
    icon: CheckCircle,
    ring: 'border-l-emerald-500',
  },
  warning: {
    label: 'Alerta',
    bar: 'bg-yellow-400',
    text: 'text-yellow-400',
    fill: '#F1C40F',
    badge: 'bg-yellow-900/20 text-yellow-400 border-yellow-600/40',
    icon: AlertTriangle,
    ring: 'border-l-yellow-400',
  },
  danger: {
    label: 'Crítico',
    bar: 'bg-red-600',
    text: 'text-red-400',
    fill: '#A80000',
    badge: 'bg-red-900/20 text-red-400 border-red-700/40',
    icon: XCircle,
    ring: 'border-l-red-600',
  },
};

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────

/** Coverage Progress Bar with Design / Expected / Actual ticks */
function BulletBar({ design, expected, present }) {
  const pct = expected > 0 ? (present / expected) * 100 : 0;
  const expPct = design > 0 ? (expected / design) * 100 : 100;
  const status = getStatus(pct, false);
  const cfg = STATUS_CONFIG[status];

  return (
    <div className="space-y-1.5">
      {/* Bar track — full design width */}
      <div className="relative h-3 w-full bg-brand-border rounded-full overflow-visible">
        {/* Expected range marker */}
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-[#2D2D2D] border-r border-dashed border-brand-text-muted/40"
          style={{ width: `${Math.min(expPct, 100)}%` }}
        />
        {/* Actual fill */}
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all ${cfg.bar}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      {/* Tick labels */}
      <div className="flex justify-between text-[8px] text-brand-text-muted font-mono">
        <span>0</span>
        <span className="text-brand-text-secondary">Esp: {expected}</span>
        <span>Dis: {design}</span>
      </div>
    </div>
  );
}

/** Status pill badge */
function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${cfg.badge}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

/** Sub-area station card */
function StationCard({ child }) {
  const cov = child.hcExpected > 0 ? (child.actualPresent / child.hcExpected) * 100 : 0;
  const st = getStatus(cov, false);
  const cfg = STATUS_CONFIG[st];
  const deficit = child.hcExpected - child.actualPresent;

  return (
    <div className={`bg-brand-bg border border-brand-border border-l-2 ${cfg.ring} rounded p-3 space-y-2.5`}>
      <div className="flex items-start justify-between gap-1">
        <span className="text-[11px] font-semibold text-brand-text-primary leading-tight">{child.nombre}</span>
        <StatusPill status={st} />
      </div>
      <div className="grid grid-cols-3 gap-1 text-[9px] text-center">
        <div className="bg-brand-card rounded px-1 py-1">
          <div className="text-brand-text-muted">Diseño</div>
          <div className="font-bold text-brand-text-secondary">{child.hcDesign}</div>
        </div>
        <div className="bg-brand-card rounded px-1 py-1">
          <div className="text-brand-text-muted">Esperado</div>
          <div className="font-bold text-brand-text-secondary">{child.hcExpected}</div>
        </div>
        <div className={`rounded px-1 py-1 ${st === 'success' ? 'bg-emerald-900/20' : st === 'warning' ? 'bg-yellow-900/20' : 'bg-red-900/20'}`}>
          <div className="text-brand-text-muted">Real</div>
          <div className={`font-bold ${cfg.text}`}>{child.actualPresent}</div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[9px]">
          <span className="text-brand-text-muted">Cobertura</span>
          <span className={`font-bold ${cfg.text}`}>{cov.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 w-full bg-brand-border rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${Math.min(cov, 100)}%` }} />
        </div>
        {deficit > 0 && (
          <div className="text-[8px] text-red-400 font-medium">Faltan {deficit} operadores</div>
        )}
      </div>
    </div>
  );
}

/** Full area row for the hierarchical table */
function AreaRow({ area, isExpanded, onToggle, isSelected, onSelect }) {
  const cfg = STATUS_CONFIG[area.status];
  const Icon = cfg.icon;
  const deficit = area.hcExpected - area.actualPresent;
  const hasChildren = area.children?.length > 0;

  return (
    <div
      className={`border border-brand-border rounded transition-all ${isSelected ? 'border-brand-accent' : 'hover:border-brand-border/80'}`}
    >
      {/* Area Header Row */}
      <div
        className={`flex items-center gap-3 p-4 cursor-pointer bg-brand-card rounded-t ${isExpanded ? '' : 'rounded-b'}`}
        onClick={() => { onSelect(area.nombre); if (hasChildren) onToggle(area.nombre); }}
      >
        {/* Expand toggle */}
        <div className="flex-shrink-0 w-5">
          {hasChildren ? (
            isExpanded
              ? <ChevronDown size={14} className="text-brand-text-secondary" />
              : <ChevronRight size={14} className="text-brand-text-secondary" />
          ) : (
            <span className="w-4 block" />
          )}
        </div>

        {/* Left accent indicator */}
        <div className={`h-8 w-1 rounded-full flex-shrink-0 ${cfg.bar}`} />

        {/* Area name + tags */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-brand-text-primary">{area.nombre}</span>
            {area.isCritical && (
              <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-800/40 tracking-wide">
                Área Crítica
              </span>
            )}
            {hasChildren && (
              <span className="text-[8px] text-brand-text-muted">{area.children.length} sub-áreas</span>
            )}
          </div>
          {/* Mini bullet bar */}
          <div className="mt-2 pr-4">
            <BulletBar design={area.hcDesign} expected={area.hcExpected} present={area.actualPresent} />
          </div>
        </div>

        {/* Stats columns */}
        <div className="hidden lg:grid grid-cols-4 gap-4 flex-shrink-0 text-center text-xs">
          <div>
            <div className="text-[9px] text-brand-text-muted uppercase tracking-wider">Diseño</div>
            <div className="font-bold text-brand-text-secondary mt-0.5">{area.hcDesign}</div>
          </div>
          <div>
            <div className="text-[9px] text-brand-text-muted uppercase tracking-wider">Esperado</div>
            <div className="font-bold text-brand-text-secondary mt-0.5">{area.hcExpected}</div>
          </div>
          <div>
            <div className="text-[9px] text-brand-text-muted uppercase tracking-wider">Presente</div>
            <div className={`font-bold mt-0.5 ${cfg.text}`}>{area.actualPresent}</div>
          </div>
          <div>
            <div className="text-[9px] text-brand-text-muted uppercase tracking-wider">Faltantes</div>
            <div className={`font-bold mt-0.5 ${deficit > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {deficit > 0 ? `-${deficit}` : '0'}
            </div>
          </div>
        </div>

        {/* Coverage % badge */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1.5 ml-2 min-w-[80px]">
          <StatusPill status={area.status} />
          <span className={`text-lg font-extrabold tabular-nums ${cfg.text}`}>
            {area.coverage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Expanded: children stations */}
      {isExpanded && hasChildren && (
        <div className="bg-brand-bg/60 border-t border-brand-border p-4 rounded-b">
          <div className="text-[10px] font-bold uppercase tracking-widest text-brand-text-muted mb-3 flex items-center gap-2">
            <ArrowRight size={10} />
            Sub-áreas de {area.nombre}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {area.children.map((child) => (
              <StationCard key={child.nombre} child={child} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Comparison bar chart */
const CoverageTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1D1D1D] border border-[#2D2D2D] rounded shadow-2xl px-3 py-2.5 text-xs">
      <div className="text-[#A19F9D] font-semibold mb-2">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: p.fill || p.color }} />
          <span className="text-[#A19F9D]">{p.name}:</span>
          <span className="font-bold text-[#F3F2F1]">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────

export default function CoverageDashboard() {
  const { displaySnapshot, filters } = useApp();
  const metrics = useOperationalMetrics(displaySnapshot);

  const [expandedAreas, setExpandedAreas] = useState(new Set(['Assembly', 'Fabrication']));
  const [selectedArea, setSelectedArea] = useState(null);

  const toggleExpand = (name) =>
    setExpandedAreas((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  const selectArea = (name) =>
    setSelectedArea((prev) => (prev === name ? null : name));

  const areas = metrics.details || [];

  // Summary counts
  const criticalCount = areas.filter((a) => a.status === 'danger').length;
  const warningCount = areas.filter((a) => a.status === 'warning').length;
  const okCount = areas.filter((a) => a.status === 'success').length;
  const totalDeficit = areas.reduce((s, a) => s + Math.max(0, a.hcExpected - a.actualPresent), 0);

  // Chart data for grouped bar chart
  const chartData = areas.map((a) => ({
    name: a.nombre,
    Diseño: a.hcDesign,
    Esperado: a.hcExpected,
    Presente: a.actualPresent,
    fill: STATUS_CONFIG[a.status].fill,
    isCritical: a.isCritical,
  }));

  // Selected area detail
  const selectedAreaData = selectedArea ? areas.find((a) => a.nombre === selectedArea) : null;

  return (
    <div className="space-y-5">

      {/* ── TOP SUMMARY BAR ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Cobertura General',
            value: `${metrics.coberturaGeneral.toFixed(1)}%`,
            sub: `${metrics.totalPresent} / ${metrics.totalExpected} operadores`,
            color: metrics.coberturaGeneral < 90 ? 'text-red-400' : metrics.coberturaGeneral < 95 ? 'text-yellow-400' : 'text-emerald-400',
            bar: metrics.coberturaGeneral < 90 ? 'bg-red-600' : metrics.coberturaGeneral < 95 ? 'bg-yellow-400' : 'bg-emerald-500',
          },
          {
            label: 'Déficit Total de Operadores',
            value: totalDeficit.toString(),
            sub: `Vs HC Esperado del turno`,
            color: totalDeficit > 100 ? 'text-red-400' : totalDeficit > 40 ? 'text-yellow-400' : 'text-emerald-400',
            bar: totalDeficit > 100 ? 'bg-red-600' : totalDeficit > 40 ? 'bg-yellow-400' : 'bg-emerald-500',
          },
          {
            label: 'Áreas en Estado Normal',
            value: `${okCount} / ${areas.length}`,
            sub: `Sin alertas operativas`,
            color: 'text-emerald-400',
            bar: 'bg-emerald-500',
          },
          {
            label: 'Áreas Críticas / Alerta',
            value: `${criticalCount} críticas · ${warningCount} alerta`,
            sub: `Requieren atención inmediata`,
            color: criticalCount > 0 ? 'text-red-400' : warningCount > 0 ? 'text-yellow-400' : 'text-emerald-400',
            bar: criticalCount > 0 ? 'bg-red-600' : warningCount > 0 ? 'bg-yellow-400' : 'bg-emerald-500',
          },
        ].map((item, i) => (
          <div key={i} className="relative bg-brand-card border border-brand-border rounded p-4 overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${item.bar}`} />
            <div className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary">{item.label}</div>
            <div className={`text-xl font-extrabold mt-2 ${item.color}`}>{item.value}</div>
            <div className="text-[10px] text-brand-text-muted mt-1">{item.sub}</div>
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT: Left Hierarchy + Right Detail Panel ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Hierarchical Area Table — 2/3 width */}
        <div className="xl:col-span-2 bg-brand-card border border-brand-border rounded flex flex-col">

          {/* Table Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">
                Estructura Jerárquica de Cobertura
              </h3>
              <p className="text-[10px] text-brand-text-muted mt-0.5">
                Haz clic en un área para expandir sub-áreas — {filters.turno} activo
              </p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-3 text-[9px] text-brand-text-muted">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-500" /> Normal</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-yellow-400" /> Alerta</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-600" /> Crítico</span>
            </div>
          </div>

          {/* Column headers (desktop only) */}
          <div className="hidden lg:grid grid-cols-[2fr_auto] gap-4 px-5 py-2 border-b border-brand-border bg-brand-bg/30">
            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-text-muted">Área / Estructura</span>
            <div className="grid grid-cols-5 gap-4 text-center pr-24">
              {['Diseño', 'Esperado', 'Presente', 'Δ Faltantes', 'Cobertura'].map((h) => (
                <span key={h} className="text-[9px] font-bold uppercase tracking-widest text-brand-text-muted">{h}</span>
              ))}
            </div>
          </div>

          {/* Area rows */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {areas.map((area) => (
              <AreaRow
                key={area.nombre}
                area={area}
                isExpanded={expandedAreas.has(area.nombre)}
                onToggle={toggleExpand}
                isSelected={selectedArea === area.nombre}
                onSelect={selectArea}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-brand-border flex justify-between text-[10px] text-brand-text-muted">
            <span>
              Cobertura calculada vs. HC Esperado del Turno — <b className="text-brand-text-secondary">No vs. HC Diseño</b>
            </span>
            <span className="text-brand-text-secondary">
              Turno: <b>{filters.turno}</b>
            </span>
          </div>
        </div>

        {/* Right Detail Panel — 1/3 width */}
        <div className="xl:col-span-1 bg-brand-card border border-brand-border rounded flex flex-col">
          <div className="px-5 py-3.5 border-b border-brand-border">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">
              {selectedAreaData ? `Detalle: ${selectedAreaData.nombre}` : 'Resumen de Turno'}
            </h3>
            <p className="text-[10px] text-brand-text-muted mt-0.5">
              {selectedAreaData ? 'Análisis de capacidad y ausentismo del área' : 'Selecciona un área para ver su detalle'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedAreaData ? (
              <>
                {/* Area headline stats */}
                <div className={`border border-brand-border border-l-4 ${STATUS_CONFIG[selectedAreaData.status].ring} rounded p-4 space-y-3 bg-brand-bg`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-text-primary">{selectedAreaData.nombre}</span>
                    <StatusPill status={selectedAreaData.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Cobertura', value: `${selectedAreaData.coverage.toFixed(1)}%`, color: STATUS_CONFIG[selectedAreaData.status].text },
                      { label: 'Ausentismo', value: `${selectedAreaData.absentRate.toFixed(1)}%`, color: 'text-brand-text-primary' },
                      { label: 'HC Diseño', value: selectedAreaData.hcDesign, color: 'text-brand-text-secondary' },
                      { label: 'HC Esperado', value: selectedAreaData.hcExpected, color: 'text-brand-text-secondary' },
                      { label: 'HC Presente', value: selectedAreaData.actualPresent, color: STATUS_CONFIG[selectedAreaData.status].text },
                      { label: 'Faltantes', value: Math.max(0, selectedAreaData.hcExpected - selectedAreaData.actualPresent), color: 'text-red-400' },
                    ].map((item, i) => (
                      <div key={i} className="bg-brand-card rounded p-2.5">
                        <div className="text-[9px] text-brand-text-muted uppercase tracking-wider">{item.label}</div>
                        <div className={`text-sm font-bold mt-0.5 ${item.color}`}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coverage bar large */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-brand-text-muted font-medium">Nivel de Cobertura</span>
                    <span className={`font-bold ${STATUS_CONFIG[selectedAreaData.status].text}`}>
                      {selectedAreaData.coverage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 w-full bg-brand-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STATUS_CONFIG[selectedAreaData.status].bar} transition-all`}
                      style={{ width: `${Math.min(selectedAreaData.coverage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] text-brand-text-muted font-mono">
                    <span>0%</span>
                    <span className="text-yellow-400">Umbral {selectedAreaData.isCritical ? '95%' : '90%'} (Alerta)</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Criticality notice */}
                {selectedAreaData.isCritical && (
                  <div className="flex items-start gap-2 bg-red-900/10 border border-red-800/30 rounded p-3 text-[10px] text-red-400">
                    <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                    <span>
                      Área crítica de producción. Un déficit en esta área impacta directamente la tasa de producción de toda la línea (49 UPD).
                    </span>
                  </div>
                )}

                {/* Children detail if any */}
                {selectedAreaData.children?.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-brand-text-muted">
                      Sub-áreas ({selectedAreaData.children.length})
                    </div>
                    {selectedAreaData.children.map((child) => {
                      const cov = child.hcExpected > 0 ? (child.actualPresent / child.hcExpected) * 100 : 0;
                      const st = child.status || getStatus(cov, false);
                      const cfg = STATUS_CONFIG[st];
                      return (
                        <div key={child.nombre} className={`bg-brand-bg border border-brand-border border-l-2 ${cfg.ring} rounded p-3 space-y-1.5`}>
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-semibold text-brand-text-primary">{child.nombre}</span>
                            <span className={`text-xs font-bold ${cfg.text}`}>{cov.toFixed(1)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-brand-border rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${Math.min(cov, 100)}%` }} />
                          </div>
                          <div className="flex justify-between text-[9px] text-brand-text-muted">
                            <span>{child.actualPresent} / {child.hcExpected}</span>
                            <StatusPill status={st} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              /* Default: turno-level summary */
              <div className="space-y-4">
                <div className="bg-brand-bg border border-brand-border rounded p-4 space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-brand-text-muted">Estado General del Turno</div>
                  {areas.map((a) => {
                    const cfg = STATUS_CONFIG[a.status];
                    return (
                      <button
                        key={a.nombre}
                        onClick={() => selectArea(a.nombre)}
                        className="w-full flex items-center gap-3 hover:bg-brand-card/50 rounded p-1.5 transition-colors text-left"
                      >
                        <div className={`h-2.5 w-2.5 rounded-sm flex-shrink-0 ${cfg.bar}`} />
                        <span className="text-xs text-brand-text-primary flex-1 truncate">{a.nombre}</span>
                        {a.isCritical && <span className="text-[8px] text-red-400">●</span>}
                        <span className={`text-xs font-bold tabular-nums ${cfg.text}`}>{a.coverage.toFixed(1)}%</span>
                        <ChevronRight size={12} className="text-brand-text-muted" />
                      </button>
                    );
                  })}
                </div>

                {/* OT Indicator */}
                <div className={`flex items-start gap-2 rounded p-3 border text-[10px] ${
                  displaySnapshot?.otHabilitada
                    ? 'bg-yellow-900/10 border-yellow-700/30 text-yellow-400'
                    : 'bg-brand-bg border-brand-border text-brand-text-muted'
                }`}>
                  <Zap size={12} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Tiempo Extra (OT): {displaySnapshot?.otHabilitada ? 'Habilitado' : 'Deshabilitado'}</div>
                    <div className="text-brand-text-muted mt-0.5">
                      {displaySnapshot?.otHabilitada
                        ? 'El personal presente trabaja horas extra para compensar ausencias.'
                        : 'Sin horas extra. El déficit de personal impacta directamente la producción.'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-brand-bg border border-brand-border rounded p-3 text-[10px] text-brand-text-muted">
                  <Info size={12} className="flex-shrink-0 mt-0.5 text-brand-accent" />
                  <span>Selecciona cualquier área en la tabla para ver su análisis detallado de capacidad y sub-áreas.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM: Comparison Bar Chart ── */}
      <div className="bg-brand-card border border-brand-border rounded">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">
              Comparativa de Headcount por Área
            </h3>
            <p className="text-[10px] text-brand-text-muted mt-0.5">
              HC Diseño vs. HC Esperado Turno vs. Asistencia Real — {filters.turno}
            </p>
          </div>
          <div className="flex items-center gap-4 text-[9px] text-brand-text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-[#2D3A4A] inline-block" /> Diseño</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-brand-accent inline-block" /> Esperado</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm bg-emerald-600 inline-block" /> Presente</span>
          </div>
        </div>

        <div className="p-5" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
              barCategoryGap="30%"
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#A19F9D', fontFamily: 'Segoe UI' }}
                axisLine={{ stroke: '#2D2D2D' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#605E5C', fontFamily: 'Segoe UI' }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<CoverageTooltip />} />
              <Bar dataKey="Diseño" fill="#2D3A4A" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Esperado" fill="#118DFF" opacity={0.7} radius={[2, 2, 0, 0]} />
              <Bar dataKey="Presente" radius={[2, 2, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom deficit summary strip */}
        <div className="border-t border-brand-border px-5 py-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {areas.map((a) => {
            const deficit = Math.max(0, a.hcExpected - a.actualPresent);
            const cfg = STATUS_CONFIG[a.status];
            return (
              <div key={a.nombre} className="text-center space-y-0.5">
                <div className="text-[9px] text-brand-text-muted truncate">{a.nombre}</div>
                <div className={`text-sm font-extrabold ${cfg.text}`}>{a.coverage.toFixed(0)}%</div>
                {deficit > 0 && (
                  <div className="text-[9px] text-red-400">−{deficit} ops</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

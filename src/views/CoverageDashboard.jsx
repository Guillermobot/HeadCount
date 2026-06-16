import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useOperationalMetrics } from '../hooks/useOperationalMetrics';
import { HC_DESIGN_TOTAL, HPT_OBJECTIVE } from '../data/constants';
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle, XCircle, Zap, Users } from 'lucide-react';

// ── Status config (dark-mode colours) ────────────────────────────
const STATUS = {
  success: { label: 'Normal',   bar: 'bg-emerald-500', text: 'text-emerald-400', ring: 'border-l-emerald-500', icon: CheckCircle },
  warning: { label: 'Alert',    bar: 'bg-yellow-400',  text: 'text-yellow-400',  ring: 'border-l-yellow-400',  icon: AlertTriangle },
  danger:  { label: 'Critical', bar: 'bg-red-600',     text: 'text-red-400',     ring: 'border-l-red-600',     icon: XCircle },
};

function StatusPill({ status }) {
  const cfg = STATUS[status] || STATUS.success;
  const Icon = cfg.icon;
  const pill = {
    success: 'bg-emerald-900/20 text-emerald-400 border-emerald-700/40',
    warning: 'bg-yellow-900/20 text-yellow-400 border-yellow-600/40',
    danger:  'bg-red-900/20   text-red-400   border-red-700/40',
  }[status] || 'bg-emerald-900/20 text-emerald-400 border-emerald-700/40';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-semibold ${pill}`}>
      <Icon size={9} />{cfg.label}
    </span>
  );
}

/** Traffic-light badge for risk panel */
function StatusBadge({ status, label }) {
  const map = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    danger:  'bg-red-700/10   text-red-400   border-red-700/30',
  };
  const dotMap = {
    success: 'bg-emerald-400',
    warning: 'bg-yellow-400',
    danger:  'bg-red-500 animate-pulse',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${map[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotMap[status]}`} />
      {label}
    </span>
  );
}

function getCoverageStatus(coverage) {
  if (coverage < 85) return 'danger';
  if (coverage < 91) return 'warning';
  return 'success';
}
const statusLabels = { success: 'Normal', warning: 'Alert', danger: 'Critical' };

/** Risk Impact Table — ranked by coverage gap / HPT impact */
function RiskImpactTable({ areas, hptObjective, hptActual }) {
  const ranked = [...areas]
    .map(a => {
      const coverage = a.hcExpected > 0 ? (a.actualPresent / a.hcExpected) * 100 : 0;
      const deficit  = a.hcExpected - a.actualPresent;
      const hptImpact = deficit > 0 ? ((deficit * 8 * 0.2) / 49.0) : 0;
      const status = getCoverageStatus(coverage);
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
        <span className="text-brand-text-secondary font-semibold">
          Δ HPT vs Obj: {(hptActual - hptObjective) > 0 ? '+' : ''}{(hptActual - hptObjective).toFixed(1)} h
        </span>
      </div>
    </div>
  );
}

// ── Leaf row (individual station/puesto) ─────────────────────────
function PuestoRow({ node }) {
  if (node.hcExpected === 0 && node.hcDesign === 0) return null;
  const cfg = STATUS[node.status] || STATUS.success;
  return (
    <div className={`flex items-center gap-3 px-3 py-1.5 bg-brand-bg border-b border-brand-border border-l-2 ${cfg.ring} text-[10px]`}>
      <span className="flex-1 text-brand-text-primary font-medium truncate">{node.nombre}</span>
      <span className="tabular-nums text-brand-text-muted w-8 text-right">{node.hcDesign}</span>
      <span className="tabular-nums text-brand-text-muted w-8 text-right">{node.hcExpected}</span>
      <span className={`tabular-nums font-bold w-8 text-right ${cfg.text}`}>{node.actualPresent}</span>
      <span className={`tabular-nums w-12 text-right font-bold ${cfg.text}`}>{node.coverage?.toFixed(1)}%</span>
    </div>
  );
}

// ── Estación row (expandable → children) ─────────────────────────
function EstacionRow({ node }) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children?.length > 0;
  const cfg = STATUS[node.status] || STATUS.success;

  return (
    <div className="space-y-px">
      <button
        onClick={() => hasChildren && setOpen(!open)}
        className={`w-full flex items-center gap-2 px-3 py-2 bg-[#161616] border-b border-brand-border border-l-2 ${cfg.ring} hover:bg-brand-card/60 text-left transition-colors`}
      >
        <span className="w-4 flex-shrink-0 text-brand-text-muted">
          {hasChildren && (open ? <ChevronDown size={12} /> : <ChevronRight size={12} />)}
        </span>
        <span className="flex-1 text-[11px] font-semibold text-brand-text-primary truncate">{node.nombre}</span>
        <span className="tabular-nums text-[10px] text-brand-text-muted w-8 text-right">{node.hcDesign}</span>
        <span className="tabular-nums text-[10px] text-brand-text-muted w-8 text-right">{node.hcExpected}</span>
        <span className={`tabular-nums text-[10px] font-bold w-8 text-right ${cfg.text}`}>{node.actualPresent}</span>
        <span className={`tabular-nums text-[11px] font-bold w-12 text-right ${cfg.text}`}>{node.coverage?.toFixed(1)}%</span>
      </button>
      {open && hasChildren && (
        <div className="pl-6 bg-brand-bg">
          <div className="grid grid-cols-[1fr_2rem_2rem_2rem_3rem] gap-2 px-3 py-1 text-[9px] font-bold uppercase text-brand-text-muted border-b border-brand-border">
            <span>Station</span>
            <span className="text-right">Des</span>
            <span className="text-right">Exp</span>
            <span className="text-right">Real</span>
            <span className="text-right">Cov.</span>
          </div>
          {node.children.map((c, i) => <PuestoRow key={i} node={c} />)}
        </div>
      )}
    </div>
  );
}

// ── Grupo row (expandable → estaciones) ──────────────────────────
function GrupoRow({ node }) {
  const [open, setOpen] = useState(false);
  const hasEst = node.estaciones?.length > 0;
  const cfg = STATUS[node.status] || STATUS.success;

  return (
    <div className={`border border-brand-border bg-brand-card border-l-[3px] ${cfg.ring} mb-2`}>
      <button
        onClick={() => hasEst && setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-brand-bg/60 text-left transition-colors"
      >
        <span className="w-4 text-brand-text-muted flex-shrink-0">
          {hasEst && (open ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </span>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-brand-text-primary">{node.nombre}</span>
          <div className="mt-1.5 h-1 w-full bg-brand-border rounded-full overflow-hidden">
            <div className={`h-full ${cfg.bar}`} style={{ width: `${Math.min(node.coverage || 0, 100)}%` }} />
          </div>
        </div>
        <div className="hidden lg:flex gap-5 text-[10px] text-center text-brand-text-muted">
          <div><div>Exp.</div><div className="font-bold text-brand-text-secondary">{node.hcExpected}</div></div>
          <div><div>Real</div><div className="font-bold text-brand-text-secondary">{node.actualPresent}</div></div>
        </div>
        <div className="flex flex-col items-end gap-1 ml-3">
          <StatusPill status={node.status} />
          <span className={`text-sm font-extrabold ${cfg.text}`}>{node.coverage?.toFixed(1)}%</span>
        </div>
      </button>
      {open && hasEst && (
        <div className="bg-brand-bg border-t border-brand-border p-2">
          {node.estaciones.map((est, i) => <EstacionRow key={i} node={est} />)}
        </div>
      )}
    </div>
  );
}

// ── SubArea row (expandable → grupos) ────────────────────────────
function SubAreaRow({ node }) {
  const [open, setOpen] = useState(false);
  const hasGrupos = node.grupos?.length > 0;
  const cfg = STATUS[node.status] || STATUS.success;

  return (
    <div className="border border-brand-border bg-brand-bg mb-3">
      <button
        onClick={() => hasGrupos && setOpen(!open)}
        className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-brand-card/50 text-left border-l-4 ${cfg.ring} transition-colors`}
      >
        <span className="w-5 text-brand-text-muted flex-shrink-0">
          {hasGrupos && (open ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </span>
        <div className="flex-1 min-w-0">
          <span className="font-bold text-sm text-brand-text-primary">{node.nombre}</span>
          <div className="mt-2 h-1.5 w-full bg-brand-border rounded-full overflow-hidden">
            <div className={`h-full ${cfg.bar}`} style={{ width: `${Math.min(node.coverage || 0, 100)}%` }} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 ml-4">
          <StatusPill status={node.status} />
          <span className={`text-lg font-black ${cfg.text}`}>{node.coverage?.toFixed(1)}%</span>
        </div>
      </button>
      {open && hasGrupos && (
        <div className="bg-brand-card border-t border-brand-border p-4">
          <div className="text-[10px] font-bold uppercase text-brand-text-muted mb-3">Groups of {node.nombre}</div>
          {node.grupos.map((g, i) => <GrupoRow key={i} node={g} />)}
        </div>
      )}
    </div>
  );
}

// ── Rama row (top-level, expandable → subAreas) ──────────────────
function RamaRow({ node, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = STATUS[node.status] || STATUS.success;

  return (
    <div className="border border-brand-border bg-brand-card shadow-sm mb-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-brand-bg/40 text-left transition-colors">
        <div className={`h-10 w-1.5 rounded-full flex-shrink-0 ${cfg.bar}`} />
        <div className="flex-1 min-w-0">
          <span className="font-extrabold text-base text-brand-text-primary tracking-wide">{node.nombre}</span>
          {node.isCritical && (
            <span className="ml-2 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 border border-red-800/40">
              Critical
            </span>
          )}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 max-w-[300px] h-2 bg-brand-border rounded-full overflow-hidden">
              <div className={`h-full ${cfg.bar}`} style={{ width: `${Math.min(node.coverage || 0, 100)}%` }} />
            </div>
            <span className={`text-xs font-semibold ${cfg.text}`}>{node.actualPresent} / {node.hcExpected} ops</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 ml-4">
          <StatusPill status={node.status} />
          <span className={`text-2xl font-black ${cfg.text}`}>{node.coverage?.toFixed(1)}%</span>
        </div>
        <div className="ml-4 text-brand-text-muted">{open ? <ChevronDown size={20} /> : <ChevronRight size={20} />}</div>
      </button>
      {open && node.subAreas?.length > 0 && (
        <div className="bg-brand-bg border-t border-brand-border p-5">
          <div className="text-[10px] font-bold uppercase text-brand-text-muted mb-3">Sub-areas of {node.nombre}</div>
          {node.subAreas.map((sub, i) => <SubAreaRow key={i} node={sub} />)}
        </div>
      )}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────
export default function CoverageDashboard() {
  const { displaySnapshot } = useApp();
  const metrics = useOperationalMetrics(displaySnapshot);
  const ramas = metrics.ramasEnriched || [];

  return (
    <div className="space-y-5">

      {/* ── ROW 0: Expected vs Present HC Hero ── */}
      <section>
        <div className="flex justify-center w-full">
          <div className="relative bg-brand-card rounded border border-brand-border flex items-center justify-center p-6 h-32 w-full max-w-xl shadow-lg overflow-hidden group hover:border-emerald-500/50 transition-all">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
            
            <div className="flex items-center gap-12 w-full justify-center">
              {/* Expected HC */}
              <div className="flex flex-col items-center gap-1 w-32">
                <div className="flex items-center gap-1.5 text-brand-text-secondary">
                  <Users size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-tight">Expected Shift</span>
                </div>
                <div className="text-4xl font-black tracking-tighter text-brand-text-primary">
                  {metrics.totalExpected.toLocaleString()}
                </div>
              </div>

              {/* Divider */}
              <div className="h-16 w-px bg-brand-border mx-2" />

              {/* Present HC */}
              <div className="flex flex-col items-center gap-1 w-32">
                <div className="flex items-center gap-1.5 text-emerald-500">
                  <CheckCircle size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest leading-tight">Present HC</span>
                </div>
                <div className="text-4xl font-black tracking-tighter text-emerald-500">
                  {metrics.totalPresent.toLocaleString()}
                </div>
              </div>
            </div>
            
            {/* Coverage badge overlay */}
            <div className="absolute bottom-3 right-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text-muted">
                Coverage: <span className="text-emerald-500">{metrics.coberturaGeneral.toFixed(1)}%</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Plant Coverage Hierarchy — expanded to fill freed space */}
      <div className="bg-brand-card border border-brand-border rounded">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">
              Plant Coverage Hierarchy
            </h3>
            <p className="text-[10px] text-brand-text-muted mt-0.5">
              Click any area to expand — Design → SubArea → Group → Station → Position
            </p>
          </div>
          <div className="flex items-center gap-3 text-[9px] text-brand-text-muted">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-500" /> Normal</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-yellow-400" /> Alert</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-600" /> Critical</span>
          </div>
        </div>
        <div className="p-5">
          {ramas.map((rama, i) => <RamaRow key={i} node={rama} defaultOpen={i === 0} />)}
        </div>
      </div>

      {/* Top Risk by Area — moved from Executive Control */}
      <div className="bg-brand-card border border-brand-border rounded flex flex-col">
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
            Overall: {metrics.riesgoNivel}
          </div>
        </div>
        <div className="px-5 py-4">
          <RiskImpactTable
            areas={metrics.details || []}
            hptObjective={HPT_OBJECTIVE}
            hptActual={metrics.hptActual}
          />
        </div>

      </div>

    </div>
  );
}
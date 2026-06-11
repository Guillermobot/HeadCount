import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useOperationalMetrics } from '../hooks/useOperationalMetrics';
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

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

  const totalDesign = ramas.reduce((s, r) => s + (r.hcDesign || 0), 0);
  const covered     = metrics.totalPresent;
  const expected    = metrics.totalExpected;
  const cov         = expected > 0 ? (covered / expected) * 100 : 0;
  const covStatus   = cov < 88 ? 'danger' : cov < 93 ? 'warning' : 'success';
  const covCfg      = STATUS[covStatus];

  return (
    <div className="space-y-5">

      {/* KPI strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: 'Design HC',        value: totalDesign.toLocaleString(), sub: 'Engineering standard',         color: 'text-blue-400',    bar: 'bg-blue-500' },
          { label: 'Expected (Shift)', value: expected.toLocaleString(),    sub: 'Shift attendance plan',        color: 'text-brand-text-secondary', bar: 'bg-brand-border' },
          { label: 'Present HC',       value: covered.toLocaleString(),     sub: `Δ ${covered - expected} vs expected`, color: covCfg.text, bar: covCfg.bar },
          { label: 'Coverage',         value: `${cov.toFixed(1)}%`,         sub: `Status: ${covCfg.label}`,     color: covCfg.text,        bar: covCfg.bar },
        ].map((k, i) => (
          <div key={i} className="relative bg-brand-card border border-brand-border rounded p-4 h-28 flex flex-col justify-between overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${k.bar}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary">{k.label}</span>
            <div className={`text-2xl font-extrabold tracking-tight ${k.color}`}>{k.value}</div>
            <span className="text-[10px] text-brand-text-muted">{k.sub}</span>
          </div>
        ))}
      </div>

      {/* Hierarchy panel */}
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

    </div>
  );
}
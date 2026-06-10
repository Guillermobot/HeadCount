import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { useOperationalMetrics, flattenToGroups } from '../hooks/useOperationalMetrics';
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

const STATUS = {
  success: { label: 'Normal', bar: 'bg-[#107C41]', text: 'text-[#107C41]', ring: 'border-l-[#107C41]', icon: CheckCircle },
  warning: { label: 'Alerta', bar: 'bg-[#F1C40F]', text: 'text-[#D69E2E]', ring: 'border-l-[#F1C40F]', icon: AlertTriangle },
  danger:  { label: 'Crítico', bar: 'bg-[#D64550]', text: 'text-[#D64550]', ring: 'border-l-[#D64550]', icon: XCircle },
};

function StatusPill({ status }) {
  const cfg = STATUS[status] || STATUS.success;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border border-gray-200 bg-white text-[9px] font-semibold ${cfg.text}`}>
      <Icon size={10} />{cfg.label}
    </span>
  );
}

function PuestoRow({ node }) {
  if (node.hcExpected === 0 && node.hcDesign === 0) return null;
  const cfg = STATUS[node.status] || STATUS.success;
  return (
    <div className={`flex items-center gap-3 px-3 py-1.5 bg-white border-b border-gray-100 border-l-2 ${cfg.ring} text-[10px]`}>
      <span className="flex-1 text-[#252423] font-medium truncate">{node.nombre}</span>
      <span className="tabular-nums text-[#605E5C] w-8 text-right">{node.hcDesign}</span>
      <span className="tabular-nums text-[#605E5C] w-8 text-right">{node.hcExpected}</span>
      <span className={`tabular-nums font-bold w-8 text-right ${cfg.text}`}>{node.actualPresent}</span>
      <span className={`tabular-nums w-12 text-right font-bold ${cfg.text}`}>{node.coverage.toFixed(1)}%</span>
    </div>
  );
}

function EstacionRow({ node }) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children?.length > 0;
  const cfg = STATUS[node.status] || STATUS.success;

  return (
    <div className="space-y-1 bg-white">
      <button onClick={() => hasChildren && setOpen(!open)} className={`w-full flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200 border-l-2 ${cfg.ring} hover:bg-[#F3F2F1] text-left`}>
        <span className="w-4 flex-shrink-0 text-[#605E5C]">
          {hasChildren && (open ? <ChevronDown size={12} /> : <ChevronRight size={12} />)}
        </span>
        <span className="flex-1 text-[11px] font-semibold text-[#252423] truncate">{node.nombre}</span>
        <span className="tabular-nums text-[10px] text-[#605E5C] w-8 text-right">{node.hcDesign}</span>
        <span className="tabular-nums text-[10px] text-[#605E5C] w-8 text-right">{node.hcExpected}</span>
        <span className={`tabular-nums text-[10px] font-bold w-8 text-right ${cfg.text}`}>{node.actualPresent}</span>
        <span className={`tabular-nums text-[11px] font-bold w-12 text-right ${cfg.text}`}>{node.coverage.toFixed(1)}%</span>
      </button>
      {open && hasChildren && (
        <div className="pl-6 bg-[#FAFAFA]">
          <div className="grid grid-cols-[1fr_2rem_2rem_2rem_3rem] gap-2 px-3 py-1 text-[9px] font-bold uppercase text-[#605E5C] border-b border-gray-200">
            <span>Puesto</span><span className="text-right">Dis</span><span className="text-right">Esp</span><span className="text-right">Real</span><span className="text-right">Cob.</span>
          </div>
          {node.children.map((c, i) => <PuestoRow key={i} node={c} />)}
        </div>
      )}
    </div>
  );
}

function GrupoRow({ node }) {
  const [open, setOpen] = useState(false);
  const hasEst = node.estaciones?.length > 0;
  const cfg = STATUS[node.status] || STATUS.success;

  return (
    <div className={`border border-gray-200 bg-white border-l-[3px] ${cfg.ring} shadow-sm mb-2`}>
      <button onClick={() => hasEst && setOpen(!open)} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#F3F2F1] text-left">
        <span className="w-4 text-[#605E5C]">{hasEst && (open ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}</span>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-[#252423]">{node.nombre}</span>
          <div className="mt-1 h-1.5 w-full bg-[#EDEBE9] overflow-hidden"><div className={`h-full ${cfg.bar}`} style={{ width: `${node.coverage}%` }} /></div>
        </div>
        <div className="hidden lg:flex gap-5 text-[10px] text-center text-[#605E5C]">
          <div><div>Esp.</div><div className="font-bold text-[#252423]">{node.hcExpected}</div></div>
          <div><div>Real</div><div className="font-bold text-[#252423]">{node.actualPresent}</div></div>
        </div>
        <div className="flex flex-col items-end gap-1 ml-3"><StatusPill status={node.status} /><span className={`text-sm font-extrabold ${cfg.text}`}>{node.coverage.toFixed(1)}%</span></div>
      </button>
      {open && hasEst && (
        <div className="bg-[#FAFAFA] border-t border-gray-200 p-2">
          {node.estaciones.map((est, i) => <EstacionRow key={i} node={est} />)}
        </div>
      )}
    </div>
  );
}

function SubAreaRow({ node }) {
  const [open, setOpen] = useState(false);
  const hasGrupos = node.grupos?.length > 0;
  const cfg = STATUS[node.status] || STATUS.success;

  return (
    <div className={`border border-gray-300 bg-[#FAFAFA] mb-3 shadow-sm`}>
      <button onClick={() => hasGrupos && setOpen(!open)} className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-[#F3F2F1] text-left border-l-4 ${cfg.ring}`}>
        <span className="w-5 text-[#605E5C]">{hasGrupos && (open ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}</span>
        <div className="flex-1 min-w-0">
          <span className="font-bold text-sm text-[#252423]">{node.nombre}</span>
          <div className="mt-2 h-2 w-full bg-[#EDEBE9]"><div className={`h-full ${cfg.bar}`} style={{ width: `${node.coverage}%` }} /></div>
        </div>
        <div className="flex flex-col items-end gap-1.5 ml-4"><StatusPill status={node.status} /><span className={`text-lg font-black ${cfg.text}`}>{node.coverage.toFixed(1)}%</span></div>
      </button>
      {open && hasGrupos && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="text-[10px] font-bold uppercase text-[#605E5C] mb-3">Grupos de {node.nombre}</div>
          {node.grupos.map((g, i) => <GrupoRow key={i} node={g} />)}
        </div>
      )}
    </div>
  );
}

function RamaRow({ node, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = STATUS[node.status] || STATUS.success;

  return (
    <div className={`border border-gray-300 bg-white shadow-sm mb-4`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#F3F2F1] text-left">
        <div className={`h-10 w-2 ${cfg.bar}`} />
        <div className="flex-1 min-w-0">
          <span className="font-extrabold text-base text-[#252423] tracking-wide">{node.nombre}</span>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex-1 max-w-[300px] h-2.5 bg-[#EDEBE9]"><div className={`h-full ${cfg.bar}`} style={{ width: `${node.coverage}%` }} /></div>
            <span className={`text-xs font-semibold ${cfg.text}`}>{node.actualPresent} / {node.hcExpected} ops</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 ml-4"><StatusPill status={node.status} /><span className={`text-2xl font-black ${cfg.text}`}>{node.coverage.toFixed(1)}%</span></div>
        <div className="ml-4 text-[#605E5C]">{open ? <ChevronDown size={20} /> : <ChevronRight size={20} />}</div>
      </button>
      {open && node.subAreas?.length > 0 && (
        <div className="bg-[#F3F2F1] border-t border-gray-300 p-5">
          <div className="text-[10px] font-bold uppercase text-[#605E5C] mb-3">Sub-áreas de {node.nombre}</div>
          {node.subAreas.map((sub, i) => <SubAreaRow key={i} node={sub} />)}
        </div>
      )}
    </div>
  );
}

export default function CoverageDashboard() {
  const { displaySnapshot } = useApp();
  const metrics = useOperationalMetrics(displaySnapshot);
  const ramas = metrics.ramasEnriched || [];

  return (
    <div className="space-y-5 bg-[#F3F2F1] p-4 font-['Segoe_UI']">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white border border-gray-300 shadow-sm flex flex-col">
          <div className="px-5 py-3.5 border-b border-gray-200 bg-[#FAFAFA]">
            <h3 className="text-sm font-semibold text-[#252423]">Jerarquía Real de Planta</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-[#F3F2F1]">
            {ramas.map((rama, i) => <RamaRow key={i} node={rama} defaultOpen={i === 0} />)}
          </div>
        </div>
        
        <div className="xl:col-span-1 bg-white border border-gray-300 shadow-sm p-4">
           <div className="text-sm font-semibold text-[#252423] border-b border-gray-200 pb-2 mb-4">Resumen de Cobertura</div>
           <div className="text-4xl font-black text-[#118DFF]">{metrics.coberturaGeneral.toFixed(1)}%</div>
           <div className="text-xs text-[#605E5C] mt-1">{metrics.totalPresent} presentes de {metrics.totalExpected} esperados</div>
        </div>
      </div>
    </div>
  );
}
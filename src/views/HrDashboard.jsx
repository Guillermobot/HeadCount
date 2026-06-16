import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import { useOperationalMetrics } from '../hooks/useOperationalMetrics';
import { HC_DESIGN_TOTAL } from '../data/constants';
import { Users, TrendingDown, Activity, UserCheck, ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';

const FabricTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1D1D1D] border border-[#2D2D2D] rounded shadow-2xl px-3 py-2 text-xs">
      {label && <div className="text-[#A19F9D] font-semibold mb-1">{label}</div>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-0.5">
          <span className="text-[#A19F9D]">{p.name}:</span>
          <span className="font-bold text-[#F3F2F1]">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// Subcomponent for Drill-Down Menu
function HrHierarchyRow({ node, depth = 0, expandedSet, onToggle, selectedNode, onSelect }) {
  const hasKids = 
    (node.subAreas && node.subAreas.length > 0) || 
    (node.grupos && node.grupos.length > 0) || 
    (node.estaciones && node.estaciones.length > 0) || 
    (node.children && node.children.length > 0);

  const isExpanded = expandedSet.has(node.nombre);
  const isSelected = selectedNode?.nombre === node.nombre;

  const kids = isExpanded ? (node.subAreas || node.grupos || node.estaciones || node.children || []) : [];

  return (
    <div className="select-none">
      <div 
        className={`flex items-center justify-between px-3 py-1.5 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5 ${isSelected ? 'bg-brand-accent/20 border-l-2 border-brand-accent' : 'border-l-2 border-transparent'}`}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
        onClick={() => onSelect(node)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {hasKids ? (
            <button 
              onClick={(e) => { e.stopPropagation(); onToggle(node.nombre); }}
              className="p-0.5 hover:bg-white/10 rounded text-brand-text-muted"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-[18px]" />
          )}
          {hasKids ? (
            isExpanded ? <FolderOpen size={13} className="text-brand-accent shrink-0" /> : <Folder size={13} className="text-brand-accent shrink-0" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-brand-text-muted shrink-0" />
          )}
          <span className={`text-[11px] truncate ${isSelected ? 'text-brand-text-primary font-semibold' : 'text-brand-text-secondary'}`}>
            {node.nombre}
          </span>
        </div>
        <div className="text-[10px] text-brand-text-muted tabular-nums shrink-0 ml-2">
          {node.actualPresent} / {node.hcExpected}
        </div>
      </div>
      
      {isExpanded && kids.map((child, idx) => (
        <HrHierarchyRow 
          key={child.id || child.nombre || idx} 
          node={child} 
          depth={depth + 1} 
          expandedSet={expandedSet} 
          onToggle={onToggle}
          selectedNode={selectedNode}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export default function HrDashboard() {
  const { displaySnapshot } = useApp();
  const metrics = useOperationalMetrics(displaySnapshot);

  // Drill-Down state
  const [expandedSet, setExpandedSet] = useState(new Set(['assembly', 'ASSEMBLY w/ KF LOGS']));
  const [selectedNode, setSelectedNode] = useState(null);

  const toggleNode = (nodeName) => {
    setExpandedSet(prev => {
      const next = new Set(prev);
      if (next.has(nodeName)) next.delete(nodeName);
      else next.add(nodeName);
      return next;
    });
  };

  const handleSelectNode = (node) => {
    setSelectedNode(prev => prev?.nombre === node.nombre ? null : node);
  };

  // Absence generation logic
  const getAbsenceData = (node) => {
    let deficit = 0;
    if (!node) {
      deficit = Math.max(0, metrics.totalExpected - metrics.totalPresent);
    } else {
      deficit = Math.max(0, (node.hcExpected || 0) - (node.actualPresent || 0));
    }

    if (deficit === 0) return [];

    const seed = node ? node.nombre.length : 1;
    const pTurnover = 0.15 + (seed % 2) * 0.05;
    const pVacations = 0.3 + (seed % 3) * 0.1;
    const pDisability = 0.1 + (seed % 2) * 0.05;
    
    const turnover = Math.floor(deficit * pTurnover);
    const vacations = Math.floor(deficit * pVacations);
    const disability = Math.floor(deficit * pDisability);
    const absenteeism = Math.max(0, deficit - turnover - vacations - disability);

    return [
      { name: 'Turnover', value: turnover, fill: '#8b5cf6' },
      { name: 'Vacations', value: vacations, fill: '#3b82f6' },
      { name: 'Absenteeism', value: absenteeism, fill: '#ef4444' },
      { name: 'Disability', value: disability, fill: '#eab308' },
    ].filter(d => d.value > 0);
  };

  const currentAbsences = getAbsenceData(selectedNode);
  const totalAbsences = currentAbsences.reduce((sum, item) => sum + item.value, 0);
  const ramas = metrics.ramasEnriched || [];

  const hcContratado = displaySnapshot?.hcContratado || 0;
  const recruitingGap = Math.max(0, HC_DESIGN_TOTAL - hcContratado);
  const absenteeism = metrics.ausentismoRate || 0;

  const matrixCols = ['19-Ene', '26-Ene', '02-Feb', '09-Feb', '16-Feb'];
  const expectedTotal = metrics.totalExpected || 1112;
  const presentTotal = metrics.totalPresent || 1034;
  
  const weeklyMatrixData = [
    {
      category: 'Design HC',
      metrics: [
        { name: 'Plan', values: [1498, 1498, 1498, 1498, HC_DESIGN_TOTAL] } // HC_DESIGN_TOTAL usually 1498
      ]
    },
    {
      category: 'Contracted HC',
      metrics: [
        { name: 'Real', values: [hcContratado - 1, hcContratado, hcContratado, hcContratado, hcContratado] },
        { name: '+/-', values: [(hcContratado - 1) - HC_DESIGN_TOTAL, hcContratado - HC_DESIGN_TOTAL, hcContratado - HC_DESIGN_TOTAL, hcContratado - HC_DESIGN_TOTAL, hcContratado - HC_DESIGN_TOTAL] }
      ]
    },
    {
      category: 'Turnover',
      metrics: [
        { name: 'Hires', values: [8, 5, 3, 4, 2] },
        { name: 'Terminations', values: [6, 4, 3, 4, 2] },
        { name: '+/-', values: [2, 1, 0, 0, 0] } // Net change: Hires - Terminations
      ]
    },
    {
      category: 'Active Attendance',
      metrics: [
        { name: 'Expected', values: [1112, 1112, 1112, 1112, expectedTotal] },
        { name: 'Real', values: [950, 980, 1010, 1025, presentTotal] },
        { name: '+/-', values: [950-1112, 980-1112, 1010-1112, 1025-1112, presentTotal-expectedTotal] }
      ]
    }
  ];


  return (
    <div className="space-y-5">

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: 'Design HC',          value: HC_DESIGN_TOTAL.toLocaleString(), sub: 'Engineering standard — 49 UPD', color: 'text-blue-400',    bar: 'bg-blue-500',    icon: Users },
          { label: 'Recruiting Gap',     value: recruitingGap,                   sub: `${hcContratado} contracted — ${recruitingGap} open vacancies`, color: recruitingGap > 30 ? 'text-red-400' : 'text-yellow-400', bar: recruitingGap > 30 ? 'bg-red-600' : 'bg-yellow-400', icon: TrendingDown },
          { label: 'Absenteeism Rate',   value: `${absenteeism.toFixed(1)}%`,    sub: 'vs. shift plan',                 color: absenteeism > 8 ? 'text-red-400' : absenteeism > 4 ? 'text-yellow-400' : 'text-emerald-400', bar: absenteeism > 8 ? 'bg-red-600' : absenteeism > 4 ? 'bg-yellow-400' : 'bg-emerald-500', icon: Activity },
          { label: 'Active Attendance',  value: metrics.totalPresent.toLocaleString(), sub: 'Operators on the floor', color: 'text-emerald-400', bar: 'bg-emerald-500',  icon: UserCheck },
        ].map((k, i) => (
          <div key={i} className="relative bg-brand-card border border-brand-border rounded p-4 h-28 flex flex-col justify-between overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${k.bar}`} />
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary pr-2 leading-tight">{k.label}</span>
              <k.icon size={14} className={k.color} />
            </div>
            <div className={`text-2xl font-extrabold tracking-tight ${k.color}`}>{k.value}</div>
            <div className="text-[10px] text-brand-text-muted leading-tight">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Drill-Down & Absence Pie Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Drill-Down Panel */}
        <div className="lg:col-span-1 bg-brand-card border border-brand-border rounded flex flex-col">
          <div className="px-5 py-3.5 border-b border-brand-border">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">Select Area</h3>
            <p className="text-[10px] text-brand-text-muted mt-0.5">Filter absences by department</p>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[300px] p-2 custom-scrollbar">
            {ramas.map(r => (
              <HrHierarchyRow
                key={r.id || r.nombre}
                node={r}
                depth={0}
                expandedSet={expandedSet}
                onToggle={toggleNode}
                selectedNode={selectedNode}
                onSelect={handleSelectNode}
              />
            ))}
          </div>
        </div>

        {/* Absence Reasons Pie Chart */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded flex flex-col">
          <div className="px-5 py-3.5 border-b border-brand-border">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">
              Absence Categories {selectedNode ? `— ${selectedNode.nombre}` : '— Plant Total'}
            </h3>
            <p className="text-[10px] text-brand-text-muted mt-0.5">
              {totalAbsences > 0 ? `Total absences: ${totalAbsences} operators` : 'No absences in this area'}
            </p>
          </div>
          <div className="flex-1 p-5 flex items-center justify-center min-h-[300px]">
            {totalAbsences > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={currentAbsences}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {currentAbsences.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<FabricTooltip />} />
                  <Legend 
                    verticalAlign="middle" 
                    align="right" 
                    layout="vertical"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10px', color: '#A19F9D' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-brand-text-muted text-xs italic">
                No absence data available for {selectedNode?.nombre || 'this selection'}.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Weekly HC Tracking Matrix ── */}
      <div className="bg-brand-card border border-brand-border rounded">
        <div className="px-5 py-3.5 border-b border-brand-border flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">Weekly HC Tracking Matrix</h3>
            <p className="text-[10px] text-brand-text-muted mt-0.5">Performance vs. Plan over the last 5 weeks</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-brand-text-muted bg-brand-bg w-40">Category</th>
                <th className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-brand-text-muted bg-brand-bg w-32">Metric</th>
                {matrixCols.map(col => (
                  <th key={col} className="px-4 py-2.5 text-[9px] font-bold uppercase tracking-widest text-brand-text-muted bg-brand-bg/60 text-right">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeklyMatrixData.map((category) => (
                <React.Fragment key={category.category}>
                  {category.metrics.map((metric, idx) => {
                    const isDiff = metric.name === '+/-';
                    return (
                      <tr key={metric.name} className="border-b border-brand-border/40 hover:bg-white/5 transition-colors">
                        {idx === 0 && (
                          <td 
                            rowSpan={category.metrics.length} 
                            className="px-4 py-2 text-[11px] font-bold text-brand-text-primary align-top bg-brand-bg/30 border-r border-brand-border/40"
                          >
                            {category.category}
                          </td>
                        )}
                        <td className="px-4 py-2 text-[10px] font-medium text-brand-text-secondary">
                          {metric.name}
                        </td>
                        {metric.values.map((val, vIdx) => {
                          let colorClass = "text-brand-text-primary";
                          if (isDiff) {
                            colorClass = val < 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold";
                          } else if (metric.name === 'Real') {
                            colorClass = "text-brand-accent font-medium";
                          }
                          
                          return (
                            <td key={vIdx} className={`px-4 py-2 text-[11px] text-right tabular-nums ${colorClass}`}>
                              {isDiff && val > 0 ? '+' : ''}{val.toLocaleString()}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
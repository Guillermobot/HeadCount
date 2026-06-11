import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { useOperationalMetrics } from '../hooks/useOperationalMetrics';
import { HC_DESIGN_TOTAL } from '../data/constants';
import { Users, TrendingDown, Activity, UserCheck } from 'lucide-react';

const FabricTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1D1D1D] border border-[#2D2D2D] rounded shadow-2xl px-3 py-2 text-xs">
      <div className="text-[#A19F9D] font-semibold mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <span className="text-[#A19F9D]">{p.name}:</span>
          <span className="font-bold text-[#F3F2F1]">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function HrDashboard() {
  const { displaySnapshot } = useApp();
  const metrics = useOperationalMetrics(displaySnapshot);

  const hcContratado = displaySnapshot?.hcContratado || 0;
  const recruitingGap = Math.max(0, HC_DESIGN_TOTAL - hcContratado);
  const absenteeism = metrics.ausentismoRate || 0;

  // Absence reasons (simulated distribution)
  const absenceReasons = [
    { name: 'Vacation',              value: 45, fill: '#107C41' },
    { name: 'Medical Leave',         value: 30, fill: '#E66C37' },
    { name: 'Unexcused Absence',     value: 40, fill: '#D64550' },
    { name: 'Scheduled Leave',       value: 33, fill: '#118DFF' },
  ];

  // Recruitment gap by area (from ramas)
  const ramas = metrics.ramasEnriched || [];
  const recruitmentGapData = ramas
    .map(r => ({
      nombre: r.nombre,
      design:     r.hcDesign || 0,
      contratado: Math.round((r.hcDesign || 0) * (hcContratado / HC_DESIGN_TOTAL)),
      gap:        Math.max(0, (r.hcDesign || 0) - Math.round((r.hcDesign || 0) * (hcContratado / HC_DESIGN_TOTAL))),
    }))
    .sort((a, b) => b.gap - a.gap);

  // Staffing chain data for waterfall bars
  const staffingChain = [
    { label: 'Design HC',      val: HC_DESIGN_TOTAL,       color: '#118DFF',  pct: 100 },
    { label: 'Contracted HC',  val: hcContratado,          color: '#4A90D9',  pct: HC_DESIGN_TOTAL > 0 ? (hcContratado / HC_DESIGN_TOTAL) * 100 : 0 },
    { label: 'Expected (Shift)', val: metrics.totalExpected, color: '#F1C40F', pct: HC_DESIGN_TOTAL > 0 ? (metrics.totalExpected / HC_DESIGN_TOTAL) * 100 : 0 },
    { label: 'Present (Real)',  val: metrics.totalPresent,  color: '#107C41',  pct: HC_DESIGN_TOTAL > 0 ? (metrics.totalPresent / HC_DESIGN_TOTAL) * 100 : 0 },
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

      {/* ── Row 2: Staffing Chain + Absence Reasons ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Staffing Chain */}
        <div className="bg-brand-card border border-brand-border rounded">
          <div className="px-5 py-3.5 border-b border-brand-border">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">Staffing Chain</h3>
            <p className="text-[10px] text-brand-text-muted mt-0.5">HC progression from Design to Real presence</p>
          </div>
          <div className="p-5 space-y-4">
            {staffingChain.map((row, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-brand-text-secondary font-semibold">{row.label}</span>
                  <span className="font-bold tabular-nums" style={{ color: row.color }}>{row.val?.toLocaleString()}</span>
                </div>
                <div className="h-5 bg-brand-bg rounded overflow-hidden flex items-center">
                  <div
                    className="h-full rounded transition-all"
                    style={{ width: `${Math.min(row.pct, 100)}%`, backgroundColor: row.color }}
                  />
                  <span className="text-[9px] text-brand-text-muted ml-2">{row.pct.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Absence Reasons */}
        <div className="bg-brand-card border border-brand-border rounded">
          <div className="px-5 py-3.5 border-b border-brand-border">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">Absence Categories</h3>
            <p className="text-[10px] text-brand-text-muted mt-0.5">Estimated distribution — current shift</p>
          </div>
          <div className="p-5" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={absenceReasons} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10, fill: '#A19F9D', fontFamily: 'Segoe UI' }}
                  axisLine={false}
                  tickLine={false}
                  width={130}
                />
                <Tooltip content={<FabricTooltip />} />
                <Bar dataKey="value" name="Operators" radius={[0, 3, 3, 0]} barSize={18}>
                  {absenceReasons.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Recruitment Gap Table ── */}
      <div className="bg-brand-card border border-brand-border rounded">
        <div className="px-5 py-3.5 border-b border-brand-border">
          <h3 className="text-xs font-bold uppercase tracking-widest text-brand-text-secondary">Recruitment Gap by Area</h3>
          <p className="text-[10px] text-brand-text-muted mt-0.5">Design HC vs. contracted headcount — open vacancies</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-bg border-b border-brand-border">
                {['Work Area', 'Design HC', 'Contracted', 'Gap'].map((h, i) => (
                  <th key={h} className={`px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-brand-text-muted ${i > 0 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recruitmentGapData.map((row, i) => (
                <tr key={i} className="border-b border-brand-border hover:bg-brand-bg/50 transition-colors">
                  <td className="px-5 py-2.5 text-[11px] font-medium text-brand-text-primary">{row.nombre}</td>
                  <td className="px-5 py-2.5 text-[11px] text-right text-brand-text-secondary tabular-nums">{row.design}</td>
                  <td className="px-5 py-2.5 text-[11px] text-right text-brand-text-secondary tabular-nums">{row.contratado}</td>
                  <td className={`px-5 py-2.5 text-[11px] text-right font-bold tabular-nums ${row.gap > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {row.gap > 0 ? `-${row.gap}` : '✓'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-brand-border bg-brand-bg">
                <td className="px-5 py-2.5 text-[11px] font-bold text-brand-text-secondary uppercase tracking-wider">Total</td>
                <td className="px-5 py-2.5 text-[11px] text-right font-bold text-brand-text-secondary tabular-nums">{HC_DESIGN_TOTAL}</td>
                <td className="px-5 py-2.5 text-[11px] text-right font-bold text-brand-text-secondary tabular-nums">{hcContratado}</td>
                <td className="px-5 py-2.5 text-[11px] text-right font-bold text-red-400 tabular-nums">-{recruitingGap}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  );
}
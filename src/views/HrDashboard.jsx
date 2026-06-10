import React, { useState, useMemo } from 'react';
import {
  ComposedChart, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, LabelList,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useOperationalMetrics } from '../hooks/useOperationalMetrics';
import { HC_DESIGN_TOTAL, HPT_OBJECTIVE } from '../data/constants';
import { ChevronDown, ChevronRight, TrendingDown, AlertTriangle, Info } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// Power BI Design Tokens (shared)
// ─────────────────────────────────────────────────────────────────
const PBI = {
  canvas:  '#121212', card: '#1E1E1E', cardAlt: '#252525',
  border:  '#333333', borderMid: '#444444',
  blue: '#118DFF', orange: '#E66C37', red: '#D64550',
  green: '#00B01D', darkBlue: '#12239E', purple: '#8764B8',
  white: '#FFFFFF', gray: '#A6A6A6', muted: '#666666',
  font: '"Segoe UI", "wf_standard-font", Arial, sans-serif',
};

// ─────────────────────────────────────────────────────────────────
// Period Mock Data
// ─────────────────────────────────────────────────────────────────
const PERIOD_DATA = {
  today: {
    label: 'Today',
    hcContratado: 1432,
    hcExpected: 1398,
    hcPresent: 1230,
    absences: {
      unexcused:  { count: 88,  pct: 52, impact: 'High'   },
      medical:    { count: 42,  pct: 25, impact: 'Medium'  },
      vacation:   { count: 28,  pct: 17, impact: 'Low'     },
      scheduled:  { count: 10,  pct:  6, impact: 'None'    },
    },
    trend: [
      { label: '06:00', attendance: 91.2, coverage: 88.0 },
      { label: '08:00', attendance: 92.5, coverage: 89.1 },
      { label: '10:00', attendance: 88.7, coverage: 86.3 },
      { label: '12:00', attendance: 87.9, coverage: 85.8 },
      { label: '14:00', attendance: 89.4, coverage: 87.2 },
      { label: '16:00', attendance: 90.1, coverage: 88.0 },
    ],
    departments: [
      { name: 'Línea de Ensamble', expected: 365, present: 310, isCritical: true,
        children: [
          { name: 'Trim Line',     expected: 115, present:  95 },
          { name: 'Chassis Line',  expected:  96, present:  82 },
          { name: 'Final Line',    expected:  87, present:  76 },
          { name: 'CNG',           expected:  38, present:  32 },
          { name: 'Export',        expected:  29, present:  25 },
        ]},
      { name: 'Kenfab', expected: 270, present: 220, isCritical: true,
        children: [
          { name: 'Frame & Rails',      expected:  96, present: 78 },
          { name: 'Cab Fabrication',    expected:  96, present: 76 },
          { name: 'Sheet Metal',        expected:  78, present: 66 },
        ]},
      { name: 'Plásticos',          expected:  85, present:  80 },
      { name: 'Materiales/Logística',expected: 160, present: 148, isCritical: true,
        children: [
          { name: 'Line Feeding',    expected: 66, present: 61 },
          { name: 'Offline Short.', expected: 38, present: 35 },
          { name: 'Truck Logistics',expected: 34, present: 32 },
          { name: 'Outbound',       expected: 22, present: 20 },
        ]},
      { name: 'Calidad',            expected:  95, present:  88 },
      { name: 'Mantenimiento',      expected:  85, present:  82 },
      { name: 'Ing. Industrial',    expected:  67, present:  64 },
      { name: 'Soporte/Dir.',       expected:  63, present:  60 },
    ],
  },
  week: {
    label: 'Current Week',
    hcContratado: 1432,
    hcExpected: 1420,
    hcPresent: 1318,
    absences: {
      unexcused:  { count: 54,  pct: 48, impact: 'High'   },
      medical:    { count: 31,  pct: 28, impact: 'Medium'  },
      vacation:   { count: 20,  pct: 18, impact: 'Low'     },
      scheduled:  { count:  7,  pct:  6, impact: 'None'    },
    },
    trend: [
      { label: 'Mon', attendance: 94.1, coverage: 92.5 },
      { label: 'Tue', attendance: 93.8, coverage: 91.8 },
      { label: 'Wed', attendance: 90.2, coverage: 88.6 },
      { label: 'Thu', attendance: 88.9, coverage: 87.1 },
      { label: 'Fri', attendance: 91.5, coverage: 89.4 },
    ],
    departments: [
      { name: 'Línea de Ensamble', expected: 375, present: 348, isCritical: true,
        children: [
          { name: 'Trim Line',    expected: 118, present: 108 },
          { name: 'Chassis Line', expected:  98, present:  90 },
          { name: 'Final Line',   expected:  89, present:  84 },
          { name: 'CNG',          expected:  40, present:  38 },
          { name: 'Export',       expected:  30, present:  28 },
        ]},
      { name: 'Kenfab',           expected: 275, present: 255, isCritical: true,
        children: [
          { name: 'Frame & Rails',    expected: 99, present: 92 },
          { name: 'Cab Fabrication',  expected: 98, present: 90 },
          { name: 'Sheet Metal',      expected: 78, present: 73 },
        ]},
      { name: 'Plásticos',          expected:  88, present:  83 },
      { name: 'Materiales/Logística',expected: 165, present: 156, isCritical: true,
        children: [
          { name: 'Line Feeding',    expected: 68, present: 64 },
          { name: 'Offline Short.', expected: 40, present: 38 },
          { name: 'Truck Logistics',expected: 35, present: 33 },
          { name: 'Outbound',       expected: 22, present: 21 },
        ]},
      { name: 'Calidad',            expected:  98, present:  93 },
      { name: 'Mantenimiento',      expected:  88, present:  85 },
      { name: 'Ing. Industrial',    expected:  69, present:  67 },
      { name: 'Soporte/Dir.',       expected:  68, present:  66 },
    ],
  },
  month: {
    label: 'Previous Month',
    hcContratado: 1428,
    hcExpected: 1435,
    hcPresent: 1358,
    absences: {
      unexcused:  { count: 41,  pct: 53, impact: 'High'   },
      medical:    { count: 22,  pct: 29, impact: 'Medium'  },
      vacation:   { count: 10,  pct: 13, impact: 'Low'     },
      scheduled:  { count:  4,  pct:  5, impact: 'None'    },
    },
    trend: [
      { label: 'W1', attendance: 96.2, coverage: 94.8 },
      { label: 'W2', attendance: 94.5, coverage: 93.1 },
      { label: 'W3', attendance: 91.8, coverage: 90.2 },
      { label: 'W4', attendance: 93.4, coverage: 91.6 },
    ],
    departments: [
      { name: 'Línea de Ensamble', expected: 378, present: 362, isCritical: true,
        children: [
          { name: 'Trim Line',    expected: 119, present: 114 },
          { name: 'Chassis Line', expected:  98, present:  94 },
          { name: 'Final Line',   expected:  89, present:  87 },
          { name: 'CNG',          expected:  40, present:  38 },
          { name: 'Export',       expected:  32, present:  29 },
        ]},
      { name: 'Kenfab',           expected: 272, present: 261, isCritical: true,
        children: [
          { name: 'Frame & Rails',    expected: 98, present: 95 },
          { name: 'Cab Fabrication',  expected: 98, present: 93 },
          { name: 'Sheet Metal',      expected: 76, present: 73 },
        ]},
      { name: 'Plásticos',          expected:  86, present:  84 },
      { name: 'Materiales/Logística',expected: 162, present: 156, isCritical: true,
        children: [
          { name: 'Line Feeding',    expected: 67, present: 65 },
          { name: 'Offline Short.', expected: 39, present: 37 },
          { name: 'Truck Logistics',expected: 34, present: 33 },
          { name: 'Outbound',       expected: 22, present: 21 },
        ]},
      { name: 'Calidad',            expected:  97, present:  94 },
      { name: 'Mantenimiento',      expected:  86, present:  84 },
      { name: 'Ing. Industrial',    expected:  68, present:  67 },
      { name: 'Soporte/Dir.',       expected:  67, present:  65 },
    ],
  },
};

const ABSENCE_COLORS = {
  unexcused: PBI.red,
  medical:   PBI.orange,
  vacation:  PBI.blue,
  scheduled: PBI.muted,
};
const ABSENCE_LABELS = {
  unexcused: 'Unexcused Absence',
  medical:   'Medical Leave',
  vacation:  'Vacation',
  scheduled: 'Scheduled Leave',
};

// ─────────────────────────────────────────────────────────────────
// Shared UI Atoms
// ─────────────────────────────────────────────────────────────────
const PbiTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: PBI.cardAlt, border: `1px solid ${PBI.borderMid}`, padding: '8px 12px', fontFamily: PBI.font, fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,.6)' }}>
      <div style={{ color: PBI.gray, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
          <span style={{ width: 8, height: 8, background: p.color || p.fill, display: 'inline-block' }} />
          <span style={{ color: PBI.gray }}>{p.name}:</span>
          <span style={{ color: PBI.white, fontWeight: 700 }}>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}{p.unit || ''}</span>
        </div>
      ))}
    </div>
  );
};

function PbiCardHeader({ title, subtitle, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '11px 16px 9px', borderBottom: `1px solid ${PBI.border}`, flexWrap: 'wrap', gap: 8 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: PBI.white, fontFamily: PBI.font }}>{title}</div>
        {subtitle && <div style={{ fontSize: 10, color: PBI.muted, marginTop: 2, fontFamily: PBI.font }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function KpiCard({ label, value, sub, color = PBI.blue }) {
  return (
    <div style={{ background: PBI.card, border: `1px solid ${PBI.border}`, borderTop: `3px solid ${color}`, padding: '14px 16px', fontFamily: PBI.font, minHeight: 100 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: PBI.gray, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, color, marginTop: 6, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: PBI.muted, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function StatusDot({ status }) {
  const col = status === 'Normal' ? PBI.green : status === 'Alert' ? PBI.orange : PBI.red;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: col, padding: '2px 8px', border: `1px solid ${col}`, background: `${col}18` }}>
      <span style={{ width: 5, height: 5, background: col, display: 'inline-block' }} />
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// Staffing Waterfall Chart
// ─────────────────────────────────────────────────────────────────
function StaffingWaterfall({ data }) {
  const { hcContratado, hcExpected, hcPresent } = data;
  const recruitingGap = HC_DESIGN_TOTAL - hcContratado;
  const totalAbsences = hcExpected - hcPresent;

  const steps = [
    { name: 'Design HC',       base: 0,             value: HC_DESIGN_TOTAL, fill: PBI.blue,   isStart: true  },
    { name: 'Recruiting Gap',  base: hcContratado,  value: recruitingGap,   fill: PBI.red,    isNeg: true    },
    { name: 'Hired HC',        base: 0,             value: hcContratado,    fill: PBI.blue,   isSubTotal: true },
    { name: 'Total Absences',  base: hcPresent,     value: totalAbsences,   fill: PBI.orange, isNeg: true    },
    { name: 'Present HC',      base: 0,             value: hcPresent,       fill: PBI.green,  isEnd: true    },
  ];

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={steps} margin={{ top: 20, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="2 6" stroke={PBI.border} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 9, fill: PBI.gray, fontFamily: PBI.font }} axisLine={{ stroke: PBI.border }} tickLine={false} />
        <YAxis domain={[0, HC_DESIGN_TOTAL + 20]} tick={{ fontSize: 9, fill: PBI.muted }} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0]?.payload;
            return (
              <div style={{ background: PBI.cardAlt, border: `1px solid ${PBI.borderMid}`, padding: '8px 12px', fontFamily: PBI.font, fontSize: 12 }}>
                <div style={{ color: PBI.white, fontWeight: 700 }}>{d?.name}</div>
                <div style={{ color: PBI.gray, marginTop: 4 }}>
                  {d?.isNeg ? 'Lost: ' : 'Total: '}
                  <b style={{ color: d?.fill }}>{d?.isNeg ? `-${d.value}` : d?.value?.toLocaleString()}</b>
                </div>
              </div>
            );
          }}
        />
        {/* Invisible base bar for stacking */}
        <Bar dataKey="base" stackId="w" fill="transparent" />
        {/* Value bar */}
        <Bar dataKey="value" stackId="w" radius={0} maxBarSize={52}>
          {steps.map((s, i) => <Cell key={i} fill={s.fill} fillOpacity={s.isSubTotal ? 0.6 : 1} />)}
          <LabelList
            dataKey="value"
            position="top"
            style={{ fontSize: 10, fontFamily: PBI.font, fill: PBI.gray }}
            formatter={(v, _, idx) => {
              const s = steps[idx];
              if (!s) return v;
              if (s.isNeg) return `-${v}`;
              return v.toLocaleString();
            }}
          />
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────────────────────────────────────────────
// Absence Donut + Matrix Table
// ─────────────────────────────────────────────────────────────────
function AbsenceAnalysis({ absences }) {
  const donutData = Object.entries(absences).map(([key, val]) => ({
    key, name: ABSENCE_LABELS[key], value: val.count, pct: val.pct, impact: val.impact, fill: ABSENCE_COLORS[key],
  }));
  const total = donutData.reduce((s, d) => s + d.value, 0);

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {/* Donut */}
      <div style={{ flexShrink: 0, width: 160, textAlign: 'center' }}>
        <PieChart width={160} height={160}>
          <Pie data={donutData} cx={75} cy={75} innerRadius={42} outerRadius={70} dataKey="value" strokeWidth={0}>
            {donutData.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0]?.payload;
              return (
                <div style={{ background: PBI.cardAlt, border: `1px solid ${PBI.borderMid}`, padding: '6px 10px', fontFamily: PBI.font, fontSize: 11 }}>
                  <div style={{ color: PBI.white, fontWeight: 700 }}>{d?.name}</div>
                  <div style={{ color: PBI.gray }}>{d?.value} employees ({d?.pct}%)</div>
                </div>
              );
            }}
          />
        </PieChart>
        <div style={{ fontSize: 22, fontWeight: 700, color: PBI.white, marginTop: -8, fontFamily: PBI.font }}>{total}</div>
        <div style={{ fontSize: 10, color: PBI.muted, fontFamily: PBI.font }}>Total Absences</div>
      </div>

      {/* Matrix table */}
      <div style={{ flex: 1, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: PBI.font }}>
          <thead>
            <tr style={{ background: PBI.cardAlt, borderBottom: `1px solid ${PBI.border}` }}>
              {['Category', 'Employees', '%', 'Impact'].map(h => (
                <th key={h} style={{ padding: '6px 10px', fontSize: 9, fontWeight: 700, color: PBI.gray, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: h === 'Employees' || h === '%' ? 'right' : 'left' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {donutData.map((row, i) => (
              <tr key={row.key} style={{ background: i % 2 === 0 ? PBI.card : '#202020', borderBottom: `1px solid ${PBI.border}` }}>
                <td style={{ padding: '7px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 3, height: 14, background: row.fill, display: 'inline-block' }} />
                    <span style={{ fontSize: 12, color: PBI.white }}>{row.name}</span>
                  </div>
                </td>
                <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: row.fill }}>
                  {row.value}
                </td>
                <td style={{ padding: '7px 10px', textAlign: 'right' }}>
                  {/* Mini data bar */}
                  <div style={{ position: 'relative', minWidth: 60, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${row.pct}%`, background: row.fill, opacity: 0.2 }} />
                    <span style={{ position: 'relative', fontSize: 11, fontWeight: 700, color: row.fill }}>{row.pct}%</span>
                  </div>
                </td>
                <td style={{ padding: '7px 10px' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px',
                    color: row.impact === 'High' ? PBI.red : row.impact === 'Medium' ? PBI.orange : row.impact === 'Low' ? PBI.green : PBI.muted,
                    border: `1px solid ${row.impact === 'High' ? PBI.red : row.impact === 'Medium' ? PBI.orange : row.impact === 'Low' ? PBI.green : PBI.borderMid}`,
                  }}>
                    {row.impact}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Attendance Trend Line Chart
// ─────────────────────────────────────────────────────────────────
function AttendanceTrend({ trend }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={trend} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="2 6" stroke={PBI.border} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 9, fill: PBI.muted, fontFamily: PBI.font }} axisLine={{ stroke: PBI.border }} tickLine={false} />
        <YAxis domain={[82, 100]} tick={{ fontSize: 9, fill: PBI.muted }} axisLine={false} tickLine={false} width={32} tickFormatter={v => `${v}%`} />
        <Tooltip content={<PbiTooltip />} />
        <ReferenceLine y={95} stroke={PBI.green} strokeDasharray="3 3" strokeWidth={1} />
        <ReferenceLine y={90} stroke={PBI.orange} strokeDasharray="3 3" strokeWidth={1} />
        <Line type="monotone" dataKey="attendance" name="Attendance" unit="%" stroke={PBI.blue} strokeWidth={2} dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
        <Line type="monotone" dataKey="coverage" name="Coverage" unit="%" stroke={PBI.green} strokeWidth={1.5} strokeDasharray="4 2" dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────────────────────────────────────────────
// Department Breakdown Matrix with Drill-Down
// ─────────────────────────────────────────────────────────────────
function DeptMatrix({ departments }) {
  const [expanded, setExpanded] = useState(new Set(['Línea de Ensamble']));

  const toggle = (name) => setExpanded(prev => {
    const next = new Set(prev);
    next.has(name) ? next.delete(name) : next.add(name);
    return next;
  });

  const renderRow = (dept, isChild = false) => {
    const cov = dept.expected > 0 ? (dept.present / dept.expected) * 100 : 0;
    const abs = dept.expected - dept.present;
    const status = cov >= 95 ? 'Normal' : cov >= 90 ? 'Alert' : 'Critical';
    const covColor = cov >= 95 ? PBI.green : cov >= 90 ? PBI.orange : PBI.red;
    const hasChildren = !isChild && dept.children?.length > 0;
    const isExpanded = expanded.has(dept.name);

    return (
      <React.Fragment key={dept.name}>
        <tr
          style={{ background: isChild ? '#1A1A1A' : '#1E1E1E', borderBottom: `1px solid ${PBI.border}`, cursor: hasChildren ? 'pointer' : 'default' }}
          onClick={() => hasChildren && toggle(dept.name)}
        >
          <td style={{ padding: '7px 10px', paddingLeft: isChild ? 28 : 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {hasChildren
                ? (isExpanded ? <ChevronDown size={11} style={{ color: PBI.gray }} /> : <ChevronRight size={11} style={{ color: PBI.gray }} />)
                : isChild ? <span style={{ width: 11, display: 'inline-block' }} /> : null
              }
              <span style={{ width: 3, height: 14, background: covColor, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: PBI.white, fontWeight: !isChild && dept.isCritical ? 600 : 400 }}>
                {dept.name}
              </span>
              {!isChild && dept.isCritical && (
                <span style={{ fontSize: 9, color: PBI.red, border: `1px solid ${PBI.red}`, padding: '1px 4px', fontWeight: 700 }}>CRITICAL</span>
              )}
            </div>
          </td>
          <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 12, color: PBI.gray }}>{dept.expected}</td>
          <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: covColor }}>{dept.present}</td>
          <td style={{ padding: '7px 10px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 18 }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(cov, 100)}%`, background: covColor, opacity: 0.18 }} />
              <span style={{ position: 'relative', fontSize: 12, fontWeight: 700, color: covColor, paddingLeft: 4 }}>{cov.toFixed(1)}%</span>
            </div>
          </td>
          <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: abs > 0 ? PBI.red : PBI.green }}>
            {abs > 0 ? `-${abs}` : '0'}
          </td>
          <td style={{ padding: '7px 10px' }}>
            <StatusDot status={status} />
          </td>
        </tr>
        {hasChildren && isExpanded && dept.children.map(c => renderRow(c, true))}
      </React.Fragment>
    );
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="pbi-matrix" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: PBI.font }}>
        <thead>
          <tr style={{ background: '#252525', borderBottom: `2px solid ${PBI.border}` }}>
            {['Department', 'Expected HC', 'Present HC', 'Coverage %', 'Absences', 'Status'].map((h, i) => (
              <th key={h} style={{ padding: '7px 10px', fontSize: 9, fontWeight: 700, color: PBI.gray, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: i > 0 && i < 4 ? 'right' : 'left', whiteSpace: 'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {departments.map(d => renderRow(d))}
        </tbody>
        <tfoot>
          <tr style={{ background: '#252525', borderTop: `2px solid ${PBI.border}` }}>
            <td style={{ padding: '7px 10px', fontSize: 11, fontWeight: 700, color: PBI.gray }}>TOTAL</td>
            <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 11, color: PBI.gray }}>{departments.reduce((s, d) => s + d.expected, 0)}</td>
            <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: PBI.white }}>{departments.reduce((s, d) => s + d.present, 0)}</td>
            <td style={{ padding: '7px 10px' }}>
              {(() => {
                const totExp = departments.reduce((s, d) => s + d.expected, 0);
                const totPres = departments.reduce((s, d) => s + d.present, 0);
                const cov = totExp > 0 ? (totPres / totExp) * 100 : 0;
                const col = cov >= 95 ? PBI.green : cov >= 90 ? PBI.orange : PBI.red;
                return <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{cov.toFixed(1)}%</span>;
              })()}
            </td>
            <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: PBI.red }}>
              -{departments.reduce((s, d) => s + Math.max(0, d.expected - d.present), 0)}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Executive Insights Panel
// ─────────────────────────────────────────────────────────────────
function ExecutiveInsights({ departments, absences, hcPresent, hcExpected }) {
  const depts = departments.map(d => ({
    ...d,
    coverage: d.expected > 0 ? (d.present / d.expected) * 100 : 0,
    absCount: d.expected - d.present,
    absPct: d.expected > 0 ? ((d.expected - d.present) / d.expected) * 100 : 0,
  }));

  const worstCov  = [...depts].sort((a, b) => a.coverage - b.coverage)[0];
  const worstAbs  = [...depts].sort((a, b) => b.absPct - a.absPct)[0];
  const largestLoss = [...depts].sort((a, b) => b.absCount - a.absCount)[0];
  const totalAbs  = depts.reduce((s, d) => s + d.absCount, 0);
  const overallCov = hcExpected > 0 ? (hcPresent / hcExpected) * 100 : 0;
  const hptImpact = ((HC_DESIGN_TOTAL - hcPresent) * 8 * 1.2 / 49).toFixed(1);

  const insights = [
    {
      icon: <TrendingDown size={14} style={{ color: PBI.red }} />,
      label: 'Largest Attendance Loss',
      value: largestLoss?.name,
      detail: `−${largestLoss?.absCount} employees (${largestLoss?.absPct.toFixed(1)}% absent)`,
      color: PBI.red,
    },
    {
      icon: <AlertTriangle size={14} style={{ color: PBI.orange }} />,
      label: 'Highest Absenteeism Rate',
      value: worstAbs?.name,
      detail: `${worstAbs?.absPct.toFixed(1)}% absent — ${worstAbs?.absCount} employees`,
      color: PBI.orange,
    },
    {
      icon: <AlertTriangle size={14} style={{ color: PBI.red }} />,
      label: 'Lowest Coverage',
      value: worstCov?.name,
      detail: `${worstCov?.coverage.toFixed(1)}% coverage — ${worstCov?.absCount} short`,
      color: PBI.red,
    },
    {
      icon: <Info size={14} style={{ color: PBI.blue }} />,
      label: 'Est. Operational Impact',
      value: `+${hptImpact} hrs / truck`,
      detail: `${totalAbs} total absences affecting HPT vs. ${HPT_OBJECTIVE} obj.`,
      color: PBI.blue,
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
      {insights.map((ins, i) => (
        <div key={i} style={{ background: PBI.cardAlt, border: `1px solid ${PBI.border}`, borderLeft: `3px solid ${ins.color}`, padding: '12px 14px', fontFamily: PBI.font }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            {ins.icon}
            <span style={{ fontSize: 10, fontWeight: 700, color: PBI.gray, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{ins.label}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: ins.color, marginBottom: 4 }}>{ins.value}</div>
          <div style={{ fontSize: 10, color: PBI.muted, lineHeight: 1.4 }}>{ins.detail}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Period Selector
// ─────────────────────────────────────────────────────────────────
function PeriodSelector({ active, onChange }) {
  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'week',  label: 'Current Week' },
    { key: 'month', label: 'Previous Month' },
  ];
  return (
    <div style={{ display: 'flex', gap: 0, border: `1px solid ${PBI.borderMid}` }}>
      {periods.map((p, i) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          style={{
            padding: '6px 16px',
            fontSize: 11,
            fontWeight: active === p.key ? 700 : 400,
            fontFamily: PBI.font,
            background: active === p.key ? PBI.blue : 'transparent',
            color: active === p.key ? PBI.white : PBI.gray,
            border: 'none',
            borderLeft: i > 0 ? `1px solid ${PBI.borderMid}` : 'none',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────
export default function HrDashboard() {
  const [period, setPeriod] = useState('today');
  const data = PERIOD_DATA[period];

  const overallCov = data.hcExpected > 0 ? (data.hcPresent / data.hcExpected) * 100 : 0;
  const absenteeismRate = data.hcExpected > 0 ? ((data.hcExpected - data.hcPresent) / data.hcExpected) * 100 : 0;
  const recruitingGap = HC_DESIGN_TOTAL - data.hcContratado;
  const totalAbsences = data.hcExpected - data.hcPresent;

  return (
    <div style={{ fontFamily: PBI.font, color: PBI.white, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header: Title + Period Selector ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: PBI.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Workforce Analytics
          </div>
          <div style={{ fontSize: 11, color: PBI.muted, marginTop: 2 }}>
            Headcount, Absenteeism & Operational Coverage — {data.label}
          </div>
        </div>
        <PeriodSelector active={period} onChange={setPeriod} />
      </div>

      {/* ── Row 1: KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        <KpiCard label="Design HC" value={HC_DESIGN_TOTAL.toLocaleString()} sub={`Fixed standard — ${recruitingGap} open vacancies`} color={PBI.blue} />
        <KpiCard label="Hired HC" value={data.hcContratado.toLocaleString()} sub={`Recruiting gap: −${recruitingGap} vs design`} color={(recruitingGap > 50 ? PBI.orange : PBI.green)} />
        <KpiCard label="Present HC" value={data.hcPresent.toLocaleString()} sub={`${totalAbsences} absences from expected ${data.hcExpected}`} color={(overallCov < 90 ? PBI.red : overallCov < 95 ? PBI.orange : PBI.green)} />
        <KpiCard label="Absenteeism Rate" value={`${absenteeismRate.toFixed(1)}%`} sub={`Overall coverage: ${overallCov.toFixed(1)}%`} color={(absenteeismRate > 10 ? PBI.red : absenteeismRate > 6 ? PBI.orange : PBI.green)} />
      </div>

      {/* ── Row 2: Waterfall + Absence Analysis ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {/* Staffing Waterfall */}
        <div style={{ background: PBI.card, border: `1px solid ${PBI.border}` }}>
          <PbiCardHeader
            title="Workforce Waterfall Analysis"
            subtitle={`Design HC → Recruiting Gap → Hired HC → Absences → Present HC — ${data.label}`}
          >
            <div style={{ display: 'flex', gap: 12, fontSize: 9, color: PBI.muted }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: PBI.blue, display: 'inline-block' }} /> Baseline</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: PBI.red, display: 'inline-block' }} /> Loss</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: PBI.green, display: 'inline-block' }} /> Result</span>
            </div>
          </PbiCardHeader>
          <div style={{ padding: '16px 8px 8px' }}>
            <StaffingWaterfall data={data} />
          </div>
          <div style={{ borderTop: `1px solid ${PBI.border}`, padding: '8px 16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { label: 'Recruiting Gap', value: `-${recruitingGap}`, color: PBI.red },
              { label: 'Daily Absences', value: `-${totalAbsences}`, color: PBI.orange },
              { label: 'Coverage Rate', value: `${overallCov.toFixed(1)}%`, color: overallCov < 90 ? PBI.red : overallCov < 95 ? PBI.orange : PBI.green },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: PBI.muted }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Absence Analysis */}
        <div style={{ background: PBI.card, border: `1px solid ${PBI.border}` }}>
          <PbiCardHeader
            title="Absence Categories Analysis"
            subtitle={`Breakdown by type — ${totalAbsences} total absences — ${data.label}`}
          />
          <div style={{ padding: '16px' }}>
            <AbsenceAnalysis absences={data.absences} />
          </div>
        </div>
      </div>

      {/* ── Row 3: Attendance Trend ── */}
      <div style={{ background: PBI.card, border: `1px solid ${PBI.border}` }}>
        <PbiCardHeader
          title="Attendance & Coverage Trend"
          subtitle={`${data.label} — Attendance % and Coverage % over time`}
        >
          <div style={{ display: 'flex', gap: 16, fontSize: 9, color: PBI.muted, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 14, height: 2, background: PBI.blue, display: 'inline-block' }} /> Attendance %</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 14, height: 2, background: PBI.green, display: 'inline-block', borderTop: `2px dashed ${PBI.green}` }} /> Coverage %</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 14, height: 1, background: PBI.orange, display: 'inline-block', borderTop: `1px dashed ${PBI.orange}` }} /> 90% threshold</span>
          </div>
        </PbiCardHeader>
        <div style={{ padding: '16px 8px 8px' }}>
          <AttendanceTrend trend={data.trend} />
        </div>
      </div>

      {/* ── Row 4: Department Matrix ── */}
      <div style={{ background: PBI.card, border: `1px solid ${PBI.border}` }}>
        <PbiCardHeader
          title="Department Workforce Breakdown"
          subtitle="Click on a department row to expand sub-areas — drill-down enabled"
        >
          <span style={{ fontSize: 10, color: PBI.muted }}>
            {data.departments.filter(d => d.children?.length).length} departments with drill-down
          </span>
        </PbiCardHeader>
        <div style={{ padding: '4px 0' }}>
          <DeptMatrix departments={data.departments} />
        </div>
      </div>

      {/* ── Row 5: Executive Insights ── */}
      <div style={{ background: PBI.card, border: `1px solid ${PBI.border}` }}>
        <PbiCardHeader
          title="Executive Insights"
          subtitle="Auto-generated highlights based on current period data"
        />
        <div style={{ padding: '12px' }}>
          <ExecutiveInsights
            departments={data.departments}
            absences={data.absences}
            hcPresent={data.hcPresent}
            hcExpected={data.hcExpected}
          />
        </div>
      </div>

    </div>
  );
}

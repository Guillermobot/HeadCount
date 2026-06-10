import React, { useState } from 'react';
import {
  ComposedChart,
  BarChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useOperationalMetrics } from '../hooks/useOperationalMetrics';
import { UPD_TARGET, HC_DESIGN_TOTAL, HPT_OBJECTIVE, HOURS_PER_SHIFT } from '../data/constants';
import { historicalDays } from '../data/mockData';

// ─────────────────────────────────────────────────────────────────
// Power BI Design Tokens
// ─────────────────────────────────────────────────────────────────
const PBI = {
  canvas:    '#121212',
  card:      '#1E1E1E',
  cardAlt:   '#252525',
  border:    '#333333',
  borderMid: '#444444',
  blue:      '#118DFF',
  darkBlue:  '#12239E',
  orange:    '#E66C37',
  red:       '#D64550',
  green:     '#00B01D',
  white:     '#FFFFFF',
  gray:      '#A6A6A6',
  muted:     '#666666',
  font:      '"Segoe UI", "wf_standard-font", Arial, sans-serif',
};

// Coverage thresholds → Power BI data color
function coverageColor(pct, isCritical) {
  const warn = isCritical ? 95 : 90;
  const crit = isCritical ? 90 : 85;
  if (pct >= warn) return PBI.green;
  if (pct >= crit) return PBI.orange;
  return PBI.red;
}

// ─────────────────────────────────────────────────────────────────
// Power BI Tooltip
// ─────────────────────────────────────────────────────────────────
const PbiTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#252525', border: `1px solid ${PBI.borderMid}`,
      padding: '8px 12px', fontFamily: PBI.font, fontSize: 12,
      boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
    }}>
      <div style={{ color: PBI.gray, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey || p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
          <span style={{ width: 8, height: 8, borderRadius: 0, background: p.color || p.fill, display: 'inline-block' }} />
          <span style={{ color: PBI.gray }}>{p.name}:</span>
          <span style={{ color: PBI.white, fontWeight: 700 }}>
            {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}{p.unit || ''}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Power BI KPI Card
// ─────────────────────────────────────────────────────────────────
function PbiKpiCard({ label, value, sub, accentColor = PBI.blue, icon }) {
  return (
    <div style={{
      background: PBI.card,
      border: `1px solid ${PBI.border}`,
      borderTop: `3px solid ${accentColor}`,
      padding: '14px 16px',
      fontFamily: PBI.font,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      minHeight: 108,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: PBI.gray, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.3 }}>
          {label}
        </span>
        {icon}
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, color: accentColor, lineHeight: 1.2, marginTop: 2 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: PBI.muted, lineHeight: 1.3 }}>{sub}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Power BI Matrix Visual
// ─────────────────────────────────────────────────────────────────
function PowerBiMatrix({ areas, soloCriticas }) {
  const displayAreas = soloCriticas ? areas.filter(a => a.isCritical) : areas;

  const cols = [
    { key: 'nombre',   label: 'Área',        align: 'left',  width: '30%' },
    { key: 'hcDesign', label: 'Diseño',      align: 'right', width: '11%' },
    { key: 'hcExp',    label: 'Esp.',        align: 'right', width: '11%' },
    { key: 'real',     label: 'Real',        align: 'right', width: '11%' },
    { key: 'delta',    label: 'Δ Faltantes', align: 'right', width: '12%' },
    { key: 'cov',      label: 'Cobertura %', align: 'left',  width: '25%' },
  ];

  return (
    <div style={{ fontFamily: PBI.font, overflowX: 'auto' }}>
      <table className="pbi-matrix" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        {/* Header */}
        <thead>
          <tr style={{ background: '#252525', borderBottom: `2px solid ${PBI.border}` }}>
            {cols.map(c => (
              <th key={c.key} style={{
                padding: '7px 10px',
                fontSize: 10,
                fontWeight: 700,
                color: PBI.gray,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                textAlign: c.align,
                width: c.width,
                whiteSpace: 'nowrap',
                borderBottom: `1px solid ${PBI.border}`,
              }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayAreas.map((area, idx) => {
            const coverage = area.hcExpected > 0 ? (area.actualPresent / area.hcExpected) * 100 : 0;
            const deficit = area.actualPresent - area.hcExpected;
            const barColor = coverageColor(coverage, area.isCritical);
            const isEven = idx % 2 === 0;

            return (
              <tr
                key={area.nombre}
                style={{
                  background: isEven ? PBI.card : '#202020',
                  borderBottom: `1px solid ${PBI.border}`,
                  transition: 'background 0.1s',
                }}
              >
                {/* Área */}
                <td style={{ padding: '7px 10px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      width: 3, height: 14, background: barColor,
                      display: 'inline-block', flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 12, color: PBI.white, fontWeight: area.isCritical ? 600 : 400 }}>
                      {area.nombre}
                    </span>
                    {area.isCritical && (
                      <span style={{
                        fontSize: 9, color: PBI.red, fontWeight: 700,
                        padding: '1px 4px', border: `1px solid ${PBI.red}`,
                        letterSpacing: '0.04em', lineHeight: 1.4,
                      }}>CRÍTICA</span>
                    )}
                  </div>
                </td>
                {/* Diseño */}
                <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 12, color: PBI.gray }}>
                  {area.hcDesign.toLocaleString()}
                </td>
                {/* Esperado */}
                <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 12, color: PBI.gray }}>
                  {area.hcExpected.toLocaleString()}
                </td>
                {/* Real */}
                <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 12, color: barColor, fontWeight: 600 }}>
                  {area.actualPresent.toLocaleString()}
                </td>
                {/* Delta */}
                <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 12, fontWeight: 600 }}>
                  <span style={{ color: deficit < 0 ? PBI.red : PBI.green }}>
                    {deficit >= 0 ? '+' : ''}{deficit}
                  </span>
                </td>
                {/* Cobertura % — Data Bar */}
                <td style={{ padding: '7px 10px', textAlign: 'left' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 20 }}>
                    {/* Background Data Bar */}
                    <div style={{
                      position: 'absolute',
                      left: 0, top: 0, bottom: 0,
                      width: `${Math.min(coverage, 100)}%`,
                      background: barColor,
                      opacity: 0.18,
                      pointerEvents: 'none',
                    }} />
                    {/* Value text */}
                    <span style={{
                      position: 'relative',
                      zIndex: 1,
                      fontSize: 12,
                      fontWeight: 700,
                      color: barColor,
                      paddingLeft: 4,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {coverage.toFixed(1)}%
                    </span>
                    {/* Sub-area drill indicator */}
                    {area.children?.length > 0 && (
                      <span style={{ marginLeft: 6, fontSize: 9, color: PBI.muted }}>
                        {area.children.length} sub-áreas
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        {/* Totals row */}
        <tfoot>
          <tr style={{ background: '#252525', borderTop: `2px solid ${PBI.border}` }}>
            <td style={{ padding: '7px 10px', fontSize: 11, fontWeight: 700, color: PBI.gray }}>
              TOTAL TURNO
            </td>
            <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 11, color: PBI.gray }}>
              {displayAreas.reduce((s, a) => s + a.hcDesign, 0)}
            </td>
            <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 11, color: PBI.gray }}>
              {displayAreas.reduce((s, a) => s + a.hcExpected, 0)}
            </td>
            <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: PBI.white }}>
              {displayAreas.reduce((s, a) => s + a.actualPresent, 0)}
            </td>
            <td style={{ padding: '7px 10px', textAlign: 'right', fontSize: 11, fontWeight: 700 }}>
              {(() => {
                const d = displayAreas.reduce((s, a) => s + (a.actualPresent - a.hcExpected), 0);
                return <span style={{ color: d < 0 ? PBI.red : PBI.green }}>{d >= 0 ? '+' : ''}{d}</span>;
              })()}
            </td>
            <td style={{ padding: '7px 10px' }}>
              {(() => {
                const totExp = displayAreas.reduce((s, a) => s + a.hcExpected, 0);
                const totPres = displayAreas.reduce((s, a) => s + a.actualPresent, 0);
                const totalCov = totExp > 0 ? (totPres / totExp) * 100 : 0;
                const col = totalCov >= 95 ? PBI.green : totalCov >= 90 ? PBI.orange : PBI.red;
                return (
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 20 }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: `${Math.min(totalCov, 100)}%`,
                      background: col, opacity: 0.22,
                    }} />
                    <span style={{ position: 'relative', zIndex: 1, fontSize: 12, fontWeight: 700, color: col, paddingLeft: 4 }}>
                      {totalCov.toFixed(1)}%
                    </span>
                  </div>
                );
              })()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Horizontal HPT Impact Bar Chart (Power BI Clustered Horizontal)
// ─────────────────────────────────────────────────────────────────
function HptImpactHorizontalBar({ areas }) {
  const data = areas
    .map((area) => {
      const deficit = Math.max(0, area.hcExpected - area.actualPresent);
      const areaWeight = area.hcDesign / HC_DESIGN_TOTAL;
      const hptContrib = deficit > 0 ? parseFloat(((deficit * HOURS_PER_SHIFT * 1.2 * areaWeight) / 49).toFixed(2)) : 0;
      const barColor = area.status === 'danger' ? PBI.red : area.status === 'warning' ? PBI.orange : PBI.green;
      return {
        name: area.nombre.replace('Ingeniería Industrial y MFC', 'Ing. Industrial').replace('Soporte / Facilities / Dir.', 'Soporte/Dir.'),
        hptImpact: hptContrib,
        fill: barColor,
        coverage: area.hcExpected > 0 ? (area.actualPresent / area.hcExpected) * 100 : 0,
      };
    })
    .filter(d => d.hptImpact > 0.01)
    .sort((a, b) => b.hptImpact - a.hptImpact); // Descending — Power BI default

  if (!data.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: PBI.muted, fontSize: 12 }}>
        Sin impacto HPT registrado en este turno
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.hptImpact));

  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 40 + 40, 180)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 56, bottom: 4, left: 8 }}
        barCategoryGap="30%"
      >
        <CartesianGrid strokeDasharray="2 4" stroke={PBI.border} horizontal={false} />
        <XAxis
          type="number"
          domain={[0, maxVal * 1.2]}
          tick={{ fontSize: 9, fill: PBI.muted, fontFamily: PBI.font }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `+${v.toFixed(1)}h`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 10, fill: PBI.gray, fontFamily: PBI.font }}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0]?.payload;
            return (
              <div style={{
                background: PBI.cardAlt, border: `1px solid ${PBI.borderMid}`,
                padding: '8px 12px', fontFamily: PBI.font, fontSize: 12,
              }}>
                <div style={{ color: PBI.white, fontWeight: 600 }}>{d?.name}</div>
                <div style={{ color: PBI.gray, marginTop: 4 }}>
                  Impacto HPT: <b style={{ color: d?.fill }}>+{d?.hptImpact.toFixed(2)} hrs</b>
                </div>
                <div style={{ color: PBI.gray }}>
                  Cobertura: <b style={{ color: d?.fill }}>{d?.coverage.toFixed(1)}%</b>
                </div>
              </div>
            );
          }}
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
        />
        <ReferenceLine x={0} stroke={PBI.border} />
        <Bar dataKey="hptImpact" radius={0} maxBarSize={22}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
          <LabelList
            dataKey="hptImpact"
            position="right"
            formatter={(v) => `+${v.toFixed(1)}h`}
            style={{ fontSize: 10, fill: PBI.gray, fontFamily: PBI.font }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section Header (Power BI visual title style)
// ─────────────────────────────────────────────────────────────────
function PbiCardHeader({ title, subtitle, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      padding: '12px 16px 10px',
      borderBottom: `1px solid ${PBI.border}`,
      flexWrap: 'wrap', gap: 8,
    }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: PBI.white, fontFamily: PBI.font }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 10, color: PBI.muted, marginTop: 2, fontFamily: PBI.font }}>
            {subtitle}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Risk Level Badge
// ─────────────────────────────────────────────────────────────────
function RiskBadge({ nivel, score }) {
  const colors = {
    'Crítico': PBI.red,
    'Alto': PBI.orange,
    'Medio': '#F1C40F',
    'Bajo': PBI.green,
  };
  const col = colors[nivel] || PBI.gray;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px',
      border: `1px solid ${col}`,
      background: `${col}18`,
      fontFamily: PBI.font, fontSize: 11, fontWeight: 700,
      color: col, letterSpacing: '0.04em',
    }}>
      <span style={{ width: 6, height: 6, background: col, display: 'inline-block', animation: nivel === 'Crítico' ? 'pulse 1s infinite' : 'none' }} />
      {nivel.toUpperCase()}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────
export default function ExecutiveDashboard() {
  const { displaySnapshot, filters } = useApp();
  const metrics = useOperationalMetrics(displaySnapshot);
  const hptDelta = metrics.hptActual - HPT_OBJECTIVE;
  const hcContratado = displaySnapshot?.hcContratado ?? HC_DESIGN_TOTAL;

  // ── KPI Rows config ──
  const row1 = [
    {
      label: 'UPD Target',
      value: UPD_TARGET.toFixed(0),
      sub: 'Objetivo fijo — Ingeniería Industrial',
      color: PBI.blue,
    },
    {
      label: 'HC Diseño',
      value: HC_DESIGN_TOTAL.toLocaleString(),
      sub: 'Estándar operativo de diseño',
      color: PBI.blue,
    },
    {
      label: 'HC Contratado',
      value: hcContratado.toLocaleString(),
      sub: `Brecha vs diseño: −${HC_DESIGN_TOTAL - hcContratado} vacantes`,
      color: (HC_DESIGN_TOTAL - hcContratado) > 60 ? PBI.orange : PBI.green,
    },
    {
      label: 'HC Esperado Turno',
      value: (displaySnapshot?.hcExpectedTotal ?? 0).toLocaleString(),
      sub: `Plan del ${filters.turno}`,
      color: PBI.gray,
    },
    {
      label: 'HC Presente',
      value: metrics.totalPresent.toLocaleString(),
      sub: `Faltantes: ${metrics.totalExpected - metrics.totalPresent} operadores`,
      color: metrics.coberturaGeneral < 90 ? PBI.red : metrics.coberturaGeneral < 95 ? PBI.orange : PBI.green,
    },
    {
      label: 'Cobertura Operacional',
      value: `${metrics.coberturaGeneral.toFixed(1)}%`,
      sub: 'Asistencia vs HC Esperado Turno',
      color: metrics.coberturaGeneral < 90 ? PBI.red : metrics.coberturaGeneral < 95 ? PBI.orange : PBI.green,
    },
  ];

  const row2 = [
    {
      label: 'HPT Objetivo',
      value: `${HPT_OBJECTIVE.toFixed(1)} hrs`,
      sub: '1,498 HC × 8h ÷ 49 UPD',
      color: PBI.orange,
    },
    {
      label: 'HPT Actual',
      value: `${metrics.hptActual.toFixed(1)} hrs`,
      sub: displaySnapshot?.otHabilitada ? 'Con Tiempo Extra habilitado' : 'Sin Tiempo Extra',
      color: hptDelta > 20 ? PBI.red : hptDelta > 8 ? PBI.orange : PBI.green,
    },
    {
      label: 'Variación HPT',
      value: `${hptDelta > 0 ? '+' : ''}${metrics.hptDiferencia.toFixed(1)}%`,
      sub: `${hptDelta > 0 ? '+' : ''}${hptDelta.toFixed(1)} hrs sobre objetivo`,
      color: hptDelta > 20 ? PBI.red : hptDelta > 8 ? PBI.orange : PBI.green,
    },
    {
      label: 'Riesgo Operacional',
      value: `${metrics.riesgoScore}%`,
      sub: `Nivel: ${metrics.riesgoNivel}`,
      color: metrics.riesgoScore >= 70 ? PBI.red : metrics.riesgoScore >= 45 ? PBI.orange : PBI.green,
    },
  ];

  return (
    <div style={{ fontFamily: PBI.font, color: PBI.white, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Section Label ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: PBI.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Cadena de Headcount
        </span>
        <div style={{ flex: 1, height: 1, background: PBI.border }} />
      </div>

      {/* ── ROW 1: Headcount KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
        {row1.map((k, i) => (
          <PbiKpiCard key={i} label={k.label} value={k.value} sub={k.sub} accentColor={k.color} />
        ))}
      </div>

      {/* ── Section Label ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: PBI.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Horas por Camión (HPT) y Riesgo
        </span>
        <div style={{ flex: 1, height: 1, background: PBI.border }} />
        <RiskBadge nivel={metrics.riesgoNivel} score={metrics.riesgoScore} />
      </div>

      {/* ── ROW 2: HPT & Risk KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {row2.map((k, i) => (
          <PbiKpiCard key={i} label={k.label} value={k.value} sub={k.sub} accentColor={k.color} />
        ))}
      </div>

      {/* ── ROW 3: Matrix + Horizontal Bar Chart ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 8 }}>

        {/* Power BI Matrix Visual */}
        <div style={{ background: PBI.card, border: `1px solid ${PBI.border}` }}>
          <PbiCardHeader
            title="Matriz Operacional de Cobertura por Área"
            subtitle={`Cobertura vs. HC Esperado del Turno — ${filters.turno} · ${displaySnapshot?.horario ?? ''}`}
          >
            <div style={{ display: 'flex', gap: 12, fontSize: 9, color: PBI.muted, alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 6, background: PBI.green, opacity: 0.6, display: 'inline-block' }} />
                ≥95%
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 6, background: PBI.orange, opacity: 0.6, display: 'inline-block' }} />
                90–95%
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 6, background: PBI.red, opacity: 0.6, display: 'inline-block' }} />
                &lt;90%
              </span>
            </div>
          </PbiCardHeader>
          <div style={{ padding: '4px 0', overflowY: 'auto', maxHeight: 380 }}>
            <PowerBiMatrix areas={metrics.details || []} soloCriticas={false} />
          </div>
          {/* Matrix footer */}
          <div style={{
            padding: '8px 16px',
            borderTop: `1px solid ${PBI.border}`,
            fontSize: 10, color: PBI.muted,
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>● Área Crítica — umbral alerta: 95% | ■ Barra de datos condicional (Power BI format)</span>
            <span style={{ color: PBI.gray }}>
              OT: <b style={{ color: displaySnapshot?.otHabilitada ? PBI.orange : PBI.muted }}>
                {displaySnapshot?.otHabilitada ? 'Habilitado' : 'Deshabilitado'}
              </b>
            </span>
          </div>
        </div>

        {/* Horizontal HPT Impact Bar Chart */}
        <div style={{ background: PBI.card, border: `1px solid ${PBI.border}`, display: 'flex', flexDirection: 'column' }}>
          <PbiCardHeader
            title="Impacto HPT por Área (Descendente)"
            subtitle="Horas extra generadas por déficit de personal — ordenado de mayor a menor"
          />
          <div style={{ flex: 1, padding: '12px 8px 8px', overflowY: 'auto' }}>
            <HptImpactHorizontalBar areas={metrics.details || []} />
          </div>
          <div style={{
            padding: '8px 16px',
            borderTop: `1px solid ${PBI.border}`,
            fontSize: 10, color: PBI.muted,
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span style={{ color: PBI.gray }}>
              Δ HPT Total:&nbsp;
              <b style={{ color: hptDelta > 0 ? PBI.red : PBI.green }}>
                {hptDelta > 0 ? '+' : ''}{hptDelta.toFixed(1)} hrs
              </b>
            </span>
            <span>Objetivo: <b style={{ color: PBI.orange }}>{HPT_OBJECTIVE} hrs</b></span>
          </div>
        </div>
      </div>

      {/* ── ROW 4: Historical Trend ── */}
      <div style={{ background: PBI.card, border: `1px solid ${PBI.border}` }}>
        <PbiCardHeader
          title="Tendencia Histórica — Cobertura Operacional y HPT Actual (30 días)"
          subtitle={`Referencia fija HPT Objetivo: ${HPT_OBJECTIVE} hrs`}
        >
          <div style={{ display: 'flex', gap: 16, fontSize: 10, color: PBI.muted, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 16, height: 2, background: PBI.blue, display: 'inline-block' }} />
              Cobertura %
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 16, height: 2, background: PBI.orange, display: 'inline-block' }} />
              HPT Real
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 16, height: 2, background: PBI.red, borderTop: `2px dashed ${PBI.red}`, display: 'inline-block' }} />
              HPT Obj.
            </span>
          </div>
        </PbiCardHeader>

        <div style={{ padding: '16px 16px 8px', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={historicalDays} margin={{ top: 4, right: 48, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="covGradPbi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PBI.blue} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={PBI.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke={PBI.border} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: PBI.muted, fontFamily: PBI.font }}
                axisLine={{ stroke: PBI.border }}
                tickLine={false}
                interval={3}
              />
              <YAxis
                yAxisId="left"
                domain={[80, 100]}
                tick={{ fontSize: 9, fill: PBI.muted, fontFamily: PBI.font }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                width={36}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[230, 295]}
                tick={{ fontSize: 9, fill: PBI.muted, fontFamily: PBI.font }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}h`}
                width={38}
              />
              <Tooltip content={<PbiTooltip />} />
              <ReferenceLine yAxisId="right" y={HPT_OBJECTIVE} stroke={PBI.red} strokeDasharray="4 3" strokeWidth={1.5} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="coberturaReal"
                name="Cobertura"
                unit="%"
                stroke={PBI.blue}
                strokeWidth={2}
                fill="url(#covGradPbi)"
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0, fill: PBI.blue }}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="actualHpt"
                name="HPT Real"
                unit=" hrs"
                stroke={PBI.orange}
                strokeWidth={1.5}
                fill="transparent"
                dot={false}
                activeDot={{ r: 3, strokeWidth: 0, fill: PBI.orange }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stat strip */}
        <div style={{
          borderTop: `1px solid ${PBI.border}`,
          padding: '8px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
        }}>
          {[
            {
              label: 'Promedio Cobertura 30d',
              value: `${(historicalDays.reduce((s, d) => s + d.coberturaReal, 0) / historicalDays.length).toFixed(1)}%`,
              color: PBI.blue,
            },
            {
              label: 'Promedio HPT 30d',
              value: `${(historicalDays.reduce((s, d) => s + d.actualHpt, 0) / historicalDays.length).toFixed(1)} hrs`,
              color: PBI.orange,
            },
            {
              label: 'Días HPT sobre Objetivo',
              value: `${historicalDays.filter((d) => d.actualHpt > HPT_OBJECTIVE).length} / ${historicalDays.length}`,
              color: PBI.red,
            },
            {
              label: 'Días Cobertura < 90%',
              value: `${historicalDays.filter((d) => d.coberturaReal < 90).length} / ${historicalDays.length}`,
              color: PBI.red,
            },
          ].map((item, i) => (
            <div key={i}>
              <div style={{ fontSize: 10, color: PBI.muted }}>{item.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: item.color, marginTop: 2 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

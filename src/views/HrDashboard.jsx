import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import { useOperationalMetrics } from '../hooks/useOperationalMetrics';
import { HC_DESIGN_TOTAL } from '../data/constants';

export default function HrDashboard() {
  const { displaySnapshot } = useApp();
  const metrics = useOperationalMetrics(displaySnapshot);

  // Datos simulados para motivos de ausencia (Distribución estimada)
  const absenceReasons = [
    { name: 'Vacaciones', value: 45, fill: '#107C41' },
    { name: 'Incapacidades', value: 30, fill: '#E66C37' },
    { name: 'Faltas Injustificadas', value: 40, fill: '#D64550' },
    { name: 'Permisos', value: 33, fill: '#118DFF' },
  ];

  // Cálculo de la Brecha (Gap) por Área para la tabla
  const recruitmentGapData = (metrics.details || [])
    .map(area => ({
      nombre: area.nombre,
      design: area.hcDesign,
      contratado: Math.round(area.hcDesign * 0.95), // Simulación: RH suele tener 95% de la plantilla
      gap: Math.max(0, area.hcDesign - Math.round(area.hcDesign * 0.95))
    }))
    .sort((a, b) => b.gap - a.gap);

  return (
    <div className="space-y-6 font-['Segoe_UI'] text-[#252423]">
      {/* Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'HC Diseño', value: HC_DESIGN_TOTAL, sub: 'Estándar de Ingeniería' },
          { label: 'Brecha Reclutamiento', value: HC_DESIGN_TOTAL - (displaySnapshot?.hcContratado || 0), sub: 'Vacantes activas', color: 'text-[#D64550]' },
          { label: 'Tasa de Ausentismo', value: `${metrics.ausentismoRate.toFixed(1)}%`, sub: 'vs. Planificado' },
          { label: 'Asistencia Activa', value: metrics.totalPresent, sub: 'Personal en línea', color: 'text-[#107C41]' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-4 rounded border border-[#E1DFDD] shadow-sm flex flex-col justify-between h-28">
            <span className="text-[10px] text-[#605E5C] font-semibold uppercase tracking-wider">{card.label}</span>
            <span className={`text-3xl font-bold ${card.color || 'text-[#252423]'}`}>{card.value}</span>
            <span className="text-[10px] text-[#605E5C]">{card.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Waterfall de Staffing */}
        <div className="bg-white p-6 rounded border border-[#E1DFDD] shadow-sm">
          <h3 className="text-xs font-bold text-[#252423] uppercase tracking-wider mb-1">Staffing Waterfall</h3>
          <p className="text-[11px] text-[#605E5C] mb-6">Desglose del HC desde Diseño hasta Asistencia Real</p>
          
          <div className="space-y-4">
            {[
              { label: 'HC Diseño', val: HC_DESIGN_TOTAL, color: '#252423' },
              { label: 'HC Contratado', val: displaySnapshot?.hcContratado, color: '#118DFF' },
              { label: 'HC Esperado (Turno)', val: metrics.totalExpected, color: '#F1C40F' },
              { label: 'HC Presente (Real)', val: metrics.totalPresent, color: '#107C41' },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-32 text-[11px] font-medium text-[#605E5C]">{row.label}</span>
                <div className="flex-1 h-6 bg-[#EDEBE9] rounded-sm flex items-center px-3 font-bold text-[12px]" style={{ color: row.color }}>
                  {row.val}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivos de Ausencia */}
        <div className="bg-white p-6 rounded border border-[#E1DFDD] shadow-sm">
          <h3 className="text-xs font-bold text-[#252423] uppercase tracking-wider mb-6">Motivos de Ausencia</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={absenceReasons} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {absenceReasons.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabla de Brecha de Reclutamiento */}
      <div className="bg-white border border-[#E1DFDD] shadow-sm">
        <div className="px-6 py-4 border-b border-[#E1DFDD]">
          <h3 className="text-xs font-bold text-[#252423] uppercase tracking-wider">Brecha de Reclutamiento por Área</h3>
        </div>
        <table className="w-full text-left text-[11px]">
          <thead className="bg-[#FAFAFA] text-[#605E5C] uppercase">
            <tr>
              <th className="px-6 py-3">Área de Trabajo</th>
              <th className="px-6 py-3 text-right">HC Diseño</th>
              <th className="px-6 py-3 text-right">HC Contratado</th>
              <th className="px-6 py-3 text-right font-bold text-[#D64550]">Brecha (Gap)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recruitmentGapData.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium">{row.nombre}</td>
                <td className="px-6 py-3 text-right text-[#605E5C]">{row.design}</td>
                <td className="px-6 py-3 text-right text-[#605E5C]">{row.contratado}</td>
                <td className="px-6 py-3 text-right font-bold text-[#D64550]">{row.gap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
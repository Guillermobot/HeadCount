import React from 'react';
import { useApp } from '../context/AppContext';
import { useOperationalMetrics } from '../hooks/useOperationalMetrics';
import { HC_DESIGN_TOTAL } from '../data/constants';

export default function HrDashboard() {
  const { displaySnapshot } = useApp();
  const metrics = useOperationalMetrics(displaySnapshot);

  return (
    <div className="space-y-6">
      {/* Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-card p-4 rounded border border-brand-border flex flex-col justify-between h-28">
          <span className="text-xs text-brand-text-secondary font-medium uppercase tracking-wider">HC Diseño</span>
          <span className="text-3xl font-bold text-brand-text-primary">{HC_DESIGN_TOTAL}</span>
          <span className="text-[10px] text-brand-text-muted">Estándar fijo</span>
        </div>
        <div className="bg-brand-card p-4 rounded border border-brand-border flex flex-col justify-between h-28">
          <span className="text-xs text-brand-text-secondary font-medium uppercase tracking-wider">Brecha de Reclutamiento</span>
          <span className="text-3xl font-bold text-brand-danger">
            {HC_DESIGN_TOTAL - metrics.totalExpected}
          </span>
          <span className="text-[10px] text-brand-text-muted">Déficit de vacantes hoy</span>
        </div>
        <div className="bg-brand-card p-4 rounded border border-brand-border flex flex-col justify-between h-28">
          <span className="text-xs text-brand-text-secondary font-medium uppercase tracking-wider">Tasa de Ausentismo</span>
          <span className="text-3xl font-bold text-brand-text-primary">{metrics.ausentismoRate.toFixed(1)}%</span>
          <span className="text-[10px] text-brand-text-muted">De la plantilla programada</span>
        </div>
        <div className="bg-brand-card p-4 rounded border border-brand-border flex flex-col justify-between h-28">
          <span className="text-xs text-brand-text-secondary font-medium uppercase tracking-wider">Asistencia Activa</span>
          <span className="text-3xl font-bold text-brand-text-primary">{metrics.totalPresent} HC</span>
          <span className="text-[10px] text-brand-text-muted">Personal real en operación</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waterfall Chart Placeholder */}
        <div className="bg-brand-card p-6 rounded border border-brand-border h-[400px] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider">Cascada de Fuerza Laboral (Staffing Waterfall)</h3>
            <p className="text-xs text-brand-text-muted mt-1">Cómo se desgasta el headcount de diseño hasta llegar a la asistencia real.</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center border border-dashed border-brand-border/60 rounded my-4 bg-brand-bg/20">
            <div className="text-center space-y-2">
              <span className="text-xs text-brand-text-muted block">[Gráfico de Cascada de Staffing (Shell)]</span>
              <span className="text-[10px] text-brand-text-muted/60 block">Design HC &gt; Vacantes &gt; Contratado &gt; Ausentismo &gt; Asistencia Real</span>
            </div>
          </div>

          <div className="text-[10px] text-brand-text-muted">
            Métricas de Recursos Humanos
          </div>
        </div>

        {/* Absenteeism categories tree map placeholder */}
        <div className="bg-brand-card p-6 rounded border border-brand-border h-[400px] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider">Motivos y Categorías de Ausencia</h3>
            <p className="text-xs text-brand-text-muted mt-1">Desglose proporcional de los justificantes y faltas.</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center border border-dashed border-brand-border/60 rounded my-4 bg-brand-bg/20">
            <span className="text-xs text-brand-text-muted">[Treemap de Motivos de Ausencia (Shell)]</span>
          </div>

          <div className="text-[10px] text-brand-text-muted">
            Datos consolidados del turno
          </div>
        </div>
      </div>
    </div>
  );
}

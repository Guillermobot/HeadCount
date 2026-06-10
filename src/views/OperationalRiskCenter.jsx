import React from 'react';
import { useApp } from '../context/AppContext';
import { useOperationalMetrics } from '../hooks/useOperationalMetrics';

export default function OperationalRiskCenter() {
  const { displaySnapshot } = useApp();
  const metrics = useOperationalMetrics(displaySnapshot);

  return (
    <div className="space-y-6">
      {/* Risk Metrics Banner */}
      <div className="bg-brand-card p-6 rounded border border-brand-border flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-sm font-bold text-brand-text-secondary uppercase tracking-wider">Centro de Control de Riesgo Operativo</h2>
          <p className="text-xs text-brand-text-muted">
            Score consolidado de probabilidad de fallo en la meta de 49 UPD basado en la dotación de personal por turno.
          </p>
        </div>
        
        {/* Risk Level Badge */}
        <div className="flex items-center gap-4 bg-brand-bg px-6 py-4 rounded border border-brand-border min-w-[240px] justify-center">
          <div className="text-center">
            <div className="text-[10px] text-brand-text-muted uppercase font-bold tracking-wider">Índice de Riesgo</div>
            <div className={`text-4xl font-extrabold mt-1 ${
              metrics.riesgoNivel === 'Crítico' ? 'text-brand-danger' : metrics.riesgoNivel === 'Alto' ? 'text-brand-warning' : 'text-brand-success'
            }`}>
              {metrics.riesgoScore}%
            </div>
            <div className={`text-xs font-semibold mt-1 px-2.5 py-0.5 rounded-full inline-block ${
              metrics.riesgoNivel === 'Crítico' ? 'bg-brand-danger/10 text-brand-danger border border-brand-danger/30' : 
              metrics.riesgoNivel === 'Alto' ? 'bg-brand-warning/10 text-brand-warning border border-brand-warning/30' : 
              'bg-brand-success/10 text-brand-success border border-brand-success/30'
            }`}>
              Nivel {metrics.riesgoNivel}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threat Matrix Shell */}
        <div className="lg:col-span-2 bg-brand-card p-6 rounded border border-brand-border h-[400px] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider">Matriz de Amenazas y Cuellos de Botella</h3>
            <p className="text-xs text-brand-text-muted mt-1">Nivel de riesgo desglosado por áreas críticas de la planta.</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center border border-dashed border-brand-border/60 rounded my-4 bg-brand-bg/20">
            <span className="text-xs text-brand-text-muted">[Matriz de Riesgo Operacional por Área (Shell)]</span>
          </div>

          <div className="text-[10px] text-brand-text-muted">
            Monitoreo en base a criticidad e impacto directo en línea
          </div>
        </div>

        {/* Risk Mitigation Playbook Shell */}
        <div className="bg-brand-card p-6 rounded border border-brand-border h-[400px] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider">Playbook de Mitigación</h3>
            <p className="text-xs text-brand-text-muted mt-1">Recomendaciones del sistema ante desvíos de personal.</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center border border-dashed border-brand-border/60 rounded my-4 bg-brand-bg/20">
            <div className="text-center space-y-2">
              <span className="text-xs text-brand-text-muted block">[Recomendaciones de Reasignación (Shell)]</span>
              <span className="text-[10px] text-brand-text-muted/60 block">Identificar puestos críticos vacíos en Fabrication / Paint</span>
            </div>
          </div>

          <div className="text-[10px] text-brand-text-muted">
            Alineado al plan de contingencia corporativo
          </div>
        </div>
      </div>
    </div>
  );
}

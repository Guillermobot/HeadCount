import React from 'react';
import { useApp } from '../context/AppContext';
import { useOperationalMetrics } from '../hooks/useOperationalMetrics';
import { 
  LayoutDashboard, 
  Layers, 
  TrendingUp, 
  Users, 
  ShieldAlert, 
  Menu, 
  Filter, 
  RotateCcw, 
  Calendar, 
  Clock, 
  AlertTriangle,
  FileSpreadsheet,
  HelpCircle,
  Play
} from 'lucide-react';
import { UPD_TARGET, HC_DESIGN_TOTAL, HPT_OBJECTIVE } from '../data/constants';

export const MainLayout = ({ children }) => {
  const {
    activeView,
    setActiveView,
    filters,
    setFilter,
    sidebarCollapsed,
    setSidebarCollapsed,
    filterPaneOpen,
    setFilterPaneOpen,
    displaySnapshot,
    isSimulating,
    resetSimulation,
    startSimulation,
    updateSimulatedOt
  } = useApp();

  const metrics = useOperationalMetrics(displaySnapshot);

  const viewTitles = {
    'executive': 'Control Ejecutivo de Capacidad',
    'coverage': 'Monitoreo de Cobertura por Área',
    'hpt-center': 'HPT Impact Center',
    'hr': 'Gestión e Indicadores de HC (HR)',
    'risk-center': 'Operational Risk Center'
  };

  const navItems = [
    { id: 'executive', name: 'Control Ejecutivo', icon: LayoutDashboard },
    { id: 'coverage', name: 'Cobertura por Área', icon: Layers },
    { id: 'hpt-center', name: 'HPT Impact Center', icon: TrendingUp },
    { id: 'hr', name: 'Gestión de HC (HR)', icon: Users },
    { id: 'risk-center', name: 'Risk Center', icon: ShieldAlert },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-brand-bg text-brand-text-primary font-segoe select-none">
      
      {/* 1. SIDEBAR (Navegación Izquierda) */}
      <aside 
        className={`flex flex-col bg-brand-sidebar border-r border-brand-border transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-brand-border bg-black/20">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-brand-accent flex items-center justify-center text-xs font-bold text-white">
                MC
              </div>
              <span className="font-semibold text-sm tracking-wide text-brand-text-primary">
                Capacity Suite
              </span>
            </div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded hover:bg-brand-card text-brand-text-secondary hover:text-brand-text-primary ml-auto"
            title={sidebarCollapsed ? "Expandir Menú" : "Colapsar Menú"}
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Workspace selector (Power BI Style) */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-brand-border bg-black/10">
            <div className="text-[10px] uppercase font-bold text-brand-text-muted">Área de Trabajo</div>
            <div className="text-xs font-medium text-brand-text-secondary truncate mt-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-success"></span>
              Planta de Manufactura 49
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all relative ${
                  isActive 
                    ? 'bg-brand-card text-brand-accent border-l-4 border-brand-accent' 
                    : 'text-brand-text-secondary hover:bg-brand-card/50 hover:text-brand-text-primary border-l-4 border-transparent'
                }`}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon size={18} className={isActive ? 'text-brand-accent' : 'text-brand-text-secondary'} />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* 2. FOOTER CON NORTH STAR METRICS (Display Fijo en Sidebar) */}
        <div className="p-4 border-t border-brand-border bg-black/30 text-xs space-y-3">
          {sidebarCollapsed ? (
            <div className="flex flex-col items-center gap-3 text-brand-text-secondary">
              <div className="cursor-help" title={`UPD Target: ${UPD_TARGET}`}>🎯</div>
              <div className="cursor-help" title={`HC Diseño: ${HC_DESIGN_TOTAL}`}>👥</div>
              <div className="cursor-help" title={`HPT Objetivo: ${HPT_OBJECTIVE}`}>⏱️</div>
            </div>
          ) : (
            <>
              <div className="text-[10px] uppercase font-bold text-brand-text-muted tracking-wider">
                Referencias Maestras (Fijas)
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-brand-bg/40 px-2 py-1.5 rounded border border-brand-border/40">
                  <span className="text-brand-text-secondary">UPD Target:</span>
                  <span className="font-semibold text-brand-accent">{UPD_TARGET.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center bg-brand-bg/40 px-2 py-1.5 rounded border border-brand-border/40">
                  <span className="text-brand-text-secondary">HC Diseño:</span>
                  <span className="font-semibold text-brand-text-primary">{HC_DESIGN_TOTAL}</span>
                </div>
                <div className="flex justify-between items-center bg-brand-bg/40 px-2 py-1.5 rounded border border-brand-border/40">
                  <span className="text-brand-text-secondary">HPT Objetivo:</span>
                  <span className="font-semibold text-yellow-500">{HPT_OBJECTIVE.toFixed(1)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* SECCIÓN DERECHA (Header + Contenedor de Dashboards + Filtros) */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* 3. HEADER DE LA APLICACIÓN (Top Navigation Bar) */}
        <header className="h-12 bg-brand-sidebar border-b border-brand-border flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs text-brand-text-muted">Home &gt; Planta 49 &gt;</span>
            <h1 className="text-sm font-semibold tracking-wide text-brand-text-primary">
              {viewTitles[activeView]}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Simulation Warning Pill */}
            {isSimulating && (
              <div className="flex items-center gap-2 bg-brand-warning/10 border border-brand-warning/30 px-3 py-1 rounded text-xs text-brand-warning animate-pulse">
                <span className="h-2 w-2 rounded-full bg-brand-warning animate-ping"></span>
                <span>Modo Simulación Activo</span>
                <button 
                  onClick={resetSimulation}
                  className="ml-1 p-0.5 rounded hover:bg-brand-warning/20 text-brand-warning"
                  title="Restablecer Datos Reales"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            )}

            {/* Quick Metrics Summary */}
            <div className="hidden md:flex items-center gap-4 text-xs border-r border-brand-border pr-4">
              <div className="flex items-center gap-1.5">
                <span className="text-brand-text-secondary">HC Esperado Turno:</span>
                <span className="font-semibold text-brand-text-primary">{metrics.totalExpected}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-brand-text-secondary">Asistencia Real:</span>
                <span className={`font-semibold ${
                  metrics.coberturaGeneral < 90 ? 'text-brand-danger' : metrics.coberturaGeneral < 95 ? 'text-brand-warning' : 'text-brand-success'
                }`}>
                  {metrics.totalPresent} ({metrics.coberturaGeneral.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Actions & Last Refresh */}
            <span className="text-[10px] text-brand-text-muted hidden lg:inline">
              Refresco: Hoy {filters.turno === 'Turno A' ? '06:00' : filters.turno === 'Turno B' ? '14:00' : '22:00'} AM
            </span>

            <button 
              onClick={() => setFilterPaneOpen(!filterPaneOpen)}
              className={`p-1.5 rounded hover:bg-brand-card transition-colors ${
                filterPaneOpen ? 'text-brand-accent bg-brand-card' : 'text-brand-text-secondary'
              }`}
              title="Panel de Filtros (Slicers)"
            >
              <Filter size={18} />
            </button>
          </div>
        </header>

        {/* 4. CONTENEDOR PRINCIPAL + PANEL DE FILTROS */}
        <div className="flex-1 flex min-h-0 relative">
          
          {/* Main Canvas Area */}
          <main className="flex-1 overflow-y-auto p-6 min-w-0 bg-brand-bg relative">
            {children}
          </main>

          {/* 5. PANEL DE FILTROS DERECHO (Slicers Pane) */}
          <div 
            className={`bg-brand-sidebar border-l border-brand-border flex flex-col transition-all duration-300 z-10 ${
              filterPaneOpen ? 'w-64' : 'w-0 overflow-hidden border-l-0'
            }`}
          >
            {/* Filter Header */}
            <div className="h-10 flex items-center justify-between px-4 border-b border-brand-border bg-black/10">
              <span className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Filter size={12} />
                Filtros (Slicers)
              </span>
            </div>

            {/* Filter Content */}
            <div className="flex-1 p-4 space-y-6 overflow-y-auto text-xs">
              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={12} />
                  Fecha de Operación
                </label>
                <select 
                  value={filters.fecha} 
                  onChange={(e) => setFilter('fecha', e.target.value)}
                  className="w-full bg-brand-card border border-brand-border rounded px-2.5 py-1.5 text-brand-text-primary focus:outline-none focus:border-brand-accent cursor-pointer"
                >
                  <option value="2026-06-10">10 Jun 2026 (Hoy)</option>
                </select>
              </div>

             {/* Shift Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider flex items-center gap-1">
                  <Clock size={12} />
                  Turno Activo
                </label>
                <div className="space-y-1">
                  {/* AQUÍ SE AGREGÓ EL TURNO TOTAL AL ARREGLO */}
                  {['Total', 'Turno A', 'Turno B', 'Turno C'].map((turno) => (
                    <button
                      key={turno}
                      onClick={() => setFilter('turno', turno)}
                      className={`w-full text-left px-3 py-2 rounded border transition-all ${
                        filters.turno === turno
                          ? 'bg-brand-accent/10 border-brand-accent text-brand-accent font-semibold'
                          : 'bg-brand-card border-brand-border text-brand-text-secondary hover:border-brand-text-muted'
                      }`}
                    >
                      {/* Personalizamos la etiqueta para que "Total" se vea más descriptivo */}
                      {turno === 'Total' ? 'Planta Total (24 Hrs)' : turno}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area Filter Option */}
              <div className="pt-4 border-t border-brand-border space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-brand-text-secondary hover:text-brand-text-primary">
                  <input 
                    type="checkbox"
                    checked={filters.soloCriticas}
                    onChange={(e) => setFilter('soloCriticas', e.target.checked)}
                    className="rounded bg-brand-card border-brand-border text-brand-accent focus:ring-0 cursor-pointer"
                  />
                  <span>Ver solo Áreas Críticas</span>
                </label>
              </div>

              {/* Quick Actions Panel */}
              <div className="pt-6 border-t border-brand-border space-y-3">
                <div className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">
                  Acciones Rápidas
                </div>
                <button 
                  onClick={() => alert("Reporte exportado a Excel (simulado)")}
                  className="w-full flex items-center justify-center gap-2 bg-brand-card hover:bg-brand-card/80 border border-brand-border text-brand-text-secondary hover:text-brand-text-primary py-2 rounded font-medium transition-colors"
                >
                  <FileSpreadsheet size={14} className="text-brand-success" />
                  <span>Exportar Datos (XLSX)</span>
                </button>
                <button 
                  onClick={() => alert("Información de estándares de planta:\n49 UPD de diseño\n1498 empleados asignados\nTurno A: 06:00 - 14:00\nTurno B: 14:00 - 22:00\nTurno C: 22:00 - 06:00")}
                  className="w-full flex items-center justify-center gap-2 bg-brand-card hover:bg-brand-card/80 border border-brand-border text-brand-text-secondary hover:text-brand-text-primary py-2 rounded font-medium transition-colors"
                >
                  <HelpCircle size={14} />
                  <span>Estándares de Planta</span>
                </button>
              </div>


            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

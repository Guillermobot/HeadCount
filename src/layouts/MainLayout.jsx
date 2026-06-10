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

          {/* 5. PANEL DE FILTROS DERECHO — Power BI Slicers Style */}
          <div
            style={{
              background: '#141414',
              borderLeft: filterPaneOpen ? '1px solid #333333' : 'none',
              width: filterPaneOpen ? '256px' : '0px',
              overflow: filterPaneOpen ? 'visible' : 'hidden',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              transition: 'width 0.25s ease',
              zIndex: 10,
            }}
          >
            {/* Slicer Pane Header — Power BI style */}
            <div style={{ height: 40, display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid #333333', background: '#0F0F0F', flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#A6A6A6', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={11} />
                Filtros
              </span>
            </div>

            {/* Slicer Content */}
            <div style={{ flex: 1, padding: '16px 14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* ── SLICER: Fecha ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={10} /> Fecha de Operación
                </div>
                <select
                  value={filters.fecha}
                  onChange={(e) => setFilter('fecha', e.target.value)}
                  style={{ width: '100%', background: '#1E1E1E', border: '1px solid #444444', color: '#FFFFFF', fontSize: 12, padding: '6px 28px 6px 10px', cursor: 'pointer', fontFamily: '"Segoe UI", sans-serif', outline: 'none' }}
                >
                  <option value="2026-06-10">10 Jun 2026 (Hoy)</option>
                </select>
              </div>

              {/* ── SLICER: Turno ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={10} /> Turno Activo
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {['Turno A', 'Turno B', 'Turno C'].map((turno) => {
                    const isActive = filters.turno === turno;
                    return (
                      <button
                        key={turno}
                        onClick={() => setFilter('turno', turno)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '7px 10px',
                          background: isActive ? 'rgba(17,141,255,0.12)' : '#1E1E1E',
                          border: isActive ? '1px solid #118DFF' : '1px solid #444444',
                          color: isActive ? '#118DFF' : '#A6A6A6',
                          fontSize: 12,
                          fontWeight: isActive ? 700 : 400,
                          fontFamily: '"Segoe UI", sans-serif',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <span style={{ width: 8, height: 8, background: isActive ? '#118DFF' : '#444444', display: 'inline-block', flexShrink: 0 }} />
                        {turno}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── SLICER: Solo Críticas ── */}
              <div style={{ paddingTop: 12, borderTop: '1px solid #333333' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <div
                    onClick={() => setFilter('soloCriticas', !filters.soloCriticas)}
                    style={{
                      width: 14, height: 14,
                      border: `1px solid ${filters.soloCriticas ? '#118DFF' : '#444444'}`,
                      background: filters.soloCriticas ? '#118DFF' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, cursor: 'pointer',
                    }}
                  >
                    {filters.soloCriticas && <span style={{ color: '#FFFFFF', fontSize: 10, lineHeight: 1 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 12, color: '#A6A6A6', fontFamily: '"Segoe UI", sans-serif' }}>Solo Áreas Críticas</span>
                </label>
              </div>

              {/* ── Divider ── */}
              <div style={{ borderTop: '1px solid #333333' }} />

              {/* ── WHAT-IF PARAMETER: Tiempo Extra ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Parámetro What-If
                </div>
                <div style={{ background: '#252525', border: '1px solid #444444', padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: '#A6A6A6', marginBottom: 6, fontFamily: '"Segoe UI", sans-serif' }}>
                    Tiempo Extra (OT)
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: displaySnapshot?.otHabilitada ? '#E66C37' : '#666666', marginBottom: 10, fontFamily: '"Segoe UI", sans-serif' }}>
                    {displaySnapshot?.otHabilitada ? 'Habilitado' : 'Deshabilitado'}
                  </div>
                  <button
                    onClick={() => {
                      startSimulation();
                      setTimeout(() => { updateSimulatedOt(!displaySnapshot?.otHabilitada); }, 50);
                    }}
                    style={{
                      width: '100%',
                      padding: '7px 0',
                      background: displaySnapshot?.otHabilitada ? 'rgba(230,108,55,0.12)' : 'rgba(17,141,255,0.10)',
                      border: `1px solid ${displaySnapshot?.otHabilitada ? '#E66C37' : '#118DFF'}`,
                      color: displaySnapshot?.otHabilitada ? '#E66C37' : '#118DFF',
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: '"Segoe UI", sans-serif',
                      cursor: 'pointer',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {displaySnapshot?.otHabilitada ? '▣ Deshabilitar OT' : '▷ Habilitar OT'}
                  </button>
                  {isSimulating && (
                    <button
                      onClick={resetSimulation}
                      style={{ marginTop: 6, width: '100%', padding: '5px 0', background: 'transparent', border: '1px solid #444444', color: '#666666', fontSize: 10, fontFamily: '"Segoe UI", sans-serif', cursor: 'pointer' }}
                    >
                      ↺ Restablecer datos reales
                    </button>
                  )}
                  <div style={{ marginTop: 8, fontSize: 9, color: '#555555', lineHeight: 1.5, fontFamily: '"Segoe UI", sans-serif' }}>
                    Modifica este parámetro para evaluar el impacto en HPT y Riesgo Operacional en tiempo real.
                  </div>
                </div>
              </div>

              {/* ── Acciones ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4, borderTop: '1px solid #333333' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Acciones</div>
                <button
                  onClick={() => alert('Reporte exportado a Excel (simulado)')}
                  style={{ width: '100%', padding: '7px', background: '#1E1E1E', border: '1px solid #444444', color: '#A6A6A6', fontSize: 11, fontFamily: '"Segoe UI", sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <FileSpreadsheet size={12} style={{ color: '#00B01D' }} /> Exportar (XLSX)
                </button>
                <button
                  onClick={() => alert('49 UPD — 1498 HC Diseño — 244.6 HPT Objetivo\n\nTurno A: 06:00–14:00\nTurno B: 14:00–22:00\nTurno C: 22:00–06:00')}
                  style={{ width: '100%', padding: '7px', background: '#1E1E1E', border: '1px solid #444444', color: '#A6A6A6', fontSize: 11, fontFamily: '"Segoe UI", sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <HelpCircle size={12} /> Estándares de Planta
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

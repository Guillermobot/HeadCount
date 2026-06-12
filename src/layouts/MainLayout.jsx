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
  Play,
  Sun,
  Moon,
  Target
} from 'lucide-react';
import { UPD_TARGET, HC_DESIGN_TOTAL, HPT_OBJECTIVE } from '../data/constants';
import kenworthLogo from '../assets/kenworth_logo.png';

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
    updateSimulatedOt,
    isDarkMode,
    toggleTheme
  } = useApp();

  const metrics = useOperationalMetrics(displaySnapshot);

  const viewTitles = {
    'executive': 'Control Panel',
    'coverage': 'Area Coverage Monitoring',
    'hpt-center': 'HPT Impact Center',
    'hr': 'HC Management & Indicators (HR)',
    'risk-center': 'Operational Risk Center'
  };

  const navItems = [
    { id: 'executive', name: 'Control Panel', icon: LayoutDashboard },
    { id: 'coverage', name: 'Area Coverage', icon: Layers },
    { id: 'hpt-center', name: 'HPT Impact Center', icon: TrendingUp },
    { id: 'hr', name: 'HC Management (HR)', icon: Users },
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
        {/* Theme Toggle Button — above logo */}
        <button
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`flex items-center gap-2 px-4 py-2.5 border-b border-brand-border transition-all group ${
            isDarkMode
              ? 'bg-black/30 hover:bg-black/50'
              : 'bg-white/60 hover:bg-white/90'
          }`}
        >
          <div className={`relative flex items-center justify-center h-7 w-7 rounded-full flex-shrink-0 transition-all ${
            isDarkMode
              ? 'bg-brand-accent/20 text-brand-accent'
              : 'bg-yellow-400/20 text-yellow-600'
          }`}>
            {isDarkMode
              ? <Moon size={14} className="text-brand-accent" />
              : <Sun size={14} className="text-yellow-500" />
            }
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text-muted leading-none">
                Theme
              </span>
              <span className="text-xs font-semibold text-brand-text-secondary mt-0.5">
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
          )}
        </button>

        {/* Sidebar Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-brand-border bg-black/20">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <img src={kenworthLogo} alt="Kenworth Logo" className="h-7 w-auto object-contain" />
              <span className="font-semibold text-sm tracking-wide text-brand-text-primary">
                Real Time Headcount
              </span>
            </div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded hover:bg-brand-card text-brand-text-secondary hover:text-brand-text-primary ml-auto"
            title={sidebarCollapsed ? "Expand Menu" : "Collapse Menu"}
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Workspace selector (Power BI Style) */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-brand-border bg-black/10">
            <div className="text-[10px] uppercase font-bold text-brand-text-muted">Workspace</div>
            <div className="text-xs font-medium text-brand-text-secondary truncate mt-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-success"></span>
              Manufacturing Plant 49
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


      </aside>

      {/* SECCIÓN DERECHA (Header + Contenedor de Dashboards + Filtros) */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* 3. HEADER DE LA APLICACIÓN (Top Navigation Bar) */}
        <header className="h-12 bg-brand-sidebar border-b border-brand-border flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs text-brand-text-muted">Home &gt; Plant 49 &gt;</span>
            <h1 className="text-sm font-semibold tracking-wide text-brand-text-primary">
              {viewTitles[activeView]}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Simulation Warning Pill */}
            {isSimulating && (
              <div className="flex items-center gap-2 bg-brand-warning/10 border border-brand-warning/30 px-3 py-1 rounded text-xs text-brand-warning animate-pulse">
                <span className="h-2 w-2 rounded-full bg-brand-warning animate-ping"></span>
                <span>Simulation Mode Active</span>
                <button 
                  onClick={resetSimulation}
                  className="ml-1 p-0.5 rounded hover:bg-brand-warning/20 text-brand-warning"
                  title="Reset to Real Data"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            )}

            {/* ── Global Shift Truths ── */}
            <div className="hidden md:flex items-center gap-1 text-xs border-r border-brand-border pr-4">

              {/* UPD Target — fixed constant */}
              <div className="flex items-center gap-1.5 bg-brand-accent/20 border border-brand-accent/40 rounded px-2.5 py-1 mr-1">
                <Target size={11} className="text-brand-accent" />
                <span className="text-brand-text-muted">UPD Target:</span>
                <span className="font-bold text-brand-accent">{UPD_TARGET.toFixed(0)}</span>
              </div>

              {/* Design HC — fixed constant */}
              <div className="flex items-center gap-1.5 bg-brand-bg/60 border border-brand-border rounded px-2.5 py-1 mr-1">
                <Users size={11} className="text-brand-text-muted" />
                <span className="text-brand-text-muted">Design HC:</span>
                <span className="font-bold text-brand-text-primary">{HC_DESIGN_TOTAL.toLocaleString()}</span>
              </div>

              {/* Actual Attendance — live, colour-coded */}
              <div className={`flex items-center gap-1.5 rounded px-2.5 py-1 border mr-1 ${
                metrics.coberturaGeneral < 85
                  ? 'bg-brand-danger/10 border-brand-danger/40'
                  : metrics.coberturaGeneral < 91
                  ? 'bg-brand-warning/10 border-brand-warning/40'
                  : 'bg-brand-success/10 border-brand-success/40'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  metrics.coberturaGeneral < 85 ? 'bg-brand-danger' : metrics.coberturaGeneral < 91 ? 'bg-brand-warning' : 'bg-brand-success'
                }`} />
                <span className="text-brand-text-muted">Attendance:</span>
                <span className={`font-bold ${
                  metrics.coberturaGeneral < 85 ? 'text-brand-danger' : metrics.coberturaGeneral < 91 ? 'text-brand-warning' : 'text-brand-success'
                }`}>
                  {metrics.totalPresent.toLocaleString()} &nbsp;·&nbsp; {metrics.coberturaGeneral.toFixed(1)}%
                </span>
              </div>

              {/* Target HPT — fixed constant */}
              <div className="flex items-center gap-1.5 bg-brand-bg/60 border border-brand-border rounded px-2.5 py-1">
                <Clock size={11} className="text-brand-text-muted" />
                <span className="text-brand-text-muted">Target HPT:</span>
                <span className="font-bold text-yellow-500">{HPT_OBJECTIVE.toFixed(1)} hrs</span>
              </div>

            </div>

            {/* Actions & Last Refresh */}
            <span className="text-[10px] text-brand-text-muted hidden lg:inline">
              Refreshed: Today {filters.turno === 'Turno A' ? '06:00' : filters.turno === 'Turno B' ? '14:00' : '22:00'} AM
            </span>

            <button 
              onClick={() => setFilterPaneOpen(!filterPaneOpen)}
              className={`p-1.5 rounded hover:bg-brand-card transition-colors ${
                filterPaneOpen ? 'text-brand-accent bg-brand-card' : 'text-brand-text-secondary'
              }`}
              title="Filter Panel (Slicers)"
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
                Filters (Slicers)
              </span>
            </div>

            {/* Filter Content */}
            <div className="flex-1 p-4 space-y-6 overflow-y-auto text-xs">
              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={12} />
                  Operating Date
                </label>
                <select 
                  value={filters.fecha} 
                  onChange={(e) => setFilter('fecha', e.target.value)}
                  className="w-full bg-brand-card border border-brand-border rounded px-2.5 py-1.5 text-brand-text-primary focus:outline-none focus:border-brand-accent cursor-pointer"
                >
                  <option value="2026-06-10">Jun 10, 2026 (Today)</option>
                </select>
              </div>

             {/* Shift Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider flex items-center gap-1">
                  <Clock size={12} />
                  Active Shift
                </label>
                <div className="space-y-1">
                  {/* AQUÍ SE DEJA SOLO EL TURNO TOTAL (9am) COMO SE SOLICITÓ */}
                  {['Total'].map((turno) => (
                    <button
                      key={turno}
                      onClick={() => setFilter('turno', turno)}
                      className={`w-full text-left px-3 py-2 rounded border transition-all ${
                        filters.turno === turno
                          ? 'bg-brand-accent/10 border-brand-accent text-brand-accent font-semibold'
                          : 'bg-brand-card border-brand-border text-brand-text-secondary hover:border-brand-text-muted'
                      }`}
                    >
                      {turno === 'Total' ? '9AM:' : turno}
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
                  <span>Show Critical Areas Only</span>
                </label>
              </div>

              {/* Quick Actions Panel */}
              <div className="pt-6 border-t border-brand-border space-y-3">
                <div className="text-[10px] font-bold text-brand-text-muted uppercase tracking-wider">
                  Quick Actions
                </div>
                <button 
                  onClick={() => alert("Report exported to Excel (simulated)")}
                  className="w-full flex items-center justify-center gap-2 bg-brand-card hover:bg-brand-card/80 border border-brand-border text-brand-text-secondary hover:text-brand-text-primary py-2 rounded font-medium transition-colors"
                >
                  <FileSpreadsheet size={14} className="text-brand-success" />
                  <span>Export Data (XLSX)</span>
                </button>
                <button 
                  onClick={() => alert("Plant standards info:\n49 design UPD\n1,498 assigned employees\nShift A: 06:00 - 14:00\nShift B: 14:00 - 22:00\nShift C: 22:00 - 06:00")}
                  className="w-full flex items-center justify-center gap-2 bg-brand-card hover:bg-brand-card/80 border border-brand-border text-brand-text-secondary hover:text-brand-text-primary py-2 rounded font-medium transition-colors"
                >
                  <HelpCircle size={14} />
                  <span>Plant Standards</span>
                </button>
              </div>


            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

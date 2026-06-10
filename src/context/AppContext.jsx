import React, { createContext, useState, useContext, useEffect } from 'react';
import { mockSnapshots } from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeView, setActiveView] = useState('executive'); // Views: 'executive', 'coverage', 'hpt-center', 'hr', 'risk-center'
  
  // Global Filters
  const [filters, setFilters] = useState({
    fecha: "2026-06-10",
    turno: "Total",
    soloCriticas: false
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filterPaneOpen, setFilterPaneOpen] = useState(true);

  // Active snapshot from mock data based on filters
  const [activeSnapshot, setActiveSnapshot] = useState(null);
  
  // Simulation State (Sandbox)
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedSnapshot, setSimulatedSnapshot] = useState(null);

  // Load snapshot when filters change
  useEffect(() => {
    const found = mockSnapshots.find(
      s => s.fecha === filters.fecha && s.turno === filters.turno
    );
    if (found) {
      // Create a deep copy of the snapshot for active display
      setActiveSnapshot(JSON.parse(JSON.stringify(found)));
      // Reset simulation when changing shift/date
      setIsSimulating(false);
      setSimulatedSnapshot(null);
    }
  }, [filters.fecha, filters.turno]);

  // Update a filter key
  const setFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Simulation controls
  const startSimulation = () => {
    if (!isSimulating && activeSnapshot) {
      setSimulatedSnapshot(JSON.parse(JSON.stringify(activeSnapshot)));
      setIsSimulating(true);
    }
  };

  const updateSimulatedOt = (enabled) => {
    if (isSimulating && simulatedSnapshot) {
      setSimulatedSnapshot(prev => ({
        ...prev,
        otHabilitada: enabled
      }));
    }
  };

  // Modify actual present headcount for a specific area (and optionally a child station) in simulation
  const updateSimulatedAttendance = (areaName, childName, newPresent) => {
    if (!isSimulating) startSimulation();
    
    setSimulatedSnapshot(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      
      updated.areas = updated.areas.map(area => {
        if (area.nombre === areaName) {
          if (childName && area.children) {
            // Update child station
            const updatedChildren = area.children.map(child => {
              if (child.nombre === childName) {
                return { ...child, actualPresent: Number(newPresent) };
              }
              return child;
            });
            // Parent present headcount is the sum of children
            const sumPresent = updatedChildren.reduce((sum, c) => sum + c.actualPresent, 0);
            return {
              ...area,
              children: updatedChildren,
              actualPresent: sumPresent
            };
          } else {
            // Update parent directly (for flat areas)
            return {
              ...area,
              actualPresent: Number(newPresent)
            };
          }
        }
        return area;
      });

      return updated;
    });
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSimulatedSnapshot(null);
  };

  // Determine which snapshot is the source of truth for calculations
  const displaySnapshot = isSimulating ? simulatedSnapshot : activeSnapshot;

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        filters,
        setFilter,
        sidebarCollapsed,
        setSidebarCollapsed,
        filterPaneOpen,
        setFilterPaneOpen,
        activeSnapshot,
        displaySnapshot,
        isSimulating,
        startSimulation,
        updateSimulatedOt,
        updateSimulatedAttendance,
        resetSimulation
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

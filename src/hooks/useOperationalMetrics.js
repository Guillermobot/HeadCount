import { HC_DESIGN_TOTAL, HPT_OBJECTIVE, HOURS_PER_SHIFT, OT_INEFFICIENCY_FACTOR } from '../data/constants';

function calcStatus(coverage, isCritical) {
  if (isCritical) {
    if (coverage < 90) return 'danger';
    if (coverage < 95) return 'warning';
    return 'success';
  }
  if (coverage < 85) return 'danger';
  if (coverage < 90) return 'warning';
  return 'success';
}

function enrichDeepNode(node) {
  const coverage = node.hcExpected > 0 ? (node.actualPresent / node.hcExpected) * 100 : 100;
  const status = calcStatus(coverage, node.isCritical ?? false);
  const deficit = Math.max(0, (node.hcExpected || 0) - (node.actualPresent || 0));

  const out = { ...node, coverage, status, deficit };

  if (node.subAreas) out.subAreas = node.subAreas.map(enrichDeepNode);
  if (node.grupos) out.grupos = node.grupos.map(enrichDeepNode);
  if (node.estaciones) out.estaciones = node.estaciones.map(enrichDeepNode);
  if (node.children) out.children = node.children.map(enrichDeepNode);

  return out;
}

export function flattenToGroups(ramas) {
  const list = [];
  (ramas || []).forEach(rama => {
    (rama.subAreas || []).forEach(sub => {
      (sub.grupos || []).forEach(grupo => {
        list.push({ ...grupo, path: `${rama.nombre} › ${sub.nombre}` });
      });
    });
  });
  return list;
}

export const useOperationalMetrics = (snapshot) => {
  // FIX 1: Retornar estructura segura para que MainLayout no rompa el .toFixed() si el snapshot aún no carga
  if (!snapshot) {
    return {
      coberturaGeneral: 0,
      hptActual: HPT_OBJECTIVE,
      hptDiferencia: 0,
      riesgoScore: 0,
      riesgoNivel: "Bajo",
      totalDesign: HC_DESIGN_TOTAL,
      totalExpected: 0,
      totalPresent: 0,
      ausentismoRate: 0, 
      details: [],
      ramasEnriched: []
    };
  }

  const areasList = snapshot.areas || [];
  let totalDesign = 0, totalExpected = 0, totalPresent = 0;

  const areaCalculations = areasList.map(area => {
    totalDesign += area.hcDesign || 0;
    totalExpected += area.hcExpected || 0;
    totalPresent += area.actualPresent || 0;
    const coverage = area.hcExpected > 0 ? (area.actualPresent / area.hcExpected) * 100 : 0;
    return { ...area, coverage, status: calcStatus(coverage, area.isCritical) };
  });

  const coberturaGeneral = totalExpected > 0 ? (totalPresent / totalExpected) * 100 : 0;
  
  // FIX 2: Restaurar el cálculo del ausentismo para el MainLayout
  const ausentismoRate = totalExpected > 0 ? ((totalExpected - totalPresent) / totalExpected) * 100 : 0;
  
  let hptActual = HPT_OBJECTIVE;
  if (snapshot.otHabilitada) {
    const missingHours = Math.max(0, HC_DESIGN_TOTAL - totalPresent) * HOURS_PER_SHIFT;
    hptActual = ((totalPresent * HOURS_PER_SHIFT) + (missingHours * OT_INEFFICIENCY_FACTOR)) / 49.0;
  } else {
    hptActual = (totalPresent * HOURS_PER_SHIFT) / 49.0;
  }

  let riesgoScore = Math.max(0, 100 - coberturaGeneral);
  if (!snapshot.otHabilitada && coberturaGeneral < 95) riesgoScore += 25;

  const ramasEnriched = (snapshot.ramas || []).map(enrichDeepNode);

  return {
    coberturaGeneral,
    ausentismoRate, // <- Se exporta correctamente
    hptActual,
    hptDiferencia: ((hptActual - HPT_OBJECTIVE) / HPT_OBJECTIVE) * 100,
    riesgoScore: Math.min(100, Math.round(riesgoScore)),
    riesgoNivel: riesgoScore >= 70 ? "Crítico" : riesgoScore >= 45 ? "Alto" : "Bajo",
    totalDesign, 
    totalExpected, 
    totalPresent,
    otHabilitada: snapshot.otHabilitada,
    details: areaCalculations,  
    ramasEnriched               
  };
};
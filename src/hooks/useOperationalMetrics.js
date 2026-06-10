import { HC_DESIGN_TOTAL, HPT_OBJECTIVE, HOURS_PER_SHIFT, OT_INEFFICIENCY_FACTOR } from '../data/constants';

export const useOperationalMetrics = (snapshot) => {
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
      details: []
    };
  }

  const areasList = snapshot.areas || [];
  
  // Calculate totals
  let totalDesign = 0;
  let totalExpected = 0;
  let totalPresent = 0;
  
  const areaCalculations = areasList.map(area => {
    const design = area.hcDesign || 0;
    const expected = area.hcExpected || 0;
    const present = area.actualPresent || 0;
    
    totalDesign += design;
    totalExpected += expected;
    totalPresent += present;
    
    const coverage = expected > 0 ? (present / expected) * 100 : 0;
    const absentRate = expected > 0 ? ((expected - present) / expected) * 100 : 0;
    
    // Determine local area status
    let status = "success"; // Green
    if (area.isCritical) {
      if (coverage < 90) status = "danger"; // Red
      else if (coverage < 95) status = "warning"; // Yellow
    } else {
      if (coverage < 85) status = "danger";
      else if (coverage < 90) status = "warning";
    }

    // Process children if exist (drill-down support)
    const childrenCalculations = (area.children || []).map(child => {
      const childDesign = child.hcDesign || 0;
      const childExpected = child.hcExpected || 0;
      const childPresent = child.actualPresent || 0;
      const childCoverage = childExpected > 0 ? (childPresent / childExpected) * 100 : 0;
      
      let childStatus = "success";
      if (childCoverage < 85) childStatus = "danger";
      else if (childCoverage < 90) childStatus = "warning";

      return {
        ...child,
        coverage: childCoverage,
        status: childStatus
      };
    });
    
    return {
      ...area,
      coverage,
      absentRate,
      status,
      children: childrenCalculations
    };
  });

  // Coverage compared to expected headcount for this snapshot
  const coberturaGeneral = totalExpected > 0 ? (totalPresent / totalExpected) * 100 : 0;
  
  // Overall absenteeism compared to expected
  const ausentismoRate = totalExpected > 0 ? ((totalExpected - totalPresent) / totalExpected) * 100 : 0;

  // HPT calculation
  let hptActual = HPT_OBJECTIVE;
  if (snapshot.otHabilitada) {
    // With Overtime: we run OT to secure 49 UPD.
    // Missing hours = (HC Design - actual present) * 8 hours
    const missingHours = Math.max(0, HC_DESIGN_TOTAL - totalPresent) * HOURS_PER_SHIFT;
    const regularHours = totalPresent * HOURS_PER_SHIFT;
    // Overtime hours carry an inefficiency multiplier (fatigue)
    const otHoursCalculated = missingHours * OT_INEFFICIENCY_FACTOR;
    const totalHoursWorked = regularHours + otHoursCalculated;
    hptActual = totalHoursWorked / 49.0;
  } else {
    // Without Overtime: short-staffed, no extra hours, so total hours worked is just present * 8.
    // This makes HPT look lower (more efficient on paper) but increases risk to critical levels.
    const totalHoursWorked = totalPresent * HOURS_PER_SHIFT;
    hptActual = totalHoursWorked / 49.0;
  }

  const hptDiferencia = ((hptActual - HPT_OBJECTIVE) / HPT_OBJECTIVE) * 100;

  // Risk Score Algorithm (0 to 100)
  // Base risk is derived from the coverage deficit
  let riesgoScore = Math.max(0, 100 - coberturaGeneral);

  // Critical Area Penalty
  // Fabrication and Paint are critical. If they fall below their thresholds, we penalize the score.
  areaCalculations.forEach(area => {
    if (area.isCritical) {
      if (area.coverage < 90) {
        riesgoScore += 30; // Severe bottleneck penalty
      } else if (area.coverage < 95) {
        riesgoScore += 12; // Moderate bottleneck penalty
      }
    }
  });

  // If OT is disabled and general coverage is low (<95%), the risk of missing 49 UPD increases significantly
  if (!snapshot.otHabilitada && coberturaGeneral < 95) {
    riesgoScore += 25;
  }

  riesgoScore = Math.min(100, Math.round(riesgoScore));

  // Determine qualitative risk level
  let riesgoNivel = "Bajo";
  if (riesgoScore >= 70) riesgoNivel = "Crítico";
  else if (riesgoScore >= 45) riesgoNivel = "Alto";
  else if (riesgoScore >= 20) riesgoNivel = "Medio";

  return {
    coberturaGeneral,
    ausentismoRate,
    hptActual,
    hptDiferencia,
    riesgoScore,
    riesgoNivel,
    totalDesign,
    totalExpected,
    totalPresent,
    otHabilitada: snapshot.otHabilitada,
    details: areaCalculations
  };
};

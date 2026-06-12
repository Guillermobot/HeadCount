import { HC_DESIGN_TOTAL } from './constants';

export const HC_CONTRATADO = 1504; 

export const laborBuckets = [
  { id: 'fixed', label: 'Fixed Crews', descripcion: 'Fixed Crews' },
  { id: 'temporary', label: 'Temporary Crews', descripcion: 'Flexibility' },
  { id: 'outbound', label: 'Outbound', descripcion: 'Product Output' },
  { id: 'gatekeepers', label: 'Gate Keepers', descripcion: 'Quality Gates' },
  { id: 'cng', label: 'CNG', descripcion: 'Natural Gas' },
  { id: 'export', label: 'Export', descripcion: 'Export' },
  { id: 'online_short', label: 'Online Shortages', descripcion: 'Online Shortages' },
  { id: 'offline_short', label: 'Offline Shortages', descripcion: 'Offline Shortages' },
  { id: 'pushouts', label: 'Push Outs', descripcion: 'Major Rework' },
  { id: 'recovery', label: 'Recovery', descripcion: 'Recovery' },
  { id: 'func_tests', label: 'Functional Tests', descripcion: 'Functional Tests' },
  { id: 'delivery', label: 'Delivery / Touch Up', descripcion: 'Touch Up' },
  { id: 'truck_log', label: 'Truck Logistics', descripcion: 'Yard Movements' },
];

const LEGACY_AREAS = [
  { nombre: "Assembly Line", hcDesign: 380, hcExpected: 380, actualPresent: 0, isCritical: true, children: [] },
  { nombre: "Major Assemblies", hcDesign: 250, hcExpected: 250, actualPresent: 0, isCritical: true, children: [] },
  { nombre: "Kenfab", hcDesign: 280, hcExpected: 280, actualPresent: 0, isCritical: true, children: [] },
  { nombre: "Plastics", hcDesign: 90, hcExpected: 90, actualPresent: 0, isCritical: false, children: [] },
  { nombre: "Materials / Logistics", hcDesign: 168, hcExpected: 168, actualPresent: 0, isCritical: true, children: [] },
  { nombre: "Quality", hcDesign: 100, hcExpected: 100, actualPresent: 0, isCritical: false, children: [] },
  { nombre: "Maintenance", hcDesign: 90, hcExpected: 90, actualPresent: 0, isCritical: false, children: [] },
  { nombre: "Industrial Engineering & MFC", hcDesign: 70, hcExpected: 70, actualPresent: 0, isCritical: false, children: [] },
  { nombre: "Support / Facilities / Dir.", hcDesign: 70, hcExpected: 70, actualPresent: 0, isCritical: false, children: [] },
];

const RAMAS_TEMPLATE = [
  {
    id: 'assembly', nombre: 'ASSEMBLY', hcDesign: 1164, hcExpected: 1164, actualPresent: 0, isCritical: true,
    subAreas: [
      {
        id: 'assembly_kflogs', nombre: 'ASSEMBLY w/ KF LOGS', hcDesign: 853, hcExpected: 853, actualPresent: 0, isCritical: true,
        grupos: [
          {
            id: 'lec', nombre: '+ LEC', hcDesign: 358, hcExpected: 358, actualPresent: 0, isCritical: true,
            estaciones: [
              {
                id: 'lec_i', nombre: '- LEC I', hcDesign: 214, hcExpected: 214, actualPresent: 0,
                children: [
                  { nombre: '110 Frame I', hcDesign: 39, hcExpected: 39, actualPresent: 0 },
                  { nombre: '122 Frame II', hcDesign: 29, hcExpected: 29, actualPresent: 0 },
                  { nombre: '111 Valves', hcDesign: 38, hcExpected: 38, actualPresent: 0 },
                  { nombre: '112 Axles Set', hcDesign: 36, hcExpected: 36, actualPresent: 0 },
                  { nombre: '119 Axles Trim', hcDesign: 46, hcExpected: 46, actualPresent: 0 },
                  { nombre: '48 Chassis Paint', hcDesign: 26, hcExpected: 26, actualPresent: 0 },
                ]
              },
              {
                id: 'lec_ii', nombre: '- LEC II', hcDesign: 144, hcExpected: 144, actualPresent: 0,
                children: [
                  { nombre: '113 Engines Set', hcDesign: 34, hcExpected: 34, actualPresent: 0 },
                  { nombre: '120 Engines Trim', hcDesign: 27, hcExpected: 27, actualPresent: 0 },
                  { nombre: '121 Tanks Installation', hcDesign: 20, hcExpected: 20, actualPresent: 0 },
                  { nombre: '114 Cab Set', hcDesign: 26, hcExpected: 26, actualPresent: 0 },
                  { nombre: '115 Hood Set', hcDesign: 18, hcExpected: 18, actualPresent: 0 },
                  { nombre: '116 EOL', hcDesign: 19, hcExpected: 19, actualPresent: 0 },
                ]
              }
            ]
          },
          {
            id: 'lem', nombre: '+ LEM', hcDesign: 306, hcExpected: 306, actualPresent: 0, isCritical: true,
            estaciones: [
              {
                id: 'lem_i', nombre: '- LEM I', hcDesign: 162, hcExpected: 162, actualPresent: 0,
                children: [
                  { nombre: '36 Cab Build', hcDesign: 0, hcExpected: 0, actualPresent: 0 },
                  { nombre: '40 NGP Build', hcDesign: 34, hcExpected: 34, actualPresent: 0 },
                  { nombre: '37 Sleeper Build', hcDesign: 0, hcExpected: 0, actualPresent: 0 },
                  { nombre: '32 Cab Build 320', hcDesign: 20, hcExpected: 20, actualPresent: 0 },
                  { nombre: '38 Paint Prep', hcDesign: 26, hcExpected: 26, actualPresent: 0 },
                  { nombre: '33 Main Paint', hcDesign: 36, hcExpected: 36, actualPresent: 0 },
                  { nombre: '34 Miscellaneous', hcDesign: 46, hcExpected: 46, actualPresent: 0 },
                ]
              },
              {
                id: 'lem_ii', nombre: '- LEM II', hcDesign: 144, hcExpected: 144, actualPresent: 0,
                children: [
                  { nombre: '35 Cab Trim I', hcDesign: 32, hcExpected: 32, actualPresent: 0 },
                  { nombre: '41 Cab Trim II', hcDesign: 45, hcExpected: 45, actualPresent: 0 },
                  { nombre: '47 Sleeper Trim', hcDesign: 9, hcExpected: 9, actualPresent: 0 },
                  { nombre: '39 Cab Trim 320', hcDesign: 31, hcExpected: 31, actualPresent: 0 },
                  { nombre: 'Outbound', hcDesign: 8, hcExpected: 8, actualPresent: 0 },
                  { nombre: '147 LF Conversion', hcDesign: 0, hcExpected: 0, actualPresent: 0 },
                  { nombre: '31 Hood Trim', hcDesign: 9, hcExpected: 9, actualPresent: 0 },
                  { nombre: '45 Fuel Tanks', hcDesign: 10, hcExpected: 10, actualPresent: 0 },
                ]
              }
            ]
          },
          {
            id: 'test_tu', nombre: '+ TEST / TOUCH UP', hcDesign: 153, hcExpected: 153, actualPresent: 0, isCritical: false,
            estaciones: [
              { nombre: '- Functional Tests', hcDesign: 30, hcExpected: 30, actualPresent: 0, children: [] },
              { nombre: '- Recovery', hcDesign: 13, hcExpected: 13, actualPresent: 0, children: [] },
              { nombre: '- Complex Defects (Depes)', hcDesign: 7, hcExpected: 7, actualPresent: 0, children: [] },
              { nombre: '- Delivery (Small Tent)', hcDesign: 4, hcExpected: 4, actualPresent: 0, children: [] },
              { nombre: '- Delivery (Large Tent)', hcDesign: 65, hcExpected: 65, actualPresent: 0, children: [] },
              { nombre: '- Logistics & Buffers', hcDesign: 12, hcExpected: 12, actualPresent: 0, children: [] },
              { nombre: '- Touch Up', hcDesign: 22, hcExpected: 22, actualPresent: 0, children: [] },
            ]
          },
          { id: 'pps', nombre: '+ PPS / Driver', hcDesign: 6, hcExpected: 6, actualPresent: 0, isCritical: false, estaciones: [] },
          { id: 'del_ready', nombre: '+ Delivery Ready (118)', hcDesign: 7, hcExpected: 7, actualPresent: 0, isCritical: false, estaciones: [] },
          { id: 'offline_ptc', nombre: '+ Offline Shortages & Defects', hcDesign: 16, hcExpected: 16, actualPresent: 0, isCritical: true, estaciones: [] },
          { id: 'temp_comp', nombre: '+ Temporary Components', hcDesign: 0, hcExpected: 0, actualPresent: 0, isCritical: false, estaciones: [] },
          { id: 'trainers', nombre: '+ Trainers', hcDesign: 7, hcExpected: 7, actualPresent: 0, isCritical: false, estaciones: [] },
        ]
      },
      {
        id: 'kf_logistics', nombre: 'KF LOGISTICS', hcDesign: 49, hcExpected: 49, actualPresent: 0, isCritical: true,
        grupos: [
          {
            id: 'kfl_lec_i', nombre: '- LEC I', hcDesign: 18, hcExpected: 18, actualPresent: 0, isCritical: false,
            estaciones: [
              { nombre: 'Frame', hcDesign: 15, hcExpected: 15, actualPresent: 0, children: [] },
              { nombre: 'Valves', hcDesign: 0, hcExpected: 0, actualPresent: 0, children: [] },
              { nombre: 'Axle Set', hcDesign: 0, hcExpected: 0, actualPresent: 0, children: [] },
              { nombre: 'Axle Trim', hcDesign: 3, hcExpected: 3, actualPresent: 0, children: [] },
            ]
          },
          {
            id: 'kfl_lec_ii', nombre: '- LEC II', hcDesign: 5, hcExpected: 5, actualPresent: 0, isCritical: false,
            estaciones: [
              { nombre: 'Engines Set', hcDesign: 0, hcExpected: 0, actualPresent: 0, children: [] },
              { nombre: 'Engines Trim', hcDesign: 0, hcExpected: 0, actualPresent: 0, children: [] },
              { nombre: 'Tanks Installation', hcDesign: 3, hcExpected: 3, actualPresent: 0, children: [] },
              { nombre: 'Cab Set', hcDesign: 1, hcExpected: 1, actualPresent: 0, children: [] },
              { nombre: 'Hood Set', hcDesign: 1, hcExpected: 1, actualPresent: 0, children: [] },
              { nombre: 'StartUp', hcDesign: 0, hcExpected: 0, actualPresent: 0, children: [] },
            ]
          },
          {
            id: 'kfl_lem_ii', nombre: '- LEM II', hcDesign: 28, hcExpected: 28, actualPresent: 0, isCritical: false,
            estaciones: [
              { nombre: 'Cab Trim I', hcDesign: 0, hcExpected: 0, actualPresent: 0, children: [] },
              { nombre: 'Cab Trim II', hcDesign: 19, hcExpected: 19, actualPresent: 0, children: [] },
              { nombre: 'Sleeper Trim', hcDesign: 3, hcExpected: 3, actualPresent: 0, children: [] },
              { nombre: 'Cab Trim 320 / LF', hcDesign: 4, hcExpected: 4, actualPresent: 0, children: [] },
            ]
          }
        ]
      },
      {
        id: 'assembly_indirect', nombre: 'ASSEMBLY INDIRECT', hcDesign: 311, hcExpected: 311, actualPresent: 0, isCritical: false,
        grupos: [
          { id: 'ai_mat', nombre: '+ MATERIALS', hcDesign: 140, hcExpected: 140, actualPresent: 0, isCritical: true, estaciones: [] },
          { id: 'ai_qual', nombre: '+ QUALITY', hcDesign: 104, hcExpected: 104, actualPresent: 0, isCritical: false, estaciones: [] },
          { id: 'ai_maint', nombre: '+ MAINTENANCE / ME', hcDesign: 67, hcExpected: 67, actualPresent: 0, isCritical: false, estaciones: [] },
        ]
      }
    ]
  },
  {
    id: 'fabrication', nombre: 'FABRICATION', hcDesign: 334, hcExpected: 334, actualPresent: 0, isCritical: true,
    subAreas: [
      {
        id: 'fab_direct', nombre: 'FABRICATION DIRECT', hcDesign: 186, hcExpected: 186, actualPresent: 0, isCritical: true,
        grupos: [
          { id: 'kenfab', nombre: '+ KENFAB', hcDesign: 98, hcExpected: 98, actualPresent: 0, isCritical: true, estaciones: [] },
          { id: 'plastics', nombre: '+ PLASTICS', hcDesign: 88, hcExpected: 88, actualPresent: 0, isCritical: false, estaciones: [] }
        ]
      },
      {
        id: 'fab_indirect', nombre: 'FABRICATION INDIRECT', hcDesign: 148, hcExpected: 148, actualPresent: 0, isCritical: false,
        grupos: [
          { id: 'fi_prod_k', nombre: '+ PRODUCTION KENFAB', hcDesign: 24, hcExpected: 24, actualPresent: 0, isCritical: false, estaciones: [] },
          { id: 'fi_prod_p', nombre: '+ PRODUCTION PLASTICS', hcDesign: 20, hcExpected: 20, actualPresent: 0, isCritical: false, estaciones: [] },
          { id: 'fi_mat', nombre: '+ MATERIALS', hcDesign: 40, hcExpected: 40, actualPresent: 0, isCritical: false, estaciones: [] },
          { id: 'fi_qual', nombre: '+ QUALITY', hcDesign: 24, hcExpected: 24, actualPresent: 0, isCritical: false, estaciones: [] },
          { id: 'fi_maint', nombre: '+ MAINTENANCE / ME', hcDesign: 40, hcExpected: 40, actualPresent: 0, isCritical: false, estaciones: [] }
        ]
      }
    ]
  }
];

// Motor Dinámico
function applyFactor(nodos, shiftShare, baseAttendance) {
  function processNode(node) {
    const out = { ...node };
    let childExpected = 0;
    let childPresent = 0;
    let isLeaf = true;

    if (node.children && node.children.length > 0) {
      out.children = node.children.map(processNode);
      out.children.forEach(c => { childExpected += c.hcExpected; childPresent += c.actualPresent; });
      isLeaf = false;
    } else if (node.estaciones && node.estaciones.length > 0) {
      out.estaciones = node.estaciones.map(processNode);
      out.estaciones.forEach(c => { childExpected += c.hcExpected; childPresent += c.actualPresent; });
      isLeaf = false;
    } else if (node.grupos && node.grupos.length > 0) {
      out.grupos = node.grupos.map(processNode);
      out.grupos.forEach(c => { childExpected += c.hcExpected; childPresent += c.actualPresent; });
      isLeaf = false;
    } else if (node.subAreas && node.subAreas.length > 0) {
      out.subAreas = node.subAreas.map(processNode);
      out.subAreas.forEach(c => { childExpected += c.hcExpected; childPresent += c.actualPresent; });
      isLeaf = false;
    }

    if (isLeaf) {
      out.hcExpected = Math.round((node.hcDesign || 0) * shiftShare);
      const noise = (Math.random() * 0.12) - 0.06; 
      let rate = baseAttendance + noise;
      if (rate > 1) rate = 1; 
      out.actualPresent = out.hcExpected > 0 ? Math.round(out.hcExpected * rate) : 0;
    } else {
      out.hcExpected = childExpected;
      out.actualPresent = childPresent;
    }
    return out;
  }
  return nodos.map(processNode);
}

// NUEVO: Cálculos para el "Total" (100% de la capacidad de diseño, ~90.1% de asistencia para generar déficit de ~148)
const areasTotal = applyFactor(LEGACY_AREAS, 1.0, 0.901);
const ramasTotal = applyFactor(RAMAS_TEMPLATE, 1.0, 0.901);
const expectedTotal = areasTotal.reduce((sum, a) => sum + a.hcExpected, 0);

// Cálculos de Turnos
const areasA = applyFactor(LEGACY_AREAS, 0.454, 0.94);
const ramasA = applyFactor(RAMAS_TEMPLATE, 0.454, 0.94);
const expectedA = areasA.reduce((sum, a) => sum + a.hcExpected, 0);

const areasB = applyFactor(LEGACY_AREAS, 0.421, 0.91);
const ramasB = applyFactor(RAMAS_TEMPLATE, 0.421, 0.91);
const expectedB = areasB.reduce((sum, a) => sum + a.hcExpected, 0);

const areasC = applyFactor(LEGACY_AREAS, 0.125, 0.85);
const ramasC = applyFactor(RAMAS_TEMPLATE, 0.125, 0.85);
const expectedC = areasC.reduce((sum, a) => sum + a.hcExpected, 0);

export const mockSnapshots = [
  {
    id: '2026-06-10-Total', fecha: '2026-06-10', turno: 'Total', horario: 'Consolidated 24 Hrs',
    hcContratado: HC_CONTRATADO, 
    hcExpectedTotal: expectedTotal, // Apuntará a 1498
    otHabilitada: true,
    ramas: ramasTotal,
    areas: areasTotal,
  },
  {
    id: '2026-06-10-A', fecha: '2026-06-10', turno: 'Turno A', horario: '06:00 – 14:00',
    hcContratado: HC_CONTRATADO, 
    hcExpectedTotal: expectedA,
    otHabilitada: true,
    ramas: ramasA,
    areas: areasA,
  },
  {
    id: '2026-06-10-B', fecha: '2026-06-10', turno: 'Turno B', horario: '14:00 – 22:00',
    hcContratado: HC_CONTRATADO, 
    hcExpectedTotal: expectedB,
    otHabilitada: false,
    ramas: ramasB,
    areas: areasB,
  },
  {
    id: '2026-06-10-C', fecha: '2026-06-10', turno: 'Turno C', horario: '22:00 – 06:00',
    hcContratado: HC_CONTRATADO, 
    hcExpectedTotal: expectedC,
    otHabilitada: true,
    ramas: ramasC,
    areas: areasC,
  },
];

export const historicalDays = [
  { fecha: '2026-05-12', label: '12/May', coberturaReal: 92.5, actualHpt: 242.1, riskScore: 10 },
  { fecha: '2026-05-13', label: '13/May', coberturaReal: 94.0, actualHpt: 240.5, riskScore: 5 },
  { fecha: '2026-05-14', label: '14/May', coberturaReal: 93.2, actualHpt: 241.8, riskScore: 8 },
  { fecha: '2026-05-15', label: '15/May', coberturaReal: 89.5, actualHpt: 250.4, riskScore: 28 },
  { fecha: '2026-05-16', label: '16/May', coberturaReal: 81.0, actualHpt: 275.2, riskScore: 65 },
  { fecha: '2026-05-17', label: '17/May', coberturaReal: 80.5, actualHpt: 278.0, riskScore: 68 },
  { fecha: '2026-05-18', label: '18/May', coberturaReal: 91.8, actualHpt: 246.3, riskScore: 18 },
  { fecha: '2026-05-19', label: '19/May', coberturaReal: 93.5, actualHpt: 241.2, riskScore: 12 },
  { fecha: '2026-05-20', label: '20/May', coberturaReal: 94.2, actualHpt: 240.1, riskScore: 8 },
  { fecha: '2026-05-21', label: '21/May', coberturaReal: 95.0, actualHpt: 238.5, riskScore: 0 },
  { fecha: '2026-05-22', label: '22/May', coberturaReal: 88.5, actualHpt: 252.6, riskScore: 32 },
  { fecha: '2026-05-23', label: '23/May', coberturaReal: 82.4, actualHpt: 270.1, riskScore: 60 },
  { fecha: '2026-05-24', label: '24/May', coberturaReal: 83.1, actualHpt: 268.4, riskScore: 55 },
  { fecha: '2026-05-25', label: '25/May', coberturaReal: 92.1, actualHpt: 245.0, riskScore: 15 },
  { fecha: '2026-05-26', label: '26/May', coberturaReal: 93.0, actualHpt: 242.8, riskScore: 10 },
  { fecha: '2026-05-27', label: '27/May', coberturaReal: 91.5, actualHpt: 247.1, riskScore: 19 },
  { fecha: '2026-05-28', label: '28/May', coberturaReal: 90.8, actualHpt: 249.0, riskScore: 23 },
  { fecha: '2026-05-29', label: '29/May', coberturaReal: 87.2, actualHpt: 258.3, riskScore: 40 },
  { fecha: '2026-05-30', label: '30/May', coberturaReal: 80.8, actualHpt: 276.5, riskScore: 65 },
  { fecha: '2026-05-31', label: '31/May', coberturaReal: 81.2, actualHpt: 274.9, riskScore: 62 },
  { fecha: '2026-06-01', label: '01/Jun', coberturaReal: 90.5, actualHpt: 250.2, riskScore: 25 },
  { fecha: '2026-06-02', label: '02/Jun', coberturaReal: 92.8, actualHpt: 243.5, riskScore: 12 },
  { fecha: '2026-06-03', label: '03/Jun', coberturaReal: 93.1, actualHpt: 242.0, riskScore: 10 },
  { fecha: '2026-06-04', label: '04/Jun', coberturaReal: 91.9, actualHpt: 246.0, riskScore: 18 },
  { fecha: '2026-06-05', label: '05/Jun', coberturaReal: 89.2, actualHpt: 251.5, riskScore: 30 },
  { fecha: '2026-06-06', label: '06/Jun', coberturaReal: 83.5, actualHpt: 266.2, riskScore: 50 },
  { fecha: '2026-06-07', label: '07/Jun', coberturaReal: 84.1, actualHpt: 264.8, riskScore: 48 },
  { fecha: '2026-06-08', label: '08/Jun', coberturaReal: 91.0, actualHpt: 261.2, riskScore: 35 },
  { fecha: '2026-06-09', label: '09/Jun', coberturaReal: 87.0, actualHpt: 282.6, riskScore: 78 },
  { fecha: '2026-06-10', label: '10/Jun', coberturaReal: 93.0, actualHpt: 275.4, riskScore: 68 },
];
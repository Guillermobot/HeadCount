import { HC_DESIGN_TOTAL } from './constants';

// ─────────────────────────────────────────────────────────────────
// HC DISEÑO DISTRIBUTION (Total = 1,498 — Diseño Ingeniería Industrial)
// Distribución proporcional estimada hasta recibir detalle completo del HCO
// ─────────────────────────────────────────────────────────────────

// HC Contratado real confirmado (vs 1,498 diseño → brecha: -66 vacantes / -4.4%)
export const HC_CONTRATADO = 1432;

// ─────────────────────────────────────────────────────────────────
// LABOR BUCKETS — Dimensiones transversales de categorización (HCO)
// Aplican a todas las áreas como capa de clasificación del operador
// ─────────────────────────────────────────────────────────────────
export const laborBuckets = [
  { id: 'fixed',        label: 'Fixed Crews',            descripcion: 'Plantillas fijas — indispensables para mantener el ritmo base de línea' },
  { id: 'temporary',    label: 'Temporary Crews (LBT)',   descripcion: 'Plantillas temporales — flexibilidad operativa y balanceo de línea' },
  { id: 'outbound',     label: 'Outbound',               descripcion: 'Personal enfocado en la salida y liberación del producto terminado' },
  { id: 'gatekeepers',  label: 'Gate Keepers',           descripcion: 'Filtros de calidad y contención en transiciones críticas de la línea' },
  { id: 'cng',          label: 'CNG',                    descripcion: 'Personal/estaciones especializadas en rutinas para unidades Gas Natural' },
  { id: 'export',       label: 'Export',                 descripcion: 'Requerimientos específicos de ensamblaje o preparación para exportación' },
  { id: 'online_short', label: 'Online Shortages',       descripcion: 'Cuadrillas de mitigación de faltantes de material dentro de la línea' },
  { id: 'offline_short',label: 'Offline Shortages',      descripcion: 'Cuadrillas de mitigación de faltantes de material fuera de la línea' },
  { id: 'pushouts',     label: 'Push Outs',              descripcion: 'Personal para manejo de unidades extraídas de línea por retrabajo mayor' },
  { id: 'recovery',     label: 'Recovery (0% TR)',       descripcion: 'Equipos de recuperación operando fuera del Takt Rate principal' },
  { id: 'func_tests',   label: 'Functional Tests',       descripcion: 'Pruebas dinámicas y funcionales del camión terminado' },
  { id: 'delivery',     label: 'Delivery / Touch Up',    descripcion: 'Proceso final de entrega, estética y retoques del producto' },
  { id: 'truck_log',    label: 'Truck Logistics',        descripcion: 'Movimientos físicos de unidades terminadas en patio' },
];

// ─────────────────────────────────────────────────────────────────
// ÁREA TEMPLATE — 9 áreas reales del HCO (Distribución HC estimada)
// Sub-áreas jerárquicas confirmadas por análisis del HCO Diseño
// Los headcounts exactos por sub-área quedan pendientes del archivo HCO detallado
// ─────────────────────────────────────────────────────────────────

const AREA_DESIGN = {
  lineaEnsamble:    380,   // Línea de Ensamble (principal - ritmo directo de producción)
  ensamblesMayores: 250,   // Ensambles Mayores (motor, cabina, sleeper)
  kenfab:           280,   // Kenfab / Fabricación interna (frame, metales)
  plasticos:         90,   // Plásticos (cabinas, bumpers, interiores)
  materiales:       168,   // Materiales, Logística y Abastecimiento
  calidad:          100,   // Calidad (Gate Keepers, Funcionales, Delivery)
  mantenimiento:     90,   // Mantenimiento (equipo y facilities)
  ingenieria:        70,   // Ingeniería Industrial y MFC
  soporte:           70,   // Soporte Técnico / Facilities / Dirección
  // TOTAL = 1,498 ✅
};

// ─────────────────────────────────────────────────────────────────
// SNAPSHOTS (3 turnos — 10 Jun 2026)
// ─────────────────────────────────────────────────────────────────

export const mockSnapshots = [

  // ──────────────────────────────────────────
  // TURNO A — Escenario de presión moderada-alta
  // ──────────────────────────────────────────
  {
    id: "2026-06-10-A",
    fecha: "2026-06-10",
    turno: "Turno A",
    horario: "06:00 – 14:00",
    hcContratado: HC_CONTRATADO,       // 1,432 (real)
    hcExpectedTotal: 1430,             // Plan del turno
    otHabilitada: true,
    areas: [
      {
        nombre: "Línea de Ensamble",
        hcDesign: AREA_DESIGN.lineaEnsamble,
        hcExpected: 365,
        actualPresent: 310,
        isCritical: true,
        laborBuckets: ['fixed', 'temporary', 'cng', 'export'],
        children: [
          { nombre: "Trim Line",            hcDesign: 120, hcExpected: 115, actualPresent: 95 },
          { nombre: "Chassis Line",         hcDesign: 100, hcExpected:  96, actualPresent: 82 },
          { nombre: "Final Line",           hcDesign:  90, hcExpected:  87, actualPresent: 76 },
          { nombre: "CNG Specialization",   hcDesign:  40, hcExpected:  38, actualPresent: 32 },
          { nombre: "Export Specialization",hcDesign:  30, hcExpected:  29, actualPresent: 25 },
        ]
      },
      {
        nombre: "Ensambles Mayores",
        hcDesign: AREA_DESIGN.ensamblesMayores,
        hcExpected: 240,
        actualPresent: 228,
        isCritical: true,
        laborBuckets: ['fixed', 'temporary'],
        children: [
          { nombre: "Engine Assembly",      hcDesign:  90, hcExpected:  86, actualPresent: 82 },
          { nombre: "Cab Assembly",         hcDesign: 100, hcExpected:  96, actualPresent: 92 },
          { nombre: "Sleeper Assembly",     hcDesign:  60, hcExpected:  58, actualPresent: 54 },
        ]
      },
      {
        nombre: "Kenfab",
        hcDesign: AREA_DESIGN.kenfab,
        hcExpected: 270,
        actualPresent: 220,
        isCritical: true,
        laborBuckets: ['fixed', 'temporary', 'recovery'],
        children: [
          { nombre: "Frame & Rails",        hcDesign: 100, hcExpected:  96, actualPresent: 78 },
          { nombre: "Cab Fabrication",      hcDesign: 100, hcExpected:  96, actualPresent: 76 },
          { nombre: "Sheet Metal & X-Members", hcDesign: 80, hcExpected: 78, actualPresent: 66 },
        ]
      },
      {
        nombre: "Plásticos",
        hcDesign: AREA_DESIGN.plasticos,
        hcExpected: 85,
        actualPresent: 80,
        isCritical: false,
        laborBuckets: ['fixed'],
      },
      {
        nombre: "Materiales / Logística",
        hcDesign: AREA_DESIGN.materiales,
        hcExpected: 160,
        actualPresent: 148,
        isCritical: true,
        laborBuckets: ['online_short', 'offline_short', 'truck_log', 'outbound'],
        children: [
          { nombre: "Line Feeding (Online)", hcDesign: 70, hcExpected: 66, actualPresent: 61 },
          { nombre: "Offline Shortages",    hcDesign:  40, hcExpected:  38, actualPresent: 35 },
          { nombre: "Truck Logistics",      hcDesign:  35, hcExpected:  34, actualPresent: 32 },
          { nombre: "Outbound / Delivery",  hcDesign:  23, hcExpected:  22, actualPresent: 20 },
        ]
      },
      {
        nombre: "Calidad",
        hcDesign: AREA_DESIGN.calidad,
        hcExpected: 95,
        actualPresent: 88,
        isCritical: false,
        laborBuckets: ['gatekeepers', 'func_tests', 'pushouts', 'recovery', 'delivery'],
        children: [
          { nombre: "Gate Keepers",         hcDesign:  35, hcExpected:  33, actualPresent: 30 },
          { nombre: "Functional Tests",     hcDesign:  30, hcExpected:  29, actualPresent: 27 },
          { nombre: "Push Outs / Recovery", hcDesign:  20, hcExpected:  19, actualPresent: 17 },
          { nombre: "Delivery & Touch Up",  hcDesign:  15, hcExpected:  14, actualPresent: 14 },
        ]
      },
      {
        nombre: "Mantenimiento",
        hcDesign: AREA_DESIGN.mantenimiento,
        hcExpected: 85,
        actualPresent: 82,
        isCritical: false,
        laborBuckets: ['fixed'],
      },
      {
        nombre: "Ingeniería Industrial y MFC",
        hcDesign: AREA_DESIGN.ingenieria,
        hcExpected: 67,
        actualPresent: 64,
        isCritical: false,
        laborBuckets: ['fixed'],
      },
      {
        nombre: "Soporte / Facilities / Dir.",
        hcDesign: AREA_DESIGN.soporte,
        hcExpected: 63,
        actualPresent: 60,
        isCritical: false,
        laborBuckets: ['fixed'],
      },
    ]
  },

  // ──────────────────────────────────────────
  // TURNO B — Escenario saludable (mejor cobertura)
  // ──────────────────────────────────────────
  {
    id: "2026-06-10-B",
    fecha: "2026-06-10",
    turno: "Turno B",
    horario: "14:00 – 22:00",
    hcContratado: HC_CONTRATADO,
    hcExpectedTotal: 1471,
    otHabilitada: false,
    areas: [
      {
        nombre: "Línea de Ensamble",
        hcDesign: AREA_DESIGN.lineaEnsamble,
        hcExpected: 375,
        actualPresent: 362,
        isCritical: true,
        laborBuckets: ['fixed', 'temporary', 'cng', 'export'],
        children: [
          { nombre: "Trim Line",             hcDesign: 120, hcExpected: 118, actualPresent: 115 },
          { nombre: "Chassis Line",          hcDesign: 100, hcExpected:  98, actualPresent:  95 },
          { nombre: "Final Line",            hcDesign:  90, hcExpected:  89, actualPresent:  87 },
          { nombre: "CNG Specialization",    hcDesign:  40, hcExpected:  40, actualPresent:  38 },
          { nombre: "Export Specialization", hcDesign:  30, hcExpected:  30, actualPresent:  27 },
        ]
      },
      {
        nombre: "Ensambles Mayores",
        hcDesign: AREA_DESIGN.ensamblesMayores,
        hcExpected: 245,
        actualPresent: 238,
        isCritical: true,
        laborBuckets: ['fixed', 'temporary'],
        children: [
          { nombre: "Engine Assembly",       hcDesign:  90, hcExpected:  88, actualPresent:  86 },
          { nombre: "Cab Assembly",          hcDesign: 100, hcExpected:  98, actualPresent:  96 },
          { nombre: "Sleeper Assembly",      hcDesign:  60, hcExpected:  59, actualPresent:  56 },
        ]
      },
      {
        nombre: "Kenfab",
        hcDesign: AREA_DESIGN.kenfab,
        hcExpected: 275,
        actualPresent: 262,
        isCritical: true,
        laborBuckets: ['fixed', 'temporary', 'recovery'],
        children: [
          { nombre: "Frame & Rails",         hcDesign: 100, hcExpected:  99, actualPresent:  95 },
          { nombre: "Cab Fabrication",       hcDesign: 100, hcExpected:  98, actualPresent:  93 },
          { nombre: "Sheet Metal & X-Members", hcDesign: 80, hcExpected: 78, actualPresent:  74 },
        ]
      },
      {
        nombre: "Plásticos",
        hcDesign: AREA_DESIGN.plasticos,
        hcExpected: 88,
        actualPresent: 85,
        isCritical: false,
        laborBuckets: ['fixed'],
      },
      {
        nombre: "Materiales / Logística",
        hcDesign: AREA_DESIGN.materiales,
        hcExpected: 165,
        actualPresent: 158,
        isCritical: true,
        laborBuckets: ['online_short', 'offline_short', 'truck_log', 'outbound'],
        children: [
          { nombre: "Line Feeding (Online)", hcDesign: 70, hcExpected: 68, actualPresent:  65 },
          { nombre: "Offline Shortages",    hcDesign:  40, hcExpected:  40, actualPresent:  38 },
          { nombre: "Truck Logistics",      hcDesign:  35, hcExpected:  35, actualPresent:  34 },
          { nombre: "Outbound / Delivery",  hcDesign:  23, hcExpected:  22, actualPresent:  21 },
        ]
      },
      {
        nombre: "Calidad",
        hcDesign: AREA_DESIGN.calidad,
        hcExpected: 98,
        actualPresent: 95,
        isCritical: false,
        laborBuckets: ['gatekeepers', 'func_tests', 'pushouts', 'recovery', 'delivery'],
        children: [
          { nombre: "Gate Keepers",         hcDesign:  35, hcExpected:  34, actualPresent:  33 },
          { nombre: "Functional Tests",     hcDesign:  30, hcExpected:  30, actualPresent:  29 },
          { nombre: "Push Outs / Recovery", hcDesign:  20, hcExpected:  20, actualPresent:  19 },
          { nombre: "Delivery & Touch Up",  hcDesign:  15, hcExpected:  14, actualPresent:  14 },
        ]
      },
      {
        nombre: "Mantenimiento",
        hcDesign: AREA_DESIGN.mantenimiento,
        hcExpected: 88,
        actualPresent: 86,
        isCritical: false,
        laborBuckets: ['fixed'],
      },
      {
        nombre: "Ingeniería Industrial y MFC",
        hcDesign: AREA_DESIGN.ingenieria,
        hcExpected: 69,
        actualPresent: 67,
        isCritical: false,
        laborBuckets: ['fixed'],
      },
      {
        nombre: "Soporte / Facilities / Dir.",
        hcDesign: AREA_DESIGN.soporte,
        hcExpected: 68,
        actualPresent: 65,
        isCritical: false,
        laborBuckets: ['fixed'],
      },
    ]
  },

  // ──────────────────────────────────────────
  // TURNO C — Escenario crítico (turno nocturno — mayor ausentismo)
  // ──────────────────────────────────────────
  {
    id: "2026-06-10-C",
    fecha: "2026-06-10",
    turno: "Turno C",
    horario: "22:00 – 06:00",
    hcContratado: HC_CONTRATADO,
    hcExpectedTotal: 1350,
    otHabilitada: true,
    areas: [
      {
        nombre: "Línea de Ensamble",
        hcDesign: AREA_DESIGN.lineaEnsamble,
        hcExpected: 350,
        actualPresent: 278,
        isCritical: true,
        laborBuckets: ['fixed', 'temporary', 'cng', 'export'],
        children: [
          { nombre: "Trim Line",             hcDesign: 120, hcExpected: 112, actualPresent:  88 },
          { nombre: "Chassis Line",          hcDesign: 100, hcExpected:  94, actualPresent:  74 },
          { nombre: "Final Line",            hcDesign:  90, hcExpected:  85, actualPresent:  68 },
          { nombre: "CNG Specialization",    hcDesign:  40, hcExpected:  36, actualPresent:  28 },
          { nombre: "Export Specialization", hcDesign:  30, hcExpected:  23, actualPresent:  20 },
        ]
      },
      {
        nombre: "Ensambles Mayores",
        hcDesign: AREA_DESIGN.ensamblesMayores,
        hcExpected: 230,
        actualPresent: 190,
        isCritical: true,
        laborBuckets: ['fixed', 'temporary'],
        children: [
          { nombre: "Engine Assembly",       hcDesign:  90, hcExpected:  82, actualPresent:  68 },
          { nombre: "Cab Assembly",          hcDesign: 100, hcExpected:  92, actualPresent:  76 },
          { nombre: "Sleeper Assembly",      hcDesign:  60, hcExpected:  56, actualPresent:  46 },
        ]
      },
      {
        nombre: "Kenfab",
        hcDesign: AREA_DESIGN.kenfab,
        hcExpected: 255,
        actualPresent: 195,
        isCritical: true,
        laborBuckets: ['fixed', 'temporary', 'recovery'],
        children: [
          { nombre: "Frame & Rails",         hcDesign: 100, hcExpected:  95, actualPresent:  72 },
          { nombre: "Cab Fabrication",       hcDesign: 100, hcExpected:  95, actualPresent:  74 },
          { nombre: "Sheet Metal & X-Members", hcDesign: 80, hcExpected: 65, actualPresent:  49 },
        ]
      },
      {
        nombre: "Plásticos",
        hcDesign: AREA_DESIGN.plasticos,
        hcExpected: 80,
        actualPresent: 70,
        isCritical: false,
        laborBuckets: ['fixed'],
      },
      {
        nombre: "Materiales / Logística",
        hcDesign: AREA_DESIGN.materiales,
        hcExpected: 150,
        actualPresent: 128,
        isCritical: true,
        laborBuckets: ['online_short', 'offline_short', 'truck_log', 'outbound'],
        children: [
          { nombre: "Line Feeding (Online)", hcDesign: 70, hcExpected: 62, actualPresent:  52 },
          { nombre: "Offline Shortages",    hcDesign:  40, hcExpected:  36, actualPresent:  32 },
          { nombre: "Truck Logistics",      hcDesign:  35, hcExpected:  30, actualPresent:  26 },
          { nombre: "Outbound / Delivery",  hcDesign:  23, hcExpected:  22, actualPresent:  18 },
        ]
      },
      {
        nombre: "Calidad",
        hcDesign: AREA_DESIGN.calidad,
        hcExpected: 90,
        actualPresent: 80,
        isCritical: false,
        laborBuckets: ['gatekeepers', 'func_tests', 'pushouts', 'recovery', 'delivery'],
        children: [
          { nombre: "Gate Keepers",         hcDesign:  35, hcExpected:  32, actualPresent:  28 },
          { nombre: "Functional Tests",     hcDesign:  30, hcExpected:  27, actualPresent:  24 },
          { nombre: "Push Outs / Recovery", hcDesign:  20, hcExpected:  18, actualPresent:  16 },
          { nombre: "Delivery & Touch Up",  hcDesign:  15, hcExpected:  13, actualPresent:  12 },
        ]
      },
      {
        nombre: "Mantenimiento",
        hcDesign: AREA_DESIGN.mantenimiento,
        hcExpected: 80,
        actualPresent: 72,
        isCritical: false,
        laborBuckets: ['fixed'],
      },
      {
        nombre: "Ingeniería Industrial y MFC",
        hcDesign: AREA_DESIGN.ingenieria,
        hcExpected: 60,
        actualPresent: 55,
        isCritical: false,
        laborBuckets: ['fixed'],
      },
      {
        nombre: "Soporte / Facilities / Dir.",
        hcDesign: AREA_DESIGN.soporte,
        hcExpected: 55,
        actualPresent: 50,
        isCritical: false,
        laborBuckets: ['fixed'],
      },
    ]
  }
];

// ─────────────────────────────────────────────────────────────────
// HISTORICAL DATA — Últimos 30 días (cobertura y HPT diarios)
// ─────────────────────────────────────────────────────────────────
export const historicalDays = [
  { fecha: "2026-05-12", label: "12/May", coberturaReal: 95.1, actualHpt: 244.1, riskScore:  5 },
  { fecha: "2026-05-13", label: "13/May", coberturaReal: 93.8, actualHpt: 248.9, riskScore: 14 },
  { fecha: "2026-05-14", label: "14/May", coberturaReal: 96.2, actualHpt: 241.5, riskScore:  4 },
  { fecha: "2026-05-15", label: "15/May", coberturaReal: 91.4, actualHpt: 257.3, riskScore: 32 },
  { fecha: "2026-05-16", label: "16/May", coberturaReal: 94.7, actualHpt: 246.2, riskScore: 10 },
  { fecha: "2026-05-19", label: "19/May", coberturaReal: 92.0, actualHpt: 254.8, riskScore: 25 },
  { fecha: "2026-05-20", label: "20/May", coberturaReal: 89.5, actualHpt: 268.4, riskScore: 48 },
  { fecha: "2026-05-21", label: "21/May", coberturaReal: 93.1, actualHpt: 251.6, riskScore: 18 },
  { fecha: "2026-05-22", label: "22/May", coberturaReal: 95.4, actualHpt: 243.7, riskScore:  7 },
  { fecha: "2026-05-23", label: "23/May", coberturaReal: 90.8, actualHpt: 260.1, riskScore: 38 },
  { fecha: "2026-05-26", label: "26/May", coberturaReal: 94.2, actualHpt: 247.8, riskScore: 12 },
  { fecha: "2026-05-27", label: "27/May", coberturaReal: 97.1, actualHpt: 239.8, riskScore:  3 },
  { fecha: "2026-05-28", label: "28/May", coberturaReal: 92.6, actualHpt: 253.4, riskScore: 22 },
  { fecha: "2026-05-29", label: "29/May", coberturaReal: 88.9, actualHpt: 270.9, riskScore: 56 },
  { fecha: "2026-05-30", label: "30/May", coberturaReal: 91.7, actualHpt: 258.7, riskScore: 30 },
  { fecha: "2026-06-02", label: "02/Jun", coberturaReal: 93.4, actualHpt: 250.3, riskScore: 16 },
  { fecha: "2026-06-03", label: "03/Jun", coberturaReal: 95.8, actualHpt: 242.1, riskScore:  6 },
  { fecha: "2026-06-04", label: "04/Jun", coberturaReal: 94.0, actualHpt: 249.2, riskScore: 12 },
  { fecha: "2026-06-05", label: "05/Jun", coberturaReal: 92.0, actualHpt: 256.4, riskScore: 28 },
  { fecha: "2026-06-06", label: "06/Jun", coberturaReal: 89.0, actualHpt: 272.1, riskScore: 55 },
  { fecha: "2026-06-07", label: "07/Jun", coberturaReal: 95.0, actualHpt: 245.8, riskScore:  8 },
  { fecha: "2026-06-08", label: "08/Jun", coberturaReal: 91.0, actualHpt: 261.2, riskScore: 35 },
  { fecha: "2026-06-09", label: "09/Jun", coberturaReal: 87.0, actualHpt: 282.6, riskScore: 78 },
  { fecha: "2026-06-10", label: "10/Jun", coberturaReal: 88.0, actualHpt: 275.4, riskScore: 68 },
];

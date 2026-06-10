import { HC_DESIGN_TOTAL } from './constants';

export const HC_CONTRATADO = 1432;

export const laborBuckets = [
  { id: 'fixed',        label: 'Fixed Crews',            descripcion: 'Essential fixed staff for base line rate' },
  { id: 'temporary',    label: 'Temporary Crews (LBT)',   descripcion: 'Temporary and line balancing staff' },
  { id: 'outbound',     label: 'Outbound',               descripcion: 'Outbound and finished product release' },
  { id: 'gatekeepers',  label: 'Gate Keepers',           descripcion: 'Quality filters and containment' },
  { id: 'cng',          label: 'CNG',                    descripcion: 'Natural Gas units specialized staff' },
  { id: 'export',       label: 'Export',                 descripcion: 'Export preparation requirements' },
  { id: 'online_short', label: 'Online Shortages',       descripcion: 'Online material shortage mitigation' },
  { id: 'offline_short',label: 'Offline Shortages',      descripcion: 'Offline material shortage mitigation' },
  { id: 'pushouts',     label: 'Push Outs',              descripcion: 'Major rework extracted units handling' },
  { id: 'recovery',     label: 'Recovery (0% TR)',       descripcion: 'Recovery teams outside main Takt Rate' },
  { id: 'func_tests',   label: 'Functional Tests',       descripcion: 'Finished truck dynamic testing' },
  { id: 'delivery',     label: 'Delivery / Touch Up',    descripcion: 'Final touch up and delivery process' },
  { id: 'truck_log',    label: 'Truck Logistics',        descripcion: 'Finished trucks yard logistics' },
];

const computePresent = (node, multiplier) => {
  if (node.children && node.children.length > 0) {
    node.children = node.children.map(c => computePresent(c, multiplier));
    node.actualPresent = node.children.reduce((s, c) => s + c.actualPresent, 0);
  } else {
    node.actualPresent = Math.round(node.hcExpected * multiplier);
  }
  return node;
};

const buildBaseHierarchy = () => [
  {
    nombre: "Assembly", hcDesign: 853, hcExpected: 853, isCritical: true, laborBuckets: ['fixed', 'temporary', 'cng', 'export'],
    children: [
      { nombre: "LEC I", hcDesign: 214, hcExpected: 214, children: [
        { nombre: "110 Frame I", hcDesign: 39, hcExpected: 39 },
        { nombre: "122 Frame II", hcDesign: 29, hcExpected: 29 },
        { nombre: "111 Valves", hcDesign: 38, hcExpected: 38 },
        { nombre: "112 Axles Set", hcDesign: 36, hcExpected: 36 },
        { nombre: "119 Axles Trim", hcDesign: 46, hcExpected: 46 },
        { nombre: "48 Chassis Paint", hcDesign: 26, hcExpected: 26 }
      ]},
      { nombre: "LEC II", hcDesign: 144, hcExpected: 144, children: [
        { nombre: "113 Engines Set", hcDesign: 34, hcExpected: 34 },
        { nombre: "120 Engines Trim", hcDesign: 27, hcExpected: 27 },
        { nombre: "121 Tanks Installation", hcDesign: 20, hcExpected: 20 },
        { nombre: "114 Cab Set", hcDesign: 26, hcExpected: 26 },
        { nombre: "115 Hood Set", hcDesign: 18, hcExpected: 18 },
        { nombre: "116 EOL", hcDesign: 19, hcExpected: 19 }
      ]},
      { nombre: "LEM I", hcDesign: 162, hcExpected: 162, children: [
        { nombre: "36 Cab Build", hcDesign: 0, hcExpected: 0 },
        { nombre: "40 NGP Build", hcDesign: 34, hcExpected: 34 },
        { nombre: "37 Sleeper Build", hcDesign: 0, hcExpected: 0 },
        { nombre: "32 Cab Build 320", hcDesign: 20, hcExpected: 20 },
        { nombre: "38 Paint Prep", hcDesign: 26, hcExpected: 26 },
        { nombre: "33 Main Paint", hcDesign: 36, hcExpected: 36 },
        { nombre: "34 Miscellaneous", hcDesign: 46, hcExpected: 46 }
      ]},
      { nombre: "LEM II", hcDesign: 144, hcExpected: 144, children: [
        { nombre: "35 Cab Trim I", hcDesign: 32, hcExpected: 32 },
        { nombre: "41 Cab Trim II", hcDesign: 45, hcExpected: 45 },
        { nombre: "47 Sleeper Trim", hcDesign: 9, hcExpected: 9 },
        { nombre: "39 Cab Trim 320", hcDesign: 31, hcExpected: 31 },
        { nombre: "Outbound", hcDesign: 8, hcExpected: 8 },
        { nombre: "147 LF Conversion", hcDesign: 0, hcExpected: 0 },
        { nombre: "31 Hood Trim", hcDesign: 9, hcExpected: 9 },
        { nombre: "45 Fuel Tanks", hcDesign: 10, hcExpected: 10 }
      ]},
      { nombre: "Test & Touch Up", hcDesign: 153, hcExpected: 153, children: [
        { nombre: "Functional Tests", hcDesign: 30, hcExpected: 30 },
        { nombre: "Recovery", hcDesign: 13, hcExpected: 13 },
        { nombre: "Complex Defects", hcDesign: 7, hcExpected: 7 },
        { nombre: "Delivery (Small Tent)", hcDesign: 4, hcExpected: 4 },
        { nombre: "Delivery (Big Tent)", hcDesign: 65, hcExpected: 65 },
        { nombre: "Logistics & Buffers", hcDesign: 12, hcExpected: 12 },
        { nombre: "Touch Up", hcDesign: 22, hcExpected: 22 }
      ]},
      { nombre: "Assembly Support", hcDesign: 36, hcExpected: 36, children: [
        { nombre: "PPS / Tool Shop", hcDesign: 6, hcExpected: 6 },
        { nombre: "Delivery Ready", hcDesign: 7, hcExpected: 7 },
        { nombre: "Offline Shortages & PTC", hcDesign: 16, hcExpected: 16 },
        { nombre: "Trainers", hcDesign: 7, hcExpected: 7 }
      ]}
    ]
  },
  {
    nombre: "Fabrication", hcDesign: 230, hcExpected: 230, isCritical: true, laborBuckets: ['fixed', 'temporary'],
    children: [
      { nombre: "Kenfab", hcDesign: 122, hcExpected: 122, children: [
        { nombre: "Kenfab Direct", hcDesign: 98, hcExpected: 98 },
        { nombre: "Production Kenfab", hcDesign: 24, hcExpected: 24 }
      ]},
      { nombre: "Plastics", hcDesign: 108, hcExpected: 108, children: [
        { nombre: "Plastics Direct", hcDesign: 88, hcExpected: 88 },
        { nombre: "Production Plastics", hcDesign: 20, hcExpected: 20 }
      ]}
    ]
  },
  {
    nombre: "Materials", hcDesign: 180, hcExpected: 180, isCritical: true, laborBuckets: ['online_short', 'offline_short', 'truck_log'],
    children: [
      { nombre: "KF Logistics", hcDesign: 49, hcExpected: 49, children: [
        { nombre: "LEC I Logistics", hcDesign: 18, hcExpected: 18, children: [
          { nombre: "Frame", hcDesign: 15, hcExpected: 15 },
          { nombre: "Valves", hcDesign: 0, hcExpected: 0 },
          { nombre: "Axle Set", hcDesign: 0, hcExpected: 0 },
          { nombre: "Axle Trim", hcDesign: 3, hcExpected: 3 }
        ]},
        { nombre: "LEC II Logistics", hcDesign: 5, hcExpected: 5, children: [
          { nombre: "Engines Set", hcDesign: 0, hcExpected: 0 },
          { nombre: "Engines Trim", hcDesign: 0, hcExpected: 0 },
          { nombre: "Tanks Installation", hcDesign: 3, hcExpected: 3 },
          { nombre: "Cab Set", hcDesign: 1, hcExpected: 1 },
          { nombre: "Hood Set", hcDesign: 1, hcExpected: 1 },
          { nombre: "StartUp", hcDesign: 0, hcExpected: 0 }
        ]},
        { nombre: "LEM II Logistics", hcDesign: 26, hcExpected: 26, children: [
          { nombre: "Cab Trim I", hcDesign: 0, hcExpected: 0 },
          { nombre: "Cab Trim II", hcDesign: 19, hcExpected: 19 },
          { nombre: "Sleeper Trim", hcDesign: 3, hcExpected: 3 },
          { nombre: "Cab Trim 320 / LF", hcDesign: 4, hcExpected: 4 }
        ]}
      ]},
      { nombre: "Assembly Materials", hcDesign: 91, hcExpected: 91 },
      { nombre: "Fabrication Materials", hcDesign: 40, hcExpected: 40 }
    ]
  },
  {
    nombre: "Quality", hcDesign: 128, hcExpected: 128, isCritical: false, laborBuckets: ['gatekeepers', 'func_tests', 'recovery'],
    children: [
      { nombre: "Assembly Quality", hcDesign: 104, hcExpected: 104 },
      { nombre: "Fabrication Quality", hcDesign: 24, hcExpected: 24 }
    ]
  },
  {
    nombre: "Maintenance & ME", hcDesign: 107, hcExpected: 107, isCritical: false, laborBuckets: ['fixed'],
    children: [
      { nombre: "Assembly Maint / ME", hcDesign: 67, hcExpected: 67 },
      { nombre: "Fabrication Maint / ME", hcDesign: 40, hcExpected: 40 }
    ]
  }
];

const generateHierarchy = (multiplier) => {
  const base = JSON.parse(JSON.stringify(buildBaseHierarchy()));
  return base.map(area => computePresent(area, multiplier));
};

export const mockSnapshots = [
  {
    id: "2026-06-10-A",
    fecha: "2026-06-10",
    turno: "Shift A",
    horario: "06:00 – 14:00",
    hcContratado: HC_CONTRATADO,
    hcExpectedTotal: HC_DESIGN_TOTAL,
    otHabilitada: true,
    areas: generateHierarchy(0.91)
  },
  {
    id: "2026-06-10-B",
    fecha: "2026-06-10",
    turno: "Shift B",
    horario: "14:00 – 22:00",
    hcContratado: HC_CONTRATADO,
    hcExpectedTotal: HC_DESIGN_TOTAL,
    otHabilitada: false,
    areas: generateHierarchy(0.96)
  },
  {
    id: "2026-06-10-C",
    fecha: "2026-06-10",
    turno: "Shift C",
    horario: "22:00 – 06:00",
    hcContratado: HC_CONTRATADO,
    hcExpectedTotal: HC_DESIGN_TOTAL,
    otHabilitada: true,
    areas: generateHierarchy(0.85)
  }
];

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

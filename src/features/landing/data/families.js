/**
 * Categorías principales de Epoxipetro.
 *
 * Cada categoría agrupa las subcategorías reales de la base de datos y tiene su
 * propia imagen representativa, paleta de acento e ícono técnico para los
 * productos que aún no tienen fotografía cargada por gerencia.
 */

export const FAMILIES = [
  {
    id: 'resinas',
    name: 'Resinas Epóxicas y Pigmentos',
    shortName: 'Resinas y Pigmentos',
    blurb: 'Resina epóxica 1:1, 2:1, 3:1, UV, pigmentos mica, tintes y fotoluminiscentes',
    image: '/landing/resinas.png',
    accent: '#0ea5e9',
    badgeBg: 'rgba(14, 165, 233, 0.14)',
    badgeText: '#38bdf8',
  },
  {
    id: 'cerraduras',
    name: 'Cerraduras y Herrajes',
    shortName: 'Cerraduras',
    blurb: 'Cerraduras de sobreponer, embutir, inteligentes, picaportes, cilindros y bisagras',
    image: '/landing/chapas.png',
    accent: '#6366f1',
    badgeBg: 'rgba(99, 102, 241, 0.16)',
    badgeText: '#a5b4fc',
  },
  {
    id: 'candados',
    name: 'Candados y Seguridad',
    shortName: 'Candados',
    blurb: 'Candados de latón y acero, cajas fuertes, cerrojos, aldabas y cables acerados',
    image: '/landing/candados.png',
    accent: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.14)',
    badgeText: '#fbbf24',
  },
  {
    id: 'electricos',
    name: 'Material Eléctrico',
    shortName: 'Eléctricos',
    blurb: 'Placas, interruptores, térmicos, regletas, alargadores y cajas de distribución',
    image: '/landing/electricos.png',
    accent: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.14)',
    badgeText: '#7dd3fc',
  },
  {
    id: 'herramientas',
    name: 'Brocas y Herramientas',
    shortName: 'Herramientas',
    blurb: 'Brocas de cobalto milimétricas, gas butano e insumos técnicos de taller',
    image: '/landing/insumos.png',
    accent: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.14)',
    badgeText: '#6ee7b7',
  },
];

const ACCENTS = /[\u0300-\u036f]/g;

export const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(ACCENTS, '')
    .trim();

const RESIN_PREFIXES = ['resina', 'tinte', 'pigmento', 'mica', 'fotolum', 'alcohol'];
const ELECTRIC_PREFIXES = [
  'termico',
  'caja termico',
  'socket',
  'regleta',
  'cajas de distribucion',
  'clavija',
  'adaptador',
  'placa',
  'cinta',
  'alargador',
  'estabilizador',
  'cableducto',
];
const PADLOCK_PREFIXES = [
  'candado',
  'caja fuerte',
  'cajas fuerte',
  'cerrojo',
  'aldaba',
  'pestillo',
  'cable acerado',
];
const LOCK_PREFIXES = [
  'cerradura',
  'picaporte',
  'cilindro',
  'bisagra',
  'brazo',
  'jalador',
  'muebleria',
  'tope',
];

const startsWithAny = (text, prefixes) => prefixes.some((p) => text.startsWith(p));

export function getFamilyId(categoria) {
  const c = normalizeText(categoria);
  if (startsWithAny(c, RESIN_PREFIXES)) return 'resinas';
  if (startsWithAny(c, ELECTRIC_PREFIXES)) return 'electricos';
  if (startsWithAny(c, PADLOCK_PREFIXES)) return 'candados';
  if (startsWithAny(c, LOCK_PREFIXES)) return 'cerraduras';
  return 'herramientas';
}

export function getFamilyById(id) {
  return FAMILIES.find((f) => f.id === id) || FAMILIES[0];
}

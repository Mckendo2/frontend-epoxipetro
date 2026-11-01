/**
 * Familias comerciales de la tienda.
 *
 * Agrupan las categorías reales de la base de datos para que el cliente
 * navegue por lo que busca (cerradura, resina, placa) y no por 40 categorías.
 */

export const FAMILIES = [
  {
    id: 'cerrajeria',
    name: 'Cerrajería',
    blurb: 'Candados, cerraduras, bisagras, cajas fuertes',
  },
  {
    id: 'resinas',
    name: 'Resinas y pigmentos',
    blurb: 'Resina epóxica y UV, micas, tintes',
  },
  {
    id: 'electricos',
    name: 'Eléctricos',
    blurb: 'Placas, térmicos, regletas, alargadores',
  },
  {
    id: 'herramientas',
    name: 'Herramientas',
    blurb: 'Brocas de cobalto, gas y otros insumos',
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
const LOCK_PREFIXES = [
  'candado',
  'cerradura',
  'cerrojo',
  'picaporte',
  'cilindro',
  'caja',
  'aldaba',
  'jalador',
  'pestillo',
  'bisagra',
  'brazo',
  'cable acerado',
  'muebleria',
  'tope',
];

const startsWithAny = (text, prefixes) => prefixes.some((p) => text.startsWith(p));

export function getFamilyId(categoria) {
  const c = normalizeText(categoria);
  if (startsWithAny(c, RESIN_PREFIXES)) return 'resinas';
  if (startsWithAny(c, ELECTRIC_PREFIXES)) return 'electricos';
  if (startsWithAny(c, LOCK_PREFIXES)) return 'cerrajeria';
  return 'herramientas';
}


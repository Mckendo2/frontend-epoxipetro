import { useDeferredValue, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  ChevronDown,
  ArrowUp,
  ShoppingCart,
  X,
} from 'lucide-react';
import { useLandingCart } from '../context/LandingCartContext';
import { useCatalog } from '../context/CatalogContext';
import { FAMILIES, getFamilyById, normalizeText } from '../data/families';
import { getProductImageUrl } from '../../../config/api';

const PAGE_SIZE = 16;

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * Extrae una especificación corta del nombre o categoría del producto
 * (ej. "1:1 · 200g", "Ø 0.5mm", "70mm", "#2", "UV") para enriquecer el
 * diseño visual cuando el producto aún no tiene fotografía subida.
 */
function extractProductSpec(product) {
  const name = product.nombre || '';
  const cat = normalizeText(product.categoria || '');

  // Proporción de resina (1:1, 2:1, 3:1) + peso si existe
  const ratioMatch = name.match(/\b([123]:1)\b/i) || (product.categoria || '').match(/\b([123]:1)\b/i);
  const weightMatch = name.match(/\b(\d+(?:[.,]\d+)?\s*(?:kg|g|gr|ml|lt|l)\b)/i);
  if (ratioMatch && weightMatch) {
    return { code: ratioMatch[1], sub: weightMatch[1] };
  }
  if (ratioMatch) {
    return { code: ratioMatch[1], sub: 'Bicomponente' };
  }
  if (cat.includes('resina uv') || /\buv\b/i.test(name)) {
    return { code: 'UV', sub: weightMatch ? weightMatch[1] : 'Curado directo' };
  }

  // Diámetro o medida en milímetros / pulgadas (ej. Broca 0.5mm, Candado 70mm)
  const mmMatch = name.match(/\b(\d+(?:[.,]\d+)?\s*mm)\b/i);
  if (mmMatch) {
    return {
      code: cat.includes('broca') ? `Ø ${mmMatch[1]}` : mmMatch[1],
      sub: product.categoria || 'Medida',
    };
  }

  // Número de pigmento / código (#2, #5, 43320, etc.)
  const numCode = name.match(/(?:#\s*\d+|\b\d{3,6}[A-Z]*\b)/i);
  if (numCode) {
    return { code: numCode[0].toUpperCase(), sub: product.categoria || 'Referencia' };
  }

  if (weightMatch) {
    return { code: weightMatch[1], sub: product.categoria || 'Contenido' };
  }

  // Iniciales limpias de la subcategoría
  const words = (product.categoria || product.nombre || 'EP')
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const initials = words
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return { code: initials || 'EP', sub: product.categoria || 'Catálogo' };
}

/**
 * Ilustración técnica vectorial según la subcategoría y familia del producto
 * cuando gerencia aún no ha subido una foto para ese ítem específico.
 */
function TechnicalProductIllustration({ product, accent }) {
  const cat = normalizeText(product.categoria);
  const spec = extractProductSpec(product);

  // Variación de color por subcategoría dentro de Resinas y Pigmentos
  const isMica = cat.includes('mica') || cat.includes('pigmento');
  const isGlow = cat.includes('fotolum');
  const isTint = cat.includes('tinte') || cat.includes('alcohol');
  const isHinge = cat.includes('bisagra') || cat.includes('brazo');
  const isHandle = cat.includes('picaporte') || cat.includes('jalador');

  const tone = isMica
    ? '#a855f7'
    : isGlow
      ? '#10b981'
      : isTint
        ? '#f43f5e'
        : accent;

  return (
    <div className="flex items-center gap-4 px-5">
      {/* Ícono técnico de la subcategoría */}
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border bg-[#0f172a]/90 shadow-lg transition-transform duration-300 ease-out group-hover:scale-105"
        style={{
          borderColor: `${tone}55`,
          boxShadow: `0 10px 30px -10px ${tone}44`,
        }}
      >
        {product.familia === 'resinas' && isMica && (
          <svg viewBox="0 0 80 80" className="h-12 w-12" aria-hidden="true">
            <polygon
              points="40,10 66,26 58,62 22,62 14,26"
              fill={tone}
              fillOpacity="0.22"
              stroke="#d8b4fe"
              strokeWidth="2"
            />
            <polygon
              points="40,18 56,30 50,54 30,54 24,30"
              fill="none"
              stroke="#f3e8ff"
              strokeOpacity="0.6"
              strokeWidth="1.2"
            />
            <circle cx="58" cy="18" r="2.5" fill="#fbbf24" />
            <circle cx="22" cy="20" r="1.8" fill="#f472b6" />
          </svg>
        )}

        {product.familia === 'resinas' && isGlow && (
          <svg viewBox="0 0 80 80" className="h-12 w-12" aria-hidden="true">
            <circle
              cx="40"
              cy="40"
              r="24"
              fill="#10b981"
              fillOpacity="0.2"
              stroke="#6ee7b7"
              strokeWidth="2"
            />
            <path
              d="M40 18L45 33L60 38L45 43L40 58L35 43L20 38L35 33Z"
              fill="#6ee7b7"
              fillOpacity="0.35"
              stroke="#a7f3d0"
              strokeWidth="1.8"
            />
          </svg>
        )}

        {product.familia === 'resinas' && !isMica && !isGlow && (
          <svg viewBox="0 0 80 80" className="h-12 w-12" aria-hidden="true">
            <path
              d="M40 14C40 14 22 36 22 50C22 60.5 30.1 68 40 68C49.9 68 58 60.5 58 50C58 36 40 14 40 14Z"
              fill={tone}
              fillOpacity="0.25"
              stroke={isTint ? '#fda4af' : '#38bdf8'}
              strokeWidth="2"
            />
            <path
              d="M31 49C31 55 35 59 41 59"
              fill="none"
              stroke="#e0f2fe"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}

        {product.familia === 'cerraduras' && isHinge && (
          <svg viewBox="0 0 80 80" className="h-12 w-12" aria-hidden="true">
            <rect
              x="16"
              y="18"
              width="20"
              height="44"
              rx="3"
              fill="#6366f1"
              fillOpacity="0.2"
              stroke="#a5b4fc"
              strokeWidth="2"
            />
            <rect
              x="44"
              y="18"
              width="20"
              height="44"
              rx="3"
              fill="#6366f1"
              fillOpacity="0.2"
              stroke="#a5b4fc"
              strokeWidth="2"
            />
            <line x1="40" y1="14" x2="40" y2="66" stroke="#e0e7ff" strokeWidth="3" strokeLinecap="round" />
            <circle cx="26" cy="28" r="2" fill="#a5b4fc" />
            <circle cx="26" cy="52" r="2" fill="#a5b4fc" />
            <circle cx="54" cy="28" r="2" fill="#a5b4fc" />
            <circle cx="54" cy="52" r="2" fill="#a5b4fc" />
          </svg>
        )}

        {product.familia === 'cerraduras' && isHandle && (
          <svg viewBox="0 0 80 80" className="h-12 w-12" aria-hidden="true">
            <circle
              cx="28"
              cy="40"
              r="14"
              fill="#6366f1"
              fillOpacity="0.2"
              stroke="#a5b4fc"
              strokeWidth="2"
            />
            <rect
              x="26"
              y="35"
              width="40"
              height="10"
              rx="5"
              fill="#0f172a"
              stroke="#c7d2fe"
              strokeWidth="2"
            />
          </svg>
        )}

        {product.familia === 'cerraduras' && !isHinge && !isHandle && (
          <svg viewBox="0 0 80 80" className="h-12 w-12" aria-hidden="true">
            <rect
              x="20"
              y="14"
              width="40"
              height="52"
              rx="8"
              fill="#6366f1"
              fillOpacity="0.2"
              stroke="#a5b4fc"
              strokeWidth="2"
            />
            <circle cx="40" cy="36" r="10" fill="#0f172a" stroke="#c7d2fe" strokeWidth="2" />
            <path d="M38 34A2 2 0 1 1 42 34L41.5 41H38.5Z" fill="#c7d2fe" />
          </svg>
        )}

        {product.familia === 'candados' && (
          <svg viewBox="0 0 80 80" className="h-12 w-12" aria-hidden="true">
            <path
              d="M28 36V26C28 19 33.4 14 40 14C46.6 14 52 19 52 26V36"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <rect
              x="21"
              y="35"
              width="38"
              height="31"
              rx="6"
              fill="#f59e0b"
              fillOpacity="0.2"
              stroke="#fbbf24"
              strokeWidth="2"
            />
            <circle cx="40" cy="48" r="3.2" fill="#fde68a" />
            <path d="M38.5 50H41.5L42 57H38Z" fill="#fde68a" />
          </svg>
        )}

        {product.familia === 'electricos' && (
          <svg viewBox="0 0 80 80" className="h-12 w-12" aria-hidden="true">
            <rect
              x="16"
              y="16"
              width="48"
              height="48"
              rx="7"
              fill="#38bdf8"
              fillOpacity="0.18"
              stroke="#7dd3fc"
              strokeWidth="2"
            />
            <rect x="27" y="27" width="11" height="26" rx="2" fill="#0f172a" stroke="#bae6fd" strokeWidth="1.6" />
            <rect x="42" y="27" width="11" height="26" rx="2" fill="#0f172a" stroke="#bae6fd" strokeWidth="1.6" />
          </svg>
        )}

        {product.familia === 'herramientas' && (
          <svg viewBox="0 0 80 80" className="h-12 w-12" aria-hidden="true">
            <g transform="rotate(-35 40 40)">
              <path
                d="M35 14L40 8L45 14V50H35Z"
                fill="#10b981"
                fillOpacity="0.25"
                stroke="#6ee7b7"
                strokeWidth="2"
              />
              <line x1="35" y1="24" x2="45" y2="30" stroke="#6ee7b7" strokeWidth="1.8" />
              <line x1="35" y1="34" x2="45" y2="40" stroke="#6ee7b7" strokeWidth="1.8" />
              <rect x="34" y="50" width="12" height="16" rx="2" fill="#0f172a" stroke="#34d399" strokeWidth="2" />
            </g>
          </svg>
        )}
      </div>

      {/* Ficha técnica visual con el código/medida extraído del producto */}
      <div className="min-w-0">
        <span className="block font-display text-3xl font-semibold leading-none tracking-tight text-white">
          {spec.code}
        </span>
        <span className="mt-1 block truncate text-xs font-medium text-slate-300">
          {spec.sub}
        </span>
      </div>
    </div>
  );
}

function ProductCard({ product, qty, onAdd, onUpdateQty }) {
  const [imgFailed, setImgFailed] = useState(false);
  const pres = product.presentation;
  const atMax = product.stock > 0 && qty >= product.stock;
  const realImageUrl = getProductImageUrl(product.imagen_url);
  const showPhoto = Boolean(realImageUrl && !imgFailed);
  const family = getFamilyById(product.familia);

  return (
    <article
      className={`group flex flex-col justify-between overflow-hidden rounded-xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10 ${
        qty > 0
          ? 'border-action ring-2 ring-action/25'
          : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      {/* Cabecera visual: Foto real (si gerencia la subió) o Diseño Técnico Visual */}
      <div className="relative h-48 w-full overflow-hidden bg-[#0f172a]">
        {showPhoto ? (
          <img
            src={realImageUrl}
            alt={product.nombre}
            width={400}
            height={300}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#131f38] to-[#1e293b]">
            {/* Retícula arquitectónica sutil */}
            <div
              className="bg-login-grid pointer-events-none absolute inset-0 opacity-55"
              aria-hidden="true"
            />

            {/* Halo del color de la categoría */}
            <div
              className="pointer-events-none absolute h-36 w-36 rounded-full opacity-25 blur-2xl transition-opacity duration-300 group-hover:opacity-45"
              style={{ backgroundColor: family.accent }}
              aria-hidden="true"
            />

            {/* Emblema técnico con especificación del producto */}
            <div className="relative z-10 w-full">
              <TechnicalProductIllustration product={product} accent={family.accent} />
            </div>
          </div>
        )}

        {/* Etiquetas superiores: Marca y Subcategoría */}
        <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
          {product.marca ? (
            <span
              translate="no"
              className="rounded-md border border-white/15 bg-[#0f172a]/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-xs"
            >
              {product.marca}
            </span>
          ) : (
            <span />
          )}

          {product.categoria && (
            <span
              className="rounded-md px-2.5 py-1 text-[11px] font-semibold backdrop-blur-xs"
              style={{
                backgroundColor: showPhoto ? 'rgba(15, 23, 42, 0.85)' : family.badgeBg,
                color: showPhoto ? '#e2e8f0' : family.badgeText,
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              {product.categoria}
            </span>
          )}
        </div>

        {/* Cinta inferior de disponibilidad (solo almacén) */}
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex items-center justify-between">
          {product.stock > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-[#0f172a]/90 px-2.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              <span>
                Disponible: <span className="tabular-nums">{product.stock}</span>{' '}
                {pres.unidad || 'unid.'}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0f172a]/85 px-2.5 py-1 text-xs font-medium text-slate-300 backdrop-blur-xs">
              Consultar disponibilidad
            </span>
          )}
        </div>
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <h3 className="line-clamp-2 text-base font-bold capitalize leading-snug text-ink">
            {product.nombre}
          </h3>
          {pres.nombre && pres.nombre !== 'Unidad' && (
            <p className="mt-1 text-xs text-slate-500">Presentación: {pres.nombre}</p>
          )}
        </div>

        {/* Pie con Precio y Botón de Cotización */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-3.5">
          <div>
            <span className="block text-[11px] font-medium text-slate-500">Precio unitario</span>
            <p className="font-display text-2xl font-semibold leading-none tabular-nums text-ink">
              {pres.precio_venta > 0 ? (
                <>
                  <span className="mr-1 font-sans text-xs font-semibold text-slate-500">Bs.</span>
                  {formatCurrency(pres.precio_venta)}
                </>
              ) : (
                <span className="font-sans text-sm font-semibold text-slate-600">A cotizar</span>
              )}
            </p>
          </div>

          {qty > 0 ? (
            <div className="inline-flex items-center rounded-lg border border-action bg-indigo-50/60">
              <button
                type="button"
                onClick={() => onUpdateQty(pres.id, -1)}
                aria-label={`Quitar una unidad de ${product.nombre}`}
                className="flex h-10 w-9 items-center justify-center text-action transition-colors hover:bg-indigo-100"
              >
                <Minus size={15} aria-hidden="true" />
              </button>
              <span className="min-w-7 text-center text-sm font-bold tabular-nums text-ink">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQty(pres.id, 1)}
                disabled={atMax}
                aria-label={`Sumar una unidad de ${product.nombre}`}
                className="flex h-10 w-9 items-center justify-center text-action transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Plus size={15} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAdd(product, pres)}
              aria-label={`Agregar ${product.nombre} a la cotización`}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-action px-4 text-sm font-semibold text-white transition-colors hover:bg-action-hover"
            >
              <Plus size={16} aria-hidden="true" />
              <span>Agregar</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Products() {
  const { cart, addToCart, updateQuantity, totalItems, setIsCartOpen } = useLandingCart();
  const {
    products,
    loading,
    error,
    reload,
    filters,
    setFilters,
    resetFilters,
    stats,
  } = useCatalog();

  const deferredQuery = useDeferredValue(filters.q);
  const currentFamily = getFamilyById(filters.family);
  const isGlobalSearch = Boolean(deferredQuery.trim());

  const filterKey = `${filters.q}|${filters.family}|${filters.category}|${filters.onlyAvailable}`;
  const [limit, setLimit] = useState({ key: '', count: PAGE_SIZE });
  const visibleCount = limit.key === filterKey ? limit.count : PAGE_SIZE;

  // Subcategorías exclusivas de la categoría activa
  const subcategories = useMemo(() => {
    return stats.familySubcategories?.[currentFamily.id] || [];
  }, [stats.familySubcategories, currentFamily.id]);

  // Productos filtrados por la categoría elegida (o por búsqueda)
  const filtered = useMemo(() => {
    const terms = normalizeText(deferredQuery).split(/\s+/).filter(Boolean);
    return products.filter((p) => {
      // Si no hay término de búsqueda global, muestra estrictamente la categoría elegida
      if (!terms.length && p.familia !== currentFamily.id) return false;
      // Si el usuario también seleccionó una subcategoría específica
      if (filters.category && p.categoria !== filters.category) return false;
      if (filters.onlyAvailable && p.stock <= 0) return false;
      return terms.every((t) => p.searchText.includes(t));
    });
  }, [products, deferredQuery, currentFamily.id, filters.category, filters.onlyAvailable]);

  const cartQty = useMemo(() => {
    const map = new Map();
    for (const item of cart) map.set(item.id, item.cantidad);
    return map;
  }, [cart]);

  const visible = filtered.slice(0, visibleCount);

  const scrollToCategories = () => {
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="catalogo-categoria"
      className="scroll-mt-16 bg-paper py-16 lg:py-24"
      aria-label="Productos de la categoría seleccionada"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Selector rápido entre las 5 categorías para cambiar sin perder el lugar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-5">
          <div
            role="group"
            aria-label="Cambiar de categoría"
            className="flex flex-wrap items-center gap-2"
          >
            {FAMILIES.map((fam) => {
              const active = currentFamily.id === fam.id && !isGlobalSearch;
              return (
                <button
                  key={fam.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilters({ family: fam.id, category: '', q: '' })}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
                    active
                      ? 'bg-ink text-white shadow-sm'
                      : 'border border-slate-300 bg-white text-slate-700 hover:border-ink hover:text-ink'
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: fam.accent }}
                    aria-hidden="true"
                  />
                  <span>{fam.shortName}</span>
                  <span
                    className={`tabular-nums ${active ? 'text-slate-300' : 'text-slate-400'}`}
                  >
                    {loading ? '' : stats.families[fam.id] || 0}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={scrollToCategories}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-action hover:text-action-hover sm:text-sm"
          >
            <ArrowUp size={15} aria-hidden="true" />
            <span>Ver tarjetas de categorías</span>
          </button>
        </div>

        {/* Cabecera de la categoría activa */}
        <div className="mt-8 flex flex-col justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:flex-row lg:items-center">
          <div className="flex items-center gap-5">
            <img
              src={currentFamily.image}
              alt=""
              width={88}
              height={88}
              loading="lazy"
              className="hidden h-20 w-20 shrink-0 rounded-xl border border-slate-200 object-cover sm:block"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-action">
                {isGlobalSearch ? 'Resultados de búsqueda' : 'Categoría seleccionada'}
              </p>
              <h2 className="mt-1 font-display text-4xl font-semibold leading-none text-ink sm:text-5xl">
                {isGlobalSearch ? `Búsqueda: “${filters.q}”` : currentFamily.name}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                {isGlobalSearch
                  ? `Mostrando coincidencias en el catálogo. Limpia la búsqueda para volver a ${currentFamily.name}.`
                  : currentFamily.blurb}
              </p>
            </div>
          </div>

          {totalItems > 0 && (
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg bg-action px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-action-hover lg:self-center"
            >
              <ShoppingCart size={17} aria-hidden="true" />
              <span>Ver mi cotización ({totalItems})</span>
            </button>
          )}
        </div>

        {/* Barra de búsqueda y subcategorías de la línea elegida */}
        <div className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <label htmlFor="catalog-search" className="sr-only">
                Buscar producto, marca o medida
              </label>
              <Search
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                id="catalog-search"
                name="q"
                type="search"
                autoComplete="off"
                spellCheck={false}
                value={filters.q}
                onChange={(e) => setFilters({ q: e.target.value })}
                placeholder={`Buscar en ${currentFamily.shortName.toLowerCase()} o en todo el catálogo…`}
                className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 text-base text-ink placeholder:text-slate-400 focus:border-action"
              />
              {filters.q && (
                <button
                  type="button"
                  onClick={() => setFilters({ q: '' })}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-ink"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </div>

            <label className="flex h-12 cursor-pointer select-none items-center gap-2.5 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                name="disponibles"
                checked={filters.onlyAvailable}
                onChange={(e) => setFilters({ onlyAvailable: e.target.checked })}
                className="h-4 w-4 accent-[#4f46e5]"
              />
              <span>Solo disponibles</span>
            </label>
          </div>

          {/* Subcategorías de la categoría seleccionada */}
          {!isGlobalSearch && subcategories.length > 1 && (
            <div
              role="group"
              aria-label={`Subcategorías de ${currentFamily.name}`}
              className="flex flex-wrap items-center gap-2"
            >
              <button
                type="button"
                aria-pressed={!filters.category}
                onClick={() => setFilters({ category: '' })}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  !filters.category
                    ? 'bg-action text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:border-action hover:text-action'
                }`}
              >
                Todas ({stats.families[currentFamily.id] || 0})
              </button>
              {subcategories.map((sub) => {
                const active = filters.category === sub.name;
                return (
                  <button
                    key={sub.name}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setFilters({ category: active ? '' : sub.name })
                    }
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-action text-white'
                        : 'border border-slate-300 bg-white text-slate-700 hover:border-action hover:text-action'
                    }`}
                  >
                    {sub.name}{' '}
                    <span className={active ? 'text-indigo-100' : 'text-slate-400'}>
                      ({sub.count})
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Contador de resultados */}
        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <p aria-live="polite">
            {loading
              ? 'Cargando productos…'
              : error
                ? ''
                : `Mostrando ${ Math.min(visible.length, filtered.length) } de ${filtered.length} ${
                    filtered.length === 1 ? 'producto' : 'productos'
                  }`}
          </p>

          {(filters.category || filters.q || filters.onlyAvailable) && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-action underline underline-offset-2 hover:text-action-hover"
            >
              Restablecer filtros de esta categoría
            </button>
          )}
        </div>

        {/* Grilla de tarjetas de productos */}
        {loading ? (
          <div
            className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            aria-hidden="true"
          >
            {Array.from({ length: 8 }, (_, n) => (
              <div
                key={n}
                className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white p-4"
              />
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-base font-semibold text-ink">No pudimos cargar los productos.</p>
            <p className="mt-1 text-sm text-slate-600">
              Verifica tu conexión e inténtalo nuevamente.
            </p>
            <button
              type="button"
              onClick={reload}
              className="mt-4 rounded-lg bg-action px-4 py-2.5 text-sm font-semibold text-white hover:bg-action-hover"
            >
              Reintentar
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-base font-semibold text-ink">
              No encontramos productos con ese filtro.
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Prueba con otra subcategoría o restablece los filtros.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-lg bg-action px-4 py-2.5 text-sm font-semibold text-white hover:bg-action-hover"
            >
              Ver todos los productos de {currentFamily.shortName}
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  qty={cartQty.get(p.presentation.id) || 0}
                  onAdd={addToCart}
                  onUpdateQty={updateQuantity}
                />
              ))}
            </div>

            {visibleCount < filtered.length && (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => setLimit({ key: filterKey, count: visibleCount + PAGE_SIZE })}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-ink shadow-xs transition-colors hover:border-action hover:text-action"
                >
                  <ChevronDown size={17} aria-hidden="true" />
                  <span>
                    Ver más de {currentFamily.shortName} ({visibleCount} de {filtered.length})
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

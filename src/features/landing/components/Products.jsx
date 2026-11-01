import { useDeferredValue, useMemo, useState } from 'react';
import { Search, Plus, Minus, ChevronDown } from 'lucide-react';
import { useLandingCart } from '../context/LandingCartContext';
import { useCatalog } from '../context/CatalogContext';
import { FAMILIES, normalizeText } from '../data/families';
import { getProductImageUrl } from '../../../config/api';

const PAGE_SIZE = 40;

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function Products() {
  const { cart, addToCart, updateQuantity } = useLandingCart();
  const { products, loading, error, reload, filters, setFilters, resetFilters, stats } =
    useCatalog();

  const deferredQuery = useDeferredValue(filters.q);
  const filterKey = `${filters.q}|${filters.family}|${filters.category}|${filters.onlyAvailable}`;
  const [limit, setLimit] = useState({ key: '', count: PAGE_SIZE });
  const visibleCount = limit.key === filterKey ? limit.count : PAGE_SIZE;

  const filtered = useMemo(() => {
    const terms = normalizeText(deferredQuery).split(/\s+/).filter(Boolean);
    return products.filter((p) => {
      if (filters.family !== 'todos' && p.familia !== filters.family) return false;
      if (filters.category && p.categoria !== filters.category) return false;
      if (filters.onlyAvailable && p.stock <= 0) return false;
      return terms.every((t) => p.searchText.includes(t));
    });
  }, [products, deferredQuery, filters.family, filters.category, filters.onlyAvailable]);

  const categoryOptions = useMemo(() => {
    if (filters.family === 'todos') return [];
    return [...stats.categories.entries()]
      .filter(([, info]) => info.familia === filters.family)
      .sort((a, b) => a[0].localeCompare(b[0], 'es', { numeric: true }));
  }, [stats.categories, filters.family]);

  const cartQty = useMemo(() => {
    const map = new Map();
    for (const item of cart) map.set(item.id, item.cantidad);
    return map;
  }, [cart]);

  const visible = filtered.slice(0, visibleCount);
  const hasFilters =
    filters.q || filters.family !== 'todos' || filters.category || filters.onlyAvailable;

  const tabs = [
    { id: 'todos', name: 'Todo', count: products.length },
    ...FAMILIES.map((f) => ({ id: f.id, name: f.name, count: stats.families[f.id] })),
  ];

  return (
    <section id="productos" className="scroll-mt-16 bg-paper py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-2xl">
          <h2
            className="font-display text-5xl font-semibold leading-none text-ink sm:text-6xl"
            style={{ textWrap: 'balance' }}
          >
            Lista de productos
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            La disponibilidad es la de nuestro almacén. Agrega lo que necesitas y envía la
            cotización por WhatsApp.
          </p>
        </div>

        {/* Controles */}
        <div className="mt-10 border-b border-rule">
          <div className="flex flex-col gap-3 pb-5 sm:flex-row">
            <div className="relative flex-1">
              <label htmlFor="catalog-search" className="sr-only">
                Buscar en el catálogo
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
                placeholder="Producto, marca o código…"
                className="h-12 w-full rounded-md border border-slate-300 bg-white pl-10 pr-4 text-base text-ink placeholder:text-slate-500 focus:border-action"
              />
            </div>

            {categoryOptions.length > 0 && (
              <div className="sm:w-64">
                <label htmlFor="catalog-category" className="sr-only">
                  Categoría
                </label>
                <select
                  id="catalog-category"
                  name="categoria"
                  value={filters.category}
                  onChange={(e) => setFilters({ category: e.target.value })}
                  style={{ backgroundColor: '#fff', color: '#0f172a' }}
                  className="h-12 w-full rounded-md border border-slate-300 px-3 text-base focus:border-action"
                >
                  <option value="">Todas las categorías</option>
                  {categoryOptions.map(([name, info]) => (
                    <option key={name} value={name}>
                      {name} ({info.count})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <label className="flex h-12 cursor-pointer select-none items-center gap-2.5 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-ink">
              <input
                type="checkbox"
                name="disponibles"
                checked={filters.onlyAvailable}
                onChange={(e) => setFilters({ onlyAvailable: e.target.checked })}
                className="h-4 w-4 accent-[#4f46e5]"
              />
              Solo disponibles
            </label>
          </div>

          <div role="group" aria-label="Familias de productos" className="-mb-px flex gap-6 overflow-x-auto">
            {tabs.map((tab) => {
              const active = filters.family === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilters({ family: tab.id, category: '' })}
                  className={`shrink-0 border-b-2 pb-3 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-action text-ink'
                      : 'border-transparent text-slate-600 hover:text-ink'
                  }`}
                >
                  {tab.name}
                  <span className="ml-1.5 font-normal tabular-nums text-slate-500">
                    {loading ? '' : tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-600" aria-live="polite">
          {loading
            ? 'Cargando productos…'
            : error
              ? ''
              : `${filtered.length} ${filtered.length === 1 ? 'producto' : 'productos'}`}
        </p>

        {/* Lista */}
        {loading ? (
          <ul className="mt-2" aria-hidden="true">
            {Array.from({ length: 8 }, (_, n) => (
              <li key={n} className="h-[4.5rem] animate-pulse border-t border-rule bg-slate-200/40" />
            ))}
          </ul>
        ) : error ? (
          <div className="mt-2 border-t border-rule py-12">
            <p className="text-base font-semibold text-ink">No pudimos cargar el catálogo.</p>
            <p className="mt-1 text-sm text-slate-600">
              Revisa tu conexión e inténtalo de nuevo, o escríbenos por WhatsApp.
            </p>
            <button
              type="button"
              onClick={reload}
              className="mt-4 rounded-md bg-action px-4 py-2.5 text-sm font-semibold text-white hover:bg-action-hover"
            >
              Reintentar
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-2 border-t border-rule py-12">
            <p className="text-base font-semibold text-ink">No encontramos productos con ese filtro.</p>
            <p className="mt-1 text-sm text-slate-600">
              Prueba con otra palabra o escríbenos y lo buscamos por ti.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-md bg-action px-4 py-2.5 text-sm font-semibold text-white hover:bg-action-hover"
              >
                Quitar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              className="mt-2 hidden grid-cols-[minmax(0,1fr)_11rem_7rem_9rem] gap-x-4 border-t border-rule pb-2 pt-3 text-xs font-semibold text-slate-600 md:grid"
              aria-hidden="true"
            >
              <span>Producto</span>
              <span>Disponibilidad</span>
              <span className="text-right">Precio</span>
              <span />
            </div>

            <ul>
              {visible.map((p) => {
                const pres = p.presentation;
                const qty = cartQty.get(pres.id) || 0;
                const atMax = p.stock > 0 && qty >= p.stock;
                const imageUrl = stats.hasImages ? getProductImageUrl(p.imagen_url) : null;

                return (
                  <li
                    key={p.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-t border-rule py-3.5 [contain-intrinsic-size:auto_72px] [content-visibility:auto] md:grid-cols-[minmax(0,1fr)_11rem_7rem_9rem]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {stats.hasImages && (
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-slate-200">
                          {imageUrl && (
                            <img
                              src={imageUrl}
                              alt=""
                              width={48}
                              height={48}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="break-words text-[0.95rem] font-semibold capitalize leading-snug text-ink">
                          {p.nombre}
                        </h3>
                        <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-600">
                          {p.marca && <span translate="no">{p.marca}</span>}
                          <span>{p.categoria}</span>
                        </p>
                      </div>
                    </div>

                    <p
                      className={`text-sm ${
                        p.stock > 0 ? 'font-semibold text-emerald-700' : 'text-slate-600'
                      }`}
                    >
                      {p.stock > 0 ? (
                        <>
                          Disponible:{' '}
                          <span className="tabular-nums">{p.stock}</span>{' '}
                          {pres.unidad || 'unid.'}
                        </>
                      ) : (
                        'Consultar disponibilidad'
                      )}
                    </p>

                    <p className="col-start-2 row-start-1 text-right font-display text-2xl font-semibold tabular-nums text-ink md:col-start-auto md:row-start-auto">
                      {pres.precio_venta > 0 ? (
                        <>
                          <span className="mr-1 text-sm font-medium text-slate-600">Bs.</span>
                          {formatCurrency(pres.precio_venta)}
                        </>
                      ) : (
                        <span className="font-sans text-sm font-medium text-slate-600">A cotizar</span>
                      )}
                    </p>

                    <div className="col-start-2 row-start-2 justify-self-end md:col-start-auto md:row-start-auto">
                      {qty > 0 ? (
                        <div className="inline-flex items-center rounded-md border border-action bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(pres.id, -1)}
                            aria-label={`Quitar una unidad de ${p.nombre}`}
                            className="flex h-10 w-10 items-center justify-center text-action hover:bg-indigo-50"
                          >
                            <Minus size={15} aria-hidden="true" />
                          </button>
                          <span className="min-w-7 text-center text-sm font-bold tabular-nums text-ink">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(pres.id, 1)}
                            disabled={atMax}
                            aria-label={`Sumar una unidad de ${p.nombre}`}
                            className="flex h-10 w-10 items-center justify-center text-action hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Plus size={15} aria-hidden="true" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(p, pres)}
                          aria-label={`Agregar ${p.nombre} a la lista`}
                          className="inline-flex h-10 items-center gap-1.5 rounded-md bg-action px-4 text-sm font-semibold text-white transition-colors hover:bg-action-hover"
                        >
                          <Plus size={15} aria-hidden="true" />
                          Agregar
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {visibleCount < filtered.length && (
              <div className="mt-8 border-t border-rule pt-8">
                <button
                  type="button"
                  onClick={() => setLimit({ key: filterKey, count: visibleCount + PAGE_SIZE })}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-400 bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-action hover:text-action"
                >
                  <ChevronDown size={17} aria-hidden="true" />
                  Mostrar más
                  <span className="font-normal tabular-nums text-slate-600">
                    ({visibleCount} de {filtered.length})
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

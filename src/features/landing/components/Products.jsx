import { useState, useEffect, useMemo } from 'react';
import { Search, ShoppingCart, Plus, Minus, Package, ChevronDown } from 'lucide-react';
import { useLandingCart } from '../context/LandingCartContext';
import { getApiBaseUrl, getProductImageUrl } from '../../../config/api';

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function Products() {
  const { cart, addToCart, updateQuantity, setIsCartOpen } = useLandingCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [visibleCount, setVisibleCount] = useState(16);

  useEffect(() => {
    const apiBase = getApiBaseUrl();
    fetch(`${apiBase}/api/public/catalogo`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al conectar con la base de datos');
        return res.json();
      })
      .then((data) => {
        const flattened = data
          .filter((p) => p.nombre && !p.nombre.includes('Nombre *'))
          .map((p) => {
            const pres = p.presentaciones?.[0] || {
              id: `p-${p.id}`,
              nombre: 'Unidad',
              precio_venta: 0,
              stock_almacen: 0,
              stock_total: 0,
            };

            const stockDisponible = Number(pres.stock_almacen ?? pres.stock_total ?? 0);

            return {
              ...p,
              presentation: {
                ...pres,
                stock_disponible: stockDisponible,
              },
              totalStock: stockDisponible,
            };
          });

        setProducts(flattened);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error cargando catálogo:', err);
        setLoading(false);
      });
  }, []);

  const categoriesList = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.categoria) set.add(p.categoria.trim());
    });
    return ['Todos', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === 'Todos' ||
        (p.categoria && p.categoria.toLowerCase() === selectedCategory.toLowerCase());

      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        p.nombre?.toLowerCase().includes(query) ||
        p.marca?.toLowerCase().includes(query) ||
        p.categoria?.toLowerCase().includes(query) ||
        p.presentation?.codigo_barras?.toLowerCase().includes(query);

      const matchStock = !onlyInStock || p.totalStock > 0;

      return matchCat && matchSearch && matchStock;
    });
  }, [products, selectedCategory, searchQuery, onlyInStock]);

  useEffect(() => {
    setVisibleCount(16);
  }, [selectedCategory, searchQuery, onlyInStock]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const totalCartItems = cart.reduce((a, b) => a + b.cantidad, 0);

  return (
    <section id="productos" className="scroll-mt-20 bg-[#0f172a] py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Clean Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Nuestros Productos
            </h2>
            <p className="mt-2 text-sm text-[#94a3b8]">
              Selecciona los artículos que necesitas para armar tu cotización.
            </p>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="self-start md:self-auto inline-flex items-center gap-2 rounded-lg border border-[#6366f1]/40 bg-[#1e293b] px-4 py-2.5 text-sm font-semibold text-[#a5b4fc] transition-all hover:border-[#6366f1] hover:text-white"
          >
            <ShoppingCart size={17} />
            <span>Mi Cotización</span>
            {totalCartItems > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6366f1] px-1.5 text-[11px] font-bold text-white">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mt-8 rounded-2xl border border-[#334155] bg-[#1e293b] p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]"
              />
              <input
                type="text"
                placeholder="Buscar producto, marca o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[#334155] bg-[#0f172a] pl-10 pr-4 py-2.5 text-sm text-[#f8fafc] placeholder:text-[#64748b] focus:border-[#6366f1] focus:outline-none transition-colors"
              />
            </div>

            <label className="flex items-center gap-2 rounded-lg border border-[#334155] bg-[#0f172a] px-3.5 py-2.5 text-xs font-semibold text-[#cbd5e1] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="h-4 w-4 rounded border-[#334155] bg-[#1e293b] text-[#6366f1] accent-[#6366f1]"
              />
              <span>Solo disponibles</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#6366f1] text-white'
                      : 'border border-[#334155] bg-[#0f172a] text-[#94a3b8] hover:border-[#6366f1]/50 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-64 animate-pulse rounded-xl border border-[#334155] bg-[#1e293b]/70 p-5"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#334155] bg-[#1e293b] py-14 text-center">
            <Package size={36} className="mx-auto text-[#64748b]" />
            <h3 className="mt-3 text-base font-bold text-white">Sin resultados</h3>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
                setOnlyInStock(false);
              }}
              className="mt-4 rounded-lg bg-[#6366f1] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4f46e5]"
            >
              Ver todos
            </button>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleProducts.map((p) => {
                const pres = p.presentation;
                const cartItem = cart.find((i) => i.id === pres.id);
                const inCartQty = cartItem?.cantidad || 0;
                const stockDisp = pres.stock_disponible || 0;
                const isMaxStock = stockDisp > 0 && inCartQty >= stockDisp;
                const realImageUrl = getProductImageUrl(p.imagen_url);

                return (
                  <div
                    key={p.id}
                    className={`group flex flex-col justify-between overflow-hidden rounded-xl border transition-all duration-200 ${
                      inCartQty > 0
                        ? 'border-[#6366f1] bg-[#1e293b] shadow-lg shadow-[#6366f1]/15'
                        : 'border-[#334155] bg-[#1e293b] hover:border-[#475569]'
                    }`}
                  >
                    {/* Header: Real Image or Minimal Placeholder */}
                    <div className="relative h-40 w-full overflow-hidden border-b border-[#334155]/60 bg-[#0f172a]">
                      {realImageUrl ? (
                        <img
                          src={realImageUrl}
                          alt={p.nombre}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="relative flex h-full w-full items-center justify-center bg-[#0f172a]">
                          <div
                            className="pointer-events-none absolute inset-0 bg-login-grid opacity-50"
                            aria-hidden="true"
                          />
                          <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border border-[#6366f1]/30 bg-[#6366f1]/15 text-[#a5b4fc]">
                            <Package size={22} />
                          </div>
                        </div>
                      )}

                      {p.marca && p.marca !== 'Sin marca' && (
                        <span className="absolute left-3 top-3 z-10 rounded-md border border-[#6366f1]/40 bg-[#0f172a]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#a5b4fc]">
                          {p.marca}
                        </span>
                      )}

                      {p.categoria && (
                        <span className="absolute right-3 top-3 z-10 rounded-md border border-[#334155] bg-[#1e293b]/90 px-2 py-0.5 text-[10px] font-medium text-[#cbd5e1]">
                          {p.categoria}
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="text-sm font-bold text-white capitalize leading-snug line-clamp-2">
                        {p.nombre}
                      </h3>

                      <div className="mt-2.5 flex items-center">
                        {stockDisp > 0 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span>
                              Disponible: {stockDisp} {pres.unidad || 'unid.'}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#334155] bg-[#0f172a] px-2.5 py-0.5 text-[10px] font-medium text-[#94a3b8]">
                            <span>Consultar</span>
                          </span>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#334155]/70 flex items-center justify-between">
                        <div className="text-lg font-extrabold text-white">
                          {pres.precio_venta > 0 ? (
                            <>
                              <span className="text-xs font-semibold text-[#a5b4fc] mr-1">Bs.</span>
                              {formatCurrency(pres.precio_venta)}
                            </>
                          ) : (
                            <span className="text-xs font-semibold text-[#a5b4fc]">A cotizar</span>
                          )}
                        </div>

                        {inCartQty > 0 ? (
                          <div className="flex items-center rounded-lg border border-[#6366f1] bg-[#0f172a] overflow-hidden">
                            <button
                              onClick={() => updateQuantity(pres.id, -1)}
                              className="p-1.5 text-[#a5b4fc] hover:bg-[#6366f1]/20 hover:text-white"
                              aria-label="Restar uno"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-2 text-xs font-bold text-white">{inCartQty}</span>
                            <button
                              onClick={() => updateQuantity(pres.id, 1)}
                              disabled={isMaxStock}
                              className={`p-1.5 text-[#a5b4fc] hover:bg-[#6366f1]/20 hover:text-white ${
                                isMaxStock ? 'opacity-30 cursor-not-allowed' : ''
                              }`}
                              aria-label="Sumar uno"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(p, pres)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#6366f1] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-[#4f46e5]"
                          >
                            <Plus size={14} />
                            <span>Agregar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {visibleCount < filteredProducts.length && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 16)}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#334155] bg-[#1e293b] px-6 py-2.5 text-sm font-semibold text-[#f8fafc] hover:border-[#6366f1] transition-colors"
                >
                  <ChevronDown size={17} />
                  <span>
                    Ver más ({visibleCount} de {filteredProducts.length})
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

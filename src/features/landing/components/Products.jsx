import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Package,
  Layers,
  MessageCircle,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { useLandingCart } from '../context/LandingCartContext';
import { siteConfig } from '../data/siteConfig';
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

  // Filters
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

            // Solo se muestra lo disponible del almacén, sin exponer tienda
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

  // Extraer categorías únicas disponibles
  const categoriesList = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.categoria) set.add(p.categoria.trim());
    });
    return ['Todos', ...Array.from(set)];
  }, [products]);

  // Filtrado de productos
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

  // Reset pagination when filter changes
  useEffect(() => {
    setVisibleCount(16);
  }, [selectedCategory, searchQuery, onlyInStock]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const totalCartItems = cart.reduce((a, b) => a + b.cantidad, 0);

  return (
    <section id="productos" className="scroll-mt-24 bg-[#0f172a] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header Section (Westlake Epoxy style + LoginPage palette) */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/15 px-3.5 py-1 text-xs font-semibold text-[#a5b4fc]">
              <Layers size={14} />
              <span>Catálogo Técnico e Industrial ({products.length} productos)</span>
            </div>
            <h2
              className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
              style={{ textWrap: 'balance' }}
            >
              Explora Nuestro Portafolio de Productos
            </h2>
            <p className="mt-3 max-w-2xl text-base text-[#94a3b8]" style={{ textWrap: 'pretty' }}>
              Filtra por especialidad o busca por especificación técnica. Selecciona las unidades
              requeridas para generar tu cotización inmediata.
            </p>
          </div>

          {/* Quick Cart summary button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="self-start md:self-auto inline-flex items-center gap-2.5 rounded-lg border border-[#6366f1]/40 bg-[#1e293b] px-4 py-2.5 text-sm font-semibold text-[#a5b4fc] transition-all hover:border-[#6366f1] hover:bg-[#1e293b]/80 hover:text-white"
          >
            <ShoppingCart size={18} />
            <span>Ver mi cotización</span>
            {totalCartItems > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6366f1] px-1.5 text-[11px] font-bold text-white">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>

        {/* Filter and Search Bar — Styled like LoginPage.jsx form inputs */}
        <div className="mt-10 rounded-2xl border border-[#334155] bg-[#1e293b] p-5 lg:p-6 space-y-5 shadow-xl shadow-black/20">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]"
              />
              <input
                type="text"
                placeholder="Buscar por producto (ej. Resina, Yale, Broca Cobalto), marca o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[#334155] bg-[#0f172a] pl-10 pr-4 py-3 text-sm text-[#f8fafc] placeholder:text-[#64748b] hover:border-[#475569] focus:border-[#6366f1] focus:outline-none transition-colors"
              />
            </div>

            {/* Checkbox: Only with stock */}
            <label className="flex items-center gap-2.5 rounded-lg border border-[#334155] bg-[#0f172a] px-4 py-3 text-xs font-semibold text-[#cbd5e1] cursor-pointer select-none self-start lg:self-auto hover:border-[#475569]">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="h-4 w-4 rounded border-[#334155] bg-[#1e293b] text-[#6366f1] accent-[#6366f1] focus:ring-[#6366f1]"
              />
              <span>Solo mostrar productos con stock disponible</span>
            </label>
          </div>

          {/* Categories Pill Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#334155]/80">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94a3b8] mr-1">
              <Filter size={13} className="text-[#6366f1]" />
              <span>Líneas:</span>
            </span>
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#6366f1] text-white shadow-md shadow-[#6366f1]/30'
                      : 'border border-[#334155] bg-[#0f172a] text-[#94a3b8] hover:border-[#6366f1]/50 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-72 animate-pulse rounded-xl border border-[#334155] bg-[#1e293b]/70 p-5"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-[#334155] bg-[#1e293b] py-16 text-center">
            <Package size={40} className="mx-auto text-[#64748b]" />
            <h3 className="mt-3 text-base font-bold text-white">
              No se encontraron productos con esos criterios
            </h3>
            <p className="mt-1 text-xs text-[#94a3b8]">
              Prueba cambiando el término de búsqueda o seleccionando otra categoría.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
                setOnlyInStock(false);
              }}
              className="mt-5 rounded-lg bg-[#6366f1] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4f46e5] transition-colors"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border transition-all duration-200 ${
                      inCartQty > 0
                        ? 'border-[#6366f1] bg-[#1e293b] shadow-lg shadow-[#6366f1]/15'
                        : 'border-[#334155] bg-[#1e293b] hover:border-[#475569] hover:shadow-xl hover:shadow-black/30'
                    }`}
                  >
                    {/* Top Image or Technical Blueprint Placeholder (No AI generated images!) */}
                    <div className="relative h-44 w-full overflow-hidden border-b border-[#334155]/70 bg-[#0f172a]">
                      {realImageUrl ? (
                        <img
                          src={realImageUrl}
                          alt={p.nombre}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        /* Architectural Grid Placeholder matching LoginPage.jsx right panel */
                        <div className="relative flex h-full w-full flex-col items-center justify-center bg-[#0f172a] p-6 text-center">
                          <div
                            className="pointer-events-none absolute inset-0 bg-login-grid opacity-60"
                            aria-hidden="true"
                          />
                          <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border border-[#6366f1]/30 bg-[#6366f1]/15 text-[#a5b4fc] transition-transform duration-200 group-hover:scale-105">
                            <Package size={24} />
                          </div>
                          <span className="relative z-10 mt-2 text-[11px] font-medium text-[#64748b]">
                            {p.categoria || 'Especificación Técnica'}
                          </span>
                        </div>
                      )}

                      {/* Brand Pill */}
                      {p.marca && p.marca !== 'Sin marca' && (
                        <span className="absolute left-3 top-3 z-10 rounded-md border border-[#6366f1]/40 bg-[#0f172a]/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#a5b4fc] backdrop-blur-sm">
                          {p.marca}
                        </span>
                      )}

                      {/* Category Label */}
                      {p.categoria && (
                        <span className="absolute right-3 top-3 z-10 rounded-md border border-[#334155] bg-[#1e293b]/90 px-2 py-0.5 text-[10px] font-medium text-[#cbd5e1] backdrop-blur-sm">
                          {p.categoria}
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-base font-bold text-white capitalize leading-snug line-clamp-2">
                        {p.nombre}
                      </h3>

                      {p.descripcion && (
                        <p className="mt-1 text-xs text-[#94a3b8] line-clamp-1">{p.descripcion}</p>
                      )}

                      {/* Stock Availability: Strictly Warehouse Stock without mentioning Tienda/Almacén */}
                      <div className="mt-3 flex items-center">
                        {stockDisp > 0 ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>
                              Disponible: {stockDisp} {pres.unidad || 'unid.'}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#334155] bg-[#0f172a] px-2.5 py-0.5 text-[10px] font-medium text-[#94a3b8]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#64748b]" />
                            <span>Bajo pedido / Consultar</span>
                          </span>
                        )}
                      </div>

                      {/* Price and Action Section */}
                      <div className="mt-5 pt-3.5 border-t border-[#334155]/80 flex items-end justify-between">
                        <div>
                          <span className="block text-[10px] uppercase font-semibold tracking-wider text-[#94a3b8]">
                            Precio Unitario
                          </span>
                          <div className="text-xl font-extrabold text-white">
                            {pres.precio_venta > 0 ? (
                              <>
                                <span className="text-xs font-semibold text-[#a5b4fc] mr-1">
                                  Bs.
                                </span>
                                {formatCurrency(pres.precio_venta)}
                              </>
                            ) : (
                              <span className="text-xs font-semibold text-[#a5b4fc]">
                                A cotizar
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controller or Add Button */}
                        {inCartQty > 0 ? (
                          <div className="flex items-center rounded-lg border border-[#6366f1] bg-[#0f172a] overflow-hidden">
                            <button
                              onClick={() => updateQuantity(pres.id, -1)}
                              className="p-2 text-[#a5b4fc] hover:bg-[#6366f1]/20 hover:text-white transition-colors"
                              aria-label="Restar uno"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-white">{inCartQty}</span>
                            <button
                              onClick={() => updateQuantity(pres.id, 1)}
                              disabled={isMaxStock}
                              className={`p-2 text-[#a5b4fc] hover:bg-[#6366f1]/20 hover:text-white transition-colors ${
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
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#6366f1] px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-[#4f46e5] active:scale-95"
                          >
                            <Plus size={15} />
                            <span>Cotizar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button if filtered products exceed visibleCount */}
            {visibleCount < filteredProducts.length && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 16)}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#334155] bg-[#1e293b] px-6 py-3 text-sm font-semibold text-[#f8fafc] hover:border-[#6366f1] hover:text-[#a5b4fc] transition-colors shadow-sm"
                >
                  <ChevronDown size={18} />
                  <span>
                    Mostrar más productos ({visibleCount} de {filteredProducts.length})
                  </span>
                </button>
              </div>
            )}
          </>
        )}

        {/* Westlake-Style Industrial & B2B Supply Banner */}
        <div className="relative mt-16 overflow-hidden rounded-2xl border border-[#334155] bg-[#1e293b] p-8 lg:p-10">
          <div
            className="pointer-events-none absolute inset-0 bg-login-grid opacity-40"
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/15 px-3 py-1 text-xs font-semibold text-[#a5b4fc]">
                <Package size={14} />
                <span>Abastecimiento para Proyectos e Industria</span>
              </div>
              <h3 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                ¿Requieres volumen mayorista para obra, industria o taller?
              </h3>
              <p className="mt-2 text-sm text-[#94a3b8] leading-relaxed">
                Suministramos sistemas de resinas epóxicas, cerrajería de seguridad, brocas de
                cobalto y material eléctrico por volumen con atención preferencial para contratistas
                y empresas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={() => setIsCartOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6366f1] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#4f46e5]"
              >
                <ShoppingCart size={16} />
                <span>Revisar mi cotización ({totalCartItems})</span>
              </button>

              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
                  'Hola Alvarez Ferretería, necesito una cotización corporativa / por volumen para un proyecto.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#334155] bg-[#0f172a] px-5 py-3 text-sm font-semibold text-[#f8fafc] transition-colors hover:border-[#6366f1] hover:text-[#a5b4fc]"
              >
                <MessageCircle size={16} className="text-[#a5b4fc]" />
                <span>Contactar asesor técnico</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

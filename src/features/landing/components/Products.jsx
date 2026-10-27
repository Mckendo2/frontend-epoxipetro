import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Store,
  Warehouse,
  Package,
  Layers,
  ArrowRight,
  MessageCircle,
  ChevronDown,
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
  const [error, setError] = useState(null);

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
        // Aplanar los productos con su primera o única presentación
        const flattened = data
          .filter((p) => p.nombre && !p.nombre.includes('Nombre *')) // filtrar registros de prueba si existen
          .map((p) => {
            const pres = p.presentaciones?.[0] || {
              id: `p-${p.id}`,
              nombre: 'Unidad',
              precio_venta: 0,
              stock_tienda: 0,
              stock_almacen: 0,
              stock_total: 0,
            };

            const stockTienda = Number(pres.stock_tienda || 0);
            const stockAlmacen = Number(pres.stock_almacen || 0);
            const totalStock = pres.stock_total ?? (stockTienda + stockAlmacen);

            return {
              ...p,
              presentation: {
                ...pres,
                stock_tienda: stockTienda,
                stock_almacen: stockAlmacen,
                stock_total: totalStock,
              },
              totalStock,
            };
          });

        setProducts(flattened);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error cargando catálogo:', err);
        setError('No se pudo sincronizar el inventario');
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

  return (
    <section id="productos" className="scroll-mt-20 bg-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-edge bg-raised px-3 py-1 text-xs font-semibold text-brass">
              <Layers size={14} />
              <span>Inventario en tiempo real sincronizado ({products.length} artículos)</span>
            </div>
            <h2
              className="mt-3 text-3xl font-extrabold tracking-tight text-body sm:text-4xl lg:text-5xl"
              style={{ textWrap: 'balance' }}
            >
              Materiales disponibles en Tienda y Almacén
            </h2>
            <p className="mt-3 max-w-2xl text-base text-muted" style={{ textWrap: 'pretty' }}>
              Explora cerraduras, resinas y accesorios con stock real. Suma lo que necesitas a tu
              cotización y recíbelo coordinado por WhatsApp.
            </p>
          </div>

          {/* Quick Cart summary button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="self-start md:self-auto inline-flex items-center gap-2.5 rounded-lg border border-brass/40 bg-panel px-4 py-2.5 text-sm font-semibold text-brass transition-all hover:border-brass hover:bg-raised"
          >
            <ShoppingCart size={18} />
            <span>Ver mi cotización</span>
            {cart.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brass text-[11px] font-bold text-canvas">
                {cart.reduce((a, b) => a + b.cantidad, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-10 rounded-2xl border border-edge bg-panel p-4 lg:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="Buscar por nombre (ej. Yale, 3 golpes, broca), marca o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-edge bg-canvas pl-10 pr-4 py-2.5 text-sm text-body placeholder:text-muted/60 focus:border-brass focus:outline-none transition-colors"
              />
            </div>

            {/* Checkbox: Only with stock */}
            <label className="flex items-center gap-2.5 text-xs font-medium text-body cursor-pointer select-none self-start lg:self-auto">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="h-4 w-4 rounded border-edge bg-canvas text-brass accent-brass focus:ring-brass"
              />
              <span>Mostrar solo con stock disponible</span>
            </label>
          </div>

          {/* Categories Pill Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-edge/60">
            <span className="text-xs font-semibold text-muted mr-1">Rubros:</span>
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brass text-canvas shadow-sm shadow-brass/20'
                      : 'border border-edge bg-canvas text-muted hover:border-brass/30 hover:text-body'
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
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-80 animate-pulse rounded-xl border border-edge bg-panel/60 p-5"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-12 rounded-xl border border-edge bg-panel py-16 text-center">
            <Package size={40} className="mx-auto text-muted/60" />
            <h3 className="mt-3 text-base font-semibold text-body">
              No se encontraron materiales con esos filtros
            </h3>
            <p className="mt-1 text-xs text-muted">
              Prueba cambiando la búsqueda o seleccionando otro rubro.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todos');
                setOnlyInStock(false);
              }}
              className="mt-4 rounded border border-edge bg-raised px-4 py-2 text-xs font-semibold text-brass hover:border-brass"
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
                const isMaxStock = pres.stock_total > 0 && inCartQty >= pres.stock_total;
                const imgUrl = getProductImageUrl(p.imagen_url, p.categoria);

                return (
                  <div
                    key={p.id}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border transition-all duration-200 ${
                      inCartQty > 0
                        ? 'border-brass/80 bg-raised/70 shadow-lg shadow-brass/5'
                        : 'border-edge bg-panel hover:border-edge/80 hover:bg-panel/90'
                    }`}
                  >
                    {/* Top image container */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-canvas">
                      <img
                        src={imgUrl}
                        alt={p.nombre}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = '/landing/insumos.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent opacity-80" />

                      {/* Brand Pill */}
                      {p.marca && (
                        <span className="absolute left-3 top-3 rounded bg-canvas/90 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-brass backdrop-blur-sm border border-edge">
                          {p.marca}
                        </span>
                      )}

                      {/* Category Label */}
                      {p.categoria && (
                        <span className="absolute right-3 top-3 rounded bg-panel/90 px-2 py-0.5 text-[10px] font-medium text-muted backdrop-blur-sm">
                          {p.categoria}
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-base font-bold text-body capitalize leading-snug line-clamp-2">
                        {p.nombre}
                      </h3>

                      {p.descripcion && (
                        <p className="mt-1 text-xs text-muted line-clamp-1">{p.descripcion}</p>
                      )}

                      {/* Stock Availability Dual Badges */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {pres.stock_tienda > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 border border-emerald-700/50 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                            <Store size={12} className="text-emerald-400" />
                            <span>Tienda: {pres.stock_tienda}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-panel border border-edge px-1.5 py-0.5 text-[10px] text-muted">
                            Sin stock en tienda
                          </span>
                        )}

                        {pres.stock_almacen > 0 && (
                          <span className="inline-flex items-center gap-1 rounded bg-blue-950/60 border border-blue-700/50 px-2 py-0.5 text-[11px] font-medium text-blue-300">
                            <Warehouse size={12} className="text-blue-400" />
                            <span>Almacén: {pres.stock_almacen}</span>
                          </span>
                        )}
                      </div>

                      {/* Price and Action Section */}
                      <div className="mt-5 pt-3 border-t border-edge/60 flex items-end justify-between">
                        <div>
                          <span className="block text-[10px] uppercase font-semibold text-muted">
                            Precio Venta
                          </span>
                          <div className="text-xl font-extrabold text-brass">
                            {pres.precio_venta > 0 ? (
                              <>Bs. {formatCurrency(pres.precio_venta)}</>
                            ) : (
                              <span className="text-xs text-muted">A cotizar</span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controller or Add Button */}
                        {inCartQty > 0 ? (
                          <div className="flex items-center rounded-lg border border-brass bg-canvas overflow-hidden">
                            <button
                              onClick={() => updateQuantity(pres.id, -1)}
                              className="p-2 text-brass hover:bg-brass/20 transition-colors"
                              aria-label="Restar uno"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-2 text-xs font-bold text-body">{inCartQty}</span>
                            <button
                              onClick={() => updateQuantity(pres.id, 1)}
                              disabled={isMaxStock}
                              className={`p-2 text-brass hover:bg-brass/20 transition-colors ${
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
                            className="inline-flex items-center gap-1.5 rounded-lg bg-brass px-3.5 py-2 text-xs font-semibold text-canvas transition-colors hover:bg-brass-light active:scale-95"
                          >
                            <Plus size={15} />
                            <span>Agregar</span>
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
                  className="inline-flex items-center gap-2 rounded-lg border border-edge bg-panel px-6 py-3 text-sm font-semibold text-body hover:border-brass hover:text-brass transition-colors shadow-sm"
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

        {/* Almacén & Mayorista Capability Banner */}
        <div className="mt-16 rounded-2xl border border-edge bg-gradient-to-r from-panel via-raised to-panel p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-brass text-sm font-bold uppercase tracking-wider">
                <Warehouse size={18} />
                <span>Capacidad de Almacén Central Alvarez</span>
              </div>
              <h3 className="mt-2 text-2xl font-bold text-body sm:text-3xl">
                ¿Abasteces una obra, taller de carpintería o cerrajería?
              </h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                Disponemos de stock por volumen de cerraduras de seguridad, candados blindados,
                resinas epóxicas, brocas y placas eléctricas listas para despacho directo a obra con
                precios mayoristas y factura.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={() => setIsCartOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brass px-5 py-3 text-sm font-semibold text-canvas transition-colors hover:bg-brass-light"
              >
                <ShoppingCart size={16} />
                <span>Ver y cotizar materiales ({cart.length})</span>
              </button>

              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
                  'Hola Alvarez Ferretería, necesito una cotización por mayor para abastecer una obra/proyecto.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-edge bg-canvas px-5 py-3 text-sm font-semibold text-body transition-colors hover:border-brass hover:text-brass"
              >
                <MessageCircle size={16} />
                <span>Hablar con un asesor</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

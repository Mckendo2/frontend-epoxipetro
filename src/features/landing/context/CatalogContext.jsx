import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getApiBaseUrl } from '../../../config/api';
import { FAMILIES, getFamilyId, normalizeText } from '../data/families';

const CatalogContext = createContext(null);

const EMPTY_FILTERS = { q: '', family: 'todos', category: '', onlyAvailable: false };
const VALID_FAMILIES = new Set(['todos', ...FAMILIES.map((f) => f.id)]);

const clean = (value) => String(value || '').trim();

/** Solo se expone lo disponible en almacén; nunca valores negativos. */
const stockOf = (pres) => Math.max(0, Number(pres?.stock_almacen ?? pres?.stock_total ?? 0) || 0);

function pickPresentation(list) {
  return (
    list.find((x) => Number(x.precio_venta) > 0 && stockOf(x) > 0) ||
    list.find((x) => Number(x.precio_venta) > 0) ||
    list[0] || { id: null, nombre: 'Unidad', precio_venta: 0 }
  );
}

function normalizeProduct(p) {
  const pres = pickPresentation(p.presentaciones || []);
  const stock = stockOf(pres);
  const nombre = clean(p.nombre);
  const marca = clean(p.marca);
  const categoria = clean(p.categoria);

  return {
    id: p.id,
    nombre,
    marca: marca && marca.toLowerCase() !== 'sin marca' ? marca : '',
    categoria,
    familia: getFamilyId(categoria),
    imagen_url: p.imagen_url || null,
    stock,
    presentation: {
      ...pres,
      id: pres.id ?? `p-${p.id}`,
      stock_almacen: stock,
      stock_disponible: stock,
    },
    searchText: normalizeText(
      `${nombre} ${marca} ${categoria} ${pres.codigo_barras || ''} ${pres.sku || ''}`
    ),
  };
}

const byAvailabilityThenName = (a, b) => {
  if (a.stock > 0 !== b.stock > 0) return a.stock > 0 ? -1 : 1;
  return a.nombre.localeCompare(b.nombre, 'es', { numeric: true });
};

function readFiltersFromUrl() {
  if (typeof window === 'undefined') return EMPTY_FILTERS;
  const params = new URLSearchParams(window.location.search);
  const family = params.get('f') || 'todos';
  return {
    q: params.get('q') || '',
    family: VALID_FAMILIES.has(family) ? family : 'todos',
    category: params.get('c') || '',
    onlyAvailable: params.get('d') === '1',
  };
}

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');
  const [filters, setFiltersState] = useState(readFiltersFromUrl);

  const load = useCallback((signal) => {
    fetch(`${getApiBaseUrl()}/api/public/catalogo`, { signal })
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar el catálogo');
        return res.json();
      })
      .then((data) => {
        const list = data
          .filter((p) => p.nombre && !p.nombre.includes('Nombre *'))
          .map(normalizeProduct)
          .sort(byAvailabilityThenName);
        setProducts(list);
        setStatus('ready');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Error cargando catálogo:', err);
        setStatus('error');
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  // Filtros reflejados en la URL: se pueden compartir y funcionan con "atrás".
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.family !== 'todos') params.set('f', filters.family);
    if (filters.category) params.set('c', filters.category);
    if (filters.onlyAvailable) params.set('d', '1');
    const qs = params.toString();
    const url = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', url);
  }, [filters]);

  const setFilters = useCallback((patch) => {
    setFiltersState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => setFiltersState(EMPTY_FILTERS), []);

  const stats = useMemo(() => {
    const families = Object.fromEntries(FAMILIES.map((f) => [f.id, 0]));
    const categories = new Map(); // categoria -> { familia, count }
    const brandCount = new Map();
    let hasImages = false;

    for (const p of products) {
      families[p.familia] += 1;
      if (p.imagen_url) hasImages = true;
      if (p.categoria) {
        const entry = categories.get(p.categoria) || { familia: p.familia, count: 0 };
        entry.count += 1;
        categories.set(p.categoria, entry);
      }
      if (p.marca) brandCount.set(p.marca, (brandCount.get(p.marca) || 0) + 1);
    }

    const brands = [...brandCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);

    return { families, categories, brands, hasImages };
  }, [products]);

  const value = useMemo(
    () => ({
      products,
      loading: status === 'loading',
      error: status === 'error',
      reload: () => {
        setStatus('loading');
        load();
      },
      filters,
      setFilters,
      resetFilters,
      stats,
    }),
    [products, status, filters, setFilters, resetFilters, stats, load]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog debe usarse dentro de CatalogProvider');
  return ctx;
}

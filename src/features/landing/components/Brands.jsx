import { useCatalog } from '../context/CatalogContext';

export default function Brands() {
  const { stats, loading } = useCatalog();

  if (loading || stats.brands.length === 0) return null;

  return (
    <div className="border-b border-rule bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-x-10 gap-y-3 px-5 py-5 lg:flex-row lg:items-baseline lg:px-8">
        <p className="shrink-0 text-sm text-slate-600">Marcas que manejamos</p>
        <ul className="flex flex-wrap gap-x-8 gap-y-1" translate="no">
          {stats.brands.map((brand) => (
            <li key={brand} className="font-display text-xl font-semibold text-ink">
              {brand}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

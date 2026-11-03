import { useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { FAMILIES } from '../data/families';
import { useCatalog } from '../context/CatalogContext';

export default function Hero() {
  const { products, loading, stats, filters, setFilters, selectCategoryAndScroll } = useCatalog();
  const [query, setQuery] = useState(filters.q);

  const onSearch = (e) => {
    e.preventDefault();
    setFilters({ q: query.trim(), category: '' });
    document.getElementById('catalogo-categoria')?.scrollIntoView({ behavior: 'smooth' });
  };

  const openFamily = (id) => {
    setQuery('');
    selectCategoryAndScroll(id);
  };

  return (
    <section className="relative overflow-hidden bg-ink pt-16">
      {/* Fondo de resina desenfocado sin píxeles visibles + destellos vectoriales nítidos */}
      <img
        src="/landing/hero-resina.jpg"
        alt=""
        width={626}
        height={352}
        fetchPriority="high"
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover blur-[22px] saturate-125"
      />
      <img
        src="/landing/hero-particulas.svg"
        alt=""
        width={1600}
        height={900}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/30"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/70 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-14 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="min-w-0 lg:col-span-7">
          <h1
            className="font-display text-[clamp(3.25rem,9vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.01em] text-white"
            style={{ textWrap: 'balance' }}
          >
            Ferretería, cerrajería y resinas epóxicas.
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-slate-200">
            Mira lo que hay en almacén, elige una categoría y cotiza tu lista por WhatsApp.
          </p>

          <form onSubmit={onSearch} role="search" className="mt-9 flex max-w-xl">
            <label htmlFor="hero-search" className="sr-only">
              Buscar productos
            </label>
            <div className="relative flex-1">
              <Search
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="hero-search"
                name="q"
                type="search"
                autoComplete="off"
                spellCheck={false}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Candado Yale, broca 3 mm, resina 2:1…"
                className="h-13 w-full rounded-l-md border border-line bg-ink-soft/90 pl-11 pr-4 text-base text-white placeholder:text-slate-400 focus:border-[#6366f1]"
              />
            </div>
            <button
              type="submit"
              className="h-13 rounded-r-md bg-[#6366f1] px-6 text-base font-semibold text-white transition-colors hover:bg-[#4f46e5]"
            >
              Buscar
            </button>
          </form>
        </div>

        <div className="min-w-0 lg:col-span-5 lg:pt-2">
          <h2 className="sr-only">Categorías de productos</h2>
          <ul className="border-t border-white/15">
            {FAMILIES.map((family) => (
              <li key={family.id} className="border-b border-white/15">
                <button
                  type="button"
                  onClick={() => openFamily(family.id)}
                  className="group flex w-full items-center justify-between gap-4 py-3.5 text-left transition-colors hover:bg-white/5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[1.6rem] font-semibold leading-none text-white">
                      {family.shortName}
                    </span>
                    <span className="mt-1 line-clamp-1 text-xs text-slate-300">
                      {family.blurb}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="font-display text-3xl font-medium tabular-nums text-[#a5b4fc]">
                      {loading ? '–' : stats.families[family.id]}
                    </span>
                    <ArrowRight
                      size={18}
                      aria-hidden="true"
                      className="text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white"
                    />
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3.5 text-xs text-slate-300">
            {loading ? 'Cargando catálogo…' : `${products.length} productos en catálogo.`}
          </p>
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { FAMILIES } from '../data/families';
import { useCatalog } from '../context/CatalogContext';

const goToProducts = () => {
  document.querySelector('#productos')?.scrollIntoView({ behavior: 'smooth' });
};

export default function Hero() {
  const { products, loading, stats, filters, setFilters } = useCatalog();
  const [query, setQuery] = useState(filters.q);

  const onSearch = (e) => {
    e.preventDefault();
    setFilters({ q: query.trim(), family: 'todos', category: '' });
    goToProducts();
  };

  const openFamily = (id) => {
    setFilters({ q: '', family: id, category: '' });
    setQuery('');
    goToProducts();
  };

  return (
    <section className="relative overflow-hidden bg-ink pt-16">
      <div className="bg-login-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-14 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="lg:col-span-7">
          <h1
            className="font-display text-[clamp(3.25rem,9vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.01em] text-white"
            style={{ textWrap: 'balance' }}
          >
            Ferretería, cerrajería y resinas epóxicas.
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-slate-300">
            Mira lo que hay en almacén, arma tu lista y cotiza por WhatsApp.
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
                className="h-13 w-full rounded-l-md border border-line bg-ink-soft pl-11 pr-4 text-base text-white placeholder:text-slate-500 focus:border-[#6366f1]"
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

        <div className="lg:col-span-5 lg:pt-3">
          <h2 className="sr-only">Familias de productos</h2>
          <ul className="border-t border-line">
            {FAMILIES.map((family) => (
              <li key={family.id} className="border-b border-line">
                <button
                  type="button"
                  onClick={() => openFamily(family.id)}
                  className="group flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:bg-ink-soft/70"
                >
                  <span className="min-w-0">
                    <span className="block font-display text-[1.75rem] font-semibold leading-none text-white">
                      {family.name}
                    </span>
                    <span className="mt-1.5 block text-sm text-slate-400">{family.blurb}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="font-display text-3xl font-medium tabular-nums text-[#a5b4fc]">
                      {loading ? '–' : stats.families[family.id]}
                    </span>
                    <ArrowRight
                      size={18}
                      aria-hidden="true"
                      className="text-slate-500 transition-colors group-hover:text-white"
                    />
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-slate-400">
            {loading ? 'Cargando catálogo…' : `${products.length} productos en el catálogo.`}
          </p>
        </div>
      </div>
    </section>
  );
}

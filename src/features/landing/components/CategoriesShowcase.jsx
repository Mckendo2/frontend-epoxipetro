import { ArrowDownRight, Layers } from 'lucide-react';
import { FAMILIES } from '../data/families';
import { useCatalog } from '../context/CatalogContext';

export default function CategoriesShowcase() {
  const { loading, stats, filters, selectCategoryAndScroll } = useCatalog();

  return (
    <section id="productos" className="scroll-mt-16 bg-ink py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Encabezado de sección */}
        <div className="flex flex-col justify-between gap-4 border-b border-line pb-8 md:flex-row md:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#38bdf8]">
              <Layers size={14} aria-hidden="true" />
              <span>Líneas de producto</span>
            </p>
            <h2
              className="mt-2 font-display text-5xl font-semibold leading-none text-white sm:text-6xl"
              style={{ textWrap: 'balance' }}
            >
              Explora por categoría
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-slate-300">
            Selecciona una línea para ver únicamente sus productos, filtrar por subcategoría y
            armar tu cotización.
          </p>
        </div>

        {/* Grilla interactiva de categorías con imagen y animación */}
        <div className="mt-10 grid gap-6 md:grid-cols-6">
          {FAMILIES.map((family, index) => {
            const count = stats.families[family.id] || 0;
            const subcats = (stats.familySubcategories?.[family.id] || []).slice(0, 4);
            const isSelected = filters.family === family.id && !filters.q;
            // Las 2 primeras categorías ocupan 3 columnas cada una; las 3 siguientes ocupan 2 columnas cada una
            const colSpan = index < 2 ? 'md:col-span-3' : 'md:col-span-2';

            return (
              <button
                key={family.id}
                type="button"
                onClick={() => selectCategoryAndScroll(family.id)}
                className={`group relative flex min-h-[320px] flex-col justify-between overflow-hidden rounded-xl border text-left transition-transform duration-300 ease-out hover:-translate-y-1.5 ${colSpan} ${
                  isSelected
                    ? 'border-[#38bdf8] ring-2 ring-[#38bdf8]/40'
                    : 'border-line hover:border-slate-400'
                }`}
              >
                {/* Imagen de fondo con zoom suave al pasar el mouse */}
                <img
                  src={family.image}
                  alt=""
                  width={640}
                  height={480}
                  loading="lazy"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />

                {/* Velo oscuro graduado que se intensifica o aclara con el hover */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#090f1d] via-[#0f172a]/80 to-[#0f172a]/35 transition-opacity duration-300 group-hover:via-[#0f172a]/70"
                  aria-hidden="true"
                />

                {/* Brillo superior del color de la categoría */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-1 opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ backgroundColor: family.accent }}
                  aria-hidden="true"
                />

                {/* Fila superior: Contador de productos y estado */}
                <div className="relative z-10 flex w-full items-center justify-between gap-2 p-6">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#0f172a]/85 px-3 py-1 text-xs font-semibold tabular-nums text-white backdrop-blur-sm"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: family.accent }}
                      aria-hidden="true"
                    />
                    {loading ? 'Cargando…' : `${count} productos`}
                  </span>

                  {isSelected && (
                    <span className="rounded-full bg-[#38bdf8] px-3 py-1 text-[11px] font-bold text-[#0f172a]">
                      Viendo ahora
                    </span>
                  )}
                </div>

                {/* Contenido inferior */}
                <div className="relative z-10 p-6 pt-12">
                  <h3 className="font-display text-3xl font-semibold leading-none text-white sm:text-4xl">
                    {family.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-200">
                    {family.blurb}
                  </p>

                  {/* Subcategorías reales de la base de datos */}
                  {subcats.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {subcats.map((sub) => (
                        <span
                          key={sub.name}
                          className="rounded border border-white/15 bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-100 backdrop-blur-xs transition-colors group-hover:border-white/30 group-hover:bg-white/15"
                        >
                          {sub.name} ({sub.count})
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Barra de acción animada al pasar el mouse */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-3.5 text-xs font-semibold text-white">
                    <span className="transition-colors group-hover:text-[#7dd3fc]">
                      Ver productos de {family.shortName.toLowerCase()}
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-0.5 group-hover:bg-[#38bdf8] group-hover:text-[#0f172a]">
                      <ArrowDownRight size={16} aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}


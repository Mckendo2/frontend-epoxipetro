import { MessageCircle } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import { siteConfig } from '../data/siteConfig';

const RESINS = [
  { category: 'Resina Epoxica 1:1', ratio: '1:1', detail: '1 parte de resina por 1 de endurecedor' },
  { category: 'Resina Epoxica 2:1', ratio: '2:1', detail: '2 partes de resina por 1 de endurecedor' },
  { category: 'Resina Epoxica 3:1', ratio: '3:1', detail: '3 partes de resina por 1 de endurecedor' },
  { category: 'Resina UV', ratio: 'UV', detail: 'Se endurece con luz UV, sin mezcla' },
];

export default function ResinGuide() {
  const { stats, loading, selectCategoryAndScroll } = useCatalog();

  const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    'Hola, quiero que me ayuden a elegir una resina epóxica para mi proyecto.'
  )}`;

  const show = (category) => {
    selectCategoryAndScroll('resinas', category);
  };

  return (
    <section id="resinas" className="scroll-mt-16 border-y border-rule bg-white py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="lg:col-span-5">
          <h2
            className="font-display text-5xl font-semibold leading-none text-ink sm:text-6xl"
            style={{ textWrap: 'balance' }}
          >
            Resinas epóxicas por proporción
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600">
            La proporción indica cuántas partes de resina se mezclan con el endurecedor. Si no
            sabes cuál necesitas, cuéntanos tu proyecto y te orientamos.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-md border border-slate-400 px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-action hover:text-action"
          >
            <MessageCircle size={17} aria-hidden="true" />
            Consultar por WhatsApp
          </a>
        </div>

        <div className="lg:col-span-7">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Resinas disponibles según su proporción de mezcla</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Proporción</th>
                <th scope="col">Descripción</th>
                <th scope="col">Productos</th>
              </tr>
            </thead>
            <tbody>
              {RESINS.map((row) => {
                const count = stats.categories.get(row.category)?.count ?? 0;
                return (
                  <tr key={row.category} className="border-t border-rule last:border-b">
                    <th scope="row" className="w-24 py-4 pr-4 align-middle">
                      <span className="font-display text-5xl font-semibold leading-none text-action">
                        {row.ratio}
                      </span>
                    </th>
                    <td className="py-4 pr-4 align-middle text-sm leading-snug text-slate-700">
                      {row.detail}
                    </td>
                    <td className="py-4 text-right align-middle">
                      <button
                        type="button"
                        onClick={() => show(row.category)}
                        disabled={loading || count === 0}
                        className="rounded-md border border-slate-400 px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-action hover:text-action disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Ver {loading ? '' : count} {count === 1 ? 'producto' : 'productos'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="mt-5 text-sm text-slate-600">
            También tenemos{' '}
            <button
              type="button"
              onClick={() => show('')}
              className="font-semibold text-action underline underline-offset-2 hover:text-action-hover"
            >
              pigmentos, micas y tintes
            </button>{' '}
            para dar color a tus piezas.
          </p>
        </div>
      </div>
    </section>
  );
}

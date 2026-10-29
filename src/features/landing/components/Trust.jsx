import { siteConfig } from '../data/siteConfig';

export default function Trust() {
  return (
    <section className="border-y border-[#334155] bg-[#1e293b] py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#94a3b8]">
            Marcas disponibles
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {siteConfig.brands.map((brand) => (
              <span
                key={brand}
                className="rounded-full border border-[#334155] bg-[#0f172a] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#cbd5e1]"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

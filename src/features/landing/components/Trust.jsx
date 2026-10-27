import { siteConfig } from '../data/siteConfig';

export default function Trust() {
  return (
    <section className="border-y border-edge bg-panel py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="mb-6 text-center text-sm font-medium text-muted">
          Trabajamos con marcas reconocidas
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {siteConfig.brands.map((brand) => (
            <span
              key={brand}
              className="text-lg font-semibold tracking-wide text-body/60"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

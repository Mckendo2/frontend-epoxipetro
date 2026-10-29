import { ShieldCheck, Layers, Award, CheckCircle2 } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

const pillars = [
  {
    Icon: Layers,
    label: 'Catálogo Conectado',
    detail: 'Disponibilidad y precios actualizados en vivo',
  },
  {
    Icon: Award,
    label: 'Marcas Homologadas',
    detail: 'Calidad industrial y respaldo garantizado',
  },
  {
    Icon: ShieldCheck,
    label: 'Suministro Confiable',
    detail: 'Atención a contratistas, talleres y particulares',
  },
  {
    Icon: CheckCircle2,
    label: 'Cotización Ágil',
    detail: 'Presupuesto formal sin tiempos de espera',
  },
];

export default function Trust() {
  return (
    <section className="border-y border-[#334155] bg-[#1e293b]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Westlake-style Corporate Pillars Strip */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 pb-8 border-b border-[#334155]/80">
          {pillars.map((item) => (
            <div key={item.label} className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#6366f1]/30 bg-[#6366f1]/15 text-[#a5b4fc]">
                <item.Icon size={19} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{item.label}</h3>
                <p className="mt-0.5 text-xs text-[#94a3b8]">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Certified Brands Row */}
        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#94a3b8]">
            Marcas y líneas que respaldan nuestro catálogo:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {siteConfig.brands.map((brand) => (
              <span
                key={brand}
                className="rounded-full border border-[#334155] bg-[#0f172a] px-4 py-1.5 text-xs font-bold tracking-wider uppercase text-[#cbd5e1] transition-colors hover:border-[#6366f1]/50 hover:text-[#a5b4fc]"
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

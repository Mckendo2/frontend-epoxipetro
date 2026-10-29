import {
  MessageCircle,
  ArrowRight,
  Layers,
  ShieldCheck,
  Droplets,
  Wrench,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

const coreLines = [
  {
    id: 'epoxicos',
    tag: 'Sistemas Químicos',
    title: 'Resinas Epóxicas y Recubrimientos',
    desc: 'Sistemas de alta transparencia y resistencia para pisos industriales, encapsulados, recubrimientos protectores y proyectos técnicos.',
    Icon: Droplets,
  },
  {
    id: 'cerrajeria',
    tag: 'Seguridad Arquitectónica',
    title: 'Cerrajería y Control de Acceso',
    desc: 'Chapas de 2 y 3 golpes, cerrojos blindados, candados de seguridad y herrajes de marcas líderes certificadas.',
    Icon: ShieldCheck,
  },
  {
    id: 'herramientas',
    tag: 'Precisión Industrial',
    title: 'Brocas Cobalto e Insumos de Taller',
    desc: 'Brocas de cobalto de alta precisión, accesorios de perforación, fijaciones e insumos de alto desempeño.',
    Icon: Wrench,
  },
  {
    id: 'electricos',
    tag: 'Infraestructura',
    title: 'Material Eléctrico y Componentes',
    desc: 'Placas simples y dobles, interruptores, accesorios de canalización e insumos confiables para obra civil.',
    Icon: Zap,
  },
];

export default function Hero() {
  const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    siteConfig.whatsappGreeting
  )}`;

  const scrollToProducts = (e) => {
    e.preventDefault();
    const el = document.querySelector('#productos');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-[#0f172a] pt-28 pb-16 lg:pt-36 lg:pb-24">
      {/* Exact LoginPage.jsx 40x40 Architectural Grid Background */}
      <div className="pointer-events-none absolute inset-0 bg-login-grid opacity-80" aria-hidden="true" />

      {/* Subtle Floating 40x40 Grid Squares (from LoginPage.jsx right panel) */}
      <div
        className="pointer-events-none absolute top-[18%] left-[12%] hidden h-10 w-10 bg-white/[0.04] lg:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-[28%] right-[18%] hidden h-10 w-10 bg-[#6366f1]/[0.08] lg:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[22%] left-[38%] hidden h-10 w-10 bg-white/[0.04] lg:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[15%] right-[30%] hidden h-10 w-10 bg-[#a855f7]/[0.07] lg:block"
        aria-hidden="true"
      />

      {/* Ambient Indigo/Purple Radial Glow */}
      <div
        className="pointer-events-none absolute -top-24 right-1/4 h-[480px] w-[480px] rounded-full bg-[#6366f1]/15 blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-10 h-[360px] w-[360px] rounded-full bg-[#a855f7]/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-12">
          {/* Left Column: Corporate Value Proposition (Westlake Epoxy style + LoginPage palette) */}
          <div className="lg:col-span-7">
            {/* Pill Tags matching LoginPage.jsx */}
            <div className="flex flex-wrap items-center gap-2">
              {['Resinas Epóxicas', 'Cerrajería Industrial', 'Insumos Técnicos'].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-[#6366f1]/30 bg-[#6366f1]/15 px-3.5 py-1 text-xs font-semibold text-[#a5b4fc]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1
              className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.35rem]"
              style={{ textWrap: 'balance' }}
            >
              Materiales de alto desempeño que impulsan cada proyecto.
            </h1>

            <p
              className="mt-6 max-w-2xl text-base leading-relaxed text-[#94a3b8] sm:text-lg"
              style={{ textWrap: 'pretty' }}
            >
              Suministro especializado en sistemas epóxicos, cerrajería de seguridad, herramientas
              de precisión y material eléctrico. Consulta stock real en línea, arma tu cotización al
              instante y coordina tu pedido de forma directa.
            </p>

            {/* Primary & Secondary CTAs matching LoginPage.jsx buttons */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#productos"
                onClick={scrollToProducts}
                className="inline-flex items-center gap-2.5 rounded-lg bg-[#6366f1] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#4f46e5] shadow-lg shadow-[#6366f1]/25"
              >
                <Layers size={18} />
                <span>Explorar Catálogo en Stock</span>
                <ArrowRight size={16} />
              </a>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-lg border border-[#334155] bg-[#1e293b] px-6 py-3.5 text-sm font-semibold text-[#f8fafc] transition-colors hover:border-[#6366f1] hover:bg-[#1e293b]/80"
              >
                <MessageCircle size={17} className="text-[#a5b4fc]" />
                <span>Cotización Directa por WhatsApp</span>
              </a>
            </div>

            {/* Key Corporate Highlights Row */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-[#334155] pt-8">
              <div>
                <p className="text-2xl font-extrabold text-white sm:text-3xl">100%</p>
                <p className="mt-1 text-xs font-medium text-[#94a3b8]">
                  Stock sincronizado con nuestro inventario real
                </p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#a5b4fc] sm:text-3xl">B2B &amp; B2C</p>
                <p className="mt-1 text-xs font-medium text-[#94a3b8]">
                  Abastecimiento por mayor para obras y venta al detalle
                </p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white sm:text-3xl">Directo</p>
                <p className="mt-1 text-xs font-medium text-[#94a3b8]">
                  Presupuestos formales al instante vía WhatsApp
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Westlake-Style "What We Do Best" Technical Lines Showcase */}
          <div id="soluciones" className="scroll-mt-28 lg:col-span-5">
            <div className="rounded-2xl border border-[#334155] bg-[#1e293b]/90 p-6 shadow-2xl backdrop-blur-sm sm:p-7">
              <div className="flex items-center justify-between border-b border-[#334155] pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#a5b4fc]">
                    Nuestras Divisiones
                  </span>
                  <h2 className="mt-0.5 text-lg font-bold text-white">
                    Soluciones por Aplicación
                  </h2>
                </div>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)',
                  }}
                >
                  A
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {coreLines.map((item) => (
                  <a
                    key={item.id}
                    href="#productos"
                    onClick={scrollToProducts}
                    className="group flex items-start gap-4 rounded-xl border border-[#334155]/80 bg-[#0f172a]/70 p-4 transition-all hover:border-[#6366f1]/60 hover:bg-[#0f172a]"
                  >
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#6366f1]/30 bg-[#6366f1]/15 text-[#a5b4fc] transition-colors group-hover:bg-[#6366f1] group-hover:text-white">
                      <item.Icon size={19} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6366f1]">
                          {item.tag}
                        </span>
                        <ChevronRight
                          size={15}
                          className="text-[#64748b] transition-transform group-hover:translate-x-0.5 group-hover:text-[#a5b4fc]"
                        />
                      </div>
                      <h3 className="mt-0.5 text-sm font-bold text-white group-hover:text-[#a5b4fc] transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#94a3b8] line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

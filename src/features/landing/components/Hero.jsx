import { MessageCircle, ArrowRight, Droplets, ShieldCheck, Wrench, Zap } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

const highlights = [
  {
    title: 'Resinas Epóxicas',
    subtitle: 'Pisos, recubrimientos y encapsulados',
    Icon: Droplets,
  },
  {
    title: 'Cerrajería',
    subtitle: 'Chapas, cerrojos y candados',
    Icon: ShieldCheck,
  },
  {
    title: 'Herramientas',
    subtitle: 'Brocas de cobalto y accesorios',
    Icon: Wrench,
  },
  {
    title: 'Eléctricos',
    subtitle: 'Placas, interruptores e insumos',
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
    <section className="relative flex min-h-[88vh] items-center overflow-hidden bg-[#0f172a] pt-24 pb-16 lg:pt-28 lg:pb-20">
      {/* LoginPage.jsx 40x40 Architectural Grid */}
      <div className="pointer-events-none absolute inset-0 bg-login-grid opacity-80" aria-hidden="true" />

      {/* Subtle Floating Grid Squares from LoginPage.jsx */}
      <div
        className="pointer-events-none absolute top-[22%] left-[15%] hidden h-10 w-10 bg-white/[0.04] lg:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-[32%] right-[22%] hidden h-10 w-10 bg-[#6366f1]/[0.08] lg:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[24%] left-[42%] hidden h-10 w-10 bg-white/[0.04] lg:block"
        aria-hidden="true"
      />

      {/* Ambient Glow */}
      <div
        className="pointer-events-none absolute -top-24 right-1/4 h-[420px] w-[420px] rounded-full bg-[#6366f1]/15 blur-[130px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Clean, concise copy */}
          <div className="lg:col-span-7">
            <div className="flex flex-wrap gap-2">
              {['Resinas Epóxicas', 'Cerrajería', 'Ferretería'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#6366f1]/30 bg-[#6366f1]/15 px-3.5 py-1 text-xs font-semibold text-[#a5b4fc]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1
              className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
              style={{ textWrap: 'balance' }}
            >
              Soluciones resistentes para cada proyecto.
            </h1>

            <p
              className="mt-5 max-w-xl text-base leading-relaxed text-[#94a3b8] sm:text-lg"
              style={{ textWrap: 'pretty' }}
            >
              Resinas epóxicas, cerraduras de seguridad, brocas y material eléctrico. Consulta
              disponibilidad en tiempo real y cotiza en segundos.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#productos"
                onClick={scrollToProducts}
                className="inline-flex items-center gap-2 rounded-lg bg-[#6366f1] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#6366f1]/25 transition-all hover:bg-[#4f46e5]"
              >
                <span>Ver Productos</span>
                <ArrowRight size={17} />
              </a>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#334155] bg-[#1e293b] px-6 py-3.5 text-sm font-semibold text-[#f8fafc] transition-colors hover:border-[#6366f1]"
              >
                <MessageCircle size={17} className="text-[#a5b4fc]" />
                <span>WhatsApp Directo</span>
              </a>
            </div>
          </div>

          {/* Right Column: Clean 2x2 Visual Grid */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-4">
              {highlights.map((item) => (
                <a
                  key={item.title}
                  href="#productos"
                  onClick={scrollToProducts}
                  className="group flex flex-col justify-between rounded-2xl border border-[#334155] bg-[#1e293b]/90 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#6366f1] hover:shadow-xl hover:shadow-[#6366f1]/10"
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    <item.Icon size={20} />
                  </div>
                  <div className="mt-6">
                    <h2 className="text-base font-bold text-white group-hover:text-[#a5b4fc] transition-colors">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-xs text-[#94a3b8]">{item.subtitle}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

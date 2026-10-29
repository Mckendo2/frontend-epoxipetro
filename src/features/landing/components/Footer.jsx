import { ArrowUp, LogIn, MessageCircle } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#334155] bg-[#0b1120] text-[#94a3b8]" aria-label="Pie de página">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand info — Exact LoginPage.jsx logo badge */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white font-bold text-base"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                }}
              >
                A
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Alvarez<span className="text-[#6366f1]">Ferretería</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#94a3b8]">
              Especialistas en sistemas de resinas epóxicas, cerrajería de seguridad, brocas de
              precisión, material eléctrico e insumos para industria, construcción y particulares.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
                  siteConfig.whatsappGreeting
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#334155] bg-[#1e293b] px-3.5 py-2 text-xs font-semibold text-[#a5b4fc] transition-colors hover:border-[#6366f1] hover:text-white"
              >
                <MessageCircle size={15} aria-hidden="true" />
                <span>{siteConfig.contact.whatsappDisplay}</span>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Navegación Corporativa
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="#soluciones" className="transition-colors hover:text-white">
                  Soluciones por aplicación
                </a>
              </li>
              <li>
                <a href="#productos" className="transition-colors hover:text-white">
                  Catálogo en stock
                </a>
              </li>
              <li>
                <a href="#ventajas" className="transition-colors hover:text-white">
                  Por qué elegirnos
                </a>
              </li>
              <li>
                <a href="#proceso" className="transition-colors hover:text-white">
                  Proceso de cotización
                </a>
              </li>
              <li>
                <a href="#faq" className="transition-colors hover:text-white">
                  Preguntas frecuentes
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.links.catalog}
                  className="font-semibold text-[#a5b4fc] hover:text-white"
                >
                  Catálogo digital completo →
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Líneas de Suministro
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="#productos" className="transition-colors hover:text-white">
                  Resinas epóxicas y recubrimientos
                </a>
              </li>
              <li>
                <a href="#productos" className="transition-colors hover:text-white">
                  Chapas y cerrajería de seguridad
                </a>
              </li>
              <li>
                <a href="#productos" className="transition-colors hover:text-white">
                  Candados y control de acceso
                </a>
              </li>
              <li>
                <a href="#productos" className="transition-colors hover:text-white">
                  Brocas de cobalto y herramientas
                </a>
              </li>
              <li>
                <a href="#productos" className="transition-colors hover:text-white">
                  Materiales eléctricos e insumos
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Atención y Horarios
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="font-semibold text-[#cbd5e1]">Ubicación:</p>
                <p className="mt-0.5 text-xs">{siteConfig.contact.address}</p>
              </div>
              <div>
                <p className="font-semibold text-[#cbd5e1]">Horarios de atención:</p>
                {siteConfig.contact.hours.map((h, i) => (
                  <p key={i} className="mt-0.5 text-xs">
                    {h.days}: <span className="font-mono text-white">{h.time}</span>
                  </p>
                ))}
              </div>
              <div>
                <p className="font-semibold text-[#cbd5e1]">Marcas principales:</p>
                <p className="mt-0.5 text-xs font-medium text-[#a5b4fc]">
                  {siteConfig.brands.join(' • ')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#1e293b] pt-8 text-xs sm:flex-row">
          <p>
            © {currentYear} {siteConfig.brand.fullName}. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-6">
            <a
              href={siteConfig.links.staffLogin}
              className="inline-flex items-center gap-1.5 text-[#94a3b8] transition-colors hover:text-[#a5b4fc]"
            >
              <LogIn size={13} aria-hidden="true" />
              <span>Acceso al sistema</span>
            </a>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-[#94a3b8] transition-colors hover:text-white"
              aria-label="Volver arriba"
            >
              <span>Subir</span>
              <ArrowUp size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

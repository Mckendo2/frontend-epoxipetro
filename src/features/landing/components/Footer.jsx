import { ArrowUp, LogIn, MessageCircle } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-edge bg-panel text-muted" aria-label="Pie de página">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight text-brass">
                {siteConfig.brand.name}
              </span>
              <span className="text-sm font-normal text-muted">
                {siteConfig.brand.descriptor}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted">
              Soluciones integrales en cerrajería de seguridad, cerraduras, candados, resinas
              epóxicas, material eléctrico e insumos generales para profesionales y particulares.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
                  siteConfig.whatsappGreeting
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded border border-edge bg-canvas px-3.5 py-2 text-xs font-semibold text-brass transition-colors hover:border-brass/50 hover:bg-raised"
              >
                <MessageCircle size={15} aria-hidden="true" />
                <span>{siteConfig.contact.whatsappDisplay}</span>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-body">
              Navegación
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="#productos" className="transition-colors hover:text-body">
                  Productos y rubros
                </a>
              </li>
              <li>
                <a href="#ventajas" className="transition-colors hover:text-body">
                  Por qué elegirnos
                </a>
              </li>
              <li>
                <a href="#proceso" className="transition-colors hover:text-body">
                  Cómo comprar
                </a>
              </li>
              <li>
                <a href="#faq" className="transition-colors hover:text-body">
                  Preguntas frecuentes
                </a>
              </li>
              <li>
                <a href={siteConfig.links.catalog} className="text-brass hover:text-brass-light font-medium">
                  Catálogo digital en vivo →
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-body">
              Rubros principales
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href={siteConfig.links.catalog} className="transition-colors hover:text-body">
                  Chapas para puerta
                </a>
              </li>
              <li>
                <a href={siteConfig.links.catalog} className="transition-colors hover:text-body">
                  Candados de seguridad
                </a>
              </li>
              <li>
                <a href={siteConfig.links.catalog} className="transition-colors hover:text-body">
                  Resinas epóxicas y UV
                </a>
              </li>
              <li>
                <a href={siteConfig.links.catalog} className="transition-colors hover:text-body">
                  Materiales eléctricos
                </a>
              </li>
              <li>
                <a href={siteConfig.links.catalog} className="transition-colors hover:text-body">
                  Insumos generales de obra
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-body">
              Tienda y Atención
            </h3>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="font-medium text-body">Ubicación:</p>
                <p className="mt-0.5 text-xs">{siteConfig.contact.address}</p>
              </div>
              <div>
                <p className="font-medium text-body">Horarios de atención:</p>
                {siteConfig.contact.hours.map((h, i) => (
                  <p key={i} className="mt-0.5 text-xs">
                    {h.days}: <span className="text-body font-mono">{h.time}</span>
                  </p>
                ))}
              </div>
              <div>
                <p className="font-medium text-body">Marcas certificadas:</p>
                <p className="mt-0.5 text-xs text-brass">{siteConfig.brands.join(' • ')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-edge pt-8 sm:flex-row text-xs">
          <p>© {currentYear} {siteConfig.brand.fullName}. Todos los derechos reservados.</p>

          <div className="flex items-center gap-6">
            <a
              href={siteConfig.links.staffLogin}
              className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-brass"
            >
              <LogIn size={13} aria-hidden="true" />
              <span>Acceso al sistema</span>
            </a>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-muted transition-colors hover:text-body"
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

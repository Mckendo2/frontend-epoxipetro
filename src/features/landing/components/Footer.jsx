import { ArrowUp, LogIn } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#334155] bg-[#0b1120] text-[#94a3b8]" aria-label="Pie de página">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white font-bold text-base"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              }}
            >
              A
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Alvarez<span className="text-[#6366f1]">Ferretería</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-medium">
            <a href="#productos" className="hover:text-white transition-colors">
              Productos
            </a>
            <a href="#ventajas" className="hover:text-white transition-colors">
              Ventajas
            </a>
            <a href="#proceso" className="hover:text-white transition-colors">
              Cómo comprar
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              Preguntas
            </a>
            <a href={siteConfig.links.catalog} className="text-[#a5b4fc] hover:text-white transition-colors">
              Catálogo
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[#1e293b] pt-6 text-xs sm:flex-row">
          <p>© {currentYear} {siteConfig.brand.fullName}.</p>

          <div className="flex items-center gap-6">
            <a
              href={siteConfig.links.staffLogin}
              className="inline-flex items-center gap-1.5 text-[#94a3b8] transition-colors hover:text-[#a5b4fc]"
            >
              <LogIn size={13} />
              <span>Acceso al sistema</span>
            </a>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-[#94a3b8] transition-colors hover:text-white"
              aria-label="Volver arriba"
            >
              <span>Subir</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Menu, X, ShoppingCart, LogIn } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { useLandingCart } from '../context/LandingCartContext';

const navLinks = [
  { label: 'Productos', href: '#productos' },
  { label: 'Ventajas', href: '#ventajas' },
  { label: 'Cómo comprar', href: '#proceso' },
  { label: 'Preguntas', href: '#faq' },
  { label: 'Contacto', href: '#contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const { totalItems, setIsCartOpen } = useLandingCart();

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;

      setScrolled(currentY > 20);

      // Ocultar al bajar, mostrar al subir (estilo Westlake Epoxy)
      if (currentY > lastScrollY.current && currentY > 90) {
        setHidden(true);
        setMenuOpen(false);
      } else {
        setHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      } ${
        scrolled
          ? 'border-b border-[#334155] bg-[#0f172a]/95 backdrop-blur-md shadow-lg shadow-black/25'
          : 'border-b border-transparent bg-[#0f172a]/80 backdrop-blur-sm'
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"
        aria-label="Navegación principal"
      >
        {/* Brand Logo — Login style */}
        <a href="/" className="flex items-center gap-3 group">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-[10px] text-white font-bold text-lg transition-transform duration-200 group-hover:scale-105"
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
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNav(e, link.href)}
              className="text-sm font-medium text-[#cbd5e1] transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 rounded-lg border border-[#334155] bg-[#1e293b] px-4 py-2 text-sm font-semibold text-[#f8fafc] transition-all hover:border-[#6366f1]"
            aria-label="Ver lista de cotización"
          >
            <ShoppingCart size={17} className="text-[#a5b4fc]" />
            <span>Cotización</span>
            {totalItems > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6366f1] px-1.5 text-[11px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </button>

          <a
            href={siteConfig.links.catalog}
            className="rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4f46e5]"
          >
            Catálogo
          </a>

          <a
            href={siteConfig.links.staffLogin}
            className="ml-1 rounded-lg border border-[#334155] bg-[#1e293b]/60 p-2 text-[#94a3b8] transition-colors hover:border-[#475569] hover:text-white"
            title="Acceso al sistema"
            aria-label="Acceso al sistema"
          >
            <LogIn size={17} />
          </a>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative rounded-lg border border-[#334155] bg-[#1e293b] p-2.5 text-[#a5b4fc]"
            aria-label="Ver lista de cotización"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6366f1] px-1 text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </button>

          <button
            className="rounded-lg border border-[#334155] bg-[#1e293b] p-2 text-[#f8fafc]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="border-t border-[#334155] bg-[#0f172a] lg:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNav(e, link.href)}
                className="border-b border-[#1e293b] py-3 text-sm font-medium text-[#cbd5e1] transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#6366f1]/40 bg-[#1e293b] px-4 py-3 text-sm font-semibold text-[#a5b4fc]"
              >
                <ShoppingCart size={18} />
                <span>Ver cotización ({totalItems})</span>
              </button>
              <a
                href={siteConfig.links.catalog}
                className="rounded-lg bg-[#6366f1] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#4f46e5]"
              >
                Catálogo completo
              </a>
              <a
                href={siteConfig.links.staffLogin}
                className="mt-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-[#94a3b8] hover:text-white"
              >
                <LogIn size={14} />
                <span>Iniciar Sesión</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

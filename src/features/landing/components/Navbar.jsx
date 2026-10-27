import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { useLandingCart } from '../context/LandingCartContext';

const navLinks = [
  { label: 'Productos y Almacén', href: '#productos' },
  { label: 'Ventajas', href: '#ventajas' },
  { label: 'Cómo comprar', href: '#proceso' },
  { label: 'Preguntas', href: '#faq' },
  { label: 'Contacto', href: '#contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useLandingCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        scrolled ? 'border-b border-edge bg-canvas/95 backdrop-blur-md' : 'bg-canvas/80 backdrop-blur-sm'
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"
        aria-label="Navegación principal"
      >
        <a href="/" className="flex items-baseline gap-1.5">
          <span className="text-xl font-extrabold tracking-tight text-brass">
            {siteConfig.brand.name}
          </span>
          <span className="hidden text-sm font-normal text-muted sm:inline">
            {siteConfig.brand.descriptor}
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNav(e, link.href)}
              className="text-sm text-muted transition-colors hover:text-body"
            >
              {link.label}
            </a>
          ))}

          {/* Cart Icon / Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 rounded-lg border border-edge bg-panel px-3.5 py-2 text-sm font-semibold text-body transition-colors hover:border-brass/50 hover:bg-raised"
            aria-label="Ver lista de cotización"
          >
            <ShoppingCart size={17} className="text-brass" />
            <span>Cotizar</span>
            {totalItems > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brass px-1 text-[11px] font-bold text-canvas animate-in zoom-in-50 duration-200">
                {totalItems}
              </span>
            )}
          </button>

          <a
            href={siteConfig.links.catalog}
            className="rounded bg-brass px-4 py-2 text-sm font-semibold text-canvas transition-colors hover:bg-brass-light"
          >
            Ver catálogo
          </a>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative rounded-lg border border-edge bg-panel p-2 text-brass"
            aria-label="Ver lista de cotización"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brass px-1 text-[10px] font-bold text-canvas">
                {totalItems}
              </span>
            )}
          </button>

          <button
            className="text-body p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="border-t border-edge bg-canvas lg:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNav(e, link.href)}
                className="border-b border-edge py-3 text-muted transition-colors hover:text-body"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                setIsCartOpen(true);
              }}
              className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-brass/50 bg-panel px-4 py-3 text-sm font-semibold text-brass"
            >
              <ShoppingCart size={18} />
              <span>Ver cotización ({totalItems})</span>
            </button>
            <a
              href={siteConfig.links.catalog}
              className="mt-2 rounded bg-brass px-4 py-3 text-center text-sm font-semibold text-canvas transition-colors hover:bg-brass-light"
            >
              Ver catálogo completo
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Menu, X, ShoppingCart, LogIn } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { useLandingCart } from '../context/LandingCartContext';

const navLinks = [
  { label: 'Productos', href: '#productos' },
  { label: 'Resinas', href: '#resinas' },
  { label: 'Cómo cotizar', href: '#como-cotizar' },
  { label: 'Preguntas', href: '#preguntas' },
  { label: 'Contacto', href: '#contacto' },
];

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const { totalItems, setIsCartOpen } = useLandingCart();

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;

      // Se oculta al bajar y reaparece al subir.
      if (currentY > lastScrollY.current && currentY > 90) {
        setHidden(true);
        setMenuOpen(false);
      } else if (currentY < lastScrollY.current) {
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

  const cartLabel =
    totalItems > 0 ? `Mi lista, ${totalItems} productos` : 'Mi lista de cotización';

  return (
    <header
      onFocus={() => setHidden(false)}
      className={`fixed inset-x-0 top-0 z-40 border-b border-line bg-ink transition-transform duration-300 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8"
        aria-label="Navegación principal"
      >
        <a href="/" className="flex items-center gap-3" translate="no">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-[10px] text-base font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}
            aria-hidden="true"
          >
            A
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            Alvarez<span className="text-[#818cf8]"> Ferretería</span>
          </span>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNav(e, link.href)}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={cartLabel}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#6366f1] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#4f46e5]"
          >
            <ShoppingCart size={17} aria-hidden="true" />
            <span className="hidden sm:inline">Mi lista</span>
            {totalItems > 0 && (
              <span className="min-w-5 rounded-full bg-white px-1.5 text-center text-xs font-bold tabular-nums text-ink">
                {totalItems}
              </span>
            )}
          </button>

          <a
            href={siteConfig.links.staffLogin}
            aria-label="Acceso al sistema"
            title="Acceso al sistema"
            className="hidden h-10 w-10 items-center justify-center rounded-md border border-line text-slate-400 transition-colors hover:border-slate-500 hover:text-white lg:inline-flex"
          >
            <LogIn size={17} aria-hidden="true" />
          </a>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-white lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-line bg-ink lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-5 py-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNav(e, link.href)}
                className="border-b border-ink-soft py-3.5 text-base font-medium text-slate-200"
              >
                {link.label}
              </a>
            ))}
            <a
              href={siteConfig.links.staffLogin}
              className="inline-flex items-center gap-2 py-3.5 text-sm text-slate-400"
            >
              <LogIn size={15} aria-hidden="true" />
              Acceso al sistema
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, LogIn, MessageCircle, Search } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { useLandingCart } from '../context/LandingCartContext';

const navLinks = [
  { label: 'Soluciones', href: '#soluciones' },
  { label: 'Productos en Stock', href: '#productos' },
  { label: 'Por qué elegirnos', href: '#ventajas' },
  { label: 'Cómo cotizar', href: '#proceso' },
  { label: 'Preguntas', href: '#faq' },
  { label: 'Contacto', href: '#contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useLandingCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    siteConfig.whatsappGreeting
  )}`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'border-b border-[#334155] bg-[#0f172a]/95 backdrop-blur-md shadow-lg shadow-black/20'
          : 'border-b border-[#334155]/60 bg-[#0f172a]/85 backdrop-blur-sm'
      }`}
    >
      {/* Top Corporate Utility Strip (Westlake Epoxy style) */}
      <div className="hidden border-b border-[#334155]/60 bg-[#0b1120] lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-2 text-xs text-[#94a3b8]">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium text-[#cbd5e1]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1]" />
              Suministro Industrial, Resinas Epóxicas y Cerrajería
            </span>
            <span className="text-[#475569]">|</span>
            <span>Atención B2B y Proyectos en toda Bolivia</span>
          </div>

          <div className="flex items-center gap-5">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#cbd5e1] transition-colors hover:text-[#a5b4fc]"
            >
              <MessageCircle size={13} className="text-[#6366f1]" />
              <span>Ventas: {siteConfig.contact.whatsappDisplay}</span>
            </a>
            <span className="text-[#475569]">|</span>
            <a
              href={siteConfig.links.staffLogin}
              className="inline-flex items-center gap-1.5 font-medium text-[#a5b4fc] transition-colors hover:text-white"
            >
              <LogIn size={13} />
              <span>Acceso Sistema</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-8"
        aria-label="Navegación principal"
      >
        {/* Brand Logo — Exact LoginPage.jsx & Sidebar.jsx style */}
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
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white leading-none">
              Alvarez<span className="text-[#6366f1]">Ferretería</span>
            </span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8]">
              Epóxicos &amp; Suministros
            </span>
          </div>
        </a>

        {/* Desktop links */}
        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNav(e, link.href)}
              className="text-sm font-medium text-[#cbd5e1] transition-colors hover:text-[#a5b4fc]"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="#productos"
            onClick={(e) => handleNav(e, '#productos')}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#334155] bg-[#1e293b] text-[#94a3b8] transition-colors hover:border-[#475569] hover:text-white"
            aria-label="Buscar productos"
            title="Buscar productos"
          >
            <Search size={17} />
          </a>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 rounded-lg border border-[#334155] bg-[#1e293b] px-3.5 py-2 text-sm font-semibold text-[#f8fafc] transition-all hover:border-[#6366f1] hover:bg-[#1e293b]/80"
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
            Catálogo Completo
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
                className="border-b border-[#1e293b] py-3 text-sm font-medium text-[#cbd5e1] transition-colors hover:text-[#a5b4fc]"
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
                <span>Ver mi cotización ({totalItems})</span>
              </button>
              <a
                href={siteConfig.links.catalog}
                className="rounded-lg bg-[#6366f1] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#4f46e5]"
              >
                Catálogo Completo
              </a>
              <a
                href={siteConfig.links.staffLogin}
                className="mt-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-[#94a3b8] hover:text-white"
              >
                <LogIn size={14} />
                <span>Acceso al Sistema (Personal)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

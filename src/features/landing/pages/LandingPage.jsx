import { useEffect } from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Brands from '../components/Brands';
import Products from '../components/Products';
import ResinGuide from '../components/ResinGuide';
import HowToQuote from '../components/HowToQuote';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import { LandingCartProvider, useLandingCart } from '../context/LandingCartContext';
import { CatalogProvider } from '../context/CatalogContext';
import { siteConfig } from '../data/siteConfig';

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function LandingPageContent() {
  const { totalItems, totalAmount, setIsCartOpen } = useLandingCart();

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${siteConfig.brand.fullName} | Ferretería, cerrajería y resinas epóxicas`;
    return () => {
      document.title = prevTitle;
    };
  }, []);

  const floatingWaUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    siteConfig.whatsappGreeting
  )}`;

  return (
    <div className="landing-root min-h-screen bg-paper font-sans text-ink selection:bg-[#6366f1] selection:text-white">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-50 rounded-md bg-white px-4 py-2 text-sm font-semibold text-ink focus:not-sr-only"
      >
        Saltar al contenido
      </a>

      <Navbar />

      <main id="main-content">
        <Hero />
        <Brands />
        <Products />
        <ResinGuide />
        <HowToQuote />
      </main>

      <Footer />

      <CartDrawer />

      {/* Barra de la lista: aparece cuando el cliente ya eligió productos */}
      {totalItems > 0 && (
        <div className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-xl">
          <div className="flex items-center justify-between gap-4 rounded-md border border-line bg-ink p-3 pl-4 shadow-xl shadow-black/30">
            <p className="text-sm text-slate-300" aria-live="polite">
              <span className="font-semibold tabular-nums text-white">{totalItems}</span>{' '}
              {totalItems === 1 ? 'producto' : 'productos'}
              {totalAmount > 0 && (
                <span className="ml-3 font-semibold tabular-nums text-white">
                  Bs. {formatCurrency(totalAmount)}
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md bg-[#6366f1] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#4f46e5]"
            >
              Ver mi lista
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp directo */}
      <a
        href={floatingWaUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribir por WhatsApp"
        className={`fixed right-4 z-30 flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-ink shadow-lg shadow-black/30 transition-transform duration-200 hover:scale-105 ${
          totalItems > 0
            ? 'bottom-[max(6rem,calc(env(safe-area-inset-bottom)+5rem))]'
            : 'bottom-[max(1rem,env(safe-area-inset-bottom))]'
        }`}
      >
        <MessageCircle size={26} aria-hidden="true" />
      </a>
    </div>
  );
}

export default function LandingPage() {
  return (
    <CatalogProvider>
      <LandingCartProvider>
        <LandingPageContent />
      </LandingCartProvider>
    </CatalogProvider>
  );
}

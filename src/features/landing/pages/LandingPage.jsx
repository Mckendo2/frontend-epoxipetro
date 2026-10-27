import { useEffect } from 'react';
import { MessageCircle, ShoppingCart, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Trust from '../components/Trust';
import Products from '../components/Products';
import Benefits from '../components/Benefits';
import Process from '../components/Process';
import FAQ from '../components/FAQ';
import CTAFinal from '../components/CTAFinal';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import { LandingCartProvider, useLandingCart } from '../context/LandingCartContext';
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
    document.title = `${siteConfig.brand.fullName} | Cerrajería, Resinas y Ferretería`;
    return () => {
      document.title = prevTitle;
    };
  }, []);

  const floatingWaUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    siteConfig.whatsappGreeting
  )}`;

  return (
    <div className="min-h-screen bg-canvas text-body font-sans selection:bg-brass selection:text-canvas">
      {/* Top navigation */}
      <Navbar />

      {/* Main content sections */}
      <main id="main-content">
        <Hero />
        <Trust />
        <Products />
        <Benefits />
        <Process />
        <FAQ />
        <CTAFinal />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Quotation Cart Drawer */}
      <CartDrawer />

      {/* Floating Bottom Bar: Active when customer has selected products */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 inset-x-4 z-40 mx-auto max-w-xl animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-brass/50 bg-panel/95 p-3.5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-brass text-canvas">
                <ShoppingCart size={20} />
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-body px-1 text-[10px] font-extrabold text-canvas">
                  {totalItems}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted">
                  {totalItems} {totalItems === 1 ? 'material seleccionado' : 'materiales seleccionados'}
                </p>
                <p className="text-sm font-bold text-brass">
                  Bs. {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-brass px-4 py-2.5 text-xs font-bold text-canvas shadow transition-colors hover:bg-brass-light"
            >
              <span>Revisar cotización</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Quick Action Button (shifts up if bar is active) */}
      <aside
        aria-label="Contacto flotante"
        className={`fixed right-6 z-30 transition-all duration-300 ${
          totalItems > 0 ? 'bottom-24' : 'bottom-6'
        }`}
      >
        <a
          href={floatingWaUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp directamente"
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/40 transition-transform duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366] focus:ring-offset-canvas"
        >
          <span
            className="absolute -inset-1 animate-ping rounded-full bg-[#25D366]/40 opacity-75"
            aria-hidden="true"
          />
          <MessageCircle size={28} className="relative z-10 fill-white" aria-hidden="true" />

          <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-panel px-3 py-1.5 text-xs font-semibold text-body opacity-0 shadow-lg border border-edge transition-opacity duration-200 group-hover:opacity-100">
            ¿Dudas? Chateá con nosotros
          </span>
        </a>
      </aside>
    </div>
  );
}

export default function LandingPage() {
  return (
    <LandingCartProvider>
      <LandingPageContent />
    </LandingCartProvider>
  );
}

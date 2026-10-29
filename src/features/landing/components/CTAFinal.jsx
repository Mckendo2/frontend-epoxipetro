import { MessageCircle, ArrowRight, Clock, MapPin, Phone } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export default function CTAFinal() {
  const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    siteConfig.whatsappGreeting
  )}`;

  return (
    <section
      id="contacto"
      className="scroll-mt-20 relative overflow-hidden border-t border-[#334155] bg-[#0f172a] py-16 lg:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-login-grid opacity-40" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="rounded-2xl border border-[#334155] bg-[#1e293b] p-8 sm:p-10">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                ¿Necesitas cotizar tu pedido?
              </h2>
              <p className="mt-2 text-sm text-[#94a3b8]">
                Escríbenos por WhatsApp o explora nuestro catálogo completo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#6366f1] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#4f46e5]"
              >
                <MessageCircle size={18} />
                <span>WhatsApp</span>
              </a>
              <a
                href={siteConfig.links.catalog}
                className="inline-flex items-center gap-2 rounded-lg border border-[#334155] bg-[#0f172a] px-5 py-3 text-sm font-semibold text-[#f8fafc] transition-colors hover:border-[#6366f1]"
              >
                <span>Ver Catálogo</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <div className="mt-8 grid gap-4 border-t border-[#334155] pt-8 sm:grid-cols-3">
            <div className="flex items-center gap-3.5 rounded-xl border border-[#334155] bg-[#0f172a] p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6366f1]/15 text-[#a5b4fc]">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-xs text-[#94a3b8]">WhatsApp</p>
                <p className="text-sm font-bold text-white">{siteConfig.contact.whatsappDisplay}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-xl border border-[#334155] bg-[#0f172a] p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6366f1]/15 text-[#a5b4fc]">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-xs text-[#94a3b8]">Horario</p>
                <p className="text-xs font-semibold text-white">Lun–Vie 8:30–19:00 | Sáb 8:30–13:00</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-xl border border-[#334155] bg-[#0f172a] p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6366f1]/15 text-[#a5b4fc]">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs text-[#94a3b8]">Ubicación</p>
                <p className="text-xs font-semibold text-white">{siteConfig.contact.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

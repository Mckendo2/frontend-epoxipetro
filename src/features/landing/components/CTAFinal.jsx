import { MessageCircle, ArrowRight, Clock, MapPin, Phone } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export default function CTAFinal() {
  const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    siteConfig.whatsappGreeting
  )}`;

  return (
    <section
      id="contacto"
      className="scroll-mt-24 relative overflow-hidden border-t border-[#334155] bg-[#0f172a] py-20 lg:py-28"
    >
      {/* Subtle architectural grid and indigo glow */}
      <div className="pointer-events-none absolute inset-0 bg-login-grid opacity-50" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[380px] w-[600px] rounded-full bg-[#6366f1]/15 blur-[130px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="rounded-2xl border border-[#334155] bg-[#1e293b]/95 p-8 shadow-2xl backdrop-blur-sm sm:p-12 lg:p-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full border border-[#6366f1]/30 bg-[#6366f1]/15 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#a5b4fc]">
              Atención Técnica y Comercial
            </span>
            <h2
              className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
              style={{ textWrap: 'balance' }}
            >
              ¿Listo para cotizar o abastecer tu proyecto?
            </h2>
            <p
              className="mx-auto mt-4 max-w-2xl text-base text-[#94a3b8] sm:text-lg"
              style={{ textWrap: 'pretty' }}
            >
              Envíanos tu requerimiento de resinas epóxicas, cerrajería o herramientas por WhatsApp.
              Recibe atención directa, precios actualizados y disponibilidad inmediata.
            </p>

            {/* Action buttons matching LoginPage.jsx */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg bg-[#6366f1] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#6366f1]/30 transition-all hover:bg-[#4f46e5] sm:w-auto"
              >
                <MessageCircle size={20} aria-hidden="true" />
                <span>Contactar por WhatsApp</span>
              </a>
              <a
                href={siteConfig.links.catalog}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#334155] bg-[#0f172a] px-6 py-3.5 text-base font-semibold text-[#f8fafc] transition-colors hover:border-[#6366f1] hover:text-[#a5b4fc] sm:w-auto"
              >
                <span>Abrir Catálogo Completo</span>
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Quick contact feature cards */}
          <div className="mt-14 grid gap-6 border-t border-[#334155] pt-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-4 rounded-xl border border-[#334155] bg-[#0f172a] p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#6366f1]/30 bg-[#6366f1]/15 text-[#a5b4fc]">
                <Phone size={20} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Línea Directa</h3>
                <p className="mt-1 text-sm font-semibold text-[#a5b4fc]">
                  {siteConfig.contact.whatsappDisplay}
                </p>
                <p className="mt-0.5 text-xs text-[#94a3b8]">WhatsApp y atención comercial</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-[#334155] bg-[#0f172a] p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#6366f1]/30 bg-[#6366f1]/15 text-[#a5b4fc]">
                <Clock size={20} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Horario de Atención</h3>
                {siteConfig.contact.hours.map((h, i) => (
                  <p key={i} className="mt-0.5 text-xs text-[#94a3b8]">
                    <span className="font-semibold text-[#cbd5e1]">{h.days}:</span> {h.time}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-[#334155] bg-[#0f172a] p-5 sm:col-span-2 lg:col-span-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#6366f1]/30 bg-[#6366f1]/15 text-[#a5b4fc]">
                <MapPin size={20} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Cobertura y Entregas</h3>
                <p className="mt-1 text-xs text-[#94a3b8]">{siteConfig.contact.address}</p>
                <p className="mt-0.5 text-xs font-semibold text-[#a5b4fc]">
                  Despacho a obras y retiro coordinado
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

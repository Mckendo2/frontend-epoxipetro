import { MessageCircle, ArrowRight, Clock, MapPin, Phone } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export default function CTAFinal() {
  const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    siteConfig.whatsappGreeting
  )}`;

  return (
    <section id="contacto" className="scroll-mt-20 relative overflow-hidden bg-canvas py-20 lg:py-28">
      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[380px] w-[600px] rounded-full bg-brass/5 blur-[120px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="rounded-2xl border border-edge bg-gradient-to-b from-panel to-canvas p-8 sm:p-12 lg:p-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-block rounded-full border border-brass/30 bg-brass/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brass">
              Atención inmediata
            </span>
            <h2
              className="mt-6 text-3xl font-extrabold tracking-tight text-body sm:text-4xl lg:text-5xl"
              style={{ textWrap: 'balance' }}
            >
              ¿Listo para cotizar o equipar tu proyecto?
            </h2>
            <p
              className="mx-auto mt-4 max-w-2xl text-base text-muted sm:text-lg"
              style={{ textWrap: 'pretty' }}
            >
              Envianos tu lista de materiales o consulta de cerrajería por WhatsApp. Te respondemos
              con precios actualizados, disponibilidad inmediata y asesoría experta.
            </p>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg bg-brass px-6 py-3.5 text-base font-semibold text-canvas shadow-lg transition-all hover:bg-brass-light hover:shadow-brass/20 sm:w-auto"
              >
                <MessageCircle size={20} aria-hidden="true" />
                <span>Escribinos al WhatsApp</span>
              </a>
              <a
                href={siteConfig.links.catalog}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-edge bg-raised px-6 py-3.5 text-base font-medium text-body transition-colors hover:border-brass/40 hover:bg-raised/80 sm:w-auto"
              >
                <span>Ver catálogo en línea</span>
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Quick contact feature cards */}
          <div className="mt-14 grid gap-6 border-t border-edge pt-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-4 rounded-xl border border-edge/60 bg-canvas/40 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brass/10 text-brass">
                <Phone size={20} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-body">Contacto directo</h3>
                <p className="mt-1 text-sm text-brass font-medium">{siteConfig.contact.whatsappDisplay}</p>
                <p className="mt-0.5 text-xs text-muted">WhatsApp y llamadas para consultas</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-edge/60 bg-canvas/40 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brass/10 text-brass">
                <Clock size={20} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-body">Horario comercial</h3>
                {siteConfig.contact.hours.map((h, i) => (
                  <p key={i} className="mt-0.5 text-xs text-muted">
                    <span className="font-medium text-body">{h.days}:</span> {h.time}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-edge/60 bg-canvas/40 p-5 sm:col-span-2 lg:col-span-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brass/10 text-brass">
                <MapPin size={20} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-body">Atención en tienda</h3>
                <p className="mt-1 text-xs text-muted">{siteConfig.contact.address}</p>
                <p className="mt-0.5 text-xs text-brass font-medium">Retiro en local disponible</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

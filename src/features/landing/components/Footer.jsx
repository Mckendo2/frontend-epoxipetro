import { MessageCircle, LogIn } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export default function Footer() {
  const { contact, brand, links } = siteConfig;
  const currentYear = new Date().getFullYear();

  const waUrl = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
    siteConfig.whatsappGreeting
  )}`;

  return (
    <footer id="contacto" className="scroll-mt-16 bg-ink text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-12 lg:px-8 lg:py-20">
        <div className="lg:col-span-7">
          <h2
            className="font-display text-5xl font-semibold leading-none text-white sm:text-6xl"
            style={{ textWrap: 'balance' }}
          >
            ¿No encuentras lo que buscas? Escríbenos.
          </h2>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2.5 rounded-md bg-[#25D366] px-6 py-3.5 text-base font-semibold text-ink transition-colors hover:bg-[#3ee27b]"
          >
            <MessageCircle size={20} aria-hidden="true" />
            WhatsApp <span className="tabular-nums">{contact.whatsappDisplay}</span>
          </a>
        </div>

        <dl className="grid content-start gap-6 text-sm lg:col-span-5">
          {contact.address && (
            <div>
              <dt className="font-semibold text-white">Dirección</dt>
              <dd className="mt-1 text-slate-400">
                {contact.mapsUrl ? (
                  <a
                    href={contact.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-white"
                  >
                    {contact.address}
                  </a>
                ) : (
                  contact.address
                )}
              </dd>
            </div>
          )}
          {contact.hours.length > 0 && (
            <div>
              <dt className="font-semibold text-white">Horario</dt>
              <dd className="mt-1 space-y-0.5 text-slate-400">
                {contact.hours.map((h) => (
                  <p key={h.days}>
                    {h.days}: <span className="tabular-nums">{h.time}</span>
                  </p>
                ))}
              </dd>
            </div>
          )}
          {contact.email && (
            <div>
              <dt className="font-semibold text-white">Correo</dt>
              <dd className="mt-1 text-slate-400">
                <a href={`mailto:${contact.email}`} className="hover:text-white">
                  {contact.email}
                </a>
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p translate="no">
            © {currentYear} {brand.fullName}
          </p>
          <div className="flex items-center gap-6">
            <a href={links.catalog} className="hover:text-white">
              Catálogo completo
            </a>
            <a href={links.staffLogin} className="inline-flex items-center gap-1.5 hover:text-white">
              <LogIn size={14} aria-hidden="true" />
              Acceso al sistema
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

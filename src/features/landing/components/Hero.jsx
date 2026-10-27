import { MessageCircle } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

export default function Hero() {
  const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    siteConfig.whatsappGreeting
  )}`;

  return (
    <section className="relative flex min-h-svh items-center bg-canvas pb-16 pt-24 lg:pb-0 lg:pt-0">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        {/* Copy */}
        <div className="max-w-xl">
          <h1
            className="text-4xl font-extrabold leading-[1.08] tracking-tight text-body sm:text-5xl lg:text-6xl"
            style={{ textWrap: 'balance' }}
          >
            Materiales que resisten. Precios que convienen.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted" style={{ textWrap: 'pretty' }}>
            Cerraduras de las mejores marcas, resinas epóxicas, materiales
            eléctricos e insumos de ferretería. Cotizá al instante por WhatsApp.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href={siteConfig.links.catalog}
              className="inline-flex items-center rounded bg-brass px-6 py-3.5 text-sm font-semibold text-canvas transition-colors hover:bg-brass-light"
            >
              Ver catálogo
            </a>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded border border-edge px-6 py-3.5 text-sm font-semibold text-body transition-colors hover:border-brass hover:text-brass"
            >
              <MessageCircle size={16} aria-hidden="true" />
              Escribinos por WhatsApp
            </a>
          </div>
        </div>

        {/* Visual */}
        <div className="relative mx-auto max-h-[50vh] w-full max-w-md overflow-hidden rounded lg:max-h-[70vh] lg:max-w-lg">
          <img
            src="/landing/hero.png"
            alt="Candado de bronce, llaves y cilindro de cerradura sobre una superficie de acero"
            width={640}
            height={800}
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
}

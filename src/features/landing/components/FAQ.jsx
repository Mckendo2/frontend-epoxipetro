import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

const faqs = [
  {
    q: '¿Cómo puedo solicitar una cotización?',
    a: 'Podés armar tu pedido directamente en nuestro catálogo en línea y enviarlo, o escribirnos directamente a nuestro WhatsApp oficial (+591 655 55942). Te responderemos con la cotización formal detallada y disponibilidad de stock en minutos.',
  },
  {
    q: '¿Tienen tienda física para ver y retirar productos?',
    a: 'Sí, contamos con atención al público en nuestro local comercial. Podés visitarnos en nuestro horario de atención o coordinar el retiro inmediato de tus pedidos previamente confirmados por WhatsApp.',
  },
  {
    q: '¿Qué marcas de cerraduras y cerrajería manejan?',
    a: 'Trabajamos con marcas líderes y certificadas en seguridad como Yale, Cisa, Master Lock, Petro y Ultra. Ofrecemos cerraduras de sobreponer, embutir, cerrojos de alta seguridad y candados blindados con garantía.',
  },
  {
    q: '¿Venden resinas epóxicas para pisos y proyectos?',
    a: 'Sí, disponemos de resinas epóxicas de alta transparencia y resistencia para encapsulados, mesas de río, manualidades, barnices UV y aplicaciones de grado profesional, con asesoramiento técnico para su correcta mezcla y aplicación.',
  },
  {
    q: '¿Realizan ventas por mayor para constructores o talleres?',
    a: 'Atendemos tanto compras al por menor como pedidos mayoristas para cerrajeros, carpinteros, instaladores y contratistas con precios especiales por volumen.',
  },
  {
    q: '¿Cuáles son las formas de pago aceptadas?',
    a: 'Aceptamos transferencias bancarias, pagos mediante QR simple, efectivo en tienda física y otros métodos coordinados al momento de confirmar tu pedido.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faq" className="scroll-mt-20 bg-panel py-20 lg:py-28">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-edge bg-raised px-3 py-1 text-xs font-medium text-brass">
            <HelpCircle size={14} aria-hidden="true" />
            <span>Resolvé tus dudas</span>
          </div>
          <h2
            className="mt-4 text-3xl font-bold tracking-tight text-body sm:text-4xl"
            style={{ textWrap: 'balance' }}
          >
            Preguntas frecuentes
          </h2>
          <p className="mt-3 text-muted" style={{ textWrap: 'pretty' }}>
            Todo lo que necesitás saber sobre compras, envíos, marcas y formas de atención.
          </p>
        </div>

        <div className="mt-12 divide-y divide-edge rounded-lg border border-edge bg-canvas/60">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="transition-colors hover:bg-raised/40">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition-all"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-question-${idx}`}
                >
                  <span className={`text-base font-semibold ${isOpen ? 'text-brass' : 'text-body'}`}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`ml-4 shrink-0 text-muted transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-brass' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-question-${idx}`}
                    className="px-6 pb-5 text-sm leading-relaxed text-muted animate-in fade-in duration-200"
                  >
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm text-muted">
          ¿Tenés otra duda?{' '}
          <a
            href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
              'Hola, tengo una consulta que no está en las preguntas frecuentes.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brass underline decoration-brass/40 underline-offset-4 hover:decoration-brass"
          >
            Preguntanos directo por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

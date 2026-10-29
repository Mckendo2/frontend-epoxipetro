import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';

const faqs = [
  {
    q: '¿Cómo puedo solicitar una cotización formal?',
    a: 'Puedes seleccionar los materiales directamente en nuestro catálogo de esta página indicando las cantidades requeridas y presionar "Enviar Cotización por WhatsApp", o escribirnos directamente al +591 655 55942. Te responderemos al instante.',
  },
  {
    q: '¿Qué líneas de resinas epóxicas e insumos manejan?',
    a: 'Disponemos de resinas epóxicas de alta transparencia y resistencia para recubrimientos, pisos industriales, encapsulados, carpintería con madera y aplicaciones técnicas, con asesoramiento sobre su proporción y curado.',
  },
  {
    q: '¿Qué marcas de cerraduras, candados y brocas comercializan?',
    a: 'Trabajamos con marcas reconocidas como Yale, Cisa, Master Lock, Petro, Ultra y Power Drill. Contamos con chapas de 2 y 3 golpes, picaportes, candados de seguridad y brocas de cobalto de distintas medidas.',
  },
  {
    q: '¿Realizan ventas por volumen para constructoras, talleres o contratistas?',
    a: 'Sí, atendemos tanto compras al detalle como pedidos mayoristas por volumen para obras civiles, talleres de cerrajería, carpintería e instaladores eléctricos.',
  },
  {
    q: '¿Cuáles son las modalidades de entrega y retiro?',
    a: 'Puedes coordinar el retiro directo en nuestro local comercial o solicitar el despacho a tu obra, taller o domicilio a través de nuestro canal de atención en WhatsApp.',
  },
  {
    q: '¿Cuáles son los métodos de pago habilitados?',
    a: 'Aceptamos transferencias bancarias, pagos mediante código QR, efectivo en local comercial y otros medios coordinados al confirmar tu pedido.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section id="faq" className="scroll-mt-24 border-t border-[#334155] bg-[#1e293b] py-20 lg:py-28">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/15 px-3.5 py-1 text-xs font-semibold text-[#a5b4fc]">
            <HelpCircle size={14} aria-hidden="true" />
            <span>Soporte y Consultas</span>
          </div>
          <h2
            className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
            style={{ textWrap: 'balance' }}
          >
            Preguntas frecuentes
          </h2>
          <p className="mt-3 text-[#94a3b8]" style={{ textWrap: 'pretty' }}>
            Información clave sobre productos, cotizaciones por volumen, envíos y medios de pago.
          </p>
        </div>

        <div className="mt-12 divide-y divide-[#334155] rounded-2xl border border-[#334155] bg-[#0f172a] overflow-hidden shadow-xl shadow-black/20">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="transition-colors hover:bg-[#1e293b]/50">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition-all"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-question-${idx}`}
                >
                  <span
                    className={`text-base font-semibold ${
                      isOpen ? 'text-[#a5b4fc]' : 'text-white'
                    }`}
                  >
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`ml-4 shrink-0 text-[#94a3b8] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#6366f1]' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-question-${idx}`}
                    className="px-6 pb-5 text-sm leading-relaxed text-[#94a3b8]"
                  >
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm text-[#94a3b8]">
          ¿Tienes otra consulta técnica o comercial?{' '}
          <a
            href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
              'Hola, tengo una consulta técnica sobre sus productos.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#a5b4fc] underline decoration-[#6366f1]/50 underline-offset-4 hover:text-white hover:decoration-[#6366f1]"
          >
            Escríbenos directo por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

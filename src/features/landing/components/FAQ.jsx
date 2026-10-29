import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: '¿Cómo solicito una cotización?',
    a: 'Agrega los productos que necesitas al carrito y presiona "Enviar Cotización por WhatsApp". Recibirás atención inmediata.',
  },
  {
    q: '¿Qué líneas de productos manejan?',
    a: 'Contamos con resinas epóxicas, cerraduras, candados, brocas de cobalto, material eléctrico e insumos de ferretería.',
  },
  {
    q: '¿Cuáles son las formas de pago?',
    a: 'Aceptamos transferencias bancarias, pago por QR y efectivo.',
  },
  {
    q: '¿Cómo coordino la entrega de mi pedido?',
    a: 'Al enviar tu pedido por WhatsApp coordinamos el retiro directo o el envío según tu ubicación.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="scroll-mt-20 border-t border-[#334155] bg-[#1e293b] py-16 lg:py-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Preguntas frecuentes
        </h2>

        <div className="mt-8 divide-y divide-[#334155] rounded-2xl border border-[#334155] bg-[#0f172a] overflow-hidden">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`text-sm font-semibold ${
                      isOpen ? 'text-[#a5b4fc]' : 'text-white'
                    }`}
                  >
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`ml-4 shrink-0 text-[#94a3b8] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#6366f1]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 text-xs leading-relaxed text-[#94a3b8]">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

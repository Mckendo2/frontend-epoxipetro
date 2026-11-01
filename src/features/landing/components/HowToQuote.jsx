const steps = [
  {
    title: 'Elige los productos',
    text: 'Busca por nombre, marca o código y toca Agregar.',
  },
  {
    title: 'Revisa tu lista',
    text: 'Ajusta cantidades y mira el total estimado en bolivianos.',
  },
  {
    title: 'Envíala por WhatsApp',
    text: 'Te confirmamos disponibilidad, precio final y entrega.',
  },
];

const faqs = [
  {
    q: '¿La disponibilidad es real?',
    a: 'Sí. Se lee de nuestro inventario cada vez que abres la página. Si un producto dice “Consultar disponibilidad”, escríbenos y lo confirmamos.',
  },
  {
    q: '¿Enviar la lista me compromete a comprar?',
    a: 'No. La lista es una consulta: te respondemos con el precio final y tú decides.',
  },
  {
    q: '¿Cómo coordino pago y entrega?',
    a: 'Lo acordamos por WhatsApp al confirmar tu cotización: retiro en tienda o envío según tu ubicación.',
  },
  {
    q: '¿Qué hago si no encuentro un producto?',
    a: 'Escríbenos con lo que buscas y te decimos qué podemos ofrecerte.',
  },
];

export default function HowToQuote() {
  return (
    <section className="bg-paper py-16 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div id="como-cotizar" className="scroll-mt-16 lg:col-span-5">
          <h2
            className="font-display text-5xl font-semibold leading-none text-ink sm:text-6xl"
            style={{ textWrap: 'balance' }}
          >
            Cómo cotizar
          </h2>
          <ol className="mt-8 border-t border-rule">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-5 border-b border-rule py-5">
                <span
                  className="font-display text-4xl font-semibold leading-none tabular-nums text-action"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div id="preguntas" className="scroll-mt-16 lg:col-span-7">
          <h2
            className="font-display text-5xl font-semibold leading-none text-ink sm:text-6xl"
            style={{ textWrap: 'balance' }}
          >
            Preguntas frecuentes
          </h2>
          <div className="mt-8 border-t border-rule">
            {faqs.map((faq) => (
              <details key={faq.q} className="group border-b border-rule">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span
                    className="font-display text-3xl font-medium leading-none text-action group-open:hidden"
                    aria-hidden="true"
                  >
                    +
                  </span>
                  <span
                    className="hidden font-display text-3xl font-medium leading-none text-action group-open:inline"
                    aria-hidden="true"
                  >
                    −
                  </span>
                </summary>
                <p className="max-w-xl pb-5 text-sm leading-relaxed text-slate-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import { Search, MessageSquare, MapPin } from 'lucide-react';

const steps = [
  {
    number: '1',
    Icon: Search,
    title: 'Explorá el catálogo',
    text: 'Mirá los productos disponibles en nuestro catálogo en línea con precios y stock actualizados.',
  },
  {
    number: '2',
    Icon: MessageSquare,
    title: 'Pedí tu cotización',
    text: 'Agregá productos al carrito o escribinos directo por WhatsApp para recibir un presupuesto.',
  },
  {
    number: '3',
    Icon: MapPin,
    title: 'Retirá en tienda',
    text: 'Coordiná la entrega o pasá a retirar por nuestro local con tu pedido listo.',
  },
];

export default function Process() {
  return (
    <section id="proceso" className="scroll-mt-20 bg-canvas py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2
          className="text-3xl font-bold tracking-tight text-body sm:text-4xl"
          style={{ textWrap: 'balance' }}
        >
          Cómo comprar
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          Tres pasos para tener tus materiales.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-6">
          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col">
              <span className="text-5xl font-extrabold text-edge">{step.number}</span>
              <div className="mt-3 flex items-center gap-2">
                <step.Icon size={18} className="text-brass" aria-hidden="true" />
                <h3 className="font-semibold text-body">{step.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

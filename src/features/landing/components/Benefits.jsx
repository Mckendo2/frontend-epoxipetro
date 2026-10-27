import { Package, ShieldCheck, MessageCircle, Users } from 'lucide-react';

const items = [
  {
    Icon: Package,
    title: 'Variedad en stock',
    text: 'Cerraduras, candados, resinas, eléctricos e insumos listos para venta o cotización.',
  },
  {
    Icon: ShieldCheck,
    title: 'Marcas reconocidas',
    text: 'Yale, Cisa, Master Lock, Petro y otras marcas con respaldo de calidad.',
  },
  {
    Icon: MessageCircle,
    title: 'Cotización rápida',
    text: 'Escribinos por WhatsApp y recibí tu presupuesto sin demora.',
  },
  {
    Icon: Users,
    title: 'Asesoramiento directo',
    text: 'Te ayudamos a elegir el producto correcto para tu proyecto.',
  },
];

export default function Benefits() {
  return (
    <section id="ventajas" className="scroll-mt-20 bg-panel py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2
          className="text-3xl font-bold tracking-tight text-body sm:text-4xl"
          style={{ textWrap: 'balance' }}
        >
          Por qué elegirnos
        </h2>
        <p className="mt-3 max-w-xl text-muted">
          Lo que nos diferencia al momento de equipar tu obra o proyecto.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-brass/10 text-brass">
                <item.Icon size={20} aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-body">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

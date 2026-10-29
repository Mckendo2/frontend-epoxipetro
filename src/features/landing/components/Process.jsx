import { Search, ShoppingBag, MessageSquare } from 'lucide-react';

const steps = [
  {
    number: '01',
    Icon: Search,
    title: 'Elige tus productos',
    text: 'Busca los materiales y revisa precios y disponibilidad.',
  },
  {
    number: '02',
    Icon: ShoppingBag,
    title: 'Suma a tu cotización',
    text: 'Selecciona las cantidades que necesitas en el carrito.',
  },
  {
    number: '03',
    Icon: MessageSquare,
    title: 'Envía por WhatsApp',
    text: 'Recibe confirmación rápida y coordina tu entrega.',
  },
];

export default function Process() {
  return (
    <section id="proceso" className="scroll-mt-20 relative overflow-hidden bg-[#0f172a] py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 bg-login-grid opacity-40" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Cómo comprar
        </h2>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex items-start gap-4 rounded-xl border border-[#334155] bg-[#1e293b] p-6"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                }}
              >
                {step.number}
              </span>
              <div>
                <h3 className="text-base font-bold text-white">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#94a3b8]">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

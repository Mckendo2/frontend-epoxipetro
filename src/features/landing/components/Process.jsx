import { Search, ShoppingBag, MessageSquare, CheckCircle } from 'lucide-react';

const steps = [
  {
    number: '01',
    Icon: Search,
    title: 'Explora el catálogo en línea',
    text: 'Filtra por rubro o utiliza el buscador técnico para revisar especificaciones, marcas, precios unitarios y unidades disponibles.',
  },
  {
    number: '02',
    Icon: ShoppingBag,
    title: 'Arma tu lista de materiales',
    text: 'Agrega los productos y las cantidades requeridas a tu cotización. El sistema calcula automáticamente los subtotales en Bolivianos.',
  },
  {
    number: '03',
    Icon: MessageSquare,
    title: 'Envía y coordina por WhatsApp',
    text: 'Con un clic envía el detalle completo a nuestro equipo comercial para confirmar despacho a obra o retiro inmediato.',
  },
];

export default function Process() {
  return (
    <section id="proceso" className="scroll-mt-24 relative overflow-hidden bg-[#0f172a] py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-login-grid opacity-50" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/15 px-3.5 py-1 text-xs font-semibold text-[#a5b4fc]">
            <CheckCircle size={14} />
            <span>Flujo de Abastecimiento</span>
          </span>
          <h2
            className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
            style={{ textWrap: 'balance' }}
          >
            Cómo cotizar y adquirir tus materiales
          </h2>
          <p className="mt-3 text-base text-[#94a3b8]">
            Un proceso directo en tres etapas pensado para agilizar tus compras técnicas.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative flex flex-col justify-between rounded-2xl border border-[#334155] bg-[#1e293b] p-7 transition-all hover:border-[#6366f1]/50"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)',
                    }}
                  >
                    {step.number}
                  </span>
                  <step.Icon size={20} className="text-[#a5b4fc]" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#94a3b8]">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Package, ShieldCheck, MessageCircle, Users } from 'lucide-react';

const items = [
  {
    Icon: Package,
    title: 'Stock en tiempo real',
    text: 'Consulta disponibilidad actualizada directamente en nuestro catálogo.',
  },
  {
    Icon: ShieldCheck,
    title: 'Marcas originales',
    text: 'Productos garantizados de marcas como Yale, Cisa, Master Lock y Petro.',
  },
  {
    Icon: MessageCircle,
    title: 'Cotización inmediata',
    text: 'Arma tu pedido en la web y envíalo con un clic a nuestro WhatsApp.',
  },
  {
    Icon: Users,
    title: 'Atención directa',
    text: 'Te orientamos en la elección del material ideal para tu trabajo.',
  },
];

export default function Benefits() {
  return (
    <section id="ventajas" className="scroll-mt-20 border-y border-[#334155] bg-[#1e293b] py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Por qué elegirnos
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-[#334155] bg-[#0f172a] p-5 transition-colors hover:border-[#6366f1]/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#6366f1]/30 bg-[#6366f1]/15 text-[#a5b4fc]">
                <item.Icon size={19} aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#94a3b8]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

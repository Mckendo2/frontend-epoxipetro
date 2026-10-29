import { Package, ShieldCheck, MessageCircle, Users, CheckCircle2 } from 'lucide-react';

const items = [
  {
    Icon: Package,
    tag: 'Disponibilidad Real',
    title: 'Inventario sincronizado y listo para despacho',
    text: 'Consulta en línea la disponibilidad real de resinas epóxicas, cerraduras, candados, brocas y componentes eléctricos sin contratiempos.',
  },
  {
    Icon: ShieldCheck,
    tag: 'Calidad Industrial',
    title: 'Marcas líderes y formulaciones confiables',
    text: 'Trabajamos con fabricantes reconocidos como Yale, Cisa, Master Lock, Petro y Ultra para asegurar máxima durabilidad en obra.',
  },
  {
    Icon: MessageCircle,
    tag: 'Respuesta Ágil',
    title: 'Cotizaciones formales al instante',
    text: 'Selecciona tus ítems en el portal y envía tu requerimiento directo a nuestro equipo comercial vía WhatsApp con cálculo automático.',
  },
  {
    Icon: Users,
    tag: 'Soporte Técnico',
    title: 'Asesoramiento para proyectos y contratistas',
    text: 'Orientación especializada en rendimiento de sistemas epóxicos, niveles de seguridad en cerrajería y selección de herramientas.',
  },
];

export default function Benefits() {
  return (
    <section id="ventajas" className="scroll-mt-24 border-y border-[#334155] bg-[#1e293b] py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          {/* Left Sticky Editorial Column (Westlake Epoxy style) */}
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#6366f1]/30 bg-[#6366f1]/15 px-3.5 py-1 text-xs font-semibold text-[#a5b4fc]">
              <CheckCircle2 size={14} />
              <span>Estándar de Calidad</span>
            </span>
            <h2
              className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
              style={{ textWrap: 'balance' }}
            >
              Por qué profesionales e industrias confían en Alvarez
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#94a3b8]" style={{ textWrap: 'pretty' }}>
              Combinamos un catálogo técnico de alto desempeño con atención directa y transparente,
              facilitando el abastecimiento tanto para proyectos de ingeniería y construcción como
              para requerimientos particulares.
            </p>

            <div className="mt-8 rounded-xl border border-[#334155] bg-[#0f172a] p-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)',
                  }}
                >
                  A
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Compromiso Técnico y Comercial</p>
                  <p className="text-xs text-[#94a3b8]">
                    Precios claros en Bolivianos y disponibilidad verificada
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right 2x2 Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
            {items.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-[#334155] bg-[#0f172a] p-6 transition-all hover:border-[#6366f1]/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#6366f1]/30 bg-[#6366f1]/15 text-[#a5b4fc]">
                    <item.Icon size={20} aria-hidden="true" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6366f1]">
                    {item.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#94a3b8]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  Copy,
  Check,
  ShoppingBag,
  ShieldAlert,
  Package,
} from 'lucide-react';
import { useLandingCart } from '../context/LandingCartContext';
import { siteConfig } from '../data/siteConfig';
import { getProductImageUrl } from '../../../config/api';

const formatCurrency = (amount) =>
  Number(amount || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalAmount,
    lastNotification,
  } = useLandingCart();

  const [cliente, setCliente] = useState({
    nombre: '',
    celular: '',
    modalidad: 'despacho',
    nota: '',
  });

  const [copied, setCopied] = useState(false);

  if (!isCartOpen) return null;

  const buildQuoteText = () => {
    let msg = `*SOLICITUD DE COTIZACIÓN - ${siteConfig.brand.fullName.toUpperCase()}*\n`;
    msg += `📅 *Fecha:* ${new Date().toLocaleDateString('es-BO')}\n`;
    if (cliente.nombre) msg += `👤 *Cliente:* ${cliente.nombre}\n`;
    if (cliente.celular) msg += `📱 *Contacto:* ${cliente.celular}\n`;

    const modalidadLabels = {
      despacho: 'Envío / Despacho a obra o domicilio',
      retiro: 'Retiro en local comercial',
      consulta: 'Cotización / Consulta de Disponibilidad',
    };
    msg += `🚚 *Modalidad:* ${modalidadLabels[cliente.modalidad] || 'A coordinar'}\n\n`;

    msg += `*DETALLE DE MATERIALES:*\n`;
    cart.forEach((item, idx) => {
      const subtotal = item.cantidad * item.precio_venta;
      const marcaStr = item.marca && item.marca !== 'Sin marca' ? ` [${item.marca}]` : '';
      msg += `${idx + 1}. *${item.producto_nombre}*${marcaStr}\n`;
      msg += `   • Cant: ${item.cantidad} ${item.unidad} | P.Unit: Bs. ${formatCurrency(item.precio_venta)} | Subtotal: Bs. ${formatCurrency(subtotal)}\n`;
    });

    msg += `\n*TOTAL ESTIMADO: Bs. ${formatCurrency(totalAmount)}*\n`;

    if (cliente.nota) {
      msg += `\n💬 *Nota adicional:* ${cliente.nota}\n`;
    }

    msg += `\n_Cotización generada desde la plataforma web oficial de Alvarez Ferretería._`;
    return msg;
  };

  const handleSendWhatsApp = (e) => {
    e.preventDefault();
    if (!cliente.nombre.trim()) {
      alert('Por favor ingresa tu nombre o el de tu empresa para la cotización.');
      return;
    }

    const text = buildQuoteText();
    const waUrl = `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = () => {
    const text = buildQuoteText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer — Styled in LoginPage.jsx Slate & Indigo palette */}
      <aside
        className="relative flex h-full w-full max-w-lg flex-col border-l border-[#334155] bg-[#0f172a] text-[#f8fafc] shadow-2xl transition-transform duration-300"
        role="dialog"
        aria-label="Carrito de cotización"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#334155] bg-[#1e293b] px-6 py-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)',
              }}
            >
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Cotización de Materiales</h2>
              <p className="text-xs text-[#94a3b8]">
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'} seleccionados
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="rounded-lg border border-[#334155] bg-[#0f172a] p-2 text-[#94a3b8] hover:border-[#475569] hover:text-white"
            aria-label="Cerrar panel de cotización"
          >
            <X size={18} />
          </button>
        </div>

        {/* Real-time Notification Banner */}
        {lastNotification && (
          <div className="border-b border-[#6366f1]/30 bg-[#6366f1]/15 px-6 py-2.5 text-xs font-medium text-[#a5b4fc] flex items-center gap-2">
            <ShieldAlert size={15} className="shrink-0" />
            <span>{lastNotification}</span>
          </div>
        )}

        {/* Content */}
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#334155] bg-[#1e293b] text-[#94a3b8]">
              <ShoppingBag size={30} />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">
              Tu lista de cotización está vacía
            </h3>
            <p className="mt-1 max-w-xs text-xs text-[#94a3b8]">
              Explora nuestro catálogo para sumar materiales a tu presupuesto.
            </p>
            <button
              onClick={() => {
                setIsCartOpen(false);
                const el = document.getElementById('productos');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-6 rounded-lg bg-[#6366f1] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#4f46e5]"
            >
              Explorar materiales
            </button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#334155]">
              {cart.map((item) => {
                const subtotal = item.cantidad * item.precio_venta;
                const isMax =
                  item.stock_disponible > 0 && item.cantidad >= item.stock_disponible;
                const realImg = getProductImageUrl(item.imagen_url);

                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex gap-3.5">
                      {/* Thumbnail or clean icon */}
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#334155] bg-[#1e293b] flex items-center justify-center">
                        {realImg ? (
                          <img
                            src={realImg}
                            alt={item.producto_nombre}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package size={22} className="text-[#a5b4fc]" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {item.marca && item.marca !== 'Sin marca' && (
                              <span className="inline-block rounded border border-[#6366f1]/30 bg-[#6366f1]/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#a5b4fc]">
                                {item.marca}
                              </span>
                            )}
                            <h4 className="truncate text-sm font-bold text-white capitalize">
                              {item.producto_nombre}
                            </h4>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-[#94a3b8] hover:text-red-400 p-1"
                            aria-label={`Eliminar ${item.producto_nombre}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {/* Price & Quantity */}
                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="flex items-center rounded-lg border border-[#334155] bg-[#1e293b]">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="px-2.5 py-1 text-[#cbd5e1] hover:text-white hover:bg-[#334155] rounded-l-lg"
                              aria-label="Disminuir cantidad"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="px-2.5 py-0.5 text-xs font-bold text-white">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              disabled={isMax}
                              className={`px-2.5 py-1 text-[#cbd5e1] hover:text-white hover:bg-[#334155] rounded-r-lg ${
                                isMax ? 'opacity-40 cursor-not-allowed' : ''
                              }`}
                              aria-label="Aumentar cantidad"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-[#a5b4fc]">
                              Bs. {formatCurrency(subtotal)}
                            </span>
                            <span className="block text-[10px] text-[#94a3b8]">
                              Bs. {formatCurrency(item.precio_venta)} c/u
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Form & Actions — Inputs styled like LoginPage.jsx */}
            <div className="border-t border-[#334155] bg-[#1e293b] p-5 space-y-4">
              {/* Total Row */}
              <div className="flex items-baseline justify-between border-b border-[#334155] pb-3">
                <span className="text-sm font-medium text-[#cbd5e1]">
                  Total Cotizado Estimado:
                </span>
                <span className="text-xl font-extrabold text-white">
                  <span className="text-xs font-semibold text-[#a5b4fc] mr-1">Bs.</span>
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              {/* Client Form */}
              <form onSubmit={handleSendWhatsApp} className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-[#cbd5e1]">
                      Nombre / Razón Social <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Pérez / Empresa"
                      value={cliente.nombre}
                      onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#334155] bg-[#0f172a] px-2.5 py-2 text-xs text-[#f8fafc] placeholder:text-[#64748b] focus:border-[#6366f1] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#cbd5e1]">
                      Teléfono / Celular
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej. 71234567"
                      value={cliente.celular}
                      onChange={(e) => setCliente({ ...cliente, celular: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#334155] bg-[#0f172a] px-2.5 py-2 text-xs text-[#f8fafc] placeholder:text-[#64748b] focus:border-[#6366f1] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#cbd5e1]">
                    Modalidad de Interés
                  </label>
                  <select
                    value={cliente.modalidad}
                    onChange={(e) => setCliente({ ...cliente, modalidad: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#334155] bg-[#0f172a] px-2.5 py-2 text-xs text-[#f8fafc] focus:border-[#6366f1] focus:outline-none"
                  >
                    <option value="despacho">Envío / Despacho a obra o taller</option>
                    <option value="retiro">Retiro personal en local comercial</option>
                    <option value="consulta">Solo consultar disponibilidad y precios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#cbd5e1]">
                    Nota o requerimiento (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Requiero factura, entrega para mañana..."
                    value={cliente.nota}
                    onChange={(e) => setCliente({ ...cliente, nota: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#334155] bg-[#0f172a] px-2.5 py-2 text-xs text-[#f8fafc] placeholder:text-[#64748b] focus:border-[#6366f1] focus:outline-none"
                  />
                </div>

                {/* Primary CTA button */}
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6366f1] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#6366f1]/25 transition-all hover:bg-[#4f46e5] active:scale-[0.99]"
                >
                  <MessageCircle size={18} />
                  <span>Enviar Cotización por WhatsApp</span>
                </button>
              </form>

              {/* Secondary options */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-[#94a3b8] hover:text-[#a5b4fc] transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? '¡Copiado al portapapeles!' : 'Copiar texto de cotización'}</span>
                </button>

                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[#94a3b8] hover:text-red-400 transition-colors"
                >
                  Vaciar lista
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

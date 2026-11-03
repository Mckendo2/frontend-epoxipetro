import { useState, useEffect } from 'react';
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
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    if (!isCartOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isCartOpen, setIsCartOpen]);

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

    msg += `\n_Cotización generada desde la plataforma web oficial de Epoxipetro._`;
    return msg;
  };

  const handleSendWhatsApp = (e) => {
    e.preventDefault();
    if (!cliente.nombre.trim()) {
      setNameError(true);
      document.getElementById('cotizacion-nombre')?.focus();
      return;
    }
    setNameError(false);

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

      {/* Drawer */}
      <aside
        className="relative flex h-full w-full max-w-lg flex-col border-l border-line bg-ink text-slate-50 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Lista de cotización"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line bg-ink-soft px-6 py-5">
          <div>
            <h2 className="font-display text-3xl font-semibold leading-none text-white">
              Mi lista de cotización
            </h2>
            <p className="mt-1.5 text-sm text-slate-400">
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="rounded-md border border-line p-2 text-slate-400 hover:border-slate-500 hover:text-white"
            aria-label="Cerrar lista de cotización"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Real-time Notification Banner */}
        {lastNotification && (
          <div
            role="status"
            className="border-b border-[#6366f1]/30 bg-[#6366f1]/15 px-6 py-2.5 text-sm font-medium text-[#c7d2fe] flex items-center gap-2"
          >
            <ShieldAlert size={15} className="shrink-0" aria-hidden="true" />
            <span>{lastNotification}</span>
          </div>
        )}

        {/* Content */}
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingBag size={32} className="text-slate-500" aria-hidden="true" />
            <h3 className="mt-4 font-display text-3xl font-semibold leading-none text-white">
              Tu lista está vacía
            </h3>
            <p className="mt-2 max-w-xs text-sm text-slate-400">
              Agrega productos desde la lista y aquí verás el total estimado.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsCartOpen(false);
                const el = document.getElementById('productos');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-6 rounded-md bg-[#6366f1] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4f46e5]"
            >
              Ver productos
            </button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Items list */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 divide-y divide-[#334155]">
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
              <form onSubmit={handleSendWhatsApp} noValidate className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="cotizacion-nombre"
                      className="block text-xs font-medium text-slate-300"
                    >
                      Nombre o empresa
                    </label>
                    <input
                      id="cotizacion-nombre"
                      name="nombre"
                      type="text"
                      autoComplete="name"
                      required
                      aria-invalid={nameError}
                      aria-describedby={nameError ? 'cotizacion-nombre-error' : undefined}
                      placeholder="Juan Pérez…"
                      value={cliente.nombre}
                      onChange={(e) => {
                        setCliente({ ...cliente, nombre: e.target.value });
                        if (nameError) setNameError(false);
                      }}
                      className={`mt-1 w-full rounded-md border bg-[#0f172a] px-2.5 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-[#6366f1] ${
                        nameError ? 'border-red-400' : 'border-[#334155]'
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cotizacion-celular"
                      className="block text-xs font-medium text-slate-300"
                    >
                      Celular
                    </label>
                    <input
                      id="cotizacion-celular"
                      name="celular"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="71234567…"
                      value={cliente.celular}
                      onChange={(e) => setCliente({ ...cliente, celular: e.target.value })}
                      className="mt-1 w-full rounded-md border border-[#334155] bg-[#0f172a] px-2.5 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-[#6366f1]"
                    />
                  </div>
                </div>
                {nameError && (
                  <p id="cotizacion-nombre-error" role="alert" className="text-xs text-red-300">
                    Escribe tu nombre o el de tu empresa para enviar la cotización.
                  </p>
                )}

                <div>
                  <label
                    htmlFor="cotizacion-modalidad"
                    className="block text-xs font-medium text-slate-300"
                  >
                    ¿Cómo lo necesitas?
                  </label>
                  <select
                    id="cotizacion-modalidad"
                    name="modalidad"
                    value={cliente.modalidad}
                    onChange={(e) => setCliente({ ...cliente, modalidad: e.target.value })}
                    style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}
                    className="mt-1 w-full rounded-md border border-[#334155] px-2.5 py-2.5 text-sm focus:border-[#6366f1]"
                  >
                    <option value="despacho">Envío a obra o taller</option>
                    <option value="retiro">Retiro en tienda</option>
                    <option value="consulta">Solo consultar disponibilidad y precios</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="cotizacion-nota"
                    className="block text-xs font-medium text-slate-300"
                  >
                    Nota (opcional)
                  </label>
                  <input
                    id="cotizacion-nota"
                    name="nota"
                    type="text"
                    autoComplete="off"
                    placeholder="Necesito factura, entrega mañana…"
                    value={cliente.nota}
                    onChange={(e) => setCliente({ ...cliente, nota: e.target.value })}
                    className="mt-1 w-full rounded-md border border-[#334155] bg-[#0f172a] px-2.5 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-[#6366f1]"
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-3 text-sm font-bold text-ink transition-colors hover:bg-[#3ee27b]"
                >
                  <MessageCircle size={18} aria-hidden="true" />
                  <span>Enviar cotización por WhatsApp</span>
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

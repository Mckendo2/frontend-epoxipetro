import { useState } from 'react';
import { X, Trash2, Plus, Minus, MessageCircle, Copy, Check, ShoppingBag, Store, Warehouse, ShieldAlert } from 'lucide-react';
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
    modalidad: 'retiro', // 'retiro' | 'almacen' | 'consulta'
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
      retiro: 'Retiro en Tienda',
      almacen: 'Despacho desde Almacén Central (Obra/Mayorista)',
      consulta: 'Cotización / Consulta de Disponibilidad',
    };
    msg += `🚚 *Modalidad:* ${modalidadLabels[cliente.modalidad] || 'A coordinar'}\n\n`;

    msg += `*DETALLE DE MATERIALES:*\n`;
    cart.forEach((item, idx) => {
      const subtotal = item.cantidad * item.precio_venta;
      const marcaStr = item.marca ? ` [${item.marca}]` : '';
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

      {/* Drawer */}
      <aside
        className="relative flex h-full w-full max-w-lg flex-col border-l border-edge bg-panel text-body shadow-2xl transition-transform duration-300"
        role="dialog"
        aria-label="Carrito de cotización"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-edge px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brass/15 text-brass">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-body">Cotización de Materiales</h2>
              <p className="text-xs text-muted">
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'} seleccionados
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="rounded p-2 text-muted hover:bg-raised hover:text-body"
            aria-label="Cerrar panel de cotización"
          >
            <X size={20} />
          </button>
        </div>

        {/* Real-time Notification Banner */}
        {lastNotification && (
          <div className="border-b border-brass/20 bg-brass/10 px-6 py-2.5 text-xs font-medium text-brass flex items-center gap-2">
            <ShieldAlert size={15} className="shrink-0" />
            <span>{lastNotification}</span>
          </div>
        )}

        {/* Content */}
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-raised text-muted">
              <ShoppingBag size={32} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-body">Tu lista de cotización está vacía</h3>
            <p className="mt-1 max-w-xs text-xs text-muted">
              Explora los productos de nuestro almacén y tienda física para sumarlos a tu presupuesto.
            </p>
            <button
              onClick={() => {
                setIsCartOpen(false);
                const el = document.getElementById('productos');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="mt-6 rounded-lg bg-brass px-5 py-2.5 text-xs font-semibold text-canvas transition-colors hover:bg-brass-light"
            >
              Explorar inventario en vivo
            </button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-edge">
              {cart.map((item) => {
                const subtotal = item.cantidad * item.precio_venta;
                const isMax = item.stock_total > 0 && item.cantidad >= item.stock_total;

                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded border border-edge bg-canvas">
                        <img
                          src={getProductImageUrl(item.imagen_url, item.categoria)}
                          alt={item.producto_nombre}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = '/landing/insumos.png';
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {item.marca && (
                              <span className="inline-block rounded bg-brass/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brass">
                                {item.marca}
                              </span>
                            )}
                            <h4 className="truncate text-sm font-semibold text-body">
                              {item.producto_nombre}
                            </h4>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted hover:text-red-400 p-1"
                            aria-label={`Eliminar ${item.producto_nombre}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>

                        {/* Stock Origin Badges */}
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                          {item.stock_tienda > 0 && (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 text-emerald-400">
                              <Store size={10} />
                              <span>Tienda: {item.stock_tienda}</span>
                            </span>
                          )}
                          {item.stock_almacen > 0 && (
                            <span className="inline-flex items-center gap-1 rounded bg-blue-950/60 border border-blue-800/50 px-1.5 py-0.5 text-blue-300">
                              <Warehouse size={10} />
                              <span>Almacén: {item.stock_almacen}</span>
                            </span>
                          )}
                        </div>

                        {/* Price & Quantity */}
                        <div className="mt-2.5 flex items-center justify-between">
                          <div className="flex items-center rounded border border-edge bg-canvas">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="px-2 py-1 text-muted hover:text-body hover:bg-raised"
                              aria-label="Disminuir cantidad"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="px-2.5 py-0.5 text-xs font-semibold text-body">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              disabled={isMax}
                              className={`px-2 py-1 text-muted hover:text-body hover:bg-raised ${
                                isMax ? 'opacity-40 cursor-not-allowed' : ''
                              }`}
                              aria-label="Aumentar cantidad"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-bold text-brass">
                              Bs. {formatCurrency(subtotal)}
                            </span>
                            <span className="block text-[10px] text-muted">
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

            {/* Bottom Form & Actions */}
            <div className="border-t border-edge bg-canvas/80 p-5 space-y-4">
              {/* Total Row */}
              <div className="flex items-baseline justify-between border-b border-edge/60 pb-3">
                <span className="text-sm font-medium text-muted">Total Cotizado Estimado:</span>
                <span className="text-xl font-extrabold text-brass">
                  Bs. {formatCurrency(totalAmount)}
                </span>
              </div>

              {/* Client Form */}
              <form onSubmit={handleSendWhatsApp} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-muted">
                      Tu Nombre / Razón Social <span className="text-brass">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Pérez / Constructora"
                      value={cliente.nombre}
                      onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                      className="mt-1 w-full rounded border border-edge bg-panel px-2.5 py-1.5 text-xs text-body placeholder:text-muted/60 focus:border-brass focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted">Teléfono / Celular</label>
                    <input
                      type="tel"
                      placeholder="Ej. 71234567"
                      value={cliente.celular}
                      onChange={(e) => setCliente({ ...cliente, celular: e.target.value })}
                      className="mt-1 w-full rounded border border-edge bg-panel px-2.5 py-1.5 text-xs text-body placeholder:text-muted/60 focus:border-brass focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted">Modalidad de Interés</label>
                  <select
                    value={cliente.modalidad}
                    onChange={(e) => setCliente({ ...cliente, modalidad: e.target.value })}
                    className="mt-1 w-full rounded border border-edge bg-panel px-2.5 py-1.5 text-xs text-body focus:border-brass focus:outline-none"
                  >
                    <option value="retiro">Retiro inmediato en Tienda Física</option>
                    <option value="almacen">Despacho desde Almacén Central (Mayorista/Obra)</option>
                    <option value="consulta">Solo consultar disponibilidad y precios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-muted">
                    Nota o consulta adicional (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Requiero factura, entrega a domicilio, etc."
                    value={cliente.nota}
                    onChange={(e) => setCliente({ ...cliente, nota: e.target.value })}
                    className="mt-1 w-full rounded border border-edge bg-panel px-2.5 py-1.5 text-xs text-body placeholder:text-muted/60 focus:border-brass focus:outline-none"
                  />
                </div>

                {/* Primary CTA button */}
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:bg-[#20ba59] active:scale-[0.99]"
                >
                  <MessageCircle size={18} className="fill-white" />
                  <span>Enviar Cotización por WhatsApp</span>
                </button>
              </form>

              {/* Secondary options */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-muted hover:text-brass transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? '¡Copiado al portapapeles!' : 'Copiar texto de cotización'}</span>
                </button>

                <button
                  type="button"
                  onClick={clearCart}
                  className="text-muted/70 hover:text-red-400 transition-colors"
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

import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';

const S = {
  root: {
    padding: '6px 8px',
    width: '100%',
    backgroundColor: '#fff',
    color: '#000',
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: '11px',
    lineHeight: '1.3',
  },
  center: { textAlign: 'center' },
  bold: { fontWeight: 'bold' },
  row: { display: 'flex', justifyContent: 'space-between' },
  divider: { borderTop: '1px dashed #000', margin: '4px 0' },
  bigTotal: { fontWeight: 'bold', fontSize: '14px' },
  small: { fontSize: '10px' },
  mb2: { marginBottom: '2px' },
  mb4: { marginBottom: '4px' },
  mt4: { marginTop: '4px' },
};

const TicketVenta = forwardRef(({ ventaInfo, cliente, items, total, descuento = 0, pagado, cambio = 0 }, ref) => {
  const subtotalNeto = total + descuento;

  return (
    <div ref={ref} style={S.root} data-ticket-root>
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0 !important;
            padding: 0 !important;
          }
          html {
            margin: 0 !important;
            padding: 0 !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            width: 80mm !important;
            background: white !important;
          }
          body > * {
            display: none !important;
          }
          [data-ticket-root],
          [data-ticket-root] * {
            display: revert !important;
          }
          [data-ticket-root] {
            display: block !important;
            margin: 0 !important;
            padding: 3mm 3mm !important;
            width: 80mm !important;
            box-sizing: border-box !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
          }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* CABECERA */}
      <div style={{ ...S.center, ...S.mb2 }}>
        <div style={{ fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px' }}>FERRETERÍA ALVAREZ</div>
        <div>La Paz, El Alto</div>
        <div>Cel: +591 65555942</div>
      </div>

      <div style={S.divider} />

      {/* DATOS */}
      <div style={S.mb2}>
        <div style={S.bold}>Ticket N°: {ventaInfo?.nro_ticket || '00000001'}</div>
        <div>Fecha: {ventaInfo?.fecha ? format(new Date(ventaInfo.fecha), 'dd/MM/yyyy HH:mm') : format(new Date(), 'dd/MM/yyyy HH:mm')}</div>
        <div>Cliente: {cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Consumidor Final'}</div>
      </div>

      <div style={S.divider} />

      {/* ITEMS */}
      <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', margin: '2px 0' }}>
        <thead>
          <tr style={{ borderBottom: '1px dashed #000' }}>
            <th style={{ textAlign: 'left', width: '12%', paddingBottom: '2px' }}>Cant</th>
            <th style={{ textAlign: 'left', width: '48%', paddingBottom: '2px' }}>Descripción</th>
            <th style={{ textAlign: 'right', width: '20%', paddingBottom: '2px' }}>P.U.</th>
            <th style={{ textAlign: 'right', width: '20%', paddingBottom: '2px' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item, idx) => (
            <tr key={idx}>
              <td style={{ verticalAlign: 'top', padding: '2px 0' }}>{Number(item.cantidad)}</td>
              <td style={{ verticalAlign: 'top', padding: '2px 2px 2px 0' }}>
                {item.producto}{item.nombre && item.nombre !== 'Unidad' ? ` - ${item.nombre}` : ''}
              </td>
              <td style={{ verticalAlign: 'top', textAlign: 'right', padding: '2px 0' }}>{Number(item.precio_venta).toFixed(2)}</td>
              <td style={{ verticalAlign: 'top', textAlign: 'right', padding: '2px 0' }}>{(item.cantidad * item.precio_venta).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={S.divider} />

      {/* TOTALES */}
      <div style={S.mb2}>
        <div style={S.row}><span>SUBTOTAL:</span><span>Bs. {subtotalNeto.toFixed(2)}</span></div>
        {descuento > 0 && <div style={S.row}><span>DESCUENTO:</span><span>-Bs. {Number(descuento).toFixed(2)}</span></div>}
        <div style={{ ...S.row, ...S.bigTotal, marginTop: '2px' }}>
          <span>TOTAL:</span><span>Bs. {Number(total).toFixed(2)}</span>
        </div>
      </div>

      {/* PAGO */}
      {(pagado !== undefined || cambio > 0) && (
        <div style={S.mb2}>
          {pagado !== undefined && <div style={S.row}><span>Monto Pagado:</span><span>Bs. {Number(pagado).toFixed(2)}</span></div>}
          {cambio > 0 && <div style={{ ...S.row, ...S.bold }}><span>CAMBIO:</span><span>Bs. {Number(cambio).toFixed(2)}</span></div>}
        </div>
      )}

      <div style={S.divider} />

      {/* PIE */}
      <div style={{ ...S.center, marginTop: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
          <QRCodeSVG
            value={`Venta: ${ventaInfo?.nro_ticket || '000001'} | Total: Bs. ${Number(total).toFixed(2)} | FERRETERÍA ALVAREZ`}
            size={80}
          />
        </div>
        <div style={S.small}>Documento no válido como factura fiscal.</div>
        <div style={S.bold}>¡Gracias por su compra!</div>
      </div>
    </div>
  );
});

export default TicketVenta;

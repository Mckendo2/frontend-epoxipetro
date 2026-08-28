import React, { forwardRef } from 'react';

const formatMonto = (monto) => Number(parseFloat(monto || 0).toFixed(2)).toLocaleString('de-DE');

const S = {
  root: {
    padding: '6px 8px',
    width: '100%',
    backgroundColor: '#fff',
    color: '#000',
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: '12px',
    lineHeight: '1.4',
    fontWeight: 'bold',        /* base: todo el ticket en negrita */
  },
  center: { textAlign: 'center' },
  bold: { fontWeight: 'bold' },
  row: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' },
  divider: { borderTop: '1px dashed #000', margin: '4px 0' },
  bigTotal: { fontWeight: 'bold', fontSize: '15px' },
  small: { fontSize: '10px', fontWeight: 'bold' },
  mb2: { marginBottom: '2px' },
};

const TicketCotizacion = forwardRef(({ data }, ref) => {
  if (!data) return null;
  const { cotizacionInfo, cliente, items, total, adelanto, saldo } = data;

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
        <div style={{ fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px' }}>FERRETERÍA ALVAREZ</div>
        <div style={{ fontWeight: 'bold' }}>La Paz, El Alto</div>
        <div style={{ fontWeight: 'bold' }}>Cel: +591 65555942</div>
        <div style={{ ...S.bold, marginTop: '3px' }}>COTIZACIÓN / PRE-VENTA</div>
      </div>

      <div style={S.divider} />

      {/* INFO */}
      <div style={S.mb2}>
        <div style={{ fontWeight: 'bold' }}>Nro: {cotizacionInfo?.id}</div>
        <div style={{ fontWeight: 'bold' }}>Fecha: {new Date(cotizacionInfo?.fecha || Date.now()).toLocaleString('es-BO')}</div>
        <div style={{ fontWeight: 'bold' }}>Cliente: {cliente ? `${cliente.nombre} ${cliente.apellido}` : 'General'}</div>
      </div>

      <div style={S.divider} />

      {/* ITEMS HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '2px' }}>
        <span style={{ width: '50%' }}>Cant. x Prod.</span>
        <span style={{ width: '25%', textAlign: 'right' }}>P.U.</span>
        <span style={{ width: '25%', textAlign: 'right' }}>SubT</span>
      </div>

      {/* ITEMS */}
      {items?.map((item, index) => (
        <div key={index} style={{ marginBottom: '3px' }}>
          <div style={{ fontWeight: 'bold' }}>{item.producto}{item.nombre && item.nombre !== 'Unidad' ? ` - ${item.nombre}` : ''}</div>
          <div style={{ ...S.row, fontWeight: 'bold' }}>
            <span style={{ width: '50%' }}>{item.cantidad}</span>
            <span style={{ width: '25%', textAlign: 'right' }}>{formatMonto(item.precio_venta)}</span>
            <span style={{ width: '25%', textAlign: 'right' }}>{formatMonto(item.cantidad * item.precio_venta)}</span>
          </div>
        </div>
      ))}

      <div style={S.divider} />

      {/* TOTALES */}
      <div>
        <div style={{ ...S.row, ...S.bigTotal }}>
          <span>TOTAL:</span><span>Bs. {formatMonto(total)}</span>
        </div>
        <div style={{ ...S.row, fontWeight: 'bold' }}>
          <span>A Cuenta / Adelanto:</span><span>Bs. {formatMonto(adelanto)}</span>
        </div>
        <div style={{ ...S.row, ...S.bold }}>
          <span>SALDO POR PAGAR:</span><span>Bs. {formatMonto(saldo)}</span>
        </div>
      </div>

      <div style={S.divider} />

      {/* PIE */}
      <div style={S.center}>
        <div style={{ fontWeight: 'bold' }}>¡Gracias por su preferencia!</div>
        <div style={S.small}>Este documento es una cotización y no es válido como factura.</div>
      </div>
    </div>
  );
});

export default TicketCotizacion;

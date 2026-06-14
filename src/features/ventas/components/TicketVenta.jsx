import React, { forwardRef } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';

const TicketVenta = forwardRef(({ ventaInfo, cliente, items, total, descuento = 0, pagado, cambio = 0 }, ref) => {
  // Configuración base adaptada para impresoras de 58mm y 80mm
  // 58mm suele tener unos 32 caracteres de ancho
  // 80mm suele tener unos 48 caracteres de ancho
  const subtotalNeto = total + descuento;

  return (
    <div 
      ref={ref} 
      style={{
        padding: '10px',
        width: '100%',
        maxWidth: '320px', 
        margin: '0 auto',
        backgroundColor: '#fff',
        color: '#000',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}
    >
      {/* CABECERA */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '1px' }}>
          FERRETERÍA ALVAREZ
        </Typography>
      </Box>

      <Divider sx={{ borderStyle: 'dashed', my: 1, borderColor: '#000' }} />

      {/* DATOS DE LA VENTA */}
      <Box sx={{ mb: 1, fontSize: '12px' }}>
        <Typography sx={{ fontSize: 'inherit', fontFamily: 'monospace', fontWeight: 'bold' }}>
          Ticket N°: {ventaInfo?.nro_ticket || '00000001'}
        </Typography>
        <Typography sx={{ fontSize: 'inherit', fontFamily: 'monospace' }}>
          Fecha: {ventaInfo?.fecha ? format(new Date(ventaInfo.fecha), 'dd/MM/yyyy HH:mm') : format(new Date(), 'dd/MM/yyyy HH:mm')}
        </Typography>
        <Typography sx={{ fontSize: 'inherit', fontFamily: 'monospace' }}>
          Cliente: {cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Consumidor Final'}
        </Typography>
      </Box>

      <Divider sx={{ borderStyle: 'dashed', my: 1, borderColor: '#000' }} />

      {/* ENCABEZADO DE TABLA */}
      <table style={{ width: '100%', fontSize: '11px', textAlign: 'left', borderCollapse: 'collapse', marginBottom: '8px' }}>
        <thead>
          <tr style={{ borderBottom: '1px dashed #000' }}>
            <th style={{ paddingBottom: '4px', width: '15%' }}>CANT</th>
            <th style={{ paddingBottom: '4px', width: '45%' }}>DESCRIPCIÓN</th>
            <th style={{ paddingBottom: '4px', width: '20%', textAlign: 'right' }}>PRECIO</th>
            <th style={{ paddingBottom: '4px', width: '20%', textAlign: 'right' }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item, idx) => {
            const subtotalItem = item.cantidad * item.precio_venta;
            return (
              <tr key={idx}>
                <td style={{ verticalAlign: 'top', paddingTop: '4px' }}>{item.cantidad}</td>
                <td style={{ verticalAlign: 'top', paddingTop: '4px', paddingRight: '4px' }}>
                  {item.producto} {item.nombre ? `- ${item.nombre}` : ''}
                </td>
                <td style={{ verticalAlign: 'top', paddingTop: '4px', textAlign: 'right' }}>
                  {Number(item.precio_venta).toFixed(2)}
                </td>
                <td style={{ verticalAlign: 'top', paddingTop: '4px', textAlign: 'right' }}>
                  {subtotalItem.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Divider sx={{ borderStyle: 'dashed', my: 1, borderColor: '#000' }} />

      {/* TOTALES */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '12px', fontFamily: 'monospace' }}>SUBTOTAL:</Typography>
          <Typography sx={{ fontSize: '12px', fontFamily: 'monospace' }}>Bs. {subtotalNeto.toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '12px', fontFamily: 'monospace' }}>DESCUENTO:</Typography>
          <Typography sx={{ fontSize: '12px', fontFamily: 'monospace' }}>-Bs. {Number(descuento).toFixed(2)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace' }}>TOTAL:</Typography>
          <Typography sx={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace' }}>
            Bs. {Number(total).toFixed(2)}
          </Typography>
        </Box>
      </Box>

      {/* PAGO Y CAMBIO */}
      <Box sx={{ mb: 2 }}>
        {pagado !== undefined && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '12px', fontFamily: 'monospace' }}>Monto Pagado:</Typography>
            <Typography sx={{ fontSize: '12px', fontFamily: 'monospace' }}>Bs. {Number(pagado).toFixed(2)}</Typography>
          </Box>
        )}
        {cambio > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold' }}>CAMBIO A DEVOLVER:</Typography>
            <Typography sx={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 'bold' }}>Bs. {Number(cambio).toFixed(2)}</Typography>
          </Box>
        )}
      </Box>

      {/* CÓDIGO QR Y PIE DE PÁGINA */}
      <Box sx={{ textAlign: 'center', mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <QRCodeSVG 
          value={`Venta: ${ventaInfo?.nro_ticket || '000001'} | Total: Bs. ${Number(total).toFixed(2)} | Descuento: Bs. ${Number(descuento).toFixed(2)} | Gracias por su compra en FERRETERÍA ALVAREZ.`} 
          size={100} 
        />
        <Typography sx={{ fontSize: '10px', fontFamily: 'monospace', mt: 2, mb: 1 }}>
          Documento no válido como factura fiscal.
        </Typography>
        <Typography sx={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }}>
          ¡Gracias por su compra!
        </Typography>
      </Box>

    </div>
  );
});

export default TicketVenta;

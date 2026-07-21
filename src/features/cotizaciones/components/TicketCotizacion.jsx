import React, { forwardRef } from 'react';
import { Box, Typography, Divider } from '@mui/material';

const formatMonto = (monto) => Number(parseFloat(monto || 0).toFixed(2)).toLocaleString('de-DE');

const TicketCotizacion = forwardRef(({ data }, ref) => {
  if (!data) return null;

  const { cotizacionInfo, cliente, items, total, adelanto, saldo } = data;

  return (
    <Box ref={ref} sx={{ p: 2, fontFamily: 'monospace', color: '#000', width: '300px', margin: '0 auto', fontSize: '12px' }}>
      {/* Cabecera */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '16px', textTransform: 'uppercase' }}>
          FERRETERÍA ALVAREZ
        </Typography>
        <Typography sx={{ fontSize: '12px' }}>La Paz, El Alto</Typography>
        <Typography sx={{ fontSize: '12px' }}>Cel: +591 65555942</Typography>
        <Typography sx={{ fontSize: '12px' }}>--------------------------------</Typography>
        <Typography fontWeight="bold" sx={{ fontSize: '14px', mt: 1 }}>COTIZACIÓN / PRE-VENTA</Typography>
      </Box>

      {/* Info General */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: '12px' }}>Nro: {cotizacionInfo?.id}</Typography>
        <Typography sx={{ fontSize: '12px' }}>Fecha: {new Date(cotizacionInfo?.fecha || Date.now()).toLocaleString('es-BO')}</Typography>
        <Typography sx={{ fontSize: '12px' }}>Cliente: {cliente ? `${cliente.nombre} ${cliente.apellido}` : 'General'}</Typography>

      </Box>

      <Typography sx={{ fontSize: '12px' }}>--------------------------------</Typography>

      {/* Detalles */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', mb: 1 }}>
          <Typography sx={{ fontSize: '12px', width: '50%' }}>Cant. x Prod.</Typography>
          <Typography sx={{ fontSize: '12px', width: '25%', textAlign: 'right' }}>P.U.</Typography>
          <Typography sx={{ fontSize: '12px', width: '25%', textAlign: 'right' }}>SubT</Typography>
        </Box>

        {items?.map((item, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography sx={{ fontSize: '12px', lineHeight: 1.2 }}>{item.producto} {item.nombre !== 'Unidad' ? `- ${item.nombre}` : ''}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '12px', width: '50%' }}>{item.cantidad}</Typography>
              <Typography sx={{ fontSize: '12px', width: '25%', textAlign: 'right' }}>{formatMonto(item.precio_venta)}</Typography>
              <Typography sx={{ fontSize: '12px', width: '25%', textAlign: 'right' }}>{formatMonto(item.cantidad * item.precio_venta)}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Typography sx={{ fontSize: '12px' }}>--------------------------------</Typography>

      {/* Totales */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>TOTAL:</Typography>
          <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>Bs. {formatMonto(total)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '12px' }}>A Cuenta / Adelanto:</Typography>
          <Typography sx={{ fontSize: '12px' }}>Bs. {formatMonto(adelanto)}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>SALDO POR PAGAR:</Typography>
          <Typography sx={{ fontSize: '12px', fontWeight: 'bold' }}>Bs. {formatMonto(saldo)}</Typography>
        </Box>
      </Box>

      <Typography sx={{ fontSize: '12px', mt: 2 }}>--------------------------------</Typography>

      {/* Pie de página */}
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Typography sx={{ fontSize: '12px' }}>¡Gracias por su preferencia!</Typography>
        <Typography sx={{ fontSize: '12px' }}>Este documento es una cotización y no es válido como factura.</Typography>
      </Box>
    </Box>
  );
});

export default TicketCotizacion;

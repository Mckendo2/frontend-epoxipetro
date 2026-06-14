import React, { useState, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { FileDown, FileText, Users, TrendingUp, Warehouse, DollarSign } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/reportes';

const formatMonto = (monto) => Number(parseFloat(monto || 0).toFixed(2)).toLocaleString('de-DE');

const getLocalDateString = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const ReportesPage = () => {
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return getLocalDateString(d);
  });
  const [fechaFin, setFechaFin] = useState(() => getLocalDateString(new Date()));
  const [tipoReporte, setTipoReporte] = useState('vendedores');
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReporte = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (tipoReporte === 'vendedores') endpoint = 'desempeno-vendedores';
      if (tipoReporte === 'clientes') endpoint = 'mejores-clientes';
      if (tipoReporte === 'diario') endpoint = 'ventas-por-dia';
      if (tipoReporte === 'inventario') endpoint = 'inventario-valorizado';

      const url = tipoReporte === 'inventario' 
        ? `${API}/${endpoint}` 
        : `${API}/${endpoint}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;

      const res = await fetch(url);
      if (res.ok) {
        setDatos(await res.json());
      }
    } catch (error) {
      console.error('Error al obtener reporte', error);
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin, tipoReporte]);

  useEffect(() => {
    fetchReporte();
  }, [fetchReporte]);

  const descargarPDF = () => {
    const doc = new jsPDF(tipoReporte === 'inventario' ? 'landscape' : 'portrait');
    doc.setFontSize(14);
    
    let title = '';
    let tableColumn = [];
    let tableRows = [];

    if (tipoReporte === 'vendedores') {
      title = 'Reporte de Desempeño de Vendedores';
      tableColumn = ["Vendedor", "Rol", "Total Ventas", "Descuentos (Bs)", "Ingresos (Bs)"];
      datos.forEach(d => tableRows.push([d.vendedor, d.rol, d.total_ventas, formatMonto(d.total_descuentos), formatMonto(d.ingresos_generados)]));
    } else if (tipoReporte === 'clientes') {
      title = 'Reporte de Mejores Clientes';
      tableColumn = ["Cliente", "Documento", "Total Compras", "Total Gastado (Bs)"];
      datos.forEach(d => tableRows.push([`${d.nombre} ${d.apellido}`, d.documento || '-', d.total_compras, formatMonto(d.total_gastado)]));
    } else if (tipoReporte === 'diario') {
      title = 'Resumen de Ventas por Día';
      tableColumn = ["Fecha", "Cantidad Ventas", "Descuentos Otorgados", "Total Ingresos (Bs)"];
      datos.forEach(d => tableRows.push([new Date(d.fecha).toLocaleDateString('es-BO'), d.cantidad_ventas, formatMonto(d.total_descuentos), formatMonto(d.total_ingresos)]));
    } else if (tipoReporte === 'inventario') {
      title = 'Reporte de Inventario Valorizado';
      tableColumn = ["Producto", "Presentación", "Categoría", "Stock Total", "Costo Unit (Bs)", "Venta Unit (Bs)", "Inversión (Bs)", "Venta Proy. (Bs)"];
      datos.forEach(d => tableRows.push([d.producto, d.presentacion, d.categoria || '-', d.stock_total, formatMonto(d.precio_compra), formatMonto(d.precio_venta), formatMonto(d.valor_invertido), formatMonto(d.valor_venta_proyectado)]));
    }

    doc.text(title, 14, 15);
    doc.setFontSize(10);
    if (tipoReporte !== 'inventario') {
      doc.text(`Periodo: ${fechaInicio} al ${fechaFin}`, 14, 22);
    } else {
      doc.text(`Generado al: ${getLocalDateString(new Date())}`, 14, 22);
    }

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }
    });

    doc.save(`Reporte_${tipoReporte}_${getLocalDateString(new Date())}.pdf`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" color="text.primary">Reportes</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Exportación de métricas y desempeño en PDF.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Tipo de Reporte</InputLabel>
            <Select
              value={tipoReporte}
              label="Tipo de Reporte"
              onChange={(e) => setTipoReporte(e.target.value)}
            >
              <MenuItem value="vendedores">Desempeño de Vendedores</MenuItem>
              <MenuItem value="clientes">Mejores Clientes</MenuItem>
              <MenuItem value="diario">Ventas por Día</MenuItem>
              <MenuItem value="inventario">Inventario Valorizado</MenuItem>
            </Select>
          </FormControl>
          
          {tipoReporte !== 'inventario' && (
            <>
              <TextField
                type="date"
                label="Desde"
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                sx={{ width: 140 }}
              />
              <TextField
                type="date"
                label="Hasta"
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                sx={{ width: 140 }}
              />
            </>
          )}
          <Button
            variant="contained"
            startIcon={<FileDown size={18} />}
            onClick={descargarPDF}
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)',
              '&:hover': { background: '#b91c1c' }
            }}
          >
            Descargar PDF
          </Button>
        </Box>
      </Box>

      {loading ? <LinearProgress /> : null}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            {tipoReporte === 'vendedores' && <><FileText size={20} color="#6366f1" /><Typography variant="h6" fontWeight={600}>Desempeño de Vendedores</Typography></>}
            {tipoReporte === 'clientes' && <><Users size={20} color="#6366f1" /><Typography variant="h6" fontWeight={600}>Mejores Clientes</Typography></>}
            {tipoReporte === 'diario' && <><TrendingUp size={20} color="#6366f1" /><Typography variant="h6" fontWeight={600}>Ventas por Día</Typography></>}
            {tipoReporte === 'inventario' && <><Warehouse size={20} color="#6366f1" /><Typography variant="h6" fontWeight={600}>Inventario Valorizado</Typography></>}
          </Box>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'rgba(99, 102, 241, 0.05)' }}>
                {tipoReporte === 'vendedores' && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Vendedor</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Nro. Ventas</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Descuentos (Bs)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Ingresos Generados (Bs)</TableCell>
                  </TableRow>
                )}
                {tipoReporte === 'clientes' && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Cliente</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Documento</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Nro. Compras</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total Gastado (Bs)</TableCell>
                  </TableRow>
                )}
                {tipoReporte === 'diario' && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Cantidad Ventas</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Descuentos Otorgados (Bs)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Total Ingresos (Bs)</TableCell>
                  </TableRow>
                )}
                {tipoReporte === 'inventario' && (
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Producto</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Presentación</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Categoría</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Stock Total</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Costo Unit (Bs)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Venta Unit (Bs)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Inversión (Bs)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Venta Proy. (Bs)</TableCell>
                  </TableRow>
                )}
              </TableHead>
              <TableBody>
                {datos.length > 0 ? (
                  datos.map((v, i) => (
                    <TableRow key={i} hover>
                      {tipoReporte === 'vendedores' && (
                        <>
                          <TableCell>{v.vendedor}</TableCell>
                          <TableCell>{v.rol}</TableCell>
                          <TableCell align="center">{v.total_ventas}</TableCell>
                          <TableCell align="right" sx={{ color: 'error.main' }}>{formatMonto(v.total_descuentos)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>{formatMonto(v.ingresos_generados)}</TableCell>
                        </>
                      )}
                      {tipoReporte === 'clientes' && (
                        <>
                          <TableCell>{v.nombre} {v.apellido}</TableCell>
                          <TableCell>{v.documento || '-'}</TableCell>
                          <TableCell align="center">{v.total_compras}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>{formatMonto(v.total_gastado)}</TableCell>
                        </>
                      )}
                      {tipoReporte === 'diario' && (
                        <>
                          <TableCell>{new Date(v.fecha).toLocaleDateString('es-BO')}</TableCell>
                          <TableCell align="center">{v.cantidad_ventas}</TableCell>
                          <TableCell align="right" sx={{ color: 'error.main' }}>{formatMonto(v.total_descuentos)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>{formatMonto(v.total_ingresos)}</TableCell>
                        </>
                      )}
                      {tipoReporte === 'inventario' && (
                        <>
                          <TableCell>{v.producto}</TableCell>
                          <TableCell>{v.presentacion}</TableCell>
                          <TableCell>{v.categoria || '-'}</TableCell>
                          <TableCell align="center">{v.stock_total}</TableCell>
                          <TableCell align="right">{formatMonto(v.precio_compra)}</TableCell>
                          <TableCell align="right">{formatMonto(v.precio_venta)}</TableCell>
                          <TableCell align="right" sx={{ color: 'warning.main', fontWeight: 600 }}>{formatMonto(v.valor_invertido)}</TableCell>
                          <TableCell align="right" sx={{ color: 'success.main', fontWeight: 600 }}>{formatMonto(v.valor_venta_proyectado)}</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      No hay datos registrados en este reporte
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReportesPage;

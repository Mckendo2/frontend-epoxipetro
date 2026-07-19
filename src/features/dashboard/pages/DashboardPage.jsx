import React, { useState, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Grid, Typography, LinearProgress, IconButton, TextField } from '@mui/material';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Activity, DollarSign, Users, CreditCard, ShoppingBag, TrendingUp, Truck } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { linearRegression, linearRegressionLine } from 'simple-statistics';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/dashboard';
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const formatMonto = (monto) => Number(parseFloat(monto || 0).toFixed(2)).toLocaleString('de-DE');

const getLocalDateString = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const DashboardPage = () => {
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return getLocalDateString(d);
  });
  const [fechaFin, setFechaFin] = useState(() => getLocalDateString(new Date()));
  
  const [data, setData] = useState({
    kpis: { totalVentas: 0, ingresos: 0, clientesActivos: 0, cuentasPorCobrar: 0, deudaProveedores: 0 },
    tendencias: [],
    topCategorias: [],
    topProductos: []
  });
  const [loading, setLoading] = useState(true);

  const fetchEstadisticas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/estadisticas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
      if (res.ok) {
        const json = await res.json();
        
        // Calcular la línea de regresión para las tendencias
        const puntosParaRegresion = json.tendencias.map((t, idx) => [idx, t.total]);
        let tendenciaConRegresion = json.tendencias;
        
        if (puntosParaRegresion.length > 1) {
          const regression = linearRegression(puntosParaRegresion);
          const lineFn = linearRegressionLine(regression);
          tendenciaConRegresion = json.tendencias.map((t, idx) => ({
            ...t,
            tendencia: parseFloat(lineFn(idx).toFixed(2)),
            diaFormat: new Date(t.fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })
          }));
        } else {
          tendenciaConRegresion = json.tendencias.map(t => ({
            ...t,
            tendencia: t.total,
            diaFormat: new Date(t.fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })
          }));
        }

        setData({
          kpis: json.kpis,
          tendencias: tendenciaConRegresion,
          topCategorias: json.topCategorias,
          topProductos: json.topProductos
        });
      }
    } catch (error) {
      console.error('Error al obtener estadísticas', error);
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin]);

  useEffect(() => {
    fetchEstadisticas();
  }, [fetchEstadisticas]);

  const kpisArray = [
    { title: 'Ingresos Totales',        value: `Bs. ${formatMonto(data.kpis.ingresos)}`,          icon: <DollarSign size={20} />, color: '#10b981' },
    { title: 'Total Ventas',            value: data.kpis.totalVentas,                             icon: <ShoppingBag size={20} />, color: '#6366f1' },
    { title: 'Por Cobrar a Clientes',   value: `Bs. ${formatMonto(data.kpis.cuentasPorCobrar)}`,  icon: <CreditCard size={20} />, color: '#ef4444' },
    { title: 'Deuda a Proveedores',     value: `Bs. ${formatMonto(data.kpis.deudaProveedores)}`,  icon: <Truck size={20} />, color: '#f97316' },
  ];

  const renderTooltipPie = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ bgcolor: 'background.paper', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="body2" fontWeight={600}>{payload[0].name}</Typography>
          <Typography variant="body2" color="text.secondary">Vendidos: {payload[0].value} unid.</Typography>
        </Box>
      );
    }
    return null;
  };

  const renderTooltipBar = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ bgcolor: 'background.paper', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>{label}</Typography>
          {payload.map(p => (
            <Typography key={p.dataKey} variant="body2" sx={{ color: p.color }}>
              {p.name === 'total' ? 'Ingresos: Bs.' : 'Tendencia: Bs.'} {formatMonto(p.value)}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" color="text.primary">Dashboard</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Análisis de ventas y desempeño del negocio.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
        </Box>
      </Box>

      {loading ? <LinearProgress /> : null}

      <Grid container spacing={3}>
        {kpisArray.map((kpi) => (
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={kpi.title}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: '24px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    backgroundColor: `${kpi.color}15`, 
                    color: kpi.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {kpi.icon}
                  </Box>
                </Box>
                <Typography variant="h4" color="text.primary" sx={{ mb: 0.5 }}>
                  {kpi.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {kpi.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%', minHeight: 450, borderRadius: 3 }}>
            <CardContent sx={{ p: '24px !important', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp size={20} color="#6366f1" /> Ingresos y Tendencia de Ventas
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1, width: '100%', height: 350 }}>
                {data.tendencias.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.tendencias} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="diaFormat" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={renderTooltipBar} />
                      <Legend />
                      <Bar dataKey="total" name="Ingresos Diarios" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      <Line type="monotone" dataKey="tendencia" name="Tendencia (Regresión Lineal)" stroke="#f59e0b" strokeWidth={3} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">No hay ventas registradas en este período</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Top 6 Categorías</Typography>
              <Box sx={{ flex: 1, minHeight: 300, width: '100%' }}>
                {data.topCategorias.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.topCategorias}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="cantidad"
                        nameKey="categoria"
                      >
                        {data.topCategorias.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={renderTooltipPie} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">No hay datos</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Top 10 Productos Más Vendidos</Typography>
              <Box sx={{ height: 400, width: '100%' }}>
                {data.topProductos && data.topProductos.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.topProductos}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="nombre" 
                        type="category" 
                        tick={{ fontSize: 12 }} 
                        width={140}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <Box sx={{ bgcolor: 'background.paper', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <Typography variant="body2" fontWeight={600}>{payload[0].payload.nombre}</Typography>
                                <Typography variant="body2" color="text.secondary">Vendidos: {payload[0].value} unid.</Typography>
                              </Box>
                            );
                          }
                          return null;
                        }} 
                      />
                      <Bar dataKey="cantidad" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                        {data.topProductos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">No hay datos suficientes para mostrar</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default DashboardPage;

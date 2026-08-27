import React, { useState, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Grid, Typography, LinearProgress, TextField, Chip } from '@mui/material';
import { DollarSign, Users, CreditCard, ShoppingBag, TrendingUp, Truck, TrendingDown, PackageCheck } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Line, ComposedChart, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { linearRegression, linearRegressionLine } from 'simple-statistics';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/dashboard';
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const formatMonto = (v) => Number(parseFloat(v || 0).toFixed(2)).toLocaleString('de-DE');

const getLocalDateString = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// ── Tooltip personalizado para el gráfico de ganancia ──────────────────────────
const TooltipGanancia = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  return (
    <Box sx={{
      bgcolor: 'background.paper',
      p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2,
      minWidth: 220, boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
    }}>
      <Typography variant="body2" fontWeight={700} sx={{ mb: 1.5, color: 'text.primary', lineHeight: 1.3 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
        {payload.map(p => (
          <Box key={p.dataKey} sx={{ display: 'flex', justifyContent: 'space-between', gap: 3 }}>
            <Typography variant="caption" sx={{ color: p.color, fontWeight: 600 }}>{p.name}</Typography>
            <Typography variant="caption" fontWeight={700}>Bs. {formatMonto(p.value)}</Typography>
          </Box>
        ))}
        {data?.margen !== null && data?.margen !== undefined && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Margen neto</Typography>
            <Typography variant="caption" fontWeight={800}
              sx={{ color: data.margen >= 0 ? '#10b981' : '#ef4444' }}>
              {data.margen >= 0 ? '+' : ''}{data.margen}%
            </Typography>
          </Box>
        )}
        <Box sx={{ mt: 0.4, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">Unidades</Typography>
          <Typography variant="caption" fontWeight={700}>{data?.unidades} uds.</Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ── Label personalizado encima de la barra de Ganancia ─────────────────────────
const renderLabelGanancia = ({ x, y, width, value }) => {
  if (!value || value <= 0) return null;
  return (
    <text x={x + width + 6} y={y + 11} textAnchor="start"
      fill="#10b981" fontSize={10} fontWeight={700}>
      Bs.{formatMonto(value)}
    </text>
  );
};

const DashboardPage = () => {
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30); return getLocalDateString(d);
  });
  const [fechaFin, setFechaFin] = useState(() => getLocalDateString(new Date()));

  const [data, setData] = useState({
    kpis: { totalVentas: 0, ingresos: 0, clientesActivos: 0, cuentasPorCobrar: 0, deudaProveedores: 0 },
    tendencias: [],
    topCategorias: [],
    topProductos: [],
  });
  const [gananciaData, setGananciaData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEstadisticas = useCallback(async () => {
    setLoading(true);
    try {
      const [resStats, resGanancia] = await Promise.all([
        fetch(`${API}/estadisticas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),
        fetch(`${API}/ganancia-productos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`),
      ]);

      if (resStats.ok) {
        const json = await resStats.json();
        const puntosParaRegresion = json.tendencias.map((t, idx) => [idx, t.total]);
        let tendenciaConRegresion = json.tendencias;
        if (puntosParaRegresion.length > 1) {
          const regression = linearRegression(puntosParaRegresion);
          const lineFn = linearRegressionLine(regression);
          tendenciaConRegresion = json.tendencias.map((t, idx) => ({
            ...t,
            tendencia: parseFloat(lineFn(idx).toFixed(2)),
            diaFormat: new Date(t.fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' }),
          }));
        } else {
          tendenciaConRegresion = json.tendencias.map(t => ({
            ...t, tendencia: t.total,
            diaFormat: new Date(t.fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' }),
          }));
        }
        setData({ kpis: json.kpis, tendencias: tendenciaConRegresion, topCategorias: json.topCategorias, topProductos: json.topProductos });
      }

      if (resGanancia.ok) {
        const gData = await resGanancia.json();
        // Acortar nombres largos para el eje Y
        setGananciaData(gData.map(r => ({
          ...r,
          nombreCorto: r.nombre.length > 28 ? r.nombre.slice(0, 26) + '…' : r.nombre,
        })));
      }
    } catch (e) {
      console.error('Error al obtener estadísticas', e);
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin]);

  useEffect(() => { fetchEstadisticas(); }, [fetchEstadisticas]);

  const kpisArray = [
    { title: 'Ingresos Totales',       value: `Bs. ${formatMonto(data.kpis.ingresos)}`,         icon: <DollarSign size={20} />,  color: '#10b981' },
    { title: 'Total Ventas',           value: data.kpis.totalVentas,                            icon: <ShoppingBag size={20} />, color: '#6366f1' },
    { title: 'Por Cobrar a Clientes',  value: `Bs. ${formatMonto(data.kpis.cuentasPorCobrar)}`, icon: <CreditCard size={20} />,  color: '#ef4444' },
    { title: 'Deuda a Proveedores',    value: `Bs. ${formatMonto(data.kpis.deudaProveedores)}`, icon: <Truck size={20} />,       color: '#f97316' },
  ];

  // KPI resumen de ganancia líquida total
  const totalGanancia  = gananciaData.reduce((s, r) => s + r.ganancia, 0);
  const totalIngresos  = gananciaData.reduce((s, r) => s + r.ingresos, 0);
  const margenPromedio = totalIngresos > 0
    ? ((totalGanancia / totalIngresos) * 100).toFixed(1)
    : null;

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

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" color="text.primary">Dashboard</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Análisis de ventas, rentabilidad y desempeño del negocio.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField type="date" label="Desde" size="small" slotProps={{ inputLabel: { shrink: true } }}
            value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} sx={{ width: 140 }} />
          <TextField type="date" label="Hasta" size="small" slotProps={{ inputLabel: { shrink: true } }}
            value={fechaFin} onChange={e => setFechaFin(e.target.value)} sx={{ width: 140 }} />
        </Box>
      </Box>

      {loading ? <LinearProgress /> : null}

      <Grid container spacing={3}>

        {/* KPIs */}
        {kpisArray.map((kpi) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.title}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: '24px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: `${kpi.color}15`, color: kpi.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {kpi.icon}
                  </Box>
                </Box>
                <Typography variant="h4" color="text.primary" sx={{ mb: 0.5 }}>{kpi.value}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{kpi.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Gráfico Tendencia */}
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

        {/* Pie Categorías */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Top 6 Categorías</Typography>
              <Box sx={{ flex: 1, minHeight: 300, width: '100%' }}>
                {data.topCategorias.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.topCategorias} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                        paddingAngle={5} dataKey="cantidad" nameKey="categoria">
                        {data.topCategorias.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={renderTooltipPie} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
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

        {/* ════════════════════════════════════════════════════════════════════
            GRÁFICO DE GANANCIA LÍQUIDA — artículos más vendidos × costo
            ════════════════════════════════════════════════════════════════════ */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{
            borderRadius: 3,
            background: 'linear-gradient(160deg, rgba(16,185,129,0.04) 0%, rgba(99,102,241,0.04) 100%)',
            border: '1px solid rgba(16,185,129,0.15)',
          }}>
            <CardContent sx={{ p: '28px !important' }}>

              {/* Encabezado del card */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'flex' }}>
                    <PackageCheck size={22} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Ganancia Líquida por Artículo
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cruce: precio de venta − precio de compra × unidades vendidas
                    </Typography>
                  </Box>
                </Box>

                {/* Mini KPIs de resumen */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" display="block">Ganancia total (top artículos)</Typography>
                    <Typography variant="h5" fontWeight={800} color={totalGanancia >= 0 ? '#10b981' : '#ef4444'}>
                      Bs. {formatMonto(totalGanancia)}
                    </Typography>
                  </Box>
                  {margenPromedio !== null && (
                    <Chip
                      label={`Margen promedio ${margenPromedio >= 0 ? '+' : ''}${margenPromedio}%`}
                      size="small"
                      sx={{
                        fontWeight: 700, fontSize: '0.8rem', alignSelf: 'center',
                        bgcolor: parseFloat(margenPromedio) >= 20
                          ? 'rgba(16,185,129,0.15)' : parseFloat(margenPromedio) >= 0
                          ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                        color: parseFloat(margenPromedio) >= 20 ? '#10b981'
                          : parseFloat(margenPromedio) >= 0 ? '#f59e0b' : '#ef4444',
                        border: '1px solid currentColor',
                      }}
                    />
                  )}
                </Box>
              </Box>

              {/* Leyenda de colores */}
              <Box sx={{ display: 'flex', gap: 2.5, mb: 2, flexWrap: 'wrap' }}>
                {[
                  { color: '#6366f1', label: 'Ingresos (precio venta × cant.)' },
                  { color: '#f59e0b', label: 'Costo (precio compra × cant.)' },
                  { color: '#10b981', label: 'Ganancia líquida' },
                ].map(item => (
                  <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: item.color }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>{item.label}</Typography>
                  </Box>
                ))}
              </Box>

              {/* Gráfico */}
              <Box sx={{ height: 480, width: '100%' }}>
                {gananciaData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={gananciaData}
                      layout="vertical"
                      margin={{ top: 8, right: 60, left: 200, bottom: 8 }}
                      barCategoryGap="20%"
                      barGap={3}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(156,163,175,0.15)" />
                      <XAxis
                        type="number"
                        tick={{ fill: '#9ca3af', fontSize: 11 }}
                        axisLine={false} tickLine={false}
                        tickFormatter={v => `Bs.${formatMonto(v)}`}
                      />
                      <YAxis
                        dataKey="nombreCorto"
                        type="category"
                        tick={{ fill: '#e5e7eb', fontSize: 11.5, fontWeight: 500 }}
                        width={195}
                        axisLine={false} tickLine={false}
                      />
                      <Tooltip content={<TooltipGanancia />} />

                      {/* Barra ingresos */}
                      <Bar dataKey="ingresos" name="Ingresos" fill="#6366f1"
                        radius={[0, 3, 3, 0]} maxBarSize={16} />

                      {/* Barra costo */}
                      <Bar dataKey="costo" name="Costo" fill="#f59e0b"
                        radius={[0, 3, 3, 0]} maxBarSize={16} />

                      {/* Barra ganancia con label a la derecha */}
                      <Bar dataKey="ganancia" name="Ganancia líquida" fill="#10b981"
                        radius={[0, 4, 4, 0]} maxBarSize={16}
                        label={renderLabelGanancia} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                    <TrendingDown size={40} color="#6b7280" style={{ opacity: 0.4 }} />
                    <Typography color="text.secondary">No hay datos de ventas con costo registrado en este período</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Asegúrate de tener el precio de compra cargado en los productos
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Tabla resumen debajo del gráfico */}
              {gananciaData.length > 0 && (
                <Box sx={{ mt: 3, overflowX: 'auto' }}>
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '2fr repeat(4, 1fr)',
                    gap: 0,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    fontSize: '0.82rem',
                  }}>
                    {/* Encabezados */}
                    {['Artículo', 'Ingresos', 'Costo', 'Ganancia líquida', 'Margen %'].map(h => (
                      <Box key={h} sx={{
                        px: 2, py: 1.2, bgcolor: 'background.default',
                        fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem',
                        borderBottom: '1px solid', borderColor: 'divider',
                      }}>
                        {h}
                      </Box>
                    ))}

                    {/* Filas */}
                    {gananciaData.map((row, i) => (
                      <React.Fragment key={row.nombre}>
                        <Box sx={{ px: 2, py: 1.2, borderBottom: i < gananciaData.length - 1 ? '1px solid' : 'none', borderColor: 'divider',
                          bgcolor: i % 2 === 0 ? 'transparent' : 'action.hover' }}>
                          <Typography variant="body2" fontWeight={600} noWrap title={row.nombre}>{row.nombre}</Typography>
                          <Typography variant="caption" color="text.secondary">{row.unidades} uds.</Typography>
                        </Box>
                        <Box sx={{ px: 2, py: 1.2, borderBottom: i < gananciaData.length - 1 ? '1px solid' : 'none', borderColor: 'divider',
                          bgcolor: i % 2 === 0 ? 'transparent' : 'action.hover' }}>
                          <Typography variant="body2" fontWeight={600} color="#6366f1">Bs. {formatMonto(row.ingresos)}</Typography>
                        </Box>
                        <Box sx={{ px: 2, py: 1.2, borderBottom: i < gananciaData.length - 1 ? '1px solid' : 'none', borderColor: 'divider',
                          bgcolor: i % 2 === 0 ? 'transparent' : 'action.hover' }}>
                          <Typography variant="body2" color="#f59e0b">Bs. {formatMonto(row.costo)}</Typography>
                        </Box>
                        <Box sx={{ px: 2, py: 1.2, borderBottom: i < gananciaData.length - 1 ? '1px solid' : 'none', borderColor: 'divider',
                          bgcolor: i % 2 === 0 ? 'transparent' : 'action.hover' }}>
                          <Typography variant="body2" fontWeight={800}
                            color={row.ganancia >= 0 ? '#10b981' : '#ef4444'}>
                            {row.ganancia >= 0 ? '+' : ''}Bs. {formatMonto(row.ganancia)}
                          </Typography>
                        </Box>
                        <Box sx={{ px: 2, py: 1.2, borderBottom: i < gananciaData.length - 1 ? '1px solid' : 'none', borderColor: 'divider',
                          bgcolor: i % 2 === 0 ? 'transparent' : 'action.hover' }}>
                          {row.margen !== null ? (
                            <Chip
                              label={`${row.margen >= 0 ? '+' : ''}${row.margen}%`}
                              size="small"
                              sx={{
                                fontWeight: 700, fontSize: '0.72rem',
                                bgcolor: row.margen >= 25 ? 'rgba(16,185,129,0.12)'
                                  : row.margen >= 10 ? 'rgba(245,158,11,0.12)'
                                  : 'rgba(239,68,68,0.12)',
                                color: row.margen >= 25 ? '#10b981'
                                  : row.margen >= 10 ? '#f59e0b'
                                  : '#ef4444',
                              }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.disabled">—</Typography>
                          )}
                        </Box>
                      </React.Fragment>
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top 10 Productos Más Vendidos (por cantidad) */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Top 10 Productos Más Vendidos</Typography>
              <Box sx={{ height: 400, width: '100%' }}>
                {data.topProductos && data.topProductos.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topProductos} layout="vertical"
                      margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="nombre" type="category" tick={{ fontSize: 12 }} width={140} />
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
                        {data.topProductos.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
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

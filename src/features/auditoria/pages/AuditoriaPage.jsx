import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, Grid, Tabs, Tab, TextField, MenuItem, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  IconButton, Pagination, Tooltip, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import { Activity, Calendar, Shield, Info } from 'lucide-react';
import { format } from 'date-fns';

const API = 'http://localhost:3000/api/auditoria';

const AuditoriaPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [kpis, setKpis] = useState({ totalEventos: 0, eventosHoy: 0, sesionesActivas: 0 });
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [filtros, setFiltros] = useState({ metodo: 'Todos', ruta: '', fecha_inicio: '', fecha_fin: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchKpis();
    fetchLogs();
  }, [pagina, filtros, tabIndex]);

  const fetchKpis = async () => {
    try {
      const res = await fetch(`${API}/kpis`);
      if (res.ok) {
        const data = await res.json();
        setKpis(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLogs = async () => {
    try {
      // Si estamos en la tab "Sesiones", filtramos solo las rutas de login
      const rutaFiltro = tabIndex === 1 ? '/api/auth/login' : filtros.ruta;
      
      const params = new URLSearchParams({
        pagina,
        limite: 20,
        metodo: filtros.metodo,
        ruta: rutaFiltro,
        fecha_inicio: filtros.fecha_inicio,
        fecha_fin: filtros.fecha_fin
      });
      const res = await fetch(`${API}?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data);
        setTotal(Math.ceil(data.total / data.limite));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFilterChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
    setPagina(1);
  };

  const getMethodColor = (metodo) => {
    switch(metodo) {
      case 'POST': return { bg: '#fef08a', color: '#a16207' };
      case 'PUT': 
      case 'PATCH': return { bg: '#fdba74', color: '#c2410c' };
      case 'DELETE': return { bg: '#fca5a5', color: '#b91c1c' };
      case 'GET': return { bg: '#bfdbfe', color: '#1d4ed8' };
      default: return { bg: '#e2e8f0', color: '#475569' };
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* KPIS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} md={4}>
          <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(234, 179, 8, 0.1)', color: '#eab308', mb: 2 }}>
              <Calendar size={24} />
            </Box>
            <Typography variant="h4" fontWeight="bold">{kpis.totalEventos}</Typography>
            <Typography variant="body2" color="text.secondary">Total eventos</Typography>
          </Card>
        </Grid>
        <Grid xs={12} md={4}>
          <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', mb: 2 }}>
              <Activity size={24} />
            </Box>
            <Typography variant="h4" fontWeight="bold">{kpis.eventosHoy}</Typography>
            <Typography variant="body2" color="text.secondary">Eventos hoy</Typography>
          </Card>
        </Grid>
        <Grid xs={12} md={4}>
          <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', mb: 2 }}>
              <Shield size={24} />
            </Box>
            <Typography variant="h4" fontWeight="bold">{kpis.sesionesActivas}</Typography>
            <Typography variant="body2" color="text.secondary">Sesiones activas</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* HEADER */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5, textTransform: 'uppercase' }}>
        Auditoría & Monitoreo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Registro de eventos y sesiones del sistema
      </Typography>

      {/* TABS & FILTERS */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={(e, val) => { setTabIndex(val); setPagina(1); }}>
          <Tab label="Eventos" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
          <Tab label="Sesiones" sx={{ textTransform: 'none', fontWeight: 'bold' }} />
        </Tabs>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={12} md={3}>
          <TextField 
            fullWidth 
            size="small" 
            label="Buscar ruta o acción" 
            name="ruta"
            value={filtros.ruta}
            onChange={handleFilterChange}
            disabled={tabIndex === 1}
          />
        </Grid>
        <Grid xs={12} md={3}>
          <TextField 
            fullWidth 
            select 
            size="small" 
            label="Método" 
            name="metodo"
            value={filtros.metodo}
            onChange={handleFilterChange}
            disabled={tabIndex === 1}
          >
            {['Todos', 'POST', 'PUT', 'PATCH', 'DELETE', 'GET'].map(m => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid xs={12} md={3}>
          <TextField 
            fullWidth 
            type="date" 
            size="small" 
            label="Desde" 
            name="fecha_inicio"
            slotProps={{ inputLabel: { shrink: true } }}
            value={filtros.fecha_inicio}
            onChange={handleFilterChange}
          />
        </Grid>
        <Grid xs={12} md={3}>
          <TextField 
            fullWidth 
            type="date" 
            size="small" 
            label="Hasta" 
            name="fecha_fin"
            slotProps={{ inputLabel: { shrink: true } }}
            value={filtros.fecha_fin}
            onChange={handleFilterChange}
          />
        </Grid>
      </Grid>

      {/* TABLE */}
      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Fecha ↓</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Método</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Ruta</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Acción</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>IP</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Detalle</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => {
              const mColor = getMethodColor(log.metodo);
              return (
                <TableRow key={log.id} hover>
                  <TableCell>{format(new Date(log.created_at), 'yyyy-MM-dd HH:mm')}</TableCell>
                  <TableCell>
                    <Box sx={{ 
                      bgcolor: mColor.bg, color: mColor.color, 
                      px: 1.5, py: 0.5, borderRadius: 5, 
                      display: 'inline-block', fontSize: '0.75rem', fontWeight: 'bold'
                    }}>
                      {log.metodo}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{log.ruta}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{log.accion}</TableCell>
                  <TableCell>{log.nombre ? `${log.nombre} ${log.apellido || ''}` : 'Desconocido'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{log.ip}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver Detalles">
                      <IconButton size="small" onClick={() => { setSelectedLog(log); setModalOpen(true); }}>
                        <Info size={18} color="#9ca3af" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No hay registros de auditoría que coincidan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* PAGINATION */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Pagination 
          count={total} 
          page={pagina} 
          onChange={(e, v) => setPagina(v)} 
          color="primary" 
        />
      </Box>

      {/* MODAL DETALLES */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalle del Evento</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Ruta: {selectedLog.ruta}</Typography>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Acción: {selectedLog.accion}</Typography>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Datos enviados (JSON):</Typography>
              <Box component="pre" sx={{ 
                bgcolor: '#1e293b', color: '#e2e8f0', p: 2, borderRadius: 1, 
                overflowX: 'auto', fontSize: '0.8rem', m: 0
              }}>
                {selectedLog.detalles ? JSON.stringify(JSON.parse(selectedLog.detalles), null, 2) : 'No hay detalles adicionales.'}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AuditoriaPage;

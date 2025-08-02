import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  People as PeopleIcon,
  MusicNote as MusicNoteIcon,
  Euro as EuroIcon,
  EventNote as EventNoteIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const StatisticsManagerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('6');
  const [loading, setLoading] = useState(true);

  // Estados para estadísticas
  const [financeStats, setFinanceStats] = useState<any[]>([]);
  const [performanceStats, setPerformanceStats] = useState<any[]>([]);
  const [memberStats, setMemberStats] = useState<any[]>([]);
  const [scoreStats, setScoreStats] = useState<any[]>([]);
  const [contractStats, setContractStats] = useState<any[]>([]);
  const [inventoryStats, setInventoryStats] = useState<any[]>([]);

  useEffect(() => {
    loadStatistics();
  }, [selectedPeriod]);

  const loadStatistics = () => {
    setLoading(true);
    try {
      // Cargar datos de localStorage con las claves correctas que usan los otros módulos
      const financeData = JSON.parse(localStorage.getItem('bondapp_financial_entries') || '[]');
      const performances = JSON.parse(localStorage.getItem('bondapp-performances') || '[]');
      const members = JSON.parse(localStorage.getItem('bondapp-components') || '[]');
      const contracts = JSON.parse(localStorage.getItem('bondapp-contracts') || '[]');
      const inventory = JSON.parse(localStorage.getItem('bondapp-inventory') || '[]');
      
      // Para partituras, necesitamos combinar scores y marches
      const scores = JSON.parse(localStorage.getItem('bondapp_scores') || '[]');
      const marches = JSON.parse(localStorage.getItem('bondapp_marches') || '[]');
      const allScores = [...scores, ...marches];

      setFinanceStats(financeData);
      setPerformanceStats(performances);
      setMemberStats(members);
      setScoreStats(allScores);
      setContractStats(contracts);
      setInventoryStats(inventory);
      
      console.log('Estadísticas cargadas:', {
        finanzas: financeData.length,
        actuaciones: performances.length,
        componentes: members.length,
        partituras: allScores.length,
        contratos: contracts.length,
        inventario: inventory.length
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
    setLoading(false);
  };

  // Funciones de cálculo
  const getTotalBalance = () => {
    const income = financeStats.filter(entry => entry.tipo === 'ingreso')
      .reduce((sum, entry) => sum + (entry.cantidad || 0), 0);
    const expenses = financeStats.filter(entry => entry.tipo === 'gasto')
      .reduce((sum, entry) => sum + (entry.cantidad || 0), 0);
    return income - expenses;
  };

  const getTotalActuaciones = () => {
    return performanceStats.length;
  };

  const getActiveMembers = () => {
    return memberStats.filter(m => m.estado === 'activo').length;
  };

  const getTotalScores = () => {
    return scoreStats.length;
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const exportStatistics = () => {
    const data = {
      resumen: {
        balance: getTotalBalance(),
        actuaciones: getTotalActuaciones(),
        miembrosActivos: getActiveMembers(),
        partituras: getTotalScores(),
        contratos: contractStats.length,
        inventario: inventoryStats.length
      },
      finanzas: financeStats,
      actuaciones: performanceStats,
      miembros: memberStats,
      partituras: scoreStats,
      contratos: contractStats,
      inventario: inventoryStats
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estadisticas-bondapp-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#8B0000' }}>
          📊 Estadísticas
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small">
            <InputLabel>Período</InputLabel>
            <Select
              value={selectedPeriod}
              label="Período"
              onChange={(e) => setSelectedPeriod(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="1">1 Mes</MenuItem>
              <MenuItem value="3">3 Meses</MenuItem>
              <MenuItem value="6">6 Meses</MenuItem>
              <MenuItem value="12">1 Año</MenuItem>
              <MenuItem value="all">Todo</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportStatistics}
            sx={{ borderColor: '#8B0000', color: '#8B0000' }}
          >
            Exportar Reporte
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          gap: 3,
          mb: 4
        }}
      >
        <Card sx={{ 
          background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
          color: 'white',
          height: '100%'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EuroIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Balance Total</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              €{getTotalBalance().toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {getTotalBalance() >= 0 ? 'Beneficio' : 'Pérdida'}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
          color: 'white',
          height: '100%'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EventNoteIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Actuaciones</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {getTotalActuaciones()}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              En el período seleccionado
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
          color: 'white',
          height: '100%'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Componentes</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {getActiveMembers()}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Miembros activos
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
          color: 'white',
          height: '100%'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <MusicNoteIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Partituras</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {getTotalScores()}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Total en biblioteca
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Paper sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { color: '#8B0000' },
            '& .Mui-selected': { color: '#8B0000 !important' }
          }}
        >
          <Tab label="Dashboard" />
          <Tab label="Finanzas" />
          <Tab label="Actuaciones" />
          <Tab label="Componentes" />
          <Tab label="Partituras" />
          <Tab label="Inventario" />
          <Tab label="Contratos" />
        </Tabs>

        {/* Dashboard Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#8B0000' }}>
              Resumen General
            </Typography>
            
            {/* Resumen Financiero */}
            <Card sx={{ mb: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#8B0000' }}>
                  📈 Resumen Financiero
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Ingresos Totales</Typography>
                    <Typography variant="h6" color="success.main">
                      €{financeStats.filter(e => e.tipo === 'ingreso').reduce((sum, e) => sum + (e.cantidad || 0), 0).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Gastos Totales</Typography>
                    <Typography variant="h6" color="error.main">
                      €{financeStats.filter(e => e.tipo === 'gasto').reduce((sum, e) => sum + (e.cantidad || 0), 0).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Actividad Reciente */}
            <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: '#8B0000' }}>
                  📋 Actividad Reciente
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Últimas Actuaciones</Typography>
                    {performanceStats.slice(0, 3).map((performance, index) => (
                      <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'rgba(139, 0, 0, 0.1)', borderRadius: 1 }}>
                        <Typography variant="body2">{performance.title || 'Sin nombre'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {performance.date ? new Date(performance.date).toLocaleDateString() : 'Sin fecha'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Últimos Contratos</Typography>
                    {contractStats.slice(0, 3).map((contract, index) => (
                      <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'rgba(139, 0, 0, 0.1)', borderRadius: 1 }}>
                        <Typography variant="body2">{contract.name || 'Sin título'}</Typography>
                        <Chip 
                          label={contract.status || 'Sin estado'} 
                          size="small" 
                          color={contract.status === 'activo' ? 'success' : 'default'}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Finanzas Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#8B0000' }}>
              Análisis Financiero
            </Typography>
            
            <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {financeStats.slice(0, 10).map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {entry.fecha ? new Date(entry.fecha).toLocaleDateString() : 'Sin fecha'}
                      </TableCell>
                      <TableCell>{entry.descripcion || 'Sin descripción'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={entry.tipo || 'Sin tipo'} 
                          color={entry.tipo === 'ingreso' ? 'success' : 'error'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{entry.categoria || 'Sin categoría'}</TableCell>
                      <TableCell align="right">
                        <Typography 
                          color={entry.tipo === 'ingreso' ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          €{(entry.cantidad || 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Actuaciones Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#8B0000' }}>
              Estadísticas de Actuaciones
            </Typography>
            
            <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Evento</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Ubicación</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Duración</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {performanceStats.map((performance, index) => (
                    <TableRow key={index}>
                      <TableCell>{performance.title || 'Sin nombre'}</TableCell>
                      <TableCell>
                        {performance.date ? new Date(performance.date).toLocaleDateString() : 'Sin fecha'}
                      </TableCell>
                      <TableCell>{performance.venue || 'Sin ubicación'}</TableCell>
                      <TableCell>
                        <Chip label={performance.type || 'Sin tipo'} size="small" />
                      </TableCell>
                      <TableCell align="right">{performance.duration || 'No especificada'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Componentes Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#8B0000' }}>
              Gestión de Componentes
            </Typography>
            
            <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Instrumento</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Fecha Ingreso</TableCell>
                    <TableCell>Teléfono</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {memberStats.map((member, index) => (
                    <TableRow key={index}>
                      <TableCell>{`${member.name || ''} ${member.surname || ''}`.trim() || 'Sin nombre'}</TableCell>
                      <TableCell>{member.instrument || 'Sin instrumento'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={member.status || 'Sin estado'} 
                          color={member.status === 'active' ? 'success' : 'default'}
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'Sin fecha'}
                      </TableCell>
                      <TableCell>{member.phone || 'Sin teléfono'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Partituras Tab */}
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#8B0000' }}>
              Biblioteca Musical
            </Typography>
            
            <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Título</TableCell>
                    <TableCell>Compositor</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell>Instrumento</TableCell>
                    <TableCell>Fecha Agregada</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scoreStats.map((score, index) => (
                    <TableRow key={index}>
                      <TableCell>{score.title || 'Sin título'}</TableCell>
                      <TableCell>{score.composer || 'Sin compositor'}</TableCell>
                      <TableCell>
                        <Chip label={score.category || 'Sin categoría'} size="small" />
                      </TableCell>
                      <TableCell>{score.instrument || 'General'}</TableCell>
                      <TableCell>
                        {score.createdDate ? new Date(score.createdDate).toLocaleDateString() : 'Sin fecha'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Inventario Tab */}
        <TabPanel value={activeTab} index={5}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#8B0000' }}>
              Inventario de Instrumentos
            </Typography>
            
            <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Instrumento</TableCell>
                    <TableCell>Cantidad Total</TableCell>
                    <TableCell>Disponibles</TableCell>
                    <TableCell>Prestados</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryStats.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.instrument || 'Sin nombre'}</TableCell>
                      <TableCell>{item.total || 0}</TableCell>
                      <TableCell>{item.available || 0}</TableCell>
                      <TableCell>{(item.total || 0) - (item.available || 0)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.available > 0 ? 'Disponible' : 'Agotado'} 
                          color={item.available > 0 ? 'success' : 'warning'}
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Contratos Tab */}
        <TabPanel value={activeTab} index={6}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#8B0000' }}>
              Gestión de Contratos
            </Typography>
            
            <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Título</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Fecha Creación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contractStats.map((contract, index) => (
                    <TableRow key={index}>
                      <TableCell>{contract.name || 'Sin título'}</TableCell>
                      <TableCell>{contract.client || 'Sin cliente'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={contract.status || 'Sin estado'} 
                          color={contract.status === 'signed' ? 'success' : 'default'}
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {contract.amount ? `€${contract.amount.toLocaleString()}` : 'No especificado'}
                      </TableCell>
                      <TableCell>
                        {contract.contractDate ? new Date(contract.contractDate).toLocaleDateString() : 'Sin fecha'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default StatisticsManagerPage;

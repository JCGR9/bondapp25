import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  People,
  MusicNote,
  MonetizationOn,
  Assignment,
  Inventory,
  Event,
} from '@mui/icons-material';

import { initializeApp } from '../utils/autoSetup';
import { SyncStatus } from '../components/SyncStatus';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

// Interfaces para los datos reales
interface Performance {
  id: string;
  title: string;
  date: string;
  venue: string;
  income?: { amount: number }[];
  expenses?: { amount: number }[];
}

interface ComponentMember {
  id: string;
  name: string;
  surname: string;
  voice: string;
  attendedPerformances: string[];
  missedPerformances: string[];
  performanceStats: {
    totalPerformances: number;
    attended: number;
    missed: number;
    attendanceRate: number;
  };
}

interface Contract {
  id: string;
  client: string;
  amount?: number;
  status: 'pending' | 'signed' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid';
  eventDate: string;
}

interface FinancialEntry {
  id: string;
  type: 'ingreso' | 'gasto';
  amount: number;
  date: Date | string;
  concept: string;
  category: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: 'instrument' | 'uniform' | 'accessory';
  status: 'available' | 'assigned' | 'repair' | 'lost';
  assignedTo?: string;
}

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface Score {
  id: string;
  title: string;
  march: string;
  instrument: string;
  voice: string;
}

interface KPIData {
  title: string;
  value: string | number;
  trend: string;
  icon: React.ReactNode;
  color: string;
}

const DashboardRealData: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [components, setComponents] = useState<ComponentMember[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [finances, setFinances] = useState<FinancialEntry[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos reales de localStorage al inicializar
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = () => {
    try {
      // Cargar actuaciones
      const savedPerformances = localStorage.getItem('bondapp-performances');
      if (savedPerformances) {
        setPerformances(JSON.parse(savedPerformances));
      }

      // Cargar componentes
      const savedComponents = localStorage.getItem('bondapp-components');
      if (savedComponents) {
        setComponents(JSON.parse(savedComponents));
      }

      // Cargar contratos
      const savedContracts = localStorage.getItem('bondapp-contracts');
      if (savedContracts) {
        setContracts(JSON.parse(savedContracts));
      }

      // Cargar finanzas
      const savedFinances = localStorage.getItem('bondapp-finances');
      if (savedFinances) {
        const parsedFinances = JSON.parse(savedFinances);
        setFinances(parsedFinances);
      }

      // Cargar inventario
      const savedInventory = localStorage.getItem('bondapp-inventory');
      if (savedInventory) {
        setInventory(JSON.parse(savedInventory));
      }

      // Cargar tareas
      const savedTasks = localStorage.getItem('bondapp-tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }

      // Cargar partituras
      const savedScores = localStorage.getItem('bondapp-scores');
      if (savedScores) {
        setScores(JSON.parse(savedScores));
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas reales
  const getPerformancesByYear = () => {
    const currentYear = new Date().getFullYear();
    const yearData: { [key: number]: { count: number; revenue: number } } = {};

    // Inicializar últimos 5 años
    for (let i = 4; i >= 0; i--) {
      const year = currentYear - i;
      yearData[year] = { count: 0, revenue: 0 };
    }

    performances.forEach(performance => {
      const performanceYear = new Date(performance.date).getFullYear();
      if (yearData[performanceYear]) {
        yearData[performanceYear].count++;
        
        // Calcular ingresos de la actuación
        const income = performance.income?.reduce((sum, entry) => sum + entry.amount, 0) || 0;
        yearData[performanceYear].revenue += income;
      }
    });

    return Object.entries(yearData).map(([year, data]) => ({
      year: parseInt(year),
      count: data.count,
      revenue: data.revenue
    }));
  };

  const getComponentsBySection = () => {
    const sections: { [key: string]: { total: number; active: number } } = {};

    components.forEach(component => {
      const section = component.voice || 'Sin asignar';
      if (!sections[section]) {
        sections[section] = { total: 0, active: 0 };
      }
      sections[section].total++;
      
      // Considerar activo si ha asistido a más del 50% de actuaciones
      if (component.performanceStats?.attendanceRate > 0.5) {
        sections[section].active++;
      }
    });

    return sections;
  };

  const getContractStats = () => {
    const paid = contracts.filter(c => c.paymentStatus === 'paid').length;
    const pending = contracts.filter(c => c.paymentStatus === 'pending').length;
    const totalAmount = contracts.reduce((sum, c) => sum + (c.amount || 0), 0);
    const paidAmount = contracts
      .filter(c => c.paymentStatus === 'paid')
      .reduce((sum, c) => sum + (c.amount || 0), 0);

    return { paid, pending, totalAmount, paidAmount };
  };

  const getFinancialSummary = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const currentYearFinances = finances.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === currentYear;
    });

    const currentMonthFinances = finances.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === currentYear && entryDate.getMonth() === currentMonth;
    });

    const yearlyIncome = currentYearFinances
      .filter(entry => entry.type === 'ingreso')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const yearlyExpenses = currentYearFinances
      .filter(entry => entry.type === 'gasto')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const monthlyIncome = currentMonthFinances
      .filter(entry => entry.type === 'ingreso')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const monthlyExpenses = currentMonthFinances
      .filter(entry => entry.type === 'gasto')
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      yearlyBalance: yearlyIncome - yearlyExpenses,
      monthlyBalance: monthlyIncome - monthlyExpenses,
      yearlyIncome,
      yearlyExpenses,
      monthlyIncome,
      monthlyExpenses
    };
  };

  const getInventoryStats = () => {
    const available = inventory.filter(item => item.status === 'available').length;
    const assigned = inventory.filter(item => item.status === 'assigned').length;
    const repair = inventory.filter(item => item.status === 'repair').length;
    const instruments = inventory.filter(item => item.category === 'instrument').length;
    const unassignedInstruments = inventory.filter(
      item => item.category === 'instrument' && item.status === 'available'
    ).length;

    return { available, assigned, repair, instruments, unassignedInstruments };
  };

  const getTaskStats = () => {
    const completed = tasks.filter(task => task.status === 'completed').length;
    const pending = tasks.filter(task => task.status === 'pending').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const urgent = tasks.filter(task => task.priority === 'urgent' && task.status !== 'completed').length;

    return { completed, pending, inProgress, urgent, total: tasks.length };
  };

  const getCityStats = () => {
    const cityMap: { [key: string]: number } = {};
    
    performances.forEach(performance => {
      const venue = performance.venue || 'Sin especificar';
      cityMap[venue] = (cityMap[venue] || 0) + 1;
    });

    return Object.entries(cityMap)
      .map(([city, count]) => ({ name: city, performances: count }))
      .sort((a, b) => b.performances - a.performances)
      .slice(0, 6);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Cargando estadísticas...
        </Typography>
      </Container>
    );
  }

  // Calcular estadísticas
  const performancesByYear = getPerformancesByYear();
  const componentsBySection = getComponentsBySection();
  const contractStats = getContractStats();
  const financialSummary = getFinancialSummary();
  const inventoryStats = getInventoryStats();
  const taskStats = getTaskStats();
  const cityStats = getCityStats();

  // KPIs basados en datos reales
  const kpiData: KPIData[] = [
    {
      title: `Actuaciones ${new Date().getFullYear()}`,
      value: performancesByYear[performancesByYear.length - 1]?.count || 0,
      trend: performances.length > 0 ? '+' + ((performancesByYear[performancesByYear.length - 1]?.count || 0) - (performancesByYear[performancesByYear.length - 2]?.count || 0)) : '0',
      icon: <Event />,
      color: '#1976d2',
    },
    {
      title: 'Componentes Activos',
      value: Object.values(componentsBySection).reduce((sum, section) => sum + section.active, 0),
      trend: `${components.length} total`,
      icon: <People />,
      color: '#2e7d32',
    },
    {
      title: 'Balance Anual',
      value: `€${financialSummary.yearlyBalance.toLocaleString()}`,
      trend: financialSummary.yearlyBalance >= 0 ? 'Positivo' : 'Negativo',
      icon: <MonetizationOn />,
      color: financialSummary.yearlyBalance >= 0 ? '#2e7d32' : '#d32f2f',
    },
    {
      title: 'Tareas Pendientes',
      value: taskStats.pending + taskStats.inProgress,
      trend: `${taskStats.urgent} urgentes`,
      icon: <Assignment />,
      color: '#d32f2f',
    },
    {
      title: 'Partituras',
      value: scores.length,
      trend: 'En biblioteca',
      icon: <MusicNote />,
      color: '#7b1fa2',
    },
    {
      title: 'Inventario',
      value: inventory.length,
      trend: `${inventoryStats.unassignedInstruments} sin asignar`,
      icon: <Inventory />,
      color: '#1565c0',
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        📊 Dashboard - Estadísticas Reales BondApp
      </Typography>

      {/* Estado de Sincronización */}
      <SyncStatus />

      {/* KPIs principales */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Indicadores Principales
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, 
          gap: 2 
        }}>
          {kpiData.map((kpi, index) => (
            <Card key={index} sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ color: kpi.color }}>
                    {kpi.icon}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {kpi.title}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {kpi.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {kpi.trend}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Actuaciones por años */}
      {performancesByYear.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            📈 Evolución de Actuaciones por Años
          </Typography>
          <Card>
            <CardContent>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                gap: 3 
              }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Número de Actuaciones
                  </Typography>
                  {performancesByYear.map((year) => (
                    <Box key={year.year} sx={{ mb: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">{year.year}</Typography>
                        <Typography variant="body2" fontWeight="bold">{year.count}</Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={year.count > 0 ? (year.count / Math.max(...performancesByYear.map(y => y.count))) * 100 : 0} 
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  ))}
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Ingresos por Año (€)
                  </Typography>
                  {performancesByYear.map((year) => (
                    <Box key={year.year} sx={{ mb: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">{year.year}</Typography>
                        <Typography variant="body2" fontWeight="bold">€{year.revenue.toLocaleString()}</Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={year.revenue > 0 ? (year.revenue / Math.max(...performancesByYear.map(y => y.revenue))) * 100 : 0} 
                        color="secondary"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Mapa de calor de ciudades */}
      {cityStats.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            🗺️ Actuaciones por Ubicaciones
          </Typography>
          <Card>
            <CardContent>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' }, 
                gap: 2 
              }}>
                {cityStats.map((city) => {
                  const maxPerformances = Math.max(...cityStats.map(c => c.performances));
                  const intensity = city.performances / maxPerformances;
                  return (
                    <Paper 
                      key={city.name} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        bgcolor: `rgba(25, 118, 210, ${intensity})`,
                        color: intensity > 0.5 ? 'white' : 'inherit'
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        {city.name}
                      </Typography>
                      <Typography variant="h6">
                        {city.performances}
                      </Typography>
                      <Typography variant="caption">
                        actuaciones
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Distribución por componentes */}
      {Object.keys(componentsBySection).length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            👥 Distribución por Secciones
          </Typography>
          <Card>
            <CardContent>
              {Object.entries(componentsBySection).map(([section, data]) => (
                <Box key={section} sx={{ mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">{section}</Typography>
                    <Typography variant="body2">
                      {data.active}/{data.total} activos
                    </Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={data.total > 0 ? (data.active / data.total) * 100 : 0} 
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Contratos */}
      {contracts.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            💼 Estado de Contratos
          </Typography>
          <Card>
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Cliente</TableCell>
                      <TableCell align="right">Importe</TableCell>
                      <TableCell align="center">Estado de Cobro</TableCell>
                      <TableCell align="center">Fecha</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {contracts.slice(0, 5).map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>{contract.client}</TableCell>
                        <TableCell align="right">€{(contract.amount || 0).toLocaleString()}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={contract.paymentStatus === 'paid' ? 'Cobrado' : 'Pendiente'} 
                            size="small"
                            color={contract.paymentStatus === 'paid' ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell align="center">{contract.eventDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  Cobrados: {contractStats.paid} | Pendientes: {contractStats.pending}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  Total: €{contractStats.totalAmount.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Finanzas y balance */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
          gap: 2 
        }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💰 Balance Mensual
              </Typography>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography 
                  variant="h4" 
                  color={financialSummary.monthlyBalance >= 0 ? 'success.main' : 'error.main'} 
                  fontWeight="bold"
                >
                  {financialSummary.monthlyBalance >= 0 ? '+' : ''}€{financialSummary.monthlyBalance.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Balance este mes
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Balance Anual
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Ingresos</Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      +€{financialSummary.yearlyIncome.toLocaleString()}
                    </Typography>
                  </Stack>
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Gastos</Typography>
                    <Typography variant="body2" color="error.main" fontWeight="bold">
                      -€{financialSummary.yearlyExpenses.toLocaleString()}
                    </Typography>
                  </Stack>
                </Box>
                <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle2" fontWeight="bold">Total</Typography>
                    <Typography 
                      variant="subtitle2" 
                      color={financialSummary.yearlyBalance >= 0 ? 'success.main' : 'error.main'} 
                      fontWeight="bold"
                    >
                      €{financialSummary.yearlyBalance.toLocaleString()}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Inventario y tareas */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
        gap: 2 
      }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🎼 Biblioteca e Inventario
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Partituras en biblioteca</Typography>
                  <Typography variant="h6" fontWeight="bold">{scores.length}</Typography>
                </Stack>
              </Box>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Instrumentos sin asignar</Typography>
                  <Typography variant="h6" fontWeight="bold" color="warning.main">
                    {inventoryStats.unassignedInstruments}
                  </Typography>
                </Stack>
              </Box>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Items en reparación</Typography>
                  <Typography variant="h6" fontWeight="bold" color="error.main">
                    {inventoryStats.repair}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ✅ Estado de Tareas
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Tareas completadas</Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {taskStats.completed}
                  </Typography>
                </Stack>
              </Box>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Tareas pendientes</Typography>
                  <Typography variant="h6" fontWeight="bold" color="error.main">
                    {taskStats.pending + taskStats.inProgress}
                  </Typography>
                </Stack>
              </Box>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Tareas urgentes</Typography>
                  <Typography variant="h6" fontWeight="bold" color="warning.main">
                    {taskStats.urgent}
                  </Typography>
                </Stack>
              </Box>
              {taskStats.total > 0 && (
                <LinearProgress 
                  variant="determinate" 
                  value={(taskStats.completed / taskStats.total) * 100} 
                  color="success"
                  sx={{ height: 8, borderRadius: 4 }}
                />
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Información sobre datos */}
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Typography variant="body2">
            ℹ️ Dashboard actualizado en tiempo real con datos de: {performances.length} actuaciones, 
            {components.length} componentes, {contracts.length} contratos, {finances.length} entradas financieras, 
            {inventory.length} items de inventario, {tasks.length} tareas y {scores.length} partituras.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default DashboardRealData;

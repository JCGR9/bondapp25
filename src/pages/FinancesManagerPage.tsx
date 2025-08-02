import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,  
  DialogActions,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Fab,
  FormControl,
  InputLabel,
  Select,
  List,
  ListItem,
  ListItemText,
  Alert,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
  MoneyOff as RemoveMoneyIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  FileDownload as FileDownloadIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Interfaces
interface FinancialEntry {
  id: string;
  entryNumber: number;
  date: Date;
  concept: string;
  category: string;
  subcategory: string;
  type: 'ingreso' | 'gasto';
  amount: number;
  paymentMethod: string;
  description: string;
  receipt?: string;
  tags: string[];
  relatedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FinancialCategory {
  id: string;
  name: string;
  type: 'ingreso' | 'gasto';
  description: string;
  subcategories: string[];
  color: string;
}

interface FinancialSummary {
  totalIngresos: number;
  totalGastos: number;
  balance: number;
  entradas: number;
  periodoActual: {
    ingresos: number;
    gastos: number;
    balance: number;
  };
  periodoAnterior: {
    ingresos: number;
    gastos: number;
    balance: number;
  };
}

// Categorías predefinidas
const defaultCategories: FinancialCategory[] = [
  {
    id: 'conciertos',
    name: 'Conciertos y Actuaciones',
    type: 'ingreso',
    description: 'Ingresos por presentaciones musicales',
    subcategories: ['Conciertos públicos', 'Eventos privados', 'Festivales', 'Bodas', 'Corporativos'],
    color: '#4CAF50'
  },
  {
    id: 'clases',
    name: 'Compra Instrumentos',
    type: 'ingreso',
    description: 'Ingresos por venta de instrumentos',
    subcategories: ['Instrumentos de viento', 'Instrumentos de percusión', 'Accesorios', 'Equipos de sonido'],
    color: '#2196F3'
  },
  {
    id: 'grabaciones',
    name: 'Grabaciones y Producciones',
    type: 'ingreso',
    description: 'Ingresos por producciones musicales',
    subcategories: ['Álbumes', 'Singles', 'Bandas sonoras', 'Jingles'],
    color: '#FF9800'
  },
  {
    id: 'subvenciones',
    name: 'Subvenciones y Ayudas',
    type: 'ingreso',
    description: 'Ayudas institucionales y subvenciones',
    subcategories: ['Ministerio de Cultura', 'Comunidad Autónoma', 'Ayuntamiento', 'Fundaciones'],
    color: '#9C27B0'
  },
  {
    id: 'instrumentos',
    name: 'Instrumentos y Equipamiento',
    type: 'gasto',
    description: 'Compra y mantenimiento de instrumentos',
    subcategories: ['Instrumentos nuevos', 'Reparaciones', 'Accesorios', 'Mantenimiento'],
    color: '#F44336'
  },
  {
    id: 'transporte',
    name: 'Transporte y Logística',
    type: 'gasto',
    description: 'Gastos de desplazamiento y transporte',
    subcategories: ['Combustible', 'Alquiler de vehículos', 'Peajes', 'Aparcamiento'],
    color: '#E91E63'
  },
  {
    id: 'alojamiento',
    name: 'Alquileres',
    type: 'gasto',
    description: 'Gastos de alquileres diversos',
    subcategories: ['Alquiler de local', 'Alquiler de instrumentos', 'Alquiler de equipos', 'Alquiler de transporte'],
    color: '#795548'
  },
  {
    id: 'promocion',
    name: 'Promoción y Marketing',
    type: 'gasto',
    description: 'Gastos de promoción y publicidad',
    subcategories: ['Diseño gráfico', 'Impresión', 'Redes sociales', 'Páginas web'],
    color: '#607D8B'
  }
];

const paymentMethods = [
  'Efectivo',
  'Transferencia bancaria',
  'Tarjeta de crédito',
  'Tarjeta de débito',
  'PayPal',
  'Bizum',
  'Cheque',
  'Domiciliación'
];

const FinancesManagerPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [categories] = useState<FinancialCategory[]>(defaultCategories);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinancialEntry | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    concept: '',
    category: '',
    subcategory: '',
    type: 'ingreso' as 'ingreso' | 'gasto',
    amount: '',
    paymentMethod: '',
    description: '',
    tags: '',
    relatedTo: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = () => {
    try {
      const savedEntries = localStorage.getItem('bondapp_financial_entries');
      if (savedEntries) {
        const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
          ...entry,
          date: new Date(entry.date),
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt)
        }));
        setEntries(parsedEntries);
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
    }
  };

  const saveFinancialData = (newEntries: FinancialEntry[]) => {
    try {
      localStorage.setItem('bondapp_financial_entries', JSON.stringify(newEntries));
      setEntries(newEntries);
    } catch (error) {
      console.error('Error saving financial data:', error);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleOpenDialog = (entry?: FinancialEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        date: format(entry.date, 'yyyy-MM-dd'),
        concept: entry.concept,
        category: entry.category,
        subcategory: entry.subcategory,
        type: entry.type,
        amount: entry.amount.toString(),
        paymentMethod: entry.paymentMethod,
        description: entry.description,
        tags: entry.tags.join(', '),
        relatedTo: entry.relatedTo || ''
      });
    } else {
      setEditingEntry(null);
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        concept: '',
        category: '',
        subcategory: '',
        type: 'ingreso',
        amount: '',
        paymentMethod: '',
        description: '',
        tags: '',
        relatedTo: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEntry(null);
  };

  const handleSaveEntry = () => {
    if (!formData.concept || !formData.amount || !formData.category) {
      return;
    }

    const now = new Date();
    const entryData: FinancialEntry = {
      id: editingEntry?.id || `entry_${Date.now()}`,
      entryNumber: editingEntry?.entryNumber || getNextEntryNumber(),
      date: new Date(formData.date),
      concept: formData.concept,
      category: formData.category,
      subcategory: formData.subcategory,
      type: formData.type,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod,
      description: formData.description,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      relatedTo: formData.relatedTo || undefined,
      createdAt: editingEntry?.createdAt || now,
      updatedAt: now
    };

    if (editingEntry) {
      const updatedEntries = entries.map(entry => 
        entry.id === editingEntry.id ? entryData : entry
      );
      saveFinancialData(updatedEntries);
    } else {
      const newEntries = [...entries, entryData];
      saveFinancialData(newEntries);
    }

    handleCloseDialog();
  };

  const handleDeleteEntry = (entryId: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    saveFinancialData(updatedEntries);
  };

  const getNextEntryNumber = (): number => {
    if (entries.length === 0) return 1;
    return Math.max(...entries.map(entry => entry.entryNumber)) + 1;
  };

  const getFinancialSummary = (): FinancialSummary => {
    const now = new Date();
    let startDate: Date, endDate: Date;
    let previousStartDate: Date, previousEndDate: Date;

    switch (selectedPeriod) {
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        previousStartDate = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1));
        previousEndDate = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1));
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        previousStartDate = startOfYear(new Date(now.getFullYear() - 1, 0));
        previousEndDate = endOfYear(new Date(now.getFullYear() - 1, 0));
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        previousStartDate = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1));
        previousEndDate = endOfMonth(new Date(now.getFullYear(), now.getMonth() - 1));
    }

    const currentEntries = entries.filter(entry =>
      isWithinInterval(entry.date, { start: startDate, end: endDate })
    );

    const previousEntries = entries.filter(entry =>
      isWithinInterval(entry.date, { start: previousStartDate, end: previousEndDate })
    );

    const totalIngresos = entries
      .filter(entry => entry.type === 'ingreso')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalGastos = entries
      .filter(entry => entry.type === 'gasto')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const currentIngresos = currentEntries
      .filter(entry => entry.type === 'ingreso')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const currentGastos = currentEntries
      .filter(entry => entry.type === 'gasto')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const previousIngresos = previousEntries
      .filter(entry => entry.type === 'ingreso')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const previousGastos = previousEntries
      .filter(entry => entry.type === 'gasto')
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      totalIngresos,
      totalGastos,
      balance: totalIngresos - totalGastos,
      entradas: entries.length,
      periodoActual: {
        ingresos: currentIngresos,
        gastos: currentGastos,
        balance: currentIngresos - currentGastos
      },
      periodoAnterior: {
        ingresos: previousIngresos,
        gastos: previousGastos,
        balance: previousIngresos - previousGastos
      }
    };
  };

  const getFilteredEntries = (): FinancialEntry[] => {
    return entries.filter(entry => {
      if (filterCategory && entry.category !== filterCategory) return false;
      if (filterType && entry.type !== filterType) return false;
      return true;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  const getCategoryByType = (type: 'ingreso' | 'gasto') => {
    return categories.filter(cat => cat.type === type);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = [
      'Número de Asiento',
      'Fecha',
      'Concepto',
      'Categoría',
      'Subcategoría',
      'Tipo',
      'Importe',
      'Método de Pago',
      'Descripción',
      'Etiquetas'
    ];

    const csvContent = [
      headers.join(','),
      ...getFilteredEntries().map(entry => [
        entry.entryNumber,
        format(entry.date, 'dd/MM/yyyy'),
        `"${entry.concept}"`,
        `"${entry.category}"`,
        `"${entry.subcategory}"`,
        entry.type,
        entry.amount,
        `"${entry.paymentMethod}"`,
        `"${entry.description}"`,
        `"${entry.tags.join('; ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `libro_diario_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = getFinancialSummary();
  const filteredEntries = getFilteredEntries();

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#8B0000' }}>
          💰 Ingresos y Gastos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={exportToCSV}
            sx={{ borderColor: '#8B0000', color: '#8B0000' }}
          >
            Exportar CSV
          </Button>
          <Fab
            color="primary"
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: '#8B0000', '&:hover': { bgcolor: '#660000' } }}
          >
            <AddIcon />
          </Fab>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ 
          minWidth: 200,
          background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
          color: 'white',
          flex: 1
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Ingresos Totales</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {formatCurrency(summary.totalIngresos)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Período actual: {formatCurrency(summary.periodoActual.ingresos)}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          minWidth: 200,
          background: 'linear-gradient(135deg, #F44336 0%, #C62828 100%)',
          color: 'white',
          flex: 1
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingDownIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Gastos Totales</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {formatCurrency(summary.totalGastos)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Período actual: {formatCurrency(summary.periodoActual.gastos)}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          minWidth: 200,
          background: summary.balance >= 0 
            ? 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)'
            : 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
          color: 'white',
          flex: 1
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccountBalanceIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Balance Total</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {formatCurrency(summary.balance)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Período actual: {formatCurrency(summary.periodoActual.balance)}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          minWidth: 200,
          background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
          color: 'white',
          flex: 1
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ReceiptIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Total Entradas</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {summary.entradas}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Registros en el libro diario
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: '100%', bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="finanzas tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="📋 Libro Diario" />
          <Tab label="📊 Análisis" />
          <Tab label="📈 Reportes" />
          <Tab label="⚙️ Configuración" />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {/* Libro Diario Tab */}
          {currentTab === 0 && (
            <Box>
              {/* Filters */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Período</InputLabel>
                  <Select
                    value={selectedPeriod}
                    label="Período"
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    <MenuItem value="month">Este mes</MenuItem>
                    <MenuItem value="year">Este año</MenuItem>
                    <MenuItem value="all">Todo el tiempo</MenuItem>
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={filterCategory}
                    label="Categoría"
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {categories.map(cat => (
                      <MenuItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={filterType}
                    label="Tipo"
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="ingreso">Ingresos</MenuItem>
                    <MenuItem value="gasto">Gastos</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Entries Table */}
              <TableContainer component={Paper} sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Nº</strong></TableCell>
                      <TableCell><strong>Fecha</strong></TableCell>
                      <TableCell><strong>Concepto</strong></TableCell>
                      <TableCell><strong>Categoría</strong></TableCell>
                      <TableCell><strong>Tipo</strong></TableCell>
                      <TableCell><strong>Importe</strong></TableCell>
                      <TableCell><strong>Método</strong></TableCell>
                      <TableCell><strong>Acciones</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography variant="body1" sx={{ py: 4, color: 'text.secondary' }}>
                            No hay registros financieros. ¡Añade tu primera entrada!
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEntries.map((entry) => (
                        <TableRow key={entry.id} hover>
                          <TableCell>{entry.entryNumber}</TableCell>
                          <TableCell>{format(entry.date, 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{entry.concept}</TableCell>
                          <TableCell>
                            <Chip 
                              label={entry.category}
                              size="small"
                              sx={{ 
                                bgcolor: categories.find(cat => cat.name === entry.category)?.color || '#666',
                                color: 'white'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={entry.type}
                              size="small"
                              color={entry.type === 'ingreso' ? 'success' : 'error'}
                              icon={entry.type === 'ingreso' ? <AttachMoneyIcon /> : <RemoveMoneyIcon />}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography 
                              sx={{ 
                                color: entry.type === 'ingreso' ? '#4CAF50' : '#F44336',
                                fontWeight: 'bold'
                              }}
                            >
                              {formatCurrency(entry.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>{entry.paymentMethod}</TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              onClick={() => handleOpenDialog(entry)}
                              sx={{ color: '#8B0000' }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteEntry(entry.id)}
                              sx={{ color: '#F44336' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Análisis Tab */}
          {currentTab === 1 && (
            <Box>
              <Typography variant="h5" sx={{ mb: 3, color: '#8B0000' }}>
                📊 Análisis Financiero
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {/* Distribución por Categorías de Ingresos */}
                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', flex: 1, minWidth: 300 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <PieChartIcon sx={{ mr: 1 }} />
                      Ingresos por Categoría
                    </Typography>
                    <List>
                      {getCategoryByType('ingreso').map(category => {
                        const categoryTotal = entries
                          .filter(entry => entry.category === category.name && entry.type === 'ingreso')
                          .reduce((sum, entry) => sum + entry.amount, 0);
                        const percentage = summary.totalIngresos > 0 ? (categoryTotal / summary.totalIngresos) * 100 : 0;
                        
                        return (
                          <ListItem key={category.id} sx={{ py: 1 }}>
                            <Box sx={{ 
                              width: 16, 
                              height: 16, 
                              bgcolor: category.color, 
                              borderRadius: '50%', 
                              mr: 2 
                            }} />
                            <ListItemText 
                              primary={category.name}
                              secondary={`${formatCurrency(categoryTotal)} (${percentage.toFixed(1)}%)`}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </CardContent>
                </Card>

                {/* Distribución por Categorías de Gastos */}
                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', flex: 1, minWidth: 300 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <PieChartIcon sx={{ mr: 1 }} />
                      Gastos por Categoría
                    </Typography>
                    <List>
                      {getCategoryByType('gasto').map(category => {
                        const categoryTotal = entries
                          .filter(entry => entry.category === category.name && entry.type === 'gasto')
                          .reduce((sum, entry) => sum + entry.amount, 0);
                        const percentage = summary.totalGastos > 0 ? (categoryTotal / summary.totalGastos) * 100 : 0;
                        
                        return (
                          <ListItem key={category.id} sx={{ py: 1 }}>
                            <Box sx={{ 
                              width: 16, 
                              height: 16, 
                              bgcolor: category.color, 
                              borderRadius: '50%', 
                              mr: 2 
                            }} />
                            <ListItemText 
                              primary={category.name}
                              secondary={`${formatCurrency(categoryTotal)} (${percentage.toFixed(1)}%)`}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </CardContent>
                </Card>
              </Box>

              {/* Comparación de Períodos */}
              <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <BarChartIcon sx={{ mr: 1 }} />
                    Comparación de Períodos
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #333', borderRadius: 1, flex: 1, minWidth: 200 }}>
                      <Typography variant="subtitle1">Período Actual</Typography>
                      <Typography variant="h5" color="success.main">
                        {formatCurrency(summary.periodoActual.ingresos)}
                      </Typography>
                      <Typography variant="body2">Ingresos</Typography>
                      <Typography variant="h5" color="error.main">
                        {formatCurrency(summary.periodoActual.gastos)}
                      </Typography>
                      <Typography variant="body2">Gastos</Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="h5" color={summary.periodoActual.balance >= 0 ? 'success.main' : 'error.main'}>
                        {formatCurrency(summary.periodoActual.balance)}
                      </Typography>
                      <Typography variant="body2">Balance</Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #333', borderRadius: 1, flex: 1, minWidth: 200 }}>
                      <Typography variant="subtitle1">Período Anterior</Typography>
                      <Typography variant="h5" color="success.main">
                        {formatCurrency(summary.periodoAnterior.ingresos)}
                      </Typography>
                      <Typography variant="body2">Ingresos</Typography>
                      <Typography variant="h5" color="error.main">
                        {formatCurrency(summary.periodoAnterior.gastos)}
                      </Typography>
                      <Typography variant="body2">Gastos</Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="h5" color={summary.periodoAnterior.balance >= 0 ? 'success.main' : 'error.main'}>
                        {formatCurrency(summary.periodoAnterior.balance)}
                      </Typography>
                      <Typography variant="body2">Balance</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Reportes Tab */}
          {currentTab === 2 && (
            <Box>
              <Typography variant="h5" sx={{ mb: 3, color: '#8B0000' }}>
                📈 Reportes Financieros
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Los reportes detallados y gráficos interactivos se implementarán en la próxima versión.
                Por ahora puedes exportar los datos en formato CSV.
              </Alert>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', flex: 1, minWidth: 300 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ShowChartIcon sx={{ fontSize: 48, color: '#8B0000', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Evolución Temporal
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Gráfico de líneas mostrando la evolución de ingresos y gastos a lo largo del tiempo.
                    </Typography>
                    <Button variant="outlined" disabled>
                      Próximamente
                    </Button>
                  </CardContent>
                </Card>
                
                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', flex: 1, minWidth: 300 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AssessmentIcon sx={{ fontSize: 48, color: '#8B0000', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Informe Detallado
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Reporte completo con análisis de rentabilidad y recomendaciones.
                    </Typography>
                    <Button variant="outlined" disabled>
                      Próximamente
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}

          {/* Configuración Tab */}
          {currentTab === 3 && (
            <Box>
              <Typography variant="h5" sx={{ mb: 3, color: '#8B0000' }}>
                ⚙️ Configuración del Sistema
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Categorías disponibles en el sistema:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {categories.map(category => (
                  <Card key={category.id} sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', minWidth: 300 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: category.color, 
                          borderRadius: '50%', 
                          mr: 2 
                        }} />
                        <Box>
                          <Typography variant="h6">{category.name}</Typography>
                          <Chip 
                            label={category.type} 
                            size="small" 
                            color={category.type === 'ingreso' ? 'success' : 'error'}
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {category.description}
                      </Typography>
                      <Typography variant="caption">
                        Subcategorías: {category.subcategories.join(', ')}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingEntry ? 'Editar Registro' : 'Nuevo Registro Financiero'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Fecha"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <TextField
                label="Concepto"
                value={formData.concept}
                onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                required
                sx={{ flex: 2, minWidth: 200 }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                select
                label="Tipo"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'ingreso' | 'gasto', category: '', subcategory: '' })}
                required
                sx={{ flex: 1, minWidth: 150 }}
              >
                <MenuItem value="ingreso">Ingreso</MenuItem>
                <MenuItem value="gasto">Gasto</MenuItem>
              </TextField>
              
              <TextField
                select
                label="Categoría"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                required
                sx={{ flex: 1, minWidth: 200 }}
              >
                {getCategoryByType(formData.type).map(cat => (
                  <MenuItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
              
              <TextField
                select
                label="Subcategoría"
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                disabled={!formData.category}
                sx={{ flex: 1, minWidth: 200 }}
              >
                {formData.category && 
                  categories
                    .find(cat => cat.name === formData.category)
                    ?.subcategories.map(subcat => (
                      <MenuItem key={subcat} value={subcat}>
                        {subcat}
                      </MenuItem>
                    ))
                }
              </TextField>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Importe (€)"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                sx={{ flex: 1, minWidth: 150 }}
              />
              
              <TextField
                select
                label="Método de Pago"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                sx={{ flex: 1, minWidth: 200 }}
              >
                {paymentMethods.map(method => (
                  <MenuItem key={method} value={method}>
                    {method}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            
            <TextField
              label="Descripción"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            
            <TextField
              label="Etiquetas (separadas por comas)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              helperText="Ej: concierto, navidad, festival"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSaveEntry}
            variant="contained"
            sx={{ bgcolor: '#8B0000', '&:hover': { bgcolor: '#660000' } }}
          >
            {editingEntry ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinancesManagerPage;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Chip,
  Card,
  CardContent,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  MusicNote as MusicNoteIcon,
  Checkroom as CheckroomIcon,
  Build as BuildIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';

// Importar datos
import componentsData from '../data/components.json';

// Interfaces
interface InventoryItem {
  id: string;
  name: string;
  category: 'instrument' | 'uniform' | 'accessory';
  subcategory?: string; // Para uniformes: 'gala' | 'beduino'
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate: string;
  purchasePrice: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'repair';
  status: 'available' | 'assigned' | 'repair' | 'lost';
  assignedTo?: string; // ID del componente
  assignmentDate?: string;
  location: string;
  notes?: string;
  photos?: string[];
  history: InventoryHistory[];
}

interface InventoryHistory {
  id: string;
  date: string;
  action: 'added' | 'assigned' | 'unassigned' | 'repair' | 'returned' | 'lost' | 'found';
  memberId?: string;
  memberName?: string;
  notes?: string;
  userId: string;
}

interface ComponentMember {
  id: string;
  name: string;
  surname: string;
  voice: string;
  instrument: string | null;
  assignedInventory?: string[]; // IDs de items asignados
}

const InventoryManagerPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [components, setComponents] = useState<ComponentMember[]>([]);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Estados para diálogos
  const [itemDialog, setItemDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Estados para formularios
  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'instrument' as 'instrument' | 'uniform' | 'accessory',
    subcategory: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: 0,
    condition: 'excellent' as 'excellent' | 'good' | 'fair' | 'poor' | 'repair',
    location: '',
    notes: '',
    quantity: 1,
  });

  useEffect(() => {
    loadInventory();
    loadComponents();
  }, []);

  // Auto-guardar inventario
  useEffect(() => {
    if (inventory.length > 0) {
      saveInventoryToStorage(inventory);
    }
  }, [inventory]);

  const loadInventory = () => {
    try {
      const savedInventory = localStorage.getItem('bondapp-inventory');
      if (savedInventory) {
        const parsedData = JSON.parse(savedInventory);
        setInventory(parsedData);
        console.log('Inventario cargado desde localStorage:', parsedData);
        return;
      }

      // Datos de ejemplo si no hay datos guardados
      const defaultInventory: InventoryItem[] = [
        {
          id: '1',
          name: 'Trompeta Yamaha YTR-2330',
          category: 'instrument',
          brand: 'Yamaha',
          model: 'YTR-2330',
          serialNumber: 'Y123456789',
          purchaseDate: '2023-01-15',
          purchasePrice: 450,
          condition: 'good',
          status: 'assigned',
          assignedTo: '1',
          assignmentDate: '2023-02-01',
          location: 'Archivo Musical',
          notes: 'Instrumento en buen estado, última revisión febrero 2024',
          history: [
            {
              id: '1',
              date: '2023-01-15',
              action: 'added',
              notes: 'Compra inicial',
              userId: 'admin'
            },
            {
              id: '2',
              date: '2023-02-01',
              action: 'assigned',
              memberId: '1',
              memberName: 'Juan Pérez',
              userId: 'admin'
            }
          ]
        },
        {
          id: '2',
          name: 'Chaqueta de Gala - Talla M',
          category: 'uniform',
          subcategory: 'gala',
          purchaseDate: '2022-05-20',
          purchasePrice: 120,
          condition: 'excellent',
          status: 'available',
          location: 'Almacén de Uniformes',
          notes: 'Nueva, sin usar',
          history: [
            {
              id: '3',
              date: '2022-05-20',
              action: 'added',
              notes: 'Compra de lote de uniformes',
              userId: 'admin'
            }
          ]
        }
      ];

      setInventory(defaultInventory);
      localStorage.setItem('bondapp-inventory', JSON.stringify(defaultInventory));
      console.log('Inventario de ejemplo cargado:', defaultInventory);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
    }
  };

  const loadComponents = () => {
    try {
      const savedComponents = localStorage.getItem('bondapp-components');
      if (savedComponents) {
        const parsedData = JSON.parse(savedComponents);
        setComponents(parsedData);
        return;
      }
      
      // Cargar desde datos base si no hay datos guardados
      const data = componentsData.map(comp => ({
        id: comp.id,
        name: comp.name,
        surname: comp.surname,
        voice: comp.voice,
        instrument: comp.instrument,
        assignedInventory: []
      })) as ComponentMember[];
      setComponents(data);
    } catch (error) {
      console.error('Error al cargar componentes:', error);
    }
  };

  const saveInventoryToStorage = (inventoryData: InventoryItem[]) => {
    try {
      localStorage.setItem('bondapp-inventory', JSON.stringify(inventoryData));
      console.log('Inventario guardado en localStorage');
    } catch (error) {
      console.error('Error al guardar inventario:', error);
    }
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setSuccess('');
  };

  // Funciones de filtrado y ordenación
  const getFilteredAndSortedInventory = () => {
    let filtered = inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    if (sortColumn) {
      filtered.sort((a, b) => {
        let aValue: any = '';
        let bValue: any = '';

        switch (sortColumn) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'category':
            aValue = a.category;
            bValue = b.category;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'purchaseDate':
            aValue = new Date(a.purchaseDate);
            bValue = new Date(b.purchaseDate);
            break;
          case 'purchasePrice':
            aValue = a.purchasePrice;
            bValue = b.purchasePrice;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          return sortDirection === 'asc' 
            ? aValue - bValue
            : bValue - aValue;
        }
      });
    }

    return filtered;
  };

  const handleSort = (column: string) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
  };

  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' 
      ? <ArrowUpwardIcon sx={{ ml: 1, fontSize: 16 }} />
      : <ArrowDownwardIcon sx={{ ml: 1, fontSize: 16 }} />;
  };

  // Funciones para gestión de items
  const handleCreateItem = () => {
    setItemForm({
      name: '',
      category: 'instrument',
      subcategory: '',
      brand: '',
      model: '',
      serialNumber: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: 0,
      condition: 'excellent',
      location: '',
      notes: '',
      quantity: 1,
    });
    setItemDialog(true);
  };

  const handleSaveItem = () => {
    try {
      if (!itemForm.name.trim()) {
        showError('El nombre del artículo es obligatorio');
        return;
      }

      if (itemForm.purchasePrice < 0) {
        showError('El precio no puede ser negativo');
        return;
      }

      const quantity = Math.max(1, itemForm.quantity);
      const newItems: InventoryItem[] = [];

      for (let i = 0; i < quantity; i++) {
        const newItem: InventoryItem = {
          id: `${Date.now()}-${i}`,
          name: quantity > 1 ? `${itemForm.name} #${i + 1}` : itemForm.name,
          category: itemForm.category,
          subcategory: itemForm.subcategory || undefined,
          brand: itemForm.brand || undefined,
          model: itemForm.model || undefined,
          serialNumber: itemForm.serialNumber || undefined,
          purchaseDate: itemForm.purchaseDate,
          purchasePrice: itemForm.purchasePrice,
          condition: itemForm.condition,
          status: 'available',
          location: itemForm.location,
          notes: itemForm.notes || undefined,
          history: [
            {
              id: `hist-${Date.now()}-${i}`,
              date: new Date().toISOString(),
              action: 'added',
              notes: 'Artículo añadido al inventario',
              userId: 'admin'
            }
          ]
        };
        newItems.push(newItem);
      }

      setInventory([...inventory, ...newItems]);
      showSuccess(`${quantity} artículo(s) añadido(s) al inventario`);
      setItemDialog(false);
    } catch (err) {
      showError('Error al guardar artículo');
    }
  };

  const handleDeleteItem = (item: InventoryItem) => {
    if (item.status === 'assigned') {
      showError('No se puede eliminar un artículo asignado. Primero desasígnalo.');
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar "${item.name}"?`)) {
      setInventory(inventory.filter(i => i.id !== item.id));
      showSuccess('Artículo eliminado correctamente');
    }
  };

  // Funciones para asignaciones
  const handleAssignItem = (item: InventoryItem) => {
    if (item.status !== 'available') {
      showError('Solo se pueden asignar artículos disponibles');
      return;
    }
    setSelectedItem(item);
    setAssignDialog(true);
  };

  const handleConfirmAssignment = (memberId: string) => {
    if (!selectedItem) return;

    const member = components.find(c => c.id === memberId);
    if (!member) {
      showError('Componente no encontrado');
      return;
    }

    const updatedItem = {
      ...selectedItem,
      status: 'assigned' as const,
      assignedTo: memberId,
      assignmentDate: new Date().toISOString(),
      history: [
        ...selectedItem.history,
        {
          id: `hist-${Date.now()}`,
          date: new Date().toISOString(),
          action: 'assigned' as const,
          memberId,
          memberName: `${member.name} ${member.surname}`,
          userId: 'admin'
        }
      ]
    };

    setInventory(inventory.map(item => 
      item.id === selectedItem.id ? updatedItem : item
    ));

    showSuccess(`Artículo asignado a ${member.name} ${member.surname}`);
    setAssignDialog(false);
    setSelectedItem(null);
  };

  const handleUnassignItem = (item: InventoryItem) => {
    if (item.status !== 'assigned') {
      showError('Este artículo no está asignado');
      return;
    }

    const member = components.find(c => c.id === item.assignedTo);
    const memberName = member ? `${member.name} ${member.surname}` : 'Desconocido';

    if (window.confirm(`¿Desasignar "${item.name}" de ${memberName}?`)) {
      const updatedItem = {
        ...item,
        status: 'available' as const,
        assignedTo: undefined,
        assignmentDate: undefined,
        history: [
          ...item.history,
          {
            id: `hist-${Date.now()}`,
            date: new Date().toISOString(),
            action: 'unassigned' as const,
            memberId: item.assignedTo,
            memberName,
            userId: 'admin'
          }
        ]
      };

      setInventory(inventory.map(i => 
        i.id === item.id ? updatedItem : i
      ));

      showSuccess('Artículo desasignado correctamente');
    }
  };

  // Funciones helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'instrument': return <MusicNoteIcon />;
      case 'uniform': return <CheckroomIcon />;
      case 'accessory': return <BuildIcon />;
      default: return <InventoryIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'assigned': return 'primary';
      case 'repair': return 'warning';
      case 'lost': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'assigned': return 'Asignado';
      case 'repair': return 'En Reparación';
      case 'lost': return 'Perdido';
      default: return status;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'instrument': return 'Instrumento';
      case 'uniform': return 'Uniforme';
      case 'accessory': return 'Accesorio';
      default: return category;
    }
  };

  const getInventoryStats = () => {
    const total = inventory.length;
    const available = inventory.filter(i => i.status === 'available').length;
    const assigned = inventory.filter(i => i.status === 'assigned').length;
    const repair = inventory.filter(i => i.status === 'repair').length;
    const lost = inventory.filter(i => i.status === 'lost').length;
    const totalValue = inventory.reduce((sum, item) => sum + item.purchasePrice, 0);

    return { total, available, assigned, repair, lost, totalValue };
  };

  const stats = getInventoryStats();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InventoryIcon sx={{ color: '#8B0000', fontSize: 32, mr: 2 }} />
          <Typography
            variant="h4"
            sx={{
              color: 'transparent',
              background: 'linear-gradient(135deg, #8B0000 0%, #FF4444 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              fontWeight: 700,
            }}
          >
            📦 Gestión de Inventario
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateItem}
          sx={{
            background: 'linear-gradient(135deg, #8B0000 0%, #A00000 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #A00000 0%, #BB0000 100%)',
            },
          }}
        >
          Añadir Artículo
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Estadísticas con Cards simples */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Card sx={{ 
          minWidth: 150,
          background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
          color: 'white'
        }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4">{stats.total}</Typography>
            <Typography variant="body2">Total Items</Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          minWidth: 150,
          background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
          color: 'white'
        }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4">{stats.available}</Typography>
            <Typography variant="body2">Disponibles</Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ 
          minWidth: 150,
          background: 'linear-gradient(135deg, #8B0000 0%, #FF4444 100%)',
          color: 'white'
        }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4">{stats.assigned}</Typography>
            <Typography variant="body2">Asignados</Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          minWidth: 150,
          background: 'linear-gradient(135deg, #f57f17 0%, #ffb300 100%)',
          color: 'white'
        }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4">{stats.repair}</Typography>
            <Typography variant="body2">En Reparación</Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          minWidth: 150,
          background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
          color: 'white'
        }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4">{stats.lost}</Typography>
            <Typography variant="body2">Perdidos</Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          minWidth: 150,
          background: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)',
          color: 'white'
        }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4">{stats.totalValue.toLocaleString()}€</Typography>
            <Typography variant="body2">Valor Total</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filtros y búsqueda */}
      <Paper elevation={4} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'rgba(0,0,0,0.6)' }} />,
            }}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="instrument">Instrumentos</MenuItem>
              <MenuItem value="uniform">Uniformes</MenuItem>
              <MenuItem value="accessory">Accesorios</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="available">Disponible</MenuItem>
              <MenuItem value="assigned">Asignado</MenuItem>
              <MenuItem value="repair">En Reparación</MenuItem>
              <MenuItem value="lost">Perdido</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Tabla de inventario */}
      <Paper elevation={8} sx={{ 
        background: 'linear-gradient(145deg, rgba(28, 28, 28, 0.9) 0%, rgba(35, 35, 35, 0.85) 100%)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(139, 0, 0, 0.15)',
        borderRadius: 3,
        p: 3,
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    color: '#FFFFFF', 
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(139, 0, 0, 0.1)' }
                  }}
                  onClick={() => handleSort('name')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Artículo
                    {renderSortIcon('name')}
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ 
                    color: '#FFFFFF', 
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(139, 0, 0, 0.1)' }
                  }}
                  onClick={() => handleSort('category')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Categoría
                    {renderSortIcon('category')}
                  </Box>
                </TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Detalles</TableCell>
                <TableCell 
                  sx={{ 
                    color: '#FFFFFF', 
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(139, 0, 0, 0.1)' }
                  }}
                  onClick={() => handleSort('status')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Estado
                    {renderSortIcon('status')}
                  </Box>
                </TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Asignación</TableCell>
                <TableCell 
                  sx={{ 
                    color: '#FFFFFF', 
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(139, 0, 0, 0.1)' }
                  }}
                  onClick={() => handleSort('purchasePrice')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Valor
                    {renderSortIcon('purchasePrice')}
                  </Box>
                </TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredAndSortedInventory().map((item) => {
                const assignedMember = item.assignedTo ? 
                  components.find(c => c.id === item.assignedTo) : null;

                return (
                  <TableRow 
                    key={item.id} 
                    sx={{ '&:hover': { backgroundColor: 'rgba(139, 0, 0, 0.05)' } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          backgroundColor: '#8B0000',
                          width: 40, 
                          height: 40 
                        }}>
                          {getCategoryIcon(item.category)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                          {item.brand && item.model && (
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              {item.brand} {item.model}
                            </Typography>
                          )}
                          {item.serialNumber && (
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block' }}>
                              S/N: {item.serialNumber}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getCategoryText(item.category)}
                        size="small"
                        sx={{
                          backgroundColor: '#8B0000',
                          color: '#FFFFFF',
                        }}
                      />
                      {item.subcategory && (
                        <Chip
                          label={item.subcategory.charAt(0).toUpperCase() + item.subcategory.slice(1)}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(139, 0, 0, 0.3)',
                            color: '#FFFFFF',
                            ml: 1
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                        📍 {item.location}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        📅 {new Date(item.purchaseDate).toLocaleDateString('es-ES')}
                      </Typography>
                      {item.notes && (
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block' }}>
                          📝 {item.notes}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(item.status)}
                        color={getStatusColor(item.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {item.status === 'assigned' && assignedMember ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {assignedMember.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                              {assignedMember.name} {assignedMember.surname}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              📅 {item.assignmentDate ? new Date(item.assignmentDate).toLocaleDateString('es-ES') : ''}
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          Sin asignar
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                        {item.purchasePrice.toLocaleString()}€
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {item.status === 'available' && (
                          <IconButton
                            size="small"
                            onClick={() => handleAssignItem(item)}
                            sx={{ color: '#4CAF50' }}
                            title="Asignar"
                          >
                            <AssignmentIcon fontSize="small" />
                          </IconButton>
                        )}
                        
                        {item.status === 'assigned' && (
                          <IconButton
                            size="small"
                            onClick={() => handleUnassignItem(item)}
                            sx={{ color: '#FF9800' }}
                            title="Desasignar"
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        )}
                        
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteItem(item)}
                          sx={{ color: '#FF5722' }}
                          title="Eliminar"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {getFilteredAndSortedInventory().length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              No se encontraron artículos con los filtros aplicados
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Dialog para añadir/editar artículos */}
      <Dialog
        open={itemDialog}
        onClose={() => setItemDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, rgba(28, 28, 28, 0.95) 0%, rgba(40, 40, 40, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 0, 0, 0.3)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#8B0000', fontWeight: 600 }}>
          ➕ Añadir Artículo al Inventario
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Información básica */}
            <Typography variant="h6" sx={{ color: '#8B0000', display: 'flex', alignItems: 'center', gap: 1 }}>
              <InventoryIcon /> Información Básica
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Nombre del Artículo *"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                InputProps={{ sx: { color: '#FFFFFF' } }}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
              />

              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Categoría *</InputLabel>
                <Select
                  value={itemForm.category}
                  onChange={(e) => setItemForm({ ...itemForm, category: e.target.value as any })}
                  sx={{ color: '#FFFFFF' }}
                >
                  <MenuItem value="instrument">Instrumento</MenuItem>
                  <MenuItem value="uniform">Uniforme</MenuItem>
                  <MenuItem value="accessory">Accesorio</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {itemForm.category === 'uniform' && (
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Tipo de Uniforme</InputLabel>
                <Select
                  value={itemForm.subcategory}
                  onChange={(e) => setItemForm({ ...itemForm, subcategory: e.target.value })}
                  sx={{ color: '#FFFFFF' }}
                >
                  <MenuItem value="gala">Gala</MenuItem>
                  <MenuItem value="beduino">Beduino</MenuItem>
                </Select>
              </FormControl>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Marca"
                value={itemForm.brand}
                onChange={(e) => setItemForm({ ...itemForm, brand: e.target.value })}
                InputProps={{ sx: { color: '#FFFFFF' } }}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
              />

              <TextField
                fullWidth
                label="Modelo"
                value={itemForm.model}
                onChange={(e) => setItemForm({ ...itemForm, model: e.target.value })}
                InputProps={{ sx: { color: '#FFFFFF' } }}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
              />

              <TextField
                fullWidth
                label="Número de Serie"
                value={itemForm.serialNumber}
                onChange={(e) => setItemForm({ ...itemForm, serialNumber: e.target.value })}
                InputProps={{ sx: { color: '#FFFFFF' } }}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
              />
            </Box>

            {/* Información de compra */}
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
            <Typography variant="h6" sx={{ color: '#8B0000', display: 'flex', alignItems: 'center', gap: 1 }}>
              💰 Información de Compra
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Fecha de Compra *"
                type="date"
                value={itemForm.purchaseDate}
                onChange={(e) => setItemForm({ ...itemForm, purchaseDate: e.target.value })}
                InputProps={{ sx: { color: '#FFFFFF' } }}
                InputLabelProps={{ 
                  sx: { color: 'rgba(255, 255, 255, 0.7)' },
                  shrink: true
                }}
              />

              <TextField
                fullWidth
                label="Precio de Compra (€) *"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                value={itemForm.purchasePrice}
                onChange={(e) => setItemForm({ ...itemForm, purchasePrice: parseFloat(e.target.value) || 0 })}
                InputProps={{ sx: { color: '#FFFFFF' } }}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
              />

              <TextField
                fullWidth
                label="Cantidad *"
                type="number"
                inputProps={{ min: 1, max: 100 }}
                value={itemForm.quantity}
                onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 1 })}
                InputProps={{ sx: { color: '#FFFFFF' } }}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
              />
            </Box>

            {/* Ubicación y estado */}
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
            <Typography variant="h6" sx={{ color: '#8B0000', display: 'flex', alignItems: 'center', gap: 1 }}>
              📍 Ubicación y Estado
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Ubicación *"
                value={itemForm.location}
                onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                InputProps={{ sx: { color: '#FFFFFF' } }}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                placeholder="Ej: Archivo Musical, Almacén de Uniformes"
              />

              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Estado/Condición</InputLabel>
                <Select
                  value={itemForm.condition}
                  onChange={(e) => setItemForm({ ...itemForm, condition: e.target.value as any })}
                  sx={{ color: '#FFFFFF' }}
                >
                  <MenuItem value="excellent">Excelente</MenuItem>
                  <MenuItem value="good">Bueno</MenuItem>
                  <MenuItem value="fair">Regular</MenuItem>
                  <MenuItem value="poor">Malo</MenuItem>
                  <MenuItem value="repair">Necesita Reparación</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              label="Notas adicionales"
              multiline
              rows={3}
              value={itemForm.notes}
              onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
              InputProps={{ sx: { color: '#FFFFFF' } }}
              InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
              placeholder="Observaciones, características especiales, historial de reparaciones..."
            />

            {itemForm.quantity > 1 && (
              <Alert severity="info">
                Se crearán {itemForm.quantity} artículos idénticos numerados consecutivamente.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveItem}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #8B0000 0%, #A00000 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #A00000 0%, #BB0000 100%)',
              },
            }}
          >
            Añadir al Inventario
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para asignaciones */}
      <Dialog
        open={assignDialog}
        onClose={() => setAssignDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, rgba(28, 28, 28, 0.95) 0%, rgba(40, 40, 40, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 0, 0, 0.3)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#8B0000', fontWeight: 600 }}>
          🎯 Asignar Artículo
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
                Asignar: <strong>{selectedItem.name}</strong>
              </Typography>
              
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
                Selecciona el componente al que deseas asignar este artículo:
              </Typography>

              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                {components.map((member) => (
                  <Card
                    key={member.id}
                    sx={{
                      mb: 1,
                      cursor: 'pointer',
                      background: 'rgba(139, 0, 0, 0.1)',
                      border: '1px solid rgba(139, 0, 0, 0.3)',
                      '&:hover': {
                        background: 'rgba(139, 0, 0, 0.2)',
                      },
                    }}
                    onClick={() => handleConfirmAssignment(member.id)}
                  >
                    <CardContent sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          backgroundColor: '#8B0000',
                          width: 40, 
                          height: 40 
                        }}>
                          {member.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                            {member.name} {member.surname}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Voz: {member.voice}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryManagerPage;

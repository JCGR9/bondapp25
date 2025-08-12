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
  Switch,
  FormControlLabel,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Save as SaveIcon,
  Star as StarIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  MusicNote as MusicNoteIcon,
  LocalPolice as LocalPoliceIcon,
  PhotoCamera as PhotoCameraIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Checkroom as CheckroomIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';


import voicesData from '../data/voices.json';
import instrumentsData from '../data/instruments.json';
import { useBondAppComponents, useBondAppInventory } from '../hooks/useBondAppStorage';

interface ComponentMember {
  id: string;
  name: string;
  surname: string;
  dni: string;
  phone: string;
  email: string;
  address: string;
  voice: string;
  instrument: string | null;
  uniform: string | null;
  isMinor: boolean;
  tutorName: string;
  stars: number;
  joinDate: string;
  photo: string | null;
  attendedPerformances: string[];
  missedPerformances: string[];
  assignedUniforms: {
    gala: string[];
    beduino: string[];
  };
  assignedInventory?: string[]; // IDs de items del inventario asignados
  performanceStats: {
    totalPerformances: number;
    attended: number;
    missed: number;
    attendanceRate: number;
  };
}

interface Voice {
  id: string;
  name: string;
  instrumentId: string;
  description: string;
}

interface Instrument {
  id: string;
  name: string;
  description: string;
}

// Interfaces para el inventario
interface InventoryItem {
  id: string;
  name: string;
  category: 'instrument' | 'uniform' | 'accessory';
  subcategory?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate: string;
  purchasePrice: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'repair';
  status: 'available' | 'assigned' | 'repair' | 'lost';
  assignedTo?: string;
  assignmentDate?: string;
  location: string;
  notes?: string;
  history: any[];
}

const ComponentsManagerPage: React.FC = () => {
  // Usar hooks sincronizados con Firebase
  const { data: components, setData: setComponents, loading: loadingComponents } = useBondAppComponents() as { data: ComponentMember[], setData: any, loading: boolean };
  const { data: inventory, setData: setInventory, loading: loadingInventory } = useBondAppInventory() as { data: InventoryItem[], setData: any, loading: boolean };
  const [voices] = useState<Voice[]>(voicesData as Voice[]);
  const [instruments] = useState<Instrument[]>(instrumentsData as Instrument[]);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Estados para ordenación
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Estados para gestión de inventario
  const [inventoryDialog, setInventoryDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ComponentMember | null>(null);
  const [availableInventory, setAvailableInventory] = useState<InventoryItem[]>([]);

  // Actualizar availableInventory cuando inventory cambie
  useEffect(() => {
    if (inventory && inventory.length > 0) {
      const available = inventory.filter((item: InventoryItem) => item.status === 'available');
      setAvailableInventory(available);
    }
  }, [inventory]);

  // Función para sincronizar estados entre inventario y componentes
  const syncInventoryComponentsState = () => {
    if (!inventory.length || !components.length) return;

    let hasChanges = false;
    const updatedInventory = [...inventory];
    const updatedComponents = [...components];

    // Verificar que los artículos asignados en inventario coincidan con los componentes
    updatedInventory.forEach((item, itemIndex) => {
      if (item.status === 'assigned' && item.assignedTo) {
        const component = components.find(comp => comp.id === item.assignedTo);
        if (component) {
          if (!component.assignedInventory?.includes(item.id)) {
            // El inventario dice que está asignado pero el componente no lo tiene
            updatedComponents.forEach((comp, compIndex) => {
              if (comp.id === item.assignedTo) {
                updatedComponents[compIndex] = {
                  ...comp,
                  assignedInventory: [...(comp.assignedInventory || []), item.id]
                };
                hasChanges = true;
              }
            });
          }
        } else {
          // El artículo está asignado a un componente que no existe
          updatedInventory[itemIndex] = {
            ...item,
            status: 'available' as const,
            assignedTo: undefined,
            assignmentDate: undefined
          };
          hasChanges = true;
        }
      }
    });

    // Verificar que los artículos asignados en componentes existan en inventario
    updatedComponents.forEach((comp, compIndex) => {
      if (comp.assignedInventory?.length) {
        const validInventoryIds = comp.assignedInventory.filter(itemId => {
          const item = inventory.find(inv => inv.id === itemId);
          return item && item.status === 'assigned' && item.assignedTo === comp.id;
        });
        
        if (validInventoryIds.length !== comp.assignedInventory.length) {
          updatedComponents[compIndex] = {
            ...comp,
            assignedInventory: validInventoryIds
          };
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setInventory(updatedInventory);
      setComponents(updatedComponents);
      // Ya no se usa localStorage, todo se sincroniza con Firebase
      console.log('Estados sincronizados entre inventario y componentes');
    }
  };

  // Ejecutar sincronización cuando cambien inventario o componentes
  useEffect(() => {
    if (inventory.length > 0 && components.length > 0) {
      syncInventoryComponentsState();
    }
  }, [inventory.length, components.length]);
  
  // Estados para diálogos
  const [componentDialog, setComponentDialog] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentMember | null>(null);
  
  // Estados para formularios
  const [componentForm, setComponentForm] = useState({
    id: '',
    name: '',
    surname: '',
    dni: '',
    phone: '',
    email: '',
    address: '',
    voice: '',
    instrument: null as string | null,
    uniform: null as string | null,
    isMinor: false,
    tutorName: '',
    stars: 0,
    joinDate: '',
    photo: null as string | null,
    attendedPerformances: [] as string[],
    missedPerformances: [] as string[],
    assignedUniforms: {
      gala: [] as string[],
      beduino: [] as string[],
    },
    assignedInventory: [] as string[],
    performanceStats: {
      totalPerformances: 0,
      attended: 0,
      missed: 0,
      attendanceRate: 0,
    },
  });

  const showSuccess = (message: string) => {
    setSuccess(message);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setSuccess('');
  };

  // Funciones para gestión de inventario
  const handleOpenInventoryDialog = (member: ComponentMember) => {
    setSelectedMember(member);
    setInventoryDialog(true);
  };

  const getAssignedInventoryItems = (member: ComponentMember): InventoryItem[] => {
    if (!member.assignedInventory || !inventory.length) return [];
    return inventory.filter(item => member.assignedInventory?.includes(item.id));
  };

  const handleAssignInventoryItem = (itemId: string) => {
    if (!selectedMember) return;

    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    // Actualizar el inventario - marcar como asignado
    const updatedInventory = inventory.map(invItem => {
      if (invItem.id === itemId) {
        return {
          ...invItem,
          status: 'assigned' as const,
          assignedTo: selectedMember.id,
          assignmentDate: new Date().toISOString(),
          history: [
            ...invItem.history,
            {
              id: `hist-${Date.now()}`,
              date: new Date().toISOString(),
              action: 'assigned',
              memberId: selectedMember.id,
              memberName: `${selectedMember.name} ${selectedMember.surname}`,
              userId: 'admin',
              notes: `Entregado desde inventario al componente`
            }
          ]
        };
      }
      return invItem;
    });

    setInventory(updatedInventory);

    // Actualizar el componente
    const updatedComponents = components.map(comp => {
      if (comp.id === selectedMember.id) {
        return {
          ...comp,
          assignedInventory: [...(comp.assignedInventory || []), itemId]
        };
      }
      return comp;
    });

    setComponents(updatedComponents);
    
    // Actualizar inventario disponible
    const available = updatedInventory.filter(item => item.status === 'available');
    setAvailableInventory(available);

    showSuccess(`${item.name} entregado a ${selectedMember.name} ${selectedMember.surname}`);
  };

  const handleUnassignInventoryItem = (itemId: string) => {
    if (!selectedMember) return;

    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    // Actualizar el inventario - el artículo vuelve a estar disponible
    const updatedInventory = inventory.map(invItem => {
      if (invItem.id === itemId) {
        return {
          ...invItem,
          status: 'available' as const,
          assignedTo: undefined,
          assignmentDate: undefined,
          history: [
            ...invItem.history,
            {
              id: `hist-${Date.now()}`,
              date: new Date().toISOString(),
              action: 'returned',
              memberId: selectedMember.id,
              memberName: `${selectedMember.name} ${selectedMember.surname}`,
              userId: 'admin',
              notes: `Devuelto por el componente al inventario`
            }
          ]
        };
      }
      return invItem;
    });

    setInventory(updatedInventory);

    // Actualizar el componente
    const updatedComponents = components.map(comp => {
      if (comp.id === selectedMember.id) {
        return {
          ...comp,
          assignedInventory: (comp.assignedInventory || []).filter(id => id !== itemId)
        };
      }
      return comp;
    });

    setComponents(updatedComponents);
    
    // Actualizar inventario disponible
    const available = updatedInventory.filter(item => item.status === 'available');
    setAvailableInventory(available);

    showSuccess(`${item.name} devuelto al inventario por ${selectedMember.name} ${selectedMember.surname}`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'instrument': return <MusicNoteIcon />;
      case 'uniform': return <CheckroomIcon />;
      case 'accessory': return <InventoryIcon />;
      default: return <InventoryIcon />;
    }
  };

  // Función para manejar la ordenación
  const handleSort = (column: string) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
  };

  // Función para obtener los componentes ordenados
  const getSortedComponents = () => {
    if (!sortColumn) return components;

    return [...components].sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortColumn) {
        case 'name':
          aValue = `${a.name} ${a.surname}`.toLowerCase();
          bValue = `${b.name} ${b.surname}`.toLowerCase();
          break;
        case 'voice':
          aValue = getVoiceName(a.voice).toLowerCase();
          bValue = getVoiceName(b.voice).toLowerCase();
          break;
        case 'attendance':
          aValue = a.performanceStats.attendanceRate;
          bValue = b.performanceStats.attendanceRate;
          break;
        case 'performances':
          aValue = a.performanceStats.totalPerformances;
          bValue = b.performanceStats.totalPerformances;
          break;
        case 'stars':
          aValue = a.stars;
          bValue = b.stars;
          break;
        case 'age':
          aValue = a.isMinor ? 0 : 1; // Menores primero en asc
          bValue = b.isMinor ? 0 : 1;
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
  };

  // Función para renderizar el icono de ordenación
  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' 
      ? <ArrowUpwardIcon sx={{ ml: 1, fontSize: 16 }} />
      : <ArrowDownwardIcon sx={{ ml: 1, fontSize: 16 }} />;
  };

  // Manejar componentes
  const handleCreateComponent = () => {
    setEditingComponent(null);
    setComponentForm({
      id: '',
      name: '',
      surname: '',
      dni: '',
      phone: '',
      email: '',
      address: '',
      voice: '',
      instrument: null,
      uniform: null,
      isMinor: false,
      tutorName: '',
      stars: 0,
      joinDate: new Date().toISOString().split('T')[0],
      photo: null,
      attendedPerformances: [],
      missedPerformances: [],
      assignedUniforms: {
        gala: [],
        beduino: [],
      },
      assignedInventory: [],
      performanceStats: {
        totalPerformances: 0,
        attended: 0,
        missed: 0,
        attendanceRate: 0,
      },
    });
    setComponentDialog(true);
  };

  const handleEditComponent = (component: ComponentMember) => {
    setEditingComponent(component);
    setComponentForm({
      id: component.id,
      name: component.name,
      surname: component.surname,
      dni: component.dni,
      phone: component.phone,
      email: component.email,
      address: component.address,
      voice: component.voice,
      instrument: component.instrument,
      uniform: component.uniform,
      isMinor: component.isMinor,
      tutorName: component.tutorName,
      stars: component.stars,
      joinDate: component.joinDate,
      photo: component.photo,
      attendedPerformances: component.attendedPerformances,
      missedPerformances: component.missedPerformances,
      assignedUniforms: component.assignedUniforms,
      assignedInventory: component.assignedInventory || [],
      performanceStats: component.performanceStats,
    });
    setComponentDialog(true);
  };

  const handleSaveComponent = () => {
    try {
      if (!componentForm.name.trim() || !componentForm.surname.trim()) {
        showError('El nombre y apellidos son obligatorios');
        return;
      }

      if (!componentForm.dni.trim() || !componentForm.phone.trim() || !componentForm.email.trim()) {
        showError('DNI, teléfono y email son obligatorios');
        return;
      }

      if (!componentForm.voice) {
        showError('Debe asignar una voz al componente');
        return;
      }

      if (componentForm.isMinor && !componentForm.tutorName.trim()) {
        showError('Debe especificar el tutor para menores de edad');
        return;
      }

      const id = componentForm.id || `comp_${Date.now()}`;
      const newComponent = { ...componentForm, id };

      if (editingComponent) {
        // Verificar DNI único (excepto el actual)
        if (components.some(c => c.dni === componentForm.dni && c.id !== editingComponent.id)) {
          showError('Ya existe un componente con ese DNI');
          return;
        }

        const index = components.findIndex(c => c.id === editingComponent.id);
        const updated = [...components];
        updated[index] = newComponent;
        setComponents(updated);
        showSuccess('Componente actualizado correctamente');
      } else {
        // Verificar DNI único
        if (components.some(c => c.dni === componentForm.dni)) {
          showError('Ya existe un componente con ese DNI');
          return;
        }

        setComponents([...components, newComponent]);
        showSuccess('Componente creado correctamente');
      }
      setComponentDialog(false);
    } catch (err) {
      showError('Error al guardar componente');
    }
  };

  const handleDeleteComponent = (component: ComponentMember) => {
    if (window.confirm(`¿Estás seguro de eliminar al componente "${component.name} ${component.surname}"?`)) {
      setComponents(components.filter(c => c.id !== component.id));
      showSuccess('Componente eliminado correctamente');
    }
  };

  const getVoiceName = (voiceId: string) => {
    const voice = voices.find(v => v.id === voiceId);
    return voice ? voice.name : voiceId;
  };


  const getStarsDisplay = (stars: number) => {
    return Array.from({ length: stars }, (_, i) => (
      <StarIcon key={i} sx={{ color: '#FFD700', fontSize: 16 }} />
    ));
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#8B0000', '#FF6B35', '#F7931E', '#FFD23F', '#06D6A0', '#118AB2', '#073B4C'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const exportData = () => {
    const data = {
      components,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'components-data.json';
    a.click();
    URL.revokeObjectURL(url);
    showSuccess('Datos exportados correctamente');
  };

  const getYearsInBand = (joinDate: string) => {
    const join = new Date(joinDate);
    const now = new Date();
    const years = now.getFullYear() - join.getFullYear();
    return years;
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoDataUrl = e.target?.result as string;
        setComponentForm({ ...componentForm, photo: photoDataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const getUniformCompletion = (component: ComponentMember) => {
    const galaTotal = 7; // Total prendas de gala
    const beduinoTotal = 4; // Total prendas beduino
    const galaAssigned = component.assignedUniforms.gala.length;
    const beduinoAssigned = component.assignedUniforms.beduino.length;
    
    return {
      gala: {
        assigned: galaAssigned,
        total: galaTotal,
        percentage: Math.round((galaAssigned / galaTotal) * 100)
      },
      beduino: {
        assigned: beduinoAssigned,
        total: beduinoTotal,
        percentage: Math.round((beduinoAssigned / beduinoTotal) * 100)
      }
    };
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PeopleIcon sx={{ color: '#8B0000', fontSize: 32, mr: 2 }} />
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
            Gestión de Componentes
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateComponent}
            sx={{
              background: 'linear-gradient(135deg, #8B0000 0%, #A00000 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #A00000 0%, #BB0000 100%)',
              },
            }}
          >
            Nuevo Componente
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={exportData}
            sx={{
              borderColor: '#8B0000',
              color: '#8B0000',
              '&:hover': {
                borderColor: '#A00000',
                backgroundColor: 'rgba(139, 0, 0, 0.1)',
              },
            }}
          >
            Exportar Datos
          </Button>
        </Box>
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

      {/* Información */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Sistema de estrellas:</strong> Se otorga una estrella por cada 5 años de pertenencia a la banda.<br/>
          <strong>Menores de edad:</strong> Requieren especificar el nombre del tutor legal.<br/>
          <strong>Total de componentes:</strong> {components.length}
        </Typography>
      </Alert>

      {/* Tabla de componentes */}
      <Paper
        elevation={8}
        sx={{
          background: 'linear-gradient(145deg, rgba(28, 28, 28, 0.9) 0%, rgba(35, 35, 35, 0.85) 100%)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(139, 0, 0, 0.15)',
          borderRadius: 3,
          p: 3,
        }}
      >
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
                    Componente
                    {renderSortIcon('name')}
                  </Box>
                </TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Contacto</TableCell>
                <TableCell 
                  sx={{ 
                    color: '#FFFFFF', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(139, 0, 0, 0.1)' }
                  }}
                  onClick={() => handleSort('voice')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Voz
                    {renderSortIcon('voice')}
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ 
                    color: '#FFFFFF', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(139, 0, 0, 0.1)' }
                  }}
                  onClick={() => handleSort('attendance')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Estadísticas
                    {renderSortIcon('attendance')}
                  </Box>
                </TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Uniformidad</TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Inventario</TableCell>
                <TableCell 
                  sx={{ 
                    color: '#FFFFFF', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'rgba(139, 0, 0, 0.1)' }
                  }}
                  onClick={() => handleSort('age')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Estado
                    {renderSortIcon('age')}
                  </Box>
                </TableCell>
                <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getSortedComponents().map((component) => (
                <TableRow key={component.id} sx={{ '&:hover': { backgroundColor: 'rgba(139, 0, 0, 0.05)' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={component.photo || undefined}
                        sx={{
                          backgroundColor: component.photo ? 'transparent' : getAvatarColor(component.name),
                          width: 40,
                          height: 40,
                        }}
                      >
                        {!component.photo && `${component.name.charAt(0)}${component.surname.split(' ')[0]?.charAt(0)}`}
                      </Avatar>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                            {component.name} {component.surname}
                          </Typography>
                          {getStarsDisplay(component.stars)}
                        </Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          DNI: {component.dni} • {getYearsInBand(component.joinDate)} años en la banda
                        </Typography>
                        {component.tutorName && (
                          <Typography variant="caption" sx={{ color: '#FFD700', display: 'block' }}>
                            Tutor: {component.tutorName}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <PhoneIcon sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Typography variant="caption" sx={{ color: '#FFFFFF' }}>
                          {component.phone}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <EmailIcon sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Typography variant="caption" sx={{ color: '#FFFFFF' }}>
                          {component.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HomeIcon sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.7)' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {component.address}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getVoiceName(component.voice)}
                      size="small"
                      sx={{
                        backgroundColor: '#8B0000',
                        color: '#FFFFFF',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                          Asistencia: {component.performanceStats.attendanceRate}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <CheckCircleIcon sx={{ fontSize: 14, color: '#4CAF50' }} />
                        <Typography variant="caption" sx={{ color: '#4CAF50' }}>
                          {component.performanceStats.attended} asistidas
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CancelIcon sx={{ fontSize: 14, color: '#F44336' }} />
                        <Typography variant="caption" sx={{ color: '#F44336' }}>
                          {component.performanceStats.missed} faltas
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        {getStarsDisplay(component.stars)}
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', ml: 1 }}>
                          ({component.stars} estrellas)
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <CheckroomIcon sx={{ fontSize: 14, color: '#1a237e' }} />
                        <Typography variant="caption" sx={{ color: '#1a237e', fontWeight: 600 }}>
                          Gala: {getUniformCompletion(component).gala.assigned}/{getUniformCompletion(component).gala.total}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          ({getUniformCompletion(component).gala.percentage}%)
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckroomIcon sx={{ fontSize: 14, color: '#d32f2f' }} />
                        <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 600 }}>
                          Beduino: {getUniformCompletion(component).beduino.assigned}/{getUniformCompletion(component).beduino.total}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          ({getUniformCompletion(component).beduino.percentage}%)
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {getAssignedInventoryItems(component).length > 0 ? (
                        <>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" sx={{ color: '#8B0000', fontWeight: 600 }}>
                              📦 {getAssignedInventoryItems(component).length} artículo(s)
                            </Typography>
                          </Box>
                          {getAssignedInventoryItems(component).slice(0, 2).map((item) => (
                            <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              {getCategoryIcon(item.category)}
                              <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                                {item.name}
                              </Typography>
                            </Box>
                          ))}
                          {getAssignedInventoryItems(component).length > 2 && (
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              +{getAssignedInventoryItems(component).length - 2} más
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          📭 Sin artículos asignados
                        </Typography>
                      )}
                      <Box sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          startIcon={<AssignmentIcon />}
                          onClick={() => handleOpenInventoryDialog(component)}
                          variant={getAssignedInventoryItems(component).length > 0 ? "contained" : "outlined"}
                          sx={{
                            color: getAssignedInventoryItems(component).length > 0 ? '#FFFFFF' : '#8B0000',
                            backgroundColor: getAssignedInventoryItems(component).length > 0 ? '#8B0000' : 'transparent',
                            borderColor: '#8B0000',
                            fontSize: '0.7rem',
                            minWidth: 'auto',
                            padding: '2px 6px',
                            '&:hover': {
                              backgroundColor: getAssignedInventoryItems(component).length > 0 ? '#A00000' : 'rgba(139, 0, 0, 0.1)',
                            },
                          }}
                        >
                          {getAssignedInventoryItems(component).length > 0 ? 'Gestionar' : 'Asignar'}
                        </Button>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {component.isMinor ? (
                      <Chip label="Menor de edad" size="small" color="warning" />
                    ) : (
                      <Chip label="Mayor de edad" size="small" color="success" />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEditComponent(component)}
                      sx={{ color: '#8B0000', mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteComponent(component)}
                      sx={{ color: '#FF5722' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Diálogo para Componentes */}
      <Dialog
        open={componentDialog}
        onClose={() => setComponentDialog(false)}
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
          {editingComponent ? 'Editar Componente' : 'Nuevo Componente'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Datos personales */}
            <Typography variant="h6" sx={{ color: '#8B0000', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon /> Datos Personales
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={componentForm.name}
                onChange={(e) => setComponentForm({ ...componentForm, name: e.target.value })}
                InputProps={{ sx: { color: '#FFFFFF' } }}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
              />

              <TextField
                fullWidth
                label="Apellidos"
                value={componentForm.surname}
                onChange={(e) => setComponentForm({ ...componentForm, surname: e.target.value })}
                InputProps={{ sx: { color: '#FFFFFF' } }}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="DNI"
                value={componentForm.dni}
                onChange={(e) => setComponentForm({ ...componentForm, dni: e.target.value })}
                InputProps={{ sx: { color: '#FFFFFF' } }}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
              />

              <TextField
                fullWidth
                label="Teléfono"
                value={componentForm.phone}
                onChange={(e) => setComponentForm({ ...componentForm, phone: e.target.value })}
                InputProps={{ sx: { color: '#FFFFFF' } }}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={componentForm.email}
                onChange={(e) => setComponentForm({ ...componentForm, email: e.target.value })}
                InputProps={{ sx: { color: '#FFFFFF' } }}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
              />
            </Box>

            <TextField
              fullWidth
              label="Domicilio"
              value={componentForm.address}
              onChange={(e) => setComponentForm({ ...componentForm, address: e.target.value })}
              InputProps={{ sx: { color: '#FFFFFF' } }}
              InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
            />

            {/* Campo de foto */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
                onChange={handlePhotoUpload}
              />
              <label htmlFor="photo-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCameraIcon />}
                  sx={{
                    borderColor: '#8B0000',
                    color: '#8B0000',
                    '&:hover': {
                      borderColor: '#A00000',
                      backgroundColor: 'rgba(139, 0, 0, 0.1)',
                    },
                  }}
                >
                  Subir Foto
                </Button>
              </label>
              {componentForm.photo && (
                <Avatar
                  src={componentForm.photo}
                  sx={{ width: 50, height: 50 }}
                />
              )}
            </Box>

            {/* Datos musicales */}
            <Typography variant="h6" sx={{ color: '#8B0000', mb: 1, mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MusicNoteIcon /> Datos Musicales
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Voz</InputLabel>
                <Select
                  value={componentForm.voice}
                  onChange={(e) => setComponentForm({ ...componentForm, voice: e.target.value })}
                  sx={{ color: '#FFFFFF' }}
                >
                  {voices.map((voice) => (
                    <MenuItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Instrumento (Opcional)</InputLabel>
                <Select
                  value={componentForm.instrument || ''}
                  onChange={(e) => setComponentForm({ ...componentForm, instrument: e.target.value || null })}
                  sx={{ color: '#FFFFFF' }}
                >
                  <MenuItem value="">No asignado</MenuItem>
                  {instruments.map((instrument) => (
                    <MenuItem key={instrument.id} value={instrument.id}>
                      {instrument.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Otros datos */}
            <Typography variant="h6" sx={{ color: '#8B0000', mb: 1, mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalPoliceIcon /> Otros Datos
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Fecha de Ingreso"
                type="date"
                value={componentForm.joinDate}
                onChange={(e) => setComponentForm({ ...componentForm, joinDate: e.target.value })}
                InputProps={{ sx: { color: '#FFFFFF' } }}
                InputLabelProps={{ 
                  sx: { color: 'rgba(255, 255, 255, 0.7)' },
                  shrink: true
                }}
              />

              <TextField
                fullWidth
                label="Número de Estrellas"
                type="number"
                inputProps={{ min: 0, max: 10 }}
                value={componentForm.stars}
                onChange={(e) => setComponentForm({ ...componentForm, stars: parseInt(e.target.value) || 0 })}
                InputProps={{ sx: { color: '#FFFFFF' } }}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={componentForm.isMinor}
                  onChange={(e) => setComponentForm({ ...componentForm, isMinor: e.target.checked })}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#8B0000',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#8B0000',
                    },
                  }}
                />
              }
              label="Menor de edad"
              sx={{ color: '#FFFFFF' }}
            />

            {componentForm.isMinor && (
              <TextField
                fullWidth
                label="Nombre del Tutor"
                value={componentForm.tutorName}
                onChange={(e) => setComponentForm({ ...componentForm, tutorName: e.target.value })}
                InputProps={{ sx: { color: '#FFFFFF' } }}
                InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComponentDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveComponent}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #8B0000 0%, #A00000 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #A00000 0%, #BB0000 100%)',
              },
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para gestión de inventario */}
      <Dialog
        open={inventoryDialog}
        onClose={() => setInventoryDialog(false)}
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
          📦 Gestión de Inventario - {selectedMember?.name} {selectedMember?.surname}
        </DialogTitle>
        <DialogContent>
          {selectedMember && (
            <Box sx={{ mt: 2 }}>
              {/* Resumen de estado */}
              <Paper sx={{ 
                p: 2, 
                mb: 3, 
                background: 'rgba(139, 0, 0, 0.05)', 
                border: '1px solid rgba(139, 0, 0, 0.2)' 
              }}>
                <Typography variant="body2" sx={{ color: '#FFFFFF', mb: 1 }}>
                  <strong>📋 Estado del Componente:</strong>
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      📦 Artículos asignados: <strong>{getAssignedInventoryItems(selectedMember).length}</strong>
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      ✅ Disponibles para asignar: <strong>{availableInventory.length}</strong>
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Inventario asignado actualmente */}
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 1 }}>
                🎯 Artículos Asignados
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                🔄 El componente puede devolver estos artículos al inventario
              </Typography>
              
              {getAssignedInventoryItems(selectedMember).length > 0 ? (
                <Box sx={{ mb: 3, maxHeight: 200, overflow: 'auto' }}>
                  {getAssignedInventoryItems(selectedMember).map((item) => (
                    <Paper
                      key={item.id}
                      sx={{
                        p: 2,
                        mb: 1,
                        background: 'rgba(139, 0, 0, 0.1)',
                        border: '1px solid rgba(139, 0, 0, 0.3)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ backgroundColor: '#8B0000', width: 32, height: 32 }}>
                            {getCategoryIcon(item.category)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              {item.brand && item.model ? `${item.brand} ${item.model}` : item.category}
                            </Typography>
                            {item.assignmentDate && (
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block' }}>
                                📅 Asignado: {new Date(item.assignmentDate).toLocaleDateString('es-ES')}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Button
                          size="small"
                          startIcon={<RemoveIcon />}
                          onClick={() => handleUnassignInventoryItem(item.id)}
                          sx={{
                            color: '#FF5722',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 87, 34, 0.1)',
                            },
                          }}
                        >
                          Devolver
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3, mb: 3 }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    No tiene artículos asignados actualmente
                  </Typography>
                </Box>
              )}

              {/* Inventario disponible para asignar */}
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 1 }}>
                ➕ Artículos Disponibles
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                📋 Selecciona un artículo para entregarlo al componente
              </Typography>
              
              {availableInventory.length > 0 ? (
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {availableInventory.map((item) => (
                    <Paper
                      key={item.id}
                      sx={{
                        p: 2,
                        mb: 1,
                        background: 'rgba(76, 175, 80, 0.1)',
                        border: '1px solid rgba(76, 175, 80, 0.3)',
                        cursor: 'pointer',
                        '&:hover': {
                          background: 'rgba(76, 175, 80, 0.2)',
                        },
                      }}
                      onClick={() => handleAssignInventoryItem(item.id)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ backgroundColor: '#4CAF50', width: 32, height: 32 }}>
                            {getCategoryIcon(item.category)}
                          </Avatar>
                          <Box>
                            <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              {item.brand && item.model ? `${item.brand} ${item.model}` : item.category} - {item.location}
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          size="small"
                          startIcon={<AssignmentIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignInventoryItem(item.id);
                          }}
                          sx={{
                            color: '#4CAF50',
                            '&:hover': {
                              backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            },
                          }}
                        >
                          Asignar
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    No hay artículos disponibles para asignar
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInventoryDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComponentsManagerPage;

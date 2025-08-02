import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Divider,
  List,
  Stack,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  DirectionsBus as BusIcon,
  DirectionsCar as CarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GetApp as GetAppIcon,
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

// Importar datos reales de las bases de datos
import componentsData from '../data/components.json';
import voicesData from '../data/voices.json';

// Interfaces
interface Performance {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  meetingTime: string;
  meetingPlace: string;
  expenses: Expense[];
  income: Income[];
  attendance: AttendanceRecord[];
  transport: Transport;
  contracts?: ContractFile[];
}

interface Expense {
  id: string;
  concept: string;
  amount: number;
  responsible: string;
}

interface Income {
  id: string;
  concept: string;
  amount: number;
  source: string;
}

interface ContractFile {
  id: string;
  name: string;
  fileUrl: string;
  uploadDate: string;
  description?: string;
}

interface AttendanceRecord {
  memberId: string;
  status: 'confirmed' | 'absent' | 'pending';
  absenceReason?: string;
  transportAssignment?: string;
}

interface Transport {
  buses: Bus[];
  privateCars: PrivateCar[];
}

interface Bus {
  id: string;
  capacity: 55 | 70;
  description: string; // Cambio: descripción en vez de conductor
  passengers: string[];
}

interface PrivateCar {
  id: string;
  owner: string;
  conductor: string; // Añadido: conductor para coches particulares
  capacity: number;
  passengers: string[];
}

interface Component {
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

const PerformancesManagerPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [voices] = useState<Voice[]>(voicesData as Voice[]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Estados para el formulario de nueva actuación
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    venue: '',
    organizer: '',
    meetingTime: '',
    meetingPlace: '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados para selección de componentes en coches particulares
  const [carMembersDialog, setCarMembersDialog] = useState(false);
  const [pendingCarData, setPendingCarData] = useState<{
    owner: string;
    conductor: string;
    capacity: number;
  } | null>(null);
  const [selectedCarMembers, setSelectedCarMembers] = useState<string[]>([]);

  // Cargar datos al inicializar
  useEffect(() => {
    loadPerformances();
    loadComponents();
  }, []);

  // Auto-guardar performances cuando cambien (pero solo después de la carga inicial)
  useEffect(() => {
    // Solo guardamos si tenemos datos y no estamos en la carga inicial
    if (performances.length > 0) {
      // Añadimos un pequeño delay para evitar conflictos con la carga inicial
      const timeoutId = setTimeout(() => {
        savePerformancesToStorage(performances);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [performances]);

  // Auto-guardar componentes cuando cambien (pero solo después de la carga inicial)
  useEffect(() => {
    if (components.length > 0) {
      // Añadimos un pequeño delay para evitar conflictos con la carga inicial
      const timeoutId = setTimeout(() => {
        saveComponentsToStorage(components);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [components]);

  const loadPerformances = () => {
    try {
      // Intentar cargar desde localStorage primero
      const savedPerformances = localStorage.getItem('bondapp-performances');
      if (savedPerformances) {
        const parsedData = JSON.parse(savedPerformances);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setPerformances(parsedData);
          console.log('Actuaciones cargadas desde localStorage:', parsedData.length, 'actuaciones');
          return;
        }
      }

      // Solo cargar datos de ejemplo si NO HAY datos guardados
      console.log('No hay datos guardados, cargando datos de ejemplo...');
      const defaultData = [
        {
          id: '1',
          title: 'Concierto de Navidad',
          date: '2024-12-24',
          time: '20:00',
          venue: 'Teatro Principal',
          organizer: 'Ayuntamiento',
          meetingTime: '18:30',
          meetingPlace: 'Plaza Mayor',
          expenses: [
            { id: '1', concept: 'Transporte', amount: 500, responsible: 'Director' },
            { id: '2', concept: 'Comida', amount: 300, responsible: 'Tesorero' }
          ],
          income: [
            { id: '1', concept: 'Actuación', amount: 2000, source: 'Ayuntamiento' }
          ],
          attendance: [
            { memberId: '1', status: 'confirmed' as const, transportAssignment: 'bus-1' },
            { memberId: '2', status: 'absent' as const, absenceReason: 'Enfermedad' }
          ],
          transport: {
            buses: [
              { id: 'bus-1', capacity: 55 as const, description: 'Autobús principal - Salida Plaza Mayor', passengers: ['1', '3', '4'] }
            ],
            privateCars: [
              { id: 'car-1', owner: 'María García', conductor: 'María García', capacity: 4, passengers: ['5'] }
            ]
          },
          contracts: []
        },
        {
          id: '2',
          title: 'Procesión Semana Santa',
          date: '2024-03-29',
          time: '10:00',
          venue: 'Catedral',
          organizer: 'Hermandad',
          meetingTime: '09:30',
          meetingPlace: 'Iglesia San Juan',
          expenses: [],
          income: [
            { id: '1', concept: 'Donativo', amount: 800, source: 'Hermandad' }
          ],
          attendance: [],
          transport: {
            buses: [
              { id: 'bus-2', capacity: 70 as const, description: 'Autobús grande - Recorrido procesional', passengers: [] }
            ],
            privateCars: []
          },
          contracts: []
        }
      ];
      
      setPerformances(defaultData);
      // Guardar los datos de ejemplo en localStorage SOLO si no había datos previos
      localStorage.setItem('bondapp-performances', JSON.stringify(defaultData));
      console.log('Datos de ejemplo cargados y guardados:', defaultData.length, 'actuaciones');
    } catch (error) {
      console.error('Error al cargar actuaciones:', error);
      // En caso de error, al menos intentar cargar un array vacío
      setPerformances([]);
    }
  };

  // Función helper para guardar en localStorage de forma segura
  const savePerformancesToStorage = (performancesData: Performance[]) => {
    try {
      // Solo guardar si realmente tenemos datos válidos
      if (Array.isArray(performancesData) && performancesData.length >= 0) {
        localStorage.setItem('bondapp-performances', JSON.stringify(performancesData));
        console.log('Actuaciones guardadas en localStorage:', performancesData.length, 'actuaciones');
      }
    } catch (error) {
      console.error('Error al guardar actuaciones en localStorage:', error);
    }
  };

  // Función helper para guardar componentes en localStorage de forma segura
  const saveComponentsToStorage = (componentsData: Component[]) => {
    try {
      if (Array.isArray(componentsData) && componentsData.length >= 0) {
        localStorage.setItem('bondapp-components', JSON.stringify(componentsData));
        console.log('Componentes actualizados en localStorage:', componentsData.length, 'componentes');
      }
    } catch (error) {
      console.error('Error al guardar componentes en localStorage:', error);
    }
  };

  // Función de debugging para verificar datos (puedes llamarla desde la consola del navegador)
  const debugStorage = () => {
    console.log('=== ESTADO DEL STORAGE ===');
    const performances = localStorage.getItem('bondapp-performances');
    const components = localStorage.getItem('bondapp-components');
    
    console.log('Actuaciones en localStorage:', performances ? JSON.parse(performances).length : 'No hay datos');
    console.log('Componentes en localStorage:', components ? JSON.parse(components).length : 'No hay datos');
    
    if (performances) {
      console.log('Detalle actuaciones:', JSON.parse(performances));
    }
    
    return {
      performances: performances ? JSON.parse(performances) : null,
      components: components ? JSON.parse(components) : null
    };
  };

  // Exponer la función de debug globalmente para poder usarla desde la consola
  (window as any).debugBondAppStorage = debugStorage;

  // Funciones para sincronización con contratos
  const syncContractToContractsModule = (performance: Performance, contractFile: ContractFile) => {
    try {
      // Obtener contratos existentes
      const existingContracts = localStorage.getItem('bondapp-contracts');
      const contracts = existingContracts ? JSON.parse(existingContracts) : [];

      // Calcular el importe total de la actuación
      const totalAmount = performance.income.reduce((total, income) => total + income.amount, 0);

      // Crear el contrato con el formato estándar correcto
      const newContract = {
        id: `perf-${performance.id}-${contractFile.id}`,
        name: `${performance.title} - ${performance.venue} - ${format(new Date(performance.date), 'dd/MM/yyyy')}`,
        client: performance.organizer || 'No especificado',
        venue: performance.venue,
        eventDate: performance.date,
        contractDate: new Date().toISOString().split('T')[0],
        amount: totalAmount, // Como número, no string
        status: 'signed' as const,
        paymentStatus: 'pending' as const, // Por defecto pendiente de cobro
        description: `Contrato generado automáticamente desde la actuación: ${performance.title}`,
        files: [{
          id: contractFile.id,
          name: contractFile.name,
          type: contractFile.name.split('.').pop()?.toLowerCase() || 'unknown',
          size: 0, // No podemos obtener el tamaño desde el objectURL
          dataUrl: contractFile.fileUrl, // Usar la URL del archivo
          uploadDate: contractFile.uploadDate
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sourcePerformanceId: performance.id // Para mantener la referencia
      };

      // Verificar si ya existe un contrato para esta actuación y archivo
      const existingIndex = contracts.findIndex((c: any) => c.id === newContract.id);
      
      if (existingIndex >= 0) {
        // Actualizar contrato existente
        contracts[existingIndex] = { ...contracts[existingIndex], ...newContract };
      } else {
        // Añadir nuevo contrato
        contracts.push(newContract);
      }

      // Guardar en localStorage
      localStorage.setItem('bondapp-contracts', JSON.stringify(contracts));
      console.log('Contrato sincronizado al módulo de contratos:', newContract.name);
    } catch (error) {
      console.error('Error al sincronizar contrato:', error);
    }
  };

  const removeContractFromContractsModule = (performanceId: string, contractId: string) => {
    try {
      const existingContracts = localStorage.getItem('bondapp-contracts');
      if (!existingContracts) return;

      const contracts = JSON.parse(existingContracts);
      const contractIdToRemove = `perf-${performanceId}-${contractId}`;
      
      const filteredContracts = contracts.filter((c: any) => c.id !== contractIdToRemove);
      localStorage.setItem('bondapp-contracts', JSON.stringify(filteredContracts));
      
      console.log('Contrato eliminado del módulo de contratos:', contractIdToRemove);
    } catch (error) {
      console.error('Error al eliminar contrato del módulo de contratos:', error);
    }
  };

  // Función para actualizar los datos de asistencia del componente
  const updateComponentAttendanceData = (memberId: string, performanceId: string, status: 'confirmed' | 'absent' | 'pending') => {
    const updatedComponents = components.map(component => {
      if (component.id === memberId) {
        let updatedAttendedPerformances = [...component.attendedPerformances];
        let updatedMissedPerformances = [...component.missedPerformances];

        // Remover la actuación de ambas listas primero
        updatedAttendedPerformances = updatedAttendedPerformances.filter(id => id !== performanceId);
        updatedMissedPerformances = updatedMissedPerformances.filter(id => id !== performanceId);

        // Añadir a la lista correspondiente según el estado
        if (status === 'confirmed') {
          updatedAttendedPerformances.push(performanceId);
        } else if (status === 'absent') {
          updatedMissedPerformances.push(performanceId);
        }
        // Si es 'pending', no se añade a ninguna lista

        // Actualizar estadísticas
        const totalPerformances = updatedAttendedPerformances.length + updatedMissedPerformances.length;
        const attendanceRate = totalPerformances > 0 ? (updatedAttendedPerformances.length / totalPerformances) * 100 : 0;

        return {
          ...component,
          attendedPerformances: updatedAttendedPerformances,
          missedPerformances: updatedMissedPerformances,
          performanceStats: {
            totalPerformances,
            attended: updatedAttendedPerformances.length,
            missed: updatedMissedPerformances.length,
            attendanceRate: Math.round(attendanceRate * 100) / 100
          }
        };
      }
      return component;
    });

    setComponents(updatedComponents);
    return updatedComponents;
  };

  const loadComponents = () => {
    try {
      // Intentar cargar desde localStorage primero (datos actualizados)
      const savedComponents = localStorage.getItem('bondapp-components');
      if (savedComponents) {
        const parsedData = JSON.parse(savedComponents);
        setComponents(parsedData);
        console.log('Componentes cargados desde localStorage (actualizados):', parsedData);
        return;
      }

      // Si no hay datos guardados, cargar componentes reales desde la base de datos
      const data = componentsData as Component[];
      setComponents(data);
      console.log('Componentes reales cargados desde base de datos:', data);
    } catch (error) {
      console.error('Error al cargar componentes:', error);
    }
  };

  // Funciones del calendario
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getPerformancesForDate = (date: Date) => {
    return performances.filter(perf => 
      isSameDay(new Date(perf.date), date)
    );
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dayPerformances = getPerformancesForDate(date);
    if (dayPerformances.length > 0) {
      setSelectedPerformance(dayPerformances[0]);
      setIsEditing(false);
      setDialogOpen(true);
    } else {
      // Si no hay actuaciones en esa fecha, abrir formulario para crear nueva
      setSelectedPerformance(null);
      setIsEditing(true);
      setFormData({
        title: '',
        date: format(date, 'yyyy-MM-dd'),
        time: '',
        venue: '',
        organizer: '',
        meetingTime: '',
        meetingPlace: '',
      });
      setDialogOpen(true);
    }
  };

  const handleAddPerformance = () => {
    setSelectedPerformance(null);
    setIsEditing(true);
    setFormData({
      title: '',
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      time: '',
      venue: '',
      organizer: '',
      meetingTime: '',
      meetingPlace: '',
    });
    setDialogOpen(true);
  };

  const handleSavePerformance = () => {
    if (!formData.title || !formData.date || !formData.time || !formData.venue) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    const newPerformance: Performance = {
      id: Date.now().toString(),
      title: formData.title,
      date: formData.date,
      time: formData.time,
      venue: formData.venue,
      organizer: formData.organizer,
      meetingTime: formData.meetingTime,
      meetingPlace: formData.meetingPlace,
      expenses: [],
      income: [],
      attendance: [],
      transport: {
        buses: [],
        privateCars: []
      },
      contracts: []
    };

    const updatedPerformances = [...performances, newPerformance];
    setPerformances(updatedPerformances);
    setDialogOpen(false);
    setFormData({
      title: '',
      date: '',
      time: '',
      venue: '',
      organizer: '',
      meetingTime: '',
      meetingPlace: '',
    });
  };

  const handleEditPerformance = () => {
    if (!selectedPerformance) return;
    
    setIsEditing(true);
    setFormData({
      title: selectedPerformance.title,
      date: selectedPerformance.date,
      time: selectedPerformance.time,
      venue: selectedPerformance.venue,
      organizer: selectedPerformance.organizer,
      meetingTime: selectedPerformance.meetingTime,
      meetingPlace: selectedPerformance.meetingPlace,
    });
  };

  const handleUpdatePerformance = () => {
    if (!selectedPerformance || !formData.title || !formData.date || !formData.time || !formData.venue) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    const updatedPerformances = performances.map(perf => 
      perf.id === selectedPerformance.id 
        ? {
            ...perf,
            title: formData.title,
            date: formData.date,
            time: formData.time,
            venue: formData.venue,
            organizer: formData.organizer,
            meetingTime: formData.meetingTime,
            meetingPlace: formData.meetingPlace,
          }
        : perf
    );

    setPerformances(updatedPerformances);
    setSelectedPerformance({
      ...selectedPerformance,
      title: formData.title,
      date: formData.date,
      time: formData.time,
      venue: formData.venue,
      organizer: formData.organizer,
      meetingTime: formData.meetingTime,
      meetingPlace: formData.meetingPlace,
    });
    setIsEditing(false);
  };

  const handleDeletePerformance = () => {
    if (!selectedPerformance) return;
    
    if (window.confirm('¿Estás seguro de que quieres eliminar esta actuación?')) {
      const updatedPerformances = performances.filter(perf => perf.id !== selectedPerformance.id);
      setPerformances(updatedPerformances);
      savePerformancesToStorage(updatedPerformances);
      savePerformancesToStorage(updatedPerformances);
      setDialogOpen(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setIsEditing(false);
    setSelectedPerformance(null);
    setFormData({
      title: '',
      date: '',
      time: '',
      venue: '',
      organizer: '',
      meetingTime: '',
      meetingPlace: '',
    });
  };

  // Funciones para gestionar asistencia
  const handleToggleAttendance = (memberId: string, status: 'confirmed' | 'absent' | 'pending', reason?: string) => {
    if (!selectedPerformance) return;

    const updatedAttendance = [...selectedPerformance.attendance];
    const existingIndex = updatedAttendance.findIndex(a => a.memberId === memberId);

    if (status === 'pending') {
      // Si se marca como pendiente, eliminamos el registro de asistencia y del transporte
      if (existingIndex >= 0) {
        const currentRecord = updatedAttendance[existingIndex];
        // Remover del transporte si estaba asignado
        if (currentRecord.transportAssignment) {
          removeFromTransport(memberId, currentRecord.transportAssignment);
        }
        updatedAttendance.splice(existingIndex, 1);
      }
    } else if (status === 'confirmed') {
      // Al confirmar, asignar automáticamente a un autobús disponible
      const availableBus = findAvailableBus();
      const transportAssignment = availableBus ? availableBus.id : undefined;
      
      if (existingIndex >= 0) {
        updatedAttendance[existingIndex] = {
          ...updatedAttendance[existingIndex],
          status: 'confirmed',
          absenceReason: undefined,
          transportAssignment
        };
      } else {
        updatedAttendance.push({
          memberId,
          status: 'confirmed',
          transportAssignment
        });
      }
    } else if (status === 'absent') {
      if (existingIndex >= 0) {
        const currentRecord = updatedAttendance[existingIndex];
        // Remover del transporte si estaba asignado
        if (currentRecord.transportAssignment) {
          removeFromTransport(memberId, currentRecord.transportAssignment);
        }
        updatedAttendance[existingIndex] = {
          ...updatedAttendance[existingIndex],
          status: 'absent',
          absenceReason: reason || 'Sin especificar',
          transportAssignment: undefined
        };
      } else {
        updatedAttendance.push({
          memberId,
          status: 'absent',
          absenceReason: reason || 'Sin especificar'
        });
      }
    }

    // Actualizar el transporte basado en los cambios de asistencia
    let updatedBuses = [...selectedPerformance.transport.buses];
    let updatedCars = [...selectedPerformance.transport.privateCars];

    // Si se confirmó y hay autobús disponible, añadir al autobús
    if (status === 'confirmed') {
      const availableBus = updatedBuses.find(bus => bus.passengers.length < bus.capacity);
      if (availableBus && !availableBus.passengers.includes(memberId)) {
        updatedBuses = updatedBuses.map(bus =>
          bus.id === availableBus.id 
            ? { ...bus, passengers: [...bus.passengers, memberId] }
            : bus
        );
      }
    }

    // Si se marcó como ausente o pendiente, remover de todos los transportes
    if (status === 'absent' || status === 'pending') {
      updatedBuses = updatedBuses.map(bus => ({
        ...bus,
        passengers: bus.passengers.filter(p => p !== memberId)
      }));
      updatedCars = updatedCars.map(car => ({
        ...car,
        passengers: car.passengers.filter(p => p !== memberId)
      }));
    }

    const updatedPerformance = {
      ...selectedPerformance,
      attendance: updatedAttendance,
      transport: {
        buses: updatedBuses,
        privateCars: updatedCars
      }
    };

    // Actualizar los datos de asistencia del componente
    updateComponentAttendanceData(memberId, selectedPerformance.id, status);

    setSelectedPerformance(updatedPerformance);
    const updatedPerformances = performances.map(p => 
      p.id === selectedPerformance.id ? updatedPerformance : p
    );
    setPerformances(updatedPerformances);
  };

  // Función para encontrar un autobús disponible
  const findAvailableBus = () => {
    if (!selectedPerformance) return null;
    return selectedPerformance.transport.buses.find(bus => 
      bus.passengers.length < bus.capacity
    ) || null;
  };

  // Función para remover pasajero del transporte
  const removeFromTransport = (memberId: string, transportId: string) => {
    if (!selectedPerformance) return;
    
    const updatedBuses = selectedPerformance.transport.buses.map(bus => 
      bus.id === transportId ? 
        { ...bus, passengers: bus.passengers.filter(p => p !== memberId) } : 
        bus
    );
    
    const updatedCars = selectedPerformance.transport.privateCars.map(car => 
      car.id === transportId ? 
        { ...car, passengers: car.passengers.filter(p => p !== memberId) } : 
        car
    );
    
    const updatedPerformance = {
      ...selectedPerformance,
      transport: {
        buses: updatedBuses,
        privateCars: updatedCars
      }
    };

    setSelectedPerformance(updatedPerformance);
    setPerformances(performances.map(p => 
      p.id === selectedPerformance.id ? updatedPerformance : p
    ));
  };

  // Funciones para gestionar transporte
  const handleAddBus = (capacity: 55 | 70, description: string) => {
    if (!selectedPerformance || !description.trim()) return;

    const newBus: Bus = {
      id: `bus-${Date.now()}`,
      capacity,
      description: description.trim(),
      passengers: []
    };

    const updatedPerformance = {
      ...selectedPerformance,
      transport: {
        ...selectedPerformance.transport,
        buses: [...selectedPerformance.transport.buses, newBus]
      }
    };

    setSelectedPerformance(updatedPerformance);
    setPerformances(performances.map(p => 
      p.id === selectedPerformance.id ? updatedPerformance : p
    ));
  };

  const handleRemoveBus = (busId: string) => {
    if (!selectedPerformance) return;

    const updatedPerformance = {
      ...selectedPerformance,
      transport: {
        ...selectedPerformance.transport,
        buses: selectedPerformance.transport.buses.filter(b => b.id !== busId)
      }
    };

    setSelectedPerformance(updatedPerformance);
    setPerformances(performances.map(p => 
      p.id === selectedPerformance.id ? updatedPerformance : p
    ));
  };

  const handleAddPrivateCar = (owner: string, conductor: string, capacity: number) => {
    if (!selectedPerformance || !owner.trim() || !conductor.trim() || capacity < 1) return;

    // Guardar los datos del coche y abrir el diálogo de selección de componentes
    setPendingCarData({ owner: owner.trim(), conductor: conductor.trim(), capacity });
    setSelectedCarMembers([]);
    setCarMembersDialog(true);
  };

  const handleConfirmPrivateCar = () => {
    if (!selectedPerformance || !pendingCarData) return;

    const newCar: PrivateCar = {
      id: `car-${Date.now()}`,
      owner: pendingCarData.owner,
      conductor: pendingCarData.conductor,
      capacity: pendingCarData.capacity,
      passengers: [...selectedCarMembers]
    };

    // Remover los miembros seleccionados de todos los autobuses
    const updatedBuses = selectedPerformance.transport.buses.map(bus => ({
      ...bus,
      passengers: bus.passengers.filter(memberId => !selectedCarMembers.includes(memberId))
    }));

    // Actualizar las asignaciones de transporte en attendance
    const updatedAttendance = selectedPerformance.attendance.map(record => 
      selectedCarMembers.includes(record.memberId)
        ? { ...record, transportAssignment: newCar.id }
        : record
    );

    const updatedPerformance = {
      ...selectedPerformance,
      transport: {
        buses: updatedBuses,
        privateCars: [...selectedPerformance.transport.privateCars, newCar]
      },
      attendance: updatedAttendance
    };

    setSelectedPerformance(updatedPerformance);
    setPerformances(performances.map(p => 
      p.id === selectedPerformance.id ? updatedPerformance : p
    ));

    // Limpiar estado
    setCarMembersDialog(false);
    setPendingCarData(null);
    setSelectedCarMembers([]);
  };

  // Obtener miembros confirmados que pueden ser asignados al coche
  const getAvailableMembersForCar = () => {
    if (!selectedPerformance) return [];
    
    // Solo miembros que han confirmado asistencia
    const confirmedMembers = selectedPerformance.attendance
      .filter(record => record.status === 'confirmed')
      .map(record => record.memberId);
    
    return components.filter(member => confirmedMembers.includes(member.id));
  };

  const handleToggleMemberForCar = (memberId: string) => {
    if (!pendingCarData) return;
    
    if (selectedCarMembers.includes(memberId)) {
      setSelectedCarMembers(selectedCarMembers.filter(id => id !== memberId));
    } else {
      // Solo permitir seleccionar hasta la capacidad del coche
      if (selectedCarMembers.length < pendingCarData.capacity) {
        setSelectedCarMembers([...selectedCarMembers, memberId]);
      }
    }
  };

  const handleRemovePrivateCar = (carId: string) => {
    if (!selectedPerformance) return;

    const updatedPerformance = {
      ...selectedPerformance,
      transport: {
        ...selectedPerformance.transport,
        privateCars: selectedPerformance.transport.privateCars.filter(c => c.id !== carId)
      }
    };

    setSelectedPerformance(updatedPerformance);
    setPerformances(performances.map(p => 
      p.id === selectedPerformance.id ? updatedPerformance : p
    ));
  };

  // Funciones para gestionar finanzas
  const handleAddExpense = (concept: string, amount: number, responsible: string) => {
    if (!selectedPerformance || !concept.trim() || amount <= 0 || !responsible.trim()) return;

    const newExpense: Expense = {
      id: `expense-${Date.now()}`,
      concept: concept.trim(),
      amount,
      responsible: responsible.trim()
    };

    const updatedPerformance = {
      ...selectedPerformance,
      expenses: [...selectedPerformance.expenses, newExpense]
    };

    setSelectedPerformance(updatedPerformance);
    setPerformances(performances.map(p => 
      p.id === selectedPerformance.id ? updatedPerformance : p
    ));
  };

  const handleRemoveExpense = (expenseId: string) => {
    if (!selectedPerformance) return;

    const updatedPerformance = {
      ...selectedPerformance,
      expenses: selectedPerformance.expenses.filter(e => e.id !== expenseId)
    };

    setSelectedPerformance(updatedPerformance);
    setPerformances(performances.map(p => 
      p.id === selectedPerformance.id ? updatedPerformance : p
    ));
  };

  const handleAddIncome = (concept: string, amount: number, source: string) => {
    if (!selectedPerformance || !concept.trim() || amount <= 0 || !source.trim()) return;

    const newIncome: Income = {
      id: `income-${Date.now()}`,
      concept: concept.trim(),
      amount,
      source: source.trim()
    };

    const updatedPerformance = {
      ...selectedPerformance,
      income: [...selectedPerformance.income, newIncome]
    };

    setSelectedPerformance(updatedPerformance);
    setPerformances(performances.map(p => 
      p.id === selectedPerformance.id ? updatedPerformance : p
    ));
  };

  const handleRemoveIncome = (incomeId: string) => {
    if (!selectedPerformance) return;

    const updatedPerformance = {
      ...selectedPerformance,
      income: selectedPerformance.income.filter(i => i.id !== incomeId)
    };

    setSelectedPerformance(updatedPerformance);
    setPerformances(performances.map(p => 
      p.id === selectedPerformance.id ? updatedPerformance : p
    ));
  };

  // Funciones para gestionar contratos
  const handleAddContract = (file: File, description?: string) => {
    if (!selectedPerformance) return;

    // Simular subida de archivo (en un caso real sería a Firebase Storage)
    const fileUrl = URL.createObjectURL(file);
    
    const newContract: ContractFile = {
      id: `contract-${Date.now()}`,
      name: file.name,
      fileUrl,
      uploadDate: new Date().toISOString(),
      description
    };

    const updatedPerformance = {
      ...selectedPerformance,
      contracts: [...(selectedPerformance.contracts || []), newContract]
    };

    setSelectedPerformance(updatedPerformance);
    setPerformances(performances.map(p => 
      p.id === selectedPerformance.id ? updatedPerformance : p
    ));

    // Sincronizar con el módulo de contratos
    syncContractToContractsModule(updatedPerformance, newContract);
  };

  const handleRemoveContract = (contractId: string) => {
    if (!selectedPerformance) return;

    const updatedPerformance = {
      ...selectedPerformance,
      contracts: (selectedPerformance.contracts || []).filter(c => c.id !== contractId)
    };

    setSelectedPerformance(updatedPerformance);
    setPerformances(performances.map(p => 
      p.id === selectedPerformance.id ? updatedPerformance : p
    ));

    // Eliminar también del módulo de contratos
    removeContractFromContractsModule(selectedPerformance.id, contractId);
  };

  const handleDownloadContract = (contract: ContractFile) => {
    const link = document.createElement('a');
    link.href = contract.fileUrl;
    link.download = contract.name;
    link.click();
  };

  // Funciones helper para obtener nombres de voces e instrumentos
  const getVoiceName = (voiceId: string): string => {
    const voice = voices.find(v => v.id === voiceId);
    return voice ? voice.name : voiceId;
  };

  // Función para obtener el estado de asistencia de un miembro
  const getMemberAttendanceStatus = (memberId: string) => {
    if (!selectedPerformance) return 'pending';
    const attendance = selectedPerformance.attendance.find(a => a.memberId === memberId);
    return attendance ? attendance.status : 'pending';
  };

  const getMemberAbsenceReason = (memberId: string) => {
    if (!selectedPerformance) return '';
    const attendance = selectedPerformance.attendance.find(a => a.memberId === memberId);
    return attendance?.absenceReason || '';
  };

  const getBusOccupancy = (bus: Bus) => {
    return (bus.passengers.length / bus.capacity) * 100;
  };
  return (
    <Box
      sx={{
        p: 4,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #2A2A2A 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 70% 20%, rgba(139, 0, 0, 0.08) 0%, transparent 50%)',
          zIndex: 1,
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <Paper
          elevation={12}
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(145deg, rgba(28, 28, 28, 0.95) 0%, rgba(40, 40, 40, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 0, 0, 0.3)',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  color: 'transparent',
                  background: 'linear-gradient(135deg, #8B0000 0%, #FF4444 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  fontWeight: 700,
                }}
              >
                🎭 Gestión de Actuaciones
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 300,
                  mt: 1,
                }}
              >
                Calendario completo con transporte y asistencia
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddPerformance}
              sx={{
                background: 'linear-gradient(135deg, #8B0000 0%, #FF4444 100%)',
                color: 'white',
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #FF4444 0%, #8B0000 100%)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Nueva Actuación
            </Button>
          </Box>
        </Paper>

        {/* Indicador de estado de datos (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <Paper
            elevation={8}
            sx={{
              p: 2,
              mb: 3,
              background: 'rgba(28, 28, 28, 0.8)',
              border: '1px solid rgba(139, 0, 0, 0.2)',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                📊 Estado de datos:
              </Typography>
              <Chip 
                label={`${performances.length} actuaciones`} 
                size="small" 
                sx={{ 
                  backgroundColor: performances.length > 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                  color: performances.length > 0 ? '#4CAF50' : '#F44336',
                  border: `1px solid ${performances.length > 0 ? '#4CAF50' : '#F44336'}33`
                }} 
              />
              <Chip 
                label={`${components.length} componentes`} 
                size="small" 
                sx={{ 
                  backgroundColor: components.length > 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                  color: components.length > 0 ? '#4CAF50' : '#F44336',
                  border: `1px solid ${components.length > 0 ? '#4CAF50' : '#F44336'}33`
                }} 
              />
              <Button 
                size="small" 
                onClick={debugStorage}
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.7rem',
                  minWidth: 'auto',
                  px: 1
                }}
              >
                Debug
              </Button>
            </Box>
          </Paper>
        )}

        {/* Calendario */}
        <Paper
          elevation={12}
          sx={{
            p: 4,
            background: 'linear-gradient(145deg, rgba(28, 28, 28, 0.95) 0%, rgba(40, 40, 40, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 0, 0, 0.3)',
            borderRadius: 3,
          }}
        >
          {/* Navegación del calendario mejorada */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={prevMonth}
                sx={{
                  color: '#8B0000',
                  '&:hover': {
                    background: 'rgba(139, 0, 0, 0.1)',
                  },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              
              {/* Selector de mes */}
              <TextField
                select
                value={currentDate.getMonth()}
                onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), Number(e.target.value), 1))}
                variant="outlined"
                size="small"
                sx={{
                  minWidth: 120,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': { borderColor: 'rgba(139, 0, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(139, 0, 0, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#8B0000' },
                  },
                  '& .MuiInputBase-input': { color: '#FFFFFF', fontSize: '0.9rem' },
                  '& .MuiSelect-icon': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i} value={i}>
                    {format(new Date(2024, i, 1), 'MMMM', { locale: es })}
                  </MenuItem>
                ))}
              </TextField>

              {/* Selector de año */}
              <TextField
                select
                value={currentDate.getFullYear()}
                onChange={(e) => setCurrentDate(new Date(Number(e.target.value), currentDate.getMonth(), 1))}
                variant="outlined"
                size="small"
                sx={{
                  minWidth: 100,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': { borderColor: 'rgba(139, 0, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(139, 0, 0, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#8B0000' },
                  },
                  '& .MuiInputBase-input': { color: '#FFFFFF', fontSize: '0.9rem' },
                  '& .MuiSelect-icon': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              >
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - 5 + i;
                  return (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Box>
            
            <Typography
              variant="h4"
              sx={{
                color: 'transparent',
                background: 'linear-gradient(135deg, #8B0000 0%, #FF4444 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setCurrentDate(new Date())}
                sx={{
                  color: '#8B0000',
                  borderColor: '#8B0000',
                  '&:hover': {
                    borderColor: '#A00000',
                    backgroundColor: 'rgba(139, 0, 0, 0.1)',
                  },
                  fontSize: '0.75rem',
                  px: 2,
                }}
              >
                Hoy
              </Button>
              
              <IconButton
                onClick={nextMonth}
                sx={{
                  color: '#8B0000',
                  '&:hover': {
                    background: 'rgba(139, 0, 0, 0.1)',
                  },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Días de la semana */}
          <Box sx={{ display: 'flex', mb: 2 }}>
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <Box
                key={day}
                sx={{
                  flex: 1,
                  p: 2,
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 600,
                }}
              >
                {day}
              </Box>
            ))}
          </Box>

          {/* Días del calendario */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {calendarDays.map((day) => {
              const dayPerformances = getPerformancesForDate(day);
              const hasPerformances = dayPerformances.length > 0;
              
              return (
                <Box
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  sx={{
                    width: 'calc(100% / 7)',
                    minHeight: 120,
                    p: 1,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    position: 'relative',
                    '&:hover': {
                      background: 'rgba(139, 0, 0, 0.1)',
                    },
                    ...(hasPerformances && {
                      background: 'rgba(139, 0, 0, 0.2)',
                      border: '1px solid rgba(139, 0, 0, 0.5)',
                    }),
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: isSameMonth(day, currentDate) 
                        ? 'rgba(255, 255, 255, 0.9)' 
                        : 'rgba(255, 255, 255, 0.3)',
                      fontWeight: 600,
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>
                  
                  {hasPerformances && (
                    <Box sx={{ mt: 1 }}>
                      {dayPerformances.slice(0, 2).map((performance) => (
                        <Chip
                          key={performance.id}
                          label={performance.title}
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #8B0000 0%, #FF4444 100%)',
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 20,
                            mb: 0.5,
                            width: '100%',
                            '& .MuiChip-label': {
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            },
                          }}
                        />
                      ))}
                      {dayPerformances.length > 2 && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#8B0000',
                            fontSize: '0.6rem',
                          }}
                        >
                          +{dayPerformances.length - 2} más
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Paper>

        {/* Resumen de próximas actuaciones */}
        <Paper
          elevation={12}
          sx={{
            p: 4,
            mt: 4,
            background: 'linear-gradient(145deg, rgba(28, 28, 28, 0.95) 0%, rgba(40, 40, 40, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139, 0, 0, 0.3)',
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: 'transparent',
              background: 'linear-gradient(135deg, #8B0000 0%, #FF4444 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              fontWeight: 600,
              mb: 3,
            }}
          >
            📅 Próximas Actuaciones
          </Typography>

          <Stack spacing={2}>
            {performances.slice(0, 3).map((performance) => (
              <Card
                key={performance.id}
                sx={{
                  background: 'rgba(139, 0, 0, 0.1)',
                  border: '1px solid rgba(139, 0, 0, 0.3)',
                  cursor: 'pointer',
                  '&:hover': {
                    background: 'rgba(139, 0, 0, 0.2)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => {
                  setSelectedPerformance(performance);
                  setDialogOpen(true);
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ color: '#FF4444', fontWeight: 600 }}>
                        {performance.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                        <CalendarIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 16, mr: 1 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          {format(new Date(performance.date), 'dd/MM/yyyy')} - {performance.time}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 16, mr: 1 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          {performance.venue}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Estado del transporte */}
                    <Box sx={{ textAlign: 'right' }}>
                      {performance.transport.buses.map((bus) => (
                        <Box key={bus.id} sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <BusIcon sx={{ color: '#8B0000', fontSize: 16, mr: 0.5 }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              {bus.passengers.length}/{bus.capacity}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={getBusOccupancy(bus)}
                            sx={{
                              width: 60,
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getBusOccupancy(bus) > 80 ? '#FF4444' : '#4CAF50',
                              },
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Paper>

        {/* Dialog de detalles de actuación */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
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
          <DialogTitle sx={{ color: '#FF4444', fontWeight: 600 }}>
            {isEditing 
              ? (selectedPerformance ? '✏️ Editar Actuación' : '➕ Nueva Actuación')
              : `📅 ${selectedPerformance?.title}`
            }
          </DialogTitle>
          
          <DialogContent>
            {isEditing ? (
              // Formulario de creación/edición
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  <TextField
                    label="Título de la Actuación *"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    fullWidth
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(139, 0, 0, 0.5)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(139, 0, 0, 0.8)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FF4444',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': {
                          color: '#FF4444',
                        },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField
                    label="Fecha *"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(139, 0, 0, 0.5)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(139, 0, 0, 0.8)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FF4444',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': {
                          color: '#FF4444',
                        },
                      },
                    }}
                  />
                  <TextField
                    label="Hora *"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(139, 0, 0, 0.5)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(139, 0, 0, 0.8)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FF4444',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': {
                          color: '#FF4444',
                        },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField
                    label="Lugar de Actuación *"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(139, 0, 0, 0.5)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(139, 0, 0, 0.8)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FF4444',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': {
                          color: '#FF4444',
                        },
                      },
                    }}
                  />
                  <TextField
                    label="Organizador"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(139, 0, 0, 0.5)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(139, 0, 0, 0.8)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FF4444',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': {
                          color: '#FF4444',
                        },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField
                    label="Hora de Quedada"
                    type="time"
                    value={formData.meetingTime}
                    onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(139, 0, 0, 0.5)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(139, 0, 0, 0.8)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FF4444',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': {
                          color: '#FF4444',
                        },
                      },
                    }}
                  />
                  <TextField
                    label="Lugar de Quedada"
                    value={formData.meetingPlace}
                    onChange={(e) => setFormData({ ...formData, meetingPlace: e.target.value })}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(139, 0, 0, 0.5)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(139, 0, 0, 0.8)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#FF4444',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': {
                          color: '#FF4444',
                        },
                      },
                    }}
                  />
                </Box>

                <Alert severity="info" sx={{ mt: 2 }}>
                  Los campos marcados con * son obligatorios. Después de crear la actuación podrás gestionar el transporte, finanzas y asistencia.
                </Alert>
              </Box>
            ) : selectedPerformance ? (
              <Box>
                <Tabs
                  value={tabValue}
                  onChange={(_, newValue) => setTabValue(newValue)}
                  sx={{
                    mb: 3,
                    '& .MuiTab-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .Mui-selected': {
                      color: '#FF4444 !important',
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#FF4444',
                    },
                  }}
                >
                  <Tab label="📋 Detalles" />
                  <Tab label="💰 Finanzas" />
                  <Tab label="🚌 Transporte" />
                  <Tab label="👥 Asistencia" />
                </Tabs>

                {/* Tab Detalles */}
                {tabValue === 0 && (
                  <Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                          📅 Fecha y Hora
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white' }}>
                          {format(new Date(selectedPerformance.date), 'dd/MM/yyyy')} - {selectedPerformance.time}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                          📍 Lugar de Actuación
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white' }}>
                          {selectedPerformance.venue}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                          ⏰ Hora de Quedada
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white' }}>
                          {selectedPerformance.meetingTime || 'No especificada'}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 200 }}>
                        <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                          📍 Lugar de Quedada
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white' }}>
                          {selectedPerformance.meetingPlace || 'No especificado'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                        👤 Organizador
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {selectedPerformance.organizer || 'No especificado'}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Tab Finanzas */}
                {tabValue === 1 && (
                  <Box>
                    <Box sx={{ display: 'flex', gap: 4 }}>
                      {/* Gastos */}
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ color: '#FF4444' }}>
                            💸 Gastos
                          </Typography>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              const concept = prompt('Concepto del gasto:');
                              if (!concept) return;
                              const amount = parseFloat(prompt('Importe (€):') || '0');
                              if (amount <= 0) return;
                              const responsible = prompt('Responsable:') || 'No especificado';
                              handleAddExpense(concept, amount, responsible);
                            }}
                            sx={{
                              background: 'linear-gradient(135deg, #8B0000 0%, #FF4444 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #FF4444 0%, #8B0000 100%)',
                              },
                            }}
                          >
                            + Añadir
                          </Button>
                        </Box>
                        
                        <List>
                          {selectedPerformance.expenses.map((expense) => (
                            <Card
                              key={expense.id}
                              sx={{
                                mb: 1,
                                background: 'rgba(244, 67, 54, 0.1)',
                                border: '1px solid rgba(244, 67, 54, 0.3)',
                              }}
                            >
                              <CardContent sx={{ py: 1.5, px: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box>
                                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                                      {expense.concept}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                      {expense.amount}€ - {expense.responsible}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveExpense(expense.id)}
                                    sx={{ color: '#FF4444' }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </CardContent>
                            </Card>
                          ))}
                          {selectedPerformance.expenses.length === 0 && (
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', py: 2 }}>
                              No hay gastos registrados
                            </Typography>
                          )}
                        </List>
                        
                        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                        <Typography variant="h6" sx={{ color: '#FF4444', textAlign: 'center' }}>
                          Total Gastos: {selectedPerformance.expenses.reduce((sum, exp) => sum + exp.amount, 0)}€
                        </Typography>
                      </Box>

                      {/* Ingresos */}
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ color: '#4CAF50' }}>
                            💰 Ingresos
                          </Typography>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => {
                              const concept = prompt('Concepto del ingreso:');
                              if (!concept) return;
                              const amount = parseFloat(prompt('Importe (€):') || '0');
                              if (amount <= 0) return;
                              const source = prompt('Fuente:') || 'No especificada';
                              handleAddIncome(concept, amount, source);
                            }}
                          >
                            + Añadir
                          </Button>
                        </Box>
                        
                        <List>
                          {selectedPerformance.income.map((income) => (
                            <Card
                              key={income.id}
                              sx={{
                                mb: 1,
                                background: 'rgba(76, 175, 80, 0.1)',
                                border: '1px solid rgba(76, 175, 80, 0.3)',
                              }}
                            >
                              <CardContent sx={{ py: 1.5, px: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box>
                                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                                      {income.concept}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                      {income.amount}€ - {income.source}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveIncome(income.id)}
                                    sx={{ color: '#4CAF50' }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </CardContent>
                            </Card>
                          ))}
                          {selectedPerformance.income.length === 0 && (
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', py: 2 }}>
                              No hay ingresos registrados
                            </Typography>
                          )}
                        </List>
                        
                        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                        <Typography variant="h6" sx={{ color: '#4CAF50', textAlign: 'center' }}>
                          Total Ingresos: {selectedPerformance.income.reduce((sum, inc) => sum + inc.amount, 0)}€
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                    
                    <Paper
                      sx={{
                        p: 3,
                        background: selectedPerformance.income.reduce((sum, inc) => sum + inc.amount, 0) - 
                                   selectedPerformance.expenses.reduce((sum, exp) => sum + exp.amount, 0) >= 0 
                                   ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                        border: selectedPerformance.income.reduce((sum, inc) => sum + inc.amount, 0) - 
                                selectedPerformance.expenses.reduce((sum, exp) => sum + exp.amount, 0) >= 0 
                                ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(244, 67, 54, 0.3)',
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="h4" sx={{ 
                        color: selectedPerformance.income.reduce((sum, inc) => sum + inc.amount, 0) - 
                               selectedPerformance.expenses.reduce((sum, exp) => sum + exp.amount, 0) >= 0 
                               ? '#4CAF50' : '#FF4444',
                        fontWeight: 700,
                        mb: 1
                      }}>
                        {selectedPerformance.income.reduce((sum, inc) => sum + inc.amount, 0) - 
                         selectedPerformance.expenses.reduce((sum, exp) => sum + exp.amount, 0) >= 0 ? '💰' : '📉'} 
                        {selectedPerformance.income.reduce((sum, inc) => sum + inc.amount, 0) - 
                         selectedPerformance.expenses.reduce((sum, exp) => sum + exp.amount, 0)}€
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: 400
                      }}>
                        Balance Final
                      </Typography>
                    </Paper>
                    
                    {/* Sección de Contratos */}
                    <Box sx={{ mt: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ color: '#FF4444' }}>
                          📄 Contratos
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          component="label"
                          sx={{
                            background: 'linear-gradient(135deg, #8B0000 0%, #FF4444 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #FF4444 0%, #8B0000 100%)',
                            },
                          }}
                        >
                          📎 Adjuntar Contrato
                          <input
                            type="file"
                            hidden
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const description = prompt('Descripción del contrato (opcional):');
                                handleAddContract(file, description || undefined);
                              }
                            }}
                          />
                        </Button>
                      </Box>

                      {(selectedPerformance.contracts && selectedPerformance.contracts.length > 0) ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {selectedPerformance.contracts.map((contract) => (
                            <Card key={contract.id} sx={{ 
                              background: 'rgba(255, 255, 255, 0.05)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}>
                              <CardContent sx={{ py: 1.5, px: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                                      📄 {contract.name}
                                    </Typography>
                                    {contract.description && (
                                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                        {contract.description}
                                      </Typography>
                                    )}
                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                      Subido: {format(new Date(contract.uploadDate), 'dd/MM/yyyy HH:mm', { locale: es })}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDownloadContract(contract)}
                                      sx={{ color: '#4CAF50' }}
                                      title="Descargar"
                                    >
                                      <GetAppIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveContract(contract.id)}
                                      sx={{ color: '#FF4444' }}
                                      title="Eliminar"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          ))}
                        </Box>
                      ) : (
                        <Paper sx={{
                          p: 3,
                          textAlign: 'center',
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}>
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            📄 No hay contratos adjuntos
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Tab Transporte */}
                {tabValue === 2 && (
                  <Box>
                    <Typography variant="h6" sx={{ color: '#FF4444', mb: 3 }}>
                      🚌 Gestión del Transporte
                    </Typography>
                    
                    {/* Autobuses */}
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          Autobuses
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              const description = prompt('Descripción del autobús (ej: "Autobús principal - Salida Plaza Mayor"):');
                              if (!description) return;
                              handleAddBus(55, description);
                            }}
                            sx={{
                              background: 'linear-gradient(135deg, #8B0000 0%, #FF4444 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #FF4444 0%, #8B0000 100%)',
                              },
                              borderRadius: '20px',
                              px: 2,
                            }}
                          >
                            🚌 Bus 55
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              const description = prompt('Descripción del autobús (ej: "Autobús grande - Recorrido procesional"):');
                              if (!description) return;
                              handleAddBus(70, description);
                            }}
                            sx={{
                              background: 'linear-gradient(135deg, #8B0000 0%, #FF4444 100%)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #FF4444 0%, #8B0000 100%)',
                              },
                              borderRadius: '20px',
                              px: 2,
                            }}
                          >
                            🚍 Bus 70
                          </Button>
                        </Box>
                      </Box>
                      
                      {selectedPerformance.transport.buses.length > 0 ? (
                        selectedPerformance.transport.buses.map((bus) => (
                          <Card key={bus.id} sx={{ 
                            mb: 2, 
                            background: 'rgba(139, 0, 0, 0.1)',
                            border: '1px solid rgba(139, 0, 0, 0.3)',
                          }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <BusIcon sx={{ color: '#8B0000', mr: 1 }} />
                                  <Typography variant="h6" sx={{ color: 'white' }}>
                                    Autobús {bus.capacity} plazas
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    label={`${bus.passengers.length}/${bus.capacity}`}
                                    color={getBusOccupancy(bus) > 80 ? 'error' : 'success'}
                                    size="small"
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      if (window.confirm('¿Eliminar este autobús?')) {
                                        handleRemoveBus(bus.id);
                                      }
                                    }}
                                    sx={{ color: '#FF4444' }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                                � Descripción: {bus.description}
                              </Typography>
                              
                              <LinearProgress
                                variant="determinate"
                                value={getBusOccupancy(bus)}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: getBusOccupancy(bus) > 80 ? '#FF4444' : '#4CAF50',
                                  },
                                }}
                              />
                              
                              <Typography variant="caption" sx={{ 
                                color: 'rgba(255, 255, 255, 0.6)',
                                display: 'block',
                                mt: 1
                              }}>
                                Ocupación: {Math.round(getBusOccupancy(bus))}% | Disponibles: {bus.capacity - bus.passengers.length} plazas
                              </Typography>

                              {bus.passengers.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                                    Pasajeros:
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {bus.passengers.slice(0, 10).map((passengerId) => {
                                      const passenger = components.find(c => c.id === passengerId);
                                      return (
                                        <Chip
                                          key={passengerId}
                                          label={passenger?.name || 'Desconocido'}
                                          size="small"
                                          sx={{
                                            background: 'rgba(76, 175, 80, 0.2)',
                                            color: 'white',
                                            fontSize: '0.7rem'
                                          }}
                                        />
                                      );
                                    })}
                                    {bus.passengers.length > 10 && (
                                      <Chip
                                        label={`+${bus.passengers.length - 10}`}
                                        size="small"
                                        sx={{
                                          background: 'rgba(139, 0, 0, 0.3)',
                                          color: 'white',
                                          fontSize: '0.7rem'
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Alert severity="info" sx={{ mb: 2 }}>
                          No hay autobuses asignados. Añade autobuses para organizar el transporte.
                        </Alert>
                      )}
                    </Box>

                    {/* Coches particulares */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                          Coches Particulares
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          color="secondary"
                          onClick={() => {
                            const owner = prompt('Propietario del coche:');
                            if (!owner) return;
                            const conductor = prompt('Nombre del conductor (puede ser diferente al propietario):');
                            if (!conductor) return;
                            const capacity = parseInt(prompt('Capacidad (número de pasajeros):') || '4');
                            if (capacity < 1 || capacity > 9) {
                              alert('La capacidad debe estar entre 1 y 9 pasajeros');
                              return;
                            }
                            handleAddPrivateCar(owner, conductor, capacity);
                          }}
                        >
                          + Añadir Coche
                        </Button>
                      </Box>
                      
                      {selectedPerformance.transport.privateCars.length > 0 ? (
                        selectedPerformance.transport.privateCars.map((car) => (
                          <Card key={car.id} sx={{ 
                            mb: 2, 
                            background: 'rgba(139, 0, 0, 0.1)',
                            border: '1px solid rgba(139, 0, 0, 0.3)',
                          }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                  <CarIcon sx={{ color: '#8B0000', mr: 1 }} />
                                  <Box>
                                    <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                                      🚗 {car.owner}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                      👨‍✈️ Conductor: {car.conductor}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                      Capacidad: {car.capacity} pasajeros
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    label={`${car.passengers.length}/${car.capacity}`}
                                    color={car.passengers.length >= car.capacity ? 'error' : 'success'}
                                    size="small"
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      if (window.confirm('¿Eliminar este coche?')) {
                                        handleRemovePrivateCar(car.id);
                                      }
                                    }}
                                    sx={{ color: '#FF4444' }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>

                              {car.passengers.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                                    Pasajeros:
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {car.passengers.map((passengerId) => {
                                      const passenger = components.find(c => c.id === passengerId);
                                      return (
                                        <Chip
                                          key={passengerId}
                                          label={passenger?.name || 'Desconocido'}
                                          size="small"
                                          sx={{
                                            background: 'rgba(76, 175, 80, 0.2)',
                                            color: 'white',
                                            fontSize: '0.7rem'
                                          }}
                                        />
                                      );
                                    })}
                                  </Box>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Alert severity="info">
                          No hay coches particulares registrados. Los miembros pueden ofrecer sus coches para el transporte.
                        </Alert>
                      )}
                    </Box>

                    {/* Resumen de transporte */}
                    <Paper
                      sx={{
                        mt: 3,
                        p: 3,
                        background: 'rgba(139, 0, 0, 0.1)',
                        border: '1px solid rgba(139, 0, 0, 0.3)',
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#FF4444', mb: 2, textAlign: 'center' }}>
                        🚌 Resumen de Transporte
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                        <Box>
                          <Typography variant="h4" sx={{ color: '#8B0000' }}>
                            {selectedPerformance.transport.buses.reduce((sum, bus) => sum + bus.capacity, 0)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Plazas Autobús
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="h4" sx={{ color: '#FF4444' }}>
                            {selectedPerformance.transport.privateCars.reduce((sum, car) => sum + car.capacity, 0)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Plazas Coche
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="h4" sx={{ color: '#4CAF50' }}>
                            {selectedPerformance.transport.buses.reduce((sum, bus) => sum + bus.capacity, 0) + 
                             selectedPerformance.transport.privateCars.reduce((sum, car) => sum + car.capacity, 0)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Total Disponible
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                )}

                {/* Tab Asistencia */}
                {tabValue === 3 && (
                  <Box>
                    <Typography variant="h6" sx={{ color: '#FF4444', mb: 3 }}>
                      👥 Control de Asistencia
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Total de miembros: {components.length} | 
                        Confirmados: {components.filter(c => getMemberAttendanceStatus(c.id) === 'confirmed').length} | 
                        Ausentes: {components.filter(c => getMemberAttendanceStatus(c.id) === 'absent').length} | 
                        Pendientes: {components.filter(c => getMemberAttendanceStatus(c.id) === 'pending').length}
                      </Typography>
                    </Box>

                    <Alert severity="warning" sx={{ mb: 3 }}>
                      Por defecto, todos los miembros están <strong>obligados a asistir</strong>. Marca como ausente solo en casos excepcionales.
                    </Alert>

                    {/* Lista de TODOS los componentes */}
                    <List>
                      {components.map((member) => {
                        const status = getMemberAttendanceStatus(member.id);
                        const absenceReason = getMemberAbsenceReason(member.id);
                        
                        return (
                          <Card
                            key={member.id}
                            sx={{
                              mb: 2,
                              background: status === 'confirmed' 
                                ? 'rgba(76, 175, 80, 0.1)' 
                                : status === 'absent' 
                                ? 'rgba(244, 67, 54, 0.1)' 
                                : 'rgba(139, 0, 0, 0.1)',
                              border: status === 'confirmed' 
                                ? '1px solid rgba(76, 175, 80, 0.3)' 
                                : status === 'absent' 
                                ? '1px solid rgba(244, 67, 54, 0.3)' 
                                : '1px solid rgba(139, 0, 0, 0.3)',
                            }}
                          >
                            <CardContent sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                  <Avatar 
                                    src={member.photo || undefined}
                                    sx={{ 
                                      background: 'linear-gradient(135deg, #8B0000 0%, #FF4444 100%)',
                                      mr: 2
                                    }}
                                  >
                                    {member.photo ? undefined : <PersonIcon />}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="h6" sx={{ color: 'white', mb: 0.5 }}>
                                      {member.name} {member.surname}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                      {getVoiceName(member.voice)}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {/* Estado actual */}
                                  {status === 'confirmed' && (
                                    <Chip 
                                      label="✅ Confirmado" 
                                      color="success" 
                                      size="small"
                                      sx={{ color: 'white' }}
                                    />
                                  )}
                                  {status === 'absent' && (
                                    <Chip 
                                      label={`❌ Ausente: ${absenceReason}`}
                                      color="error" 
                                      size="small"
                                    />
                                  )}
                                  {status === 'pending' && (
                                    <Chip 
                                      label="⚠️ Pendiente" 
                                      color="warning" 
                                      size="small"
                                    />
                                  )}

                                  {/* Botones de acción */}
                                  {status !== 'confirmed' && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      onClick={() => handleToggleAttendance(member.id, 'confirmed')}
                                      sx={{ minWidth: 'auto', px: 1 }}
                                    >
                                      ✅
                                    </Button>
                                  )}

                                  {status !== 'absent' && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="error"
                                      onClick={() => {
                                        const reason = prompt('Motivo de la ausencia:', 'Enfermedad');
                                        if (reason !== null) {
                                          handleToggleAttendance(member.id, 'absent', reason);
                                        }
                                      }}
                                      sx={{ minWidth: 'auto', px: 1 }}
                                    >
                                      ❌
                                    </Button>
                                  )}

                                  {status !== 'pending' && (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => handleToggleAttendance(member.id, 'pending')}
                                      sx={{ 
                                        minWidth: 'auto', 
                                        px: 1,
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        borderColor: 'rgba(255, 255, 255, 0.3)'
                                      }}
                                    >
                                      ⏳
                                    </Button>
                                  )}
                                </Box>
                              </Box>

                              {/* Mostrar motivo de ausencia si está ausente */}
                              {status === 'absent' && absenceReason && (
                                <Box sx={{ mt: 2, p: 2, background: 'rgba(244, 67, 54, 0.1)', borderRadius: 1 }}>
                                  <Typography variant="body2" sx={{ color: '#FF4444' }}>
                                    <strong>Motivo de ausencia:</strong> {absenceReason}
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </List>

                    {/* Resumen de asistencia */}
                    <Paper
                      sx={{
                        mt: 3,
                        p: 3,
                        background: 'rgba(139, 0, 0, 0.1)',
                        border: '1px solid rgba(139, 0, 0, 0.3)',
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#FF4444', mb: 2, textAlign: 'center' }}>
                        📊 Resumen de Asistencia
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                        <Box>
                          <Typography variant="h4" sx={{ color: '#4CAF50' }}>
                            {components.filter(c => getMemberAttendanceStatus(c.id) === 'confirmed').length}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Confirmados
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="h4" sx={{ color: '#FF4444' }}>
                            {components.filter(c => getMemberAttendanceStatus(c.id) === 'absent').length}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Ausentes
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="h4" sx={{ color: '#FFA726' }}>
                            {components.filter(c => getMemberAttendanceStatus(c.id) === 'pending').length}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Pendientes
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                )}
              </Box>
            ) : null}
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              {isEditing ? 'Cancelar' : 'Cerrar'}
            </Button>
            
            {isEditing ? (
              <Button
                onClick={selectedPerformance ? handleUpdatePerformance : handleSavePerformance}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #8B0000 0%, #FF4444 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FF4444 0%, #8B0000 100%)',
                  },
                }}
              >
                {selectedPerformance ? 'Actualizar' : 'Crear Actuación'}
              </Button>
            ) : selectedPerformance && (
              <>
                <Button
                  startIcon={<EditIcon />}
                  onClick={handleEditPerformance}
                  sx={{ color: '#FF4444' }}
                >
                  Editar
                </Button>
                <Button
                  startIcon={<DeleteIcon />}
                  onClick={handleDeletePerformance}
                  sx={{ color: '#FF4444' }}
                >
                  Eliminar
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Diálogo para seleccionar componentes del coche particular */}
        <Dialog
          open={carMembersDialog}
          onClose={() => setCarMembersDialog(false)}
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
            Seleccionar Componentes para Coche Particular
          </DialogTitle>
          <DialogContent>
            {pendingCarData && (
              <Box sx={{ mb: 3 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Coche:</strong> {pendingCarData.owner} (Conductor: {pendingCarData.conductor})<br/>
                    <strong>Capacidad:</strong> {pendingCarData.capacity} pasajeros<br/>
                    <strong>Seleccionados:</strong> {selectedCarMembers.length}/{pendingCarData.capacity}
                  </Typography>
                </Alert>
                
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                  Selecciona los componentes que viajarán en este coche particular. Los miembros que estén asignados a autobuses serán movidos automáticamente.
                </Typography>

                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                  {getAvailableMembersForCar().map((member) => (
                    <FormControlLabel
                      key={member.id}
                      control={
                        <Checkbox
                          checked={selectedCarMembers.includes(member.id)}
                          onChange={() => handleToggleMemberForCar(member.id)}
                          disabled={
                            !selectedCarMembers.includes(member.id) && 
                            selectedCarMembers.length >= pendingCarData.capacity
                          }
                          sx={{
                            color: '#8B0000',
                            '&.Mui-checked': {
                              color: '#8B0000',
                            },
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                          <Avatar
                            sx={{
                              backgroundColor: '#8B0000',
                              width: 32,
                              height: 32,
                              fontSize: '0.875rem'
                            }}
                          >
                            {member.name.charAt(0)}{member.surname?.charAt(0) || 'X'}
                          </Avatar>
                          <Box>
                            <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                              {member.name} {member.surname}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              {getVoiceName(member.voice)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ 
                        color: '#FFFFFF',
                        width: '100%',
                        m: 0,
                        '& .MuiFormControlLabel-label': { width: '100%' }
                      }}
                    />
                  ))}
                </Box>

                {getAvailableMembersForCar().length === 0 && (
                  <Alert severity="warning">
                    No hay componentes confirmados disponibles para asignar.
                  </Alert>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setCarMembersDialog(false)} 
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmPrivateCar}
              variant="contained"
              disabled={selectedCarMembers.length === 0}
              sx={{
                background: selectedCarMembers.length > 0 
                  ? 'linear-gradient(135deg, #8B0000 0%, #A00000 100%)'
                  : 'rgba(255, 255, 255, 0.12)',
                '&:hover': {
                  background: selectedCarMembers.length > 0
                    ? 'linear-gradient(135deg, #A00000 0%, #BB0000 100%)'
                    : 'rgba(255, 255, 255, 0.12)',
                },
              }}
            >
              Crear Coche ({selectedCarMembers.length} miembros)
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default PerformancesManagerPage;

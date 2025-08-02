import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  LinearProgress,
  Tabs,
  Tab,
  Paper,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  DirectionsBus as BusIcon,
} from '@mui/icons-material';

interface Member {
  id: string;
  nombre: string;
  apellidos: string;
  instrumento: string;
  activo: boolean;
}

interface Performance {
  id: string;
  titulo: string;
  fecha: Date;
  hora: string;
  lugar: string;
  tipo: string;
  descripcion: string;
  estado: 'programada' | 'confirmada' | 'completada' | 'cancelada';
  precio?: number;
  requiereAutobus: boolean;
  autobuses: {
    bus55: BusInfo;
    bus70: BusInfo;
  };
  asistentes: AttendanceRecord[];
}

interface BusInfo {
  capacidad: number;
  ocupados: number;
  pasajeros: string[];
  activo: boolean;
}

interface AttendanceRecord {
  memberId: string;
  memberName: string;
  status: 'confirmed' | 'declined' | 'pending';
  busPreference?: 'bus55' | 'bus70' | 'none';
  notes?: string;
  confirmedAt?: Date;
}

const PerformancesPageAdvanced: React.FC = () => {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAttendanceDialog, setOpenAttendanceDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<Partial<Performance>>({});

  // Datos de ejemplo
  useEffect(() => {
    const sampleMembers: Member[] = [
      { id: '1', nombre: 'Juan', apellidos: 'García López', instrumento: 'Trompeta', activo: true },
      { id: '2', nombre: 'María', apellidos: 'Rodríguez Pérez', instrumento: 'Saxofón', activo: true },
      { id: '3', nombre: 'Carlos', apellidos: 'Martín Sánchez', instrumento: 'Trombón', activo: true },
      { id: '4', nombre: 'Ana', apellidos: 'López García', instrumento: 'Clarinete', activo: true },
      { id: '5', nombre: 'Pedro', apellidos: 'Fernández Ruiz', instrumento: 'Tuba', activo: true },
      { id: '6', nombre: 'Isabel', apellidos: 'Moreno Silva', instrumento: 'Flauta', activo: true },
      { id: '7', nombre: 'Miguel', apellidos: 'Jiménez Torres', instrumento: 'Percusión', activo: true },
      { id: '8', nombre: 'Carmen', apellidos: 'Ruiz Morales', instrumento: 'Bombardino', activo: true },
    ];

    const samplePerformances: Performance[] = [
      {
        id: '1',
        titulo: 'Concierto de Primavera',
        fecha: new Date('2025-08-15T20:00:00'),
        hora: '20:00',
        lugar: 'Auditorio Municipal',
        tipo: 'Concierto',
        descripcion: 'Concierto benéfico para la Cruz Roja',
        estado: 'confirmada',
        precio: 500,
        requiereAutobus: true,
        autobuses: {
          bus55: { capacidad: 55, ocupados: 32, pasajeros: [], activo: true },
          bus70: { capacidad: 70, ocupados: 28, pasajeros: [], activo: true }
        },
        asistentes: [
          { memberId: '1', memberName: 'Juan García López', status: 'confirmed', busPreference: 'bus55', confirmedAt: new Date() },
          { memberId: '2', memberName: 'María Rodríguez Pérez', status: 'confirmed', busPreference: 'bus70', confirmedAt: new Date() },
          { memberId: '3', memberName: 'Carlos Martín Sánchez', status: 'pending', busPreference: 'bus55' },
          { memberId: '4', memberName: 'Ana López García', status: 'declined' },
        ]
      },
      {
        id: '2',
        titulo: 'Procesión Semana Santa',
        fecha: new Date('2025-08-24T18:00:00'),
        hora: '18:00',
        lugar: 'Centro Histórico',
        tipo: 'Procesión',
        descripcion: 'Acompañamiento musical en la procesión',
        estado: 'programada',
        requiereAutobus: false,
        autobuses: {
          bus55: { capacidad: 55, ocupados: 0, pasajeros: [], activo: false },
          bus70: { capacidad: 70, ocupados: 0, pasajeros: [], activo: false }
        },
        asistentes: []
      }
    ];

    setMembers(sampleMembers);
    setPerformances(samplePerformances);
  }, []);

  const handleOpenDialog = (performance?: Performance) => {
    if (performance) {
      setSelectedPerformance(performance);
      setFormData(performance);
    } else {
      setSelectedPerformance(null);
      setFormData({
        titulo: '',
        fecha: new Date(),
        hora: '',
        lugar: '',
        tipo: '',
        descripcion: '',
        estado: 'programada',
        requiereAutobus: false,
        autobuses: {
          bus55: { capacidad: 55, ocupados: 0, pasajeros: [], activo: false },
          bus70: { capacidad: 70, ocupados: 0, pasajeros: [], activo: false }
        },
        asistentes: []
      });
    }
    setOpenDialog(true);
  };

  const handleSavePerformance = () => {
    if (selectedPerformance) {
      setPerformances(prev => prev.map(p => 
        p.id === selectedPerformance.id ? { ...p, ...formData } as Performance : p
      ));
    } else {
      const newPerformance: Performance = {
        id: Date.now().toString(),
        ...formData as Omit<Performance, 'id'>
      };
      setPerformances(prev => [...prev, newPerformance]);
    }
    setOpenDialog(false);
  };

  const handleAttendanceChange = (performanceId: string, memberId: string, status: 'confirmed' | 'declined' | 'pending', busPreference?: 'bus55' | 'bus70' | 'none') => {
    setPerformances(prev => prev.map(performance => {
      if (performance.id !== performanceId) return performance;

      const existingIndex = performance.asistentes.findIndex(a => a.memberId === memberId);
      const member = members.find(m => m.id === memberId);
      
      if (!member) return performance;

      const attendanceRecord: AttendanceRecord = {
        memberId,
        memberName: `${member.nombre} ${member.apellidos}`,
        status,
        busPreference,
        confirmedAt: status === 'confirmed' ? new Date() : undefined
      };

      let updatedAsistentes;
      if (existingIndex >= 0) {
        updatedAsistentes = [...performance.asistentes];
        updatedAsistentes[existingIndex] = attendanceRecord;
      } else {
        updatedAsistentes = [...performance.asistentes, attendanceRecord];
      }

      // Actualizar ocupación de autobuses
      const updatedAutobuses = { ...performance.autobuses };
      
      // Resetear contadores
      updatedAutobuses.bus55.ocupados = 0;
      updatedAutobuses.bus70.ocupados = 0;
      
      // Contar confirmados por bus
      updatedAsistentes.forEach(att => {
        if (att.status === 'confirmed') {
          if (att.busPreference === 'bus55') updatedAutobuses.bus55.ocupados++;
          if (att.busPreference === 'bus70') updatedAutobuses.bus70.ocupados++;
        }
      });

      return {
        ...performance,
        asistentes: updatedAsistentes,
        autobuses: updatedAutobuses
      };
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada': return '#4CAF50';
      case 'programada': return '#2196F3';
      case 'completada': return '#FF9800';
      case 'cancelada': return '#F44336';
      default: return '#B0B0B0';
    }
  };

  const getBusProgress = (ocupados: number, capacidad: number) => {
    return (ocupados / capacidad) * 100;
  };

  const getBusColor = (ocupados: number, capacidad: number) => {
    const percentage = getBusProgress(ocupados, capacidad);
    if (percentage >= 90) return '#F44336'; // Rojo - casi lleno
    if (percentage >= 70) return '#FF9800'; // Naranja - medio lleno
    return '#4CAF50'; // Verde - disponible
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#8B0000', fontWeight: 'bold' }}>
        Gestión Avanzada de Actuaciones
      </Typography>

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Calendario/Vista General" icon={<CalendarIcon />} />
        <Tab label="Gestión de Asistencia" icon={<PeopleIcon />} />
        <Tab label="Estado de Autobuses" icon={<BusIcon />} />
      </Tabs>

      {/* Tab 1: Vista General */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ backgroundColor: '#8B0000', '&:hover': { backgroundColor: '#A00000' } }}
          >
            Nueva Actuación
          </Button>
        </Box>

        {performances.map((performance) => (
          <Card key={performance.id} sx={{ mb: 2, backgroundColor: '#1C1C1C', border: '1px solid #333' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 1 }}>
                    {performance.titulo}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: 16, color: '#B0B0B0' }} />
                      <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                        {formatDate(performance.fecha)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TimeIcon sx={{ fontSize: 16, color: '#B0B0B0' }} />
                      <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                        {performance.hora}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationIcon sx={{ fontSize: 16, color: '#B0B0B0' }} />
                      <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                        {performance.lugar}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={performance.estado}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(performance.estado),
                      color: '#FFFFFF'
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton onClick={() => handleOpenDialog(performance)} sx={{ color: '#4CAF50' }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => {
                      setSelectedPerformance(performance);
                      setOpenAttendanceDialog(true);
                    }}
                    sx={{ color: '#2196F3' }}
                  >
                    <PeopleIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Información de autobuses */}
              {performance.requiereAutobus && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1 }}>
                    Estado de Autobuses:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Paper sx={{ p: 2, backgroundColor: '#2C2C2C', border: '1px solid #444', minWidth: 250, flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <BusIcon sx={{ color: getBusColor(performance.autobuses.bus55.ocupados, 55) }} />
                        <Typography variant="subtitle2" sx={{ color: '#FFFFFF' }}>
                          Autobús 55 plazas
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={getBusProgress(performance.autobuses.bus55.ocupados, 55)}
                        sx={{
                          mb: 1,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getBusColor(performance.autobuses.bus55.ocupados, 55)
                          }
                        }}
                      />
                      <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                        {performance.autobuses.bus55.ocupados} / 55 ocupados
                      </Typography>
                    </Paper>
                    <Paper sx={{ p: 2, backgroundColor: '#2C2C2C', border: '1px solid #444', minWidth: 250, flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <BusIcon sx={{ color: getBusColor(performance.autobuses.bus70.ocupados, 70) }} />
                        <Typography variant="subtitle2" sx={{ color: '#FFFFFF' }}>
                          Autobús 70 plazas
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={getBusProgress(performance.autobuses.bus70.ocupados, 70)}
                        sx={{
                          mb: 1,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getBusColor(performance.autobuses.bus70.ocupados, 70)
                          }
                        }}
                      />
                      <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                        {performance.autobuses.bus70.ocupados} / 70 ocupados
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              )}

              {/* Estadísticas de asistencia */}
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<CheckIcon />}
                  label={`${performance.asistentes.filter(a => a.status === 'confirmed').length} Confirmados`}
                  sx={{ backgroundColor: '#4CAF50', color: '#FFFFFF' }}
                />
                <Chip
                  icon={<CloseIcon />}
                  label={`${performance.asistentes.filter(a => a.status === 'declined').length} No asisten`}
                  sx={{ backgroundColor: '#F44336', color: '#FFFFFF' }}
                />
                <Chip
                  icon={<PersonIcon />}
                  label={`${performance.asistentes.filter(a => a.status === 'pending').length} Pendientes`}
                  sx={{ backgroundColor: '#FF9800', color: '#FFFFFF' }}
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </TabPanel>

      {/* Tab 2: Gestión de Asistencia */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" sx={{ mb: 2, color: '#FFFFFF' }}>
          Selecciona una actuación para gestionar la asistencia:
        </Typography>
        {performances.map((performance) => (
          <Card 
            key={performance.id} 
            sx={{ 
              mb: 2, 
              backgroundColor: '#1C1C1C', 
              border: '1px solid #333',
              cursor: 'pointer',
              '&:hover': { borderColor: '#8B0000' }
            }}
            onClick={() => {
              setSelectedPerformance(performance);
              setOpenAttendanceDialog(true);
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                {performance.titulo}
              </Typography>
              <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
                {formatDate(performance.fecha)} - {performance.lugar}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Chip
                  size="small"
                  label={`${performance.asistentes.filter(a => a.status === 'confirmed').length} confirmados`}
                  sx={{ backgroundColor: '#4CAF50', color: '#FFFFFF' }}
                />
                <Chip
                  size="small"
                  label={`${performance.asistentes.filter(a => a.status === 'pending').length} pendientes`}
                  sx={{ backgroundColor: '#FF9800', color: '#FFFFFF' }}
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </TabPanel>

      {/* Tab 3: Estado de Autobuses */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" sx={{ mb: 2, color: '#FFFFFF' }}>
          Estado General de Autobuses
        </Typography>
        {performances.filter(p => p.requiereAutobus).map((performance) => (
          <Card key={performance.id} sx={{ mb: 2, backgroundColor: '#1C1C1C', border: '1px solid #333' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
                {performance.titulo} - {formatDate(performance.fecha)}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Alert 
                  severity={performance.autobuses.bus55.ocupados >= 50 ? 'warning' : 'info'}
                  sx={{ backgroundColor: '#2C2C2C', color: '#FFFFFF', flex: 1, minWidth: 300 }}
                >
                  <Typography variant="subtitle2">
                    Autobús 55 plazas: {performance.autobuses.bus55.ocupados}/55
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getBusProgress(performance.autobuses.bus55.ocupados, 55)}
                    sx={{ 
                      mt: 1,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getBusColor(performance.autobuses.bus55.ocupados, 55)
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {performance.autobuses.bus55.ocupados >= 50 ? 'Casi completo' : 'Disponible'}
                  </Typography>
                </Alert>
                
                <Alert 
                  severity={performance.autobuses.bus70.ocupados >= 65 ? 'warning' : 'info'}
                  sx={{ backgroundColor: '#2C2C2C', color: '#FFFFFF', flex: 1, minWidth: 300 }}
                >
                  <Typography variant="subtitle2">
                    Autobús 70 plazas: {performance.autobuses.bus70.ocupados}/70
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getBusProgress(performance.autobuses.bus70.ocupados, 70)}
                    sx={{ 
                      mt: 1,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getBusColor(performance.autobuses.bus70.ocupados, 70)
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {performance.autobuses.bus70.ocupados >= 65 ? 'Casi completo' : 'Disponible'}
                  </Typography>
                </Alert>
              </Box>

              {/* Lista de pasajeros por bus */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ color: '#FFFFFF', mb: 1 }}>
                  Distribución de pasajeros:
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Paper sx={{ p: 2, backgroundColor: '#2C2C2C', flex: 1, minWidth: 250 }}>
                    <Typography variant="subtitle2" sx={{ color: '#4CAF50', mb: 1 }}>
                      Bus 55 plazas:
                    </Typography>
                    {performance.asistentes
                      .filter(a => a.status === 'confirmed' && a.busPreference === 'bus55')
                      .map(attendee => (
                        <Typography key={attendee.memberId} variant="body2" sx={{ color: '#FFFFFF' }}>
                          • {attendee.memberName}
                        </Typography>
                      ))}
                  </Paper>
                  <Paper sx={{ p: 2, backgroundColor: '#2C2C2C', flex: 1, minWidth: 250 }}>
                    <Typography variant="subtitle2" sx={{ color: '#2196F3', mb: 1 }}>
                      Bus 70 plazas:
                    </Typography>
                    {performance.asistentes
                      .filter(a => a.status === 'confirmed' && a.busPreference === 'bus70')
                      .map(attendee => (
                        <Typography key={attendee.memberId} variant="body2" sx={{ color: '#FFFFFF' }}>
                          • {attendee.memberName}
                        </Typography>
                      ))}
                  </Paper>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </TabPanel>

      {/* Dialog para crear/editar actuación */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { backgroundColor: '#1C1C1C', border: '1px solid #333' } }}
      >
        <DialogTitle sx={{ color: '#FFFFFF' }}>
          {selectedPerformance ? 'Editar Actuación' : 'Nueva Actuación'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Título"
              value={formData.titulo || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Fecha"
                type="date"
                value={formData.fecha ? formData.fecha.toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, fecha: new Date(e.target.value) }))}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <TextField
                label="Hora"
                type="time"
                value={formData.hora || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1, minWidth: 150 }}
              />
            </Box>
            <TextField
              label="Lugar"
              value={formData.lugar || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, lugar: e.target.value }))}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.requiereAutobus || false}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    requiereAutobus: e.target.checked,
                    autobuses: {
                      bus55: { capacidad: 55, ocupados: 0, pasajeros: [], activo: e.target.checked },
                      bus70: { capacidad: 70, ocupados: 0, pasajeros: [], activo: e.target.checked }
                    }
                  }))}
                />
              }
              label="Requiere Autobús"
              sx={{ color: '#FFFFFF' }}
            />
            <TextField
              label="Descripción"
              multiline
              rows={3}
              value={formData.descripcion || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#B0B0B0' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSavePerformance}
            variant="contained"
            sx={{ backgroundColor: '#8B0000', '&:hover': { backgroundColor: '#A00000' } }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para gestión de asistencia */}
      <Dialog
        open={openAttendanceDialog}
        onClose={() => setOpenAttendanceDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { backgroundColor: '#1C1C1C', border: '1px solid #333' } }}
      >
        <DialogTitle sx={{ color: '#FFFFFF' }}>
          Gestión de Asistencia - {selectedPerformance?.titulo}
        </DialogTitle>
        <DialogContent>
          {selectedPerformance && (
            <Box>
              {/* Resumen de autobuses */}
              {selectedPerformance.requiereAutobus && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
                    Estado de Autobuses
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Alert 
                      severity={selectedPerformance.autobuses.bus55.ocupados >= 50 ? 'warning' : 'info'}
                      sx={{ backgroundColor: '#2C2C2C', color: '#FFFFFF', flex: 1, minWidth: 300 }}
                    >
                      <Typography variant="subtitle2">
                        Autobús 55 plazas: {selectedPerformance.autobuses.bus55.ocupados}/55
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={getBusProgress(selectedPerformance.autobuses.bus55.ocupados, 55)}
                        sx={{ mt: 1 }}
                      />
                    </Alert>
                    <Alert 
                      severity={selectedPerformance.autobuses.bus70.ocupados >= 65 ? 'warning' : 'info'}
                      sx={{ backgroundColor: '#2C2C2C', color: '#FFFFFF', flex: 1, minWidth: 300 }}
                    >
                      <Typography variant="subtitle2">
                        Autobús 70 plazas: {selectedPerformance.autobuses.bus70.ocupados}/70
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={getBusProgress(selectedPerformance.autobuses.bus70.ocupados, 70)}
                        sx={{ mt: 1 }}
                      />
                    </Alert>
                  </Box>
                </Box>
              )}

              {/* Lista de miembros */}
              <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2 }}>
                Confirmación de Asistencia
              </Typography>
              <List>
                {members.filter(m => m.activo).map((member) => {
                  const attendance = selectedPerformance.asistentes.find(a => a.memberId === member.id);
                  return (
                    <ListItem 
                      key={member.id}
                      sx={{ 
                        backgroundColor: '#2C2C2C', 
                        mb: 1, 
                        borderRadius: 1,
                        border: `1px solid ${
                          attendance?.status === 'confirmed' ? '#4CAF50' :
                          attendance?.status === 'declined' ? '#F44336' :
                          '#333'
                        }`
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: '#8B0000' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${member.nombre} ${member.apellidos}`}
                        secondary={`${member.instrumento} • Estado: ${
                          attendance?.status === 'confirmed' ? 'Confirmado' :
                          attendance?.status === 'declined' ? 'No asiste' :
                          'Pendiente'
                        }`}
                        sx={{
                          '& .MuiListItemText-primary': { color: '#FFFFFF' },
                          '& .MuiListItemText-secondary': { color: '#B0B0B0' }
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {selectedPerformance.requiereAutobus && attendance?.status === 'confirmed' && (
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel sx={{ color: '#B0B0B0' }}>Autobús</InputLabel>
                            <Select
                              value={attendance?.busPreference || 'none'}
                              onChange={(e) => handleAttendanceChange(
                                selectedPerformance.id,
                                member.id,
                                'confirmed',
                                e.target.value as 'bus55' | 'bus70' | 'none'
                              )}
                              label="Autobús"
                              sx={{ color: '#FFFFFF' }}
                            >
                              <MenuItem value="none">No necesita</MenuItem>
                              <MenuItem value="bus55">Bus 55 plazas</MenuItem>
                              <MenuItem value="bus70">Bus 70 plazas</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                        <IconButton
                          onClick={() => handleAttendanceChange(selectedPerformance.id, member.id, 'confirmed')}
                          sx={{ 
                            color: attendance?.status === 'confirmed' ? '#4CAF50' : '#666',
                            backgroundColor: attendance?.status === 'confirmed' ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
                          }}
                        >
                          <CheckIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleAttendanceChange(selectedPerformance.id, member.id, 'declined')}
                          sx={{ 
                            color: attendance?.status === 'declined' ? '#F44336' : '#666',
                            backgroundColor: attendance?.status === 'declined' ? 'rgba(244, 67, 54, 0.1)' : 'transparent'
                          }}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAttendanceDialog(false)} sx={{ color: '#B0B0B0' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PerformancesPageAdvanced;

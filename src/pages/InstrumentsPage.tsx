import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
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
  Switch,
  FormControlLabel,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MusicNote as MusicIcon,
} from '@mui/icons-material';
import type { Instrument, Voice, InstrumentCategory } from '../types/instruments';
import { InstrumentCategory as Categories, VoiceDifficulty } from '../types/instruments';
import { instrumentsService, voicesService } from '../services/instrumentsService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const InstrumentsPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Estados para diálogos
  const [instrumentDialog, setInstrumentDialog] = useState(false);
  const [voiceDialog, setVoiceDialog] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<Instrument | null>(null);
  const [editingVoice, setEditingVoice] = useState<Voice | null>(null);
  
  // Estados para formularios
  const [instrumentForm, setInstrumentForm] = useState({
    name: '',
    category: Categories.VIENTO_METAL as InstrumentCategory,
    description: '',
    hasVoices: false,
  });
  
  const [voiceForm, setVoiceForm] = useState({
    instrumentId: '',
    voiceName: '',
    difficulty: VoiceDifficulty.INTERMEDIATE as any,
    description: '',
  });

  // Cargar datos al inicializar
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Inicializar instrumentos por defecto si no existen
      await instrumentsService.initializeDefaultInstruments();
      
      // Cargar instrumentos y voces
      const [instrumentsData, voicesData] = await Promise.all([
        instrumentsService.getAll(),
        voicesService.getAll()
      ]);
      
      setInstruments(instrumentsData);
      setVoices(voicesData);
    } catch (err) {
      setError('Error al cargar los datos: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Manejar instrumentos
  const handleCreateInstrument = () => {
    setEditingInstrument(null);
    setInstrumentForm({
      name: '',
      category: Categories.VIENTO_METAL,
      description: '',
      hasVoices: false,
    });
    setInstrumentDialog(true);
  };

  const handleEditInstrument = (instrument: Instrument) => {
    setEditingInstrument(instrument);
    setInstrumentForm({
      name: instrument.name,
      category: instrument.category,
      description: instrument.description || '',
      hasVoices: instrument.hasVoices,
    });
    setInstrumentDialog(true);
  };

  const handleSaveInstrument = async () => {
    try {
      if (editingInstrument) {
        await instrumentsService.update(editingInstrument.id, instrumentForm);
      } else {
        await instrumentsService.create(instrumentForm);
      }
      await loadData();
      setInstrumentDialog(false);
    } catch (err) {
      setError('Error al guardar instrumento: ' + (err as Error).message);
    }
  };

  const handleDeleteInstrument = async (instrument: Instrument) => {
    if (window.confirm(`¿Estás seguro de eliminar el instrumento "${instrument.name}"?`)) {
      try {
        await instrumentsService.delete(instrument.id);
        await loadData();
      } catch (err) {
        setError('Error al eliminar instrumento: ' + (err as Error).message);
      }
    }
  };

  // Manejar voces
  const handleCreateVoice = () => {
    setEditingVoice(null);
    setVoiceForm({
      instrumentId: '',
      voiceName: '',
      difficulty: VoiceDifficulty.INTERMEDIATE as any,
      description: '',
    });
    setVoiceDialog(true);
  };

  const handleEditVoice = (voice: Voice) => {
    setEditingVoice(voice);
    setVoiceForm({
      instrumentId: voice.instrumentId,
      voiceName: voice.voiceName,
      difficulty: voice.difficulty as any,
      description: voice.description || '',
    });
    setVoiceDialog(true);
  };

  const handleSaveVoice = async () => {
    try {
      if (editingVoice) {
        await voicesService.update(editingVoice.id, voiceForm);
      } else {
        await voicesService.create(voiceForm);
      }
      await loadData();
      setVoiceDialog(false);
    } catch (err) {
      setError('Error al guardar voz: ' + (err as Error).message);
    }
  };

  const handleDeleteVoice = async (voice: Voice) => {
    if (window.confirm(`¿Estás seguro de eliminar la voz "${voice.voiceName}"?`)) {
      try {
        await voicesService.delete(voice.id);
        await loadData();
      } catch (err) {
        setError('Error al eliminar voz: ' + (err as Error).message);
      }
    }
  };

  const getInstrumentName = (instrumentId: string) => {
    const instrument = instruments.find(i => i.id === instrumentId);
    return instrument?.name || 'Desconocido';
  };

  const getCategoryColor = (category: InstrumentCategory) => {
    switch (category) {
      case Categories.VIENTO_METAL: return '#8B0000';
      case Categories.VIENTO_MADERA: return '#4CAF4F';
      case Categories.PERCUSION: return '#2196F3';
      case Categories.AUXILIARES: return '#FF9800';
      default: return '#757575';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case VoiceDifficulty.BEGINNER: return '#4CAF4F';
      case VoiceDifficulty.INTERMEDIATE: return '#FF9800';
      case VoiceDifficulty.ADVANCED: return '#FF5722';
      case VoiceDifficulty.PROFESSIONAL: return '#8B0000';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ color: '#8B0000' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <MusicIcon sx={{ color: '#8B0000', fontSize: 32, mr: 2 }} />
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
          Instrumentos y Voces
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper
        elevation={8}
        sx={{
          background: 'linear-gradient(145deg, rgba(28, 28, 28, 0.9) 0%, rgba(35, 35, 35, 0.85) 100%)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(139, 0, 0, 0.15)',
          borderRadius: 3,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: '1px solid rgba(139, 0, 0, 0.2)',
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-selected': {
                color: '#8B0000',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#8B0000',
            },
          }}
        >
          <Tab label="Instrumentos" />
          <Tab label="Voces" />
        </Tabs>

        {/* Panel de Instrumentos */}
        <TabPanel value={currentTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
              Gestión de Instrumentos
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateInstrument}
              sx={{
                background: 'linear-gradient(135deg, #8B0000 0%, #A00000 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #A00000 0%, #BB0000 100%)',
                },
              }}
            >
              Nuevo Instrumento
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Nombre</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Categoría</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Tiene Voces</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Descripción</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {instruments.map((instrument) => (
                  <TableRow key={instrument.id} sx={{ '&:hover': { backgroundColor: 'rgba(139, 0, 0, 0.05)' } }}>
                    <TableCell sx={{ color: '#FFFFFF' }}>{instrument.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={instrument.category.replace('_', ' ')}
                        size="small"
                        sx={{
                          backgroundColor: getCategoryColor(instrument.category),
                          color: '#FFFFFF',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>
                      {instrument.hasVoices ? 'Sí' : 'No'}
                    </TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {instrument.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleEditInstrument(instrument)}
                        sx={{ color: '#8B0000', mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleDeleteInstrument(instrument)}
                        sx={{ color: '#FF5722' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Panel de Voces */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
              Gestión de Voces
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateVoice}
              sx={{
                background: 'linear-gradient(135deg, #8B0000 0%, #A00000 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #A00000 0%, #BB0000 100%)',
                },
              }}
            >
              Nueva Voz
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Instrumento</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Voz</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Dificultad</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Descripción</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {voices.map((voice) => (
                  <TableRow key={voice.id} sx={{ '&:hover': { backgroundColor: 'rgba(139, 0, 0, 0.05)' } }}>
                    <TableCell sx={{ color: '#FFFFFF' }}>
                      {getInstrumentName(voice.instrumentId)}
                    </TableCell>
                    <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                      {voice.voiceName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={voice.difficulty}
                        size="small"
                        sx={{
                          backgroundColor: getDifficultyColor(voice.difficulty),
                          color: '#FFFFFF',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {voice.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleEditVoice(voice)}
                        sx={{ color: '#8B0000', mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleDeleteVoice(voice)}
                        sx={{ color: '#FF5722' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Diálogo para Instrumentos */}
      <Dialog
        open={instrumentDialog}
        onClose={() => setInstrumentDialog(false)}
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
          {editingInstrument ? 'Editar Instrumento' : 'Nuevo Instrumento'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre"
            value={instrumentForm.name}
            onChange={(e) => setInstrumentForm({ ...instrumentForm, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
            InputProps={{ sx: { color: '#FFFFFF' } }}
            InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Categoría</InputLabel>
            <Select
              value={instrumentForm.category}
              onChange={(e) => setInstrumentForm({ ...instrumentForm, category: e.target.value as InstrumentCategory })}
              sx={{ color: '#FFFFFF' }}
            >
              {Object.values(Categories).map((category) => (
                <MenuItem key={category} value={category}>
                  {category.replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Descripción"
            multiline
            rows={3}
            value={instrumentForm.description}
            onChange={(e) => setInstrumentForm({ ...instrumentForm, description: e.target.value })}
            sx={{ mb: 2 }}
            InputProps={{ sx: { color: '#FFFFFF' } }}
            InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={instrumentForm.hasVoices}
                onChange={(e) => setInstrumentForm({ ...instrumentForm, hasVoices: e.target.checked })}
                sx={{ color: '#8B0000' }}
              />
            }
            label="Tiene diferentes voces (1º, 2º, etc.)"
            sx={{ color: '#FFFFFF' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInstrumentDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveInstrument}
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

      {/* Diálogo para Voces */}
      <Dialog
        open={voiceDialog}
        onClose={() => setVoiceDialog(false)}
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
          {editingVoice ? 'Editar Voz' : 'Nueva Voz'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Instrumento</InputLabel>
            <Select
              value={voiceForm.instrumentId}
              onChange={(e) => setVoiceForm({ ...voiceForm, instrumentId: e.target.value })}
              sx={{ color: '#FFFFFF' }}
            >
              {instruments.filter(i => i.hasVoices).map((instrument) => (
                <MenuItem key={instrument.id} value={instrument.id}>
                  {instrument.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Nombre de la Voz"
            value={voiceForm.voiceName}
            onChange={(e) => setVoiceForm({ ...voiceForm, voiceName: e.target.value })}
            sx={{ mb: 2 }}
            InputProps={{ sx: { color: '#FFFFFF' } }}
            InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Dificultad</InputLabel>
            <Select
              value={voiceForm.difficulty}
              onChange={(e) => setVoiceForm({ ...voiceForm, difficulty: e.target.value as any })}
              sx={{ color: '#FFFFFF' }}
            >
              {Object.values(VoiceDifficulty).map((difficulty) => (
                <MenuItem key={difficulty} value={difficulty}>
                  {difficulty}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Descripción"
            multiline
            rows={3}
            value={voiceForm.description}
            onChange={(e) => setVoiceForm({ ...voiceForm, description: e.target.value })}
            InputProps={{ sx: { color: '#FFFFFF' } }}
            InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVoiceDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveVoice}
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
    </Box>
  );
};

export default InstrumentsPage;

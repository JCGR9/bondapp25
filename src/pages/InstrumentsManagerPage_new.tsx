import React, { useState } from 'react';
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
  Alert,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

// Importar los datos JSON
import instrumentsData from '../data/instruments.json';
import voicesData from '../data/voices.json';

interface Instrument {
  id: string;
  name: string;
  description?: string;
}

interface Voice {
  id: string;
  name: string;
  instrumentId: string;
  description?: string;
}

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

const InstrumentsManagerPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [instruments, setInstruments] = useState<Instrument[]>(instrumentsData);
  const [voices, setVoices] = useState<Voice[]>(voicesData);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Estados para diálogos
  const [instrumentDialog, setInstrumentDialog] = useState(false);
  const [voiceDialog, setVoiceDialog] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<Instrument | null>(null);
  const [editingVoice, setEditingVoice] = useState<Voice | null>(null);
  
  // Estados para formularios
  const [instrumentForm, setInstrumentForm] = useState({
    id: '',
    name: '',
    description: '',
  });
  
  const [voiceForm, setVoiceForm] = useState({
    id: '',
    name: '',
    instrumentId: '',
    description: '',
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
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

  // Manejar instrumentos
  const handleCreateInstrument = () => {
    setEditingInstrument(null);
    setInstrumentForm({
      id: '',
      name: '',
      description: '',
    });
    setInstrumentDialog(true);
  };

  const handleEditInstrument = (instrument: Instrument) => {
    setEditingInstrument(instrument);
    setInstrumentForm({
      id: instrument.id,
      name: instrument.name,
      description: instrument.description || '',
    });
    setInstrumentDialog(true);
  };

  const handleSaveInstrument = () => {
    try {
      if (!instrumentForm.name.trim()) {
        showError('El nombre del instrumento es obligatorio');
        return;
      }

      const id = instrumentForm.id || instrumentForm.name.toLowerCase().replace(/\s+/g, '_');
      const newInstrument = { ...instrumentForm, id };

      if (editingInstrument) {
        const index = instruments.findIndex(i => i.id === editingInstrument.id);
        const updated = [...instruments];
        updated[index] = newInstrument;
        setInstruments(updated);
        showSuccess('Instrumento actualizado correctamente');
      } else {
        if (instruments.find(i => i.id === id)) {
          showError('Ya existe un instrumento con ese ID');
          return;
        }
        setInstruments([...instruments, newInstrument]);
        showSuccess('Instrumento creado correctamente');
      }
      setInstrumentDialog(false);
    } catch (err) {
      showError('Error al guardar instrumento');
    }
  };

  const handleDeleteInstrument = (instrument: Instrument) => {
    if (window.confirm(`¿Estás seguro de eliminar el instrumento "${instrument.name}"?`)) {
      // Eliminar instrumento
      setInstruments(instruments.filter(i => i.id !== instrument.id));
      // Eliminar voces relacionadas
      setVoices(voices.filter(v => v.instrumentId !== instrument.id));
      showSuccess('Instrumento eliminado correctamente');
    }
  };

  // Manejar voces
  const handleCreateVoice = () => {
    setEditingVoice(null);
    setVoiceForm({
      id: '',
      name: '',
      instrumentId: '',
      description: '',
    });
    setVoiceDialog(true);
  };

  const handleEditVoice = (voice: Voice) => {
    setEditingVoice(voice);
    setVoiceForm({
      id: voice.id,
      name: voice.name,
      instrumentId: voice.instrumentId,
      description: voice.description || '',
    });
    setVoiceDialog(true);
  };

  const handleSaveVoice = () => {
    try {
      if (!voiceForm.instrumentId || !voiceForm.name.trim()) {
        showError('El instrumento y nombre de voz son obligatorios');
        return;
      }

      const id = voiceForm.id || `${voiceForm.instrumentId}_${voiceForm.name.toLowerCase().replace(/\s+/g, '_')}`;
      const newVoice = { ...voiceForm, id };

      if (editingVoice) {
        const index = voices.findIndex(v => v.id === editingVoice.id);
        const updated = [...voices];
        updated[index] = newVoice;
        setVoices(updated);
        showSuccess('Voz actualizada correctamente');
      } else {
        if (voices.find(v => v.id === id)) {
          showError('Ya existe una voz con ese ID');
          return;
        }
        setVoices([...voices, newVoice]);
        showSuccess('Voz creada correctamente');
      }
      setVoiceDialog(false);
    } catch (err) {
      showError('Error al guardar voz');
    }
  };

  const handleDeleteVoice = (voice: Voice) => {
    if (window.confirm(`¿Estás seguro de eliminar la voz "${voice.name}"?`)) {
      setVoices(voices.filter(v => v.id !== voice.id));
      showSuccess('Voz eliminada correctamente');
    }
  };

  const getInstrumentName = (instrumentId: string) => {
    const instrument = instruments.find(i => i.id === instrumentId);
    return instrument?.name || 'Desconocido';
  };

  const exportData = () => {
    const data = {
      instruments,
      voices,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'instruments-voices-data.json';
    a.click();
    URL.revokeObjectURL(url);
    showSuccess('Datos exportados correctamente');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SettingsIcon sx={{ color: '#8B0000', fontSize: 32, mr: 2 }} />
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
            Gestión de Instrumentos y Voces
          </Typography>
        </Box>
        
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
          <strong>Instrumentos:</strong> Objetos físicos (Trompeta, Trombón, etc.) para el inventario.<br/>
          <strong>Voces:</strong> Roles musicales específicos (Trompeta 1º, Trompeta 2º, Tuba, etc.) para asignar a los componentes.
        </Typography>
      </Alert>

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
          <Tab label={`Instrumentos (${instruments.length})`} />
          <Tab label={`Voces (${voices.length})`} />
        </Tabs>

        {/* Panel de Instrumentos */}
        <TabPanel value={currentTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
              Instrumentos Físicos - Para Inventario
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
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Nombre</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Descripción</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Voces Relacionadas</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {instruments.map((instrument) => (
                  <TableRow key={instrument.id} sx={{ '&:hover': { backgroundColor: 'rgba(139, 0, 0, 0.05)' } }}>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'monospace' }}>
                      {instrument.id}
                    </TableCell>
                    <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>{instrument.name}</TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {instrument.description || '-'}
                    </TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {voices.filter(v => v.instrumentId === instrument.id).length} voces
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditInstrument(instrument)}
                        sx={{ color: '#8B0000', mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteInstrument(instrument)}
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
        </TabPanel>

        {/* Panel de Voces */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
              Voces Musicales - Para Componentes
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
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>ID</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Voz Musical</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Instrumento Base</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Descripción</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {voices.map((voice) => (
                  <TableRow key={voice.id} sx={{ '&:hover': { backgroundColor: 'rgba(139, 0, 0, 0.05)' } }}>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'monospace' }}>
                      {voice.id}
                    </TableCell>
                    <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                      {voice.name}
                    </TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>
                      {getInstrumentName(voice.instrumentId)}
                    </TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {voice.description || '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditVoice(voice)}
                        sx={{ color: '#8B0000', mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteVoice(voice)}
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

          <TextField
            fullWidth
            label="Descripción"
            multiline
            rows={3}
            value={instrumentForm.description}
            onChange={(e) => setInstrumentForm({ ...instrumentForm, description: e.target.value })}
            InputProps={{ sx: { color: '#FFFFFF' } }}
            InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
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
          <TextField
            fullWidth
            label="Nombre de la Voz Musical"
            value={voiceForm.name}
            onChange={(e) => setVoiceForm({ ...voiceForm, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
            placeholder="Ej: Trompeta 1º, Tuba, Bombo..."
            InputProps={{ sx: { color: '#FFFFFF' } }}
            InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Instrumento Base</InputLabel>
            <Select
              value={voiceForm.instrumentId}
              onChange={(e) => setVoiceForm({ ...voiceForm, instrumentId: e.target.value })}
              sx={{ color: '#FFFFFF' }}
            >
              {instruments.map((instrument) => (
                <MenuItem key={instrument.id} value={instrument.id}>
                  {instrument.name}
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

export default InstrumentsManagerPage;

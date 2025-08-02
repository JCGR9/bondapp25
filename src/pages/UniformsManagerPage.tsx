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
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Checkroom as CheckroomIcon,
  Save as SaveIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';

// Importar los datos JSON
import galaUniformsData from '../data/uniforms_gala.json';
import beduinoUniformsData from '../data/uniforms_beduino.json';

interface UniformItem {
  id: string;
  name: string;
  type: 'gala' | 'beduino';
  category: 'superior' | 'inferior' | 'interior' | 'exterior' | 'cabeza' | 'calzado' | 'complemento';
  description?: string;
  color: string;
  material: string;
  required: boolean;
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

const UniformsManagerPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [galaUniforms, setGalaUniforms] = useState<UniformItem[]>(galaUniformsData as UniformItem[]);
  const [beduinoUniforms, setBeduinoUniforms] = useState<UniformItem[]>(beduinoUniformsData as UniformItem[]);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Estados para diálogos
  const [uniformDialog, setUniformDialog] = useState(false);
  const [editingUniform, setEditingUniform] = useState<UniformItem | null>(null);
  const [currentUniformType, setCurrentUniformType] = useState<'gala' | 'beduino'>('gala');
  
  // Estados para formularios
  const [uniformForm, setUniformForm] = useState({
    id: '',
    name: '',
    type: 'gala' as 'gala' | 'beduino',
    category: 'superior' as UniformItem['category'],
    description: '',
    color: '',
    material: '',
    required: true,
  });

  const categories = [
    { value: 'superior', label: 'Prenda Superior' },
    { value: 'inferior', label: 'Prenda Inferior' }, 
    { value: 'interior', label: 'Prenda Interior' },
    { value: 'exterior', label: 'Prenda Exterior' },
    { value: 'cabeza', label: 'Complemento de Cabeza' },
    { value: 'calzado', label: 'Calzado' },
    { value: 'complemento', label: 'Complemento' },
  ];

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setCurrentUniformType(newValue === 0 ? 'gala' : 'beduino');
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

  const getCurrentUniforms = () => {
    return currentTab === 0 ? galaUniforms : beduinoUniforms;
  };

  const setCurrentUniforms = (uniforms: UniformItem[]) => {
    if (currentTab === 0) {
      setGalaUniforms(uniforms);
    } else {
      setBeduinoUniforms(uniforms);
    }
  };

  // Manejar uniformes
  const handleCreateUniform = () => {
    setEditingUniform(null);
    setUniformForm({
      id: '',
      name: '',
      type: currentUniformType,
      category: 'superior',
      description: '',
      color: '',
      material: '',
      required: true,
    });
    setUniformDialog(true);
  };

  const handleEditUniform = (uniform: UniformItem) => {
    setEditingUniform(uniform);
    setUniformForm({
      id: uniform.id,
      name: uniform.name,
      type: uniform.type,
      category: uniform.category,
      description: uniform.description || '',
      color: uniform.color,
      material: uniform.material,
      required: uniform.required,
    });
    setUniformDialog(true);
  };

  const handleSaveUniform = () => {
    try {
      if (!uniformForm.name.trim()) {
        showError('El nombre de la prenda es obligatorio');
        return;
      }

      const id = uniformForm.id || uniformForm.name.toLowerCase().replace(/\s+/g, '_');
      const newUniform = { ...uniformForm, id };

      const currentUniforms = getCurrentUniforms();

      if (editingUniform) {
        const index = currentUniforms.findIndex(u => u.id === editingUniform.id);
        const updated = [...currentUniforms];
        updated[index] = newUniform;
        setCurrentUniforms(updated);
        showSuccess('Prenda actualizada correctamente');
      } else {
        if (currentUniforms.find(u => u.id === id)) {
          showError('Ya existe una prenda con ese ID');
          return;
        }
        setCurrentUniforms([...currentUniforms, newUniform]);
        showSuccess('Prenda creada correctamente');
      }
      setUniformDialog(false);
    } catch (err) {
      showError('Error al guardar prenda');
    }
  };

  const handleDeleteUniform = (uniform: UniformItem) => {
    if (window.confirm(`¿Estás seguro de eliminar la prenda "${uniform.name}"?`)) {
      const currentUniforms = getCurrentUniforms();
      setCurrentUniforms(currentUniforms.filter(u => u.id !== uniform.id));
      showSuccess('Prenda eliminada correctamente');
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'gala': return '#1a237e'; // Azul marino
      case 'beduino': return '#d32f2f'; // Rojo llamativo
      default: return '#757575';
    }
  };

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'gala': return 'Uniforme de Gala';
      case 'beduino': return 'Uniforme de Beduino';
      default: return type;
    }
  };

  const exportData = () => {
    const data = {
      galaUniforms,
      beduinoUniforms,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uniforms-data.json';
    a.click();
    URL.revokeObjectURL(url);
    showSuccess('Datos exportados correctamente');
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CheckroomIcon sx={{ color: '#8B0000', fontSize: 32, mr: 2 }} />
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
            Gestión de Uniformidad
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
          <strong>Uniforme de Gala:</strong> Vestimenta ceremonial para actuaciones formales y eventos importantes.<br/>
          <strong>Uniforme Beduino:</strong> Vestimenta tradicional para actuaciones temáticas y eventos especiales.<br/>
          <em>Las tallas específicas se gestionarán en el módulo de inventario.</em>
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
          <Tab 
            label={`Uniforme de Gala (${galaUniforms.length})`} 
            icon={<PaletteIcon />}
          />
          <Tab 
            label={`Uniforme Beduino (${beduinoUniforms.length})`} 
            icon={<CheckroomIcon />}
          />
        </Tabs>

        {/* Panel de Uniforme de Gala */}
        <TabPanel value={currentTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
              Prendas del Uniforme de Gala
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateUniform}
              sx={{
                background: 'linear-gradient(135deg, #8B0000 0%, #A00000 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #A00000 0%, #BB0000 100%)',
                },
              }}
            >
              Nueva Prenda
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Prenda</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Categoría</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Color</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Material</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Obligatorio</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {galaUniforms.map((uniform) => (
                  <TableRow key={uniform.id} sx={{ '&:hover': { backgroundColor: 'rgba(139, 0, 0, 0.05)' } }}>
                    <TableCell>
                      <Box>
                        <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                          {uniform.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {uniform.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getCategoryLabel(uniform.type)}
                        size="small"
                        sx={{
                          backgroundColor: getCategoryColor(uniform.type),
                          color: '#FFFFFF',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>
                      {uniform.color}
                    </TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {uniform.material}
                    </TableCell>
                    <TableCell>
                      {uniform.required ? (
                        <Chip label="Obligatorio" size="small" color="error" />
                      ) : (
                        <Chip label="Opcional" size="small" color="default" />
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditUniform(uniform)}
                        sx={{ color: '#8B0000', mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUniform(uniform)}
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

        {/* Panel de Uniforme Beduino */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
              Prendas del Uniforme Beduino
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateUniform}
              sx={{
                background: 'linear-gradient(135deg, #8B0000 0%, #A00000 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #A00000 0%, #BB0000 100%)',
                },
              }}
            >
              Nueva Prenda
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Prenda</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Categoría</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Color</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Material</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Obligatorio</TableCell>
                  <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {beduinoUniforms.map((uniform) => (
                  <TableRow key={uniform.id} sx={{ '&:hover': { backgroundColor: 'rgba(139, 0, 0, 0.05)' } }}>
                    <TableCell>
                      <Box>
                        <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                          {uniform.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {uniform.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getCategoryLabel(uniform.type)}
                        size="small"
                        sx={{
                          backgroundColor: getCategoryColor(uniform.type),
                          color: '#FFFFFF',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>
                      {uniform.color}
                    </TableCell>
                    <TableCell sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {uniform.material}
                    </TableCell>
                    <TableCell>
                      {uniform.required ? (
                        <Chip label="Obligatorio" size="small" color="error" />
                      ) : (
                        <Chip label="Opcional" size="small" color="default" />
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleEditUniform(uniform)}
                        sx={{ color: '#8B0000', mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUniform(uniform)}
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

      {/* Diálogo para Prendas */}
      <Dialog
        open={uniformDialog}
        onClose={() => setUniformDialog(false)}
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
          {editingUniform ? 'Editar Prenda' : 'Nueva Prenda'} - {currentUniformType === 'gala' ? 'Uniforme de Gala' : 'Uniforme Beduino'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Nombre de la Prenda"
              value={uniformForm.name}
              onChange={(e) => setUniformForm({ ...uniformForm, name: e.target.value })}
              InputProps={{ sx: { color: '#FFFFFF' } }}
              InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Categoría</InputLabel>
              <Select
                value={uniformForm.category}
                onChange={(e) => setUniformForm({ ...uniformForm, category: e.target.value as UniformItem['category'] })}
                sx={{ color: '#FFFFFF' }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Color"
              value={uniformForm.color}
              onChange={(e) => setUniformForm({ ...uniformForm, color: e.target.value })}
              InputProps={{ sx: { color: '#FFFFFF' } }}
              InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
            />

            <TextField
              fullWidth
              label="Material"
              value={uniformForm.material}
              onChange={(e) => setUniformForm({ ...uniformForm, material: e.target.value })}
              InputProps={{ sx: { color: '#FFFFFF' } }}
              InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
            />

            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={2}
              value={uniformForm.description}
              onChange={(e) => setUniformForm({ ...uniformForm, description: e.target.value })}
              InputProps={{ sx: { color: '#FFFFFF' } }}
              InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={uniformForm.required}
                  onChange={(e) => setUniformForm({ ...uniformForm, required: e.target.checked })}
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
              label="Prenda obligatoria"
              sx={{ color: '#FFFFFF' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUniformDialog(false)} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveUniform}
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

export default UniformsManagerPage;

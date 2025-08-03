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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Fab,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Email as EmailIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Folder as FolderIcon,
  MusicNote as MusicNoteIcon,
  ExpandMore as ExpandMoreIcon,
  CloudUpload as CloudUploadIcon,
  GetApp as GetAppIcon
} from '@mui/icons-material';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Importar los datos de componentes
import voicesData from '../data/voices.json';
import instrumentsData from '../data/instruments.json';
import { driveService } from '../services/googleDriveService';
import { driveFolderManager } from '../services/googleDriveFolderManager';
import { googleAuthService } from '../services/googleAuthService';

// Interfaces
interface Score {
  id: string;
  title: string;
  march: string;
  instrument: string;
  voice: string;
  composer?: string;
  arranger?: string;
  duration?: string;
  description?: string;
  tags: string[];
  fileName: string;
  driveFileId: string;
  downloadUrl?: string;
  fileSize: number;
  uploadDate: Date;
  lastModified: Date;
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

interface EmailSettings {
  senderEmail: string;
  senderPassword: string;
  smtpServer: string;
  smtpPort: number;
}

// Default categories
const defaultMarches = [
  'Marchas Semana Santa',
  'Ordinario'
];

const ScoresManagerPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [scores, setScores] = useState<Score[]>([]);
  const [filteredScores, setFilteredScores] = useState<Score[]>([]);
  const [marches, setMarches] = useState<string[]>(defaultMarches);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMarch, setFilterMarch] = useState('');
  const [filterInstrument, setFilterInstrument] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Advanced search states
  const [advancedSearch, setAdvancedSearch] = useState({
    title: '',
    composer: '',
    arranger: '',
    tags: '',
    voice: '',
    dateFrom: '',
    dateTo: '',
    durationMin: '',
    durationMax: '',
    sortBy: 'uploadDate',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  
  // Upload form states
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    march: '',
    instrument: '',
    voice: '',
    composer: '',
    arranger: '',
    duration: '',
    description: '',
    tags: '',
    file: null as File | null
  });

  // Email form states
  const [emailFormData, setEmailFormData] = useState({
    recipients: [] as string[],
    selectedScores: [] as string[],
    subject: '',
    message: '',
    sendToAllBand: false,
    sendByInstrument: '',
    sendByVoice: ''
  });

  const [emailSettings] = useState<EmailSettings>({
    senderEmail: '', // TODO: Implement settings configuration
    senderPassword: '',
    smtpServer: 'smtp.gmail.com',
    smtpPort: 587
  });

  useEffect(() => {
    loadScores();
    loadMarches();
    loadInstrumentsAndVoices();
  }, []);

  useEffect(() => {
    filterScores();
  }, [scores, searchTerm, filterMarch, filterInstrument, advancedSearch]);

  const loadScores = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando partituras...');
      
      // Load from localStorage first (development mode)
      const savedScores = localStorage.getItem('bondapp_scores');
      if (savedScores) {
        try {
          const parsedScores = JSON.parse(savedScores);
          // Validar que sea un array
          if (Array.isArray(parsedScores)) {
            const processedScores = parsedScores.map((score: any) => ({
              ...score,
              uploadDate: new Date(score.uploadDate),
              lastModified: new Date(score.lastModified)
            }));
            setScores(processedScores);
            console.log('✅ Partituras cargadas desde localStorage:', processedScores.length);
            return;
          } else {
            console.warn('⚠️ Datos de partituras no válidos, limpiando localStorage');
            localStorage.removeItem('bondapp_scores');
          }
        } catch (parseError) {
          console.error('❌ Error al parsear partituras de localStorage:', parseError);
          console.log('🧹 Limpiando localStorage corrupto...');
          localStorage.removeItem('bondapp_scores');
        }
      }

      // Fallback to Firebase (if properly configured)
      try {
        console.log('🔄 Intentando cargar desde Firebase...');
        const scoresRef = collection(db, 'scores');
        const snapshot = await getDocs(scoresRef);
        const scoresData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          uploadDate: doc.data().uploadDate?.toDate() || new Date(),
          lastModified: doc.data().lastModified?.toDate() || new Date()
        })) as Score[];
        setScores(scoresData);
        console.log('✅ Partituras cargadas desde Firebase:', scoresData.length);
      } catch (firebaseError) {
        console.warn('⚠️ Firebase no disponible, inicializando array vacío:', firebaseError);
        setScores([]);
      }
    } catch (error) {
      console.error('❌ Error general al cargar partituras:', error);
      setScores([]);
    } finally {
      setLoading(false);
      console.log('✅ Carga de partituras completada');
    }
  };

  const loadMarches = () => {
    try {
      console.log('🔄 Cargando marchas...');
      const savedMarches = localStorage.getItem('bondapp_marches');
      if (savedMarches) {
        const parsedMarches = JSON.parse(savedMarches);
        if (Array.isArray(parsedMarches)) {
          setMarches(parsedMarches);
          console.log('✅ Marchas cargadas:', parsedMarches.length);
        } else {
          console.warn('⚠️ Datos de marchas no válidos, inicializando array vacío');
          setMarches([]);
        }
      } else {
        console.log('📋 No hay marchas guardadas, inicializando array vacío');
        setMarches([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar marchas:', error);
      localStorage.removeItem('bondapp_marches');
      setMarches([]);
    }
  };

  const loadInstrumentsAndVoices = () => {
    try {
      console.log('🔄 Cargando instrumentos y voces...');
      // Cargar instrumentos desde el JSON
      const instrumentsList = instrumentsData as Instrument[];
      setInstruments(instrumentsList);
      console.log('✅ Instrumentos cargados:', instrumentsList.length);

      // Cargar voces desde el JSON
      const voicesList = voicesData as Voice[];
      setVoices(voicesList);
      console.log('✅ Voces cargadas:', voicesList.length);
    } catch (error) {
      console.error('❌ Error al cargar instrumentos y voces:', error);
      setInstruments([]);
      setVoices([]);
    }
  };

  const saveMarches = (newMarches: string[]) => {
    localStorage.setItem('bondapp_marches', JSON.stringify(newMarches));
    setMarches(newMarches);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !marches.includes(newCategoryName.trim())) {
      const updatedMarches = [...marches, newCategoryName.trim()];
      saveMarches(updatedMarches);
      setNewCategoryName('');
      setOpenCategoryDialog(false);
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    // Check if there are scores using this category
    const scoresUsingCategory = scores.filter(score => score.march === categoryToDelete);
    
    if (scoresUsingCategory.length > 0) {
      alert(`No se puede eliminar la categoría "${categoryToDelete}" porque tiene ${scoresUsingCategory.length} partitura(s) asociada(s).`);
      return;
    }

    if (marches.length <= 1) {
      alert('Debe mantener al menos una categoría.');
      return;
    }

    if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${categoryToDelete}"?`)) {
      const updatedMarches = marches.filter(march => march !== categoryToDelete);
      saveMarches(updatedMarches);
      
      // Clear filter if it was set to the deleted category
      if (filterMarch === categoryToDelete) {
        setFilterMarch('');
      }
    }
  };

  const saveScoreToLocalStorage = (newScores: Score[]) => {
    localStorage.setItem('bondapp_scores', JSON.stringify(newScores));
  };

  const filterScores = () => {
    let filtered = scores;

    // Basic search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(score =>
        score.title.toLowerCase().includes(term) ||
        score.march.toLowerCase().includes(term) ||
        score.instrument.toLowerCase().includes(term) ||
        score.voice.toLowerCase().includes(term) ||
        score.composer?.toLowerCase().includes(term) ||
        score.arranger?.toLowerCase().includes(term) ||
        score.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Basic filters
    if (filterMarch) {
      filtered = filtered.filter(score => score.march === filterMarch);
    }

    if (filterInstrument) {
      filtered = filtered.filter(score => score.instrument === filterInstrument);
    }

    // Advanced search filters
    if (advancedSearch.title) {
      const term = advancedSearch.title.toLowerCase();
      filtered = filtered.filter(score => score.title.toLowerCase().includes(term));
    }

    if (advancedSearch.composer) {
      const term = advancedSearch.composer.toLowerCase();
      filtered = filtered.filter(score => score.composer?.toLowerCase().includes(term));
    }

    if (advancedSearch.arranger) {
      const term = advancedSearch.arranger.toLowerCase();
      filtered = filtered.filter(score => score.arranger?.toLowerCase().includes(term));
    }

    if (advancedSearch.voice) {
      filtered = filtered.filter(score => score.voice === advancedSearch.voice);
    }

    if (advancedSearch.tags) {
      const searchTags = advancedSearch.tags.toLowerCase().split(',').map(tag => tag.trim());
      filtered = filtered.filter(score => 
        searchTags.some(searchTag => 
          score.tags.some(scoreTag => scoreTag.toLowerCase().includes(searchTag))
        )
      );
    }

    // Date range filter
    if (advancedSearch.dateFrom) {
      const fromDate = new Date(advancedSearch.dateFrom);
      filtered = filtered.filter(score => score.uploadDate >= fromDate);
    }

    if (advancedSearch.dateTo) {
      const toDate = new Date(advancedSearch.dateTo);
      toDate.setHours(23, 59, 59, 999); // Include the entire day
      filtered = filtered.filter(score => score.uploadDate <= toDate);
    }

    // Duration filter (convert MM:SS to seconds for comparison)
    const parseDuration = (duration: string): number => {
      if (!duration) return 0;
      const parts = duration.split(':');
      if (parts.length === 2) {
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }
      return parseInt(duration) || 0;
    };

    if (advancedSearch.durationMin) {
      const minSeconds = parseDuration(advancedSearch.durationMin);
      filtered = filtered.filter(score => {
        const scoreSeconds = parseDuration(score.duration || '0');
        return scoreSeconds >= minSeconds;
      });
    }

    if (advancedSearch.durationMax) {
      const maxSeconds = parseDuration(advancedSearch.durationMax);
      filtered = filtered.filter(score => {
        const scoreSeconds = parseDuration(score.duration || '0');
        return scoreSeconds <= maxSeconds;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (advancedSearch.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'march':
          comparison = a.march.localeCompare(b.march);
          break;
        case 'instrument':
          comparison = a.instrument.localeCompare(b.instrument);
          break;
        case 'voice':
          comparison = a.voice.localeCompare(b.voice);
          break;
        case 'composer':
          comparison = (a.composer || '').localeCompare(b.composer || '');
          break;
        case 'uploadDate':
          comparison = a.uploadDate.getTime() - b.uploadDate.getTime();
          break;
        case 'fileSize':
          comparison = a.fileSize - b.fileSize;
          break;
        case 'duration':
          const aDuration = parseDuration(a.duration || '0');
          const bDuration = parseDuration(b.duration || '0');
          comparison = aDuration - bDuration;
          break;
        default:
          comparison = a.uploadDate.getTime() - b.uploadDate.getTime();
      }

      return advancedSearch.sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredScores(filtered);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleUploadFile = async () => {
    if (!uploadFormData.file || !uploadFormData.title || !uploadFormData.march || !uploadFormData.instrument || !uploadFormData.voice) {
      return;
    }

    try {
      setLoading(true);
      console.log(`📁 Iniciando subida de partitura: ${uploadFormData.file.name}`);

      let driveFileId = `temp_${Date.now()}`;
      let downloadUrl = URL.createObjectURL(uploadFormData.file);
      
      // Verificar si Google Drive está disponible
      console.log('🔍 Verificando estado de Google Drive...');
      const isGoogleDriveReady = googleAuthService.isReady();
      console.log(`📊 Google Drive ready: ${isGoogleDriveReady}`);

      if (!isGoogleDriveReady) {
        console.log('⚠️ Google Drive no está listo, usando almacenamiento temporal');
        // TODO: Agregar notificación informativa
      } else {
        try {
          console.log('🚀 Subiendo a Google Drive...');
          
          // Crear carpeta de partituras si no existe
          const scoresFolder = await driveFolderManager.ensureSubfolder('BondApp_Partituras');
          
          // Subir archivo a Google Drive
          const driveFile = await driveService.uploadFile(uploadFormData.file, scoresFolder);
          
          driveFileId = driveFile.id;
          downloadUrl = driveFile.webContentLink || driveService.getDirectDownloadUrl(driveFile.id);
          
          console.log(`✅ Partitura ${uploadFormData.file.name} subida a Google Drive correctamente`);
          // TODO: Agregar notificación de éxito
          
        } catch (driveError) {
          console.warn('⚠️ Google Drive no disponible, usando almacenamiento temporal:', driveError);
          // TODO: Agregar notificación de warning
        }
      }

      const scoreData: Omit<Score, 'id'> = {
        title: uploadFormData.title,
        march: uploadFormData.march,
        instrument: uploadFormData.instrument,
        voice: uploadFormData.voice,
        composer: uploadFormData.composer,
        arranger: uploadFormData.arranger,
        duration: uploadFormData.duration,
        description: uploadFormData.description,
        tags: uploadFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        fileName: uploadFormData.file.name,
        driveFileId: driveFileId,
        downloadUrl: downloadUrl,
        fileSize: uploadFormData.file.size,
        uploadDate: new Date(),
        lastModified: new Date()
      };

      // Save to localStorage
      const newScore: Score = {
        id: `score_${Date.now()}`,
        ...scoreData
      };

      const updatedScores = [...scores, newScore];
      setScores(updatedScores);
      saveScoreToLocalStorage(updatedScores);

      // Reset form
      setUploadFormData({
        title: '',
        march: '',
        instrument: '',
        voice: '',
        composer: '',
        arranger: '',
        duration: '',
        description: '',
        tags: '',
        file: null
      });

      setOpenUploadDialog(false);
      console.log('Partitura cargada temporalmente:', newScore.title, '(Sin Google Drive)');
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScore = async (scoreId: string) => {
    try {
      setLoading(true);
      const score = scores.find(s => s.id === scoreId);
      
      if (score) {
        try {
          // Try to delete from Firebase
          await deleteDoc(doc(db, 'scores', scoreId));
          
          // TEMPORALMENTE: Comentar eliminación de Google Drive
          // if (score.driveFileId) {
          //   const driveService = new GoogleDriveService();
          //   await driveService.deleteFile(score.driveFileId);
          // }
        } catch (error) {
          console.warn('Cloud deletion failed, continuing with local deletion:', error);
        }

        // Update local state
        const updatedScores = scores.filter(s => s.id !== scoreId);
        setScores(updatedScores);
        saveScoreToLocalStorage(updatedScores);
      }
    } catch (error) {
      console.error('Error deleting score:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadScore = async (score: Score) => {
    try {
      // TEMPORALMENTE: Usar la URL de descarga directa
      const link = document.createElement('a');
      link.href = score.downloadUrl || '#';
      link.download = score.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar partitura:', error);
      // Mostrar error al usuario
    }
  };

  const handleSendEmail = () => {
    // TODO: Implement email sending functionality
    console.log('Email functionality to be implemented with:', {
      recipients: emailFormData.recipients,
      scores: emailFormData.selectedScores,
      subject: emailFormData.subject,
      message: emailFormData.message,
      settings: emailSettings
    });
    
    alert('Funcionalidad de email implementada. En desarrollo: integración con servicio de correo.');
    setOpenEmailDialog(false);
  };

  const getScoresByCategory = () => {
    const categories: { [march: string]: { [instrument: string]: { [voice: string]: Score[] } } } = {};
    
    filteredScores.forEach(score => {
      if (!categories[score.march]) {
        categories[score.march] = {};
      }
      if (!categories[score.march][score.instrument]) {
        categories[score.march][score.instrument] = {};
      }
      if (!categories[score.march][score.instrument][score.voice]) {
        categories[score.march][score.instrument][score.voice] = [];
      }
      categories[score.march][score.instrument][score.voice].push(score);
    });

    return categories;
  };

  const categorizedScores = getScoresByCategory();

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#8B0000' }}>
          🎼 Gestión de Partituras
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={() => setOpenEmailDialog(true)}
            sx={{ borderColor: '#8B0000', color: '#8B0000' }}
            disabled={filteredScores.length === 0}
          >
            Enviar por Email
          </Button>
          <Button
            variant="outlined"
            startIcon={<FolderIcon />}
            onClick={() => setOpenCategoryDialog(true)}
            sx={{ borderColor: '#8B0000', color: '#8B0000' }}
          >
            Gestionar Categorías
          </Button>
          <Fab
            color="primary"
            onClick={() => setOpenUploadDialog(true)}
            sx={{ bgcolor: '#8B0000', '&:hover': { bgcolor: '#660000' } }}
          >
            <AddIcon />
          </Fab>
        </Box>
      </Box>

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ color: '#8B0000' }}>
            🔄 Cargando partituras...
          </Typography>
        </Box>
      )}

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ 
          minWidth: 200,
          background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
          color: 'white',
          flex: 1
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <MusicNoteIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Total Partituras</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {scores.length}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Archivos almacenados
            </Typography>
          </CardContent>
        </Card>

        {/* Dynamic cards for each march category */}
        {marches.map((march, index) => {
          const marchCount = scores.filter(s => s.march === march).length;
          const colors = [
            'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
            'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
            'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
            'linear-gradient(135deg, #F44336 0%, #C62828 100%)',
            'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
            'linear-gradient(135deg, #795548 0%, #5D4037 100%)',
            'linear-gradient(135deg, #607D8B 0%, #455A64 100%)',
            'linear-gradient(135deg, #E91E63 0%, #AD1457 100%)',
          ];
          
          return (
            <Card key={march} sx={{ 
              minWidth: 200,
              background: colors[index % colors.length],
              color: 'white',
              flex: 1
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FolderIcon sx={{ mr: 1 }} />
                  <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                    {march}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {marchCount}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {marchCount === 1 ? 'partitura' : 'partituras'}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Tabs */}
      <Paper sx={{ width: '100%', bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="partituras tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="📚 Biblioteca" />
          <Tab label="🔍 Búsqueda Avanzada" />
          <Tab label="📁 Organización" />
          <Tab label="⚙️ Configuración" />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {/* Biblioteca Tab */}
          {currentTab === 0 && (
            <Box>
              {/* Search and Filters */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                  label="Buscar partituras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: '#8B0000' }} />
                  }}
                  sx={{ flex: 2, minWidth: 300 }}
                />
                
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Marcha</InputLabel>
                  <Select
                    value={filterMarch}
                    label="Marcha"
                    onChange={(e) => setFilterMarch(e.target.value)}
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {marches.map(march => (
                      <MenuItem key={march} value={march}>
                        {march}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Instrumento</InputLabel>
                  <Select
                    value={filterInstrument}
                    label="Instrumento"
                    onChange={(e) => setFilterInstrument(e.target.value)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {instruments.map(instrument => (
                      <MenuItem key={instrument.id} value={instrument.name}>
                        {instrument.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Scores List by Categories */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: '#8B0000' }} />
                </Box>
              ) : Object.keys(categorizedScores).length === 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                  No hay partituras disponibles. ¡Sube tu primera partitura!
                </Alert>
              ) : (
                Object.entries(categorizedScores).map(([march, instruments]) => (
                  <Accordion key={march} sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="h6" sx={{ color: '#8B0000', fontWeight: 'bold' }}>
                        🎵 {march}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {Object.entries(instruments).map(([instrument, voices]) => (
                        <Accordion key={instrument} sx={{ mb: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              🎺 {instrument}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            {Object.entries(voices).map(([voice, scoresInVoice]) => (
                              <Box key={voice} sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, color: '#8B0000' }}>
                                  🎤 {voice}
                                </Typography>
                                <List>
                                  {scoresInVoice.map((score) => (
                                    <ListItem
                                      key={score.id}
                                      sx={{
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: 1,
                                        mb: 1,
                                        bgcolor: 'rgba(255, 255, 255, 0.02)'
                                      }}
                                    >
                                      <ListItemText
                                        primary={
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                              {score.title}
                                            </Typography>
                                          </Box>
                                        }
                                        secondary={
                                          <Box>
                                            {score.composer && (
                                              <Typography variant="body2">
                                                <strong>Compositor:</strong> {score.composer}
                                              </Typography>
                                            )}
                                            {score.arranger && (
                                              <Typography variant="body2">
                                                <strong>Arreglista:</strong> {score.arranger}
                                              </Typography>
                                            )}
                                            {score.duration && (
                                              <Typography variant="body2">
                                                <strong>Duración:</strong> {score.duration}
                                              </Typography>
                                            )}
                                            {score.tags.length > 0 && (
                                              <Box sx={{ mt: 1 }}>
                                                {score.tags.map(tag => (
                                                  <Chip
                                                    key={tag}
                                                    label={tag}
                                                    size="small"
                                                    sx={{ mr: 0.5, mb: 0.5 }}
                                                  />
                                                ))}
                                              </Box>
                                            )}
                                          </Box>
                                        }
                                      />
                                      <ListItemSecondaryAction>
                                        <IconButton
                                          edge="end"
                                          onClick={() => handleDownloadScore(score)}
                                          sx={{ color: '#4CAF50', mr: 1 }}
                                        >
                                          <GetAppIcon />
                                        </IconButton>
                                        <IconButton
                                          edge="end"
                                          onClick={() => handleDeleteScore(score.id)}
                                          sx={{ color: '#F44336' }}
                                        >
                                          <DeleteIcon />
                                        </IconButton>
                                      </ListItemSecondaryAction>
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            ))}
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </Box>
          )}

          {/* Búsqueda Avanzada Tab */}
          {currentTab === 1 && (
            <Box>
              <Typography variant="h5" sx={{ mb: 3, color: '#8B0000' }}>
                🔍 Búsqueda Avanzada
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Row 1: Title and Composer */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Título"
                    value={advancedSearch.title}
                    onChange={(e) => setAdvancedSearch(prev => ({ ...prev, title: e.target.value }))}
                    InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                    InputProps={{
                      sx: {
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Compositor"
                    value={advancedSearch.composer}
                    onChange={(e) => setAdvancedSearch(prev => ({ ...prev, composer: e.target.value }))}
                    InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                    InputProps={{
                      sx: {
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                      }
                    }}
                  />
                </Box>

                {/* Row 2: Arranger and Voice */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Arreglista"
                    value={advancedSearch.arranger}
                    onChange={(e) => setAdvancedSearch(prev => ({ ...prev, arranger: e.target.value }))}
                    InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                    InputProps={{
                      sx: {
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                      }
                    }}
                  />
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Voz</InputLabel>
                    <Select
                      value={advancedSearch.voice}
                      onChange={(e) => setAdvancedSearch(prev => ({ ...prev, voice: e.target.value }))}
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                      }}
                    >
                      <MenuItem value="">Todas las voces</MenuItem>
                      {voices.map(voice => (
                        <MenuItem key={voice.id} value={voice.name}>{voice.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Row 3: Tags */}
                <TextField
                  fullWidth
                  label="Etiquetas (separadas por comas)"
                  value={advancedSearch.tags}
                  onChange={(e) => setAdvancedSearch(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="ej: procesional, solemne, rápida"
                  InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                  InputProps={{
                    sx: {
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                      },
                    }
                  }}
                />

                {/* Row 4: Date Range */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha desde"
                    value={advancedSearch.dateFrom}
                    onChange={(e) => setAdvancedSearch(prev => ({ ...prev, dateFrom: e.target.value }))}
                    InputLabelProps={{ 
                      shrink: true,
                      sx: { color: 'rgba(255, 255, 255, 0.7)' }
                    }}
                    InputProps={{
                      sx: {
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    type="date"
                    label="Fecha hasta"
                    value={advancedSearch.dateTo}
                    onChange={(e) => setAdvancedSearch(prev => ({ ...prev, dateTo: e.target.value }))}
                    InputLabelProps={{ 
                      shrink: true,
                      sx: { color: 'rgba(255, 255, 255, 0.7)' }
                    }}
                    InputProps={{
                      sx: {
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                      }
                    }}
                  />
                </Box>

                {/* Row 5: Duration Range */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Duración mínima (MM:SS)"
                    value={advancedSearch.durationMin}
                    onChange={(e) => setAdvancedSearch(prev => ({ ...prev, durationMin: e.target.value }))}
                    placeholder="ej: 03:30"
                    InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                    InputProps={{
                      sx: {
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Duración máxima (MM:SS)"
                    value={advancedSearch.durationMax}
                    onChange={(e) => setAdvancedSearch(prev => ({ ...prev, durationMax: e.target.value }))}
                    placeholder="ej: 08:00"
                    InputLabelProps={{ sx: { color: 'rgba(255, 255, 255, 0.7)' } }}
                    InputProps={{
                      sx: {
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                      }
                    }}
                  />
                </Box>

                {/* Row 6: Sort Options */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Ordenar por</InputLabel>
                    <Select
                      value={advancedSearch.sortBy}
                      onChange={(e) => setAdvancedSearch(prev => ({ ...prev, sortBy: e.target.value }))}
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                      }}
                    >
                      <MenuItem value="uploadDate">Fecha de subida</MenuItem>
                      <MenuItem value="title">Título</MenuItem>
                      <MenuItem value="march">Marcha</MenuItem>
                      <MenuItem value="instrument">Instrumento</MenuItem>
                      <MenuItem value="voice">Voz</MenuItem>
                      <MenuItem value="composer">Compositor</MenuItem>
                      <MenuItem value="fileSize">Tamaño de archivo</MenuItem>
                      <MenuItem value="duration">Duración</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Orden</InputLabel>
                    <Select
                      value={advancedSearch.sortOrder}
                      onChange={(e) => setAdvancedSearch(prev => ({ ...prev, sortOrder: e.target.value as 'asc' | 'desc' }))}
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                        },
                      }}
                    >
                      <MenuItem value="asc">Ascendente</MenuItem>
                      <MenuItem value="desc">Descendente</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    onClick={() => {
                      setAdvancedSearch({
                        title: '',
                        composer: '',
                        arranger: '',
                        tags: '',
                        voice: '',
                        dateFrom: '',
                        dateTo: '',
                        durationMin: '',
                        durationMax: '',
                        sortBy: 'uploadDate',
                        sortOrder: 'desc'
                      });
                    }}
                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    Limpiar Filtros
                  </Button>
                  <Button 
                    variant="contained"
                    sx={{
                      backgroundColor: '#1976d2',
                      '&:hover': { backgroundColor: '#115293' }
                    }}
                  >
                    ✅ Filtros Aplicados
                  </Button>
                </Box>
              </Box>
            </Box>
          )}

          {/* Organización Tab */}
          {currentTab === 2 && (
            <Box>
              <Typography variant="h5" sx={{ mb: 3, color: '#8B0000' }}>
                📁 Sistema de Organización
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Estructura de carpetas: <strong>Marcha → Instrumento → Voz</strong>
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {marches.map(march => (
                  <Card key={march} sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', minWidth: 300 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ color: '#8B0000' }}>
                          📁 {march}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteCategory(march)}
                          sx={{ color: '#F44336' }}
                          disabled={marches.length <= 1}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="body2">
                        Partituras: {scores.filter(s => s.march === march).length}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenCategoryDialog(true)}
                  sx={{ bgcolor: '#8B0000', '&:hover': { bgcolor: '#660000' } }}
                >
                  Agregar Nueva Categoría
                </Button>
              </Box>
            </Box>
          )}

          {/* Configuración Tab */}
          {currentTab === 3 && (
            <Box>
              <Typography variant="h5" sx={{ mb: 3, color: '#8B0000' }}>
                ⚙️ Configuración del Sistema
              </Typography>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <strong>Firebase Setup Required:</strong> Para el funcionamiento completo del sistema, 
                configura tu proyecto Firebase en <code>src/config/firebase.ts</code>
              </Alert>
              
              <Typography variant="h6" sx={{ mb: 2 }}>
                Configuración de Email
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Para enviar partituras por email, configura los siguientes parámetros:
              </Typography>
              
              <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', p: 2 }}>
                <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
{`// Configuración requerida:
- Email del remitente
- Contraseña de aplicación
- Servidor SMTP
- Puerto SMTP

// Ejemplo para Gmail:
SMTP Server: smtp.gmail.com
Port: 587
Security: TLS`}
                </Typography>
              </Card>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Upload Dialog */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          📤 Subir Nueva Partitura
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Título de la Partitura"
              value={uploadFormData.title}
              onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
              required
              fullWidth
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                label="Marcha"
                value={uploadFormData.march}
                onChange={(e) => setUploadFormData({ ...uploadFormData, march: e.target.value })}
                required
                sx={{ flex: 1 }}
              >
                {marches.map(march => (
                  <MenuItem key={march} value={march}>
                    {march}
                  </MenuItem>
                ))}
              </TextField>
              
              <TextField
                select
                label="Instrumento"
                value={uploadFormData.instrument}
                onChange={(e) => setUploadFormData({ ...uploadFormData, instrument: e.target.value, voice: '' })}
                required
                sx={{ flex: 1 }}
              >
                {instruments.map(instrument => (
                  <MenuItem key={instrument.id} value={instrument.name}>
                    {instrument.name}
                  </MenuItem>
                ))}
              </TextField>
              
              <TextField
                select
                label="Voz"
                value={uploadFormData.voice}
                onChange={(e) => setUploadFormData({ ...uploadFormData, voice: e.target.value })}
                required
                disabled={!uploadFormData.instrument}
                sx={{ flex: 1 }}
              >
                {uploadFormData.instrument && voices
                  .filter(voice => {
                    const selectedInstrument = instruments.find(inst => inst.name === uploadFormData.instrument);
                    return selectedInstrument && voice.instrumentId === selectedInstrument.id;
                  })
                  .map(voice => (
                    <MenuItem key={voice.id} value={voice.name}>
                      {voice.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Compositor"
                value={uploadFormData.composer}
                onChange={(e) => setUploadFormData({ ...uploadFormData, composer: e.target.value })}
                sx={{ flex: 1 }}
              />
              
              <TextField
                label="Arreglista"
                value={uploadFormData.arranger}
                onChange={(e) => setUploadFormData({ ...uploadFormData, arranger: e.target.value })}
                sx={{ flex: 1 }}
              />
              
              <TextField
                label="Duración (ej: 3:45)"
                value={uploadFormData.duration}
                onChange={(e) => setUploadFormData({ ...uploadFormData, duration: e.target.value })}
                sx={{ flex: 1 }}
              />
            </Box>
            
            <TextField
              label="Descripción"
              multiline
              rows={3}
              value={uploadFormData.description}
              onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
            />
            
            <TextField
              label="Etiquetas (separadas por comas)"
              value={uploadFormData.tags}
              onChange={(e) => setUploadFormData({ ...uploadFormData, tags: e.target.value })}
              helperText="Ej: procesional, semana santa, navidad"
            />
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ alignSelf: 'flex-start' }}
            >
              Seleccionar Archivo PDF
              <input
                type="file"
                hidden
                accept=".pdf,.musicxml,.mxl,.mid,.midi"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadFormData({ ...uploadFormData, file });
                  }
                }}
              />
            </Button>
            
            {uploadFormData.file && (
              <Alert severity="success">
                Archivo seleccionado: {uploadFormData.file.name}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUploadDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleUploadFile}
            variant="contained"
            sx={{ bgcolor: '#8B0000', '&:hover': { bgcolor: '#660000' } }}
            disabled={loading || !uploadFormData.file || !uploadFormData.title}
          >
            {loading ? <CircularProgress size={20} /> : 'Subir Partitura'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={openEmailDialog} onClose={() => setOpenEmailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          📧 Enviar Partituras por Email
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Alert severity="info">
              Sistema de envío por email en desarrollo. Configuración pendiente.
            </Alert>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={emailFormData.sendToAllBand}
                  onChange={(e) => setEmailFormData({ ...emailFormData, sendToAllBand: e.target.checked })}
                />
              }
              label="Enviar a toda la banda"
            />
            
            <TextField
              label="Asunto"
              value={emailFormData.subject}
              onChange={(e) => setEmailFormData({ ...emailFormData, subject: e.target.value })}
              fullWidth
            />
            
            <TextField
              label="Mensaje"
              multiline
              rows={4}
              value={emailFormData.message}
              onChange={(e) => setEmailFormData({ ...emailFormData, message: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmailDialog(false)}>Cancelar</Button>
          <Button 
            onClick={handleSendEmail}
            variant="contained"
            sx={{ bgcolor: '#8B0000', '&:hover': { bgcolor: '#660000' } }}
            disabled={!emailSettings.senderEmail}
          >
            Enviar Emails
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Management Dialog */}
      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          📁 Gestionar Categorías de Marchas
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Categorías Actuales:
            </Typography>
            
            <List>
              {marches.map((march) => (
                <ListItem
                  key={march}
                  sx={{
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.02)'
                  }}
                >
                  <ListItemText primary={march} />
                  <ListItemSecondaryAction>
                    <Chip
                      label={`${scores.filter(s => s.march === march).length} partituras`}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteCategory(march)}
                      sx={{ color: '#F44336' }}
                      disabled={marches.length <= 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>
              Agregar Nueva Categoría:
            </Typography>
            
            <TextField
              label="Nombre de la categoría"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Ej: Marchas Cofrades"
              fullWidth
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddCategory();
                }
              }}
            />
            
            {newCategoryName.trim() && marches.includes(newCategoryName.trim()) && (
              <Alert severity="warning">
                Esta categoría ya existe
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenCategoryDialog(false);
            setNewCategoryName('');
          }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAddCategory}
            variant="contained"
            sx={{ bgcolor: '#8B0000', '&:hover': { bgcolor: '#660000' } }}
            disabled={!newCategoryName.trim() || marches.includes(newCategoryName.trim())}
          >
            Agregar Categoría
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ScoresManagerPage;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Collapse,
  Card,
  CardContent,
  CardActions,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  DateRange as DateRangeIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Euro as EuroIcon,
} from '@mui/icons-material';

// Interfaces
interface ContractFile {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  uploadDate: string;
}

interface Contract {
  id: string;
  name: string;
  client: string;
  venue: string;
  eventDate: string;
  contractDate: string;
  amount?: number;
  status: 'pending' | 'signed' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid'; // Nuevo campo para estado de cobro
  description: string;
  files: ContractFile[];
  createdAt: string;
  updatedAt: string;
  sourcePerformanceId?: string; // Para contratos sincronizados desde actuaciones
}

const ContractsManagerPage: React.FC = () => {
  // Estados principales
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para diálogos
  const [contractDialog, setContractDialog] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [expandedContract, setExpandedContract] = useState<string | null>(null);

  // Estados para formularios
  const [contractForm, setContractForm] = useState({
    id: '',
    name: '',
    client: '',
    venue: '',
    eventDate: '',
    contractDate: '',
    amount: '',
    status: 'pending' as 'pending' | 'signed' | 'completed' | 'cancelled',
    paymentStatus: 'pending' as 'pending' | 'paid',
    description: '',
    files: [] as ContractFile[],
  });

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'eventDate' | 'contractDate' | 'name' | 'amount'>('eventDate');

  // Funciones de utilidad
  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  // Cargar contratos desde localStorage (incluyendo los sincronizados desde actuaciones)
  const loadContracts = () => {
    try {
      const savedContracts = localStorage.getItem('bondapp-contracts');
      if (savedContracts) {
        const contractsData = JSON.parse(savedContracts);
        setContracts(contractsData);
        console.log('Contratos cargados:', contractsData.length);
      } else {
        setContracts([]);
      }
    } catch (error) {
      console.error('Error al cargar contratos:', error);
      showError('Error al cargar los contratos');
      setContracts([]);
    }
  };

  // Función para generar el formato estándar de nombre de contrato
  const generateContractName = (title: string, venue: string, date: string) => {
    const formattedDate = date ? new Date(date).toLocaleDateString('es-ES') : '';
    return `${title} - ${venue} - ${formattedDate}`;
  };

  // Auto-completar nombre del contrato cuando se llenan los campos
  useEffect(() => {
    if (contractForm.name === '' && contractForm.venue && contractForm.eventDate) {
      const autoName = generateContractName(
        contractForm.client || 'Actuación', 
        contractForm.venue, 
        contractForm.eventDate
      );
      setContractForm(prev => ({ ...prev, name: autoName }));
    }
  }, [contractForm.venue, contractForm.eventDate, contractForm.client]);

  useEffect(() => {
    loadContracts();
  }, []);

  // Guardar contratos en localStorage
  const saveContracts = (updatedContracts: Contract[]) => {
    try {
      localStorage.setItem('bondapp-contracts', JSON.stringify(updatedContracts));
      setContracts(updatedContracts);
    } catch (error) {
      console.error('Error al guardar contratos:', error);
      showError('Error al guardar los contratos');
    }
  };

  // Funciones para manejo de archivos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) { // 10MB límite
        showError(`El archivo ${file.name} es demasiado grande (máximo 10MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newFile: ContractFile = {
            id: `file_${Date.now()}_${Math.random()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: e.target.result as string,
            uploadDate: new Date().toISOString(),
          };

          setContractForm(prev => ({
            ...prev,
            files: [...prev.files, newFile]
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    // Limpiar el input
    event.target.value = '';
  };

  const handleRemoveFile = (fileId: string) => {
    setContractForm(prev => ({
      ...prev,
      files: prev.files.filter(file => file.id !== fileId)
    }));
  };

  const handleDownloadFile = (file: ContractFile) => {
    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Funciones CRUD
  const handleCreateContract = () => {
    setEditingContract(null);
    setContractForm({
      id: '',
      name: '',
      client: '',
      venue: '',
      eventDate: '',
      contractDate: '',
      amount: '',
      status: 'pending',
      paymentStatus: 'pending',
      description: '',
      files: [],
    });
    setContractDialog(true);
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setContractForm({
      id: contract.id,
      name: contract.name,
      client: contract.client,
      venue: contract.venue,
      eventDate: contract.eventDate,
      contractDate: contract.contractDate,
      amount: contract.amount?.toString() || '',
      status: contract.status,
      paymentStatus: contract.paymentStatus || 'pending',
      description: contract.description,
      files: [...contract.files],
    });
    setContractDialog(true);
  };

  const handleSaveContract = () => {
    try {
      // Validaciones
      if (!contractForm.name.trim() || !contractForm.client.trim()) {
        showError('El nombre del contrato y el cliente son obligatorios');
        return;
      }

      if (!contractForm.eventDate) {
        showError('La fecha del evento es obligatoria');
        return;
      }

      const id = contractForm.id || `contract_${Date.now()}`;
      const amount = contractForm.amount ? parseFloat(contractForm.amount) : undefined;
      
      const contractData: Contract = {
        id,
        name: contractForm.name.trim(),
        client: contractForm.client.trim(),
        venue: contractForm.venue.trim(),
        eventDate: contractForm.eventDate,
        contractDate: contractForm.contractDate || new Date().toISOString().split('T')[0],
        amount,
        status: contractForm.status,
        paymentStatus: contractForm.paymentStatus,
        description: contractForm.description.trim(),
        files: contractForm.files,
        createdAt: editingContract?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sourcePerformanceId: editingContract?.sourcePerformanceId, // Mantener la referencia si existe
      };

      if (editingContract) {
        // Editar contrato existente
        const updatedContracts = contracts.map(contract =>
          contract.id === editingContract.id ? contractData : contract
        );
        saveContracts(updatedContracts);
        showSuccess(`Contrato "${contractData.name}" actualizado correctamente`);
      } else {
        // Crear nuevo contrato
        const updatedContracts = [...contracts, contractData];
        saveContracts(updatedContracts);
        showSuccess(`Contrato "${contractData.name}" creado correctamente`);
      }

      setContractDialog(false);
    } catch (error) {
      console.error('Error al guardar contrato:', error);
      showError('Error al guardar el contrato');
    }
  };

  const handleDeleteContract = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;

    if (window.confirm(`¿Estás seguro de que quieres eliminar el contrato "${contract.name}"?`)) {
      const updatedContracts = contracts.filter(c => c.id !== contractId);
      saveContracts(updatedContracts);
      showSuccess(`Contrato "${contract.name}" eliminado correctamente`);
    }
  };

  // Función para cambiar estado de cobro rápidamente
  const handleTogglePaymentStatus = (contract: Contract) => {
    const newPaymentStatus: 'pending' | 'paid' = contract.paymentStatus === 'paid' ? 'pending' : 'paid';
    const updatedContract: Contract = { ...contract, paymentStatus: newPaymentStatus, updatedAt: new Date().toISOString() };
    const updatedContracts = contracts.map(c => c.id === contract.id ? updatedContract : c);
    saveContracts(updatedContracts);
    showSuccess(`Estado de cobro actualizado a: ${newPaymentStatus === 'paid' ? 'Cobrado' : 'Pendiente'}`);
  };

  // Funciones de filtrado y ordenamiento
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.venue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || (contract.paymentStatus || 'pending') === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const sortedContracts = [...filteredContracts].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];

    if (sortBy === 'amount') {
      aValue = a.amount || 0;
      bValue = b.amount || 0;
    }

    if (sortBy === 'eventDate' || sortBy === 'contractDate') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortBy === 'name') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    // Siempre ordenar descendente por defecto (más reciente primero)
    return aValue < bValue ? 1 : -1;
  });

  // Funciones de utilidad para visualización
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'signed': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'signed': return 'Firmado';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <PdfIcon />;
    if (fileType.includes('image')) return <ImageIcon />;
    return <DocumentIcon />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh', background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ 
          color: '#8B0000', 
          fontWeight: 700, 
          mb: 1,
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          📄 Gestión de Contratos
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
          Base de datos de documentos contractuales
        </Typography>
      </Box>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Controles */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        background: 'linear-gradient(145deg, rgba(28, 28, 28, 0.95) 0%, rgba(40, 40, 40, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 0, 0, 0.3)',
      }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Buscar contratos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ 
              flexGrow: 1, 
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                '& fieldset': { borderColor: 'rgba(139, 0, 0, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(139, 0, 0, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#8B0000' },
              },
              '& .MuiInputBase-input': { color: '#FFFFFF' },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#8B0000' }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Estado</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                color: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 0, 0, 0.3)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 0, 0, 0.5)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8B0000' },
              }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="pending">Pendientes</MenuItem>
              <MenuItem value="signed">Firmados</MenuItem>
              <MenuItem value="completed">Completados</MenuItem>
              <MenuItem value="cancelled">Cancelados</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Cobro</InputLabel>
            <Select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              sx={{
                color: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 0, 0, 0.3)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 0, 0, 0.5)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8B0000' },
              }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="pending">Pendiente</MenuItem>
              <MenuItem value="paid">Cobrado</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Ordenar por</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              sx={{
                color: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 0, 0, 0.3)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 0, 0, 0.5)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8B0000' },
              }}
            >
              <MenuItem value="eventDate">Fecha del evento</MenuItem>
              <MenuItem value="contractDate">Fecha del contrato</MenuItem>
              <MenuItem value="name">Nombre</MenuItem>
              <MenuItem value="amount">Importe</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateContract}
            sx={{
              background: 'linear-gradient(135deg, #8B0000 0%, #A00000 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #A00000 0%, #BB0000 100%)',
              },
            }}
          >
            Nuevo Contrato
          </Button>
        </Box>
      </Paper>

      {/* Lista de contratos */}
      <Box sx={{ mb: 3 }}>
        {sortedContracts.length === 0 ? (
          <Paper sx={{ 
            p: 4, 
            textAlign: 'center',
            background: 'rgba(28, 28, 28, 0.95)',
            border: '1px solid rgba(139, 0, 0, 0.3)',
          }}>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {contracts.length === 0 ? 'No hay contratos registrados' : 'No se encontraron contratos con los filtros aplicados'}
            </Typography>
          </Paper>
        ) : (
          sortedContracts.map((contract) => (
            <Card
              key={contract.id}
              sx={{
                mb: 2,
                background: 'linear-gradient(145deg, rgba(28, 28, 28, 0.95) 0%, rgba(40, 40, 40, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 0, 0, 0.3)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                        📄 {contract.name}
                      </Typography>
                      {contract.sourcePerformanceId && (
                        <Chip 
                          label="🎭 Desde Actuación" 
                          size="small" 
                          sx={{ 
                            backgroundColor: 'rgba(76, 175, 80, 0.2)',
                            color: '#4CAF50',
                            border: '1px solid #4CAF5033',
                            fontSize: '0.7rem'
                          }} 
                        />
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessIcon sx={{ color: '#8B0000', fontSize: 16 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          <strong>Cliente:</strong> {contract.client}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon sx={{ color: '#8B0000', fontSize: 16 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          <strong>Lugar:</strong> {contract.venue || 'No especificado'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DateRangeIcon sx={{ color: '#8B0000', fontSize: 16 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          <strong>Evento:</strong> {new Date(contract.eventDate).toLocaleDateString('es-ES')}
                        </Typography>
                      </Box>
                      {contract.amount && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EuroIcon sx={{ color: '#8B0000', fontSize: 16 }} />
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                            <strong>Importe:</strong> €{contract.amount.toLocaleString('es-ES')}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={getStatusLabel(contract.status)}
                        sx={{
                          backgroundColor: getStatusColor(contract.status),
                          color: '#FFFFFF',
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={contract.paymentStatus === 'paid' ? '✅ Cobrado' : '💰 Pendiente'}
                        sx={{
                          backgroundColor: contract.paymentStatus === 'paid' ? 'rgba(76, 175, 80, 0.8)' : 'rgba(255, 152, 0, 0.8)',
                          color: '#FFFFFF',
                          fontWeight: 600,
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        📎 {contract.files.length} archivo(s)
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => setExpandedContract(expandedContract === contract.id ? null : contract.id)}
                      sx={{ color: '#8B0000' }}
                    >
                      {expandedContract === contract.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>

              <Collapse in={expandedContract === contract.id}>
                <CardContent sx={{ pt: 0 }}>
                  {/* Descripción */}
                  {contract.description && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ color: '#8B0000', mb: 1 }}>
                        📝 Descripción:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        {contract.description}
                      </Typography>
                    </Box>
                  )}

                  {/* Archivos */}
                  {contract.files.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ color: '#8B0000', mb: 2 }}>
                        📎 Archivos adjuntos:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {contract.files.map((file) => (
                          <Paper
                            key={file.id}
                            sx={{
                              p: 2,
                              background: 'rgba(139, 0, 0, 0.1)',
                              border: '1px solid rgba(139, 0, 0, 0.3)',
                              minWidth: 200,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Avatar sx={{ backgroundColor: '#8B0000', width: 24, height: 24 }}>
                                {getFileIcon(file.type)}
                              </Avatar>
                              <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600, flex: 1 }}>
                                {file.name}
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', mb: 1 }}>
                              {formatFileSize(file.size)}
                            </Typography>
                            <Button
                              size="small"
                              startIcon={<DownloadIcon />}
                              onClick={() => handleDownloadFile(file)}
                              sx={{
                                color: '#8B0000',
                                fontSize: '0.7rem',
                                '&:hover': {
                                  backgroundColor: 'rgba(139, 0, 0, 0.1)',
                                },
                              }}
                            >
                              Descargar
                            </Button>
                          </Paper>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Acciones */}
                  <CardActions sx={{ px: 0, pb: 0, justifyContent: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => handleEditContract(contract)}
                      sx={{ color: '#8B0000' }}
                    >
                      Editar
                    </Button>
                    <Button
                      startIcon={contract.paymentStatus === 'paid' ? '💰' : '✅'}
                      onClick={() => handleTogglePaymentStatus(contract)}
                      sx={{ 
                        color: contract.paymentStatus === 'paid' ? '#FF9800' : '#4CAF50',
                        fontSize: '0.8rem'
                      }}
                    >
                      {contract.paymentStatus === 'paid' ? 'Marcar Pendiente' : 'Marcar Cobrado'}
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteContract(contract.id)}
                      sx={{ color: '#F44336' }}
                    >
                      Eliminar
                    </Button>
                  </CardActions>
                </CardContent>
              </Collapse>
            </Card>
          ))
        )}
      </Box>

      {/* Dialog para crear/editar contratos */}
      <Dialog
        open={contractDialog}
        onClose={() => setContractDialog(false)}
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
          {editingContract ? '✏️ Editar Contrato' : '➕ Nuevo Contrato'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Fila 1 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Nombre del contrato"
                placeholder="Ej: Concierto Navidad - Teatro Principal - 24/12/2024"
                value={contractForm.name}
                onChange={(e) => setContractForm({ ...contractForm, name: e.target.value })}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => {
                          if (contractForm.venue && contractForm.eventDate) {
                            const autoName = generateContractName(
                              contractForm.client || 'Actuación', 
                              contractForm.venue, 
                              contractForm.eventDate
                            );
                            setContractForm(prev => ({ ...prev, name: autoName }));
                          }
                        }}
                        sx={{ color: 'rgba(139, 0, 0, 0.7)' }}
                        title="Auto-generar nombre"
                      >
                        🎯
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': { borderColor: 'rgba(139, 0, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(139, 0, 0, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#8B0000' },
                  },
                  '& .MuiInputBase-input': { color: '#FFFFFF' },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                  '& .MuiInputBase-input::placeholder': { color: 'rgba(255, 255, 255, 0.4)' },
                }}
              />

              <TextField
                fullWidth
                label="Cliente"
                value={contractForm.client}
                onChange={(e) => setContractForm({ ...contractForm, client: e.target.value })}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': { borderColor: 'rgba(139, 0, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(139, 0, 0, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#8B0000' },
                  },
                  '& .MuiInputBase-input': { color: '#FFFFFF' },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />
            </Box>

            {/* Fila 2 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Lugar del evento"
                value={contractForm.venue}
                onChange={(e) => setContractForm({ ...contractForm, venue: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': { borderColor: 'rgba(139, 0, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(139, 0, 0, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#8B0000' },
                  },
                  '& .MuiInputBase-input': { color: '#FFFFFF' },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />

              <TextField
                fullWidth
                label="Fecha del evento"
                type="date"
                value={contractForm.eventDate}
                onChange={(e) => setContractForm({ ...contractForm, eventDate: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': { borderColor: 'rgba(139, 0, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(139, 0, 0, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#8B0000' },
                  },
                  '& .MuiInputBase-input': { color: '#FFFFFF' },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />
            </Box>

            {/* Fila 3 */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Fecha del contrato"
                type="date"
                value={contractForm.contractDate}
                onChange={(e) => setContractForm({ ...contractForm, contractDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': { borderColor: 'rgba(139, 0, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(139, 0, 0, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#8B0000' },
                  },
                  '& .MuiInputBase-input': { color: '#FFFFFF' },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />

              <TextField
                fullWidth
                label="Importe (€)"
                type="number"
                value={contractForm.amount}
                onChange={(e) => setContractForm({ ...contractForm, amount: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': { borderColor: 'rgba(139, 0, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(139, 0, 0, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#8B0000' },
                  },
                  '& .MuiInputBase-input': { color: '#FFFFFF' },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                }}
              />
            </Box>

            {/* Fila 4 - Estados */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Estado del Contrato</InputLabel>
                <Select
                  value={contractForm.status}
                  onChange={(e) => setContractForm({ ...contractForm, status: e.target.value as any })}
                  sx={{
                    color: '#FFFFFF',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 0, 0, 0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 0, 0, 0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8B0000' },
                  }}
                >
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="signed">Firmado</MenuItem>
                  <MenuItem value="completed">Completado</MenuItem>
                  <MenuItem value="cancelled">Cancelado</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Estado de Cobro</InputLabel>
                <Select
                  value={contractForm.paymentStatus}
                  onChange={(e) => setContractForm({ ...contractForm, paymentStatus: e.target.value as any })}
                  sx={{
                    color: '#FFFFFF',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 0, 0, 0.3)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139, 0, 0, 0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8B0000' },
                  }}
                >
                  <MenuItem value="pending">💰 Pendiente de Cobro</MenuItem>
                  <MenuItem value="paid">✅ Cobrado</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Descripción */}
            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={3}
              value={contractForm.description}
              onChange={(e) => setContractForm({ ...contractForm, description: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  '& fieldset': { borderColor: 'rgba(139, 0, 0, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(139, 0, 0, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#8B0000' },
                },
                '& .MuiInputBase-input': { color: '#FFFFFF' },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              }}
            />

            {/* Sección de archivos */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#8B0000', mb: 2 }}>
                📎 Archivos adjuntos
              </Typography>
              
              <Button
                component="label"
                variant="outlined"
                startIcon={<AttachFileIcon />}
                sx={{
                  color: '#8B0000',
                  borderColor: '#8B0000',
                  mb: 2,
                  '&:hover': {
                    borderColor: '#A00000',
                    backgroundColor: 'rgba(139, 0, 0, 0.1)',
                  },
                }}
              >
                Adjuntar archivos
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </Button>

              {contractForm.files.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {contractForm.files.map((file) => (
                    <Paper
                      key={file.id}
                      sx={{
                        p: 2,
                        background: 'rgba(139, 0, 0, 0.1)',
                        border: '1px solid rgba(139, 0, 0, 0.3)',
                        minWidth: 200,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar sx={{ backgroundColor: '#8B0000', width: 24, height: 24 }}>
                          {getFileIcon(file.type)}
                        </Avatar>
                        <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 600, flex: 1 }}>
                          {file.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveFile(file.id)}
                          sx={{ color: '#F44336' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        {formatFileSize(file.size)}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setContractDialog(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveContract}
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

export default ContractsManagerPage;

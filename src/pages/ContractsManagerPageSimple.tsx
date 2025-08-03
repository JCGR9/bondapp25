import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Fab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { fileVerificationService } from '../services/fileVerificationService';

interface Contract {
  id: string;
  client: string;
  eventDate: string;
  location: string;
  description: string;
  amount: number;
  paymentStatus: 'pending' | 'paid';
  contractType: string;
  files?: Array<{
    name: string;
    size: number;
    type: string;
    uploadDate: string;
    driveFileId?: string;
    base64Data?: string;
  }>;
}

const ContractsManagerPageSimple: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' });
  const [loading, setLoading] = useState(false);
  const [driveStatus, setDriveStatus] = useState<{ canSave: boolean; issue?: string }>({ canSave: false });

  // Verificar Google Drive al cargar
  useEffect(() => {
    const checkDriveAccess = async () => {
      console.log('🔍 Verificando acceso a Google Drive...');
      const result = await fileVerificationService.verifyGoogleDriveAccess();
      setDriveStatus(result);
      
      if (result.canSave) {
        console.log('✅ Google Drive listo para guardar archivos');
      } else {
        console.warn('⚠️ Google Drive no disponible:', result.issue);
      }
    };
    
    checkDriveAccess();
    loadContracts();
  }, []);

  const loadContracts = () => {
    try {
      const savedContracts = localStorage.getItem('bondapp_contracts');
      if (savedContracts) {
        setContracts(JSON.parse(savedContracts));
      }
    } catch (error) {
      console.error('Error cargando contratos:', error);
    }
  };

  const saveContracts = (updatedContracts: Contract[]) => {
    try {
      // Guardar en localStorage como respaldo
      localStorage.setItem('bondapp_contracts', JSON.stringify(updatedContracts));
      
      // Intentar guardar en Google Drive si está disponible
      if (driveStatus.canSave) {
        saveToGoogleDrive(updatedContracts);
      }
      
      setContracts(updatedContracts);
    } catch (error) {
      console.error('Error guardando contratos:', error);
      showSnackbar('Error guardando contratos', 'error');
    }
  };

  const saveToGoogleDrive = async (contractsData: Contract[]) => {
    try {
      console.log('💾 Guardando contratos en Google Drive...');
      const result = await fileVerificationService.diagnoseFileSaveIssue(
        'BondApp_Contratos.json',
        contractsData
      );
      
      if (result.canSave) {
        console.log('✅ Contratos guardados en Google Drive exitosamente');
        showSnackbar('Contratos guardados en la nube', 'success');
      } else {
        console.warn('⚠️ No se pudieron guardar en Google Drive:', result.issue);
        showSnackbar(`Guardado local únicamente: ${result.issue}`, 'warning');
      }
    } catch (error) {
      console.error('❌ Error guardando en Google Drive:', error);
      showSnackbar('Error guardando en la nube, usando respaldo local', 'warning');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddContract = () => {
    setEditingContract(null);
    setOpenDialog(true);
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setOpenDialog(true);
  };

  const handleDeleteContract = (contractId: string) => {
    const updatedContracts = contracts.filter(c => c.id !== contractId);
    saveContracts(updatedContracts);
    showSnackbar('Contrato eliminado', 'success');
  };

  const handleSaveContract = (contractData: Partial<Contract>) => {
    setLoading(true);
    
    try {
      let updatedContracts: Contract[];
      
      if (editingContract) {
        // Editar contrato existente
        updatedContracts = contracts.map(c => 
          c.id === editingContract.id 
            ? { ...c, ...contractData }
            : c
        );
      } else {
        // Crear nuevo contrato
        const newContract: Contract = {
          id: Date.now().toString(),
          client: '',
          eventDate: '',
          location: '',
          description: '',
          amount: 0,
          paymentStatus: 'pending',
          contractType: 'Concierto',
          files: [],
          ...contractData
        };
        updatedContracts = [...contracts, newContract];
      }
      
      saveContracts(updatedContracts);
      setOpenDialog(false);
      showSnackbar(
        editingContract ? 'Contrato actualizado' : 'Contrato creado', 
        'success'
      );
    } catch (error) {
      console.error('Error guardando contrato:', error);
      showSnackbar('Error guardando contrato', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          💼 Gestión de Contratos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddContract}
          sx={{ backgroundColor: '#8B0000' }}
        >
          Nuevo Contrato
        </Button>
      </Box>

      {/* Estado de Google Drive */}
      <Alert 
        severity={driveStatus.canSave ? "success" : "warning"}
        sx={{ mb: 3 }}
        icon={driveStatus.canSave ? <CheckIcon /> : <WarningIcon />}
      >
        {driveStatus.canSave 
          ? "✅ Google Drive configurado - Los contratos se guardan automáticamente en la nube"
          : `⚠️ Google Drive no disponible: ${driveStatus.issue || 'No configurado'} - Usando almacenamiento local`
        }
      </Alert>

      {/* Lista de contratos */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Fecha Evento</TableCell>
                  <TableCell>Ubicación</TableCell>
                  <TableCell align="right">Importe</TableCell>
                  <TableCell align="center">Estado Cobro</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No hay contratos registrados. Haz clic en "Nuevo Contrato" para crear uno.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  contracts.map((contract) => (
                    <TableRow key={contract.id} hover>
                      <TableCell>
                        <Typography fontWeight="bold">{contract.client}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {contract.contractType}
                        </Typography>
                      </TableCell>
                      <TableCell>{contract.eventDate}</TableCell>
                      <TableCell>{contract.location}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          €{contract.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={contract.paymentStatus === 'paid' ? 'Cobrado' : 'Pendiente'}
                          color={contract.paymentStatus === 'paid' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleEditContract(contract)}
                          size="small"
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteContract(contract.id)}
                          size="small"
                          color="error"
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
        </CardContent>
      </Card>

      {/* Dialog para crear/editar contrato */}
      <ContractDialog
        open={openDialog}
        contract={editingContract}
        loading={loading}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveContract}
      />

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity as any}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

// Componente Dialog simplificado
interface ContractDialogProps {
  open: boolean;
  contract: Contract | null;
  loading: boolean;
  onClose: () => void;
  onSave: (contract: Partial<Contract>) => void;
}

const ContractDialog: React.FC<ContractDialogProps> = ({
  open,
  contract,
  loading,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Contract>>({
    client: '',
    eventDate: '',
    location: '',
    description: '',
    amount: 0,
    paymentStatus: 'pending',
    contractType: 'Concierto'
  });

  useEffect(() => {
    if (contract) {
      setFormData(contract);
    } else {
      setFormData({
        client: '',
        eventDate: '',
        location: '',
        description: '',
        amount: 0,
        paymentStatus: 'pending',
        contractType: 'Concierto'
      });
    }
  }, [contract, open]);

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {contract ? 'Editar Contrato' : 'Nuevo Contrato'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Cliente"
            value={formData.client || ''}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            fullWidth
            required
          />
          
          <TextField
            label="Fecha del Evento"
            type="date"
            value={formData.eventDate || ''}
            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            fullWidth
            required
          />
          
          <TextField
            label="Ubicación"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            fullWidth
            required
          />
          
          <TextField
            label="Descripción"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            fullWidth
          />
          
          <TextField
            label="Importe (€)"
            type="number"
            value={formData.amount || 0}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            fullWidth
            required
          />
          
          <FormControl fullWidth>
            <InputLabel>Tipo de Contrato</InputLabel>
            <Select
              value={formData.contractType || 'Concierto'}
              onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
            >
              <MenuItem value="Concierto">Concierto</MenuItem>
              <MenuItem value="Procesión">Procesión</MenuItem>
              <MenuItem value="Evento Privado">Evento Privado</MenuItem>
              <MenuItem value="Festival">Festival</MenuItem>
              <MenuItem value="Concurso">Concurso</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>Estado de Cobro</InputLabel>
            <Select
              value={formData.paymentStatus || 'pending'}
              onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as 'pending' | 'paid' })}
            >
              <MenuItem value="pending">Pendiente</MenuItem>
              <MenuItem value="paid">Cobrado</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.client || !formData.eventDate}
          sx={{ backgroundColor: '#8B0000' }}
        >
          {loading ? <CircularProgress size={20} /> : (contract ? 'Actualizar' : 'Crear')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContractsManagerPageSimple;

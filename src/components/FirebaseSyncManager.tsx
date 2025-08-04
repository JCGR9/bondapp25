import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CloudSync as SyncIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  Refresh as RefreshIcon,
  DeleteSweep as ClearIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { firebaseSyncService } from '../services/firebaseSync';
import { clearBondAppTestData, checkBondAppData } from '../utils/clearData';

interface SyncStatusProps {
  compact?: boolean;
}

export const FirebaseSyncManager: React.FC<SyncStatusProps> = ({ compact = false }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState('');
  const [dataStatus, setDataStatus] = useState<{[key: string]: number | string}>({});
  const [showDetails, setShowDetails] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
    loadSyncStatus();
    checkDataStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const connected = await firebaseSyncService.checkConnection();
      setIsConnected(connected);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const loadSyncStatus = () => {
    const lastSyncTime = localStorage.getItem('bondapp_last_sync');
    if (lastSyncTime) {
      setLastSync(new Date(lastSyncTime).toLocaleString('es-ES'));
    }
  };

  const checkDataStatus = () => {
    const status = checkBondAppData();
    setDataStatus(status);
  };

  const handleSyncToFirebase = async () => {
    if (!isConnected) {
      setSyncMessage('Sin conexión a Firebase');
      return;
    }

    setSyncStatus('syncing');
    setSyncProgress(10);
    setSyncMessage('Iniciando sincronización...');

    try {
      setSyncProgress(30);
      setSyncMessage('Subiendo datos a Firebase...');
      
      await firebaseSyncService.syncAllLocalDataToFirebase();
      
      setSyncProgress(80);
      setSyncMessage('Verificando sincronización...');
      
      // Actualizar timestamp de última sincronización
      const now = new Date().toISOString();
      localStorage.setItem('bondapp_last_sync', now);
      setLastSync(new Date(now).toLocaleString('es-ES'));
      
      setSyncProgress(100);
      setSyncMessage('¡Sincronización completada!');
      setSyncStatus('success');
      
      // Actualizar estado de datos
      checkDataStatus();
      
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncProgress(0);
        setSyncMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error en sincronización:', error);
      setSyncStatus('error');
      setSyncMessage('Error en la sincronización');
      
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncProgress(0);
        setSyncMessage('');
      }, 5000);
    }
  };

  const handleLoadFromFirebase = async () => {
    if (!isConnected) {
      setSyncMessage('Sin conexión a Firebase');
      return;
    }

    setSyncStatus('syncing');
    setSyncProgress(10);
    setSyncMessage('Descargando desde Firebase...');

    try {
      setSyncProgress(50);
      const allData = await firebaseSyncService.loadAllDataFromFirebase();
      
      setSyncProgress(80);
      setSyncMessage('Actualizando datos locales...');
      
      // Los datos ya se guardan en localStorage dentro del servicio
      
      setSyncProgress(100);
      setSyncMessage('¡Datos actualizados!');
      setSyncStatus('success');
      
      // Actualizar estado de datos
      checkDataStatus();
      
      // Forzar recarga de la página para que todos los componentes vean los nuevos datos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error cargando desde Firebase:', error);
      setSyncStatus('error');
      setSyncMessage('Error al cargar datos');
      
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncProgress(0);
        setSyncMessage('');
      }, 5000);
    }
  };

  const handleClearTestData = () => {
    try {
      const result = clearBondAppTestData();
      setSyncMessage(`${result.removed} elementos eliminados`);
      checkDataStatus();
      setShowClearDialog(false);
      
      // Recargar después de limpiar
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setSyncMessage('Error al limpiar datos');
    }
  };

  const getConnectionStatusColor = () => {
    if (isConnected === null) return 'warning';
    return isConnected ? 'success' : 'error';
  };

  const getConnectionStatusText = () => {
    if (isConnected === null) return 'Verificando...';
    return isConnected ? 'Conectado' : 'Sin conexión';
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return <SyncIcon className="rotating" />;
      case 'success': return <CloudDoneIcon />;
      case 'error': return <CloudOffIcon />;
      default: return <StorageIcon />;
    }
  };

  if (compact) {
    return (
      <Card sx={{ 
        background: 'rgba(139, 0, 0, 0.1)',
        border: '1px solid rgba(139, 0, 0, 0.3)'
      }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getSyncStatusIcon()}
              <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
                Firebase
              </Typography>
              <Chip 
                size="small"
                label={getConnectionStatusText()}
                color={getConnectionStatusColor()}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Sincronizar">
                <IconButton
                  size="small"
                  onClick={handleSyncToFirebase}
                  disabled={syncStatus === 'syncing' || !isConnected}
                  sx={{ color: '#8B0000' }}
                >
                  <UploadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Descargar">
                <IconButton
                  size="small"
                  onClick={handleLoadFromFirebase}
                  disabled={syncStatus === 'syncing' || !isConnected}
                  sx={{ color: '#8B0000' }}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {syncStatus === 'syncing' && (
            <Box sx={{ mt: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={syncProgress}
                sx={{ 
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#8B0000'
                  }
                }}
              />
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {syncMessage}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      mb: 4,
      background: 'linear-gradient(145deg, rgba(28, 28, 28, 0.9) 0%, rgba(40, 40, 40, 0.8) 100%)',
      border: '1px solid rgba(139, 0, 0, 0.3)'
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 1 }}>
            {getSyncStatusIcon()}
            Sincronización Firebase
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={getConnectionStatusText()}
              color={getConnectionStatusColor()}
              icon={isConnected ? <CloudDoneIcon /> : <CloudOffIcon />}
            />
            
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowDetails(!showDetails)}
              sx={{ color: '#8B0000', borderColor: '#8B0000' }}
            >
              {showDetails ? 'Ocultar' : 'Ver'} Detalles
            </Button>
          </Box>
        </Box>

        {lastSync && (
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
            📅 Última sincronización: {lastSync}
          </Typography>
        )}

        {syncStatus === 'syncing' && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={syncProgress}
              sx={{ 
                mb: 1,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#8B0000'
                }
              }}
            />
            <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
              {syncMessage}
            </Typography>
          </Box>
        )}

        {syncStatus === 'error' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {syncMessage}
          </Alert>
        )}

        {syncStatus === 'success' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {syncMessage}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handleSyncToFirebase}
            disabled={syncStatus === 'syncing' || !isConnected}
            sx={{
              background: 'linear-gradient(135deg, #8B0000 0%, #A00000 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #A00000 0%, #BB0000 100%)',
              },
            }}
          >
            Subir a Firebase
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleLoadFromFirebase}
            disabled={syncStatus === 'syncing' || !isConnected}
            sx={{ 
              color: '#8B0000', 
              borderColor: '#8B0000',
              '&:hover': {
                borderColor: '#A00000',
                backgroundColor: 'rgba(139, 0, 0, 0.1)'
              }
            }}
          >
            Cargar desde Firebase
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={checkConnectionStatus}
            disabled={syncStatus === 'syncing'}
            sx={{ 
              color: '#8B0000', 
              borderColor: '#8B0000',
              '&:hover': {
                borderColor: '#A00000',
                backgroundColor: 'rgba(139, 0, 0, 0.1)'
              }
            }}
          >
            Verificar Conexión
          </Button>

          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={() => setShowClearDialog(true)}
            disabled={syncStatus === 'syncing'}
            sx={{ 
              color: '#FF5722', 
              borderColor: '#FF5722',
              '&:hover': {
                borderColor: '#FF7043',
                backgroundColor: 'rgba(255, 87, 34, 0.1)'
              }
            }}
          >
            Limpiar Datos Prueba
          </Button>
        </Box>

        {showDetails && (
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(139, 0, 0, 0.3)' }}>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', mb: 1 }}>
              📊 Estado de Datos Locales:
            </Typography>
            
            <List dense>
              {Object.entries(dataStatus).map(([key, value]) => (
                <ListItem key={key} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <StorageIcon sx={{ color: value === 0 ? '#666' : '#8B0000', fontSize: 16 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={key.replace('bondapp-', '').replace('bondapp_', '')}
                    secondary={`${value} elementos`}
                    primaryTypographyProps={{ 
                      sx: { color: '#FFFFFF', fontSize: 14 } 
                    }}
                    secondaryTypographyProps={{ 
                      sx: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 12 } 
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>

      {/* Dialog para confirmar limpieza */}
      <Dialog
        open={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        PaperProps={{
          sx: {
            background: 'linear-gradient(145deg, rgba(28, 28, 28, 0.95) 0%, rgba(40, 40, 40, 0.9) 100%)',
            border: '1px solid rgba(139, 0, 0, 0.3)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#8B0000' }}>
          🧹 Limpiar Datos de Prueba
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta acción eliminará todos los datos de prueba (actuaciones, componentes, contratos, inventario, etc.)
            pero mantendrá las configuraciones.
          </Alert>
          <Typography sx={{ color: '#FFFFFF' }}>
            ¿Estás seguro de que quieres limpiar todos los datos de prueba?
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowClearDialog(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleClearTestData}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #FF5722 0%, #FF7043 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #FF7043 0%, #FF8A65 100%)',
              },
            }}
          >
            Sí, Limpiar Datos
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

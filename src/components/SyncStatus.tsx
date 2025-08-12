/**
 * Componente de Estado de Sincronización
 * Muestra el estado de conexión y permite sincronización manual
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Sync as SyncIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  Smartphone as SmartphoneIcon,
  Computer as ComputerIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useBondAppSync } from '../services/syncService';

interface SyncStatusProps {
  compact?: boolean;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ compact = false }) => {
  const handleSync = async () => {
    if (!isOnline) {
      setSyncMessage('Sin conexión a internet');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
      return;
    }

    setIsSyncing(true);
    setSyncMessage('Sincronizando...');
    setShowMessage(true);

    try {
      await syncAllData();
      setLastSync(new Date());
      setSyncMessage('✅ Sincronización completada');
      setTimeout(() => {
        setShowMessage(false);
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error during sync:', error);
      setSyncMessage('❌ Error en la sincronización');
      setTimeout(() => setShowMessage(false), 3000);
    } finally {
      setIsSyncing(false);
    }
  };
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [showMessage, setShowMessage] = useState(false);

  const { syncAllData, getSyncStatus } = useBondAppSync();

  useEffect(() => {
    // Monitorear estado de conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cargar estado inicial
    loadSyncStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadSyncStatus = async () => {
    try {
      const status = await getSyncStatus();
      setLastSync(status.lastSync);
      setDeviceId(status.deviceId);
    } catch (error) {
      console.warn('Error loading sync status:', error);
    }
  };

  // handlePushData eliminado: ya no hay datos locales, solo Firebase

  const getDeviceIcon = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobile ? <SmartphoneIcon /> : <ComputerIcon />;
  };

  const formatLastSync = () => {
    if (!lastSync) return 'Nunca';
    const now = new Date();
    const diff = now.getTime() - lastSync.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)} h`;
    return lastSync.toLocaleDateString();
  };

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={isOnline ? <CloudDoneIcon /> : <CloudOffIcon />}
          label={isOnline ? 'Online' : 'Offline'}
          color={isOnline ? 'success' : 'error'}
          size="small"
        />
        
        <Tooltip title="Sincronizar datos">
          <IconButton
            onClick={handleSync}
            disabled={isSyncing || !isOnline}
            size="small"
          >
            {isSyncing ? (
              <CircularProgress size={20} />
            ) : (
              <SyncIcon />
            )}
          </IconButton>
        </Tooltip>

        {showMessage && (
          <Typography variant="caption" color="text.secondary">
            {syncMessage}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SyncIcon />
            Estado de Sincronización
          </Typography>
          
          <Chip
            icon={isOnline ? <CloudDoneIcon /> : <CloudOffIcon />}
            label={isOnline ? 'Conectado' : 'Sin conexión'}
            color={isOnline ? 'success' : 'error'}
          />
        </Box>

        {isSyncing && <LinearProgress sx={{ mb: 2 }} />}

        {showMessage && (
          <Alert severity={syncMessage.includes('✅') ? 'success' : syncMessage.includes('❌') ? 'error' : 'info'} sx={{ mb: 2 }}>
            {syncMessage}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Dispositivo Actual
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getDeviceIcon()}
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {deviceId.split('_')[2]?.substring(0, 8) || 'Unknown'}
              </Typography>
            </Box>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Última Sincronización
            </Typography>
            <Typography variant="body2">
              {formatLastSync()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={isSyncing ? <CircularProgress size={16} /> : <SyncIcon />}
            onClick={handleSync}
            disabled={isSyncing || !isOnline}
            size="small"
          >
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Todo'}
          </Button>



          <Button
            variant="text"
            startIcon={<RefreshIcon />}
            onClick={loadSyncStatus}
            size="small"
          >
            Actualizar Estado
          </Button>
        </Box>

        <Box sx={{ mt: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            💡 <strong>Consejos:</strong><br />
            • Los cambios se sincronizan automáticamente cuando hay internet<br />
            • Si cambias algo en móvil, sincroniza desde PC para ver los cambios<br />
            • "Enviar Cambios" sube tus cambios locales a la nube
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

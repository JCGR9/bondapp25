import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Paper,
} from '@mui/material';
import {
  CloudUpload as CloudIcon,
  BugReport as DebugIcon,
} from '@mui/icons-material';
import { googleAuthService } from '../services/googleAuthService';

const GoogleDriveDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      await googleAuthService.initialize();
      const info = googleAuthService.getDebugInfo();
      setDebugInfo(info);
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const testDriveAccess = async () => {
    try {
      const token = await googleAuthService.getAccessToken();
      alert(`Token disponible: ${token.substring(0, 20)}...`);
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', my: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <DebugIcon color="primary" />
          <Typography variant="h6">
            Google Drive - Estado de Debug
          </Typography>
        </Box>

        {debugInfo && (
          <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="subtitle2" gutterBottom>
              Estado del Sistema:
            </Typography>
            <pre style={{ fontSize: '12px', margin: 0 }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </Paper>
        )}

        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={checkStatus}
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Verificar Estado'}
          </Button>
          
          <Button
            variant="contained"
            onClick={testDriveAccess}
            color="secondary"
          >
            Probar Token
          </Button>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Este componente es solo para debug. Si "isReady" es false, Google Drive no funcionará.
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default GoogleDriveDebug;

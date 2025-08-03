import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Chip,
} from '@mui/material';
import {
  CloudUpload as CloudIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { googleAuthService } from '../services/googleAuthService';

const ElectronGoogleAuth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      await googleAuthService.initialize();
      setIsAuthorized(googleAuthService.isReady());
      if (googleAuthService.isReady()) {
        setActiveStep(2);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleAuthorize = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await googleAuthService.authorize();
      setActiveStep(1);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Por favor, autoriza')) {
        setActiveStep(1);
        setError(null);
      } else {
        setError(`Error al iniciar autorización: ${error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (!authCode.trim()) {
      setError('Por favor, ingresa el código de autorización');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await googleAuthService.exchangeCodeForTokens(authCode.trim());
      setIsAuthorized(true);
      setActiveStep(2);
      setAuthCode('');
    } catch (error) {
      setError(`Error al procesar código: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const showUrlManually = async () => {
    try {
      await googleAuthService.initialize();
      const credentials = await googleAuthService.getAuthClient();
      
      const params = new URLSearchParams({
        client_id: credentials.client_id,
        redirect_uri: credentials.redirect_uris[0],
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata',
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent'
      });

      const authUrl = `${credentials.auth_uri}?${params.toString()}`;
      
      // Mostrar la URL en un cuadro de diálogo para copiar
      const confirmed = window.confirm(
        `Copia esta URL y ábrela en tu navegador:\n\n${authUrl}\n\n¿Quieres continuar con el proceso de autorización?`
      );
      
      if (confirmed) {
        setActiveStep(1);
      }
    } catch (error) {
      setError(`Error al generar URL: ${error}`);
    }
  };

  const steps = [
    'Iniciar autorización',
    'Ingresar código',
    'Conexión establecida'
  ];

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', my: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <CloudIcon color="primary" />
          <Typography variant="h6">
            Configuración Google Drive - Electron
          </Typography>
          {isAuthorized && (
            <Chip 
              icon={<CheckIcon />} 
              label="Conectado" 
              color="success" 
              size="small" 
            />
          )}
        </Box>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!isAuthorized && (
          <>
            {activeStep === 0 && (
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Para usar Google Drive, necesitas autorizar la aplicación
                </Typography>
                <Box display="flex" flexDirection="column" gap={2} alignItems="center">
                  <Button
                    variant="contained"
                    onClick={handleAuthorize}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <LaunchIcon />}
                    size="large"
                  >
                    {loading ? 'Abriendo navegador...' : 'Autorizar Google Drive'}
                  </Button>
                  
                  <Typography variant="caption" color="text.secondary">
                    ¿No se abre el navegador?
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    onClick={showUrlManually}
                    size="small"
                    color="secondary"
                  >
                    Mostrar URL para copiar
                  </Button>
                </Box>
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Se ha abierto tu navegador. Autoriza la aplicación y copia el código que aparece.
                </Alert>
                <TextField
                  fullWidth
                  label="Código de autorización"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="Pega aquí el código de autorización"
                  margin="normal"
                />
                <Box mt={2} display="flex" gap={2}>
                  <Button
                    variant="contained"
                    onClick={handleCodeSubmit}
                    disabled={loading || !authCode.trim()}
                    startIcon={loading ? <CircularProgress size={20} /> : undefined}
                  >
                    {loading ? 'Procesando...' : 'Confirmar código'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(0)}
                    disabled={loading}
                  >
                    Volver
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}

        {isAuthorized && (
          <Box textAlign="center">
            <CheckIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" color="success.main" mb={1}>
              ¡Google Drive conectado!
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Ya puedes subir archivos a Google Drive desde los módulos de Contratos y Partituras.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                localStorage.removeItem('google_tokens');
                setIsAuthorized(false);
                setActiveStep(0);
              }}
              size="small"
            >
              Desconectar
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ElectronGoogleAuth;

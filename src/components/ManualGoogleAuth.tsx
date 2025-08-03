import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Paper,
} from '@mui/material';
import {
  CloudUpload as CloudIcon,
  CheckCircle as CheckIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { googleAuthService } from '../services/googleAuthService';

const ManualGoogleAuth: React.FC = () => {
  const [authCode, setAuthCode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  // URL de autorización manual (con tus credenciales)
  const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=36237009638-q3gbare7ci1vi79ldv4sb0m5pleih62c.apps.googleusercontent.com&redirect_uri=http://localhost:5174&scope=https://www.googleapis.com/auth/drive.file%20https://www.googleapis.com/auth/drive.appdata&response_type=code&access_type=offline&prompt=consent`;

  const copyUrlToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(authUrl);
      alert('¡URL copiada al portapapeles!');
      setActiveStep(1);
    } catch (error) {
      // Fallback si no funciona el clipboard
      const textArea = document.createElement('textarea');
      textArea.value = authUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('¡URL copiada al portapapeles!');
      setActiveStep(1);
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

  const steps = [
    'Copiar URL',
    'Autorizar en navegador',
    'Conexión establecida'
  ];

  if (isAuthorized) {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto', my: 2 }}>
        <CardContent>
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 700, mx: 'auto', my: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <CloudIcon color="primary" />
          <Typography variant="h6">
            Configuración Google Drive - Manual
          </Typography>
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

        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Paso 1: Copia la URL de autorización
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Haz clic en "Copiar URL" y luego pégala en tu navegador web
            </Typography>
            
            <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                URL de autorización:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  wordBreak: 'break-all', 
                  fontSize: '0.8rem',
                  fontFamily: 'monospace'
                }}
              >
                {authUrl}
              </Typography>
            </Paper>

            <Box textAlign="center">
              <Button
                variant="contained"
                onClick={copyUrlToClipboard}
                startIcon={<CopyIcon />}
                size="large"
              >
                Copiar URL y continuar
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Paso 2: Autorizar en el navegador
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                1. Pega la URL copiada en tu navegador<br/>
                2. Inicia sesión en Google si es necesario<br/>
                3. Autoriza la aplicación BondApp<br/>
                4. <strong>Importante:</strong> Después de autorizar, Google te redirigirá a localhost:5174<br/>
                5. La página puede mostrar error (es normal)<br/>
                6. <strong>En la barra de direcciones</strong>, busca <code>?code=</code><br/>
                7. Copia todo el código que aparece después de <code>code=</code> hasta el siguiente <code>&</code><br/>
                8. Pégalo en el campo de abajo
              </Typography>
            </Alert>

            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Ejemplo:</strong><br/>
                Si la URL es: <code>http://localhost:5174/?code=4/0AfJohXlih8aR9Q-ejemplo&scope=...</code><br/>
                El código sería: <code>4/0AfJohXlih8aR9Q-ejemplo</code>
              </Typography>
            </Alert>

            <TextField
              fullWidth
              label="Código de autorización"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="Pega aquí el código de autorización de Google"
              margin="normal"
              multiline
              rows={3}
            />
            
            <Box mt={2} display="flex" gap={2}>
              <Button
                variant="contained"
                onClick={handleCodeSubmit}
                disabled={loading || !authCode.trim()}
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
      </CardContent>
    </Card>
  );
};

export default ManualGoogleAuth;

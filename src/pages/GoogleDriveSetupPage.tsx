import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Alert,
  TextField,
  CircularProgress,
  Stack,
  Paper,
  Divider
} from '@mui/material';
import {
  CloudQueue as CloudIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import { googleAuthService } from '../services/googleAuthService';
import { fileVerificationService } from '../services/fileVerificationService';

const GoogleDriveSetupPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [authUrl, setAuthUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    checkCurrentStatus();
  }, []);

  const checkCurrentStatus = async () => {
    try {
      const isReady = googleAuthService.isReady();
      if (isReady) {
        setSuccess(true);
        setStep(4);
      } else {
        generateAuthUrl();
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const generateAuthUrl = () => {
    try {
      const url = googleAuthService.getAuthUrl();
      setAuthUrl(url);
      setStep(2);
    } catch (error) {
      setError('Error generando URL de autorización: ' + error);
    }
  };

  const handleAuthorize = () => {
    window.open(authUrl, '_blank');
    setStep(3);
  };

  const handleSubmitCode = async () => {
    if (!authCode.trim()) {
      setError('Por favor ingresa el código de autorización');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔑 Intercambiando código por tokens...');
      await googleAuthService.exchangeCodeForTokens(authCode.trim());
      
      console.log('✅ Tokens obtenidos, verificando acceso...');
      const verification = await fileVerificationService.verifyGoogleDriveAccess();
      
      if (verification.canSave) {
        setSuccess(true);
        setStep(4);
        console.log('🎉 Google Drive configurado exitosamente!');
      } else {
        setError(`Error verificando acceso: ${verification.issue}`);
      }
    } catch (error) {
      console.error('❌ Error configurando Google Drive:', error);
      setError('Error configurando Google Drive: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAccess = async () => {
    setLoading(true);
    try {
      const result = await fileVerificationService.verifyGoogleDriveAccess();
      if (result.canSave) {
        alert('✅ Google Drive funciona perfectamente!');
      } else {
        alert('❌ Error: ' + result.issue);
      }
    } catch (error) {
      alert('❌ Error probando acceso: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        🔧 Configuración de Google Drive
      </Typography>

      {/* Paso 1: Verificando estado */}
      {step === 1 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">
              Verificando configuración actual...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Paso 2: Mostrar URL de autorización */}
      {step === 2 && (
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Box sx={{ textAlign: 'center' }}>
                <CloudIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Paso 1: Autorizar Google Drive
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Necesitas autorizar BondApp para acceder a tu Google Drive
                </Typography>
              </Box>

              <Alert severity="info">
                <Typography variant="body2">
                  <strong>¿Qué va a pasar?</strong><br/>
                  1. Se abrirá una ventana de Google<br/>
                  2. Te pedirá autorizar BondApp<br/>
                  3. Te redirigirá con un código<br/>
                  4. Pegas ese código aquí
                </Typography>
              </Alert>

              <Button
                variant="contained"
                size="large"
                startIcon={<LaunchIcon />}
                onClick={handleAuthorize}
                sx={{ py: 2 }}
              >
                Abrir Google para Autorizar
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Paso 3: Ingresar código */}
      {step === 3 && (
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                  Paso 2: Ingresar Código de Autorización
                </Typography>
              </Box>

              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Después de autorizar en Google:</strong><br/>
                  1. Serás redirigido a una página (puede mostrar error, es normal)<br/>
                  2. En la URL del navegador busca: <code>?code=</code><br/>
                  3. Copia todo el código que aparece después de <code>code=</code><br/>
                  4. Pégalo en el campo de abajo
                </Typography>
              </Alert>

              <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  <strong>Ejemplo de URL:</strong><br/>
                  http://localhost:5174/?<span style={{backgroundColor: 'yellow'}}>code=4/0AfJohXlih8aR9Q-ejemplo-codigo-muy-largo</span>&scope=...
                </Typography>
              </Paper>

              <TextField
                label="Código de Autorización"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="4/0AfJohXlih8aR9Q-ejemplo-codigo-muy-largo"
                multiline
                rows={3}
                fullWidth
                helperText="Pega aquí el código que aparece después de 'code=' en la URL"
              />

              {error && (
                <Alert severity="error">
                  {error}
                </Alert>
              )}

              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={() => setStep(2)}
                >
                  Volver
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmitCode}
                  disabled={loading || !authCode.trim()}
                  sx={{ flex: 1 }}
                >
                  {loading ? <CircularProgress size={20} /> : 'Configurar Google Drive'}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Paso 4: Éxito */}
      {step === 4 && success && (
        <Card>
          <CardContent>
            <Stack spacing={3} sx={{ textAlign: 'center' }}>
              <CheckIcon sx={{ fontSize: 80, color: 'success.main', mx: 'auto' }} />
              
              <Typography variant="h5" color="success.main">
                ✅ Google Drive Configurado
              </Typography>
              
              <Typography color="text.secondary">
                BondApp ahora puede guardar archivos automáticamente en tu Google Drive
              </Typography>

              <Alert severity="success">
                <Typography variant="body2">
                  <strong>¡Todo listo!</strong><br/>
                  • Los contratos se guardarán automáticamente en la nube<br/>
                  • Las partituras se sincronizarán con Google Drive<br/>
                  • Tienes respaldo automático de todos tus datos
                </Typography>
              </Alert>

              <Divider />

              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  onClick={handleTestAccess}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : 'Probar Acceso'}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => window.history.back()}
                >
                  Volver al Dashboard
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default GoogleDriveSetupPage;

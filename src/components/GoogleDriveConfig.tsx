import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  CloudUpload as CloudIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { GoogleDriveTestService } from '../services/googleDriveTestService';

interface GoogleDriveConfigProps {
  compact?: boolean;
}

const GoogleDriveConfig: React.FC<GoogleDriveConfigProps> = ({ compact = false }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [configInfo, setConfigInfo] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await GoogleDriveTestService.testConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error inesperado: ${error}`,
        details: error
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCheckConfig = async () => {
    const config = await GoogleDriveTestService.getConfigurationInfo();
    setConfigInfo(config);
    setShowDetails(true);
  };

  const openSetupGuide = () => {
    // En Electron, podemos abrir archivos del sistema
    try {
      const { shell } = require('electron');
      const path = require('path');
      const setupPath = path.join(process.cwd(), 'GOOGLE_DRIVE_SETUP.md');
      shell.openPath(setupPath);
    } catch (error) {
      // Fallback: mostrar en consola
      console.log('📖 Abre el archivo GOOGLE_DRIVE_SETUP.md en la raíz del proyecto para ver la guía completa');
      alert('📖 Por favor, abre el archivo GOOGLE_DRIVE_SETUP.md en la raíz del proyecto para ver la guía completa');
    }
  };

  if (compact) {
    return (
      <Card sx={{ 
        background: 'linear-gradient(145deg, rgba(28, 28, 28, 0.95) 0%, rgba(40, 40, 40, 0.9) 100%)',
        border: '1px solid rgba(139, 0, 0, 0.3)',
        mb: 2
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CloudIcon sx={{ color: '#8B0000' }} />
              <Typography variant="h6" sx={{ color: '#FFFFFF' }}>
                Google Drive
              </Typography>
              {testResult && (
                <Chip
                  icon={testResult.success ? <CheckIcon /> : <ErrorIcon />}
                  label={testResult.success ? 'Conectado' : 'Error'}
                  color={testResult.success ? 'success' : 'error'}
                  size="small"
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                onClick={handleTestConnection}
                disabled={testing}
                sx={{ color: '#8B0000' }}
              >
                {testing ? <CircularProgress size={16} /> : 'Probar'}
              </Button>
              <Button
                size="small"
                onClick={openSetupGuide}
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                Configurar
              </Button>
            </Box>
          </Box>
          {testResult && !testResult.success && (
            <Alert severity="error" sx={{ mt: 1, fontSize: '0.8rem' }}>
              {testResult.message}
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      background: 'linear-gradient(145deg, rgba(28, 28, 28, 0.95) 0%, rgba(40, 40, 40, 0.9) 100%)',
      border: '1px solid rgba(139, 0, 0, 0.3)',
      mb: 3
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <CloudIcon sx={{ color: '#8B0000', fontSize: 32 }} />
          <Box>
            <Typography variant="h5" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
              ☁️ Google Drive Configuration
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Configuración y prueba de conexión con Google Drive
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={testing ? <CircularProgress size={20} /> : <CloudIcon />}
            onClick={handleTestConnection}
            disabled={testing}
            sx={{
              background: 'linear-gradient(135deg, #8B0000 0%, #A00000 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #A00000 0%, #BB0000 100%)',
              },
            }}
          >
            {testing ? 'Probando...' : 'Probar Conexión'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<InfoIcon />}
            onClick={handleCheckConfig}
            sx={{
              borderColor: '#8B0000',
              color: '#8B0000',
              '&:hover': {
                borderColor: '#A00000',
                backgroundColor: 'rgba(139, 0, 0, 0.1)',
              },
            }}
          >
            Revisar Configuración
          </Button>

          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={openSetupGuide}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Guía de Configuración
          </Button>
        </Box>

        {/* Resultado de la prueba */}
        {testResult && (
          <Alert 
            severity={testResult.success ? 'success' : 'error'} 
            sx={{ mb: 2 }}
            icon={testResult.success ? <CheckIcon /> : <ErrorIcon />}
          >
            <Typography variant="body2">
              {testResult.message}
            </Typography>
          </Alert>
        )}

        {/* Información de configuración */}
        {configInfo && showDetails && (
          <Accordion sx={{ 
            background: 'rgba(139, 0, 0, 0.1)', 
            border: '1px solid rgba(139, 0, 0, 0.3)',
            mb: 2
          }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#8B0000' }} />}>
              <Typography sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                📋 Detalles de Configuración
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    {configInfo.configured ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
                  </ListItemIcon>
                  <ListItemText 
                    primary="Estado de Configuración"
                    secondary={configInfo.message}
                    primaryTypographyProps={{ color: '#FFFFFF' }}
                    secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  />
                </ListItem>
                
                {configInfo.projectId && (
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon sx={{ color: '#8B0000' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Project ID"
                      secondary={configInfo.projectId}
                      primaryTypographyProps={{ color: '#FFFFFF' }}
                      secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    />
                  </ListItem>
                )}

                <ListItem>
                  <ListItemIcon>
                    {configInfo.clientIdExists ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
                  </ListItemIcon>
                  <ListItemText 
                    primary="Client ID"
                    secondary={configInfo.clientIdExists ? 'Configurado' : 'No configurado'}
                    primaryTypographyProps={{ color: '#FFFFFF' }}
                    secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    {configInfo.clientSecretExists ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
                  </ListItemIcon>
                  <ListItemText 
                    primary="Client Secret"
                    secondary={configInfo.clientSecretExists ? 'Configurado' : 'No configurado'}
                    primaryTypographyProps={{ color: '#FFFFFF' }}
                    secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  />
                </ListItem>

                {configInfo.isDefaultCredentials && (
                  <ListItem>
                    <ListItemIcon>
                      <ErrorIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="⚠️ Usando credenciales por defecto"
                      secondary="Reemplaza los valores placeholder en credentials.json"
                      primaryTypographyProps={{ color: '#FF9800' }}
                      secondaryTypographyProps={{ color: 'rgba(255, 152, 0, 0.7)' }}
                    />
                  </ListItem>
                )}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Instrucciones rápidas */}
        <Box sx={{ 
          p: 2, 
          background: 'rgba(33, 150, 243, 0.1)', 
          border: '1px solid rgba(33, 150, 243, 0.3)',
          borderRadius: 1
        }}>
          <Typography variant="body2" sx={{ color: '#2196F3', mb: 1, fontWeight: 600 }}>
            🚀 Pasos Rápidos:
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
            1. <strong>Crear proyecto</strong> en Google Cloud Console<br/>
            2. <strong>Habilitar</strong> Google Drive API<br/>
            3. <strong>Crear credenciales</strong> OAuth 2.0<br/>
            4. <strong>Actualizar</strong> credentials.json con tus datos<br/>
            5. <strong>Probar conexión</strong> con el botón de arriba
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GoogleDriveConfig;

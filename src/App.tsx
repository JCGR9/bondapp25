import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Alert, AlertTitle, useMediaQuery } from '@mui/material';
import LoginPage from './pages/LoginPage';
import DashboardRealData from './pages/DashboardRealData';
import InstrumentsManagerPage from './pages/InstrumentsManagerPage';
import UniformsManagerPage from './pages/UniformsManagerPage';
import ComponentsManagerPage from './pages/ComponentsManagerPage';
import PerformancesManagerPage from './pages/PerformancesManagerPage';
import InventoryManagerPage from './pages/InventoryManagerPage';
import ContractsManagerPageSimple from './pages/ContractsManagerPageSimple';
import FinancesPageSimple from './pages/FinancesPageSimple';
import FinancesManagerPage from './pages/FinancesManagerPage';
import ScoresManagerPage from './pages/ScoresManagerPage';
import StatisticsManagerPage from './pages/StatisticsManagerPage';
import TasksManagerPage from './pages/TasksManagerPage';
import GoogleDriveSetupPage from './pages/GoogleDriveSetupPage';
import Sidebar from './components/Sidebar';
import { validateEnvironment, logger, ENV } from './config/environment';

// Tema optimizado para móviles
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B0000',
    },
    background: {
      default: '#0A0A0A',
      paper: '#1C1C1C',
    },
  },
  typography: {
    // Tipografía optimizada para móviles
    h1: {
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
    },
    h2: {
      fontSize: 'clamp(1.25rem, 3.5vw, 2rem)',
    },
    h3: {
      fontSize: 'clamp(1.1rem, 3vw, 1.75rem)',
    },
    h4: {
      fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
    },
    h5: {
      fontSize: 'clamp(0.9rem, 2vw, 1.25rem)',
    },
    h6: {
      fontSize: 'clamp(0.8rem, 1.8vw, 1.1rem)',
    },
    body1: {
      fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
    },
    body2: {
      fontSize: 'clamp(0.75rem, 1.3vw, 0.875rem)',
    },
  },
  components: {
    // Componentes optimizados para móviles
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: '44px', // Tamaño mínimo para touch
          fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: '44px',
          minHeight: '44px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          margin: '8px',
          borderRadius: '12px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px 4px',
          fontSize: 'clamp(0.75rem, 1.3vw, 0.875rem)',
          '@media (max-width: 768px)': {
            padding: '4px 2px',
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [envValidation, setEnvValidation] = useState(validateEnvironment());
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Detectar si es móvil
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Verificar configuración al cargar
  useEffect(() => {
    const validation = validateEnvironment();
    setEnvValidation(validation);
    
    if (!validation.isValid) {
      logger.error('Variables de entorno faltantes:', validation.missingVars);
    } else {
      logger.info('Configuración de entorno válida');
      logger.info(`Ejecutando en modo: ${ENV.isProduction ? 'Producción' : 'Desarrollo'}`);
    }

    // SIEMPRE empezar en login - no verificar sesión guardada
    logger.info('Aplicación iniciada - mostrando login');
  }, []);

  const handleLogin = () => {
    logger.info('Handling login');
    setIsAuthenticated(true);
    // No guardar en localStorage - solo sesión temporal
    logger.info('Login successful - session temporal');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Eliminado: localStorage, todo en Firebase
    logger.info('User logged out - back to login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Mostrar aviso si faltan variables de entorno (solo en desarrollo)
  if (!envValidation.isValid && !ENV.isProduction) {
    console.warn('Variables de entorno faltantes:', envValidation.missingVars);
    // En producción (Netlify) continuamos sin mostrar error
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginPage onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar 
          currentPage={currentPage} 
          onNavigate={setCurrentPage} 
          onLogout={handleLogout}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          onMobileToggle={handleDrawerToggle}
          isMobile={isMobile}
        />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: isMobile ? 1 : 3,
            width: { sm: `calc(100% - 240px)` },
            ml: { sm: '240px' },
            mt: isMobile ? '64px' : 0, // Espacio para la AppBar en móvil
          }}
        >
          {currentPage === 'dashboard' && <DashboardRealData onNavigate={setCurrentPage} />}
          {currentPage === 'instruments-manager' && <InstrumentsManagerPage />}
          {currentPage === 'uniforms-manager' && <UniformsManagerPage />}
          {currentPage === 'components-manager' && <ComponentsManagerPage />}
          {currentPage === 'performances-manager' && <PerformancesManagerPage />}
          {currentPage === 'finances' && <FinancesPageSimple onNavigate={setCurrentPage} />}
          {currentPage === 'finances-manager' && <FinancesManagerPage />}
          {currentPage === 'scores-manager' && <ScoresManagerPage />}
          {currentPage === 'inventory-manager' && <InventoryManagerPage />}
          {currentPage === 'contracts-manager' && <ContractsManagerPageSimple />}
          {currentPage === 'statistics' && <StatisticsManagerPage />}
          {currentPage === 'management' && <TasksManagerPage />}
          {currentPage === 'google-drive-setup' && <GoogleDriveSetupPage />}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;

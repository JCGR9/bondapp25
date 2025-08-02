import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import LoginPage from './pages/LoginPage';
import DashboardRealData from './pages/DashboardRealData';
import InstrumentsManagerPage from './pages/InstrumentsManagerPage';
import UniformsManagerPage from './pages/UniformsManagerPage';
import ComponentsManagerPage from './pages/ComponentsManagerPage';
import PerformancesManagerPage from './pages/PerformancesManagerPage';
import InventoryManagerPage from './pages/InventoryManagerPage';
import ContractsManagerPage from './pages/ContractsManagerPage';
import FinancesPageSimple from './pages/FinancesPageSimple';
import FinancesManagerPage from './pages/FinancesManagerPage';
import ScoresManagerPage from './pages/ScoresManagerPage';
import StatisticsManagerPage from './pages/StatisticsManagerPage';
import TasksManagerPage from './pages/TasksManagerPage';
import Sidebar from './components/Sidebar';

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
});

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const savedAuth = localStorage.getItem('bondapp_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('bondapp_authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('bondapp_authenticated');
  };

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
      <Box sx={{ display: 'flex' }}>
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {currentPage === 'dashboard' && <DashboardRealData />}
          {currentPage === 'instruments-manager' && <InstrumentsManagerPage />}
          {currentPage === 'uniforms-manager' && <UniformsManagerPage />}
          {currentPage === 'components-manager' && <ComponentsManagerPage />}
          {currentPage === 'performances-manager' && <PerformancesManagerPage />}
          {currentPage === 'finances' && <FinancesPageSimple onNavigate={setCurrentPage} />}
          {currentPage === 'finances-manager' && <FinancesManagerPage />}
          {currentPage === 'scores-manager' && <ScoresManagerPage />}
          {currentPage === 'inventory-manager' && <InventoryManagerPage />}
          {currentPage === 'contracts-manager' && <ContractsManagerPage />}
          {currentPage === 'statistics' && <StatisticsManagerPage />}
          {currentPage === 'management' && <TasksManagerPage />}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;

import React, { useState } from 'react';
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

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginPage onLogin={() => setIsAuthenticated(true)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
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

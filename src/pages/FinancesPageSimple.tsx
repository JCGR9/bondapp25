import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';

interface FinancesPageSimpleProps {
  onNavigate?: (page: string) => void;
}

const FinancesPageSimple: React.FC<FinancesPageSimpleProps> = ({ onNavigate }) => {
  const handleGoToManager = () => {
    if (onNavigate) {
      onNavigate('finances-manager');
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#8B0000', mb: 3 }}>
        💰 Finanzas
      </Typography>

      {/* Welcome Card */}
      <Card sx={{ 
        maxWidth: 600,
        margin: '0 auto',
        bgcolor: 'rgba(255, 255, 255, 0.05)', 
        backdropFilter: 'blur(10px)',
        textAlign: 'center'
      }}>
        <CardContent sx={{ p: 4 }}>
          <AccountBalanceIcon sx={{ fontSize: 80, color: '#8B0000', mb: 3 }} />
          
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            Sistema de Gestión Financiera
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Gestiona los ingresos y gastos de tu banda de forma profesional con nuestro 
            completo sistema de contabilidad que incluye libro diario, análisis financiero 
            y reportes detallados.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#8B0000' }}>
              Características principales:
            </Typography>
            
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                📋 <strong>Libro Diario:</strong> Registro cronológico de todas las operaciones
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                🎵 <strong>Categorías Musicales:</strong> Clasificación específica para bandas
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                📊 <strong>Análisis Financiero:</strong> Gráficos y estadísticas en tiempo real
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                📈 <strong>Reportes:</strong> Exportación a CSV y análisis de períodos
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                💳 <strong>Múltiples Métodos de Pago:</strong> Efectivo, transferencias, tarjetas
              </Typography>
              <Typography variant="body2">
                🏷️ <strong>Sistema de Etiquetas:</strong> Organización avanzada de registros
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<LaunchIcon />}
            onClick={handleGoToManager}
            sx={{ 
              bgcolor: '#8B0000', 
              '&:hover': { bgcolor: '#660000' },
              px: 4,
              py: 1.5
            }}
          >
            Acceder al Sistema Financiero
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats Cards */}
      <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Card sx={{ 
          minWidth: 200,
          bgcolor: 'rgba(76, 175, 80, 0.1)', 
          border: '1px solid rgba(76, 175, 80, 0.3)'
        }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
              Ingresos
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Conciertos, ventas, grabaciones
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          minWidth: 200,
          bgcolor: 'rgba(244, 67, 54, 0.1)', 
          border: '1px solid rgba(244, 67, 54, 0.3)'
        }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" sx={{ color: '#F44336', fontWeight: 'bold' }}>
              Gastos
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Instrumentos, alquileres, promoción
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ 
          minWidth: 200,
          bgcolor: 'rgba(33, 150, 243, 0.1)', 
          border: '1px solid rgba(33, 150, 243, 0.3)'
        }}>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
              Balance
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Control total de la situación
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default FinancesPageSimple;

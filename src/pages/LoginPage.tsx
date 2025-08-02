import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
} from '@mui/material';
import bondadLogo from '../assets/bondad.png';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    console.log('🔐 LoginPage: Attempting login with', username, password);
    if (username === 'admin' && password === 'admin') {
      console.log('✅ LoginPage: Credentials valid, calling onLogin');
      onLogin();
    } else {
      console.log('❌ LoginPage: Invalid credentials');
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #2A2A2A 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 30%, rgba(139, 0, 0, 0.1) 0%, transparent 50%)',
          zIndex: 1,
        },
      }}
    >
      <Paper
        elevation={24}
        sx={{
          p: 5,
          width: '100%',
          maxWidth: 450,
          position: 'relative',
          zIndex: 2,
          background: 'linear-gradient(145deg, rgba(28, 28, 28, 0.95) 0%, rgba(40, 40, 40, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 0, 0, 0.3)',
          borderRadius: 3,
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Logo y Título */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={bondadLogo}
            sx={{
              width: 80,
              height: 80,
              mb: 2,
              border: '3px solid rgba(139, 0, 0, 0.3)',
              boxShadow: '0 8px 25px rgba(139, 0, 0, 0.3)',
            }}
          />
          <Typography
            variant="h3"
            align="center"
            sx={{
              color: 'transparent',
              background: 'linear-gradient(135deg, #8B0000 0%, #FF4444 50%, #8B0000 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textShadow: '0 2px 10px rgba(139, 0, 0, 0.3)',
              mb: 1,
            }}
          >
            BondApp
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontWeight: 300,
              letterSpacing: '1px',
            }}
          >
            Sistema de Gestión Musical
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              backgroundColor: 'rgba(139, 0, 0, 0.1)',
              color: '#FF6B6B',
              border: '1px solid rgba(139, 0, 0, 0.3)',
              '& .MuiAlert-icon': {
                color: '#8B0000',
              },
            }}
          >
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Usuario"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              '& fieldset': {
                borderColor: 'rgba(139, 0, 0, 0.3)',
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(139, 0, 0, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8B0000',
                borderWidth: '2px',
                boxShadow: '0 0 15px rgba(139, 0, 0, 0.3)',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: '#8B0000',
              },
            },
            '& .MuiOutlinedInput-input': {
              color: '#FFFFFF',
            },
          }}
        />

        <TextField
          fullWidth
          label="Contraseña"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{
            mb: 4,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              '& fieldset': {
                borderColor: 'rgba(139, 0, 0, 0.3)',
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(139, 0, 0, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8B0000',
                borderWidth: '2px',
                boxShadow: '0 0 15px rgba(139, 0, 0, 0.3)',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: '#8B0000',
              },
            },
            '& .MuiOutlinedInput-input': {
              color: '#FFFFFF',
            },
          }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          sx={{
            height: 56,
            background: 'linear-gradient(135deg, #8B0000 0%, #A00000 50%, #8B0000 100%)',
            border: '1px solid rgba(139, 0, 0, 0.3)',
            borderRadius: 2,
            fontSize: '1.1rem',
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'none',
            boxShadow: '0 8px 25px rgba(139, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: 'linear-gradient(135deg, #A00000 0%, #BB0000 50%, #A00000 100%)',
              boxShadow: '0 12px 35px rgba(139, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0px)',
              boxShadow: '0 4px 15px rgba(139, 0, 0, 0.4)',
            },
          }}
        >
          Iniciar Sesión
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;

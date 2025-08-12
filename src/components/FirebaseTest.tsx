import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Alert, CircularProgress } from '@mui/material';
import { db } from '../config/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const FirebaseTest: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error' | 'offline'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Verificar si estamos en modo offline
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const offlineMode = import.meta.env.VITE_USE_OFFLINE_MODE;
    
    if (!apiKey || apiKey === '' || offlineMode === 'true') {
      setStatus('offline');
      setMessage('🔧 Modo offline activado - Los datos se guardan localmente');
    }
  }, []);

  const testFirebase = async () => {
    setStatus('testing');
    setMessage('Probando conexión a Firebase...');

    try {
      // Intentar escribir un documento de prueba
      const testData = {
        test: 'BondApp Firebase Test',
        timestamp: serverTimestamp(),
        deviceId: `test_${Date.now()}`
      };

      const docRef = doc(db, 'bondapp_test', 'connection_test');
      await setDoc(docRef, testData);

      // Intentar leer el documento
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setStatus('success');
        setMessage('✅ Firebase conectado correctamente! Los datos se guardarán en la nube.');
      } else {
        setStatus('error');
        setMessage('❌ Error: No se pudo leer el documento de Firebase');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Error conectando a Firebase: ${error.message}`);
      console.error('Firebase error:', error);
    }
  };

  if (status === 'offline') {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mb: 4 }}>
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            🔧 Modo Desarrollo Local
          </Typography>
          <Typography variant="body2">
            BondApp está funcionando en modo offline. Los datos se guardan localmente.
            <br /><br />
            <strong>Para activar la nube:</strong>
            <br />1. Ve a <a href="https://console.firebase.google.com/" target="_blank">Firebase Console</a>
            <br />2. Crea un proyecto nuevo
            <br />3. Configura Firestore Database
            <br />4. Actualiza las credenciales en .env.local
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        🔥 Prueba de Conexión Firebase
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Verifica que BondApp puede conectarse a Firebase para guardar datos en la nube.
      </Typography>

      <Button 
        variant="contained" 
        onClick={testFirebase}
        disabled={status === 'testing'}
        sx={{ mb: 2 }}
      >
        {status === 'testing' ? <CircularProgress size={20} /> : 'Probar Firebase'}
      </Button>

      {message && (
        <Alert 
          severity={status === 'success' ? 'success' : status === 'error' ? 'error' : 'info'}
          sx={{ mt: 2 }}
        >
          {message}
        </Alert>
      )}

      {status === 'success' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>¡Perfecto!</strong> Ahora todos los datos de BondApp se guardarán automáticamente en Firebase:
            <br />• Actuaciones, componentes, contratos
            <br />• Inventario, finanzas, partituras
            <br />• Sincronización automática entre dispositivos
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default FirebaseTest;

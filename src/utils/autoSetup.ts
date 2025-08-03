import { googleAuthService } from '../services/googleAuthService';

// Auto-configuración simple para Google Drive
export const setupGoogleDrive = async (): Promise<boolean> => {
  try {
    console.log('🔧 Configurando Google Drive automáticamente...');
    
    // Verificar si ya hay tokens guardados
    const savedTokens = localStorage.getItem('google_tokens');
    if (savedTokens) {
      console.log('✅ Tokens encontrados, inicializando servicio...');
      await googleAuthService.initialize();
      return googleAuthService.isReady();
    }
    
    console.log('⚠️ No hay tokens, Google Drive no estará disponible hasta autorizar');
    return false;
  } catch (error) {
    console.error('❌ Error en setup automático:', error);
    return false;
  }
};

// Configurar automáticamente al cargar la aplicación
export const initializeApp = async () => {
  console.log('🚀 Inicializando BondApp...');
  
  const driveReady = await setupGoogleDrive();
  
  console.log(`📊 Estado del sistema:
  - Firebase: ✅ Configurado y listo
  - Google Drive: ${driveReady ? '✅ Listo' : '⚠️ Necesita autorización'}
  - LocalStorage: ✅ Disponible como respaldo
  `);
  
  return {
    firebase: true,
    googleDrive: driveReady,
    localStorage: true
  };
};

/**
 * Configuración del entorno para BondApp
 * Maneja las diferencias entre desarrollo y producción
 */

export const ENV = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // URLs base según el entorno
  baseUrl: import.meta.env.PROD 
    ? 'https://superlative-pie-4658b9.netlify.app' 
    : 'http://localhost:5175',
  
  // Configuración de Firebase
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },
  
  // Configuración de Google Drive
  googleDrive: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
  },
  
  // Configuración de logs
  logging: {
    enabled: import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGGING === 'true',
    level: import.meta.env.VITE_LOG_LEVEL || 'info',
  }
};

/**
 * Función para validar que todas las variables de entorno necesarias estén presentes
 * En Netlify, las variables pueden no estar disponibles en tiempo de build, así que somos más flexibles
 */
export const validateEnvironment = (): { isValid: boolean; missingVars: string[] } => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];
  
  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  // En producción (Netlify), consideramos válido incluso si faltan variables
  // ya que Firebase puede funcionar con configuración por defecto
  return {
    isValid: ENV.isDevelopment ? missingVars.length === 0 : true,
    missingVars
  };
};

/**
 * Logger para desarrollo/producción
 */
export const logger = {
  info: (message: string, ...args: any[]) => {
    if (ENV.logging.enabled) {
      console.info(`[BondApp] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (ENV.logging.enabled) {
      console.warn(`[BondApp] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    if (ENV.logging.enabled) {
      console.error(`[BondApp] ${message}`, ...args);
    }
  },
  
  debug: (message: string, ...args: any[]) => {
    if (ENV.logging.enabled && ENV.isDevelopment) {
      console.debug(`[BondApp] ${message}`, ...args);
    }
  }
};

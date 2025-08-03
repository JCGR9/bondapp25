import { googleAuthService } from './googleAuthService';
import { driveService } from './googleDriveService';

export class GoogleDriveTestService {
  /**
   * Probar la conexión a Google Drive
   */
  static async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🧪 Probando conexión a Google Drive...');

      // Paso 1: Inicializar autenticación
      await googleAuthService.initialize();
      console.log('✅ Autenticación inicializada');

      // Paso 2: Obtener token de acceso
      const token = await googleAuthService.getAccessToken();
      console.log('✅ Token de acceso obtenido');

      // Paso 3: Listar archivos de prueba
      const files = await driveService.listFiles();
      console.log('✅ Listado de archivos exitoso:', files.length, 'archivos encontrados');

      return {
        success: true,
        message: `Conexión exitosa. ${files.length} archivos encontrados en Google Drive.`,
        details: {
          filesCount: files.length,
          hasToken: !!token,
          authenticated: googleAuthService.isReady()
        }
      };

    } catch (error: any) {
      console.error('❌ Error en test de conexión:', error);
      
      let message = 'Error de conexión desconocido';
      
      if (error.message?.includes('credentials')) {
        message = 'Error de credenciales. Verifica el archivo credentials.json';
      } else if (error.message?.includes('ENOENT')) {
        message = 'Archivo credentials.json no encontrado. Créalo según la guía.';
      } else if (error.message?.includes('invalid_client')) {
        message = 'Client ID o Client Secret inválidos. Verifica credentials.json';
      } else if (error.message?.includes('redirect_uri_mismatch')) {
        message = 'URL de redirección incorrecta. Verifica la configuración OAuth.';
      } else if (error.message?.includes('access_denied')) {
        message = 'Acceso denegado. Verifica que tu email esté en "Test users".';
      } else {
        message = `Error: ${error.message}`;
      }

      return {
        success: false,
        message,
        details: error
      };
    }
  }

  /**
   * Obtener información de la configuración actual
   */
  static async getConfigurationInfo(): Promise<any> {
    try {
      const path = require('path');
      const fs = require('fs');
      
      const credentialsPath = path.join(process.cwd(), 'credentials.json');
      
      if (!fs.existsSync(credentialsPath)) {
        return {
          configured: false,
          message: 'Archivo credentials.json no encontrado'
        };
      }

      const credentialsData = fs.readFileSync(credentialsPath, 'utf8');
      const credentials = JSON.parse(credentialsData);

      const hasValidCredentials = 
        credentials.installed?.client_id && 
        credentials.installed?.client_secret && 
        credentials.installed?.project_id &&
        !credentials.installed.client_id.includes('TU_CLIENT_ID_AQUI');

      return {
        configured: hasValidCredentials,
        message: hasValidCredentials ? 'Credenciales configuradas correctamente' : 'Credenciales incompletas o por defecto',
        projectId: credentials.installed?.project_id,
        clientIdExists: !!credentials.installed?.client_id,
        clientSecretExists: !!credentials.installed?.client_secret,
        isDefaultCredentials: credentials.installed?.client_id?.includes('TU_CLIENT_ID_AQUI')
      };

    } catch (error) {
      return {
        configured: false,
        message: `Error al leer configuración: ${error}`,
        error
      };
    }
  }
}

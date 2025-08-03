import { GoogleDriveService } from './googleDriveService';
import { googleAuthService } from './googleAuthService';

const googleDriveService = new GoogleDriveService();

interface VerificationResult {
  canSave: boolean;
  issue?: string;
  solution?: string;
  details?: any;
}

class FileVerificationService {
  async verifyGoogleDriveAccess(): Promise<VerificationResult> {
    try {
      console.log('🔍 Verificando acceso a Google Drive...');
      
      // 1. Verificar si el servicio de autenticación está listo
      if (!googleAuthService.isReady()) {
        return {
          canSave: false,
          issue: 'Google Drive no está autorizado',
          solution: 'Necesitas autorizar el acceso a Google Drive primero'
        };
      }

      // 2. Intentar obtener token de acceso
      const token = await googleAuthService.getAccessToken();
      if (!token) {
        return {
          canSave: false,
          issue: 'No se puede obtener token de acceso',
          solution: 'Reautorizar acceso a Google Drive'
        };
      }

      // 3. Verificar si podemos crear carpetas
      const testFolderResult = await this.verifyFolderCreation();
      if (!testFolderResult.success) {
        return {
          canSave: false,
          issue: 'No se pueden crear carpetas en Google Drive',
          solution: 'Verificar permisos de Google Drive',
          details: testFolderResult
        };
      }

      // 4. Intentar subir un archivo de prueba
      const testUploadResult = await this.verifyFileUpload();
      if (!testUploadResult.success) {
        return {
          canSave: false,
          issue: 'No se pueden subir archivos a Google Drive',
          solution: 'Verificar permisos de escritura en Google Drive',
          details: testUploadResult
        };
      }

      console.log('✅ Google Drive completamente funcional');
      return {
        canSave: true,
        details: {
          folderTest: testFolderResult,
          uploadTest: testUploadResult
        }
      };

    } catch (error) {
      console.error('❌ Error verificando Google Drive:', error);
      return {
        canSave: false,
        issue: 'Error inesperado verificando Google Drive',
        solution: 'Revisar consola para más detalles',
        details: error
      };
    }
  }

  private async verifyFolderCreation(): Promise<{ success: boolean; folderId?: string, error?: any }> {
    try {
      const testFolderName = `BondApp_Test_${Date.now()}`;
      const folderResult = await googleDriveService.createFolder(testFolderName);
      
      if (folderResult && folderResult.id) {
        // Limpiar: eliminar carpeta de prueba
        try {
          await googleDriveService.deleteFile(folderResult.id);
        } catch (cleanupError) {
          console.warn('No se pudo limpiar carpeta de prueba:', cleanupError);
        }
        
        return { success: true, folderId: folderResult.id };
      }
      
      return { success: false, error: 'No se pudo crear carpeta' };
    } catch (error) {
      return { success: false, error };
    }
  }

  private async verifyFileUpload(): Promise<{ success: boolean; fileId?: string, error?: any }> {
    try {
      const testContent = `BondApp Test File - ${new Date().toISOString()}`;
      const testFileName = `test_${Date.now()}.txt`;
      
      // Crear archivo Blob para subir
      const blob = new Blob([testContent], { type: 'text/plain' });
      const file = new File([blob], testFileName, { type: 'text/plain' });
      
      const fileResult = await googleDriveService.uploadFile(file);
      
      if (fileResult && fileResult.id) {
        // Limpiar: eliminar archivo de prueba
        try {
          await googleDriveService.deleteFile(fileResult.id);
        } catch (cleanupError) {
          console.warn('No se pudo limpiar archivo de prueba:', cleanupError);
        }
        
        return { success: true, fileId: fileResult.id };
      }
      
      return { success: false, error: 'No se pudo subir archivo' };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Función para diagnosticar problemas específicos de guardado
  async diagnoseFileSaveIssue(fileName: string, content: any): Promise<VerificationResult> {
    try {
      console.log(`🔍 Diagnosticando problema de guardado para: ${fileName}`);
      
      // 1. Verificar acceso general
      const accessCheck = await this.verifyGoogleDriveAccess();
      if (!accessCheck.canSave) {
        return accessCheck;
      }

      // 2. Verificar tamaño del contenido
      const contentString = JSON.stringify(content);
      const contentSize = contentString.length;
      if (contentSize > 10 * 1024 * 1024) { // 10MB
        return {
          canSave: false,
          issue: 'Archivo demasiado grande',
          solution: 'El archivo excede 10MB, considera dividirlo',
          details: { size: contentSize }
        };
      }

      // 3. Intentar guardado real
      try {
        const blob = new Blob([contentString], { type: 'application/json' });
        const file = new File([blob], fileName, { type: 'application/json' });
        
        const fileResult = await googleDriveService.uploadFile(file);

        if (fileResult && fileResult.id) {
          console.log(`✅ Guardado exitoso de ${fileName}`);
          return {
            canSave: true,
            details: { fileId: fileResult.id, size: contentSize }
          };
        }
      } catch (uploadError) {
        return {
          canSave: false,
          issue: 'Error subiendo archivo',
          solution: 'Error específico en la subida a Google Drive',
          details: uploadError
        };
      }

      return {
        canSave: false,
        issue: 'Error desconocido',
        solution: 'No se pudo determinar la causa del problema'
      };

    } catch (error) {
      return {
        canSave: false,
        issue: 'Error en diagnóstico',
        solution: 'Error inesperado durante el diagnóstico',
        details: error
      };
    }
  }

  // Función para intentar reparar problemas comunes
  async attemptRepair(): Promise<{ success: boolean; actions: string[] }> {
    const actions: string[] = [];
    
    try {
      // 1. Reinicializar servicios
      actions.push('Reinicializando servicios de Google Drive...');
      await googleAuthService.initialize();
      
      // 2. Verificar tokens
      const token = await googleAuthService.getAccessToken();
      if (!token) {
        actions.push('Token no disponible - se requiere reautorización');
        return { success: false, actions };
      }
      actions.push('Token de acceso verificado');

      // 3. Verificar carpetas de BondApp
      const bondAppFolderResult = await googleDriveService.createFolder('BondApp');
      actions.push(`Carpeta BondApp verificada/creada: ${bondAppFolderResult.id}`);

      actions.push('✅ Reparación completada exitosamente');
      return { success: true, actions };

    } catch (error) {
      actions.push(`❌ Error durante reparación: ${error}`);
      return { success: false, actions };
    }
  }
}

export const fileVerificationService = new FileVerificationService();

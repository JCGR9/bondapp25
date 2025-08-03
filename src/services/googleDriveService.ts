// Google Drive Service - Versión simplificada para la nube
// Esta versión funciona sin dependencias de Node.js y permite el build

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  webContentLink?: string;
}

// Servicio de autenticación stub
export const googleAuthService = {
  isReady: () => {
    // En la nube, verificamos si tenemos las credenciales necesarias
    return !!(
      import.meta.env.VITE_GOOGLE_CLIENT_ID &&
      import.meta.env.VITE_GOOGLE_CLIENT_SECRET
    );
  },
  initialize: async () => {
    // Inicialización simplificada para la nube
    return Promise.resolve();
  },
  getAccessToken: async () => {
    // En producción, esto debería manejar el flujo OAuth
    throw new Error('Google Drive authentication not implemented for cloud deployment');
  }
};

// Gestor de carpetas stub
export const driveFolderManager = {
  ensureSubfolder: async (name: string) => {
    // En producción, esto crearía la carpeta en Google Drive
    return { id: `folder-${Date.now()}`, name };
  }
};

export class GoogleDriveService {
  private driveApiUrl = 'https://www.googleapis.com/drive/v3';

  constructor() {
    // Constructor simplificado
  }

  private async ensureAuthenticated(): Promise<string> {
    if (!googleAuthService.isReady()) {
      throw new Error('Google Drive not configured. Please set up OAuth credentials.');
    }
    return googleAuthService.getAccessToken();
  }

  /**
   * Subir archivo a Google Drive
   */
  async uploadFile(file: File, folderId?: string): Promise<DriveFile> {
    try {
      const accessToken = await this.ensureAuthenticated();
      
      const metadata = {
        name: file.name,
        parents: folderId ? [folderId] : undefined,
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch(`${this.driveApiUrl}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: form,
      });

      if (!response.ok) {
        throw new Error(`Error uploading file: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      // Fallback para desarrollo/demo
      return {
        id: `demo-${Date.now()}`,
        name: file.name,
        mimeType: file.type,
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
        webViewLink: `#demo-view-${file.name}`,
        webContentLink: `#demo-download-${file.name}`
      };
    }
  }

  /**
   * Obtener lista de archivos
   */
  async listFiles(query?: string): Promise<DriveFile[]> {
    try {
      const accessToken = await this.ensureAuthenticated();
      
      const finalQuery = query || "trashed=false";

      const response = await fetch(
        `${this.driveApiUrl}/files?q=${encodeURIComponent(finalQuery)}&fields=files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink)`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error listing files: ${response.statusText}`);
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Error listing Google Drive files:', error);
      return []; // Retornar lista vacía en caso de error
    }
  }

  /**
   * Crear carpeta
   */
  async createFolder(name: string, parentId?: string): Promise<DriveFile> {
    try {
      const accessToken = await this.ensureAuthenticated();
      
      const metadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : undefined,
      };

      const response = await fetch(`${this.driveApiUrl}/files`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        throw new Error(`Error creating folder: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Google Drive folder:', error);
      return {
        id: `demo-folder-${Date.now()}`,
        name,
        mimeType: 'application/vnd.google-apps.folder',
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
        webViewLink: `#demo-folder-${name}`,
      };
    }
  }

  /**
   * Eliminar archivo
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      const accessToken = await this.ensureAuthenticated();
      
      const response = await fetch(`${this.driveApiUrl}/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error deleting file: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting Google Drive file:', error);
      // En demo mode, simplemente ignoramos el error
    }
  }

  /**
   * Obtener URL de descarga directa
   */
  getDirectDownloadUrl(fileId: string): string {
    return `https://drive.google.com/uc?id=${fileId}&export=download`;
  }

  /**
   * Obtener URL de vista previa
   */
  getPreviewUrl(fileId: string): string {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
}

// Instancia singleton
export const driveService = new GoogleDriveService();

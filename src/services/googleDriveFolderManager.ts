import { GoogleDriveService } from './googleDriveService';

export class GoogleDriveFolderManager {
  private driveService: GoogleDriveService;
  private folderCache: Map<string, string> = new Map();

  constructor() {
    this.driveService = new GoogleDriveService();
  }

  /**
   * Obtener o crear la carpeta principal de BondApp
   */
  async ensureBondAppFolder(): Promise<string> {
    const folderName = 'BondApp';
    
    if (this.folderCache.has(folderName)) {
      return this.folderCache.get(folderName)!;
    }

    try {
      // Buscar si ya existe la carpeta
      const existingFolders = await this.driveService.listFiles(`name='${folderName}' and mimeType='application/vnd.google-apps.folder'`);
      
      if (existingFolders.length > 0) {
        const folderId = existingFolders[0].id;
        this.folderCache.set(folderName, folderId);
        return folderId;
      }

      // Si no existe, crearla
      const folder = await this.driveService.createFolder(folderName);
      this.folderCache.set(folderName, folder.id);
      return folder.id;
    } catch (error) {
      console.error('Error al crear/obtener carpeta BondApp:', error);
      throw error;
    }
  }

  /**
   * Obtener o crear una subcarpeta dentro de BondApp
   */
  async ensureSubfolder(subfolderName: string): Promise<string> {
    const fullPath = `BondApp/${subfolderName}`;
    
    if (this.folderCache.has(fullPath)) {
      return this.folderCache.get(fullPath)!;
    }

    try {
      const bondAppFolderId = await this.ensureBondAppFolder();
      
      // Buscar si ya existe la subcarpeta
      const existingFolders = await this.driveService.listFiles(
        `name='${subfolderName}' and mimeType='application/vnd.google-apps.folder' and '${bondAppFolderId}' in parents`
      );
      
      if (existingFolders.length > 0) {
        const folderId = existingFolders[0].id;
        this.folderCache.set(fullPath, folderId);
        return folderId;
      }

      // Si no existe, crearla
      const subfolder = await this.driveService.createFolder(subfolderName, bondAppFolderId);
      this.folderCache.set(fullPath, subfolder.id);
      return subfolder.id;
    } catch (error) {
      console.error(`Error al crear/obtener carpeta ${subfolderName}:`, error);
      throw error;
    }
  }

  /**
   * Obtener ID de carpeta para contratos
   */
  async getContractsFolder(): Promise<string> {
    return await this.ensureSubfolder('Contratos');
  }

  /**
   * Obtener ID de carpeta para partituras
   */
  async getScoresFolder(): Promise<string> {
    return await this.ensureSubfolder('Partituras');
  }

  /**
   * Limpiar caché de carpetas
   */
  clearCache(): void {
    this.folderCache.clear();
  }
}

export const driveFolderManager = new GoogleDriveFolderManager();

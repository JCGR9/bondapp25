import { useState, useCallback } from 'react';
import { driveService, DriveFile } from '../services/googleDriveService';

export interface UseGoogleDriveOptions {
  folderId?: string;
  allowedTypes?: string[];
}

export const useGoogleDrive = (options: UseGoogleDriveOptions = {}) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const driveFiles = await driveService.listFiles(options.folderId);
      setFiles(driveFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading files');
    } finally {
      setLoading(false);
    }
  }, [options.folderId]);

  const uploadFile = useCallback(async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validar tipo de archivo si se especifica
      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        throw new Error(`Tipo de archivo no permitido. Permitidos: ${options.allowedTypes.join(', ')}`);
      }

      const uploadedFile = await driveService.uploadFile(file, options.folderId);
      setFiles(prev => [...prev, uploadedFile]);
      return uploadedFile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error uploading file';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options.folderId, options.allowedTypes]);

  const deleteFile = useCallback(async (fileId: string) => {
    try {
      setLoading(true);
      setError(null);
      await driveService.deleteFile(fileId);
      setFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting file';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createFolder = useCallback(async (name: string) => {
    try {
      setLoading(true);
      setError(null);
      const folder = await driveService.createFolder(name, options.folderId);
      setFiles(prev => [...prev, folder]);
      return folder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating folder';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options.folderId]);

  return {
    files,
    loading,
    error,
    loadFiles,
    uploadFile,
    deleteFile,
    createFolder,
    getDownloadUrl: driveService.getDirectDownloadUrl.bind(driveService),
    getPreviewUrl: driveService.getPreviewUrl.bind(driveService),
  };
};

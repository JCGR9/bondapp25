import React, { useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
  Visibility as PreviewIcon,
} from '@mui/icons-material';
import { useGoogleDrive } from '../hooks/useGoogleDrive';

interface DriveFileManagerProps {
  title: string;
  folderId?: string;
  allowedTypes?: string[];
  onFileUploaded?: (file: any) => void;
}

export const DriveFileManager: React.FC<DriveFileManagerProps> = ({
  title,
  folderId,
  allowedTypes = ['application/pdf', 'image/*'],
  onFileUploaded,
}) => {
  const {
    files,
    loading,
    error,
    loadFiles,
    uploadFile,
    deleteFile,
    getDownloadUrl,
    getPreviewUrl,
  } = useGoogleDrive({ folderId, allowedTypes });

  React.useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const uploadedFile = await uploadFile(file);
      onFileUploaded?.(uploadedFile);
      // Limpiar input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }, [uploadFile, onFileUploaded]);

  const handleDelete = useCallback(async (fileId: string, fileName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${fileName}"?`)) {
      try {
        await deleteFile(fileId);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  }, [deleteFile]);

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return 'Desconocido';
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1048576) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1048576).toFixed(1)} MB`;
  };

  const getFileTypeChip = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <Chip label="PDF" color="error" size="small" />;
    if (mimeType.includes('image')) return <Chip label="IMG" color="success" size="small" />;
    if (mimeType.includes('document')) return <Chip label="DOC" color="primary" size="small" />;
    return <Chip label="FILE" color="default" size="small" />;
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">{title}</Typography>
          <Box>
            <input
              accept={allowedTypes.join(',')}
              style={{ display: 'none' }}
              id={`file-upload-${title}`}
              type="file"
              onChange={handleFileUpload}
              disabled={loading}
            />
            <label htmlFor={`file-upload-${title}`}>
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadIcon />}
                disabled={loading}
              >
                Subir Archivo
              </Button>
            </label>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress />
          </Box>
        )}

        {files.length === 0 && !loading ? (
          <Typography color="text.secondary" textAlign="center" py={4}>
            No hay archivos subidos
          </Typography>
        ) : (
          <List>
            {files.map((file) => (
              <ListItem key={file.id} divider>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1">{file.name}</Typography>
                      {getFileTypeChip(file.mimeType)}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" display="block">
                        Tamaño: {formatFileSize(file.size)}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Modificado: {new Date(file.modifiedTime).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => window.open(getPreviewUrl(file.id), '_blank')}
                    title="Vista previa"
                  >
                    <PreviewIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => window.open(getDownloadUrl(file.id), '_blank')}
                    title="Descargar"
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(file.id, file.name)}
                    title="Eliminar"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

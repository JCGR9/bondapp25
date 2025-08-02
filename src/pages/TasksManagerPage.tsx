import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  CardActions,
  Chip,
  LinearProgress,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Badge,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Comment as CommentIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material/Select';

interface TaskFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadDate: string;
}

interface TaskComment {
  id: string;
  author: string;
  content: string;
  date: string;
}

interface TaskHistoryEntry {
  id: string;
  action: string;
  author: string;
  date: string;
  details: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  createdDate: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  tags: string[];
  files: TaskFile[];
  comments: TaskComment[];
  history: TaskHistoryEntry[];
  observations: string;
}

const BOARD_MEMBERS = [
  'Esteban',
  'Dani', 
  'David',
  'Damian',
  'Juan Carlos',
  'Javi'
];

const CATEGORIES = [
  'Administrativa',
  'Artística', 
  'Financiera',
  'Legal',
  'Logística',
  'Comunicación'
];

const PRIORITY_COLORS = {
  low: 'success',
  medium: 'info',
  high: 'warning', 
  urgent: 'error'
} as const;

const STATUS_COLORS = {
  pending: 'default',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'error'
} as const;

const TasksManagerPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previewFile, setPreviewFile] = useState<TaskFile | null>(null);
  const [commentText, setCommentText] = useState('');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    category: '',
    priority: 'medium' as Task['priority'],
    dueDate: '',
    estimatedHours: 0,
    tags: '',
    observations: ''
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const savedTasks = localStorage.getItem('bondapp-tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  };

  const saveTasks = (updatedTasks: Task[]) => {
    localStorage.setItem('bondapp-tasks', JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.assignedTo) return;

    const newTask: Task = {
      id: editingTask?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      assignedTo: formData.assignedTo,
      category: formData.category,
      priority: formData.priority,
      status: editingTask?.status || 'pending',
      progress: editingTask?.progress || 0,
      createdDate: editingTask?.createdDate || new Date().toISOString(),
      dueDate: formData.dueDate,
      estimatedHours: formData.estimatedHours,
      actualHours: editingTask?.actualHours || 0,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      files: editingTask?.files || [],
      comments: editingTask?.comments || [],
      history: editingTask?.history || [],
      observations: formData.observations
    };

    // Procesar archivos seleccionados
    if (selectedFiles) {
      Array.from(selectedFiles).forEach(file => {
        const fileData: TaskFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          uploadDate: new Date().toISOString()
        };
        newTask.files.push(fileData);
      });
    }

    // Agregar entrada al historial
    const historyEntry: TaskHistoryEntry = {
      id: Date.now().toString(),
      action: editingTask ? 'Gestión modificada' : 'Gestión creada',
      author: 'Usuario actual',
      date: new Date().toISOString(),
      details: `${editingTask ? 'Modificada' : 'Creada'} la gestión: ${newTask.title}`
    };
    newTask.history.push(historyEntry);

    let updatedTasks;
    if (editingTask) {
      updatedTasks = tasks.map(task => task.id === editingTask.id ? newTask : task);
    } else {
      updatedTasks = [...tasks, newTask];
    }

    saveTasks(updatedTasks);
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
    setSelectedFiles(null);
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      category: '',
      priority: 'medium',
      dueDate: '',
      estimatedHours: 0,
      tags: '',
      observations: ''
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
      tags: task.tags.join(', '),
      observations: task.observations
    });
    setOpenDialog(true);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const historyEntry: TaskHistoryEntry = {
          id: Date.now().toString(),
          action: 'Estado cambiado',
          author: 'Usuario actual',
          date: new Date().toISOString(),
          details: `Estado cambiado a: ${status}`
        };
        return {
          ...task,
          status,
          progress: status === 'completed' ? 100 : task.progress,
          history: [...task.history, historyEntry]
        };
      }
      return task;
    });
    saveTasks(updatedTasks);
  };

  const updateTaskProgress = (taskId: string, progress: number) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const historyEntry: TaskHistoryEntry = {
          id: Date.now().toString(),
          action: 'Progreso actualizado',
          author: 'Usuario actual',
          date: new Date().toISOString(),
          details: `Progreso actualizado a: ${progress}%`
        };
        return {
          ...task,
          progress,
          status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending' as Task['status'],
          history: [...task.history, historyEntry]
        };
      }
      return task;
    });
    saveTasks(updatedTasks);
  };

  const addComment = (taskId: string) => {
    if (!commentText.trim()) return;

    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const newComment: TaskComment = {
          id: Date.now().toString(),
          author: 'Usuario actual',
          content: commentText,
          date: new Date().toISOString()
        };
        return {
          ...task,
          comments: [...task.comments, newComment]
        };
      }
      return task;
    });
    saveTasks(updatedTasks);
    setCommentText('');
  };

  const isTaskOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && dueDate;
  };

  const getOverdueTasks = () => {
    return tasks.filter(task => 
      task.status !== 'completed' && 
      task.status !== 'cancelled' && 
      isTaskOverdue(task.dueDate)
    );
  };

  const getPendingTasksCount = () => {
    return tasks.filter(task => 
      task.status === 'pending' || task.status === 'in_progress'
    ).length;
  };

  const handleFilePreview = (file: TaskFile) => {
    setPreviewFile(file);
  };

  const handleFileDownload = (file: TaskFile) => {
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    a.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const overdueTasks = getOverdueTasks();
  const pendingCount = getPendingTasksCount();

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header con notificaciones */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', md: 'center' },
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 2, md: 0 },
        mb: 3 
      }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#8B0000', 
            fontWeight: 'bold',
            fontSize: { xs: '1.5rem', md: '2.125rem' }
          }}
        >
          Gestiones de la Banda
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, md: 2 },
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          justifyContent: { xs: 'flex-start', md: 'flex-end' },
          width: { xs: '100%', md: 'auto' }
        }}>
          {overdueTasks.length > 0 && (
            <Badge badgeContent={overdueTasks.length} color="error">
              <Tooltip title="Gestiones vencidas">
                <WarningIcon color="error" />
              </Tooltip>
            </Badge>
          )}
          
          <Badge badgeContent={pendingCount} color="info">
            <Tooltip title="Gestiones pendientes">
              <NotificationsIcon color="action" />
            </Tooltip>
          </Badge>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              backgroundColor: '#8B0000',
              '&:hover': { backgroundColor: '#A00000' },
              fontSize: { xs: '0.75rem', md: '0.875rem' },
              px: { xs: 1.5, md: 3 },
              py: { xs: 0.5, md: 1 }
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Nueva Gestión</Box>
            <Box sx={{ display: { xs: 'inline', sm: 'none' } }}>Nueva</Box>
          </Button>
        </Box>
      </Box>

      {/* Alertas de vencimiento */}
      {overdueTasks.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            ⚠️ Tienes {overdueTasks.length} gestión{overdueTasks.length > 1 ? 'es' : ''} vencida{overdueTasks.length > 1 ? 's' : ''}
          </Typography>
          {overdueTasks.map(task => (
            <Typography key={task.id} variant="body2">
              • {task.title} - Vencía el {new Date(task.dueDate).toLocaleDateString()}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Lista de gestiones */}
      <Stack spacing={3}>
        {tasks.map((task) => (
          <Card 
            key={task.id}
            sx={{ 
              border: isTaskOverdue(task.dueDate) ? '2px solid #f44336' : 'none',
              boxShadow: isTaskOverdue(task.dueDate) ? '0 4px 20px rgba(244, 67, 54, 0.3)' : 
                        'rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px'
            }}
          >
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 1, md: 0 },
                mb: 2 
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold', 
                    flex: 1,
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    mb: { xs: 1, md: 0 }
                  }}
                >
                  {task.title}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1,
                  flexWrap: 'wrap'
                }}>
                  <Chip 
                    label={task.priority} 
                    color={PRIORITY_COLORS[task.priority]} 
                    size="small" 
                  />
                  <Chip 
                    label={task.status} 
                    color={STATUS_COLORS[task.status]} 
                    size="small" 
                  />
                </Box>
              </Box>

              {task.description && (
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {task.description}
                </Typography>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Asignado a: <strong>{task.assignedTo}</strong>
                </Typography>
              </Box>

              {task.category && (
                <Chip label={task.category} variant="outlined" size="small" sx={{ mb: 2 }} />
              )}

              {task.dueDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ScheduleIcon sx={{ fontSize: 16, mr: 1, color: isTaskOverdue(task.dueDate) ? 'error.main' : 'text.secondary' }} />
                  <Typography 
                    variant="caption" 
                    color={isTaskOverdue(task.dueDate) ? 'error' : 'textSecondary'}
                  >
                    {isTaskOverdue(task.dueDate) ? 'Vencida: ' : 'Vence: '}
                    {new Date(task.dueDate).toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              {/* Panel expandible con detalles */}
              {expandedTask === task.id && (
                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
                  
                  {/* Control de progreso */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Progreso: {task.progress}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={task.progress} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: task.progress === 100 ? '#4caf50' : '#2196f3'
                        }
                      }} 
                    />
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      mt: 1,
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'stretch', sm: 'center' }
                    }}>
                      <TextField
                        type="number"
                        size="small"
                        value={task.progress}
                        onChange={(e) => updateTaskProgress(task.id, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        inputProps={{ min: 0, max: 100 }}
                        sx={{ width: { xs: '100%', sm: 100 } }}
                      />
                      <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' } }}>%</Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        disabled={task.status === 'completed'}
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                      >
                        Completada
                      </Button>
                    </Box>
                  </Box>

                  {/* Archivos adjuntos */}
                  {task.files.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Archivos Adjuntos ({task.files.length})
                      </Typography>
                      <List dense>
                        {task.files.map((file) => (
                          <ListItem 
                            key={file.id}
                            sx={{ 
                              border: '1px solid rgba(0, 0, 0, 0.12)', 
                              borderRadius: 1, 
                              mb: 1 
                            }}
                          >
                            <ListItemIcon>
                              <AttachFileIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={file.name}
                              secondary={`${formatFileSize(file.size)} - ${new Date(file.uploadDate).toLocaleDateString()}`}
                            />
                            <IconButton 
                              size="small" 
                              onClick={() => handleFilePreview(file)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleFileDownload(file)}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Observaciones */}
                  {task.observations && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Observaciones
                      </Typography>
                      <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                        <Typography variant="body2">
                          {task.observations}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  {/* Comentarios */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Comentarios ({task.comments.length})
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      mb: 2,
                      flexDirection: { xs: 'column', sm: 'row' }
                    }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Añadir comentario..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                      <Button
                        size="small"
                        onClick={() => addComment(task.id)}
                        disabled={!commentText.trim()}
                        sx={{ 
                          minWidth: { xs: '100%', sm: 'auto' },
                          width: { xs: '100%', sm: 'auto' }
                        }}
                      >
                        <CommentIcon />
                      </Button>
                    </Box>

                    {task.comments.map((comment) => (
                      <Paper key={comment.id} sx={{ p: 2, mb: 1, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {comment.content}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {comment.author} - {new Date(comment.date).toLocaleString()}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>

                  {/* Historial */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      <HistoryIcon sx={{ mr: 1, fontSize: 16 }} />
                      Historial ({task.history.length})
                    </Typography>
                    {task.history.map((entry) => (
                      <Box key={entry.id} sx={{ mb: 1, p: 1, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 1 }}>
                        <Typography variant="body2">
                          <strong>{entry.action}</strong> - {entry.details}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {entry.author} - {new Date(entry.date).toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>

            <CardActions sx={{ 
              justifyContent: 'space-between', 
              px: 2, 
              pb: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 0 },
              alignItems: { xs: 'stretch', sm: 'center' }
            }}>
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}>
                <IconButton 
                  size="small" 
                  onClick={() => handleEditTask(task)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDeleteTask(task.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              <Button
                size="small"
                onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                sx={{ 
                  width: { xs: '100%', sm: 'auto' },
                  mt: { xs: 1, sm: 0 }
                }}
              >
                {expandedTask === task.id ? 'Ocultar' : 'Ver'} Detalles
              </Button>
            </CardActions>
          </Card>
        ))}
      </Stack>

      {tasks.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="textSecondary">
            No hay gestiones creadas
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Crea tu primera gestión para comenzar a organizar las tareas de la banda
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              backgroundColor: '#8B0000',
              '&:hover': { backgroundColor: '#A00000' }
            }}
          >
            Crear Primera Gestión
          </Button>
        </Box>
      )}

      {/* Dialog para crear/editar gestión */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: 0, sm: '48px' },
            width: { xs: '100%', sm: 'calc(100% - 96px)' },
            maxHeight: { xs: '100%', sm: 'calc(100% - 96px)' }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          pb: { xs: 1, sm: 2 }
        }}>
          {editingTask ? 'Editar Gestión' : 'Nueva Gestión'}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Título de la Gestión"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2
            }}>
              <FormControl fullWidth>
                <InputLabel>Asignado a</InputLabel>
                <Select
                  value={formData.assignedTo}
                  onChange={(e: SelectChangeEvent) => setFormData({ ...formData, assignedTo: e.target.value })}
                  required
                >
                  {BOARD_MEMBERS.map((member) => (
                    <MenuItem key={member} value={member}>
                      {member}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e: SelectChangeEvent) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2
            }}>
              <FormControl fullWidth>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e: SelectChangeEvent) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                >
                  <MenuItem value="low">Baja</MenuItem>
                  <MenuItem value="medium">Media</MenuItem>
                  <MenuItem value="high">Alta</MenuItem>
                  <MenuItem value="urgent">Urgente</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                type="date"
                label="Fecha de Vencimiento"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Observaciones"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            />

            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2
            }}>
              <TextField
                fullWidth
                type="number"
                label="Horas Estimadas"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, step: 0.5 }}
              />

              <TextField
                fullWidth
                label="Etiquetas (separadas por comas)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="etiqueta1, etiqueta2, etiqueta3"
              />
            </Box>

            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ 
                  mb: 1,
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Subir Archivos
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={(e) => setSelectedFiles(e.target.files)}
                />
              </Button>
              {selectedFiles && (
                <Typography variant="body2" color="textSecondary">
                  {selectedFiles.length} archivo{selectedFiles.length > 1 ? 's' : ''} seleccionado{selectedFiles.length > 1 ? 's' : ''}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 2, sm: 3 },
          pb: { xs: 2, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              width: { xs: '100%', sm: 'auto' },
              order: { xs: 2, sm: 1 }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.title || !formData.assignedTo}
            sx={{
              backgroundColor: '#8B0000',
              '&:hover': { backgroundColor: '#A00000' },
              width: { xs: '100%', sm: 'auto' },
              order: { xs: 1, sm: 2 }
            }}
          >
            {editingTask ? 'Actualizar' : 'Crear'} Gestión
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para previsualizar archivos */}
      <Dialog 
        open={!!previewFile} 
        onClose={() => setPreviewFile(null)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          Previsualización: {previewFile?.name}
        </DialogTitle>
        <DialogContent>
          {previewFile && (
            <Box sx={{ textAlign: 'center', p: 2 }}>
              {previewFile.type.startsWith('image/') ? (
                <img 
                  src={previewFile.url} 
                  alt={previewFile.name}
                  style={{ maxWidth: '100%', maxHeight: '70vh' }}
                />
              ) : previewFile.type === 'application/pdf' ? (
                <iframe 
                  src={previewFile.url} 
                  width="100%" 
                  height="600px"      
                  style={{ border: 'none' }}
                />
              ) : (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    No se puede previsualizar este tipo de archivo
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tipo: {previewFile.type}<br/>
                    Tamaño: {formatFileSize(previewFile.size)}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleFileDownload(previewFile)}
                    sx={{ mt: 2 }}
                  >
                    Descargar Archivo
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewFile(null)}>Cerrar</Button>
          <Button 
            onClick={() => previewFile && handleFileDownload(previewFile)}
            startIcon={<DownloadIcon />}
          >
            Descargar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TasksManagerPage;

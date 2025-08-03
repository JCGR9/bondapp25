import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => string;
  priority?: 'high' | 'medium' | 'low'; // Para mostrar/ocultar en móvil
}

interface ResponsiveTableProps {
  columns: Column[];
  rows: any[];
  onRowClick?: (row: any) => void;
  primaryField?: string; // Campo principal para mostrar en móvil
  secondaryField?: string; // Campo secundario para mostrar en móvil
}

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  rows,
  onRowClick,
  primaryField = 'name',
  secondaryField = 'date'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    // Vista de tarjetas para móviles
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {rows.map((row, index) => (
          <Card
            key={index}
            onClick={() => onRowClick?.(row)}
            sx={{
              cursor: onRowClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: onRowClick ? 'translateY(-2px)' : 'none',
                boxShadow: onRowClick ? '0 4px 12px rgba(139, 0, 0, 0.2)' : 'none',
              },
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                {row[primaryField]}
              </Typography>
              {secondaryField && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {row[secondaryField]}
                </Typography>
              )}
              
              {/* Mostrar solo campos de alta prioridad en móvil */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {columns
                  .filter(col => col.priority === 'high')
                  .map(column => (
                    <Box key={column.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {column.label}:
                      </Typography>
                      <Typography variant="body2">
                        {column.format ? column.format(row[column.id]) : row[column.id]}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  // Vista de tabla para desktop
  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        maxHeight: '70vh',
        '& .MuiTableCell-root': {
          fontSize: 'clamp(0.75rem, 1.3vw, 0.875rem)',
        }
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                style={{ minWidth: column.minWidth }}
                sx={{
                  fontWeight: 600,
                  backgroundColor: 'rgba(139, 0, 0, 0.1)',
                  borderBottom: '2px solid rgba(139, 0, 0, 0.3)',
                }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              hover
              key={index}
              onClick={() => onRowClick?.(row)}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
                '&:hover': {
                  backgroundColor: onRowClick ? 'rgba(139, 0, 0, 0.05)' : 'inherit',
                },
              }}
            >
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align}>
                  {column.format ? column.format(row[column.id]) : row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ResponsiveTable;

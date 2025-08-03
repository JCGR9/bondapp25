import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Description as ContractIcon,
  MusicNote as MusicIcon,
  Work as WorkIcon,
  Settings as SettingsIcon,
  Checkroom as CheckroomIcon,
  Menu as MenuIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import bondadLogo from '../assets/bondad.png';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onMobileToggle?: () => void;
  isMobile?: boolean;
}

const drawerWidth = 240;

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { id: 'instruments-manager', label: 'Instrumentos', icon: <SettingsIcon /> },
  { id: 'uniforms-manager', label: 'Uniformidad', icon: <CheckroomIcon /> },
  { id: 'components-manager', label: 'Componentes', icon: <PeopleIcon /> },
  { id: 'performances-manager', label: 'Actuaciones', icon: <EventIcon /> },
  { id: 'finances', label: 'Finanzas', icon: <MoneyIcon /> },
  { id: 'inventory-manager', label: 'Inventario', icon: <InventoryIcon /> },
  { id: 'contracts-manager', label: 'Contratos', icon: <ContractIcon /> },
  { id: 'statistics', label: 'Estadísticas', icon: <AssessmentIcon /> },
  { id: 'scores-manager', label: 'Partituras', icon: <MusicIcon /> },
  { id: 'management', label: 'Gestiones', icon: <WorkIcon /> },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  onNavigate, 
  onLogout,
  mobileOpen = false,
  onMobileClose = () => {},
  onMobileToggle = () => {},
  isMobile = false
}) => {
  const theme = useTheme();

  const handleNavigation = (page: string) => {
    onNavigate(page);
    if (isMobile) {
      onMobileClose();
    }
  };

  // Contenido del drawer
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          py: isMobile ? 2 : 3,
          px: 2,
          borderBottom: '1px solid rgba(139, 0, 0, 0.2)',
          background: 'linear-gradient(135deg, rgba(139, 0, 0, 0.1) 0%, rgba(139, 0, 0, 0.05) 100%)',
        }}
      >
        <Avatar
          src={bondadLogo}
          sx={{
            width: isMobile ? 48 : 64,
            height: isMobile ? 48 : 64,
            mb: 1,
            filter: 'drop-shadow(0 4px 15px rgba(139, 0, 0, 0.4))',
            border: '2px solid rgba(139, 0, 0, 0.3)',
            boxShadow: '0 4px 15px rgba(139, 0, 0, 0.3)',
          }}
        />
        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
          sx={{
            color: 'transparent',
            background: 'linear-gradient(135deg, #8B0000 0%, #FF4444 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            fontWeight: 700,
            textAlign: 'center',
            letterSpacing: '0.3px',
            textShadow: '0 1px 5px rgba(139, 0, 0, 0.3)',
          }}
        >
          BondApp
        </Typography>
      </Box>
      
      {/* Menu Items */}
      <List sx={{ pt: 1, flex: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.id}
            onClick={() => handleNavigation(item.id)}
            sx={{
              cursor: 'pointer',
              mb: 0.5,
              borderRadius: 2,
              minHeight: isMobile ? 48 : 56,
              background: currentPage === item.id 
                ? 'linear-gradient(135deg, rgba(139, 0, 0, 0.15) 0%, rgba(139, 0, 0, 0.1) 100%)' 
                : 'transparent',
              border: currentPage === item.id ? '1px solid rgba(139, 0, 0, 0.3)' : '1px solid transparent',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: currentPage === item.id 
                  ? 'linear-gradient(135deg, rgba(139, 0, 0, 0.2) 0%, rgba(139, 0, 0, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(139, 0, 0, 0.08) 0%, rgba(139, 0, 0, 0.05) 100%)',
                transform: 'translateX(5px)',
                boxShadow: currentPage === item.id 
                  ? '0 6px 20px rgba(139, 0, 0, 0.3)'
                  : '0 4px 15px rgba(139, 0, 0, 0.1)',
              },
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: currentPage === item.id ? '#FF4444' : 'rgba(255, 255, 255, 0.7)',
                minWidth: isMobile ? 36 : 40,
                transition: 'all 0.3s ease',
                filter: currentPage === item.id ? 'drop-shadow(0 2px 8px rgba(255, 68, 68, 0.4))' : 'none',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label} 
              sx={{ 
                '& .MuiListItemText-primary': {
                  color: currentPage === item.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
                  fontWeight: currentPage === item.id ? 600 : 400,
                  fontSize: isMobile ? '0.85rem' : '0.9rem',
                  transition: 'all 0.3s ease',
                  textShadow: currentPage === item.id ? '0 1px 3px rgba(0, 0, 0, 0.5)' : 'none',
                },
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Logout Button */}
      {onLogout && (
        <Box sx={{ p: 2, borderTop: '1px solid rgba(139, 0, 0, 0.2)' }}>
          <Button
            onClick={() => {
              onLogout();
              if (isMobile) onMobileClose();
            }}
            startIcon={<LogoutIcon />}
            fullWidth
            variant="outlined"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              borderColor: 'rgba(139, 0, 0, 0.3)',
              minHeight: isMobile ? 44 : 48,
              fontSize: isMobile ? '0.8rem' : '0.875rem',
              '&:hover': {
                borderColor: 'rgba(139, 0, 0, 0.5)',
                backgroundColor: 'rgba(139, 0, 0, 0.1)',
              },
            }}
          >
            Cerrar Sesión
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* AppBar para móviles */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            width: '100%',
            background: 'linear-gradient(90deg, rgba(20, 20, 20, 0.98) 0%, rgba(28, 28, 28, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(139, 0, 0, 0.3)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onMobileToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              BondApp
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Navigation drawer */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        {isMobile ? (
          // Mobile drawer
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={onMobileClose}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                background: 'linear-gradient(180deg, rgba(20, 20, 20, 0.98) 0%, rgba(28, 28, 28, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(139, 0, 0, 0.3)',
              },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          // Desktop drawer
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                background: 'linear-gradient(180deg, rgba(20, 20, 20, 0.98) 0%, rgba(28, 28, 28, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(139, 0, 0, 0.3)',
                boxShadow: '10px 0 30px rgba(0, 0, 0, 0.3)',
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>
    </>
  );
};

export default Sidebar;

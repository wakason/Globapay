import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    CssBaseline,
    Box,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Divider,
    useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthService } from '../services/authService';

const drawerWidth = 240;

const AppLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMdUp = useMediaQuery('(min-width:900px)');
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const role = sessionStorage.getItem('role') || '';
    const isEmployee = role === 'employee';

    const handleDrawerToggle = () => setMobileOpen(v => !v);

    const drawer = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.3, background: 'linear-gradient(90deg,#7dd3fc,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                    GlobaPay
                </Typography>
            </Box>
            <Divider />
            <List sx={{ flex: 1 }}>
                {role !== 'employee' ? (
                    <>
                        <ListItemButton selected={location.pathname === '/payment'} onClick={() => navigate('/payment')}>
                            <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon>
                            <ListItemText primary="New Payment" />
                        </ListItemButton>
                        <ListItemButton selected={location.pathname === '/transactions'} onClick={() => navigate('/transactions')}>
                            <ListItemIcon><HistoryIcon /></ListItemIcon>
                            <ListItemText primary="History" />
                        </ListItemButton>
                        <ListItemButton selected={location.pathname === '/methods'} onClick={() => navigate('/methods')}>
                            <ListItemIcon><AccountBalanceIcon /></ListItemIcon>
                            <ListItemText primary="Methods" />
                        </ListItemButton>
                    </>
                ) : (
                    <ListItemButton selected={location.pathname === '/pending'} onClick={() => navigate('/pending')}>
                        <ListItemIcon><DoneAllIcon /></ListItemIcon>
                        <ListItemText primary="Pending" />
                    </ListItemButton>
                )}
            </List>
            <Divider />
            <List>
                <ListItemButton
                    onClick={async () => {
                        try { await AuthService.logout(); } catch {}
                        sessionStorage.clear();
                        navigate('/login');
                    }}
                >
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                color="transparent"
                elevation={0}
                sx={{
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255,255,255,0.15)',
                    background: isEmployee
                        ? 'linear-gradient(90deg, rgba(253, 186, 116, 0.18), rgba(251, 146, 60, 0.18))'
                        : 'linear-gradient(90deg, rgba(125, 211, 252, 0.18), rgba(96, 165, 250, 0.18), rgba(167, 139, 250, 0.18))'
                }}
            >
                <Toolbar>
                    {!isMdUp && (
                        <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
                        {isEmployee ? 'Payments Operations' : 'Payments'}
                    </Typography>
                    <Box sx={{
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 1.5,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 0.3,
                        color: isEmployee ? '#1f2937' : '#0b1020',
                        backgroundColor: isEmployee ? 'rgba(251, 146, 60, 0.6)' : 'rgba(96, 165, 250, 0.6)'
                    }}>
                        {isEmployee ? 'Employee' : 'Customer'}
                    </Box>
                </Toolbar>
            </AppBar>

            <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="navigation">
                <Drawer
                    variant={isMdUp ? 'permanent' : 'temporary'}
                    open={isMdUp ? true : mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            background: isEmployee ? 'rgba(251, 146, 60, 0.08)' : 'rgba(255,255,255,0.06)',
                            borderRight: isEmployee ? '1px solid rgba(251, 146, 60, 0.25)' : '1px solid rgba(255,255,255,0.12)'
                        }
                    }}
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default AppLayout;



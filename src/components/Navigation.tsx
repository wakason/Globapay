import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { motion } from 'framer-motion';
import { 
    AccountBalanceWallet, 
    History, 
    ExitToApp, 
    Payment,
    Security,
    Dashboard,
    Person,
    Settings
} from '@mui/icons-material';
import { 
    Box, 
    Typography, 
    Chip, 
    Avatar,
    Tooltip,
    Divider
} from '@mui/material';

const NavContainer = styled.nav<{ $plain?: boolean }>`
  ${props => props.$plain ? '' : `
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    padding: 0.75rem 1rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  `}
  margin: 1rem;
  display: inline-flex;
  align-self: center;
  justify-content: center;
  gap: 0.5rem;
  position: sticky;
  top: 1rem;
  z-index: 1000;
  max-width: 90vw;
  overflow-x: auto;
`;

const Brand = styled.div`
  font-weight: 800;
  letter-spacing: 0.3px;
  font-size: 2.75rem;
  line-height: 1.1;
  background: linear-gradient(90deg, #7dd3fc, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 2px 20px rgba(96, 165, 250, 0.25);
`;

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const NavButton = styled(motion.button)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-height: 44px;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(96, 165, 250, 0.3);
    box-shadow: 0 4px 20px rgba(96, 165, 250, 0.2);
    transform: translateY(-1px);
  }

  &.active {
    background: linear-gradient(45deg, rgba(96, 165, 250, 0.2), rgba(167, 139, 250, 0.2));
    border-color: rgba(96, 165, 250, 0.4);
    box-shadow: 0 4px 20px rgba(96, 165, 250, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const role = sessionStorage.getItem('role') || '';
  const [counts, setCounts] = React.useState<{ pending: number; verified: number }>({
    pending: Number(sessionStorage.getItem('pending_count') || 0),
    verified: Number(sessionStorage.getItem('verified_total') || 0)
  });

  React.useEffect(() => {
    const handler = () => setCounts({
      pending: Number(sessionStorage.getItem('pending_count') || 0),
      verified: Number(sessionStorage.getItem('verified_total') || 0)
    });
    window.addEventListener('counts-updated', handler);
    return () => window.removeEventListener('counts-updated', handler);
  }, []);

  return (
    <NavContainer $plain={isAuthPage}>
      {isAuthPage ? (
        <BrandRow>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            background: 'linear-gradient(45deg, rgba(96, 165, 250, 0.1), rgba(167, 139, 250, 0.1))',
            padding: '0.5rem 1rem',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Avatar sx={{ 
              width: 40, 
              height: 40,
              background: 'linear-gradient(45deg, #60a5fa, #a78bfa)'
            }}>
              <AccountBalanceWallet />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                lineHeight: 1
              }}>
                GlobaPay
              </Typography>
              <Typography variant="caption" sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.75rem'
              }}>
                International Payments
              </Typography>
            </Box>
          </Box>
        </BrandRow>
      ) : (
        <>
          {isAuthenticated ? (
            <>
              {/* User Info */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                px: 1,
                py: 0.5,
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <Avatar sx={{ 
                  width: 28, 
                  height: 28,
                  background: role === 'employee' 
                    ? 'linear-gradient(45deg, #34d399, #10b981)' 
                    : 'linear-gradient(45deg, #60a5fa, #a78bfa)'
                }}>
                  {role === 'employee' ? <Security /> : <Person />}
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    fontWeight: 600
                  }}>
                    {role === 'employee' ? 'Employee' : 'Customer'}
                  </Typography>
                </Box>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

              {role !== 'employee' && (
                <>
                  <Tooltip title="Create new international payment">
                  <NavButton
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/payment')}
                    className={location.pathname === '/payment' ? 'active' : ''}
                  >
                      <AccountBalanceWallet sx={{ fontSize: 18 }} />
                      <span>New Payment</span>
                  </NavButton>
                  </Tooltip>
                  
                  <Tooltip title="View transaction history">
                  <NavButton
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/transactions')}
                    className={location.pathname === '/transactions' ? 'active' : ''}
                  >
                      <History sx={{ fontSize: 18 }} />
                      <span>History</span>
                  </NavButton>
                  </Tooltip>
                  
                  <Tooltip title="Manage beneficiaries">
                  <NavButton
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/methods')}
                    className={location.pathname === '/methods' ? 'active' : ''}
                  >
                      <Payment sx={{ fontSize: 18 }} />
                      <span>Contacts</span>
                  </NavButton>
                  </Tooltip>
                </>
              )}
              
              {role === 'employee' && (
                <Tooltip title="Review pending transactions">
                <NavButton
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/pending')}
                  className={location.pathname === '/pending' ? 'active' : ''}
                >
                    <Security sx={{ fontSize: 18 }} />
                    <span>Pending</span>
                    <Chip 
                      label={String(counts.pending)} 
                      size="small" 
                      sx={{ 
                        height: 18,
                        fontSize: '0.65rem',
                        background: 'rgba(96, 165, 250, 0.2)',
                        color: '#60a5fa',
                        fontWeight: 600
                      }} 
                    />
                </NavButton>
                </Tooltip>
              )}

              <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

              <Tooltip title="Sign out of your account">
              <NavButton
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  try {
                    await AuthService.logout();
                  } catch {}
                  sessionStorage.clear();
                  navigate('/login');
                }}
                  style={{
                    background: 'rgba(251, 113, 133, 0.1)',
                    borderColor: 'rgba(251, 113, 133, 0.2)',
                  }}
              >
                  <ExitToApp sx={{ fontSize: 18 }} />
                  <span>Logout</span>
              </NavButton>
              </Tooltip>
            </>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              background: 'linear-gradient(45deg, rgba(96, 165, 250, 0.1), rgba(167, 139, 250, 0.1))',
              padding: '0.5rem 1rem',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Avatar sx={{ 
                width: 40, 
                height: 40,
                background: 'linear-gradient(45deg, #60a5fa, #a78bfa)'
              }}>
                <AccountBalanceWallet />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  lineHeight: 1
                }}>
                  GlobaPay
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.75rem'
                }}>
                  International Payments
                </Typography>
              </Box>
            </Box>
          )}
        </>
      )}
    </NavContainer>
  );
};

export default Navigation;

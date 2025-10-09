import React, { useEffect, useState } from 'react';
import { 
    Grid, 
    Card, 
    CardHeader, 
    CardContent, 
    Typography, 
    List, 
    ListItem, 
    ListItemText, 
    Divider, 
    Button, 
    Stack,
    Box,
    Chip,
    IconButton,
    Avatar,
    LinearProgress
} from '@mui/material';
import {
    AccountBalanceWallet,
    History,
    Payment,
    TrendingUp,
    Security,
    CheckCircle,
    Schedule,
    Error,
    Refresh,
    Add,
    ArrowForward
} from '@mui/icons-material';
import PaymentForm from './PaymentForm';
import { PaymentService } from '../services/paymentService';
import { formatTransactionDate } from '../utils/dateFormatter';

interface Transaction {
    id: string;
    createdAt: string;
    updatedAt: string;
    amount: number;
    currency: string;
    recipientName: string;
    status: string;
    type?: string;
    reference?: string;
    errorMessage?: string;
}

interface MethodItem {
    id?: string;
    type: string;
    accountNumber: string;
    swiftCode?: string;
}

const CustomerPortal: React.FC = () => {
    const [recent, setRecent] = useState<Transaction[]>([]);
    const [methods, setMethods] = useState<MethodItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const tx = await PaymentService.getTransactionHistory();
                const txNorm: Transaction[] = Array.isArray(tx) ? tx : Array.isArray((tx as any)?.transactions) ? (tx as any).transactions : [];
                setRecent(txNorm.slice(0, 5));
            } catch {
                setRecent([]);
            }
            try {
                const m = await PaymentService.getPaymentMethods();
                const mNorm: MethodItem[] = Array.isArray(m) ? m : Array.isArray((m as any)?.methods) ? (m as any).methods : [];
                setMethods(mNorm.slice(0, 5));
            } catch {
                setMethods([]);
            }
            setLoading(false);
        };
        load();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            case 'failed': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return <CheckCircle />;
            case 'pending': return <Schedule />;
            case 'failed': return <Error />;
            default: return <Schedule />;
        }
    };

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: 2 }}>
            {/* Dashboard Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 2,
                    background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                }}>
                    Payment Dashboard
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Manage your international payments and transactions
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Main Payment Form */}
            <Grid item xs={12} lg={8}>
                <PaymentForm />
            </Grid>

                {/* Sidebar */}
            <Grid item xs={12} lg={4}>
                    <Stack spacing={3}>
                        {/* Quick Stats */}
                        <Card sx={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                        }}>
                            <CardHeader 
                                title={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TrendingUp sx={{ color: 'primary.main' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            Quick Stats
                                        </Typography>
                                    </Box>
                                }
                            />
                            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                            <CardContent>
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                            Total Transactions
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {recent.length}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                            Payment Methods
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {methods.length}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                            Success Rate
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#34d399' }}>
                                            98%
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>

                        {/* Recent Transactions */}
                        <Card sx={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                        }}>
                            <CardHeader 
                                title={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <History sx={{ color: 'primary.main' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            Recent Transactions
                                        </Typography>
                                    </Box>
                                }
                                action={
                                    <IconButton size="small" onClick={() => window.location.reload()}>
                                        <Refresh />
                                    </IconButton>
                                }
                            />
                            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    <CardContent sx={{ pt: 1 }}>
                        {loading ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                                        <LinearProgress sx={{ flex: 1 }} />
                                        <Typography variant="body2">Loading...</Typography>
                                    </Box>
                        ) : recent.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 3 }}>
                                        <AccountBalanceWallet sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 1 }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                            No recent transactions
                                        </Typography>
                                    </Box>
                        ) : (
                            <List dense>
                                        {recent.map((tx, index) => (
                                            <React.Fragment key={tx.id}>
                                                <ListItem 
                                                    sx={{ 
                                                        px: 0,
                                                        py: 1.5,
                                                        borderRadius: 1,
                                                        '&:hover': {
                                                            background: 'rgba(255, 255, 255, 0.05)'
                                                        }
                                                    }}
                                                >
                                                    <Avatar sx={{ 
                                                        width: 32, 
                                                        height: 32, 
                                                        mr: 2,
                                                        background: 'linear-gradient(45deg, #60a5fa, #a78bfa)'
                                                    }}>
                                                        {getStatusIcon(tx.status)}
                                                    </Avatar>
                                        <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                    {tx.recipientName}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                    {tx.amount.toFixed(2)} {tx.currency}
                                                                </Typography>
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                                                    {formatTransactionDate(tx.createdAt)}
                                                                </Typography>
                                                                <Chip
                                                                    label={tx.status}
                                                                    size="small"
                                                                    color={getStatusColor(tx.status) as any}
                                                                    sx={{ 
                                                                        height: 20,
                                                                        fontSize: '0.7rem',
                                                                        fontWeight: 600
                                                                    }}
                                                                />
                                                            </Box>
                                                        }
                                        />
                                    </ListItem>
                                                {index < recent.length - 1 && <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />}
                                            </React.Fragment>
                                ))}
                            </List>
                        )}
                                <Button 
                                    fullWidth 
                                    variant="outlined" 
                                    href="/transactions"
                                    endIcon={<ArrowForward />}
                                    sx={{ 
                                        mt: 2,
                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            background: 'rgba(96, 165, 250, 0.1)'
                                        }
                                    }}
                                >
                                    View All Transactions
                                </Button>
                    </CardContent>
                </Card>

                        {/* Beneficiaries */}
                        <Card sx={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: 3,
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                        }}>
                            <CardHeader 
                                title={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Payment sx={{ color: 'primary.main' }} />
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                            Beneficiaries
                                        </Typography>
                                    </Box>
                                }
                            />
                            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                            <CardContent sx={{ pt: 1 }}>
                                {loading ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                                        <LinearProgress sx={{ flex: 1 }} />
                                        <Typography variant="body2">Loading...</Typography>
                                    </Box>
                                ) : methods.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 3 }}>
                                        <Payment sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.3)', mb: 1 }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 2 }}>
                                            No beneficiaries saved
                                        </Typography>
                                        <Button 
                                            variant="contained" 
                                            size="small"
                                            href="/methods"
                                            startIcon={<Add />}
                                            sx={{
                                                background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
                                                '&:hover': {
                                                    background: 'linear-gradient(45deg, #4f86e2, #8b5cf6)',
                                                }
                                            }}
                                        >
                                            Add Beneficiary
                                        </Button>
                                    </Box>
                                ) : (
                                    <List dense>
                                        {methods.map((m, idx) => (
                                            <ListItem 
                                                key={m.id || idx} 
                                                sx={{ 
                                                    px: 0,
                                                    py: 1,
                                                    borderRadius: 1,
                                                    '&:hover': {
                                                        background: 'rgba(255, 255, 255, 0.05)'
                                                    }
                                                }}
                                            >
                                                <Avatar sx={{ 
                                                    width: 32, 
                                                    height: 32, 
                                                    mr: 2,
                                                    background: 'linear-gradient(45deg, #34d399, #10b981)'
                                                }}>
                                                    <Security />
                                                </Avatar>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {m.type.toUpperCase()} • {m.accountNumber.slice(-4).padStart(m.accountNumber.length, '*')}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                                            {m.swiftCode ? `SWIFT: ${m.swiftCode}` : 'Local Payment'}
                                                        </Typography>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                                <Button 
                                    fullWidth 
                                    variant="outlined" 
                                    href="/methods"
                                    endIcon={<ArrowForward />}
                                    sx={{ 
                                        mt: 2,
                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            background: 'rgba(96, 165, 250, 0.1)'
                                        }
                                    }}
                                >
                                    Manage Beneficiaries
                                </Button>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CustomerPortal;



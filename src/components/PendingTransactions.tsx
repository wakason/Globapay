import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaymentService } from '../services/paymentService';
import { formatTransactionDate, formatTransactionTime } from '../utils/dateFormatter';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Snackbar,
    Alert,
    Stack,
    TextField,
    Toolbar,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    MenuItem,
    Avatar,
    LinearProgress,
    Divider,
    InputAdornment,
    Badge
} from '@mui/material';
import {
    Refresh,
    CheckCircle,
    Send,
    Search,
    Security,
    Person,
    Schedule,
    Error,
    VerifiedUser
} from '@mui/icons-material';

interface PendingTx {
    id: string;
    createdAt: string;
    updatedAt: string;
    amount: number;
    currency: string;
    recipientName: string;
    recipientAccount: string;
    swiftCode: string;
    status: string;
    type?: string;
    reference?: string;
    errorMessage?: string;
}

const statusColor = (s: string) => {
    switch (s) {
        case 'pending': return 'info';
        case 'verified': return 'warning';
        case 'completed': return 'success';
        case 'failed': return 'error';
        default: return 'default';
    }
};

const PendingTransactions: React.FC = () => {
    const [items, setItems] = useState<PendingTx[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirm, setConfirm] = useState<{ id: string; action: 'verify' | 'submit' } | null>(null);
    const [snack, setSnack] = useState<{ open: boolean; severity: 'success' | 'error'; msg: string }>({ open: false, severity: 'success', msg: '' });
    const [filters, setFilters] = useState<{ q: string; status: string }>(() => ({ q: '', status: 'all' }));
    const [verifiedTotal, setVerifiedTotal] = useState<number>(() => Number(sessionStorage.getItem('verified_total') || 0));
    const navigate = useNavigate();

    // Role-guard on page level
    useEffect(() => {
        const role = sessionStorage.getItem('role');
        if (role !== 'employee') {
            navigate('/payment', { replace: true });
        }
    }, [navigate]);

    const load = async () => {
        setLoading(true);
        try {
            const data = await PaymentService.listPendingTransactions();
            setItems(Array.isArray(data) ? data : []);
            // update counts for nav badge (pending from list; verified uses cumulative session value)
            const pendingCount = (Array.isArray(data) ? data : []).filter((t: any) => t.status === 'pending').length;
            try {
                sessionStorage.setItem('pending_count', String(pendingCount));
                // don't overwrite verified_total here; preserve cumulative value across submits
                const vt = Number(sessionStorage.getItem('verified_total') || 0);
                setVerifiedTotal(vt);
                window.dispatchEvent(new Event('counts-updated'));
            } catch {}
            setError(null);
        } catch (e) {
            setError('Failed to load pending transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(() => {
        const q = filters.q.trim().toLowerCase();
        return items.filter(tx => {
            const statusOk = filters.status === 'all' || tx.status === filters.status;
            const textOk = !q || `${tx.recipientName} ${tx.recipientAccount} ${tx.swiftCode}`.toLowerCase().includes(q);
            return statusOk && textOk;
        });
    }, [items, filters]);

    const handleAction = async (id: string, action: 'verify' | 'submit') => {
        setConfirm(null);
        try {
            if (action === 'verify') {
                await PaymentService.verifyTransaction(id);
                // Optimistically update UI state to reflect verified status
                setItems(prev => {
                    const next = prev.map(tx => tx.id === id ? { ...tx, status: 'verified' } : tx);
                    try {
                        const pendingCount = next.filter(t => t.status === 'pending').length;
                        sessionStorage.setItem('pending_count', String(pendingCount));
                        const vt = Number(sessionStorage.getItem('verified_total') || 0) + 1;
                        sessionStorage.setItem('verified_total', String(vt));
                        setVerifiedTotal(vt);
                        window.dispatchEvent(new Event('counts-updated'));
                    } catch {}
                    return next;
                });
                setSnack({ open: true, severity: 'success', msg: 'Transaction verified' });
                return;
            }
            if (action === 'submit') {
                const res = await PaymentService.submitTransactionToSwift(id);
                const reference = res?.reference as string | undefined;
                // Mark as completed and attach SWIFT reference
                setItems(prev => {
                    const next = prev.map(tx => tx.id === id ? { ...tx, status: 'completed', reference } : tx);
                    try {
                        const pendingCount = next.filter(t => t.status === 'pending').length;
                        sessionStorage.setItem('pending_count', String(pendingCount));
                        // verified_total remains unchanged on submit
                        const vt = Number(sessionStorage.getItem('verified_total') || 0);
                        setVerifiedTotal(vt);
                        window.dispatchEvent(new Event('counts-updated'));
                    } catch {}
                    return next;
                });
                setSnack({ open: true, severity: 'success', msg: reference ? `Submitted to SWIFT (Ref: ${reference})` : 'Submitted to SWIFT' });
                return;
            }
        } catch (e) {
            setSnack({ open: true, severity: 'error', msg: 'Action failed' });
        }
    };

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: 2 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 2,
                    background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                }}>
                    Pending Transactions
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Review and process pending international payments
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <Card sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    flex: 1
                }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                                background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
                                width: 48,
                                height: 48
                            }}>
                                <Schedule />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {items.filter(tx => tx.status === 'pending').length}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    Pending Review
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    flex: 1
                }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                                background: 'linear-gradient(45deg, #34d399, #10b981)',
                                width: 48,
                                height: 48
                            }}>
                                <CheckCircle />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {items.filter(tx => tx.status === 'verified').length}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    Verified
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    flex: 1
                }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                                background: 'linear-gradient(45deg, #fb7185, #f87171)',
                                width: 48,
                                height: 48
                            }}>
                                <Error />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {items.filter(tx => tx.status === 'failed').length}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    Failed
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Stack>

            {/* Main Table Card */}
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
                            <Security sx={{ color: 'primary.main' }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Transaction Queue
                            </Typography>
                            <Badge badgeContent={filtered.length} color="primary" />
                        </Box>
                    }
                    subheader={`${filtered.length} transaction${filtered.length !== 1 ? 's' : ''} requiring attention`}
                />
                
                {/* Filters */}
                <Toolbar sx={{ gap: 2, flexWrap: 'wrap', px: 3 }}>
                    <TextField
                        size="small"
                        placeholder="Search transactions..."
                        value={filters.q}
                        onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                                </InputAdornment>
                            ),
                            sx: {
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 2,
                                minWidth: 300,
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                }
                            }
                        }}
                        InputLabelProps={{
                            sx: { color: 'rgba(255, 255, 255, 0.7)' }
                        }}
                    />
                    <TextField
                        size="small"
                        select
                        label="Status"
                        value={filters.status}
                        onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
                        sx={{ minWidth: 150 }}
                        InputProps={{
                            sx: {
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 2,
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                }
                            }
                        }}
                        InputLabelProps={{
                            sx: { color: 'rgba(255, 255, 255, 0.7)' }
                        }}
                    >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="verified">Verified</MenuItem>
                        <MenuItem value="failed">Failed</MenuItem>
                    </TextField>
                    <Box sx={{ flex: 1 }} />
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Refresh />}
                        onClick={load}
                        disabled={loading}
                        sx={{
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': {
                                borderColor: 'primary.main',
                                background: 'rgba(96, 165, 250, 0.1)'
                            }
                        }}
                    >
                        Refresh
                    </Button>
                </Toolbar>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                <CardContent sx={{ p: 0 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4, px: 3 }}>
                            <LinearProgress sx={{ flex: 1 }} />
                        <Typography>Loading pending transactions...</Typography>
                        </Box>
                    ) : error ? (
                        <Alert severity="error" sx={{ m: 3, 
                            background: 'rgba(251, 113, 133, 0.1)',
                            border: '1px solid rgba(251, 113, 133, 0.2)',
                            color: '#fb7185'
                        }}>
                            {error}
                        </Alert>
                    ) : filtered.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <VerifiedUser sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                            <Typography variant="h6" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                                No pending transactions
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                All transactions have been processed
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper} elevation={0} sx={{ background: 'transparent' }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ 
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        '& .MuiTableCell-head': {
                                            color: 'rgba(255, 255, 255, 0.9)',
                                            fontWeight: 600,
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                                        }
                                    }}>
                                        <TableCell>Date & Time</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Recipient</TableCell>
                                        <TableCell>Account</TableCell>
                                        <TableCell>SWIFT</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Reference</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.map((tx, index) => (
                                        <TableRow 
                                            key={tx.id} 
                                            hover
                                            sx={{
                                                '&:hover': {
                                                    background: 'rgba(255, 255, 255, 0.05)'
                                                },
                                                '& .MuiTableCell-root': {
                                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                                    color: 'rgba(255, 255, 255, 0.8)'
                                                }
                                            }}
                                        >
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {formatTransactionDate(tx.createdAt)}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                                        {formatTransactionTime(tx.createdAt)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {tx.amount.toFixed(2)} {tx.currency}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 24, height: 24, background: 'linear-gradient(45deg, #60a5fa, #a78bfa)' }}>
                                                        <Person sx={{ fontSize: 16 }} />
                                                    </Avatar>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {tx.recipientName}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                    {tx.recipientAccount}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                    {tx.swiftCode}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={statusColor(tx.status) === 'success' ? <CheckCircle /> : 
                                                          statusColor(tx.status) === 'warning' ? <VerifiedUser /> :
                                                          statusColor(tx.status) === 'info' ? <Schedule /> : <Error />}
                                                    label={tx.status === 'completed' ? 'Completed' : tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                                    color={statusColor(tx.status) as any}
                                                    size="small"
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        textTransform: 'capitalize'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {tx.reference ? (
                                                    <Chip
                                                        label={tx.reference}
                                                        size="small"
                                                        sx={{ fontFamily: 'monospace', background: 'rgba(96,165,250,0.12)', color: '#93c5fd' }}
                                                    />
                                                ) : (
                                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>—</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={1} justifyContent="center">
                                                    <Button 
                                                        variant="outlined" 
                                                        size="small" 
                                                        startIcon={<CheckCircle />} 
                                                        onClick={() => setConfirm({ id: tx.id, action: 'verify' })}
                                                        disabled={tx.status !== 'pending'}
                                                        sx={{
                                                            borderColor: 'rgba(52, 211, 153, 0.3)',
                                                            color: '#34d399',
                                                            '&:hover': {
                                                                borderColor: '#34d399',
                                                                background: 'rgba(52, 211, 153, 0.1)'
                                                            }
                                                        }}
                                                    >
                                                        Verify
                                                    </Button>
                                                    <Button 
                                                        variant="contained" 
                                                        size="small" 
                                                        startIcon={<Send />} 
                                                        onClick={() => setConfirm({ id: tx.id, action: 'submit' })}
                                                        disabled={tx.status !== 'verified'}
                                                        sx={{
                                                            background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
                                                            '&:hover': {
                                                                background: 'linear-gradient(45deg, #4f86e2, #8b5cf6)',
                                                            }
                                                        }}
                                                    >
                                                        Submit
                                                    </Button>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog 
                open={!!confirm} 
                onClose={() => setConfirm(null)}
                PaperProps={{
                    sx: {
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: 'white'
                }}>
                    {confirm?.action === 'verify' ? <CheckCircle sx={{ color: '#34d399' }} /> : <Send sx={{ color: '#60a5fa' }} />}
                    {confirm?.action === 'verify' ? 'Verify Transaction' : 'Submit to SWIFT'}
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        {confirm?.action === 'verify'
                            ? 'Are you sure you want to verify this transaction? This action cannot be undone.'
                            : 'Are you sure you want to submit this transaction to SWIFT? This will initiate the international transfer.'}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setConfirm(null)}
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                        Cancel
                    </Button>
                    {confirm && (
                        <Button 
                            variant="contained" 
                            onClick={() => handleAction(confirm.id, confirm.action)}
                            sx={{
                                background: confirm.action === 'verify' 
                                    ? 'linear-gradient(45deg, #34d399, #10b981)'
                                    : 'linear-gradient(45deg, #60a5fa, #a78bfa)',
                                '&:hover': {
                                    background: confirm.action === 'verify' 
                                        ? 'linear-gradient(45deg, #10b981, #059669)'
                                        : 'linear-gradient(45deg, #4f86e2, #8b5cf6)',
                                }
                            }}
                        >
                            {confirm.action === 'verify' ? 'Verify' : 'Submit'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                <Alert 
                    severity={snack.severity} 
                    onClose={() => setSnack(s => ({ ...s, open: false }))}
                    sx={{
                        background: snack.severity === 'success' 
                            ? 'rgba(52, 211, 153, 0.1)' 
                            : 'rgba(251, 113, 133, 0.1)',
                        border: `1px solid ${snack.severity === 'success' 
                            ? 'rgba(52, 211, 153, 0.2)' 
                            : 'rgba(251, 113, 133, 0.2)'}`,
                        color: snack.severity === 'success' ? '#34d399' : '#fb7185'
                    }}
                >
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PendingTransactions;



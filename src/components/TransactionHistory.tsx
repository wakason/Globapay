import React, { useState, useEffect } from 'react';
import { PaymentService } from '../services/paymentService';
import { formatTransactionDate, formatTransactionTime } from '../utils/dateFormatter';
import { 
    Box, 
    Card, 
    CardHeader, 
    CardContent, 
    Typography, 
    Table, 
    TableHead, 
    TableBody, 
    TableRow, 
    TableCell, 
    TableContainer, 
    Paper, 
    Divider,
    Chip,
    IconButton,
    Stack,
    Button,
    TextField,
    InputAdornment,
    LinearProgress,
    Alert,
    Toolbar,
    MenuItem
} from '@mui/material';
import {
    History,
    Search,
    Refresh,
    CheckCircle,
    Schedule,
    Error,
    Download,
    Visibility
} from '@mui/icons-material';

interface Transaction {
    id: string;
    createdAt: string;
    updatedAt: string;
    amount: number;
    currency: string;
    recipientName: string;
    recipientAccount: string;
    swiftCode: string;
    status: 'pending' | 'completed' | 'failed';
    type?: string;
    reference?: string;
    errorMessage?: string;
}

const TransactionHistory: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const data = await PaymentService.getTransactionHistory();
            const normalized: Transaction[] = Array.isArray(data)
                ? data
                : Array.isArray((data as any)?.transactions)
                ? (data as any).transactions
                : Array.isArray((data as any)?.items)
                ? (data as any).items
                : [];
            setTransactions(normalized);
            setError(null);
        } catch (error) {
            setError('Failed to load transaction history');
            console.error('Transaction fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const filteredTransactions = transactions.filter(transaction => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || 
            transaction.recipientName.toLowerCase().includes(searchLower) ||
            transaction.recipientAccount.toLowerCase().includes(searchLower) ||
            transaction.swiftCode.toLowerCase().includes(searchLower) ||
            transaction.currency.toLowerCase().includes(searchLower) ||
            transaction.amount.toString().includes(searchTerm) ||
            (transaction.reference && transaction.reference.toLowerCase().includes(searchLower));
        
        const matchesStatus = statusFilter === 'all' || 
            transaction.status.toLowerCase() === statusFilter.toLowerCase();
        
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <Box sx={{ maxWidth: 1400, mx: 'auto', p: 2 }}>
                <Card sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}>
                    <CardHeader title={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <History sx={{ color: 'primary.main' }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Transaction History</Typography>
                        </Box>
                    } />
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4 }}>
                            <LinearProgress sx={{ flex: 1 }} />
                        <Typography>Loading transactions...</Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ maxWidth: 1400, mx: 'auto', p: 2 }}>
                <Card sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}>
                    <CardHeader title={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <History sx={{ color: 'primary.main' }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>Transaction History</Typography>
                        </Box>
                    } />
                    <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    <CardContent>
                        <Alert severity="error" sx={{ 
                            background: 'rgba(251, 113, 133, 0.1)',
                            border: '1px solid rgba(251, 113, 133, 0.2)',
                            color: '#fb7185'
                        }}>
                            {error}
                        </Alert>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    const handleExport = () => {
        const rows = filteredTransactions.map(t => ({
            id: t.id,
            date: formatTransactionDate(t.createdAt),
            time: formatTransactionTime(t.createdAt),
            amount: t.amount.toFixed(2),
            currency: t.currency,
            recipientName: t.recipientName,
            recipientAccount: t.recipientAccount,
            swiftCode: t.swiftCode,
            status: t.status,
            reference: t.reference || ''
        }));
        const header = Object.keys(rows[0] || {
            id: '', date: '', time: '', amount: '', currency: '', recipientName: '', recipientAccount: '', swiftCode: '', status: '', reference: ''
        });
        const csv = [header.join(','), ...rows.map(r => header.map(h => {
            const v = (r as any)[h] ?? '';
            const s = String(v).replace(/"/g, '""');
            return /[",\n]/.test(s) ? `"${s}"` : s;
        }).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ts = new Date();
        a.download = `transactions_${ts.getFullYear()}-${String(ts.getMonth()+1).padStart(2,'0')}-${String(ts.getDate()).padStart(2,'0')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
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
                    Transaction History
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    View and manage your payment transactions
                </Typography>
            </Box>

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
                                All Transactions
                            </Typography>
                        </Box>
                    }
                    subheader={`${filteredTransactions.length} transaction${filteredTransactions.length !== 1 ? 's' : ''} found`}
                />
                
                {/* Filters */}
                <Toolbar sx={{ gap: 2, flexWrap: 'wrap', px: 3 }}>
                    <TextField
                        size="small"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
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
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="failed">Failed</MenuItem>
                    </TextField>
                    <Box sx={{ flex: 1 }} />
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Refresh />}
                            onClick={fetchTransactions}
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
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Download />}
                            sx={{
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                color: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    background: 'rgba(96, 165, 250, 0.1)'
                                }
                            }}
                            onClick={handleExport}
                        >
                            Export
                        </Button>
                    </Stack>
                </Toolbar>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                
                <CardContent sx={{ p: 0 }}>
                    {!Array.isArray(transactions) || transactions.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <History sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                            <Typography variant="h6" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                                No transactions found
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                Your transaction history will appear here once you make your first payment
                            </Typography>
                        </Box>
                    ) : filteredTransactions.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Search sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.3)', mb: 2 }} />
                            <Typography variant="h6" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                                No matching transactions
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                Try adjusting your search criteria
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
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredTransactions.map((transaction, index) => (
                                        <TableRow 
                                            key={transaction.id} 
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
                                                        {formatTransactionDate(transaction.createdAt)}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                                        {formatTransactionTime(transaction.createdAt)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {transaction.amount.toFixed(2)} {transaction.currency}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {transaction.recipientName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                    {transaction.recipientAccount}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                    {transaction.swiftCode}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={getStatusIcon(transaction.status)}
                                                    label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                                    color={getStatusColor(transaction.status) as any}
                                                    size="small"
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        textTransform: 'capitalize'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton size="small" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                    <Visibility />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default TransactionHistory;

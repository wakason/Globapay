import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PaymentService } from '../services/paymentService';
import { validateSwiftCode } from '../utils/validation';
import { Box, Card, CardHeader, CardContent, Grid, TextField, Button, Typography, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Divider, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Snackbar, Alert, IconButton, Toolbar, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import LaunchIcon from '@mui/icons-material/Launch';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

interface PaymentMethod {
    id?: string;
    type: string;
    accountNumber: string;
    swiftCode?: string;
    bankName?: string;
    bankAddress?: string;
}

const PaymentMethods: React.FC = () => {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [swiftVerifying, setSwiftVerifying] = useState(false);
    const [isSwiftValid, setIsSwiftValid] = useState(false);
    const [snack, setSnack] = useState<{ open: boolean; severity: 'success' | 'error'; msg: string }>({ open: false, severity: 'success', msg: '' });
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            type: 'swift',
            accountNumber: '',
            swiftCode: '',
            bankName: '',
            bankAddress: ''
        },
        validationSchema: Yup.object({
            type: Yup.string().required('Type is required'),
            accountNumber: Yup.string().required('Account number is required'),
            swiftCode: Yup.string().when('type', {
                is: (val: string) => val?.toLowerCase() === 'swift',
                then: schema => schema.required('SWIFT code is required').test('valid-swift', 'Invalid SWIFT code format', validateSwiftCode),
                otherwise: schema => schema.notRequired()
            }),
            bankName: Yup.string().notRequired(),
            bankAddress: Yup.string().notRequired()
        }),
        onSubmit: async (values, { setSubmitting, resetForm, setStatus }) => {
            try {
                const created = await PaymentService.addPaymentMethod(values);
                setStatus({ success: true, message: 'Payment method added' });
                setSnack({ open: true, severity: 'success', msg: 'Payment method added' });
                // Optimistic insert: try to derive created method shape
                const createdMethod: PaymentMethod | undefined = created && (created as any).id ? {
                    id: (created as any).id,
                    type: (created as any).type || values.type,
                    accountNumber: (created as any).accountNumber || values.accountNumber,
                    swiftCode: (created as any).swiftCode || values.swiftCode,
                    bankName: (created as any).bankName || values.bankName,
                    bankAddress: (created as any).bankAddress || values.bankAddress
                } : undefined;
                if (createdMethod) {
                    setMethods(prev => [createdMethod, ...prev]);
                } else {
                    await loadMethods();
                }
                resetForm();
                setDialogOpen(false);
            } catch (e) {
                setStatus({ success: false, error: 'Failed to add method' });
                setSnack({ open: true, severity: 'error', msg: 'Failed to add method' });
            } finally {
                setSubmitting(false);
            }
        }
    });

    const loadMethods = async () => {
        setLoading(true);
        try {
            const data = await PaymentService.getPaymentMethods();
            const normalized: PaymentMethod[] = Array.isArray(data)
                ? data
                : Array.isArray((data as any)?.methods)
                ? (data as any).methods
                : Array.isArray((data as any)?.items)
                ? (data as any).items
                : Array.isArray((data as any)?.data)
                ? (data as any).data
                : Array.isArray((data as any)?.list)
                ? (data as any).list
                : [];
            setMethods(normalized);
            setError(null);
        } catch (e) {
            setError('Failed to load payment methods');
            setMethods([]);
        } finally {
            setLoading(false);
        }
    };

    const verifySwiftCode = async () => {
        if (!formik.values.swiftCode || formik.errors.swiftCode) return;
        setSwiftVerifying(true);
        try {
            const result = await PaymentService.verifySwiftCode(formik.values.swiftCode);
            setIsSwiftValid(!!result?.isValid);
            if (!result?.isValid) {
                formik.setFieldError('swiftCode', 'Invalid SWIFT code');
            }
        } catch (e) {
            setIsSwiftValid(false);
            formik.setFieldError('swiftCode', 'SWIFT verification failed');
        } finally {
            setSwiftVerifying(false);
        }
    };

    useEffect(() => {
        loadMethods();
    }, []);

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Card sx={{ mb: 2 }}>
                <CardHeader title="Beneficiaries" />
                <Toolbar sx={{ gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search by account, SWIFT, bank"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
                        sx={{ maxWidth: 420, flex: 1 }}
                    />
                    <Box sx={{ flex: 1 }} />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setDialogOpen(true); setIsSwiftValid(false); }}>Add method</Button>
                </Toolbar>
            </Card>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>
                    Add payment method
                    <IconButton aria-label="close" onClick={() => setDialogOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <form id="add-method-form" onSubmit={formik.handleSubmit} noValidate>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={3}>
                                <TextField id="type" select fullWidth label="Type" {...formik.getFieldProps('type')}>
                                    <MenuItem value="swift">SWIFT</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField id="accountNumber" fullWidth label="Account Number" {...formik.getFieldProps('accountNumber')} error={formik.touched.accountNumber && Boolean(formik.errors.accountNumber)} helperText={formik.touched.accountNumber && formik.errors.accountNumber} />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField id="swiftCode" fullWidth label="SWIFT Code" {...formik.getFieldProps('swiftCode')} error={formik.touched.swiftCode && Boolean(formik.errors.swiftCode)} helperText={formik.touched.swiftCode && formik.errors.swiftCode} />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Button variant="contained" onClick={verifySwiftCode} disabled={!formik.values.swiftCode || !!formik.errors.swiftCode || swiftVerifying} sx={{ height: '100%', minWidth: 160 }}>{swiftVerifying ? 'Verifying…' : isSwiftValid ? 'Verified' : 'Verify SWIFT'}</Button>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField id="bankName" fullWidth label="Bank Name" {...formik.getFieldProps('bankName')} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField id="bankAddress" fullWidth label="Bank Address" {...formik.getFieldProps('bankAddress')} />
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button
                        type="submit"
                        form="add-method-form"
                        variant="contained"
                        disabled={formik.isSubmitting || (formik.values.type === 'swift' && !isSwiftValid)}
                        onClick={async (e) => {
                            // If editing, route to update endpoint
                            if ((formik as any).__editId) {
                                e.preventDefault();
                                try {
                                    await PaymentService.updatePaymentMethod((formik as any).__editId, formik.values as any);
                                    setSnack({ open: true, severity: 'success', msg: 'Method updated' });
                                    (formik as any).__editId = undefined;
                                    setDialogOpen(false);
                                    await loadMethods();
                                } catch {
                                    setSnack({ open: true, severity: 'error', msg: 'Update failed' });
                                }
                            }
                        }}
                    >
                        {formik.isSubmitting ? 'Saving…' : ((formik as any).__editId ? 'Update beneficiary' : 'Save beneficiary')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Card>
                <CardHeader title="All Beneficiaries" />
                <Divider />
                <CardContent>
                    {loading ? (
                        <Typography>Loading beneficiaries...</Typography>
                    ) : error ? (
                        <Typography color="error">{error}</Typography>
                    ) : (!Array.isArray(methods) || methods.length === 0) ? (
                        <Typography>No beneficiaries found</Typography>
                    ) : (
                        <TableContainer component={Paper} elevation={0}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Account</TableCell>
                                        <TableCell>SWIFT</TableCell>
                                        <TableCell>Bank</TableCell>
                                        <TableCell>Address</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(methods.filter(m => {
                                        const q = query.trim().toLowerCase();
                                        if (!q) return true;
                                        const hay = `${m.type} ${m.accountNumber} ${m.swiftCode || ''} ${m.bankName || ''} ${m.bankAddress || ''}`.toLowerCase();
                                        return hay.includes(q);
                                    })).map((m, idx) => {
                                        const maskedAcc = m.accountNumber.length > 4 ? `${'*'.repeat(Math.max(0, m.accountNumber.length - 4))}${m.accountNumber.slice(-4)}` : m.accountNumber;
                                        return (
                                            <TableRow key={m.id || idx}>
                                                <TableCell>{m.type.toUpperCase()}</TableCell>
                                                <TableCell>{maskedAcc}</TableCell>
                                                <TableCell>{m.swiftCode || '-'}</TableCell>
                                                <TableCell>{m.bankName || '-'}</TableCell>
                                                <TableCell>{m.bankAddress || '-'}</TableCell>
                                                <TableCell align="right">
                                                <Button size="small" startIcon={<LaunchIcon />} onClick={() => navigate('/payment', { state: { prefillMethod: m } })}>Use</Button>
                                                <Button size="small" startIcon={<EditIcon />} onClick={() => { setDialogOpen(true); setIsSwiftValid(!!m.swiftCode); formik.setValues({ type: m.type, accountNumber: m.accountNumber, swiftCode: m.swiftCode || '', bankName: m.bankName || '', bankAddress: m.bankAddress || '' } as any); (formik as any).__editId = m.id; }}>Edit</Button>
                                                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={async () => { if (m.id && window.confirm('Delete this method?')) { try { await PaymentService.deletePaymentMethod(m.id); setSnack({ open: true, severity: 'success', msg: 'Method deleted' }); await loadMethods(); } catch { setSnack({ open: true, severity: 'error', msg: 'Delete failed' }); } } }}>Delete</Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

            <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
            </Snackbar>
        </Box>
    );
};

export default PaymentMethods;



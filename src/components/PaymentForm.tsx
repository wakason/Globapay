import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { validateAmount, validateSwiftCode } from '../utils/validation';
import { PaymentService } from '../services/paymentService';
import {
    Box,
    Card,
    CardHeader,
    CardContent,
    Grid,
    TextField,
    MenuItem,
    Button,
    Stack,
    Typography,
    Divider,
    Alert,
    Chip,
    Fade,
    CircularProgress,
    InputAdornment,
    Paper
} from '@mui/material';
import {
    AccountBalance,
    Person,
    AccountBalanceWallet,
    CheckCircle,
    Security,
    Speed,
    TrendingUp,
    AttachMoney,
    Language,
    VerifiedUser
} from '@mui/icons-material';

interface Currency {
    code: string;
    name: string;
    symbol: string;
}

const CURRENCIES: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' }
];

const PaymentForm: React.FC = () => {
    const location = useLocation() as any;
    const [isSwiftValid, setIsSwiftValid] = useState<boolean>(false);
    const [swiftVerifying, setSwiftVerifying] = useState<boolean>(false);

    const formik = useFormik({
        initialValues: {
            amount: '',
            currency: 'ZAR',
            recipientAccount: '',
            swiftCode: '',
            recipientName: ''
        },
        validationSchema: Yup.object({
            amount: Yup.string()
                .required('Amount is required')
                .test('valid-amount', 'Invalid amount format', validateAmount),
            currency: Yup.string()
                .required('Currency is required')
                .oneOf(CURRENCIES.map(c => c.code)),
            recipientAccount: Yup.string()
                .required('Recipient account number is required')
                .min(10, 'Account number must be at least 10 characters')
                .max(20, 'Account number must not exceed 20 characters'),
            swiftCode: Yup.string()
                .required('SWIFT code is required')
                .test('valid-swift', 'Invalid SWIFT code format', validateSwiftCode),
            recipientName: Yup.string()
                .required('Recipient name is required')
                .min(2, 'Name must be at least 2 characters')
                .max(50, 'Name must not exceed 50 characters')
        }),
        onSubmit: async (values, { setSubmitting, setStatus }) => {
            try {
                if (!isSwiftValid) {
                    setStatus({ success: false, error: 'Please verify SWIFT code first' });
                    return;
                }

                await PaymentService.initiatePayment({
                    amount: parseFloat(values.amount),
                    currency: values.currency,
                    recipientAccount: values.recipientAccount,
                    swiftCode: values.swiftCode,
                    recipientName: values.recipientName
                });

                setStatus({ success: true, message: 'Payment initiated successfully' });
            } catch (error) {
                setStatus({ 
                    success: false, 
                    error: 'Payment initiation failed. Please try again.' 
                });
            } finally {
                setSubmitting(false);
            }
        }
    });

    const verifySwiftCode = async () => {
        if (!formik.values.swiftCode || formik.errors.swiftCode) {
            return;
        }

        setSwiftVerifying(true);
        try {
            const result = await PaymentService.verifySwiftCode(formik.values.swiftCode);
            setIsSwiftValid(result.isValid);
            if (!result.isValid) {
                formik.setFieldError('swiftCode', 'Invalid SWIFT code');
            }
        } catch (error) {
            setIsSwiftValid(false);
            formik.setFieldError('swiftCode', 'SWIFT code verification failed');
        } finally {
            setSwiftVerifying(false);
        }
    };

    useEffect(() => {
        setIsSwiftValid(false);
    }, [formik.values.swiftCode]);

    // Prefill from navigation state (selected saved method)
    useEffect(() => {
        const pre = location?.state?.prefillMethod;
        if (pre) {
            formik.setFieldValue('recipientAccount', pre.accountNumber || '');
            if (pre.swiftCode) {
                formik.setFieldValue('swiftCode', pre.swiftCode);
                // attempt auto-verify
                (async () => {
                    try {
                        setSwiftVerifying(true);
                        const result = await PaymentService.verifySwiftCode(pre.swiftCode);
                        setIsSwiftValid(!!result?.isValid);
                    } catch {
                        setIsSwiftValid(false);
                    } finally {
                        setSwiftVerifying(false);
                    }
                })();
            }
        }
        // Clear state after applying to avoid reusing on back/forward
        if (location?.state?.prefillMethod) {
            location.state.prefillMethod = undefined;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            {/* Header Section */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    mb: 2,
                    background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent'
                }}>
                    International Payment
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
                    Send secure international payments with bank-grade security
                </Typography>
                
                {/* Features */}
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                    <Chip 
                        icon={<Security />} 
                        label="Bank-Grade Security" 
                        size="small" 
                        sx={{ 
                            background: 'rgba(52, 211, 153, 0.1)', 
                            color: '#34d399',
                            border: '1px solid rgba(52, 211, 153, 0.2)'
                        }} 
                    />
                    <Chip 
                        icon={<Speed />} 
                        label="Fast Processing" 
                        size="small" 
                        sx={{ 
                            background: 'rgba(96, 165, 250, 0.1)', 
                            color: '#60a5fa',
                            border: '1px solid rgba(96, 165, 250, 0.2)'
                        }} 
                    />
                    <Chip 
                        icon={<TrendingUp />} 
                        label="Global Reach" 
                        size="small" 
                        sx={{ 
                            background: 'rgba(167, 139, 250, 0.1)', 
                            color: '#a78bfa',
                            border: '1px solid rgba(167, 139, 250, 0.2)'
                        }} 
                    />
                </Stack>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AccountBalanceWallet sx={{ color: 'primary.main' }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Payment Details
                            </Typography>
                        </Box>
                    }
                    subheader="Enter payment information and verify SWIFT code before submitting"
                />
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <CardContent sx={{ p: 4 }}>
                    <form onSubmit={formik.handleSubmit} noValidate>
                        <Grid container spacing={3}>
                            {/* Amount and Currency */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    id="amount"
                                    label="Amount"
                                    placeholder="0.00"
                                    fullWidth
                                    value={formik.values.amount}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                                    helperText={formik.touched.amount && formik.errors.amount}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AttachMoney sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                                            </InputAdornment>
                                        ),
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
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    id="currency"
                                    select
                                    label="Currency"
                                    fullWidth
                                    value={formik.values.currency}
                                    onChange={(e) => {
                                        formik.setFieldValue('currency', e.target.value);
                                        formik.setFieldTouched('currency', true);
                                    }}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.currency && Boolean(formik.errors.currency)}
                                    helperText={formik.touched.currency && formik.errors.currency}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Language sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                                            </InputAdornment>
                                        ),
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
                                    {CURRENCIES.map(c => (
                                        <MenuItem key={c.code} value={c.code}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 20 }}>
                                                    {c.symbol}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {c.name} ({c.code})
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {/* Recipient Details */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    id="recipientName"
                                    label="Recipient Name"
                                    placeholder="Enter recipient's full name"
                                    fullWidth
                                    value={formik.values.recipientName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.recipientName && Boolean(formik.errors.recipientName)}
                                    helperText={formik.touched.recipientName && formik.errors.recipientName}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Person sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                                            </InputAdornment>
                                        ),
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
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    id="recipientAccount"
                                    label="Recipient Account Number"
                                    placeholder="Enter recipient's account number"
                                    fullWidth
                                    value={formik.values.recipientAccount}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={formik.touched.recipientAccount && Boolean(formik.errors.recipientAccount)}
                                    helperText={formik.touched.recipientAccount && formik.errors.recipientAccount}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AccountBalance sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                                            </InputAdornment>
                                        ),
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
                                />
                            </Grid>

                            {/* SWIFT Code Section */}
                            <Grid item xs={12}>
                                <Paper sx={{ 
                                    p: 3, 
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: 2
                                }}>
                                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <VerifiedUser sx={{ color: 'primary.main' }} />
                                        SWIFT Code Verification
                                    </Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'flex-end' }}>
                                    <TextField
                                        id="swiftCode"
                                        label="SWIFT Code"
                                            placeholder="Enter 8-11 character SWIFT code"
                                        fullWidth
                                        value={formik.values.swiftCode}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.swiftCode && Boolean(formik.errors.swiftCode)}
                                        helperText={formik.touched.swiftCode && formik.errors.swiftCode}
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
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={verifySwiftCode}
                                        disabled={!formik.values.swiftCode || !!formik.errors.swiftCode || swiftVerifying}
                                            sx={{ 
                                                minWidth: 180,
                                                py: 1.5,
                                                background: isSwiftValid 
                                                    ? 'linear-gradient(45deg, #34d399, #10b981)' 
                                                    : 'linear-gradient(45deg, #60a5fa, #a78bfa)',
                                                '&:hover': {
                                                    background: isSwiftValid 
                                                        ? 'linear-gradient(45deg, #10b981, #059669)' 
                                                        : 'linear-gradient(45deg, #4f86e2, #8b5cf6)',
                                                }
                                            }}
                                        >
                                            {swiftVerifying ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <CircularProgress size={16} color="inherit" />
                                                    Verifying...
                                                </Box>
                                            ) : isSwiftValid ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <CheckCircle sx={{ fontSize: 16 }} />
                                                    Verified
                                                </Box>
                                            ) : (
                                                'Verify SWIFT'
                                            )}
                                    </Button>
                                </Stack>
                                {isSwiftValid && (
                                        <Fade in={isSwiftValid}>
                                            <Alert 
                                                severity="success" 
                                                sx={{ 
                                                    mt: 2,
                                                    background: 'rgba(52, 211, 153, 0.1)',
                                                    border: '1px solid rgba(52, 211, 153, 0.2)',
                                                    color: '#34d399'
                                                }}
                                            >
                                                SWIFT code verified successfully
                                            </Alert>
                                        </Fade>
                                    )}
                                </Paper>
                            </Grid>

                            {/* Status Messages */}
                            <Grid item xs={12}>
                                <Fade in={formik.status && (formik.status.error || formik.status.success)}>
                                    <Alert 
                                        severity={formik.status?.success ? 'success' : 'error'} 
                                        sx={{ 
                                            background: formik.status?.success 
                                                ? 'rgba(52, 211, 153, 0.1)' 
                                                : 'rgba(251, 113, 133, 0.1)',
                                            border: `1px solid ${formik.status?.success 
                                                ? 'rgba(52, 211, 153, 0.2)' 
                                                : 'rgba(251, 113, 133, 0.2)'}`,
                                            color: formik.status?.success ? '#34d399' : '#fb7185'
                                        }}
                                    >
                                        {formik.status?.error || formik.status?.message}
                                    </Alert>
                                </Fade>
                            </Grid>

                            {/* Submit Button */}
                            <Grid item xs={12}>
                                <Stack direction="row" spacing={2} justifyContent="center">
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={formik.isSubmitting || !formik.isValid || !isSwiftValid}
                                        sx={{
                                            px: 6,
                                            py: 1.5,
                                            background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                            boxShadow: '0 4px 20px rgba(96, 165, 250, 0.3)',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #4f86e2, #8b5cf6)',
                                                boxShadow: '0 6px 25px rgba(96, 165, 250, 0.4)',
                                                transform: 'translateY(-1px)'
                                            },
                                            '&:disabled': {
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                color: 'rgba(255, 255, 255, 0.3)'
                                            }
                                        }}
                                    >
                                        {formik.isSubmitting ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CircularProgress size={20} color="inherit" />
                                                Processing Payment...
                                            </Box>
                                        ) : (
                                            'Send Payment'
                                        )}
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default PaymentForm;

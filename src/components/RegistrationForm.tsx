import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
    validateName, 
    validateIdNumber, 
    validateAccountNumber, 
    validatePassword 
} from '../utils/validation';
import { AuthService } from '../services/authService';
import { 
    Box, 
    Card, 
    CardContent, 
    TextField, 
    Button, 
    Typography, 
    Alert,
    Divider,
    Stack,
    Chip,
    Fade,
    CircularProgress,
    Grid,
    InputAdornment,
    IconButton
} from '@mui/material';
import { 
    AccountBalanceWallet, 
    Security, 
    TrendingUp, 
    Person, 
    Badge, 
    AccountBalance,
    Visibility,
    VisibilityOff
} from '@mui/icons-material';

const RegistrationForm: React.FC = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

    const formik = useFormik({
        initialValues: {
            username: '',
            fullName: '',
            idNumber: '',
            accountNumber: '',
            password: '',
            confirmPassword: ''
        },
        validationSchema: Yup.object({
            username: Yup.string().required('Username is required'),
            fullName: Yup.string()
                .required('Full name is required')
                .test('valid-name', 'Invalid name format', validateName),
            idNumber: Yup.string()
                .required('ID number is required')
                .test('valid-id', 'Invalid ID number format', validateIdNumber),
            accountNumber: Yup.string()
                .required('Account number is required')
                .test('valid-account', 'Invalid account number format', validateAccountNumber),
            password: Yup.string()
                .required('Password is required')
                .test('valid-password', 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character', validatePassword),
            confirmPassword: Yup.string()
                .required('Please confirm your password')
                .oneOf([Yup.ref('password')], 'Passwords must match')
        }),
        onSubmit: async (values, { setSubmitting, setStatus, setFieldError }) => {
            try {
                await AuthService.register({
                    username: values.username,
                    fullName: values.fullName,
                    idNumber: values.idNumber,
                    accountNumber: values.accountNumber,
                    password: values.password
                });
                setStatus({ success: true });
                // Handle successful registration (e.g., redirect to login)
            } catch (error: any) {
                const apiError = error?.response?.data;
                if (apiError?.errors && Array.isArray(apiError.errors)) {
                    apiError.errors.forEach((e: any) => {
                        if (e.param) setFieldError(e.param, e.msg || 'Invalid');
                    });
                }
                setStatus({ success: false, error: apiError?.message || 'Registration failed. Please try again.' });
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0b1020 0%, #0a0f1a 100%)',
            position: 'relative',
            overflow: 'hidden',
            py: 4
        }}>
            {/* Animated background elements */}
            <Box sx={{
                position: 'absolute',
                top: '5%',
                left: '5%',
                width: 200,
                height: 200,
                background: 'radial-gradient(circle, rgba(125, 211, 252, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'float 6s ease-in-out infinite'
            }} />
            <Box sx={{
                position: 'absolute',
                bottom: '10%',
                right: '10%',
                width: 150,
                height: 150,
                background: 'radial-gradient(circle, rgba(167, 139, 250, 0.08) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'float 8s ease-in-out infinite reverse'
            }} />
            
            <Card sx={{ 
                maxWidth: 600, 
                width: '100%', 
                mx: 2,
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
                <CardContent sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                            <AccountBalanceWallet sx={{ fontSize: 40, color: 'primary.main', mr: 1 }} />
                            <Typography variant="h4" sx={{ 
                                fontWeight: 700, 
                                background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent'
                            }}>
                                GlobaPay
                            </Typography>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: 'white' }}>
                            Create Your Account
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Join GlobaPay to start sending secure international payments
                        </Typography>
                    </Box>

                    {/* Features */}
                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
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
                            icon={<TrendingUp />} 
                            label="Global Reach" 
                            size="small" 
                            sx={{ 
                                background: 'rgba(96, 165, 250, 0.1)', 
                                color: '#60a5fa',
                                border: '1px solid rgba(96, 165, 250, 0.2)'
                            }} 
                        />
                    </Stack>

                    <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                    {/* Registration Form */}
                    <form onSubmit={formik.handleSubmit}>
                        <Stack spacing={3}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                            id="username"
                                        label="Username"
                            placeholder="Choose a username"
                                        value={formik.values.username}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.username && Boolean(formik.errors.username)}
                                        helperText={formik.touched.username && formik.errors.username}
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
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                            id="fullName"
                                        label="Full Name"
                            placeholder="Your full legal name"
                                        value={formik.values.fullName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                                        helperText={formik.touched.fullName && formik.errors.fullName}
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
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                            id="idNumber"
                                        label="ID Number"
                                        placeholder="National ID or Passport"
                                        value={formik.values.idNumber}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.idNumber && Boolean(formik.errors.idNumber)}
                                        helperText={formik.touched.idNumber && formik.errors.idNumber}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Badge sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
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
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                            id="accountNumber"
                                        label="Account Number"
                            placeholder="Your bank account number"
                                        value={formik.values.accountNumber}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.accountNumber && Boolean(formik.errors.accountNumber)}
                                        helperText={formik.touched.accountNumber && formik.errors.accountNumber}
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
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                            id="password"
                                        label="Password"
                                        type={passwordVisible ? 'text' : 'password'}
                            placeholder="Minimum 8 characters with symbols"
                                        value={formik.values.password}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.password && Boolean(formik.errors.password)}
                                        helperText={formik.touched.password && formik.errors.password}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => setPasswordVisible(!passwordVisible)}
                                                        edge="end"
                                                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                                    >
                                                        {passwordVisible ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
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
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                            id="confirmPassword"
                                        label="Confirm Password"
                                        type={confirmPasswordVisible ? 'text' : 'password'}
                            placeholder="Re-enter your password"
                                        value={formik.values.confirmPassword}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                                        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle confirm password visibility"
                                                        onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                                        edge="end"
                                                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                                    >
                                                        {confirmPasswordVisible ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
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
                            </Grid>

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
                                    {formik.status?.error || 'Registration successful!'}
                                </Alert>
                            </Fade>

                            <Button
                        type="submit" 
                                fullWidth
                                variant="contained"
                        disabled={formik.isSubmitting || !formik.isValid}
                                sx={{
                                    py: 1.5,
                                    background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontSize: '1rem',
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
                                        Creating account...
                                    </Box>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </Stack>
                </form>

                    <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                    {/* Footer */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                            Already have an account?
                        </Typography>
                        <Button 
                            variant="text" 
                            href="/login"
                            sx={{ 
                                color: 'primary.main',
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': {
                                    background: 'rgba(96, 165, 250, 0.1)'
                                }
                            }}
                        >
                            Sign In
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
            `}</style>
        </Box>
    );
};

export default RegistrationForm;

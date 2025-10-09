import React, { useState } from 'react';
import { Visibility, VisibilityOff, AccountBalanceWallet, Security, TrendingUp } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { 
    Box, 
    Card, 
    CardContent, 
    TextField, 
    Button, 
    Typography, 
    InputAdornment, 
    IconButton, 
    Alert,
    Divider,
    Stack,
    Chip,
    Fade,
    CircularProgress
} from '@mui/material';

const LoginForm: React.FC = () => {
    const navigate = useNavigate();

    const [passwordVisible, setPasswordVisible] = useState(false);

    const formik = useFormik({
        initialValues: {
            username: '',
            password: ''
        },
        validationSchema: Yup.object({
            username: Yup.string().required('Username is required'),
            password: Yup.string().required('Password is required')
        }),
        onSubmit: async (values, { setSubmitting, setStatus }) => {
            try {
                const response = await AuthService.login({
                    username: values.username,
                    password: values.password
                });

                if (response.token) {
                    sessionStorage.setItem('isAuthenticated', 'true');
                    const role = response?.user?.role || sessionStorage.getItem('role');
                    if (role === 'employee') {
                        navigate('/pending');
                    } else {
                    navigate('/payment');
                    }
                }
            } catch (error: any) {
                const apiError = error;
                // Surface backend validation errors if present
                if (apiError?.errors && Array.isArray(apiError.errors)) {
                    apiError.errors.forEach((e: any) => {
                        const field = e.param as 'username' | 'password';
                        if (field && formik.values[field] !== undefined) {
                            formik.setFieldError(field, e.msg || 'Invalid');
                        }
                    });
                }
                setStatus({
                    success: false,
                    error: apiError?.message || 'Login failed. Please try again.'
                });
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
            overflow: 'hidden'
        }}>
            {/* Animated background elements */}
            <Box sx={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                width: 200,
                height: 200,
                background: 'radial-gradient(circle, rgba(125, 211, 252, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'float 6s ease-in-out infinite'
            }} />
            <Box sx={{
                position: 'absolute',
                bottom: '20%',
                right: '15%',
                width: 150,
                height: 150,
                background: 'radial-gradient(circle, rgba(167, 139, 250, 0.08) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: 'float 8s ease-in-out infinite reverse'
            }} />
            
            <Card sx={{ 
                maxWidth: 480, 
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
                            Welcome Back
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Sign in to access your international payment portal
                        </Typography>
                    </Box>

                    {/* Features */}
                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
                        <Chip 
                            icon={<Security />} 
                            label="Secure" 
                            size="small" 
                            sx={{ 
                                background: 'rgba(52, 211, 153, 0.1)', 
                                color: '#34d399',
                                border: '1px solid rgba(52, 211, 153, 0.2)'
                            }} 
                        />
                        <Chip 
                            icon={<TrendingUp />} 
                            label="Fast" 
                            size="small" 
                            sx={{ 
                                background: 'rgba(96, 165, 250, 0.1)', 
                                color: '#60a5fa',
                                border: '1px solid rgba(96, 165, 250, 0.2)'
                            }} 
                        />
                    </Stack>

                    <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                    {/* Login Form */}
                    <form onSubmit={formik.handleSubmit}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                id="username"
                                label="Username"
                                placeholder="Enter your username"
                                value={formik.values.username}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.username && Boolean(formik.errors.username)}
                                helperText={formik.touched.username && formik.errors.username}
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

                            <TextField
                                fullWidth
                            id="password"
                                label="Password"
                                type={passwordVisible ? 'text' : 'password'}
                            placeholder="Enter your password"
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

                            <Fade in={formik.status && formik.status.error}>
                                <Alert severity="error" sx={{ 
                                    background: 'rgba(251, 113, 133, 0.1)',
                                    border: '1px solid rgba(251, 113, 133, 0.2)',
                                    color: '#fb7185'
                                }}>
                                    {formik.status?.error}
                                </Alert>
                            </Fade>

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={formik.isSubmitting}
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
                                        Signing in...
                                    </Box>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </Stack>
                    </form>

                    <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                    {/* Footer */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                            Don't have an account?
                        </Typography>
                        <Button 
                            variant="text" 
                            href="/register"
                            sx={{ 
                                color: 'primary.main',
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': {
                                    background: 'rgba(96, 165, 250, 0.1)'
                                }
                            }}
                        >
                            Create Account
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

export default LoginForm;

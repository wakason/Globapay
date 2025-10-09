import { api, normalizeError } from './apiClient';
import { sanitizeInput } from '../utils/validation';

interface LoginCredentials {
    username: string;
    password: string;
}

interface RegistrationData {
    username: string;
    fullName: string;
    idNumber: string;
    accountNumber: string;
    password: string;
}

// shared api client & normalizeError are imported

export const AuthService = {
    async register(data: RegistrationData) {
        const sanitizedData = {
            username: sanitizeInput(data.username),
            fullName: sanitizeInput(data.fullName),
            idNumber: sanitizeInput(data.idNumber),
            accountNumber: sanitizeInput(data.accountNumber),
            password: data.password, // Password will be hashed on the server
        };

        try {
            const response = await api.post('auth/register', sanitizedData);
            return response.data;
        } catch (error) {
            throw normalizeError(error);
        }
    },

    async login(credentials: LoginCredentials) {
        const sanitizedCredentials = {
            username: sanitizeInput(credentials.username),
            password: credentials.password,
        };

        try {
            const response = await api.post('auth/login', sanitizedCredentials);
            if (response.data?.token) {
                sessionStorage.setItem('token', response.data.token);
                sessionStorage.setItem('isAuthenticated', 'true');
                if (response.data.user) {
                    try {
                        sessionStorage.setItem('user', JSON.stringify(response.data.user));
                        if (response.data.user.role) {
                            sessionStorage.setItem('role', response.data.user.role);
                        }
                    } catch {}
                }
            }
            return response.data;
        } catch (error) {
            throw normalizeError(error);
        }
    },

    async logout() {
        try {
            await api.post('auth/logout');
            localStorage.removeItem('user');
            sessionStorage.clear();
        } catch (error) {
            throw normalizeError(error);
        }
    },

    // Verify current session
    async verifySession() {
        try {
            // Prefer Postman route first
            const response = await api.get('auth/verify-session');
            return response.data;
        } catch (primaryError) {
            // Fallback to older backend route if available
            try {
                const response = await api.get('auth/verify');
                return response.data;
            } catch (secondaryError) {
                throw normalizeError(primaryError || secondaryError);
            }
        }
    }
};

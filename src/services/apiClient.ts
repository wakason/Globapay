import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE } from '../config/api';

export const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem('token');
    if (token) {
        if ((config.headers as any)?.set) {
            (config.headers as any).set('Authorization', `Bearer ${token}`);
        } else {
            config.headers = { ...(config.headers as any), Authorization: `Bearer ${token}` } as any;
        }
    }
    return config;
});

export function normalizeError(error: unknown) {
    const axiosErr = error as AxiosError<any>;
    const data = axiosErr?.response?.data;
    return {
        status: axiosErr?.response?.status,
        message: data?.message || 'Request failed',
        errors: Array.isArray(data?.errors) ? data.errors : undefined
    };
}



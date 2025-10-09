import { api, normalizeError } from './apiClient';
import { sanitizeInput } from '../utils/validation';

interface PaymentData {
    amount: number;
    currency: string;
    recipientAccount: string;
    swiftCode: string;
    recipientName: string;
}

// shared api client handles baseURL and auth header

export const PaymentService = {
    async initiatePayment(paymentData: PaymentData) {
        const sanitizedData = {
            amount: paymentData.amount,
            currency: sanitizeInput(paymentData.currency),
            recipientAccount: sanitizeInput(paymentData.recipientAccount),
            swiftCode: sanitizeInput(paymentData.swiftCode),
            recipientName: sanitizeInput(paymentData.recipientName)
        };

        try {
            const response = await api.post('payments/international', sanitizedData);
            return response.data;
        } catch (error) {
            throw normalizeError(error);
        }
    },

    async getTransactionHistory() {
        try {
            const response = await api.get('payments/history');
            return response.data;
        } catch (error) {
            throw normalizeError(error);
        }
    },

    async verifySwiftCode(swiftCode: string) {
        try {
            const response = await api.post('payments/verify-swift', {
                swiftCode: sanitizeInput(swiftCode)
            });
            return response.data;
        } catch (error) {
            throw normalizeError(error);
        }
    },

    async getPaymentMethods() {
        try {
            const response = await api.get('payments/methods');
            // Backend returns { success, paymentMethods: [...] }
            const data = response.data;
            return Array.isArray(data?.paymentMethods) ? data.paymentMethods : data;
        } catch (error) {
            throw normalizeError(error);
        }
    },

    async addPaymentMethod(method: { type: string; accountNumber: string; swiftCode?: string; bankName?: string; bankAddress?: string; }) {
        try {
            const response = await api.post('payments/methods', {
                type: sanitizeInput(method.type),
                accountNumber: sanitizeInput(method.accountNumber),
                swiftCode: method.swiftCode ? sanitizeInput(method.swiftCode) : undefined,
                bankName: method.bankName ? sanitizeInput(method.bankName) : undefined,
                bankAddress: method.bankAddress ? sanitizeInput(method.bankAddress) : undefined
            });
            // Backend returns { success, paymentMethod: {...} }
            return response.data?.paymentMethod || response.data;
        } catch (error) {
            throw normalizeError(error);
        }
    },

    async updatePaymentMethod(id: string, method: { type?: string; accountNumber?: string; swiftCode?: string; bankName?: string; bankAddress?: string; }) {
        try {
            const response = await api.put(`payments/methods/${encodeURIComponent(id)}`, {
                type: method.type ? sanitizeInput(method.type) : undefined,
                accountNumber: method.accountNumber ? sanitizeInput(method.accountNumber) : undefined,
                swiftCode: method.swiftCode ? sanitizeInput(method.swiftCode) : undefined,
                bankName: method.bankName ? sanitizeInput(method.bankName) : undefined,
                bankAddress: method.bankAddress ? sanitizeInput(method.bankAddress) : undefined
            });
            return response.data;
        } catch (error) {
            throw normalizeError(error);
        }
    },

    async deletePaymentMethod(id: string) {
        try {
            const response = await api.delete(`payments/methods/${encodeURIComponent(id)}`);
            return response.data;
        } catch (error) {
            throw normalizeError(error);
        }
    },

    // Employee endpoints
    async listPendingTransactions() {
        try {
            const response = await api.get('payments/pending');
            // Backend returns { success, transactions: [...] }
            const raw = response.data?.transactions ?? [];
            // Normalize shape for UI: lowercase status, ensure strings
            const normalized = Array.isArray(raw)
                ? raw.map((t: any) => ({
                    id: String(t.id),
                    createdAt: String(t.createdAt ?? ''),
                    updatedAt: String(t.updatedAt ?? ''),
                    amount: Number(t.amount),
                    currency: String(t.currency ?? ''),
                    recipientName: String(t.recipientName ?? ''),
                    recipientAccount: String(t.recipientAccount ?? ''),
                    swiftCode: String(t.swiftCode ?? ''),
                    // Treat employeeVerified transactions as 'verified' even if DB status is still PENDING
                    status: t?.metadata?.employeeVerified
                        ? 'verified'
                        : String(t.status ?? '').toLowerCase(),
                    type: t.type ? String(t.type).toLowerCase() : undefined,
                    reference: t.reference ? String(t.reference) : undefined,
                    errorMessage: t.errorMessage ? String(t.errorMessage) : undefined
                }))
                : [];
            return normalized;
        } catch (error) {
            throw normalizeError(error);
        }
    },

    async verifyTransaction(id: string) {
        try {
            const response = await api.post(`payments/pending/${encodeURIComponent(id)}/verify`, { id });
            return response.data;
        } catch (error) {
            throw normalizeError(error);
        }
    },

    async submitTransactionToSwift(id: string) {
        try {
            const response = await api.post(`payments/pending/${encodeURIComponent(id)}/submit`, { id });
            return response.data;
        } catch (error) {
            throw normalizeError(error);
        }
    }
};

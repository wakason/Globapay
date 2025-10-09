// errorLogger.ts - Remove JSX completely from this file
import axios from 'axios';

export enum ErrorType {
    VALIDATION = 'VALIDATION',
    AUTHENTICATION = 'AUTHENTICATION',
    AUTHORIZATION = 'AUTHORIZATION',
    API = 'API',
    NETWORK = 'NETWORK',
    UNKNOWN = 'UNKNOWN'
}

interface ErrorLog {
    timestamp: string;
    type: ErrorType;
    message: string;
    stack?: string;
    userId?: string;
    componentName?: string;
    additionalInfo?: Record<string, any>;
}

class ErrorLoggingService {
    private static instance: ErrorLoggingService;
    private readonly apiEndpoint: string;
    private readonly isDevelopment: boolean;

    private constructor() {
        this.apiEndpoint = process.env.REACT_APP_ERROR_LOGGING_ENDPOINT || 'https://api.yourbank.com/logs';
        this.isDevelopment = process.env.NODE_ENV === 'development';
    }

    public static getInstance(): ErrorLoggingService {
        if (!ErrorLoggingService.instance) {
            ErrorLoggingService.instance = new ErrorLoggingService();
        }
        return ErrorLoggingService.instance;
    }

    private async sendToServer(errorLog: ErrorLog): Promise<void> {
        try {
            await axios.post(this.apiEndpoint, errorLog, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Error-Type': errorLog.type
                }
            });
        } catch (error) {
            if (this.isDevelopment) {
                console.error('Failed to send error log:', error);
                console.error('Original error:', errorLog);
            }
        }
    }

    public async logError(
        error: Error,
        type: ErrorType = ErrorType.UNKNOWN,
        componentName?: string,
        additionalInfo?: Record<string, any>
    ): Promise<void> {
        const userId = sessionStorage.getItem('userId') || undefined;

        const errorLog: ErrorLog = {
            timestamp: new Date().toISOString(),
            type,
            message: error.message,
            stack: this.isDevelopment ? error.stack : undefined,
            userId,
            componentName,
            additionalInfo
        };

        if (this.isDevelopment) {
            console.error('Error occurred:', {
                ...errorLog,
                stack: error.stack
            });
        }

        await this.sendToServer(errorLog);
    }

    public handleApiError(error: any): void {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        this.logError(error, ErrorType.VALIDATION);
                        break;
                    case 401:
                        this.logError(error, ErrorType.AUTHENTICATION);
                        window.location.href = '/login';
                        break;
                    case 403:
                        this.logError(error, ErrorType.AUTHORIZATION);
                        break;
                    default:
                        this.logError(error, ErrorType.API);
                }
            } else if (error.request) {
                this.logError(error, ErrorType.NETWORK);
            }
        } else {
            this.logError(error);
        }
    }
}

export const errorLogger = ErrorLoggingService.getInstance();

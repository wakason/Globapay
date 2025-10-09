import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
    status?: number;
    errors?: any[];
}

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    const status = err.status || 500;
    const message = err.message || 'Something went wrong';
    const errors = err.errors || [];

    res.status(status).json({
        success: false,
        message,
        errors: errors.length > 0 ? errors : undefined,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

export default errorHandler;

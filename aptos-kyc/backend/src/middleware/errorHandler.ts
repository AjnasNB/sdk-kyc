import { Request, Response, NextFunction } from 'express';

export function errorHandler(
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    console.error('[ERROR]', err);

    let statusCode = 500;
    let message = 'Internal server error';
    let details: any = undefined;

    // MongoDB errors
    if (err.code === 11000) {
        statusCode = 409;
        message = 'Resource already exists';
        details = err.keyPattern;
    }

    // Validation errors
    if (err.name === 'ValidationError' || err.isJoi) {
        statusCode = 400;
        message = err.message || 'Validation error';
        details = err.details;
    }

    // Custom app errors
    if (err.statusCode) {
        statusCode = err.statusCode;
        message = err.message;
    }

    // Don't leak errors in production
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'Internal server error';
        details = undefined;
    } else {
        details = details || (process.env.NODE_ENV === 'development' ? err.stack : undefined);
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(details && { details })
    });
}

export function notFoundHandler(_req: Request, res: Response) {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
}

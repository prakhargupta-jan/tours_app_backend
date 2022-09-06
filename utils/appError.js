module.exports = class AppError extends Error {
    constructor(message, statusCode, status = 'fail') {
        super(message);
        this.statusCode = statusCode || 500;
        this.status = status || (statusCode.toString().startsWith('4') ? 'fail' : 'error')
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
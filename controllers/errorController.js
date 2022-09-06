const AppError = require("../utils/appError");

const handleCastErrorDB = err => new AppError(`Invalid ${err.path}: ${err.value}`, 400)
const handleDuplicateFieldsDB = err => new AppError(`Duplicate Field Value : ${err.message.match(/(["'])(\\?.)*?\1/)[0]}`)
const hanldeValidationErrorDB = err => {
    return new AppError(`${Object.keys(err.errors).map(el => `${el.toUpperCase()}'s validation failed, ${err.errors[el].message}. s`).join(' ')}`)
};
const handleInvalidTokenJWT = err => new AppError(`Authentication Falied, Invalid Token provided.`, 401)
const handleExpiredTokenJWT = err => new AppError(`Authentication Failed, Token has expired`, 401)
const sendProdError = (res, err) => {
    console.log(err.isOperational);
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        }) 
    } else {
        console.log(err);
        res.status(500).json({
            status: 'error',
            message: 'something went very horribly wrongs'
        })
    }
}

const sendDevError = (res, err) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err
    })
}


module.exports = (err, req, res, next) => {
    err.status = err.status || 'error';
    err.statusCode = err.statusCode || 500;
    // console.log(err.message.match(/(["'])(\\?.)*?\1/)[0]);
    if (process.env.NODE_ENV.trim() === 'prod') {
        console.log(err);
        
        if (err.name === 'CastError') err = handleCastErrorDB(err);
        if (err.name === 'ValidationError') err = hanldeValidationErrorDB(err);
        if (err.code === 11000) err = handleDuplicateFieldsDB(err)
        if (err.name == 'JsonWebTokenError' && err.message == 'invalid token') err = handleInvalidTokenJWT(err);
        if (err.name === 'TokenExpiredError') err = handleExpiredTokenJWT(err);

        sendProdError(res, err);

    } else if (process.env.NODE_ENV.trim() == 'dev') {
        sendDevError(res, err);
    }
}
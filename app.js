const express = require("express");
const morgan = require("morgan");
const { protect } = require("./controllers/authenticationController");
const errorController = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require('./utils/appError')
const app = express();
app.use((req, res, next) => {
    console.log(`${req.protocol}://${req.hostname}:${process.env.PORT}${req.url}`);
    next()
})
// middlewares
app.use(express.json())
app.use(morgan('dev'))
app.use((req, res, next) => {
    req.reqTime = new Date().toISOString();
    next();
})

// routers
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all('*', (req, res, next) => next(new AppError(`${req.originalUrl} url not found.`, 404)))

app.use(errorController)
module.exports = app;

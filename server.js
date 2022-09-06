const dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');

process.on('uncaughtException', err=> {
    console.log(err.name, err.message);
    console.log(err);
    console.log('Uncaught Exception! shutting server down');
    process.exit(1);
})

dotenv.config({path: './config.env'})
mongoose.connect(process.env.DB.replace('<PASSWORD>',process.env.DB_PASSWORD)).then(() => console.log('DB connected !!'))

const app = require("./app");

const server = app.listen(process.env.PORT, () => console.log("listening on port 8000."))

process.on('unhandledRejection', err=> {
    console.log(err.name, err.message);
    console.log(err);
    console.log('Unhandled Rejection! shutting server down');
    server.close(() => process.exit(1));
})
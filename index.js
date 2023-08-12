require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { RJNLogger, LogLevel } = require('@tripathirajan/rjn-logger');
const rjnlogger = new RJNLogger({ minLevel: LogLevel.DEBUG });
/**
 * custom imports
 */
const corsOptions = require('./config/cors.config');
const { logger, logEvents } = require('./middleware/logger.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');
const connectDB = require('./config/connectDB');
const verifyAuth = require('./middleware/authenticate.middleware');
const { HTTP_STATUS_NOT_FOUND, notFound } = require('./utility/httpResponse');
const loadCombos = require('./controllers/combos.controller');

/**
 * connect DB
 */

connectDB();

/**
 * middlewares
 */
app.use(logger)
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(errorHandler)

/**
 * routes
 */
app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/auth', require('./routers/auth.router'));
app.use('/test', require('./routers/test.router'));
app.use(verifyAuth)
app.use('/product', require('./routers/product.router'));
app.use('/cart', require('./routers/cart.router'));
app.use('/master', require('./routers/master.router'));
app.use('/vendor', require('./routers/vendor.router'));
app.use('/combo', loadCombos);
app.use('/user', require('./routers/user.router'));

app.all('*', (req, res) => {
    res.status(HTTP_STATUS_NOT_FOUND)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json(notFound())
    } else {
        res.type('txt').send('404 Not Found')
    }
})

/**
 * server
 */
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => rjnlogger.info(`Server running on port ${PORT}`))

/**
 * db events
 */
mongoose.connection.once('open', () => {
    rjnlogger.info('Connected to MongoDB');
})

mongoose.connection.on('error', err => {
    rjnlogger.error(err?.message, err)
    if (err) {
        logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
    }
})

/**
 * error handling
 */
process.on('unhandledRejection', (err) => {
    console.log('unhandledRejection:', err)
    logEvents(`unhandledRejection: ${JSON.stringify(err)}`, 'processLog-unhandledRejection.log');
});

process.on('uncaughtException', (err) => {
    console.log('uncaughtException:', err)
    logEvents(`uncaughtException: ${JSON.stringify(err)}`, 'processLog-uncaughtException.log');
});
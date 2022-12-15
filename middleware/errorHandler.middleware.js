const { logEvents } = require('./logger.middleware')
const { HTTP_STATUS_INTERNAL_SERVER_ERROR, internalServerError } = require('../utility/httpResponse');

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log');
    console.log('\x1b[41m', '[ERROR]', '\x1b[0m', err);
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json(internalServerError)
}

module.exports = errorHandler;
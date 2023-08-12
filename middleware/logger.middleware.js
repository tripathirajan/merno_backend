const { format } = require('date-fns')
const { v4: uuid } = require('uuid')
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')
const { RJNLogger, LogLevel } = require('@tripathirajan/rjn-logger');

const rjnLogger = new RJNLogger({ minLevel: LogLevel.DEBUG });

const logEvents = async (message, logFileName) => {
    rjnLogger.info(message, { reqId: uuid() })

    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), message)
    } catch (err) {
        console.log('\x1b[41m', '[ERROR]', '\x1b[0m', '\x1b[32m', err, '\x1b[0m')
        rjnLogger.error(err.message, err);
    }
}

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
    next()
}

module.exports = { logEvents, logger }
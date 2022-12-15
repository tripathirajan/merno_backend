const { format } = require('date-fns')
const { v4: uuid } = require('uuid')
const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')

const logEvents = async (message, logFileName) => {
    const dateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    const logItem = `${dateTime}\t${uuid()}\t${message}`;
    console.log('\x1b[32m', '[INFO]', '\x1b[0m', logItem);

    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem)
    } catch (err) {
        console.log('\x1b[41m', '[ERROR]', '\x1b[0m', '\x1b[32m', err, '\x1b[0m')
    }
}

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
    next()
}

module.exports = { logEvents, logger }
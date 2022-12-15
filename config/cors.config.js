const { cors: corsOptions } = require('../app-config');

const { allowedOrigins, ...rest } = corsOptions;

const corsConfig = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    ...rest
}

module.exports = corsConfig;
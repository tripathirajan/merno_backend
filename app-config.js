module.exports = {
    cors: {
        allowedOrigins: ['http://localhost:3000', 'http://localhost:3001'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 200,
        credentials: true
    },
    db: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        db: process.env.DB_NAME,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        useNewUrlParser: true,
        useUnifiedTopology: true
    },
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET
    },
    smtp: {
        host: '',
        port: '',
        secure: false,
        auth: {
            user: '',
            pass: ''
        }
    },
    sendGrid: {
        auth: {
            "api_key": process.env.SENDGRID_API_KEY
        }
    }
}
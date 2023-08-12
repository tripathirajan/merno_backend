const mongoose = require('mongoose')
const { db: dbOptions } = require('../app-config');

const { username, password, db, host, port, ...rest } = dbOptions;
const dbURI = `mongodb://${username}:${password}@${host}:${port}/${db}`;

const connectDB = async () => {
    try {
        await mongoose.connect(dbURI, { ...rest })
    } catch (err) {
        console.log(err)
    }
}

module.exports = connectDB;
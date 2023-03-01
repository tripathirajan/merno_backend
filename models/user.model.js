const mongoose = require('mongoose');
const { getHash, compareHash } = require('../services/crypto.service');

const Schema = mongoose.Schema;
const userSchema = new Schema({
    fullName: {
        type: String,
        require: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    resetToken: String,
    resetTokenExpiration: Date,
    roles: {
        type: [String],
        default: ["User"]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    image: {
        type: String
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    let passwordHash = '';
    try {
        if (this.isNew || this.isModified('password')) {
            passwordHash = await getHash(this.password);
            this.password = passwordHash;
        }
        next();
    } catch (ex) {
        ex['extraInfo'] = { password: this.password, passwordHash: passwordHash };
        console.log("User Model> preSave:", ex)
        next(ex);
    }
});

userSchema.methods.hasPasswordMatched = async function (password) {
    let matched = false;
    try {
        matched = await compareHash(password, this.password);
    } catch (error) {
        throw error;
    }
    return matched;
}

module.exports = mongoose.model('User', userSchema)

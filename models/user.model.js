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
        default: ["user"]
    },
    active: {
        type: Boolean,
        default: true
    },
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
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

userSchema.methods.addToCart = function (product) {
    const matchIndex = this.cart.items.findIndex(cartItem => {
        return cartItem.productId.toString() === product._id.toString();
    });
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    // already found the update price and quantity
    if (matchIndex >= 0) {
        newQuantity = this.cart.items[matchIndex].quantity + 1;
        updatedCartItems[matchIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity
        });
    }
    const updatedCart = {
        items: updatedCartItems
    };
    this.cart = updatedCart;
    return this.save();

}

module.exports = mongoose.model('User', userSchema)

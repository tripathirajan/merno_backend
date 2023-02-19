const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    productName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String
    },
    sku: {
        type: String,
        required: true,
        unique: true,

    },
    upc: {
        type: String,
        required: true,
        unique: true
    },
    vendor: {
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    productCategory: {
        type: Schema.Types.ObjectId,
        ref: 'ProductCategory',
        required: true
    },
    packageType: {
        type: Schema.Types.ObjectId,
        ref: 'PackageType',
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    unit: {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
        required: true
    },
    currency: {
        type: Schema.Types.ObjectId,
        ref: 'Currency',
        required: true
    },
    salePrice: {
        type: Number,
        required: true
    },
    regularPrice: {
        type: Number,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Product", productSchema);
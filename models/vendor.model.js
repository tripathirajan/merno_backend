const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const vendorSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true
    },
    email: {
        type: Schema.Types.String,
        required: true
    },
    address: {
        type: Schema.Types.String,
        required: true
    },
    contactNo: {
        type: Schema.Types.String,
        required: true
    },
    contactPersonName: {
        type: Schema.Types.String,
        required: true
    },
    contactPersonMobile: {
        type: Schema.Types.String,
        required: true
    },
    contactPersonEmail: {
        type: Schema.Types.String,
        required: true
    },
    lat: {
        type: Schema.Types.Number,
        default: 0.0
    },
    lng: {
        type: Schema.Types.Number,
        default: 0.0
    },
    image: {
        type: Schema.Types.String,
        default: null
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
});

module.exports = mongoose.model("Vendor", vendorSchema);
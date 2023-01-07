const Vendor = require('../models/vendor.model');
const storageSerice = require('../services/storage.service');

const getAllVendor = async (req, res) => {
    const { page, sortBy = "createdAt", dir = 'desc', filters } = req?.query;
    const vendorList = await Vendor.find().sort({ [sortBy]: dir })
        .lean()
        .populate('createdBy', { fullName: 1, _id: -1 })
        .populate('updatedBy', 'fullName');

    if (vendorList?.length == 0) {
        return res.status(200).json({ items: [], page: 1, totalCount: 0 });
    }
    // transform data
    const items = [];
    for (const vendor of vendorList) {
        const { _id, createdBy, updatedBy, ...rest } = vendor;
        items.push({ id: _id, createdBy: createdBy?.fullName || 'Admin', updatedBy: updatedBy?.fullName || 'Admin', ...rest });
    }
    return res.status(200).json({ items, page: 1, totalCount: items?.length });
}

const addVendor = async (req, res) => {
    const { name,
        email,
        address,
        contactNo,
        contactPersonName,
        contactPersonMobile,
        contactPersonEmail,
        isActive,
        lat,
        lng } = req?.body || {};
    const { userId } = req;
    if (!name || !email || !address || !contactNo || !contactPersonName || !contactPersonEmail || !contactPersonMobile) {
        return res.status(422).json({ success: false, message: 'Parameter missing' });
    }
    const vendor = await Vendor.create({
        name,
        email,
        address,
        contactNo,
        contactPersonName,
        contactPersonMobile,
        contactPersonEmail,
        isActive,
        lat,
        lng,
        image: '',
        createdBy: userId,
        updatedBy: userId
    });

    if (!vendor) return res.status(422).json({ message: 'Unable to add new vendor.' });

    if (req?.file) {
        console.time('vendor-image-upload-start')
        const { url } = await storageSerice.upload(req?.file?.buffer);
        console.log("result", url);
        console.timeEnd('vendor-image-upload-start')
        if (url) { vendor.image = url; }
        vendor.save();
    }
    return res.status(201).json({ message: 'Vendor created.' });
}

const getVendorInfo = async (req, res) => {
    const { vendorId } = req?.query;
    if (!vendorId) return res.status(422).json({ message: "Can't load info." });
    const vendor = await Vendor.findById(vendorId)
        .lean()
        .populate('createdBy', 'fullName')
        .populate('updatedBy', 'fullName');

    if (!vendorId) return res.status(404).json({ message: 'Vendor not found' });

    return res.status(200).json({ message: 'Success', result: { id: vendor._id, ...vendor } });
}

module.exports = {
    addVendor,
    getAllVendor,
    getVendorInfo
}
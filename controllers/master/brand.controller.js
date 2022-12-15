const Brand = require('../../models/brand.model');

/**
 * @description get list of brand
 * @param {Object} req
 * @param {Object} res
 * @returns
 */
const getAllBrand = async (req, res) => {
    const { page, sortBy = "createdAt", dir = 'desc', filters } = req?.query;
    const brandList = await Brand.find().sort({ [sortBy]: dir })
        .lean()
        .populate('createdBy', { fullName: 1, _id: -1 })
        .populate('updatedBy', 'fullName');

    if (brandList?.length == 0) {
        return res.status(200).json({ items: [], page: 1, totalCount: 0 });
    }
    // transform data
    const items = [];
    for (const brand of brandList) {
        const { _id, createdBy, updatedBy, ...rest } = brand;
        items.push({ id: _id, createdBy: createdBy?.fullName || 'Admin', updatedBy: updatedBy?.fullName || 'Admin', ...rest });
    }
    return res.status(200).json({ items, page: 1, totalCount: items?.length });
}

/**
 * @description get brand info
 * @param {Object} req
 * @param {Object} res
 * @returns
 */
const getBrandInfo = async (req, res) => {
    const { brandId } = req?.query;
    if (!brandId) return res.status(422).json({ message: "Can't load info." });

    const brand = await Brand.findById(brandId).lean();

    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    return res.status(200).json({ message: 'Success', result: { id: brand._id, ...brand } });
}

/**
 * @description add new brand
 * @param {Object} req
 * @param {Object} res
 * @returns
 */
const addBrand = async (req, res) => {
    const { name, description, isActive } = req?.body || {};
    const { userId } = req;
    if (!name || !description) {
        return res.status(422).json({ success: false, message: 'Parameter missing' });
    }
    const productCategory = await Brand.create({ name, description, isActive, createdBy: userId, updatedBy: userId });
    if (!productCategory) return res.status(422).json({ message: 'Unable to add new brand.' });
    return res.status(201).json({ message: 'Brand created.' });
}

/**
 * @description update brand
 * @param {Object} req
 * @param {Object} res
 */
const updateBrand = async (req, res) => {
    const { id: brandId, name, description, isActive } = req?.body;
    const { userId } = req;

    if (!brandId || !name || !description) {
        return res.status(404).json({ succes: false, message: "Nothing to update." });
    }
    const brand = await Brand.findById(brandId).exec();
    if (!brand) {
        return res.status(400).json({ message: 'Brand not found' })
    }
    const duplicate = await Brand.findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec();
    if (duplicate && duplicate?._id.toString() !== brandId) {
        return res.status(409).json({ message: 'Duplicate brand name.' })
    }
    brand.name = name;
    brand.description = description;
    brand.isActive = isActive;
    brand.updatedBy = userId;

    const updatedInfo = await brand.save();
    return res.status(200).json({ message: `Brand: ${updatedInfo.name} updated.` });
}

module.exports = {
    getAllBrand,
    getBrandInfo,
    addBrand,
    updateBrand
}
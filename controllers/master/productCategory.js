const ProductCategory = require('../../models/productCategory.model');

/**
 * @description get list of product categories
 * @param {Object} req 
 * @param {Object} res 
 * @returns 
 */
const getAllProductCategory = async (req, res) => {
    const { page, sortBy = "createdAt", dir = 'desc', filters } = req?.query;
    const productCategoryList = await ProductCategory.find().sort({ [sortBy]: dir })
        .lean()
        .populate('createdBy', { fullName: 1, _id: -1 })
        .populate('updatedBy', 'fullName');

    if (productCategoryList?.length == 0) {
        return res.status(200).json({ items: [], page: 1, totalCount: 0 });
    }
    // transform data
    const items = [];
    for (const category of productCategoryList) {
        const { _id, createdBy, updatedBy, ...rest } = category;
        items.push({ id: _id, createdBy: createdBy?.fullName || 'Admin', updatedBy: updatedBy?.fullName || 'Admin', ...rest });
    }
    return res.status(200).json({ items, page: 1, totalCount: items?.length });
}

/**
 * @description get product category info
 * @param {Object} req
 * @param {Object} res
 * @returns
 */
const getProductCategoryInfo = async (req, res) => {
    const { productCategoryId } = req?.query;
    if (!productCategoryId) return res.status(422).json({ message: "Can't load info." });

    const productCategory = await ProductCategory.findById(productCategoryId).lean();

    if (!productCategory) return res.status(404).json({ message: 'Product category not found' });

    return res.status(200).json({ message: 'Success', result: { id: productCategory._id, ...productCategory } });
}

/**
 * @description add new product category
 * @param {Object} req
 * @param {Object} res
 * @returns
 */
const addProductCategory = async (req, res) => {
    const { name, description, isActive } = req?.body || {};
    const { userId } = req;
    if (!name || !description) {
        return res.status(422).json({ success: false, message: 'Parameter missing' });
    }
    const productCategory = await ProductCategory.create({ name, description, isActive, createdBy: userId, updatedBy: userId });
    if (!productCategory) return res.status(422).json({ message: 'Unable to add new product category.' });
    return res.status(201).json({ message: 'Product category created.' });
}

/**
 * @description update product category
 * @param {Object} req
 * @param {Object} res
 */
const updateProductCategory = async (req, res) => {
    const { id: categoryId, name, description, isActive } = req?.body;
    const { userId } = req;
    if (!categoryId || !name || !description) {
        return res.status(404).json({ succes: false, message: "Nothing to update." });
    }
    const category = await ProductCategory.findById(categoryId).exec();
    if (!category) {
        return res.status(400).json({ message: 'Product category not found' })
    }
    const duplicate = await ProductCategory.findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec();
    if (duplicate && duplicate?._id.toString() !== categoryId) {
        return res.status(409).json({ message: 'Duplicate product category name.' })
    }
    category.name = name;
    category.description = description;
    category.isActive = isActive;
    category.updatedBy = userId;

    const updatedInfo = await category.save();
    return res.status(200).json({ message: `Product Category:${updatedInfo.name} updated.` });
}

module.exports = {
    getAllProductCategory,
    getProductCategoryInfo,
    addProductCategory,
    updateProductCategory
}
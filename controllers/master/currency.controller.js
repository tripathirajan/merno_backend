const Currency = require('../../models/currency.model');

/**
 * @description get list of currency
 * @param {Object} req
 * @param {Object} res
 * @returns
 */
const getAllCurrency = async (req, res) => {
    const { page, sortBy = "createdAt", dir = 'desc', filters } = req?.query;
    const currencyList = await Currency.find().sort({ [sortBy]: dir })
        .lean()
        .populate('createdBy', { fullName: 1, _id: -1 })
        .populate('updatedBy', 'fullName');

    if (currencyList?.length == 0) {
        return res.status(200).json({ items: [], page: 1, totalCount: 0 });
    }
    // transform data
    const items = [];
    for (const currency of currencyList) {
        const { _id, createdBy, updatedBy, ...rest } = currency;
        items.push({ id: _id, createdBy: createdBy?.fullName || 'Admin', updatedBy: updatedBy?.fullName || 'Admin', ...rest });
    }
    return res.status(200).json({ items, page: 1, totalCount: items?.length });
}

/**
 * @description get currency info
 * @param {Object} req
 * @param {Object} res
 * @returns
 */
const getCurrencyInfo = async (req, res) => {
    const { currencyId } = req?.query;
    if (!currencyId) return res.status(422).json({ message: "Can't load info." });

    const currency = await Brand.findById(currencyId).lean();

    if (!currency) return res.status(404).json({ message: 'Currency not found' });

    return res.status(200).json({ message: 'Success', result: { id: currency._id, ...currency } });
}

/**
 * @description add new currency
 * @param {Object} req
 * @param {Object} res
 * @returns
 */
const addCurrency = async (req, res) => {
    const { name, description, isActive } = req?.body || {};
    const { userId } = req;
    if (!name || !description) {
        return res.status(422).json({ success: false, message: 'Parameter missing' });
    }
    const currency = await Currency.create({ name, description, isActive, createdBy: userId, updatedBy: userId });
    if (!currency) return res.status(422).json({ message: 'Unable to add new currency.' });
    return res.status(201).json({ message: 'Currency created.' });
}

/**
 * @description update currency
 * @param {Object} req
 * @param {Object} res
 */
const updateCurrency = async (req, res) => {
    const { id: brandId, name, description, isActive } = req?.body;
    const { userId } = req;

    if (!brandId || !name || !description) {
        return res.status(404).json({ succes: false, message: "Nothing to update." });
    }
    const currency = await Currency.findById(brandId).exec();
    if (!currency) {
        return res.status(400).json({ message: 'Currency not found' })
    }
    const duplicate = await Currency.findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec();
    if (duplicate && duplicate?._id.toString() !== packageTypeId) {
        return res.status(409).json({ message: 'Duplicate Currency name.' })
    }
    currency.name = name;
    currency.description = description;
    currency.isActive = isActive;
    currency.updatedBy = userId;

    const updatedInfo = await currency.save();
    return res.status(200).json({ message: `Currency: ${updatedInfo.name} updated.` });
}

module.exports = {
    getAllCurrency,
    getCurrencyInfo,
    addCurrency,
    updateCurrency
}
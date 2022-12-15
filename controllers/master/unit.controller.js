const Unit = require('../../models/unit.model');

/**
 * @description get list of unit
 * @param {Object} req
 * @param {Object} res
 * @returns
 */
const getAllUnit = async (req, res) => {
    const { page, sortBy = "createdAt", dir = 'desc', filters } = req?.query;
    const unitList = await Unit.find().sort({ [sortBy]: dir })
        .lean()
        .populate('createdBy', { fullName: 1, _id: -1 })
        .populate('updatedBy', 'fullName');

    if (unitList?.length == 0) {
        return res.status(200).json({ items: [], page: 1, totalCount: 0 });
    }
    // transform data
    const items = [];
    for (const unit of unitList) {
        const { _id, createdBy, updatedBy, ...rest } = unit;
        items.push({ id: _id, createdBy: createdBy?.fullName || 'Admin', updatedBy: updatedBy?.fullName || 'Admin', ...rest });
    }
    return res.status(200).json({ items, page: 1, totalCount: items?.length });
}

/**
 * @description get unit info
 * @param {Object} req
 * @param {Object} res
 * @returns
 */
const getUnitInfo = async (req, res) => {
    const { unitId } = req?.query;
    if (!unitId) return res.status(422).json({ message: "Can't load info." });

    const unit = await Brand.findById(unitId).lean();

    if (!unit) return res.status(404).json({ message: 'Unit not found' });

    return res.status(200).json({ message: 'Success', result: { id: unit._id, ...unit } });
}

/**
 * @description add new unit
 * @param {Object} req
 * @param {Object} res
 * @returns
 */
const addUnit = async (req, res) => {
    const { name, description, isActive } = req?.body || {};
    const { userId } = req;
    if (!name || !description) {
        return res.status(422).json({ success: false, message: 'Parameter missing' });
    }
    const unit = await Unit.create({ name, description, isActive, createdBy: userId, updatedBy: userId });
    if (!unit) return res.status(422).json({ message: 'Unable to add new unit.' });
    return res.status(201).json({ message: 'Unit created.' });
}

/**
 * @description update unit
 * @param {Object} req
 * @param {Object} res
 */
const updateUnit = async (req, res) => {
    const { id: unitId, name, description, isActive } = req?.body;
    const { userId } = req;

    if (!unitId || !name || !description) {
        return res.status(404).json({ succes: false, message: "Nothing to update." });
    }
    const unit = await Unit.findById(unitId).exec();
    if (!unit) {
        return res.status(400).json({ message: 'Unit not found' })
    }
    const duplicate = await Unit.findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec();
    if (duplicate && duplicate?._id.toString() !== unitId) {
        return res.status(409).json({ message: 'Duplicate unit name.' })
    }
    unit.name = name;
    unit.description = description;
    unit.isActive = isActive;
    unit.updatedBy = userId;

    const updatedInfo = await unit.save();
    return res.status(200).json({ message: `Unit: ${updatedInfo.name} updated.` });
}

module.exports = {
    getAllUnit,
    getUnitInfo,
    addUnit,
    updateUnit
}
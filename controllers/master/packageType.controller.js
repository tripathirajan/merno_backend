const PackageType = require('../../models/packageType.model');

/**
 * @description get list of package type
 * @param {Object} req
 * @param {Object} res
 * @returns
 */
const getAllPackageType = async (req, res) => {
    const { page, sortBy = "createdAt", dir = 'desc', filters } = req?.query;
    const packageTypeList = await PackageType.find().sort({ [sortBy]: dir })
        .lean()
        .populate('createdBy', { fullName: 1, _id: -1 })
        .populate('updatedBy', 'fullName');

    if (packageTypeList?.length == 0) {
        return res.status(200).json({ items: [], page: 1, totalCount: 0 });
    }
    // transform data
    const items = [];
    for (const packageType of packageTypeList) {
        const { _id, createdBy, updatedBy, ...rest } = packageType;
        items.push({ id: _id, createdBy: createdBy?.fullName || 'Admin', updatedBy: updatedBy?.fullName || 'Admin', ...rest });
    }
    return res.status(200).json({ items, page: 1, totalCount: items?.length });
}

/**
 * @description get package type info
 * @param {Object} req
 * @param {Object} res
 * @returns
 */
const getPackageTypeInfo = async (req, res) => {
    const { packageTypeId } = req?.query;
    if (!packageTypeId) return res.status(422).json({ message: "Can't load info." });

    const packageType = await Brand.findById(packageTypeId).lean();

    if (!packageTypeId) return res.status(404).json({ message: 'Package Type not found' });

    return res.status(200).json({ message: 'Success', result: { id: packageTypeId._id, ...packageTypeId } });
}

/**
 * @description add new package type
 * @param {Object} req
 * @param {Object} res
 * @returns
 */
const addPackageType = async (req, res) => {
    const { name, description, isActive } = req?.body || {};
    const { userId } = req;
    if (!name || !description) {
        return res.status(422).json({ success: false, message: 'Parameter missing' });
    }
    const packageType = await PackageType.create({ name, description, isActive, createdBy: userId, updatedBy: userId });
    if (!packageType) return res.status(422).json({ message: 'Unable to add new package type.' });
    return res.status(201).json({ message: 'Package Type created.' });
}

/**
 * @description update package type
 * @param {Object} req
 * @param {Object} res
 */
const updatePackageType = async (req, res) => {
    const { id: packageTypeId, name, description, isActive } = req?.body;
    const { userId } = req;

    if (!packageTypeId || !name || !description) {
        return res.status(404).json({ succes: false, message: "Nothing to update." });
    }
    const packageType = await PackageType.findById(packageTypeId).exec();
    if (!packageType) {
        return res.status(400).json({ message: 'Package Type not found' })
    }
    const duplicate = await PackageType.findOne({ name }).collation({ locale: 'en', strength: 2 }).lean().exec();
    if (duplicate && duplicate?._id.toString() !== packageTypeId) {
        return res.status(409).json({ message: 'Duplicate Package Type name.' })
    }
    packageType.name = name;
    packageType.description = description;
    packageType.isActive = isActive;
    packageType.updatedBy = userId;

    const updatedInfo = await packageType.save();
    return res.status(200).json({ message: `Package Type: ${updatedInfo.name} updated.` });
}

module.exports = {
    getAllPackageType,
    getPackageTypeInfo,
    addPackageType,
    updatePackageType
}
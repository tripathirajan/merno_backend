const Vendor = require('../models/vendor.model');
const PackageType = require('../models/packageType.model');
const Brand = require('../models/brand.model');
const ProductCategory = require('../models/productCategory.model');
const Unit = require('../models/unit.model');
const Currency = require('../models/currency.model');

const modelMapper = {
    'brand': Brand,
    'productCategory': ProductCategory,
    'unit': Unit,
    'packageType': PackageType,
    'currency': Currency,
    'vendor': Vendor
}
const handler = {
    'vendor': vendorComboHandler
}

const loadCombos = async (req, res) => {
    let { combos = [] } = req?.query;
    if (combos?.length == 0) return res.status(404).json({ items: [], message: 'Not found' });
    combos = JSON.parse(combos);

    const items = {};
    for (const combo of combos) {
        const { type } = combo;
        const comboHandler = handler[type] || defaultComboHandler(type);
        items[combo.type] = await comboHandler();
    }
    res.status(200).json({ message: 'success', items })
}

function defaultComboHandler(type) {
    return async () => {
        const comboModel = modelMapper[type];
        if (!comboModel) return [];

        const comboItems = await comboModel.find({ isActive: true }, { label: '$name', _id: 0, id: '$_id' }).lean().exec();
        if (!comboItems || comboItems?.length === 0) return [];
        return comboItems;
    }
}

async function vendorComboHandler() {
    const vendorList = await Vendor.find({ isActive: true }, { _id: 0, id: '$_id', label: '$name', image: 1, caption: '$address' }).sort({ 'name': 'asc' }).lean().exec();
    return vendorList || [];
}

module.exports = loadCombos;
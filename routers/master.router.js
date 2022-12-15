const express = require('express');
const { getAllBrand, getBrandInfo, addBrand, updateBrand } = require('../controllers/master/brand.controller');
const { getAllCurrency, getCurrencyInfo, addCurrency, updateCurrency } = require('../controllers/master/currency.controller');
const { getAllPackageType, getPackageTypeInfo, addPackageType, updatePackageType } = require('../controllers/master/packageType.controller');
const router = express.Router();

const {
    getAllProductCategory,
    getProductCategoryInfo,
    addProductCategory,
    updateProductCategory
} = require('../controllers/master/productCategory');
const { getAllUnit, getUnitInfo, addUnit, updateUnit } = require('../controllers/master/unit.controller');


// product category route
router.route('/getAllProductCategory').get(getAllProductCategory);
router.route('/getProductCategoryInfo').get(getProductCategoryInfo);

router.route('/addProductCategory').post(addProductCategory);
router.route('/updateProductCategory').put(updateProductCategory);

// brand routes
router.route('/getAllBrand').get(getAllBrand);
router.route('/getBrandInfo').get(getBrandInfo);

router.route('/addBrand').post(addBrand);
router.route('/updateBrand').put(updateBrand);


// // packagetype routes
router.route('/getAllPackageType').get(getAllPackageType);
router.route('/getPackageTypeInfo').get(getPackageTypeInfo);

router.route('/addPackageType').post(addPackageType);
router.route('/updatePackageType').put(updatePackageType);

// // currency routes
router.route('/getAllCurrency').get(getAllCurrency);
router.route('/getCurrencyInfo').get(getCurrencyInfo);

router.route('/addCurrency').post(addCurrency);
router.route('/updateCurrency').put(updateCurrency);

// //units
router.route('/getAllUnit').get(getAllUnit);
router.route('/getUnitInfo').get(getUnitInfo);

router.route('/addUnit').post(addUnit);
router.route('/updateUnit').put(updateUnit);


module.exports = router;
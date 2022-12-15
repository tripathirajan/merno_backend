const { getProductList, addNewProduct, getProductInfo, updateProductInfo, deleteProduct } = require('../controllers/product.controller');
const fileUploader = require('../middleware/fileUpload.midleware');

const router = require('express').Router();

router.route('/list').get(getProductList);

router.route('/add').post(fileUploader.single('image'), addNewProduct);

router.route('/info').get(getProductInfo);

router.route('/update').patch(updateProductInfo);

router.route('/delete').delete(deleteProduct);

module.exports = router;
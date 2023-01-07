const router = require('express').Router();
const { getAllVendor, addVendor, getVendorInfo } = require('../controllers/vendor.controller');
const fileUploader = require('../middleware/fileUpload.midleware');

router.route('/list').get(getAllVendor);

router.route('/add').post(fileUploader.single('image'), addVendor);

router.route('/info').get(getVendorInfo);

// router.route('/update').patch();

// router.route('/delete').delete();
module.exports = router;
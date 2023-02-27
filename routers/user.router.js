const router = require('express').Router();
const { loadUserProfile, updateProfileInfo, resetPassword } = require('../controllers/user.controller');
const fileUploader = require('../middleware/fileUpload.midleware');

// router.route('/list').get();

// get user profile
router.route('/info').get(loadUserProfile);
// update profile picture
router.route('/updateInfo').put(fileUploader.single('image'), updateProfileInfo);
//reset password
router.route('/resetPassword').patch(resetPassword);

module.exports = router;
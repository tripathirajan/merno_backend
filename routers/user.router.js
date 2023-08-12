const router = require('express').Router();
const { loadUserProfile, updateProfileInfo, resetPassword, getUserList, addNewUser, getUserInfo } = require('../controllers/user.controller');
const fileUploader = require('../middleware/fileUpload.midleware');

// list of users
router.route('/list').get(getUserList);
// get user profile
router.route('/info').get(loadUserProfile);
// update profile picture
router.route('/updateInfo').put(fileUploader.single('image'), updateProfileInfo);
//reset password
router.route('/resetPassword').patch(resetPassword);
// add new user
router.route('/add').post(addNewUser);

// user detail
router.route('/view').get(getUserInfo);

module.exports = router;
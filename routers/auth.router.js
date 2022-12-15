const express = require('express');
const router = express.Router();
const { login, refreshToken, logOut, createNewUser, sendPassResetLink, changePassword } = require('../controllers/auth.controller');

router.route('/login').post(login);

router.route('/refresh').get(refreshToken);

router.route('/logout').post(logOut);

router.route('/signup').post(createNewUser)

router.route('/sendPassResetLink').post(sendPassResetLink);

router.route('/changePassword').post(changePassword);

module.exports = router;
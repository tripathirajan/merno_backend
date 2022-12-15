const User = require('../models/user.model');
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const { sendHTMLMail } = require('../services/mail.service');

const {
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIREIN,
    REFRESH_TOKEN_EXPIREIN,
    REFRESH_TOKEN_COOKIE_NAME,
    COOKIE_MAX_AGE
} = process.env;

/**
 * @description login user
 * @param {object} req
 * @param {object} res
 * @returns
 */
const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Parameter missing', succcess: false })
    }
    // find user with username
    const user = await User.findOne({ username });

    // user account found
    if (!user || !user.active) {
        return res.status(401).json({ message: 'Unauthorized' })
    }
    // match password
    const match = await user.hasPasswordMatched(password);
    if (!match) return res.status(401).json({ message: 'Unauthorized' });

    // create tokens
    const accessToken = jwt.sign(
        {
            "userInfo": {
                "username": user.username,
                "roles": user.roles,
                "id": user._id
            }
        },
        ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIREIN }
    );
    const refreshToken = jwt.sign(
        { "username": user.username },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIREIN }
    );

    // Create secure cookie with refresh token
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
        httpOnly: true, //accessible only by web server
        secure: true, //https
        sameSite: 'None', //cross-site cookie
        maxAge: Number(COOKIE_MAX_AGE) //7 * 24 * 60 * 60 * 1000 //cookie expiry: set to match rT
    })
    // Send accessToken containing username and roles
    res.status(200).json({ username: user.username, fullName: user.fullName, roles: user.roles, accessToken, message: 'Success!' });
})

/**
 * @description logout user
 * @param {object} req
 * @param {object} res
 * @returns
 */
const logOut = (req, res) => {
    // read cookie
    const cookies = req?.cookies;

    // check token
    if (!cookies[REFRESH_TOKEN_COOKIE_NAME]) return res.sendStatus(204) //No content

    // clear cookies
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { httpOnly: true, sameSite: 'None', secure: true });

    // send response
    res.status(200).json({ message: 'logout!' });
}

/**
 * create new user
 */
const createNewUser = asyncHandler(async (req, res) => {
    const { fullName, username, password, roles = ["user"] } = req.body

    // Confirm data
    if (!fullName || !username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate username
    const duplicate = await User.findOne({ username }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    const userObject = { fullName, username, password, roles };

    // Create and store new user
    const user = await User.create(userObject)

    if (user) { //created
        res.status(201).json({ message: `New user ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
});

/**
 * @description refresh token
 * @param {object} req
 * @param {object} res
 * @returns
 */
const refreshToken = (req, res) => {
    const cookies = req?.cookies || {};
    const refreshToken = cookies && cookies[REFRESH_TOKEN_COOKIE_NAME];

    if (!refreshToken) {
        console.log('refreshtoken notfound: cookies', cookies, REFRESH_TOKEN_COOKIE_NAME);
        return res.status(401).json({ message: 'Unauthorized!' })
    }

    // verify token
    jwt.verify(
        refreshToken,
        REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) {
                console.log('refreshtokendecode', err);
                return res.status(41).json({ message: 'Unauthorized!' })
            }
            const foundUser = await User.findOne({ username: decoded.username }).lean().exec()

            if (!foundUser) return res.status(401).json({ message: 'Unauthorized!' })

            // create new access token
            const accessToken = jwt.sign(
                {
                    "userInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles,
                        "id": foundUser._id
                    }
                },
                ACCESS_TOKEN_SECRET,
                { expiresIn: ACCESS_TOKEN_EXPIREIN }
            )
            // send response
            res.json({ username: foundUser.username, fullName: foundUser.fullName, roles: foundUser.roles, accessToken })
        })
    )
};

const sendPassResetLink = (req, res) => {
    const { username } = req?.body;
    if (!username) {
        return res.status(400).json({ message: 'Parameter missing', succcess: false })
    }
    crypto.randomBytes(32, (error, buffer) => {
        if (error) return res.status(200).json({ success: false });
        const resetToken = buffer.toString('hex');
        User.findOne({ username: username }).then(user => {
            if (!user || !user?.email) {
                return res.status(404).json({ message: 'User not found', succcess: false })
            }
            user.resetToken = resetToken;
            user.resetTokenExpiration = Date.now() + 600000;
            user.save();
            return user;
        }).then(user => {
            res.status(200).json({ message: 'reset link send to registered email.' });
            sendHTMLMail({
                to: user?.email,
                subject: "[Merno] Reset Password",
                body: `
                    <p>Hi ${user?.fullName}</p>
                    <p> You have requested to reset your password.</p>
                    <p> Please click on link below to set new password</p>
                    <a href='http://localhost:3000/changePassword/${resetToken}'>Reset link</a>
                `
            });
            return;
        }).catch(err => {
            res.status(200).json({ message: 'Please try again' });
        })
    })
}

const changePassword = async (req, res) => {
    const { token, newPassword } = req?.body || {};

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Parameter missing', succcess: false })
    }
    const resetUser = await User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() }
    });

    if (!resetUser) {
        return res.status(200).json({ message: 'Token expired!', succcess: false })
    }
    resetUser.password = newPassword;
    resetUser.resetToken = '';
    resetUser.resetTokenExpiration = null;
    const result = await resetUser.save();
    if (!result) {
        return res.status(200).json({ message: 'Please try again', succcess: false })
    }
    return res.status(200).json({ message: 'Success!', succcess: false })

}
// export module
module.exports = {
    login,
    logOut,
    createNewUser,
    refreshToken,
    sendPassResetLink,
    changePassword
}
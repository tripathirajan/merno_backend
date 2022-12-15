const jwt = require('jsonwebtoken');
const { HTTP_STATUS_UNAUTHORIZED, unauthorized } = require('../utility/httpResponse');

const verifyAuth = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) {
                    return res.status(HTTP_STATUS_UNAUTHORIZED).json(unauthorized())
                }
                const { userInfo } = decoded;
                const userId = userInfo?.id || '';
                if (!userId) {
                    return res.status(HTTP_STATUS_UNAUTHORIZED).json({ message: 'Unauthorized' })
                }
                req.userId = userId;
                next()
            }
        )
    } catch (ex) {
        return res.status(HTTP_STATUS_UNAUTHORIZED).json({ message: 'Unauthorized' })
    }

}

module.exports = verifyAuth;
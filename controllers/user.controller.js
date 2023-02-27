const userModel = require("../models/user.model");
const storageSerice = require("../services/storage.service");

const IMAGE_ACTION_NONE = 'none';
const IMAGE_ACTION_UPDATE = 'change';
const IMAGE_ACTION_RESET = 'reset';

const loadUserProfile = async (req, res) => {
    const { userId } = req;
    if (!userId) return res.status(403).json({ success: false, message: 'Unauthorized' });
    const userInfo = await userModel.findById(userId).lean().exec();
    if (!userInfo) return res.status(403).json({ success: false, message: 'Unauthorized' })
    const { fullName, email, image, _id: id } = userInfo;
    return res.status(200).json({ success: true, message: 'Success', data: { id, fullName, email, image } });
}

/**
 * @description update profile info
 * @param {object} req
 * @param {object} res
 * @returns
 */
const updateProfileInfo = async (req, res) => {
    const { fullName, email, imageAction = IMAGE_ACTION_NONE } = req?.body;
    const { userId } = req;
    if (!userId) return res.status(403).json({ message: 'Unauthorized!' });
    // update user details
    const isUpdated = await userModel.findByIdAndUpdate(userId, { fullName, email, updatedBy: userId });
    // if no user
    if (!isUpdated) return res.status(404).json({ message: 'Info not updated! user not found.' });
    // fetch updated info
    const updatedUser = await userModel.findById(userId).exec();
    // profile pic update
    const profilePic = req?.file;
    try {
        if (imageAction !== IMAGE_ACTION_NONE) {
            let imageURL = '';
            // update image
            if (imageAction === IMAGE_ACTION_UPDATE && profilePic) {
                console.log('uploading.....')
                const { url } = await storageSerice.upload(profilePic?.buffer, userId);
                console.log('uploaded..')
                imageURL = url;
            }
            // reset image
            if (imageAction === IMAGE_ACTION_RESET || imageURL !== '') {
                updatedUser.image = imageURL;
                updatedUser.save();
            }
        }
    } catch (ex) {
        console.log('Image Update Error: ', ex);
    }
    return res.status(200).json({ message: 'success!', data: { id: updatedUser?._id, fullName: updatedUser?.fullName, image: updatedUser?.image } });
}

const resetPassword = async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req?.body;
    const { userId } = req;
    if (!userId) return res.status(403).json({ message: 'Unauthorized!' });

    if (!currentPassword || !newPassword) {
        return res.status(422).json({ message: 'Please enter the values.' });
    }
    if (currentPassword === newPassword) {
        return res.status(422).json({ message: "New password can't be same current password." });
    }
    if (newPassword !== confirmNewPassword) {
        return res.status(422).json({ message: "Password does not match." });
    }
    const user = await userModel.findById(userId).exec();
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    // match password
    const match = await user.hasPasswordMatched(password);
    if (!match) return res.status(401).json({ message: 'Unauthorized' });
    user.password = newPassword;
    user.updatedBy = userId;
    const updated = await user.save();

    if (!updated) res.status(422).json({ message: 'Password not updated.' });
    return res.status(200).json({ message: 'Password changed.' });
}
module.exports = {
    loadUserProfile,
    updateProfileInfo,
    resetPassword
}
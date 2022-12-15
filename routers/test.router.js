const router = require('express').Router();
const fileUploader = require('../middleware/fileUpload.midleware');

router.route('/upload').post(fileUploader.single('image'), (req, res) => {
    console.log(req);
    res.status(200).json({ message: 'test upload' });
})
module.exports = router;
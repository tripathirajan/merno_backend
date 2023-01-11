const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const { cloudinary: options } = require('../app-config');

cloudinary.config(options);

const fileUploader = cloudinary.uploader;


const _streamUploader = (fileBuffer, opt = {}) => new Promise(function (resolve, reject) {
    if (!fileBuffer) {
        const error = new Error('Invalid file buffer.');
        reject(error);
        return;
    }
    try {
        const fileName = opt?.fileName;
        let stream = fileUploader.upload_stream({ public_id: fileName }, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(result);
        });
        streamifier.createReadStream(fileBuffer).pipe(stream);
    } catch (ex) {
        reject(ex);
        return;
    }
})

const storageSerice = {
    upload: async function (fileBuffer, fileName) {
        const result = await _streamUploader(fileBuffer, { fileName });
        return result;
    }
}

module.exports = storageSerice;
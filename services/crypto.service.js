const bcrypt = require('bcrypt');


const _getSalt = async (len) => {
    const salt = await bcrypt.genSalt(len || 5);
    return salt;
}


/**
* compare given payload with hash
* @param {String} payload
* @param {String} hash
* @returns
*/
const compareHash = async (payload, hash) => {
    if (!payload || !hash) {
        return false;
    }
    const matched = await bcrypt.compare(payload, bas64Decode(hash));
    return matched;
}
/**
* base64 encode
* @param {String} text
* @returns
*/
const bas64Encode = (text) => {
    if (!text) {
        return '';
    }
    return Buffer.from(text).toString('base64')
}

/**
* base64 decode
* @param {String} text
* @returns
*/
const bas64Decode = (text) => {
    if (!text) {
        return '';
    }
    return Buffer.from(text, 'base64').toString('ascii')
}
/**
 * Get hash of given payload
 * @param {String} payload
 * @param {Number} saltLen
 * @returns
 */
const getHash = async (payload, saltLen) => {
    if (!payload) {
        return false;
    }
    const _salt = await _getSalt(saltLen);
    const hash = await bcrypt.hash(payload, _salt);
    return bas64Encode(hash);
}
module.exports = { bas64Decode, bas64Encode, getHash, compareHash }
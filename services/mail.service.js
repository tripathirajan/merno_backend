const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const { sendGrid: sendGridOptions } = require('../app-config');

const { MAIL_SENT_FROM } = process.env;
const HTML_REGEX = /<\/?[a-z][\s\S]*>/i;

const transport = nodemailer.createTransport(sendGridTransport({
    ...sendGridOptions
}));

/**
 * @description send mail 
 * @param {String} to email id of recipient
 * @param {String} subject  email subject
 * @param {String} body content of email
 * @param {String} from  email id of sender
 * @param {Boolean} isHtml  is mail contain html element
 * @param {Function} callback to handle success or error 
 */
const sendMail = ({ to, subject, body, from = MAIL_SENT_FROM, isHtml = false, callback }) => {
    if (!to || !subject || !body) {
        throw Error("Cann't sent email");
    }

    // isHtml is false and body contain html tag then force to send html email
    if (!isHtml) {
        isHtml = HTML_REGEX.test(body);
    }
    from = from || MAIL_SENT_FROM;
    transport.sendMail({
        to,
        from,
        subject,
        ...(isHtml ? { html: body } : { text: body })
    }).then(result => {
        if (callback && typeof callback === 'function') {
            callback(result, null);
        }
        console.log('Mail sent result', result);
        return result;
    }).catch(err => {
        console.log('Mail sent error:', err);
        if (callback && typeof callback === 'function') {
            callback(null, err);
        }
    });

}



/**
 * @description send HTML mail
 * @param {Object} options
 * @param {String} options.to email id of recipient
 * @param {String} options.subject  email subject
 * @param {String} options.body content of email
 * @param {String} options.from  email id of sender
 * @param {Function} options.callback  to handle success or error
 */
exports.sendHTMLMail = ({ to, subject, body, from = MAIL_SENT_FROM, callback = null }) => {
    sendMail({ to, subject, body, from, isHtml: true, callback });
}

/**
 * @description send HTML mail
 * @param {Object} options
 * @param {String} options.to email id of recipient
 * @param {String} options.subject  email subject
 * @param {String} options.body content of email
 * @param {String} options.from  email id of sender
 * @param {Function} options.callback  to handle success or error
 */
exports.sendPlainTextMail = ({ to, subject, body, from = MAIL_SENT_FROM, callback = null }) => {
    sendMail({ to, subject, body, from, isHtml: false, callback });
}
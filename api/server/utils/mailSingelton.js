let nodemailer = require('nodemailer');
var mailTransport = (function() {
    let mailInstance;

    function createMailTransporter() {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sirreddevils@gmail.com',
                pass: 'reddevils123!'
            }
        });
    }
    return {
        getInstance: function() {
            if (!mailInstance) {
                mailInstance = createMailTransporter();
            }
            return mailInstance;
        }
    }
})();

module.exports = mailTransport;
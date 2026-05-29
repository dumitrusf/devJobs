const nodemailer = require('nodemailer');
const config = require('../config/email');
const generateHTML = require('../helpers/generateHTML');

const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    auth: {
        user: config.user,
        pass: config.pass
    }
});

exports.enviar = async (opciones) => {
    const html = generateHTML(opciones);
    const text = html.replace(/<[^>]*>/g, '');

    const mailOptions = {
        from: `"devJobs" <${config.from}>`,
        to: opciones.usuario.email,
        subject: opciones.subject,
        text,
        html
    };

    return transport.sendMail(mailOptions);
};

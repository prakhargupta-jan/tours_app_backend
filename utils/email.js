const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // const transporter = nodemailer.createTransport({
    //     service: 'Gmail',
    //     auth: {
    //         user: 'prakhargupta.pg88@gmail.com',
    //         pass: 'supersecurepassword'
    //     }
    //     // activate "less secure app" option
    // })
    const transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    let mailOptions = {
        from: 'prakhargupta.pg4444@gmail.com',
        to : options.to,
        subject: options.subject,
        text: options.message
    }
    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail;
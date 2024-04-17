const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    let config = {
      service: "gmail",
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
    };
    console.log(config);
    let transporter = nodemailer.createTransport(config);
    let info = await transporter.sendMail({
      from: "LinkUp || Join College Community",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });
    console.log(info);
    return info;
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = mailSender;

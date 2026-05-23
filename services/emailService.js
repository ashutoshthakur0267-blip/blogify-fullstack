const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(email, token) {

  const verificationLink =
    `http://localhost:8000/user/verify/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Blogify Account",
    html: `
      <h2>Welcome to Blogify 🚀</h2>

      <p>Click below to verify your account:</p>

      <a href="${verificationLink}">
        Verify Account
      </a>
    `,
  });
}

module.exports = {
  sendVerificationEmail,
};
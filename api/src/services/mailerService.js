import transporter from "../config/mailer.js";

const appBaseUrl = process.env.APP_BASE_URL || process.env.RENDER_EXTERNAL_URL;

const sendConfirmationEmail = async (email, confirmationToken) => {
  const confirmationUrl = `${appBaseUrl}/confirm?token=${confirmationToken}`;
  await transporter.sendMail({
    from: `"Templify" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Please Confirm Your Email Address",
    html: `
    <h1>Welcome to Templify!</h1>
    <p>Please click the following link to confirm your email address:</p>
    <a href="${confirmationUrl}">${confirmationUrl}</a>
    `,
  });
};

const sendResetEmail = async (email, resetToken) => {
  const resetUrl = `${appBaseUrl}/reset?token=${resetToken}`;
  await transporter.sendMail({
    from: `"Templify" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
    <h1>Templify: Password Reset Request</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    `,
  });
};

export { sendConfirmationEmail, sendResetEmail };

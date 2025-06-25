import transporter from "../config/mailer.js";

const sendConfirmationEmail = async (email, confirmationToken) => {
  const appBaseUrl = process.env.APP_BASE_URL || process.env.RENDER_EXTERNAL_URL;
  const confirmationUrl = `${appBaseUrl}/api/confirm?token=${confirmationToken}`;
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

export { sendConfirmationEmail };

const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Load environment variables for local development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON request bodies

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render's free tier PostgreSQL
  },
});

// --- EMAIL TRANSPORTER SETUP ---
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// --- API ROUTES ---
// Homepage route
app.get("/", (req, res) => {
  res.send("<h1>Templify API</h1><p>Welcome! The service is running.</p>");
});

// User Registration Endpoint
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "User with this email already exists." });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const confirmationToken = crypto.randomBytes(32).toString("hex");

    // Insert user without an API key for now
    const newUserQuery = `
      INSERT INTO users (email, password_hash, confirmation_token)
      VALUES ($1, $2, $3)
      RETURNING id, email, created_at;
    `;
    const newUser = await pool.query(newUserQuery, [
      email,
      passwordHash,
      confirmationToken,
    ]);

    // Send the confirmation email
    const appBaseUrl = process.env.APP_BASE_URL || `http://localhost:${PORT}`;
    const confirmationUrl = `${appBaseUrl}/api/confirm?token=${confirmationToken}`;

    await transporter.sendMail({
      from: `"Templify" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Please Confirm Your Email Address",
      html: `<b>Welcome to Templify!</b><p>Please click the following link to confirm your email address:</p><a href="${confirmationUrl}">${confirmationUrl}</a>`,
    });

    res.status(201).json({
      message:
        "User created successfully! Please check your email for a confirmation link.",
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// NEW CONFIRMATION ENDPOINT
app.get("/api/confirm", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send("Confirmation token is missing.");
    }

    // Find the user by the token
    const userQuery = await pool.query(
      "SELECT * FROM users WHERE confirmation_token = $1",
      [token]
    );
    const user = userQuery.rows[0];

    if (!user) {
      return res.status(404).send("Invalid or expired confirmation token.");
    }

    // Generate API Key
    const apiKey = crypto.randomBytes(32).toString("hex");

    // Update the user: set as confirmed, clear the token, and add the API key
    await pool.query(
      "UPDATE users SET is_confirmed = TRUE, confirmation_token = NULL, api_key = $1 WHERE id = $2",
      [apiKey, user.id]
    );

    res.send(`
      <h1>Email confirmed successfully!</h1>
      <p>You can now use your API key to access the service.</p>
      <p>Your API Key: <strong>${apiKey}</strong></p>
      <p>Keep it safe and do not share it with anyone.</p>
      <p>Thank you for confirming your email!</p>
    `);
  } catch (err) {
    console.error("Confirmation Error:", err);
    res.status(500).send("An error occurred during confirmation.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

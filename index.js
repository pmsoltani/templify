const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");

// Load environment variables for local development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON request bodies

// --- MULTER CONFIGURATION ---
// Configure where to temporarily store the uploaded zip file.
const upload = multer({ dest: "storage/temp/" });

// --- S3/R2 CLIENT CONFIGURATION ---
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

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

// --- AUTHENTICATION MIDDLEWARE ---
// This function acts as a gatekeeper for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer TOKEN"

  if (token == null) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden (token is no longer valid)
    }
    // If token is valid, attach the user payload to the request object
    req.user = user;
    next(); // Proceed to the protected route
  });
};

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

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    if (!user.is_confirmed) {
      return res
        .status(403)
        .json({ error: "Please confirm your email before logging in." });
    }

    // Compare the submitted password with the stored hash
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Password is correct, create a JWT
    const payload = { userId: user.id, email: user.email };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    }); // Token expires in 1 day

    res.json({ accessToken: accessToken });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// NEW: A Protected Route for Testing
app.get("/api/me", authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      "SELECT id, email, api_key, created_at FROM users WHERE id = $1",
      [req.user.userId]
    );
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post(
  "/api/templates",
  authenticateToken,
  upload.single("templateZip"),
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const templateName = req.body.name;
      const htmlEntrypoint = req.body.html_entrypoint || "template.html";

      if (!templateName || !req.file) {
        return res
          .status(400)
          .json({ error: "Template name and zip file are required." });
      }

      const newTemplateQuery = `INSERT INTO templates (user_id, name, html_entrypoint) VALUES ($1, $2, $3) RETURNING id;`;
      const templateResult = await pool.query(newTemplateQuery, [
        userId,
        templateName,
        htmlEntrypoint,
      ]);
      const templateId = templateResult.rows[0].id;

      const zip = new AdmZip(req.file.path);
      const zipEntries = zip.getEntries();

      const uploadPromises = zipEntries.map((zipEntry) => {
        if (zipEntry.isDirectory) return null; // Skip directories

        const filePathInBucket = `user_files/${userId}/${templateId}/${zipEntry.entryName}`;

        const uploadParams = {
          Bucket: process.env.R2_BUCKET_NAME,
          Key: filePathInBucket,
          Body: zipEntry.getData(), // Get file content directly from zip entry
          ContentType: zipEntry.mimeType,
        };

        return s3Client.send(new PutObjectCommand(uploadParams));
      });

      await Promise.all(uploadPromises);

      // Clean up the temporary zip file
      fs.unlinkSync(req.file.path);

      res.status(201).json({
        message: "Template uploaded and processed successfully!",
        template: { id: templateId, name: templateName },
      });
    } catch (err) {
      console.error("Template Upload Error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

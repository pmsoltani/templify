import crypto from "crypto";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // For Render's free tier PostgreSQL
});

const query = (text, params) => pool.query(text, params);

const getUserById = async (id) => {
  const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return res.rows[0];
};

const getUserByEmail = async (email) => {
  const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return res.rows[0];
};

const getUserByApiKey = async (apiKey) => {
  const res = await pool.query("SELECT * FROM users WHERE api_key = $1", [apiKey]);
  return res.rows[0];
};

const getUserByConfirmationToken = async (token) => {
  const res = await pool.query("SELECT * FROM users WHERE confirmation_token = $1", [
    token,
  ]);
  return res.rows[0];
};

const createUser = async (email, passwordHash, confirmationToken) => {
  const res = await pool.query(
    `
    INSERT INTO users (email, password_hash, confirmation_token)
    VALUES ($1, $2, $3)
    RETURNING id, email, created_at
    `,
    [email, passwordHash, confirmationToken]
  );
  return res.rows[0];
};

const confirmUser = async (token) => {
  const user = await getUserByConfirmationToken(token);
  if (!user) return null;

  const apiKey = crypto.randomBytes(32).toString("hex");
  const res = await pool.query(
    `
    UPDATE users
    SET is_confirmed = TRUE, confirmation_token = NULL, api_key = $1
    WHERE confirmation_token = $2
    RETURNING *
    `,
    [apiKey, token]
  );
  return res.rows[0];
};

const getTemplateByIdAndUser = async (templateId, userId) => {
  const res = await pool.query(
    "SELECT * FROM templates WHERE id = $1 AND user_id = $2",
    [templateId, userId]
  );
  return res.rows[0];
};

const createTemplate = async (userId, name, htmlEntrypoint) => {
  const res = await pool.query(
    `
    INSERT INTO templates (user_id, name, html_entrypoint)
    VALUES ($1, $2, $3)
    RETURNING id
    `,
    [userId, name, htmlEntrypoint]
  );
  return res.rows[0];
};

export {
  query,
  getUserById,
  getUserByEmail,
  getUserByApiKey,
  createUser,
  confirmUser,
  getTemplateByIdAndUser,
  createTemplate,
};

import crypto from "crypto";
import db from "../config/database.js";

const getById = async (id) => {
  const res = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  return res.rows[0];
};

const getByEmail = async (email) => {
  const res = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  return res.rows[0];
};

const getByApiKey = async (apiKey) => {
  const res = await db.query("SELECT * FROM users WHERE api_key = $1", [apiKey]);
  return res.rows[0];
};

const getByConfirmationToken = async (token) => {
  const res = await db.query("SELECT * FROM users WHERE confirmation_token = $1", [
    token,
  ]);
  return res.rows[0];
};

const create = async (email, passwordHash, confirmationToken) => {
  const res = await db.query(
    `
    INSERT INTO users (email, password_hash, confirmation_token)
    VALUES ($1, $2, $3)
    RETURNING id, email, created_at
    `,
    [email, passwordHash, confirmationToken]
  );
  return res.rows[0];
};

const confirmAndSetApiKey = async (token) => {
  const user = await getByConfirmationToken(token);
  if (!user) return null;

  const apiKey = crypto.randomBytes(32).toString("hex");
  const res = await db.query(
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

export { getById, getByEmail, getByApiKey, create, confirmAndSetApiKey };

import db from "../config/database.js";

const getById = async (id) => {
  const res = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  return res.rows[0];
};

const getByEmail = async (email) => {
  const res = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  return res.rows[0];
};

const getByEmailOrNewEmail = async (email) => {
  const res = await db.query("SELECT * FROM users WHERE email = $1 OR new_email = $1", [
    email,
  ]);
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

const getByResetToken = async (token) => {
  const res = await db.query(
    `
    SELECT * FROM users
    WHERE password_reset_token = $1 AND password_reset_expires > NOW()
    `,
    [token]
  );
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

const update = async (userId, updateData) => {
  const allowedFields = [
    "email",
    "new_email",
    "password_hash",
    "api_key",
    "is_confirmed",
    "confirmation_token",
    "password_reset_token",
    "password_reset_expires",
  ];
  const isValid = Object.keys(updateData).every((k) => allowedFields.includes(k));
  if (!isValid) throw new Error("Invalid fields in update data");

  const updateEntries = Object.entries(updateData);
  if (updateEntries.length === 0) throw new Error("No fields to update");

  const setClause = updateEntries.map(([k], idx) => `"${k}" = $${idx + 1}`).join(", ");
  const values = updateEntries.map(([, v]) => v);

  const res = await db.query(
    `
    UPDATE users
    SET ${setClause}
    WHERE id = $${updateEntries.length + 1}
    RETURNING id, email, api_key;
    `,
    [...values, userId]
  );
  return res.rows[0];
};

const remove = async (userId) => {
  const res = await db.query("DELETE FROM users WHERE id = $1", [userId]);
  return res.rowCount > 0;
};

export {
  getById,
  getByEmail,
  getByEmailOrNewEmail,
  getByApiKey,
  getByConfirmationToken,
  getByResetToken,
  create,
  update,
  remove,
};

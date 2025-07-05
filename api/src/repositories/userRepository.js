import db from "../config/database.js";

const getByPublicId = async (publicId) => {
  const res = await db.query("SELECT * FROM users WHERE public_id = $1", [publicId]);
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

const create = async (email, passwordHash, confirmationToken, publicId) => {
  const res = await db.query(
    `
    INSERT INTO users (email, password_hash, confirmation_token, public_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [email, passwordHash, confirmationToken, publicId]
  );
  return res.rows[0];
};

const update = async (publicId, updateData) => {
  const updateEntries = Object.entries(updateData); // Assume updateEntries isn't empty
  const setClause = updateEntries.map(([k], idx) => `"${k}" = $${idx + 1}`).join(", ");
  const values = updateEntries.map(([, v]) => v);

  const res = await db.query(
    `
    UPDATE users
    SET ${setClause}
    WHERE public_id = $${updateEntries.length + 1}
    RETURNING *
    `,
    [...values, publicId]
  );
  return res.rows[0];
};

const remove = async (publicId) => {
  const res = await db.query("DELETE FROM users WHERE public_id = $1", [publicId]);
  return res.rowCount > 0;
};

export {
  create,
  getByApiKey,
  getByConfirmationToken,
  getByEmail,
  getByEmailOrNewEmail,
  getByPublicId,
  getByResetToken,
  remove,
  update,
};

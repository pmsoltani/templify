import db from "../config/database.js";

const getByIdAndUserId = async (templateId, userId) => {
  const res = await db.query("SELECT * FROM templates WHERE id = $1 AND user_id = $2", [
    templateId,
    userId,
  ]);
  return res.rows[0];
};

const getAllByUserId = async (userId) => {
  const res = await db.query(
    "SELECT * FROM templates WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return res.rows;
};

const create = async (userId, name, htmlEntrypoint, description) => {
  const res = await db.query(
    `
    INSERT INTO templates (user_id, name, html_entrypoint, description)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name
    `,
    [userId, name, htmlEntrypoint, description]
  );
  return res.rows[0];
};

const remove = async (templateId) => {
  const res = await db.query("DELETE FROM templates WHERE id = $1 RETURNING id", [
    templateId,
  ]);
  return res.rows[0];
};

const update = async (userId, templateId, name, htmlEntrypoint, description) => {
  const res = await db.query(
    `
    UPDATE templates
    SET name = $1, html_entrypoint = $2, description = $3
    WHERE id = $4 AND user_id = $5
    RETURNING id, name
    `,
    [name, htmlEntrypoint, description, templateId, userId]
  );
  return res.rows[0];
};

export { getAllByUserId, getByIdAndUserId, create, remove, update };

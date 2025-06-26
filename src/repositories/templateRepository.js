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

const create = async (userId, name, htmlEntrypoint) => {
  const res = await db.query(
    `
    INSERT INTO templates (user_id, name, html_entrypoint)
    VALUES ($1, $2, $3)
    RETURNING id, name
    `,
    [userId, name, htmlEntrypoint]
  );
  return res.rows[0];
};

const remove = async (templateId) => {
  const res = await db.query("DELETE FROM templates WHERE id = $1 RETURNING id", [
    templateId,
  ]);
  return res.rows[0];
};

const update = async (userId, templateId, name, htmlEntrypoint) => {
  const res = await db.query(
    `
    UPDATE templates
    SET name = $1, html_entrypoint = $2
    WHERE id = $3 AND user_id = $4
    RETURNING id, name
    `,
    [name, htmlEntrypoint, templateId, userId]
  );
  return res.rows[0];
};

export { getAllByUserId, getByIdAndUserId, create, remove, update };

import db from "../config/database.js";

const getByIdAndUser = async (templateId, userId) => {
  const res = await db.query("SELECT * FROM templates WHERE id = $1 AND user_id = $2", [
    templateId,
    userId,
  ]);
  return res.rows[0];
};

const getAllByUser = async (userId) => {
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

export { getAllByUser, getByIdAndUser, create };

import db from "../config/database.js";

const create = async (userId, templateId, storageObjectKey) => {
  const res = await db.query(
    `
    INSERT INTO pdfs (user_id, template_id, storage_object_key)
    VALUES ($1, $2, $3)
    RETURNING *;
    `,
    [userId, templateId, storageObjectKey]
  );
  return res.rows[0];
};

const getByIdAndUser = async (id, userId) => {
  const res = await db.query("SELECT * FROM pdfs WHERE id = $1 AND user_id = $2;", [
    id,
    userId,
  ]);
  return res.rows[0];
};

const getAllByUserId = async (userId) => {
  const res = await db.query(
    "SELECT * FROM pdfs WHERE user_id = $1 ORDER BY created_at DESC;",
    [userId]
  );
  return res.rows;
};

export { create, getByIdAndUser, getAllByUserId };

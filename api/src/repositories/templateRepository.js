import db from "../config/database.js";

const getByPublicIdAndUserPublicId = async (publicId, userPublicId) => {
  const res = await db.query(
    `
    SELECT
      t.*,
      u.public_id AS user_public_id
    FROM templates t
    JOIN users u ON t.user_id = u.id
    WHERE t.public_id = $1 AND u.public_id = $2;
    `,
    [publicId, userPublicId]
  );
  return res.rows[0];
};

const getAllByUserPublicId = async (userPublicId) => {
  const res = await db.query(
    `
    SELECT
      t.*,
      u.public_id AS user_public_id
    FROM templates t
    JOIN users u ON t.user_id = u.id
    WHERE u.public_id = $1
    ORDER BY t.created_at DESC;
    `,
    [userPublicId]
  );
  return res.rows;
};

const create = async (userPublicId, name, htmlEntrypoint, description, publicId) => {
  const res = await db.query(
    `
    INSERT INTO templates (user_id, name, html_entrypoint, description, public_id)
    VALUES (
      (SELECT id FROM users WHERE public_id = $1),
      $2, $3, $4, $5
    )
    RETURNING *;
    `,
    [userPublicId, name, htmlEntrypoint, description, publicId]
  );
  return res.rows[0];
};

const remove = async (publicId) => {
  const res = await db.query(
    "DELETE FROM templates WHERE public_id = $1 RETURNING *;",
    [publicId]
  );
  return res.rows[0];
};

const update = async (publicId, name, htmlEntrypoint, description) => {
  const res = await db.query(
    `
    UPDATE templates
    SET name = $1, html_entrypoint = $2, description = $3
    WHERE public_id = $4
    RETURNING *;
    `,
    [name, htmlEntrypoint, description, publicId]
  );
  return res.rows[0];
};

export { create, getAllByUserPublicId, getByPublicIdAndUserPublicId, remove, update };

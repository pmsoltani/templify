import db from "../config/database.js";

const create = async (userPublicId, templatePublicId, storageObjectKey, publicId) => {
  const res = await db.query(
    `
    INSERT INTO pdfs (user_id, template_id, storage_object_key, public_id)
    VALUES (
      (SELECT id FROM users WHERE public_id = $1),
      (SELECT id FROM templates WHERE public_id = $2),
      $3, $4
    )
    RETURNING *;
    `,
    [userPublicId, templatePublicId, storageObjectKey, publicId]
  );
  return res.rows[0];
};

const getByPublicIdAndUserPublicID = async (publicId, userPublicId) => {
  const res = await db.query(
    `
    SELECT
      p.*,
      u.public_id AS user_public_id,
      t.public_id AS template_public_id
    FROM pdfs p
    JOIN users u ON p.user_id = u.id
    JOIN templates t ON p.template_id = t.id
    WHERE p.public_id = $1 AND u.public_id = $2;
    `,
    [publicId, userPublicId]
  );
  return res.rows[0];
};

const getAllByUserPublicId = async (userPublicId) => {
  const res = await db.query(
    `
    SELECT
      p.*,
      u.public_id AS user_public_id,
      t.public_id AS template_public_id
    FROM pdfs p
    JOIN users u ON p.user_id = u.id
    JOIN templates t ON p.template_id = t.id
    WHERE u.public_id = $1
    ORDER BY p.created_at DESC;
    `,
    [userPublicId]
  );
  return res.rows;
};

export { create, getByPublicIdAndUserPublicID, getAllByUserPublicId };

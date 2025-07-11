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

const update = async (publicId, updateData) => {
  if (updateData.hasOwnProperty("htmlEntrypoint")) {
    updateData["html_entrypoint"] = updateData["htmlEntrypoint"];
    delete updateData["htmlEntrypoint"];
  }
  const updateEntries = Object.entries(updateData); // Assume updateEntries isn't empty
  const setClause = updateEntries.map(([k], idx) => `"${k}" = $${idx + 1}`).join(", ");
  const values = updateEntries.map(([, v]) => v);

  const res = await db.query(
    `
    UPDATE templates
    SET ${setClause}
    WHERE public_id = $${updateEntries.length + 1}
    RETURNING *
    `,
    [...values, publicId]
  );
  return res.rows[0];
};

export { create, getAllByUserPublicId, getByPublicIdAndUserPublicId, remove, update };

import db from "../config/database.js";

const getByPublicId = async (publicId) => {
  const res = await db.query("SELECT * FROM files WHERE public_id = $1;", [publicId]);
  return res.rows[0];
};

const getAllByTemplatePublicId = async (templatePublicId) => {
  const res = await db.query(
    `
    SELECT
      f.*,
      t.public_id AS template_public_id
    FROM files f
    JOIN templates t ON f.template_id = t.id
    WHERE t.public_id = $1
    ORDER BY f.name DESC;
    `,
    [templatePublicId]
  );
  return res.rows;
};

const create = async (publicId, templatePublicId, name, size, mime) => {
  const res = await db.query(
    `
    INSERT INTO files (public_id, template_id, name, size, mime)
    VALUES ($1, (SELECT id FROM templates WHERE public_id = $2), $3, $4, $5)
    RETURNING *;
    `,
    [publicId, templatePublicId, name, size, mime]
  );
  return res.rows[0];
};

const remove = async (publicId) => {
  const res = await db.query("DELETE FROM files WHERE public_id = $1 RETURNING *;", [
    publicId,
  ]);
  return res.rows[0];
};

const update = async (publicId, updateData) => {
  const updateEntries = Object.entries(updateData); // Assume updateEntries isn't empty
  const setClause = updateEntries.map(([k], idx) => `"${k}" = $${idx + 1}`).join(", ");
  const values = updateEntries.map(([, v]) => v);

  const res = await db.query(
    `
    UPDATE files
    SET ${setClause}
    WHERE public_id = $${updateEntries.length + 1}
    RETURNING *
    `,
    [...values, publicId]
  );
  return res.rows[0];
};

export { create, getAllByTemplatePublicId, getByPublicId, remove, update };

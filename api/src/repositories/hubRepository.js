import db from "../config/database.js";

const create = async (
  userId,
  templateId,
  name,
  entrypoint,
  description,
  category,
  tags,
  publicId
) => {
  const res = await db.query(
    `
    INSERT INTO hub (author_id, template_id, name, entrypoint, description, category, tags, public_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
    `,
    [userId, templateId, name, entrypoint, description, category, tags, publicId]
  );
  return res.rows[0];
};

const getAll = async (filters = {}) => {
  let query = `
    SELECT 
      h.*,
      u.email as author_email,
      u.public_id as author_public_id
    FROM hub h
    JOIN users u ON h.author_id = u.id
    WHERE h.approved = true
  `;

  const params = [];
  let paramCount = 1;

  if (filters.category) {
    query += ` AND h.category = $${paramCount}`;
    params.push(filters.category);
    paramCount++;
  }

  if (filters.featured) {
    query += ` AND h.featured = $${paramCount}`;
    params.push(filters.featured);
    paramCount++;
  }

  if (filters.tags && filters.tags.length > 0) {
    query += ` AND h.tags && $${paramCount}`;
    params.push(filters.tags);
    paramCount++;
  }

  query += ` ORDER BY h.created_at DESC`;

  if (filters.limit) {
    query += ` LIMIT $${paramCount}`;
    params.push(filters.limit);
    paramCount++;
  }

  if (filters.offset) {
    query += ` OFFSET $${paramCount}`;
    params.push(filters.offset);
  }

  const res = await db.query(query, params);
  return res.rows;
};

const getByPublicId = async (publicId) => {
  const res = await db.query(
    `
    SELECT 
      h.*,
      u.email as author_email,
      u.public_id as author_public_id
    FROM hub h
    JOIN users u ON h.author_id = u.id
    WHERE h.public_id = $1;
    `,
    [publicId]
  );
  return res.rows[0];
};

const getByPublicIdAndAuthorId = async (publicId, authorId) => {
  const res = await db.query(
    `
    SELECT 
      h.*,
      u.email as author_email,
      u.public_id as author_public_id
    FROM hub h
    JOIN users u ON h.author_id = u.id
    WHERE h.public_id = $1 AND h.author_id = $2;
    `,
    [publicId, authorId]
  );
  return res.rows[0];
};

const update = async (publicId, updateData) => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  // Build dynamic update query
  Object.entries(updateData).forEach(([key, value]) => {
    if (value !== undefined && key !== "public_id" && key !== "author_id") {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    throw new Error("No valid fields to update");
  }

  // Always update updated_at
  fields.push(`updated_at = NOW()`);
  values.push(publicId);

  const query = `
    UPDATE hub 
    SET ${fields.join(", ")}
    WHERE public_id = $${paramCount}
    RETURNING *;
  `;

  const res = await db.query(query, values);
  return res.rows[0];
};

const remove = async (publicId) => {
  const res = await db.query(`DELETE FROM hub WHERE public_id = $1 RETURNING *;`, [
    publicId,
  ]);
  return res.rows[0];
};

const incrementDownloads = async (publicId) => {
  const res = await db.query(
    `
    UPDATE hub 
    SET downloads = downloads + 1, updated_at = NOW()
    WHERE public_id = $1
    RETURNING *;
    `,
    [publicId]
  );
  return res.rows[0];
};

const getByTemplateId = async (templateId) => {
  const res = await db.query(`SELECT * FROM hub WHERE template_id = $1;`, [templateId]);
  return res.rows[0];
};

export {
  create,
  getAll,
  getByPublicId,
  getByPublicIdAndAuthorId,
  getByTemplateId,
  incrementDownloads,
  remove,
  update,
};

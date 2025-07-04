import db from "../config/database.js";

const create = async (
  userPublicId,
  publicId,
  action,
  status,
  cost = 0,
  details = null,
  ipAddress = null,
  userAgent = null
) => {
  const res = await db.query(
    `
    INSERT INTO events (user_id, public_id, action, status, cost, details, ip_address, user_agent)
    VALUES (
      (SELECT id FROM users WHERE public_id = $1),
      $2, $3, $4, $5, $6, $7, $8
    )
    RETURNING *;
    `,
    [userPublicId, publicId, action, status, cost, details, ipAddress, userAgent]
  );
  return res.rows[0];
};

const anonymizeByUserId = async (userId) => {
  const res = await db.query(
    "UPDATE events SET ip_address = NULL, user_agent = 'REDACTED' WHERE user_id = $1;",
    [userId]
  );
  return res.rowCount;
};

export { create, anonymizeByUserId };

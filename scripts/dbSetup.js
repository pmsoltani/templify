import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Render
});

const createUsersTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    new_email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    api_key VARCHAR(64) UNIQUE,
    is_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    confirmation_token VARCHAR(64) UNIQUE,
    password_reset_token VARCHAR(64) DEFAULT NULL,
    password_reset_expires TIMESTAMPTZ DEFAULT NULL,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

const createTemplatesTableQuery = `
  CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    html_entrypoint VARCHAR(255) NOT NULL DEFAULT 'template.html',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );
`;

async function setupDatabase() {
  console.log("Connecting to database...");
  const client = await pool.connect();
  try {
    console.log("Executing CREATE TABLE command...");
    await client.query(createUsersTableQuery);
    console.log("Table 'users' created successfully or already exists.");
    await client.query(createTemplatesTableQuery);
    console.log("Table 'templates' created successfully or already exists.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    client.release();
    await pool.end();
    console.log("Connection closed.");
  }
}

setupDatabase();

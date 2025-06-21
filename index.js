const express = require("express");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Render's free tier PostgreSQL
  },
});

// Homepage route
app.get("/", (req, res) => {
  res.send(
    "<h1>Hello from Node.js!</h1><p>Templify is ready to connect to the database.</p>"
  );
});

// New route to test the database connection
app.get("/db-test", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");

    res.json({
      success: true,
      message: "Successfully connected to the database!",
      db_time: result.rows[0].now,
    });

    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error connecting to database",
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

import express from "express";
import cors from "cors";
import pkg from "pg";
// import env from ".env"
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const db = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get("/", (req, res) => {
  res.json("hello");
});

app.get("/books", async (req, res) => {
  try {
    const client = await db.connect();
    const result = await client.query("SELECT * FROM books");
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/books", async (req, res) => {
  const q =
    "INSERT INTO books(title, description, price, cover) VALUES ($1, $2, $3, $4)";
  const { title, description, price, cover } = req.body;
  const values = [title, description, price, cover];

  try {
    const client = await db.connect();
    const result = await client.query(q, values);
    client.release();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/books/:id", async (req, res) => {
  const bookId = req.params.id;
  const q = "DELETE FROM books WHERE id = $1";

  try {
    const client = await db.connect();
    const result = await client.query(q, [bookId]);
    client.release();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/books/:id", async (req, res) => {
  const bookId = req.params.id;
  const q =
    "UPDATE books SET title = $1, description = $2, price = $3, cover = $4 WHERE id = $5";
  const { title, description, price, cover } = req.body;
  const values = [title, description, price, cover, bookId];

  try {
    const client = await db.connect();
    const result = await client.query(q, values);
    client.release();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(8800, () => {
  console.log("Connected to backend.");
});

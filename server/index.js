import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv"
dotenv.config();
const { Pool } = pkg;

const port = process.env.PORT || 8800;


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
    "INSERT INTO books(title, description, price) VALUES ($1, $2, $3)";
  const { title, description, price } = req.body;
  const values = [title, description, price];

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
    "UPDATE books SET title = $1, description = $2, price = $3, WHERE id = $5";
  const { title, description, price} = req.body;
  const values = [title, description, price, bookId];

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

app.listen(port, () => {
  console.log("Connected to backend.");
});

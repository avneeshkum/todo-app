require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS, 
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error(" Database connection failed:", err.message);
    } else {
        console.log(" Database connected successfully!");
    }
});

// Get all tasks
app.get("/tasks", (req, res) => {
    db.query("SELECT * FROM tasks WHERE deleted_at IS NULL", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Add new task
app.post("/tasks", (req, res) => {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    db.query(
        "INSERT INTO tasks (title, description, status) VALUES (?, ?, 'pending')",
        [title, description],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Task added!", id: result.insertId });
        }
    );
});

// Soft Delete Task
app.delete("/tasks/soft/:id", (req, res) => {
    db.query("UPDATE tasks SET deleted_at = NOW() WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Task soft deleted!" });
    });
});

// Hard Delete Task
app.delete("/tasks/hard/:id", (req, res) => {
    db.query("DELETE FROM tasks WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: " Task permanently deleted!" });
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});

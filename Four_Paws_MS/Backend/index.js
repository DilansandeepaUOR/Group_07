import express from "express";
import pool from "./db.js"; // Ensure correct import

const app = express();

async function connectDB() {
    try {
        const connection = await pool.getConnection(); // Corrected
        console.log("Connected to MySQL database!");
        connection.release(); // Release connection back to the pool
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
}

connectDB();

app.get("/", (req, res) => {
    res.send("Hello, Node.js!");
});

app.listen(3001, () => {
    console.log("Server running on http://localhost:3001");
});

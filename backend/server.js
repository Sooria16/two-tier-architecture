const express = require("express");
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors({
    origin: 'http://34.212.131.221', // Your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// API Endpoint
app.get("/api/hello", (req, res) => {
    const name = req.query.name || "Guest";
    res.send(`Hello ${name}, backend API working successfully!`);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});

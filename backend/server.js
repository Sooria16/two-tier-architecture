const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Updated GET API to match frontend request (/api/hello)
app.get("/api/hello", (req, res) => {
    const name = req.query.name || "Guest";
    res.send(`Hello ${name}, backend API working successfully!`);
});

app.listen(3000, () => console.log("Backend running on port 3000"));

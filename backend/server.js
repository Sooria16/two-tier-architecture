const express = require("express");
const app = express();
app.use(express.json());

app.post("/hello", (req, res) => {
  const { name } = req.body;
  res.json({ message: `Hello ${name}, backend API working successfully!` });
});

app.listen(3000, () => console.log("Backend running on port 3000"));

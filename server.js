const express = require("express");
require("dotenv").config();
const playlistRoute = require("./routes/playlist");
const segmentRoute = require("./routes/segment");

const app = express();

// Routes
app.use("/", playlistRoute);
app.use("/", segmentRoute);

// Root
app.get("/", (req, res) => res.send("HLS Proxy Server Running"));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

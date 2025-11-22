const express = require("express");
const dotenv = require("dotenv");
const playlistRoute = require("./routes/playlist");
const segmentRoute = require("./routes/segment");

dotenv.config();

const app = express();

app.use("/", playlistRoute);
app.use("/", segmentRoute);

app.get("/", (req, res) => res.send("HLS Secure Proxy Running..."));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

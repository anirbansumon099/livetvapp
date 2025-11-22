const express = require("express");
require("dotenv").config();
const playlistRoute = require("./routes/playlist");
const segmentRoute = require("./routes/segment");

const app = express();
app.use(express.static('.'));

// Routes
app.use("/", playlistRoute);
app.use("/", segmentRoute);

// Root
app.get("/", (req, res) => {
  //res.sendFile("HLS Proxy Server Running"))
  res.sendFile('index.html', { root: '.' });
});
};

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

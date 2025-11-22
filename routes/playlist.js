const express = require("express");
const axios = require("axios");
const { encryptText } = require("../utils/encrypt");
require("dotenv").config();

const router = express.Router();

// Header rotation
const headerVariants = [
    {
        "User-Agent": "Mozilla/5.0 (Android 13; Mobile; rv:145.0) Gecko/145.0 Firefox/145.0",
        "Accept": "*/*"
    },
    {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
        "Accept": "*/*"
    }
];

router.get("/tracks-v1a1/:id/mono.m3u8", async (req, res) => {
    try {
        const id = req.params.id;
        const url = `${process.env.MAIN_SERVER}/live.php?id=${id}&token=${Date.now()}`;

        const headers = headerVariants[Math.floor(Math.random() * headerVariants.length)];

        const { data } = await axios.get(url, { headers, timeout: 10000 });

        let playlist = data;

        playlist = playlist.replace(/([^ \n]+\.ts)/g, (segment) => {
            const encoded = encryptText(segment);
            return `/tracks-v1a1/_${encoded}.ts`;
        });

        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.send(playlist);

    } catch (err) {
        console.error(err);
        res.status(500).send("Playlist load error");
    }
});

module.exports = router;

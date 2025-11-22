const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

const headerVariants = [
    [
        "Mozilla/5.0 (Android 13; Mobile; rv:145.0) Gecko/145.0 Firefox/145.0",
        "Sec-Fetch-Mode: cors",
        "Sec-Fetch-Site: same-origin"
    ],
    [
        "Mozilla/5.0 (Linux; Android 12; SM-A505F) AppleWebKit/537.36 Chrome/118.0 Mobile Safari/537.36",
        "Sec-Fetch-Mode: navigate",
        "Sec-Fetch-Site: same-origin"
    ],
    [
        "Mozilla/5.0 (Windows NT 10.0; Win64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
        "Sec-Fetch-Mode: no-cors",
        "Sec-Fetch-Site: same-origin"
    ]
];

const commonHeaders = [
    "Host: allinonereborn.online",
    "Accept: */*",
    "Accept-Language: en-US,en;q=0.5",
    "Referer: https://allinonereborn.online/airteltv-web/player.html",
    "Connection: keep-alive"
];

// ✅ Fixed token generation
function generateToken() {
    const crypto = require("crypto");
    const seed = (Date.now() + Math.floor(Math.random() * 10000)).toString();
    return crypto.createHash("md5").update(seed).digest("hex");
}

// Retry fetch function
async function curlRequest(url, headers, retry = 3) {
    for (let i = 0; i < retry; i++) {
        try {
            const res = await axios.get(url, { headers, timeout: 10000 });
            if (res.status === 200 && res.data && res.data.length > 20) return res.data;
        } catch (e) {
            await new Promise(r => setTimeout(r, 200));
        }
    }
    return false;
}

// Playlist route
router.get("/tracks-v1a1/:id/mono.m3u8", async (req, res) => {
    const id = req.params.id;
    const token = generateToken();
    const playlistURL = `${process.env.MAIN_SERVER}/live.php?id=${encodeURIComponent(id)}&token=${token}`;
    const headers = [...commonHeaders, ...headerVariants[Math.floor(Math.random() * headerVariants.length)]];

    console.log("[PLAYLIST] Fetching:", playlistURL);

    const playlist = await curlRequest(playlistURL, headers, 3);
    if (!playlist) {
        console.error("[PLAYLIST] Failed to fetch");
        return res.status(500).send("#ERROR: Playlist Fetch Failed\n");
    }

    const lines = playlist.replace(/\r/g, "").split("\n");
    let out = "#EXTM3U\n";

    for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        if (line.startsWith("#")) { out += line + "\n"; continue; }
        if (line.includes("?file=")) {
            const urlObj = new URL(line, "http://localhost");
            const file = urlObj.searchParams.get("file");
            if (file) out += `/tracks-v1a1/_${encodeURIComponent(file)}.ts\n`;
        }
    }

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.send(out);
});

module.exports = router;

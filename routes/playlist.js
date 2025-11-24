const express = require("express");
const https = require("https");
const crypto = require("crypto");
const { URL } = require("url");

//const SecureFixedEncoder = require("../utils/SecureFixedEncoder");


const router = express.Router();

const baseServer = process.env.MAIN_SERVER + "/live3.php";

const headerVariants = [
    [
        "Mozilla/5.0 (Android 13; Mobile; rv:145.0) Gecko/145.0 Firefox/145.0",
        "Sec-Fetch-Mode: cors",
        "Sec-Fetch-Site: same-origin",
        "Sec-Fetch-Dest:empty"
    ],
    [
        "Mozilla/5.0 (Linux; Android 12; SM-A505F) AppleWebKit/537.36 Chrome/118.0 Mobile Safari/537.36",
        "Sec-Fetch-Mode: navigate",
        "Sec-Fetch-Site: same-origin",
        "Sec-Fetch-Dest:empty"
    ],
    [
        "Mozilla/5.0 (Windows NT 10.0; Win64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
        "Sec-Fetch-Mode: no-cors",
        "Sec-Fetch-Site: same-origin",
        "Sec-Fetch-Dest:empty"
        
    ]
];

const commonHeaders = {
    "User-Agent":"Mozilla/5.0 (Android 13; Mobile; rv:145.0) Gecko/145.0 Firefox/145.0",
   "Sec-Fetch-Mode":"cors",
   "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Dest": "empty",

    "Host": "allinonereborn.online",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": "https://allinonereborn.online/airteltv-web/player.html",
    "Connection": "keep-alive"
};

// Token generation (like PHP md5(time() . rand()))
function generateToken() {
    const seed = (Date.now() + Math.floor(Math.random() * 10000)).toString();
    return crypto.createHash("md5").update(seed).digest("hex");
}

// cURL-like fetch
function curlRequest(url, headers, retry = 3) {
    return new Promise((resolve) => {
        let attempts = 0;
        const requestOnce = () => {
            attempts++;
            const urlObj = new URL(url);
            const lib = urlObj.protocol === "https:" ? https : require("http");
            const options = {
                method: "GET",
                headers,
                rejectUnauthorized: false
            };

            const req = lib.request(urlObj, options, res => {
                let data = "";
                res.on("data", chunk => data += chunk);
                res.on("end", () => {
                    if (res.statusCode === 200 && data.length > 20) return resolve(data);
                    if (attempts < retry) return setTimeout(requestOnce, 200);
                    resolve(false);
                });
            });

            req.on("error", () => {
                if (attempts < retry) return setTimeout(requestOnce, 200);
                resolve(false);
            });

            req.end();
        };
        requestOnce();
    });
}

// Playlist route
router.get("/tracks-v1a1/:id/mono.m3u8", async (req, res) => { 
    const id = req.params.id;
   // const encoder = new SecureFixedEncoder(undefined, 10);
//const decodedId = encoder.decodeid);

    res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Headers", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    const token = generateToken();
    const playlistURL = `${baseServer}?id=${encodeURIComponent(id)}&token=${token}`;

    const headers = { ...commonHeaders };
  	const randHeader = headerVariants[Math.floor(Math.random() * headerVariants.length)];
  	//headers["User-Agent"] = randHeader[0];
   
    console.log("[PLAYLIST] Fetching:", playlistURL);

    const playlist = await curlRequest(playlistURL, headers, 3);
    if (!playlist) {
        console.error("[PLAYLIST] Fetch failed");
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



router.get("/tracks-v1a1/:id/index.m3u8", async (req, res) => { 
    const id = req.params.id;
   // const encoder = new SecureFixedEncoder(undefined, 10);
//const decodedId = encoder.decodeid);

    res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Headers", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    const token = generateToken();
    const playlistURL = `${baseServer}?id=${encodeURIComponent(id)}&token=${token}`;

    const headers = { ...commonHeaders };
    const randHeader = headerVariants[Math.floor(Math.random() * headerVariants.length)];
    headers["User-Agent"] = randHeader[0];

    console.log("[PLAYLIST] Fetching:", playlistURL);

    const playlist = await curlRequest(playlistURL, headers, 3);
    if (!playlist) {
        console.error("[PLAYLIST] Fetch failed");
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

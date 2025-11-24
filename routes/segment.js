const express = require("express");
const https = require("https");
const crypto = require("crypto");
const { URL } = require("url");

const router = express.Router();

const baseServer = process.env.MAIN_SERVER + "/live3.php";

const headerVariants = [
    [
        "Mozilla/5.0 (Android 13; Mobile; rv:145.0) Gecko/145.0 Firefox/145.0",
        "Sec-Fetch-Mode: cors",
        "Sec-Fetch-Site: same-origin",
        "Sec-Fetch-Dest: empty"

        
    ],
    [
        "Mozilla/5.0 (Linux; Android 12; SM-A505F) AppleWebKit/537.36 Chrome/118.0 Mobile Safari/537.36",
        "Sec-Fetch-Mode: navigate",
        "Sec-Fetch-Site: same-origin",
        "Sec-Fetch-Dest: empty"
    ],
    [
        "Mozilla/5.0 (Windows NT 10.0; Win64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
        "Sec-Fetch-Mode: no-cors",
        "Sec-Fetch-Site: same-origin",
        "Sec-Fetch-Dest: empty"
    ]
];

const commonHeaders = {
    "Host": "allinonereborn.online",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Referer": "https://allinonereborn.online/airteltv-web/player.html",
    "Connection": "keep-alive"
};

function generateToken() {
    const seed = (Date.now() + Math.floor(Math.random() * 10000)).toString();
    return crypto.createHash("md5").update(seed).digest("hex");
}

// Stream fetch
function curlRequest(url, headers, retry = 3) {
    return new Promise((resolve) => {
        let attempts = 0;
        const requestOnce = () => {
            attempts++;
            const urlObj = new URL(url);
            const lib = urlObj.protocol === "https:" ? https : require("http");
            const options = { method: "GET", headers, rejectUnauthorized: false };
            const req = lib.request(urlObj, options, res => {
                if (res.statusCode === 200) return resolve(res);
                if (attempts < retry) return setTimeout(requestOnce, 200);
                resolve(false);
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

// Segment route
router.get("/tracks-v1a1/_:seg.ts", async (req, res) => {
    const seg = req.params.seg;
    res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Headers", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    const token = generateToken();
    const segURL = `${baseServer}?file=${encodeURIComponent(seg)}&token=${token}`;

    const headers = { ...commonHeaders };
    const randHeader = headerVariants[Math.floor(Math.random() * headerVariants.length)];
    headers["User-Agent"] = randHeader[0];

    console.log("[SEGMENT] Fetching:", segURL);

    const stream = await curlRequest(segURL, headers, 3);
    if (!stream) return res.status(500).send("");

    res.setHeader("Content-Type", "video/mp2t");
    res.setHeader("Access-Control-Allow-Origin", "*");
    stream.pipe(res);
});

module.exports = router;

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

function generateToken() {
    return require("crypto").createHash("md5").update(Date.now() + Math.floor(Math.random() * 10000)).digest("hex");
}

async function curlRequest(url, headers, retry = 3) {
    for (let i = 0; i < retry; i++) {
        try {
            const res = await axios.get(url, { headers, responseType: "stream", timeout: 10000 });
            if (res.status === 200) return res.data;
        } catch (e) { await new Promise(r => setTimeout(r, 200)); }
    }
    return false;
}

router.get("/tracks-v1a1/_:seg.ts", async (req, res) => {
    const seg = req.params.seg;
    const token = generateToken();
    const segURL = `${process.env.MAIN_SERVER}/live.php?file=${encodeURIComponent(seg)}&token=${token}`;
    const headers = [...commonHeaders, ...headerVariants[Math.floor(Math.random() * headerVariants.length)]];

    console.log("[SEGMENT] Fetching:", segURL);

    const stream = await curlRequest(segURL, headers, 3);
    if (!stream) return res.status(500).send("");

    res.setHeader("Content-Type", "video/mp2t");
    res.setHeader("Access-Control-Allow-Origin", "*");
    stream.pipe(res);
});

module.exports = router;

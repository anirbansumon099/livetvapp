const express = require("express");
const axios = require("axios");
const { decryptText } = require("../utils/decrypt");
require("dotenv").config();

const router = express.Router();

router.get("/tracks-v1a1/_:encoded.ts", async (req, res) => {
    try {
        const encoded = req.params.encoded;
        const originalSegment = decryptText(encoded);

        if (!originalSegment) return res.status(400).send("");

        const url = `${process.env.MAIN_SERVER}/live.php?file=${encodeURIComponent(originalSegment)}&token=${Date.now()}`;
        
        const response = await axios({
            url,
            method: "GET",
            responseType: "stream",
            headers: { "User-Agent": "Mozilla/5.0", "Accept": "*/*" },
            timeout: 10000
        });

        res.setHeader("Content-Type", "video/mp2t");
        response.data.pipe(res);

    } catch (err) {
        console.error(err);
        res.status(500).send("");
    }
});

module.exports = router;
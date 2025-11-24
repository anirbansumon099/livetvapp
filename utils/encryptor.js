//encryptor.জস
// utils/encryptor.js

const SECRET_KEY = 739391; // Change this for security
const MIN_LEN = 6;
const MAX_LEN = 8;

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// Base62 Encode
function base62Encode(num) {
    if (num === 0) return "0";
    let result = "";
    while (num > 0) {
        result = BASE62[num % 62] + result;
        num = Math.floor(num / 62);
    }
    return result;
}

// Base62 Decode
function base62Decode(str) {
    return str.split("").reduce((acc, char) => acc * 62 + BASE62.indexOf(char), 0);
}

// Encrypt Number → Mixed 6–8 chars
function encryptNumber(num) {
    let scrambled = num + SECRET_KEY;
    let encoded = base62Encode(scrambled);

    // Add random mix if less than minimum length
    while (encoded.length < MIN_LEN) {
        encoded = BASE62[Math.floor(Math.random() * 62)] + encoded;
    }

    // Trim if more than maximum
    if (encoded.length > MAX_LEN)
        encoded = encoded.slice(-MAX_LEN);

    return encoded;
}

// Decrypt to original number
function decryptNumber(enc) {
    let temp = enc;

    while (temp.length > 0) {
        try {
            const decoded = base62Decode(temp);
            const original = decoded - SECRET_KEY;
            if (original >= 0) return original;
        } catch (err) {}

        temp = temp.slice(1); // remove random prefix
    }

    throw new Error("Invalid encrypted code");
}

module.exports = { encryptNumber, decryptNumber };

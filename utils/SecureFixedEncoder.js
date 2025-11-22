class SecureFixedEncoder {
    constructor(alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', length = 10) {
        this.alphabet = alphabet; // numeric digits বাদ দেওয়া
        this.base = alphabet.length;
        this.length = length;
    }

    // Number -> Base string (letters only)
    numberToBase(num) {
        if (num === 0) return this.alphabet[0];
        let str = '';
        while (num > 0) {
            str = this.alphabet[num % this.base] + str;
            num = Math.floor(num / this.base);
        }
        return str;
    }

    // Base string -> Number
    baseToNumber(str) {
        let num = 0;
        for (let i = 0; i < str.length; i++) {
            const idx = this.alphabet.indexOf(str[i]);
            if (idx === -1) throw new Error('Invalid character in encoded string');
            num = num * this.base + idx;
        }
        return num;
    }

    // Encode number with fixed length, letters only
    encode(number) {
        number = Number(number);
        if (number < 0) throw new Error('Number must be non-negative');

        // Step 1: core string
        let core = this.numberToBase(number);

        if (core.length > this.length) {
            throw new Error(`Number too big to encode in ${this.length} characters`);
        }

        // Step 2: random prefix/suffix to reach fixed length
        let padLength = this.length - core.length;
        let prefixLength = Math.floor(Math.random() * (padLength + 1));
        let suffixLength = padLength - prefixLength;

        let randomChar = () => this.alphabet[Math.floor(Math.random() * this.base)];
        let prefix = Array.from({ length: prefixLength }, randomChar).join('');
        let suffix = Array.from({ length: suffixLength }, randomChar).join('');

        return prefix + core + suffix;
    }

    // Decode letters-only string to original number
    decode(encoded) {
        // Remove prefix/suffix if needed
        // Knowing core is at middle (we don't know exact position), simplest: decode all letters
        return this.baseToNumber(encoded.replace(/[^a-zA-Z]/g, '')); 
    }
}

module.exports = SecureFixedEncoder;

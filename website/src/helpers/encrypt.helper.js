require("dotenv").config()
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Recommended length for GCM
const AUTH_TAG_LENGTH = 16; // GCM authentication tag length
const defaultKey = process.env.DEFAULT_ENCRYPT_KEY

/**
 * Encrypts a string using AES-256-GCM.
 *
 * @param {string} plaintext - The input string to encrypt.
 * @param {string} key - A 32-byte key in string or buffer format.
 * @returns {string} - Base64-encoded ciphertext including IV and auth tag.
 */
function encrypt(plaintext, key = defaultKey) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, formatKey(key), iv);

    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final()
    ]);
    const authTag = cipher.getAuthTag();

    // Concatenate IV + encrypted content + auth tag
    const result = Buffer.concat([iv, encrypted, authTag]).toString('base64');
    return result;
}

/**
 * Decrypts a string using AES-256-GCM.
 *
 * @param {string} ciphertext - Base64-encoded ciphertext with IV and auth tag.
 * @param {string} key - A 32-byte key in string or buffer format.
 * @returns {string} - The decrypted plaintext string.
 */
function decrypt(ciphertext, key = defaultKey) {
    const data = Buffer.from(ciphertext, 'base64');

    const iv = data.slice(0, IV_LENGTH);
    const authTag = data.slice(data.length - AUTH_TAG_LENGTH);
    const encryptedText = data.slice(IV_LENGTH, data.length - AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, formatKey(key), iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
        decipher.update(encryptedText),
        decipher.final()
    ]);

    return decrypted.toString('utf8');
}

/**
 * Formats or derives a key as a 32-byte Buffer.
 *
 * @param {string|Buffer} key - Input key.
 * @returns {Buffer} - A 32-byte Buffer suitable for AES-256-GCM.
 */
function formatKey(key) {
    if (Buffer.isBuffer(key)) {
        if (key.length !== 32) throw new Error('Key must be 32 bytes.');
        return key;
    }

    // Derive key from passphrase if needed (using SHA-256)
    const bufferKey = crypto.createHash('sha256').update(key).digest();
    return bufferKey;
}

module.exports = { encrypt, decrypt }
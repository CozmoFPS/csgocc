require('dotenv').config()
const crypto = require('crypto');
const defaultSalt = process.env.DEFAULT_HASH_SALT;

/**
 * Hashes a string using SHA-256 with a salt.
 * Suitable for securely hashing personal data like IP addresses.
 *
 * @param {string} input - The string to hash.
 * @param {string} salt - A salt string to make the hash more secure.
 * @returns {string} - The resulting hash in hexadecimal format.
 */
function hash(input, salt=defaultSalt) {
  const hash = crypto.createHmac('sha256', salt);
  hash.update(input);
  return hash.digest('hex');
}

module.exports = hash
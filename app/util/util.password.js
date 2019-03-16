const crypto = require("crypto");

/**
 * Hashes a given password
 * @param password The plaintext password to hash
 * @returns A string of the hashed password
 */
exports.hashPassword = function(password) {
    let hash = crypto.createHash("sha512");
    hash.update(password);
    return hash.digest("hex");
}
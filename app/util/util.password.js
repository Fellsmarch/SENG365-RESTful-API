const crypto = require("crypto");

exports.hashPassword = function(password) {
    let hash = crypto.createHash("sha512");
    hash.update(password);
    return hash.digest("hex");
}
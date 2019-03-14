const db = require("../../config/db");

exports.checkAuth = function(authToken, callbackFunc) {
    if (!authToken) return callbackFunc(null);

    let query = "SELECT user_id FROM User WHERE auth_token = ?";

    db.getPool().query(query, [[authToken]], function(err, rows) {
        if (err) return callbackFunc(null);
        else if (rows.length < 1) return callbackFunc(null);
        else return callbackFunc(rows[0].user_id);
    });
}
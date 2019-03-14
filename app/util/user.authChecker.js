const db = require("../../config/db");

exports.checkAuth = function(authToken) {
    let query = "SELECT user_id FROM User WHERE auth_token = ?";

    db.getPool().query(query, [authToken], function(err, rows) {
        // if (err) callbackFunc(null); //If an error was found call the callback function with null
        // else if (rows.length < 1) callbackFunc(null); //If no user was found, call the callback function with null
        // else callbackFunc(rows[0].user_id);
        if (err || rows.length < 1) return null;
        else return rows[0].user_id;
    })
}
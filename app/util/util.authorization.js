const db = require("../../config/db");

/**
 * Finds a userId given an auth token
 * @param authToken the authToken to check for
 * @param callbackFunc a function to put the result into
 */
exports.getIdByAuthToken = function(authToken, callbackFunc) {
    if (!authToken) return callbackFunc(null);
    let query = "SELECT user_id FROM User WHERE auth_token = ?";

    db.getPool().query(query, [authToken], function(err, rows) {
        if (err) {
            console.log("AUTHORIZATION GET ID BY AUTH TOKEN ERROR: \n" + err);
            return callbackFunc(null);
        } else if (rows.length < 1) {
            return callbackFunc(null);
        } else {
            return callbackFunc(rows[0]["user_id"]);
        }
    });
};

/**
 * Removes a users authToken
 * @param userId the user to remove the token from
 * @param callBackFunc a function to the put the result into
 */
exports.removeAuthTokenById = function(userId, callBackFunc) {
    let query = "UPDATE User SET auth_token = '' WHERE user_id = ?";

    db.getPool().query(query, userId, function(err, result) {
        if (err) {
            console.log("AUTHORIZATION REMOVE AUTH TOKEN BY ID ERROR: \n" + err);
            return callBackFunc(null, 500);
        } else if (result.affectedRows < 1) {
            return callBackFunc(null, 500);
        } else {
            return callBackFunc(true, 200);
        }
    });
};
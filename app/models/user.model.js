const db = require("../../config/db");
const responses = require("../util/util.responses");

exports.insert = function(userData, done) {
    let values = [[userData]]; //Might need double brackets
    let query = "INSERT INTO User (username, email, given_name, family_name, password) VALUES ?";
    db.getPool().query(query, values, function(err, result) {
        if (err) {
            console.log(err);
            done(null, responses._400);
        } else done(result.insertId, responses._201);
    });
};

exports.login = function(done) {
    return null;
};

exports.logout = function(done) {
    return null;
};

exports.getOneById = function(userId, done) {
    let query = "SELECT * FROM User WHERE user_id = ?";
    db.getPool().query(query, userId, function (err, rows) {
        if (err) {
            console.log(err);
            done(null, responses._500);
        }
        else if (rows.length < 1) done(null, responses._404);
        else done(rows[0], responses._200);
    });
}

exports.update = function(done) {
    return null;
};
const db = require("../../config/db");
const responses = require("../util/util.responses");

exports.insert = function(userData, done) {
    //TODO: Hash password
    let values = [userData]; //Might need double brackets

    db.getPool().query("INSERT INTO User VALUES ?", values, function(err, result) {
        if (err) done(err);
        else done(result);
    });
};

exports.login = function(done) {
    return null;
};

exports.logout = function(done) {
    return null;
};

exports.getOneById = function(userId, done) {
    db.getPool().query("SELECT * FROM User WHERE user_id = ?", userId, function (err, rows) {
        if (err) done(null, responses._500);
        else if (rows.length < 1) done(null, responses._404);
        else done(rows[0], responses._200);
    });
}

exports.update = function(done) {
    return null;
};
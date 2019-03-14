const db = require("../../config/db");
const responses = require("../util/util.responses");

exports.insert = function(userData, done) {
    let values = [[userData]]; //Might need double brackets
    let query = "INSERT INTO User (username, email, given_name, family_name, password) VALUES ?";
    db.getPool().query(query, values, function(err, result) {
        if (err) {
            console.log(err);
            done(null, responses._400);
        } else {
            done(result.insertId, responses._201);
        }
    });
};

exports.login = function(data, usingUsername, authToken, done) {
    let values = [authToken, data];
    let query = "UPDATE User SET auth_token = ? WHERE ";
    if (usingUsername) query += "username = ?";
    else query += "email = ?";
    // console.log("Query: " + query);
    // console.log(data);

    db.getPool().query(query, values, function(err, result) {
        if (err) {
            console.log(err);
            done(null, responses._400);
        } else if (result.affectedRows < 1) {
            console.log("No rows found");
            done(null, responses._400);
        } else {
            findByUsernameOrEmail(data, usingUsername, function(userId) {
                if (userId != null) {
                    done(userId, responses._200);
                } else {
                    done(null, responses._400);
                }
            });
        }
    })
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
        } else if (rows.length < 1) {
            done(null, responses._404);
        } else {
            done(rows[0], responses._200);
        }
    });
}

exports.update = function(done) {
    return null;
};

function findByUsernameOrEmail (data, usingUsername, done) {
    let query = "SELECT * FROM User WHERE ";
    if (usingUsername) query += "username = ?";
    else query += "email = ?";


    db.getPool().query(query, data, function (err, rows) {
        if (err) {
            console.log(err);
            done(null);
        } else if (rows.length < 1) {
            done(null);
        } else {
            done(rows[0].user_id);
        }
    })
}
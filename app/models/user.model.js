const db = require("../../config/db");
const responses = require("../util/util.responses");

exports.insert = function(userData, done) {
    let values = [[userData]]; //Might need double brackets
    let query = "INSERT INTO User (username, email, given_name, family_name, password) VALUES ?";
    db.getPool().query(query, values, function(err, result) {
        if (err) {
            console.log("USER INSERT ERROR: \n" + err);
            return done(null, responses._400);
        } else {
            // console.log("USER INSERT SUCCESS (result): " + result);
            // console.log("USER INSERT SUCCESS (result.insertId): " + result.insertId);
            return done(result.insertId, responses._201);
        }
    });
};

exports.login = function(data, usingUsername, authToken, password, done) {
    let values = [authToken, data];
    let query = "UPDATE User SET auth_token = ? WHERE ";
    if (usingUsername) query += "username = ?";
    else query += "email = ?";
    // console.log("Query: " + query);
    // console.log(data);

    db.getPool().query(query, values, function(err, result) {
        if (err) {
            console.log("USER LOGIN ERROR: \n" + err);
            return done(null, responses._400);
        } else if (result.affectedRows < 1) {
            return done(null, responses._400);
        } else {
            findByUsernameOrEmail(data, usingUsername, function(userId) {
                if (userId != null) {
                    checkPassword(userId, password, function(passwordGood) {
                        if (passwordGood) return done(userId, responses._200);
                        else return done(null, responses._400);
                    });
                } else {
                    return done(null, responses._400);
                }
            });
        }
    })
};

exports.getOneById = function(userId, done) {
    let query = "SELECT * FROM User WHERE user_id = ?";
    db.getPool().query(query, userId, function (err, rows) {
        if (err) {
            console.log("USER GET ONE BY ID ERROR: \n" + err);
            return done(null, responses._500);
        } else if (rows.length < 1) {
            return done(null, responses._404);
        } else {
            return done(rows[0], responses._200);
        }
    });
};

exports.update = function(userId, userData, done) {
    let values = [];
    let query = "UPDATE User SET ";

    if (userData.givenName) {
        values.push(userData.givenName);
        query += "given_name = ?";
    }

    if (userData.familyName) {
        values.push(userData.familyName);
        if (values.length > 1) query += ", ";
        query += "family_name = ?";
    }

    if (userData.password) {
        values.push(userData.password);
        if (values.length > 1 ) query += ", ";
        query += "password = ?";
    }

    query += " WHERE user_id = ?";
    values.push(userId);

    db.getPool().query(query, values, function(err, result) {
        if (err) {
            console.log("USER UPDATE/PATCH USER ERROR: \n" + err);
            return done(responses._500);
        } else if (result.affectedRows < 1) {
            return done(responses._500);
        } else {
            return done(responses._200);
        }
    });
};

function findByUsernameOrEmail (data, usingUsername, done) {
    let query = "SELECT * FROM User WHERE ";
    if (usingUsername) query += "username = ?";
    else query += "email = ?";

    db.getPool().query(query, data, function(err, rows) {
        if (err) {
            console.log("USER FIND BY USERNAME OR EMAIL ERROR: \n" + err);
            return done(null);
        } else if (rows.length < 1) {
            return done(null);
        } else {
            return done(rows[0].user_id);
        }
    })
}

function checkPassword (userId, password, done) {
    let query = "SELECT password FROM User WHERE user_id = ?";

    db.getPool().query(query, userId, function(err, rows) {
        if (err) {
            console.log("USER CHECK PASSWORD BY USERNAME OR EMAIL ERROR: \n" + err);
            return done(null);
        } else if (rows.length < 1) {
            return done(null);
        } else {
            return done(password === rows[0].password);
        }

    })
}
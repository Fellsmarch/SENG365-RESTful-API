const db = require("../../config/db");

/**
 * Inserts a new user into the database
 * @param userData the data for the new user
 * @param done callback function
 */
exports.insert = function(userData, done) {
    let values = [[userData]]; //Might need double brackets
    let query = "INSERT INTO User (username, email, given_name, family_name, password) VALUES ?";
    db.getPool().query(query, values, function(err, result) {
        if (err) {
            console.log("USER INSERT ERROR: \n" + err);
            return done(null, 400);
        } else {
            return done(result.insertId, 201);
        }
    });
};

/**
 * Logs in a user into the database by adding an authorization token to their user row
 * @param data Either a username or an email
 * @param usingUsername True if data is a username, false if it is an email
 * @param authToken The auth token to add to the user
 * @param password The user's password
 * @param done Callback function
 */
exports.login = function(data, usingUsername, authToken, password, done) {
    let values = [authToken, data];
    let query = "UPDATE User SET auth_token = ? WHERE ";
    if (usingUsername) query += "username = ?";
    else query += "email = ?";

    db.getPool().query(query, values, function(err, result) {
        if (err) {
            console.log("USER LOGIN ERROR: \n" + err);
            return done(null, 500);
        } else if (result.affectedRows < 1) {
            return done(null, 400);
        } else {
            findByUsernameOrEmail(data, usingUsername, function(userId) {
                if (userId != null) {
                    checkPassword(userId, password, function(passwordGood) {
                        if (passwordGood) return done(userId, 200);
                        else return done(null, 400);
                    });
                } else {
                    return done(null, 400);
                }
            });
        }
    })
};

/**
 * Gets user data from the database given a user id
 * @param userId The user to find
 * @param done Callback function
 */
exports.getOneById = function(userId, done) {
    let query = "SELECT * FROM User WHERE user_id = ?";
    db.getPool().query(query, userId, function (err, rows) {
        if (err) {
            console.log("USER GET ONE BY ID ERROR: \n" + err);
            return done(null, 500);
        } else if (rows.length < 1) {
            return done(null, 404);
        } else {
            return done(rows[0], 200);
        }
    });
};

/**
 * Updates a user given a user's id and new user data
 * @param userId The user id to change
 * @param userData The data to change
 * @param done Callback Function
 */
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
            return done(500);
        } else if (result.affectedRows < 1) {
            return done(500);
        } else {
            return done(200);
        }
    });
};

/**
 * Finds a user given their username or email
 * @param data Either a username or an email
 * @param usingUsername True if data is a username and false if it is an email
 * @param done Callback function, user id of found user is passed in
 */
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

/**
 * Checks a given password against a users password
 * @param userId The user's password to check against
 * @param password The password to check
 * @param done Callback function, with true passed in if the passwords match
 */
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


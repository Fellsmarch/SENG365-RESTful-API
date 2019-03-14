const User = require("../models/user.model");

exports.create = function(req, resp) {
    let username = req.body.username.toString();
    let email = req.body.email.toString();
    let givenName = req.body.givenName.toString();
    let familyName = req.body.familyName.toString();
    let password = req.body.password.toString();
    let userData = [username, email, givenName, familyName, password];

    User.insert(userData, function(result) {
        console.log("User.insert:\n" + result);""
        // resp.json(result);
    });
};

exports.login = function(req, resp) {
    return null;
};

exports.logout = function(req, resp) {
    return null;
};

exports.getById = function(req, resp) {
    let id = req.params.userId;
    User.getOneById(id, function(result, responseCode) {
        resp.status(responseCode);
        if (responseCode != 404) {
            resp.json(result);
        }
    });
};

exports.update = function(req, resp) {
    return null;
};
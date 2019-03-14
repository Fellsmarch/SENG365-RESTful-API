const User = require("../models/user.model");
const crypto = require("crypto");
const responses = require("../util/util.responses");

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
    // let reqAuth = req.header.
    User.getOneById(id, function(result, response) {
        if (result == null) {
            resp.status(response.responseCode).json(response.message);
        } else {
            let toSend = {username : result.username, email: result.email, givenName: result.given_name, familyName: result.family_name};
            // delete toSend.email;
            // console.log(crypto.randomBytes(16).toString("hex"));
            resp.status(response.responseCode).json(toSend);
        }
    });
};

exports.update = function(req, resp) {
    return null;
};
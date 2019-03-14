const User = require("../models/user.model");
const crypto = require("crypto");
const auth = require("../util/user.authChecker");

exports.create = function(req, resp) {
    let username = req.body.username.toString();
    let email = req.body.email.toString();
    let givenName = req.body.givenName.toString();
    let familyName = req.body.familyName.toString();
    let password = req.body.password.toString();

    let userData = [username, email, givenName, familyName, password];

    for (variable in userData) {
        if (variable == null || variable === "") {
            resp.status(400).json("'" + variable + "' is not valid input!");
        }
    }


    let hash = crypto.createHash("sha512");
    hash.update(password);
    let hashedPassword = hash.digest("hex");

    userData.pop();
    userData.push(hashedPassword);

    User.insert(userData, function(result, response) {
        if (result == null) {
            resp.status(response.responseCode).json(response.message);
        } else {
            console.log(result);
            resp.status(response.responseCode).json(result);
        }
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
    let requestingUser = auth.checkAuth(req.headers["x-authorization"]);

    User.getOneById(id, function(result, response) {
        if (result == null) {
            resp.status(response.responseCode).json(response.message);
        } else {
            let toSend = {username : result.username, email: result.email, givenName: result.given_name, familyName: result.family_name};
            if (requestingUser !== id || requestingUser == null) {
                delete toSend.email;
            }
            resp.status(response.responseCode).json(toSend);
        }
    });
};

exports.update = function(req, resp) {
    return null;
};
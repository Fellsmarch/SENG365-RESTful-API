const User = require("../models/user.model");
const crypto = require("crypto");
const auth = require("../util/user.authChecker");

exports.create = function(req, resp) {
    let userData = {
        username: req.body.username.toString(),
        email: req.body.email.toString(),
        givenName: req.body.givenName.toString(),
        familyName: req.body.familyName.toString()
    };

    let password = req.body.password.toString();

    for (variable in userData) {
        if (variable == null || variable === "") {
            resp.statusMessage = "Bad Request";
            resp.status(400);
            resp.json("'" + variable + "' is not valid input!");
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
    let id = Number(req.params.userId);
    // let requestingUser;
    // auth.checkAuth(req.headers["x-authorization"], function(userId) {
    //     requestingUser = userId;
    // });

    User.getOneById(id, function(result, response) {
        if (result == null) {
            resp.statusMessage = response.message;
            resp.status(response.responseCode);
            resp.json({});
        } else {
            let toSend = {
                username : result.username,
                email: result.email,
                givenName: result.given_name,
                familyName: result.family_name
            };
            auth.checkAuth(req.headers["x-authorization"], function(requestingUser) {
                if (requestingUser !== id || requestingUser == null) {
                    delete toSend.email;
                }
                resp.json(toSend);
            });
            resp.statusMessage = response.message;
            resp.status(response.responseCode);
        }
    });
};

exports.update = function(req, resp) {
    return null;
};
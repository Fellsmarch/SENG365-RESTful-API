const User = require("../models/user.model");
const crypto = require("crypto");
const auth = require("../util/user.authChecker");

exports.create = function(req, resp) {
    let userData = [
        req.body.username.toString(),
        req.body.email.toString(),
        req.body.givenName.toString(),
        req.body.familyName.toString()
    ];

    let password = req.body.password.toString();

    const values = Object.values(userData);
    for (const value of values) {
        if (value == null || value === "") {
            resp.statusMessage = "Bad Request";
            resp.status(400);
            resp.json("'" + value + "' is not valid input!");
        }
    }

    if (password == null || password === "") {
        resp.statusMessage = "Bad Request";
        resp.status(400);
        resp.json("Invalid password");
    }

    let hash = crypto.createHash("sha512");
    hash.update(password);
    password = hash.digest("hex");
    userData.push(password);

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
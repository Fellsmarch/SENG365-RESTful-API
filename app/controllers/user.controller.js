const User = require("../models/user.model");
const pass = require("../util/util.password");
const auth = require("../util/user.authChecker");
const check = require("../util/util.checking");
const crypto = require("crypto");

exports.create = function(req, resp) {
    let body = req.body;
    let userData = [
        body["username"],
        body["email"],
        body["givenName"],
        body["familyName"]
    ];

    // console.log("s" + userData[0] + "s");
    // let userData = [
    //     req.body.username.toString(),
    //     req.body.email.toString(),
    //     req.body.givenName.toString(),
    //     req.body.familyName.toString()
    // ];

    // let password = req.body.password.toString();
    let password = body["password"];

    // const values = Object.values(userData);
    // for (const value of values) {
    //     console.log(value);
    //     if (value == null || value === "") {
    //         resp.statusMessage = "Bad Request";
    //         resp.status(400);
    //         resp.json("'" + value + "' is not valid input!");
    //     }
    // }
    //
    // if (password == null || password === "") {
    //     resp.statusMessage = "Bad Request";
    //     resp.status(400);
    //     resp.json("Invalid password");
    // }

    // let hash = crypto.createHash("sha512");
    // hash.update(password);
    // password = hash.digest("hex");

    check.checkNotEmpty(userData.concat(password), function(errorsFound) {
        check.checkEmail(userData[1], function(emailErrors) {
            if (errorsFound || emailErrors) {
                resp.statusMessage = "Bad Request";
                resp.status(400);
                // resp.json("All required fields present: " + errorsFound + ". Email errors found: " + emailErrors);
                resp.json("Bad Request");
             } else {
                for (let i = 0; i < userData.length; i++) userData[i] = userData[i].toString();
                User.insert(userData.concat(pass.hashPassword(password)), function(result, response) { //Adding the hashed password here to avoid weird async errors
                    resp.statusMessage = response.message;
                    resp.status(response.responseCode)
                    if (result == null) {
                        resp.json(response.message);
                    } else {
                        resp.json(result);
                    }
                });
            }
        });
    });
};

exports.login = function(req, resp) {
    let authToken = crypto.randomBytes(16).toString("hex");

    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    let usernamePresent = check.checkPresent(username);
    let emailPresent = check.checkPresent(email);
    let data = null;
    let usingUsername = null;


    // console.log("Not username present: " + !usernamePresent);
    // console.log("Not email present: " + !emailPresent);
    // console.log("Bot not username present & not email present: " + (!usernamePresent && !emailPresent));
    // console.log("Password present: " + check.checkPresent(password));
    if ((!usernamePresent && !emailPresent) || !check.checkPresent(password)) {
        resp.statusMessage = "Bad Request";
        resp.status(400);
        resp.json("Bad Request");
    } else {
        if (usernamePresent) {
            data = username;
            usingUsername = true;
        } else {
            data = email;
            usingUsername = false;
        }

        User.login(data, usingUsername, authToken, function(result, response) {
            resp.statusMessage = response.message;
            resp.status(response.responseCode);
            if (result == null) {
                // resp.json("Error while performing SQL query")
                resp.json(response.message);
            } else {
                resp.json({
                    "userId": result.toString(),
                    "token": authToken
                });
            }
        });
    }
};

exports.logout = function(req, resp) {
    return null;
};

exports.getById = function(req, resp) {
    let id = Number(req.params.userId);

    User.getOneById(id, function(result, response) {
        resp.statusMessage = response.message;
        resp.status(response.responseCode);
        if (result == null) {
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
        }
    });
};

exports.update = function(req, resp) {
    return null;
};
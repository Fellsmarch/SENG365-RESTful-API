const User = require("../models/user.model");
const Pass = require("../util/util.password");
const Auth = require("../util/util.authorization");
const Check = require("../util/util.checking");
const Crypto = require("crypto");

/**
 * Registers a new user
 * @param req the request; containing the username, email, given name and family name of the new user
 * @param resp the response to the client; 201 & userId of created user if successful, 400 if unsuccessful
 */
exports.create = function(req, resp) {
    let body = req.body;
    let userData = [
        body["username"],
        body["email"],
        body["givenName"],
        body["familyName"]
    ];
    let password = body["password"];

    Check.checkNotEmpty(userData.concat(password), function(errorsFound) {
        Check.checkEmail(userData[1], function(emailErrors) {
            if (errorsFound || emailErrors) {
                resp.statusMessage = "Bad Request";
                resp.status(400);
                // resp.json("All required fields present: " + errorsFound + ". Email errors found: " + emailErrors);
                resp.json("Bad Request");
             } else {
                for (let i = 0; i < userData.length; i++) userData[i] = userData[i].toString();
                User.insert(userData.concat(Pass.hashPassword(password)), function(result, response) { //Adding the hashed password here to avoid weird async errors
                    resp.statusMessage = response.message;
                    resp.status(response.responseCode);
                    if (result == null) {
                        resp.json(response.message);
                    } else {
                        resp.json({
                            "userId": result
                        });
                    }
                });
            }
        });
    });
};

/**
 * Login an existing user
 * @param req the request; containing an authorization token in the header and a username and/or email and password
 * @param resp the response to the client; 200 if login successful with the logged in userId and a newly generated auth
 * token for that user; 400 if login unsuccessful
 */
exports.login = function(req, resp) {
    let authToken = Crypto.randomBytes(16).toString("hex");

    let username = req.body["username"];
    let email = req.body["email"];
    let password = req.body["password"];

    let data = null;
    let usingUsername = null;

    if((!username && !email) || !password) {
        resp.statusMessage = "Bad Request";
        resp.status(400);
        resp.json("Bad Request");
    } else {
        if (username) {
            data = username;
            usingUsername = true;
        } else {
            data = email;
            usingUsername = false;
        }

        User.login(data, usingUsername, authToken, Pass.hashPassword(password), function(result, response) {
            resp.statusMessage = response.message;
            resp.status(response.responseCode);
            if (result == null) {
                // resp.json("Error while performing SQL query")
                resp.json(response.message);
            } else {
                resp.json({
                    "userId": result,
                    "token": authToken
                });
            }
        });
    }
};

/**
 * Logout a user by authorization token
 * @param req the request; containing an authorization token in the header
 * @param resp the response to the client; 200 if logout successful; 401 if the request lacked a authorization token
 */
exports.logout = function(req, resp) {
    let authToken = req.headers["x-authorization"];

    if (authToken) {
        Auth.getIdByAuthToken(authToken, function(userId) {
           if (userId) {
                Auth.removeAuthTokenById(userId, function(result, response) {
                    resp.statusMessage = response.message;
                    resp.status(response.responseCode);
                    resp.json(response.message);
                });
           } else {
               resp.statusMessage = "Unauthorized";
               resp.status(401);
               resp.json("Unauthorized");
           }
        });
    } else {
        resp.statusMessage = "Unauthorized";
        resp.status(401);
        resp.json("Unauthorized");
    }
};

/**
 * Gets a user's data given their user id
 * @param req the request; with a user id parameter and possibly a authorization token in the header
 * @param resp the response; 200 if successful and containing username, email if the requesting user is the user requested,
 * given name and family name; 404 if the user is not found
 */
exports.getById = function(req, resp) {
    let id = Number(req.params.userId);

    User.getOneById(id, function(result, response) {
        resp.statusMessage = response.message;
        resp.status(response.responseCode);
        if (result == null) {
            resp.json({});
        } else {
            let toSend = {
                "username" : result.username,
                "email": result.email,
                "givenName": result.given_name,
                "familyName": result.family_name
            };
            Auth.getIdByAuthToken(req.headers["x-authorization"], function(requestingUser) {
                if (requestingUser !== id || requestingUser == null) {
                    delete toSend["email"];
                }
                resp.json(toSend);
            });
        }
    });
};

/**
 * Updates a given users details
 * @param req the request; should contain one or more of the following: given name, family name or password; also
 * contains user id parameter; authorization token in the header
 * @param resp the response; 200 if the update is completed and authorized; 400 if the data is missing something; 401
 * if there is not authorization token; 403 if the authorization token does not match the requested user; 404 if the user
 * is not found
 */
exports.update = function(req, resp) {
    let id = Number(req.params.userId);
    let authToken = req.headers["x-authorization"];
    let body = req.body;
    let userData = {
        givenName: body["givenName"],
        familyName: body["familyName"],
        password: body["password"]
    };

    if (userData.givenName === "" || userData.familyName === "" || typeof userData.password == "number" ||
        (!userData.givenName && !userData.familyName && !userData.password)) {
        resp.statusMessage = "Bad Request";
        resp.status(400);
        resp.json("Bad Request")
        return;
    }

    if (userData.password) {
        userData.password = Pass.hashPassword(userData.password);
    }

    User.getOneById(id, function(result, _) {
        if (result) {
            if (authToken) {
                Auth.getIdByAuthToken(authToken, function(requestingUser) {
                    if (requestingUser) {
                        if (id === requestingUser) {
                            User.update(id, userData, function(response) {
                                resp.statusMessage = response.message;
                                resp.status(response.responseCode);
                                resp.json(response.message);
                            });
                        } else {
                            resp.statusMessage = "Forbidden";
                            resp.status(403);
                            resp.json("Forbidden");
                        }
                    } else {
                        resp.statusMessage = "Internal Server Error";
                        resp.status(500);
                        resp.json("Internal Server Error");
                    }
                });
            } else {
                resp.statusMessage = "Unauthorized";
                resp.status(401);
                resp.json("Unauthorized")
            }
        } else {
            resp.statusMessage = "Not Found";
            resp.status(404);
            resp.json("Not Found");
        }
    });
};
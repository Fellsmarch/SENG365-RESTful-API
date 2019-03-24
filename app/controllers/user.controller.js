const User = require("../models/user.model");
const Pass = require("../util/util.password");
const Auth = require("../util/util.authorization");
const Check = require("../util/util.checking");
const Crypto = require("crypto");
const Responses = require("../util/util.responses");


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
                Responses.sendResponse(resp, 400);
            } else {
                for (let i = 0; i < userData.length; i++) userData[i] = userData[i].toString();
                User.insert(userData.concat(Pass.hashPassword(password)), function(result, response) { //Adding the hashed password here to avoid weird async errors
                    if (result == null) {
                        Responses.sendResponse(resp, response);
                    } else {
                        Responses.sendJsonResponse(resp, response, {"userId": result});
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
        Responses.sendResponse(resp, 400);
    } else {
        if (username) {
            data = username;
            usingUsername = true;
        } else {
            data = email;
            usingUsername = false;
        }

        User.login(data, usingUsername, authToken, Pass.hashPassword(password), function(result, response) {
            if (result == null) {
                Responses.sendResponse(resp, response);
            } else {
                Responses.sendJsonResponse(resp, response, {
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

    Auth.getIdByAuthToken(authToken, function(userId) {
       if (userId) {
            Auth.removeAuthTokenById(userId, function(result, response) {
                Responses.sendResponse(resp, response);
            });
       } else {
           Responses.sendResponse(resp, 401);
       }
    });
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
        if (result == null) {
            Responses.sendResponse(resp, response);
        } else {
            let toSend = {
                "username" : result["username"],
                "email": result["email"],
                "givenName": result["given_name"],
                "familyName": result["family_name"]
            };
            Auth.getIdByAuthToken(req.headers["x-authorization"], function(requestingUser) {
                if (requestingUser !== id || requestingUser == null) {
                    delete toSend["email"];
                }
                Responses.sendJsonResponse(resp, response, toSend);
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
        Responses.sendResponse(resp, 400);
    }

    if (userData.password) {
        userData.password = Pass.hashPassword(userData.password);
    }

    User.getOneById(id, function(result) {
        if (result) {
            Auth.getIdByAuthToken(authToken, function(requestingUser) {
                if (requestingUser) {
                    if (id === requestingUser) {
                        User.update(id, userData, function(response) {
                            Responses.sendResponse(resp, response);
                        });
                    } else {
                        Responses.sendResponse(resp, 403);
                    }
                } else {
                    Responses.sendResponse(resp, 401);
                }
            });
        } else {
            Responses.sendResponse(resp, 404);
        }
    });
};
const UserPhotos = require("../models/user.photos.model");
const Auth = require("../util/util.authorization");
const fs = require("fs");
const User = require("../models/user.model");
const photoDir = "app/photos/";
const Responses = require("../util/util.responses");
const Photos = require("../util/util.photos");

/**
 * Retrieves a stored user photo by retrieving the filename from the database and then reading the corresponding file
 * @param req The request; containing the userId of the user whose photo we will retrieve (as a parameter)
 * @param resp The response; 200 with the raw photo data if successful; 404 if the user or the photo filename was not
 * in the database
 */
exports.getUserPhoto = function(req, resp) {
    let userId = Number(req.params.userId);

    User.getOneById(userId, function(user, response) {
        if (!user) {
            resp.status(response.responseCode);
            resp.json(response.message);
        } else {
            let filename = user["profile_photo_filename"];
            if (!filename) {
                // Responses.sendResponse(resp, Responses._404);
                resp.status(404);
                resp.json("Not Found");
            } else {
                let suffix = filename.substring(filename.length - 3);
                let contentType;

                if (suffix === "png") {
                    contentType = "image/png";
                } else {
                    contentType = "image/jpeg";
                }

                fs.readFile(photoDir + filename, function(err, data) {
                    if (err) {
                        console.log("USER PHOTO GET USER PHOTO READ FILE ERROR:\n" + err);
                        resp.status(500);
                        resp.json("Internal Server Error");
                    } else {
                        resp.writeHead(200, {"Content-Type": contentType});
                        resp.write(data);
                        resp.end();
                    }
                });
            }

        }
    });
};

/**
 * Sets the given user's photo, either replacing the old one or just updating the user so the filename is present
 * @param req The request; containing the raw (binary) image data; the image type (jpeg/png) in the header; the authToken
 * in the header and the user's id to change in the parameters
 * @param resp The response; 200 if the user's photo was replaced successfully; 201 if the user's photo was not present
 * beforehand; 400 if the image was not present or the image type was incorrect/missing; 401 if the authToken was invalid
 * or not present; 403 if the authToken did not match the user we were trying to change and 404 if the user was not found
 */
exports.setUserPhoto = function(req, resp) {
    let imageData = req.body;
    let imageType = req.headers["content-type"];
    let authToken = req.headers["x-authorization"];
    let userId = Number(req.params.userId);

    if (imageData.length === 0) {
        resp.status(400);
        resp.json("Bad Request");
    } else {
        Auth.getIdByAuthToken(authToken, function(authorizedUser) {
            if (!authorizedUser) {
                resp.status(401);
                resp.json("Unauthorized");
            } else {
                User.getOneById(userId, function (rows, response) {
                    if (!rows) {
                        resp.status(response.responseCode);
                        resp.json(response.message);
                    } else {
                        if (authorizedUser !== userId) {
                            resp.status(403);
                            resp.json("Forbidden");
                        } else {
                            let filename = Photos.generateFilename();

                            if (imageType === "image/png" || imageType === "image/jpeg") {
                                if (imageType === "image/png") {
                                    filename += ".png";
                                } else {
                                    filename += ".jpg"
                                }
                                fs.writeFile(photoDir + filename, imageData, function(err) {
                                    if (err) {
                                        console.log("USER PHOTOS ERROR WRITING FILE:\n" + err);
                                    } else {
                                        UserPhotos.saveUserPhoto(filename, userId, function(response) {
                                            resp.status(response.responseCode);
                                            resp.json(response.message);
                                        });
                                    }
                                });
                            } else {
                                resp.status(400);
                                resp.json("Bad Request");
                            }
                        }
                    }
                });

            }
        });
    }
};

/**
 * Deletes a given user's photo from the database and files
 * @param req The request; containing the user id of the user to delete the photo from (as a parameter) and an authToken
 * which should match the user's id
 * @param resp The response; 200 if the photo was deleted successfully; 401 if the authToken is invalid or missing;
 * 403 if the authToken does not match the given user's authToken; 404 if the user is not found or the given user does
 * not have a photo
 */
exports.deleteUserPhoto = function(req, resp) {
    let authToken = req.headers["x-authorization"];
    let userId = Number(req.params.userId);

    Auth.getIdByAuthToken(authToken, function(authorizedId) {
       if (!authorizedId) {
           resp.status(401);
           resp.json("Unauthorized");
       } else {
           User.getOneById(userId, function (User, response) {
               if (!User) {
                   resp.status(response.responseCode);
                   resp.json(response.message);
               } else {
                   if (authorizedId !== userId) {
                       resp.status(403);
                       resp.json("Forbidden");
                   } else {
                       let filename = User["profile_photo_filename"];
                       if (filename == null) {
                           resp.status(404);
                           resp.json("Not Found");
                       } else {
                           UserPhotos.deleteUserPhoto(userId, function (response) {
                                fs.unlink(photoDir + filename, function(err) {
                                    if (err) {
                                        console.log("USER PHOTO ERROR DELETING FILE:\n" + err);
                                    } else {
                                        resp.status(response.responseCode);
                                        resp.json(response.message);
                                    }
                                });
                           });
                       }
                   }
               }
           });
       }
    });
};



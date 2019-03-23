const UserPhotos = require("../models/user.photos.model");
const Auth = require("../util/util.authorization");
const fs = require("fs");
const User = require("../models/user.model");
const photoDir = "app/photos/";
const Responses = require("../util/util.responses");
const Photos = require("../util/util.photos");

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



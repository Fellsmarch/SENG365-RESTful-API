const VenuePhoto = require("../models/venue.photos.model");
const Auth = require("../util/util.authorization");
const fs = require("fs");
const Photo = require("../util/util.photos");
const Response = require("../util/util.responses");
const photoDir = "app/photos/";


exports.addVenuePhoto = function(req, resp) {
    let venueId = Number(req.params.venueId);
    let authToken = req.headers["x-authorization"];
    let photoData = {
        photo: req.file.buffer,
        imageType: req.file.mimetype,
        description: req.body["description"],
        makePrimary: req.body["makePrimary"] === "true"
    };

    let errorFound = false;

    if (!(photoData.imageType === "image/png" || photoData.imageType === "image/jpeg")) {
        errorFound = true;
    }

    if (!photoData.description || typeof photoData.description != "string") {
        errorFound = true;
    }

    if (!(req.body["makePrimary"] === "false" || req.body["makePrimary"] === "true")) {
        errorFound = true;
    }

    if (errorFound) {
        Response.sendResponse(resp, 400);
        // resp.status(400);
        // resp.json("Bad Request");
    }

    Auth.getIdByAuthToken(authToken, function(authorizedId) {
        if (!authorizedId) {
            Response.sendResponse(resp, 401);
        } else {
            let filename = Photo.generateFilename();

            if (photoData.imageType === "image/png") {
                filename += ".png";
            } else {
                filename += ".jpg"
            }

            fs.writeFile(photoDir + filename, photoData.photo, function(err) {
                if (err) {
                    console.log("VENUE PHOTOS ERROR WRITING FILE:\n" + err);
                } else {
                    VenuePhoto.insertPhoto(venueId, authorizedId, photoData.description, photoData.makePrimary, filename, function (responseCode) {
                        Response.sendResponse(resp, responseCode);
                    });
                }
            });
        }
    });
};

exports.getVenuePhoto = function(req, resp) {
    let venueId = Number(req.params.venueId);
    let filename = req.params.photoFilename;

    VenuePhoto.getPhoto(venueId, filename, function(rows) {
        if (rows == null) {
            Response.sendResponse(resp, 500);
        } else if (rows.length < 1) {
            Response.sendResponse(resp, 404);
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
                    console.log("VENUE PHOTO GET USER PHOTO READ FILE ERROR:\n" + err);
                    Response.sendResponse(resp, 500)
                } else {
                    resp.writeHead(200, {"Content-Type": contentType});
                    resp.write(data);
                    resp.end();
                }
            });
        }
    });
};

exports.deleteVenuePhoto = function(req, resp) {
    let venueId = Number(req.params.venueId);
    let filename = req.params.photoFilename;
    let authToken = req.headers["x-authorization"];

    Auth.getIdByAuthToken(authToken, function(authorizedId) {
        if (!authorizedId) {
            Response.sendResponse(resp, 401);
        }

        VenuePhoto.getPhoto(venueId, filename, function(rows) {
            if (rows == null) {
                Response.sendResponse(resp, 500);
            } else if (rows.length < 1) {
                Response.sendResponse(resp, 404);
            } else {
                fs.unlink(photoDir + filename, function(err) {
                    if (err) {
                        console.log("VENUE PHOTOS ERROR DELETING FILE");
                    } else {
                        VenuePhoto.deletePhoto(venueId, filename, authorizedId, function(responseCode) {
                            Response.sendResponse(resp, responseCode);
                        });
                    }
                });
            }
        });
    });

};

exports.setPrimaryPhoto = function(req, resp) {
    let venueId = req.params.venueId;
    let filename = req.params.photoFilename;
    let authToken = req.headers["x-authorization"];

    Auth.getIdByAuthToken(authToken, function(authorizedId) {
        if (!authorizedId) {
            Response.sendResponse(resp, 401);
        }

        VenuePhoto.updatePrimaryPhoto(venueId, filename, authorizedId, function(responseCode) {
            Response.sendResponse(resp, responseCode);
        });
    });
};

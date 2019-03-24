const VenuePhoto = require("../models/venue.photos.model");
const Auth = require("../util/util.authorization");
const fs = require("fs");
const Photo = require("../util/util.photos");
const Response = require("../util/util.responses");
const photoDir = "app/photos/";

/**
 * Adds a photo to a given venue
 * @param req The request containing the id of the venue to add the photo to; an authToken of the user adding the photo;
 * the photo data: raw data of the image, the image type (png/jpeg), photo description, and whether to make the photo
 * the primary venue photo or not
 * @param resp The response; 201 if successful and the photo was added to the venue; 400 if the request data was missing
 * or invalid; 401 if the authToken is missing or invalid; 403 if the authToken matches a user that is not the venue admin;
 * 404 if the venue was not found in the database
 */
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

/**
 * Retrieves a specific photo of a venue
 * @param req The request containing the id of the venue and the photo's filename
 * @param resp The response; 200 is successful, containing the raw image data and the correct content type header
 * (jpeg/png); 404 if the venue is not found or there is not a photo matching that filename attached to the given venue
 */
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

/**
 * Deletes a given photo from a venue
 * @param req The request containing the id of the venue; the photo's filename and an authToken of the requesting user
 * @param resp The response; 200 if photo is deleted successfully; 401 if the authToken is invalid or missing; 403 if
 * the authToken matches a user that is not the venue's admin; 404 if the venue is not found or there is not a photo
 * filename associated the venue that matches the given filename
 */
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

/**
 * Sets the photo of a venue to be the primary photo of that venue
 * @param req The request containing the id of the venue; the filename of the photo to make primary; the authToken of the
 * requesting user
 * @param resp The response; 200 if the primary photo is changed successfully; 401 if the authToken is invalid or missing;
 * 403 if the authToken matches a user that is not the admin of the venue; 404 if the venue is not found or if the photo
 * with the given filename is not associated with the venue
 */
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

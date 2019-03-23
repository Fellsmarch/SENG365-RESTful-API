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
    resp.send();
};

exports.deleteVenuePhoto = function(req, resp) {
    resp.send();
};

exports.setPrimaryPhoto = function(req, resp) {
    resp.send();
};

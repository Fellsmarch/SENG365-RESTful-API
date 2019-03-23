const Venue = require("../models/venue.model");
const Auth = require("../util/util.authorization");

/**
 * Gets a list of venues that match the given search criteria
 * @param req
 * @param resp
 */
exports.getVenues = function(req, resp) {
    //TODO: Still need to get photos filename
    //TODO: Change it so latitude/longitude can be 0
    let reqData = {
        startIndex: req.query["startIndex"] || 0,
        count: req.query["count"],
        city: req.query["city"],
        searchTerm: req.query["q"],
        categoryId: req.query["categoryId"],
        minStarRating: req.query["minStarRating"],
        maxCostRating: req.query["maxCostRating"],
        adminId: req.query["adminId"],
        sortBy: req.query["sortBy"] || "STAR_RATING",
        reverseSort: req.query["reverseSort"] || false,
        myLatitude: req.query["myLatitude"],
        myLongitude: req.query["myLongitude"]
    };

    // console.log(req.query);

    //Start checking
    let errorFound = false;

    //Check if sortBy is one of the available values
    if (reqData.sortBy && !(["STAR_RATING", "COST_RATING", "DISTANCE"].includes(reqData.sortBy))) {
        // console.log("Sort by error");
        errorFound = true;
    }

    //Check if sortBy is "DISTANCE" that both myLatitude & myLongitude are present
    if (reqData.sortBy === "DISTANCE") {
        if (!reqData.myLatitude || !reqData.myLongitude) {
            // console.log("SortBy is DISTANCE but either latitude or longitude are missing");
            errorFound = true;
        }
    }

    if (reqData.minStarRating > 5 || reqData.minStarRating < 1) {
        errorFound = true;
    }

    if (reqData.maxCostRating > 4 || reqData.maxCostRating < 0) {
        errorFound = true;
    }

    //Check that if either myLatitude or myLongitude is present, the other is also
    if ((reqData.myLongitude && !reqData.myLatitude) || (reqData.myLatitude && !reqData.myLongitude)) {
        // console.log("Either latitude or longitude is present and the other is missing");
        errorFound = true;
    }

    if (!reqData.myLatitude) reqData.myLatitude = 0;
    if (!reqData.myLongitude) reqData.myLongitude = 0;

    if (errorFound) {
        // console.log("error found");
        resp.statusMessage = "Bad Request";
        resp.status(400);
        resp.json("Bad Request");
    } else {
        Venue.getMany(reqData, function(results) {
            if (results != null) {
                let toSend = [];
                for (let i = 0; i < results.length; i++) {
                    let row = results[i];
                    let newObject = {
                        "venueId": row.venue_id,
                        "venueName": row.venue_name,
                        "categoryId": row.category_id,
                        "city": row.city,
                        "shortDescription": row.short_description,
                        "latitude": row.latitude,
                        "longitude": row.longitude,
                        "meanStarRating": row.average_star_rating,
                        "modeCostRating": row.mode_cost_rating,
                        "primaryPhoto": null,
                        "distance": row.distance
                    };

                    //TODO: What if they put in 0?
                    if (!(reqData.myLatitude && reqData.myLongitude)) {
                        delete newObject["distance"];
                    }
                    toSend.push(newObject);
                }

                if (reqData.reverseSort) toSend = toSend.reverse();
                if ((reqData.count || reqData.count === 0) && !reqData.startIndex) {
                    toSend = toSend.slice(0, reqData.count);
                } else if ((reqData.count || reqData.count === 0) && reqData.startIndex) {
                    // console.log(reqData.startIndex);
                    // console.log(reqData.startIndex + reqData.count);
                    toSend = toSend.slice(reqData.startIndex, Number(reqData.startIndex) + Number(reqData.count));
                } else if (!(reqData.count || reqData.count === 0) && reqData.startIndex) {
                    toSend = toSend.slice(reqData.startIndex);
                }


                // console.log(toSend);

                resp.status(200);
                resp.json(toSend);
            } else {
                resp.statusMessage = "Bad Request";
                resp.status(400);
                resp.json("Bad Request");
            }
        });
    }
};

exports.addVenue = function(req, resp) {
    let newVenue = {
        venueName: req.body["venueName"],
        categoryId: req.body["categoryId"],
        city: req.body["city"],
        shortDescription: req.body["shortDescription"],
        longDescription: req.body["longDescription"],
        address: req.body["address"],
        latitude: req.body["latitude"],
        longitude: req.body["longitude"]
    };
    let authToken = req.headers["x-authorization"];
    let errorFound = false;

    if (!newVenue.venueName || !newVenue.categoryId || !newVenue.city
        || !newVenue.address || !newVenue.latitude || !newVenue.latitude) {
        errorFound = true;
    }

    if (newVenue.latitude < -90 || newVenue.latitude > 90) {
        errorFound = true;
    }

    if (newVenue.longitude < -180 || newVenue.longitude > 180) {
        errorFound = true;
    }

    if (errorFound) {
        resp.status(400);
        resp.json("Bad Request");
    } else {
        Auth.getIdByAuthToken(authToken, function(adminId) {
            if (!adminId) {
                resp.status(401);
                resp.json("Unauthorized");
            } else {
                Venue.insert(newVenue, adminId, function(result, response) {
                    resp.status(response.responseCode);
                    if (!result) {
                        resp.json(response.message);
                    } else {
                        resp.json({
                            "venueId": result
                        });
                    }
                });
            }
        });
    }



};

exports.getVenueById = function(req, resp) {
    let venueId = Number(req.params.venueId);

    Venue.getOne(venueId, function(result, response) {
        resp.statusMessage = response.message;
        resp.status(response.responseCode);
        // console.log(response);
        if (!result) {
            resp.json(response.message);
        } else {
            // console.log(result);
            let toSend = {
                "venueName": result.venueRows[0]["venue_name"],
                "admin": {
                    "userId": result.adminRows[0]["user_id"],
                    "username": result.adminRows[0]["username"]},
                "category": {
                    "categoryId": result.categoryRows[0]["category_id"],
                    "categoryName": result.categoryRows[0]["category_name"],
                    "categoryDescription": result.categoryRows[0]["category_description"]},
                "city": result.venueRows[0]["city"],
                "shortDescription": result.venueRows[0]["short_description"],
                "longDescription": result.venueRows[0]["long_description"],
                "dateAdded": result.venueRows[0]["date_added"],
                "address": result.venueRows[0]["address"],
                "latitude": result.venueRows[0]["latitude"],
                "longitude": result.venueRows[0]["longitude"],
                "photos": []
            };

            for (let i = 0; i < result.photoRows.length; i++) {
                let toAdd = {
                    "photoFilename": result.photoRows[i]["photo_filename"],
                    "photoDescription": result.photoRows[i]["photo_description"],
                    "isPrimary": (result.photoRows[i]["is_primary"] === 1)
                };
                toSend.photos.push(toAdd);
            }
            resp.json(toSend);
        }
    });

};

exports.editVenue = function(req, resp) {
    let authToken = req.headers["x-authorization"];
    let venueId = req.params.venueId;

    let venueData = {
        venueName: req.body["venueName"],
        categoryId: req.body["categoryId"],
        city: req.body["city"],
        shortDescription: req.body["shortDescription"],
        longDescription: req.body["longDescription"],
        address: req.body["address"],
        latitude: req.body["latitude"],
        longitude: req.body["longitude"]
    };

    // console.log(venueData);

    Auth.getIdByAuthToken(authToken, function(adminId) {
        if (!adminId) {
            resp.status(401);
            resp.json("Unauthorized");
        } else {
            let changesFound = false;
            for (let key in venueData) {
                if (venueData[key]) {
                    changesFound = true;
                }
            }

            if (!changesFound || (venueData.latitude && (venueData.latitude < -90 || venueData.latitude > 90)) ||
                (venueData.longitude && (venueData.longitude < -180 || venueData.longitude > 180))) {
                resp.status(400);
                resp.json("Bad Request");
            } else {
                Venue.update(venueId, adminId, venueData, function (response) {
                    resp.status(response.responseCode);
                    resp.json(response.message);
                });
            }
        }
    });
};

exports.getCategories = function(req, resp) {
    Venue.getCategories(function(result) {
        let toReturn = [];

        for (let i = 0; i < result.length; i++) {
            toReturn.push({
                "categoryId": result[i]["category_id"],
                "categoryName": result[i]["category_name"],
                "categoryDescription": result[i]["category_description"]
            });
        }
        resp.statusMessage = "OK";
        resp.status(200);
        resp.send(toReturn);
    });
};
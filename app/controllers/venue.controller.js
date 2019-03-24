const Venue = require("../models/venue.model");
const Auth = require("../util/util.authorization");
const Responses = require("../util/util.responses");


/**
 * Gets a list of venues that match the given search criteria
 * @param req The request; containing startIndex: index to start returning results from; count: the total number of
 * results to return; city: only return venues in this city; searchTerm: only return venues with the searchTerm in their
 * title; categoryId: only return venues with this categoryId; minStarRating: only return venues that have at least this
 * average star rating; maxCostRating: only return venues that have at most this (mode) cost rating; adminId: only return
 * venues whose adminId matches this; sortBy: the property to sort by; reverseSort: whether to return the result in reverse;
 * myLatitude & myLongitude: the requester's latitude and longitude
 * @param resp The response; 200 with the requested formatted results if no errors found and 400 if required request data
 * is missing or invalid
 */
exports.getVenues = function(req, resp) {
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

    //Start checking
    let errorFound = false;

    //Check if sortBy is one of the available values
    if (reqData.sortBy && !(["STAR_RATING", "COST_RATING", "DISTANCE"].includes(reqData.sortBy))) {
        errorFound = true;
    }

    //Check if sortBy is "DISTANCE" that both myLatitude & myLongitude are present
    if (reqData.sortBy === "DISTANCE") {
        if ((!reqData.myLatitude && reqData.myLatitude !== 0) || (!reqData.myLongitude && reqData.myLongitude !== 0)) {
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
    if (reqData.myLongitude && (!reqData.myLatitude && reqData.myLatitude !== 0)) {
        errorFound = true;
    }
    if (reqData.myLatitude && (!reqData.myLongitude && reqData.myLongitude !== 0)) {
        errorFound = true;
    }

    if (errorFound) {
        Responses.sendResponse(resp, 400);
    } else {
        Venue.getMany(reqData, function(results) {
            if (results != null) {
                let toSend = [];

                for (let i = 0; i < results.length; i++) {
                    let row = results[i];
                    let newObject = {
                        "venueId": row["venue_id"],
                        "venueName": row["venue_name"],
                        "categoryId": row["category_id"],
                        "city": row["city"],
                        "shortDescription": row["short_description"],
                        "latitude": row["latitude"],
                        "longitude": row["longitude"],
                        "meanStarRating": row["average_star_rating"],
                        "modeCostRating": row["mode_cost_rating"],
                        "primaryPhoto": row["photo_filename"],
                        "distance": row["distance"]
                    };

                    if (!((reqData.myLatitude || reqData.myLatitude === 0) &&
                            (reqData.myLongitude || reqData.myLongitude ===0))) {
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

                Responses.sendJsonResponse(resp, 200, toSend);
            } else {
                Responses.sendResponse(resp, 400);
            }
        });
    }
};

/**
 * Adds a new venue to the database
 * @param req The request containing the venue name; categoryId of the category of the venue; the city the venue is
 * located in; short & long descriptions of the venue; address of the venue; latitude and longitude of the venue and
 * the authToken of the user that is creating the venue
 * @param resp The response; 201 if the venue was successfully created; 400 if required request data was missing or request
 * data was invalid and 401 if the authToken is missing or invalid
 */
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
        Responses.sendResponse(resp, 400);
    } else {
        Auth.getIdByAuthToken(authToken, function(adminId) {
            if (!adminId) {
                Responses.sendResponse(resp, 401);
            } else {
                Venue.insert(newVenue, adminId, function(result, response) {
                    if (!result) {
                        Responses.sendResponse(resp, response);
                    } else {
                        Responses.sendJsonResponse(resp, response, {"venueId": result});
                    }
                });
            }
        });
    }
};

/**
 * Gets a single venue by venue id
 * @param req The request containing the venue id to return as a parameter
 * @param resp The response; 200 if successful with all the information about the requested venue and 404 if the venue id
 * does not match a venue in the database
 */
exports.getVenueById = function(req, resp) {
    let venueId = Number(req.params.venueId);

    Venue.getOne(venueId, function(result, response) {
        if (!result) {
            Responses.sendResponse(resp, response);
        } else {
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
            Responses.sendJsonResponse(resp, response, toSend);
        }
    });
};

/**
 * Changes a venues details
 * @param req The request containing the venue id to change; an authToken representing the editing user; and the data to
 * change: the new venue name, the new category id, the new city the venue is in, the new short/long description, the
 * address or the new latitude/longitude
 * @param resp The response; 200 if the changes were successful; 400 if the request data was invalid; 401 if the authToken
 * was invalid or missing; 403 if the authToken matches a user that is not the venue admin; 404 if the venue was not found
 * in the database
 */
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

    Auth.getIdByAuthToken(authToken, function(adminId) {
        if (!adminId) {
            Responses.sendResponse(resp, 401);
        } else {
            let changesFound = false;
            for (let key in venueData) {
                if (venueData[key]) {
                    changesFound = true;
                }
            }

            if (!changesFound || (venueData.latitude && (venueData.latitude < -90 || venueData.latitude > 90)) ||
                (venueData.longitude && (venueData.longitude < -180 || venueData.longitude > 180))) {
                Responses.sendResponse(resp, 400);
            } else {
                Venue.update(venueId, adminId, venueData, function (response) {
                    Responses.sendResponse(resp, response);
                });
            }
        }
    });
};

/**
 * Retrieves all information about all venue categories
 * @param req The request containing nothing
 * @param resp The response; 200 if successful, containing all the information
 */
exports.getCategories = function(req, resp) {
    Venue.getCategories(function(result) {
        let toSend = [];

        for (let i = 0; i < result.length; i++) {
            toSend.push({
                "categoryId": result[i]["category_id"],
                "categoryName": result[i]["category_name"],
                "categoryDescription": result[i]["category_description"]
            });
        }
        Responses.sendJsonResponse(resp, 200, toSend);
    });
};
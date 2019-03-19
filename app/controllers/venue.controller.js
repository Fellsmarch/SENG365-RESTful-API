const Venue = require("../models/venue.model");

exports.getVenues = function(req, resp) {
    //TODO: Still need to get photos filename
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
        console.log("Sort by error");
        errorFound = true;
    }

    //Check if sortBy is "DISTANCE" that both myLatitude & myLongitude are present
    if (reqData.sortBy === "DISTANCE") {
        if (!reqData.myLatitude || !reqData.myLongitude) {
            console.log("SortBy is DISTANCE but either latitude or longitude are missing");
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
        console.log("Either latitude or longitude is present and the other is missing");
        errorFound = true;
    }

    if (!reqData.myLatitude) reqData.myLatitude = 0;
    if (!reqData.myLongitude) reqData.myLongitude = 0;

    if (errorFound) {
        console.log("error found");
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


                console.log(toSend);

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
    resp.send();
};

exports.getVenueById = function(req, resp) {
    let venueId = Number(req.params.venueId);

    Venue.getOne(venueId, function(result, response) {
        resp.statusMessage = response.message;
        resp.status(response.responseCode);
        console.log(response);
        if (!result) {
            resp.json(response.message);
        } else {
            console.log(result);
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
    resp.send();
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
const Venue = require("../models/venue.model");

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
                        "primaryPhoto": "HELLO TEST SERVER",
                        "distance": row.distance
                    };

                    if (!(reqData.myLatitude && reqData.myLongitude)) {
                        delete newObject["distance"];
                    }
                    toSend.push(newObject);
                }

                if (reqData.count || reqData.count === 0) toSend = toSend.slice(0, reqData.count);
                if (reqData.reverseSort) toSend = toSend.reverse();

                console.log(toSend);

                throw toSend;
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
    resp.send();
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
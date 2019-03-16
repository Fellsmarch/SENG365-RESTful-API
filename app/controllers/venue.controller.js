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

    //Start checking
    let errorFound = false;

    //Check if sortBy is one of the available values
    if (!["STAR_RATING", "COST_RATING", "DISTANCE"].includes(reqData.sortBy)) errorFound = true;

    //Check if sortBy is "STAR_RATING" that both myLatitude & myLongitude are present
    if (!(reqData.sortBy === "STAR_RATING" && reqData.myLatitude && reqData.myLongitude)) errorFound = true;

    //Check that if either myLatitude or myLongitude is present, the other is also
    if ((reqData.myLongitude && !reqData.myLatitude) || (reqData.myLatitude && !reqData.myLongitude)) errorFound = true;

    if (errorFound) {
        resp.statusMessage = "Bad Request";
        resp.status(400);
        resp.json("Bad Request");
    } else {

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
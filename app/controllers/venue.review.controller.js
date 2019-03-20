const Review = require("../models/venue.review.model");
const Auth = require("../util/util.authorization");

exports.getVenueReviews = function(req, resp) {
    let venueId = req.params.venueId;

    Review.getManyByVenueId(venueId, function(result, response) {
        resp.status(response.responseCode);
        if (!result) {
            resp.json(response.message);
        } else {

            //TODO: Map result to correct json parameters
        }
    });
    resp.send();
};

exports.addReview = function(req, resp) {
    resp.send();
};

exports.getUsersReviews = function(req, resp) {
    resp.send();
};
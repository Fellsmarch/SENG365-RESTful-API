const Review = require("../models/venue.review.model");
const Auth = require("../util/util.authorization");

exports.getVenueReviews = function(req, resp) {
    let venueId = req.params.venueId;

    Review.getManyByVenueId(venueId, function(result, response) {
        resp.status(response.responseCode);
        if (!result) {
            resp.json(response.message);
        } else {
            let toSend = [];
            for (let i = 0; i < result.length; i++) {
                let row = result[i];
                let newObject = {
                    "reviewAuthor": {
                        "userId": row["user_id"],
                        "username": row["username"]},
                    "reviewBody": row["review_body"],
                    "starRating": row["star_rating"],
                    "costRating": row["cost_rating"],
                    "timePosted": row["time_posted"]
                };
                toSend.push(newObject);
            }
            resp.json(toSend);
        }
    });
};

exports.addReview = function(req, resp) {
    resp.send();
};

exports.getUsersReviews = function(req, resp) {
    resp.send();
};
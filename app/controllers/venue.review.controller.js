const Review = require("../models/venue.review.model");
const Auth = require("../util/util.authorization");

/**
 * Gets all of a venue's reviews
 * @param req The request containing the venue's id as a parameter
 * @param resp The response; 200 with the review information if successful; 404 if the venue was not found or if the venue
 * has no reviews
 */
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

/**
 * Adds a review to the venue
 * @param req The request containing the venue's id to add the review to; an authToken of the user creating the review
 *  and the review information
 * @param resp The response; 201 if the review was successfully created; 400 if the review's information was invalid;
 * 401 if the authToken is invalid or missing; 403 if the user has reviewed the venue before or if they are admin of the
 * venue; 404 if the venue was not in the database
 */
exports.addReview = function(req, resp) {
    let venueId = req.params.venueId;
    let authToken = req.headers["x-authorization"];

    let reviewData = {
        body: req.body["reviewBody"],
        starRating: req.body["starRating"],
        costRating: req.body["costRating"]
    };

    let errorsFound = false;

    if (!reviewData.body || !reviewData.starRating || (!reviewData.costRating && reviewData.costRating !== 0)) {
        // console.log("ADD REVIEW FOUND MISSING DATA ERROR: ");
        // console.log(reviewData);
        errorsFound = true;
    }

    if (reviewData.starRating < 1 || reviewData.starRating > 5) {
        // console.log("ADD REVIEW STAR RATING OUT OF BOUNDS ERROR: " + reviewData.starRating);
        errorsFound = true;
    }

    if (reviewData.costRating < 0 || reviewData.costRating > 4) {
        // console.log("ADD REVIEW COST RATING OUT OF BOUNDS ERROR: " + reviewData.costRating);
        errorsFound = true;
    }

    if (!Number.isInteger(reviewData.starRating) || !Number.isInteger(reviewData.costRating)) {
        // console.log("ADD REVIEW STAR/COST RATING NOT AN INTEGER ERROR: " + reviewData.starRating + "/" + reviewData.costRating);
        errorsFound = true;
    }

    if (errorsFound) {
        resp.status(400);
        resp.json("Bad Request");
    } else {
        Auth.getIdByAuthToken(authToken, function(adminId) {
            if (!adminId) {
                resp.status(401);
                resp.json("Unauthorized");
            } else {
                Review.insert(venueId, adminId, reviewData, function(response) {
                    resp.status(response.responseCode);
                    resp.json(response.message);
                });
            }
        });
    }
};

/**
 * Gets all of a user's reviews
 * @param req The request containing the user id as a parameter and an authToken of the requesting user
 * @param resp The response; 200 with all the user's review data is successful; 401 if the requesting user is not the
 * user requesting reviews from; 404 if the user was not in the database
 */
exports.getUsersReviews = function(req, resp) {
    //TODO: Add actual get for primary photo filename
    let userId = req.params.userId;
    let authToken = req.headers["x-authorization"];

    Auth.getIdByAuthToken(authToken, function(loggedInUserId) {
        if (!loggedInUserId) {
            resp.status(401);
            resp.json("Unauthorized");
        } else {
            Review.getManyByUserId(userId, function(result, response) {
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
                            "timePosted": row["time_posted"],
                            "venue": {
                                "venueId": row["venue_id"],
                                "venueName": row["venue_name"],
                                "categoryName": row["category_name"],
                                "city": row["city"],
                                "shortDescription": row["short_description"],
                                "primaryPhoto": null
                            }
                        };
                        toSend.push(newObject);
                    }
                    resp.json(toSend);
                }
            });
        }
    });
};
const Review = require("../models/venue.review.model");
const Auth = require("../util/util.authorization");
const Responses = require("../util/util.responses");


/**
 * Gets all of a venue's reviews
 * @param req The request containing the venue's id as a parameter
 * @param resp The response; 200 with the review information if successful; 404 if the venue was not found or if the venue
 * has no reviews
 */
exports.getVenueReviews = function(req, resp) {
    let venueId = req.params.venueId;

    Review.getManyByVenueId(venueId, function(result, response) {
        if (!result) {
            Responses.sendResponse(resp, response);
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
            Responses.sendJsonResponse(resp, response, toSend);
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
        errorsFound = true;
    }

    if (reviewData.starRating < 1 || reviewData.starRating > 5) {
        errorsFound = true;
    }

    if (reviewData.costRating < 0 || reviewData.costRating > 4) {
        errorsFound = true;
    }

    if (!Number.isInteger(reviewData.starRating) || !Number.isInteger(reviewData.costRating)) {
        errorsFound = true;
    }

    if (errorsFound) {
        Responses.sendResponse(resp, 400);
    } else {
        Auth.getIdByAuthToken(authToken, function(adminId) {
            if (!adminId) {
                Responses.sendResponse(resp, 401);
            } else {
                Review.insert(venueId, adminId, reviewData, function(response) {
                    Responses.sendResponse(resp, response);
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
    let userId = req.params.userId;
    let authToken = req.headers["x-authorization"];

    Auth.getIdByAuthToken(authToken, function(loggedInUserId) {
        if (!loggedInUserId) {
            Responses.sendResponse(resp, 401);
        } else {
            Review.getManyByUserId(userId, function(result, response) {
                if (!result) {
                    Responses.sendResponse(resp, response);
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
                                "primaryPhoto": row["photo_filename"]
                            }
                        };
                        toSend.push(newObject);
                    }
                    Responses.sendJsonResponse(resp, response, toSend);
                }
            });
        }
    });
};
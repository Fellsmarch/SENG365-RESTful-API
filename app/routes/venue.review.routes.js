const review = require("../controllers/venue.review.controller");

module.exports = function(app) {
    app.route(app.rootUrl + "/venues/:venueId/reviews")
        .get(review.getVenueReviews)
        .patch(review.addReview);

    app.route(app.rootUrl + "/users/:userId/reviews")
        .get(review.getUsersReviews);
};


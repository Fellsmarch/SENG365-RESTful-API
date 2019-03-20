const db = require("../../config/db");
const responses = require("../util/util.responses");

exports.getManyByVenueId = function(venueId, done) {
    let query = "SELECT user_id, username, review_body, star_rating, cost_rating, time_posted FROM Review" +
        "JOIN User ON user_id = review_author_id" +
        "WHERE reviewed_venue_id = ?";

    db.getPool().query(query, venueId, function(err, rows) {
       if (err) {
           console.log("REVIEWS GET MAN BY VENUE ID ERROR:\n" + err);
           done(null, responses._500);
       } else if (rows.length < 1) {
           done(null, responses._404);
       } else {
           done(rows, responses._200);
       }
    });


};

exports.insert = function(done) {
    return null;
};

exports.getManyByUserId = function(done) {
    return null;
};


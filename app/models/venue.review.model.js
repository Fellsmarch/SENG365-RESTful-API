const db = require("../../config/db");

/**
 * Retrieves all reviews of a venue by venue id
 * @param venueId The id of the venue
 * @param done The callback function
 */
exports.getManyByVenueId = function(venueId, done) {
    let query = "SELECT user_id, username, review_body, star_rating, cost_rating, time_posted FROM Review " +
        "JOIN User ON user_id = review_author_id " +
        "WHERE reviewed_venue_id = ? " +
        "ORDER BY time_posted DESC";

    db.getPool().query(query, venueId, function(err, rows) {
       if (err) {
           console.log("REVIEWS GET MANY BY VENUE ID ERROR:\n" + err);
           return done(null, 500);
       } else if (rows.length < 1) {
           return done(null, 404);
       } else {
           return done(rows, 200);
       }
    });
};

/**
 * Insert a new review for the venue
 * @param venueId The id of the venue to add the review to
 * @param adminId The user trying to add a new review to the venue (cannot be the admin of the venue)
 * @param reviewData The information about the review
 * @param done The callback function
 */
exports.insert = function(venueId, adminId, reviewData, done) {
    let adminCheckQuery = "SELECT admin_id FROM Venue WHERE venue_id = ?";
    let authorCheckQuery = "SELECT * FROM Review WHERE reviewed_venue_id = ? AND review_author_id = ?";
    let insertQuery = "INSERT INTO Review " +
        "(reviewed_venue_id, review_author_id, review_body, star_rating, cost_rating, time_posted) " +
        "VALUES ?";
    let date = new Date();

    let values = [
        venueId,
        adminId,
        reviewData.body,
        reviewData.starRating,
        reviewData.costRating,
        date
    ];

    db.getPool().query(adminCheckQuery, venueId, function(adminErr, adminRows) {
        if (adminErr) {
            console.log("REVIEW INSERT ADMIN CHECK QUERY ERROR:\n" + adminErr);
            return done(500);
        } else if (adminRows.length >= 1 && adminRows[0]["admin_id"] === adminId) {
            return done(403);
        } else {
            db.getPool().query(authorCheckQuery, [venueId, adminId], function(authorErr, authorRows) {
               if (authorErr) {
                   console.log("REVIEW INSERT AUTHOR CHECK ERROR:\n" + authorErr);
                   return done(500);
               } else if (authorRows.length >= 1) {
                   return done(403);
               } else {
                   db.getPool().query(insertQuery, [[values]], function(insertErr) {
                      if (insertErr) {
                          if (insertErr.code === "ER_NO_REFERENCED_ROW_2" || insertErr.code === "ER_NO_REFERENCED_ROW") {
                              return done(404);
                          }
                          console.log("REVIEW INSERT ERROR:\n" + insertErr);
                          return done(500);
                      } else {
                          return done(201);
                      }
                   });
               }
            });
        }
    });
};

/**
 * Retrieves all of a user's reviews
 * @param userId The id of the user
 * @param done The callback function
 */
exports.getManyByUserId = function(userId, done) {
    let query = "SELECT * FROM Review " +
        "JOIN User ON user_id = review_author_id " +
        "JOIN Venue V ON reviewed_venue_id = V.venue_id " +
        "JOIN VenuePhoto VP ON VP.venue_id = V.venue_id " +
        "WHERE user_id = ? " +
        "ORDER BY time_posted DESC";

    db.getPool().query(query, userId, function(err, rows) {
        if (err) {
            console.log("REVIEWS GET MANY BY USER ID ERROR:\n" + err);
            return done(null, 500);
        } else if (rows.length < 1) {
            return done(null, 404);
        } else {
            return done(rows, 200);
        }
    });
};


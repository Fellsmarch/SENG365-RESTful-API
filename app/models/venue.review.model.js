const db = require("../../config/db");
const responses = require("../util/util.responses");

exports.getManyByVenueId = function(venueId, done) {
    let query = "SELECT user_id, username, review_body, star_rating, cost_rating, time_posted FROM Review " +
        "JOIN User ON user_id = review_author_id " +
        "WHERE reviewed_venue_id = ? " +
        "ORDER BY time_posted DESC";

    db.getPool().query(query, venueId, function(err, rows) {
       if (err) {
           console.log("REVIEWS GET MANY BY VENUE ID ERROR:\n" + err);
           return done(null, responses._500);
       } else if (rows.length < 1) {
           return done(null, responses._404);
       } else {
           return done(rows, responses._200);
       }
    });
};

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
            return done(responses._500);
        } else if (adminRows.length >= 1 && adminRows[0]["admin_id"] === adminId) {
            return done(responses._403);
        } else {
            db.getPool().query(authorCheckQuery, [venueId, adminId], function(authorErr, authorRows) {
               if (authorErr) {
                   console.log("REVIEW INSERT AUTHOR CHECK ERROR:\n" + authorErr);
                   console.log("QUERY: " + authorErr.sql);
                   return done(responses._500);
               } else if (authorRows.length >= 1) {
                   return done(responses._403);
               } else {
                   db.getPool().query(insertQuery, [[values]], function(insertErr, insertResult) {
                      if (insertErr) {
                          if (insertErr.code === "ER_NO_REFERENCED_ROW_2" || insertErr.code === "ER_NO_REFERENCED_ROW") {
                              return done(responses._404);
                          }
                          console.log("REVIEW INSERT ERROR:\n" + insertErr);
                          return done(responses._500);
                      } else {
                          return done(responses._201);
                      }
                   });
               }
            });
        }
    });
};

exports.getManyByUserId = function(userId, done) {
    //TODO: Add actual get for primary photo filename
    let query = "SELECT * FROM Review " +
        "JOIN User ON user_id = review_author_id " +
        "JOIN Venue ON reviewed_venue_id = venue_id " +
        "WHERE user_id = ? " +
        "ORDER BY time_posted DESC";

    db.getPool().query(query, userId, function(err, rows) {
        if (err) {
            console.log("REVIEWS GET MANY BY USER ID ERROR:\n" + err);
            return done(null, responses._500);
        } else if (rows.length < 1) {
            return done(null, responses._404);
        } else {
            return done(rows, responses._200);
        }
    });
};


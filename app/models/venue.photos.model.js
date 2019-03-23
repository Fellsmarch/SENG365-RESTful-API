const db = require("../../config/db");
const responses = require("../util/util.responses");

exports.insertPhoto = function(venueId, authorizedId, description, makePrimary, filename, done) {
    let getQuery = "SELECT admin_id FROM Venue WHERE venue_id = ?";
    let updateQuery = "UPDATE VenuePhoto SET is_primary = 0 WHERE is_primary = 1";
    let insertQuery = "INSERT INTO VenuePhoto () VALUES ?";
    let values = [venueId, filename, description];

    if (makePrimary) {
        values.push(1);
    } else {
        values.push(0);
    }

    db.getPool().query(getQuery, venueId, function(getErr, getRows) {
        if (getErr) {
            console.log("VENUE PHOTOS INSERT PHOTO GET QUERY ERROR:\n" + getErr);
            return done(500);
        } else if (getRows.length < 1) {
            return done(404);
        } else {
            if (getRows[0]["admin_id"] !== authorizedId) {
                return done(403);
            }

            if (makePrimary) {
                db.getPool().query(updateQuery, function(updateErr) {
                    if (updateErr) {
                        console.log("VENUE PHOTOS INSERT PHOTO UPDATE QUERY ERROR:\n" + updateErr);
                        return done(500);
                    }
                });
            }

            db.getPool().query(insertQuery, [[values]], function(insertErr, result) {
                if (insertErr) {
                    console.log("VENUE PHOTOS INSERT PHOTO INSET QUERY ERROR:\n" + insertErr);
                    return done(500);
                } else if (result.rowsAffected < 1) {
                    return done(500);
                } else {
                    return done(201);
                }
            });
        }
    })
};

exports.getPhoto = function(done) {
    return null;
};

exports.deletePhoto = function(done) {
    return null;
};

exports.updatePrimaryPhoto = function(done) {
    return null;
};
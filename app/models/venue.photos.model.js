const db = require("../../config/db");
const responses = require("../util/util.responses");

/**
 * Inserts a photo for a venue into the database
 * @param venueId The id of the venue to associate the photo with
 * @param authorizedId The id of the user requesting to insert (needs to be the admin of the venue)
 * @param description The photo description
 * @param makePrimary True if the photo should be the primary photo, false if not
 * @param filename The file name of the photo
 * @param done The callback function
 */
exports.insertPhoto = function(venueId, authorizedId, description, makePrimary, filename, done) {
    let getQuery = "SELECT admin_id FROM Venue WHERE venue_id = ?";
    let updateQuery = "UPDATE VenuePhoto SET is_primary = 0 WHERE is_primary = 1";
    let insertQuery = "INSERT INTO VenuePhoto (venue_id, photo_filename, photo_description, is_primary) VALUES ?";
    let primaryQuery = "SELECT * FROM VenuePhoto WHERE venue_id = ?";
    let values = [venueId, filename, description];
    let firstPrimary = false;

    db.getPool().query(primaryQuery, venueId, function(primaryErr, primaryRows) {
        if (primaryErr) {
            console.log("VENUE PHOTOS INSERT PHOTO PRIMARY PHOTO QUERY ERROR:\n" + primaryErr);
            return done(500);
        } else if (primaryRows.length < 1) {
            firstPrimary = true;
        }

        if (makePrimary || firstPrimary) {
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
                        } else {
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
                    });
                } else {
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
            }
        });
    });
};

/**
 * Gets a venue's photo from the database
 * @param venueId The id of the associated venue
 * @param filename The filename of the photo to retrieve
 * @param done The callback function
 */
exports.getPhoto = function(venueId, filename, done) {
    let query = "SELECT * FROM VenuePhoto WHERE venue_id = ? AND photo_filename = ?";

    db.getPool().query(query, [venueId, filename], function(err, rows) {
        if (err) {
            console.log("VENUE PHOTOS GET PHOTO ERROR:\n" + err);
            return done(null);
        } else {
            return done(rows);
        }
    })
};

/**
 * Deletes a venue photo from the database
 * @param venueId The id of the associated venue
 * @param filename The filename of the photo
 * @param adminId The id of the user trying to delete the photo (must match the admin_id of the venue)
 * @param done The callback function
 */
exports.deletePhoto = function(venueId, filename, adminId, done) {
    let adminQuery = "SELECT admin_id FROM Venue WHERE venue_id = ?";
    let deleteQuery = "DELETE FROM VenuePhoto WHERE venue_id = ? AND photo_filename = ?";

    db.getPool().query(adminQuery, venueId, function(adminErr, adminRows) {
        if (adminErr) {
            console.log("VENUE PHOTOS DELETE PHOTO GET ADMIN ERROR:\n" + adminErr);
            return done(500);
        } else if (adminRows[0]["admin_id"] !== adminId) {
            return done(403);
        } else {
            db.getPool().query(deleteQuery, [venueId, filename], function(deleteErr, deleteResult) {
               if (deleteErr) {
                   console.log("VENUE PHOTOS DELETE PHOTO DELETE ERROR:\n" + deleteErr);
                   done(500);
               } else {
                   done(200);
               }
            });
        }
    });
};

/**
 * Changes the primary photo of a venue
 * @param venueId The id of the venue
 * @param filename The filename of the photo to make primary
 * @param adminId The user trying to change the primary photo (must be the same as the admin of the venue)
 * @param done The callback function
 */
exports.updatePrimaryPhoto = function(venueId, filename, adminId, done) {
    let adminQuery = "SELECT admin_id FROM Venue WHERE venue_id = ?";
    let updateQuery = "UPDATE VenuePhoto SET is_primary = 0 WHERE is_primary = 1";
    let setPrimaryQuery = "UPDATE VenuePhoto SET is_primary = 1 WHERE venue_id = ? AND photo_filename = ?";

    db.getPool().query(adminQuery, venueId, function(adminErr, adminRows) {
        if (adminErr) {
            console.log("VENUE PHOTOS UPDATE PRIMARY PHOTO GET ADMIN ERROR:\n" + adminErr);
            return done(500);
        } else if (adminRows[0]["admin_id"] !== adminId) {
            return done(403);
        } else {
            db.getPool().query(updateQuery, function(updateErr) {
                if (updateErr) {
                    console.log("VENUE PHOTOS UPDATE PRIMARY PHOTO UPDATE QUERY ERROR:\n" + updateErr);
                    return done(500);
                } else {
                    db.getPool().query(setPrimaryQuery, [venueId, filename], function(setErr, setResult) {
                        if (setErr) {
                            console.log("VENUE PHOTOS UPDATE PRIMARY PHOTO SET QUERY ERROR:\n" + setErr);
                            return done(500);
                        } else if (setResult.rowsAffected < 1) {
                            return done(500);
                        } else {
                            return done(200);
                        }
                    });
                }
            });
        }
    });
};
const db = require("../../config/db");
const responses = require("../util/util.responses");

/**
 * Changes a user's photo or puts a photo into that user's row
 * @param filename The filename of the photo
 * @param userId The user to add the photo to
 * @param done The callback function
 */
exports.saveUserPhoto = function(filename, userId, done) {
    let existingPhotoQuery = "SELECT profile_photo_filename AS photo FROM User WHERE user_id = ?";
    let existingPhoto;
    let updateQuery = "UPDATE User SET profile_photo_filename = ? WHERE user_id = ?";

    db.getPool().query(existingPhotoQuery, userId, function(err, rows) {
        if (err) {
            console.log("USER PHOTO SAVE USER PHOTO CHECK PHOTO FILENAME EXISTS ERROR:\n" + err);
            return done(responses._500);
        } else if (rows.length < 1) {
            return done(responses._400);
        } else {
            existingPhoto = rows[0]["photo"] != null;

            db.getPool().query(updateQuery, [filename, userId], function(err, result) {
                if (err) {
                    console.log("USER PHOTO SAVE USER PHOTO UPDATE PHOTO FILENAME ERROR:\n" + err);
                    return done(responses._500);
                } else if (existingPhoto) {
                    return done(responses._200);
                } else {
                    return done(responses._201);
                }
            });
        }
    });
};

/**
 * Deletes a user's photo from their row
 * @param userId The id of the user to delete the photo from
 * @param done The callback function
 */
exports.deleteUserPhoto = function(userId, done) {
    let query = "UPDATE User SET profile_photo_filename = NULL WHERE user_id = ?";

    db.getPool().query(query, userId, function(err, result) {
        if (err) {
            console.log("USER PHOTO DELETE USER PHOTO ERROR:\n" + err);
            return done(responses._500);
        } else {
            return done(responses._200);
        }
    });
};

const db = require("../../config/db");
const responses = require("../util/util.responses");

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

exports.deleteUserPhoto = function(userId, done) {
    let query = "UPDATE User SET profile_photo_filename = NULL WHERE user_id = ?";

    db.getPool().query(query, userId, function(err, result) {
        if (err) {
            console.log("USER PHOTO DELETE USER PHOTO ERROR:\n" + err);
            done(responses._500);
        } else {
            done(responses._200);
        }
    });
};

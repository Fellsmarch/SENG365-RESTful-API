const db = require("../../config/db");
const responses = require("../util/util.responses");

exports.getMany = function(params, done) {

};

exports.insert = function(done) {
    return null;
};

exports.getOne = function(done) {
    return null;
};

exports.update = function(done) {
    return null;
};

exports.getCategories = function(done) {
    let query = "SELECT * FROM VenueCategory";

    db.getPool().query(query, function(err, rows) {
        if(err) {
            console.log("VENUES GET CATEGORIES ERROR: \n" + err);
            return done(null);
        } else if (rows.length < 1) {
            return done(null);
        } else {
            return done(rows);
        }
    });
};

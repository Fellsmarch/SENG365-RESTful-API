const db = require("../../config/db");
const responses = require("../util/util.responses");

exports.getMany = function(params, done) {
    //TODO: Still need to get photos filename
    let values = [];
    let distance = "(6371 * acos (" +
        "cos(radians(" + params.myLatitude + "))" +
        "* cos(radians(V.latitude))" +
        "* cos(radians(V.longitude) - radians(" + params.myLongitude + "))" +
        "+ sin(radians(" + params.myLatitude + "))" +
        "* sin(radians(V.latitude))" +
        ") ) AS distance ";
    let modeQuery = "(SELECT venue_id as m_venue_id, max(mode_cost_rating) as mode_cost_rating " +
                        "FROM ModeCostRating " +
                        "GROUP BY venue_id) ";
    let averagesQuery = "(SELECT venue_id as r_venue_id, AVG(star_rating) AS average_star_rating, mode_cost_rating " +
                        "FROM Venue " +
                        "JOIN Review ON venue_id = reviewed_venue_id " +
                        "JOIN " + modeQuery + "M ON venue_id = m_venue_id " +
                        "GROUP BY venue_id)";
    let query = "SELECT *, "  + distance + "FROM Venue V LEFT JOIN " + averagesQuery + " R ON venue_id = r_venue_id";

    if (params.city) {
        values.push(params.city);
        if (values.length === 1) query += " WHERE ";
        if (values.length > 1) query += " AND ";
        query += "V.city = ?";
    }
    if (params.searchTerm) {
        values.push("%" + params.searchTerm + "%");
        if (values.length === 1) query += " WHERE ";
        if (values.length > 1) query += " AND ";
        query += "V.venue_name LIKE ?";
    }
    if (params.categoryId) {
        values.push(params.categoryId);
        if (values.length === 1) query += " WHERE ";
        if (values.length > 1) query += " AND ";
        query += "V.category_id = ?";
    }
    if (params.minStarRating) {
        values.push(params.minStarRating);
        if (values.length === 1) query += " WHERE ";
        if (values.length > 1) query += " AND ";
        query += "R.average_star_rating >= ?";
    }
    if (params.maxCostRating) {
        values.push(params.maxCostRating);
        if (values.length === 1) query += " WHERE ";
        if (values.length > 1) query += " AND ";
        query += "R.mode_cost_rating <= ?";
    }
    if (params.adminId) {
        values.push(params.adminId);
        if (values.length === 1) query += " WHERE ";
        if (values.length > 1) query += " AND ";
        query += "V.admin_id = ?";
    }
    if (params.sortBy === "STAR_RATING") query += " ORDER BY R.average_star_rating DESC";
    else if (params.sortBy === "COST_RATING") query += " ORDER BY R.mode_cost_rating ASC";
    else if (params.sortBy === "DISTANCE") query += " ORDER BY distance ASC";


    db.getPool().query(query, values, function(err, rows) {
        if (err) {
            console.log("VENUE GET MANY VENUES ERROR: \n" + err);
            done(null);
        } else {
            done(rows);
        }
    });
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

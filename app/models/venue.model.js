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
            return done(null);
        } else {
            return done(rows);
        }
    });
};

exports.insert = function(venueData, adminId, done) {
    let date = new Date().toJSON().slice(0, 10);
    let values = [
        adminId,
        venueData.categoryId,
        venueData.venueName,
        venueData.city,
        date,
        venueData.address,
        venueData.latitude,
        venueData.longitude
    ];

    let columns = "(admin_id, category_id, venue_name, city, date_added, address, latitude, longitude";

    if (venueData.shortDescription) {
        values.push(venueData.shortDescription);
        columns += ", short_description";
    }
    if (venueData.longDescription) {
        values.push(venueData.longDescription);
        columns += ", long_description";
    }
    columns += ")";

    let query = "INSERT INTO Venue " + columns + " VALUES ?";
    console.log(query);

    db.getPool().query(query, [[values]], function(err, result) {
       if (err) {
           if (err.code === "ER_NO_REFERENCED_ROW_2") {
               console.log("VENUE INSERT ERROR CATEGORY ID DOESN'T REFERENCE CORRECTLY");
               done(null, responses._400);
           } else {
               console.log("VENUE INSERT ERROR:\n" + err);
               done(null, responses._500);
           }
       } else {
           done(result.insertId, responses._201);
       }
    });
};

exports.getOne = function(venueId, done) {
    let venueQuery = "SELECT * FROM Venue WHERE venue_id = ?";
    let adminQuery = "SELECT user_id, username FROM User WHERE user_id = ?";
    let categoryQuery = "SELECT * FROM VenueCategory WHERE category_id = ?";
    let photosQuery = "SELECT * FROM VenuePhoto WHERE venue_id = ?";

    db.getPool().query(venueQuery, venueId, function(venueErr, venueRows) {
        if (venueErr) {
            console.log("VENUE GET ONE ERROR (VENUE QUERY)\n" + venueErr);
            return done(null, responses._500);
        } else if (venueRows.length < 1) {
            console.log("VENUE GET ONE ERROR: VENUE NOT FOUND ERROR");
            return done(null, responses._404);
        } else {
            // console.log(venueRows);
            db.getPool().query(adminQuery, venueRows[0]["venue_id"], function(adminErr, adminRows) {
                if (adminErr) {
                    console.log("VENUE GET ONE ERROR (ADMIN QUERY)\n" + adminErr);
                    return done(null, responses._500);
                } else if (adminRows.length < 1) {
                    console.log("VENUE GET ONE ERROR: ADMIN/USER NOT FOUND ERROR");
                    return done(null, responses._404);
                } else {
                    db.getPool().query(categoryQuery, venueRows[0]["category_id"], function(categoryErr, categoryRows) {
                        if (categoryErr) {
                            console.log("VENUE GET ONE ERROR (CATEGORY QUERY)\n" + categoryErr);
                            return done(null, responses._500);
                        } else if (categoryRows.length < 1) {
                            console.log("VENUE GET ONE ERROR: CATEGORY NOT FOUND ERROR");
                            return done(null, responses._404);
                        } else {
                            db.getPool().query(photosQuery, venueRows[0]["venue_id"], function(photoErr, photoRows) {
                                if (photoErr) {
                                    console.log("VENUE GET ONE ERROR (PHOTO QUERY)\n" + photoErr);
                                    return done(null, responses._500);
                                } else {
                                    let toReturn = {
                                        venueRows: venueRows,
                                        adminRows: adminRows,
                                        categoryRows: categoryRows,
                                        photoRows: photoRows
                                    };
                                    return done(toReturn, responses._200);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
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

const db = require("../../config/db");

exports.insert = function(userData, done) {
    //TODO: Hash password
    let values = [userData]; //Might need double brackets

    db.getPool().query("INSERT INTO User VALUES ?", values, function(err, result) {
        if (err) return done(err);
        else return done(result);
    });
};

exports.login = function(done) {
    return null;
};

exports.logout = function(done) {
  return null;
};

exports.getOneById = function(userId, done) {
    return null;
};

exports.update = function(done) {
    return null;
};
const UserPhotos = require("../models/user.photos.model");
const Auth = require("../util/util.authorization");
const fs = require("fs");

exports.getUserPhoto = function(req, resp) {
    resp.send();

    // res.writeHead(200, {"Content-Type": "image/jpeg"});
    // res.write(result, 'binary');
    // res.end();
};

exports.setUserPhoto = function(req, resp) {
    resp.send();
};

exports.deleteUserPhoto = function(req, resp) {
    resp.send();
};

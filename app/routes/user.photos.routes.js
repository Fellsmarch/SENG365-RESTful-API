const userPhotos = require("../controllers/user.photos.controller");

module.exports = function(app) {
    app.route(app.rootUrl + "/users/:userId/photo")
        .get(userPhotos.getUserPhoto)
        .put(userPhotos.setUserPhoto)
        .delete(userPhotos.deleteUserPhoto);
};
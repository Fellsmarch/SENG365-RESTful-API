const venuePhotos = require("../controllers/venue.photos.controller");

module.exports = function(app) {
    app.route(app.rootUrl + "/venues/:venueId/photos")
        .post(venuePhotos.addVenuePhoto);

    app.route(app.rootUrl + "/venues/:venueId/photos/:photoFilename")
        .get(venuePhotos.getVenuePhoto)
        .delete(venuePhotos.deleteVenuePhoto);

    app.route(app.rootUrl + "/venues/:venueId/photos/:photoFilename/setPrimary")
        .post(venuePhotos.setPrimaryPhoto);
};
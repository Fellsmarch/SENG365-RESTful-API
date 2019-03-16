const venue = require("../controllers/venue.controller");

module.exports = function(app) {
    app.route(app.rootUrl + "/venues")
        .get(venue.getVenues)
        .post(venue.addVenue);

    app.route(app.rootUrl + "/venues/:userId")
        .get(venue.getVenueById)
        .patch(venue.editVenue);

    app.route(app.rootUrl + "/categories")
        .get(venue.getCategories);
};
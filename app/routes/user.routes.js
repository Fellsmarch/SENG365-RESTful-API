const user = require("../controllers/user.controller");

module.exports = function (app) {
    app.route(app.rootUrl + "/users")
        .post(user.create);

    app.route(app.rootUrl + "/users/login")
        .post(user.login);

    app.route(app.rootUrl + "/users/logout")
        .post(user.logout);

    app.route(app.rootUrl + "/users/:userId")
        .get(user.getById)
        .patch(user.update);
}
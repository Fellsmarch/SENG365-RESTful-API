const express = require('express');
const bodyParser = require('body-parser');
const fs = require("fs");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const allowCrossOriginRequests = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
};

module.exports = function () {
    const app = express();
    app.rootUrl = '/api/v1';

    // MIDDLEWARE
    app.use(allowCrossOriginRequests);
    app.use(bodyParser.json());
    app.use(bodyParser.raw({ type: 'text/plain' }));  // for the /executeSql endpoint
    app.use(bodyParser.raw({ type: 'image/jpeg'}));
    app.use(bodyParser.raw({ type: 'image/png'}));
    app.use(bodyParser.urlencoded({extended : true}));
    app.use(upload.single('photo'));

    // ROUTES
    require('../app/routes/backdoor.routes')(app);
    require("../app/routes/user.routes")(app);
    require("../app/routes/venue.routes")(app);
    require("../app/routes/venue.review.routes")(app);
    require("../app/routes/user.photos.routes")(app);
    require("../app/routes/venue.photos.routes")(app);

    //Creates the app/photos folder if it does not exist
    if (!fs.existsSync('app/photos')) {
        fs.mkdir('app/photos', {recursive: true }, (err) => {
            if (err) {
                console.log("ERROR CREATING APP/PHOTOS DIRECTORY");
            }
        });
    }

    return app;
};

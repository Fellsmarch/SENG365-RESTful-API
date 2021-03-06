//100

//200
exports._200 = {responseCode: 200, message: "OK"};
exports._201 = {responseCode: 201, message: "Created"};

//300

//400
exports._400 = {responseCode: 400, message: "Bad Request"};
exports._401 = {responseCode: 401, message: "Unauthorized"};
exports._403 = {responseCode: 403, message: "Forbidden"};
exports._404 = {responseCode: 404, message: "Not Found"};

//500
exports._500 = {responseCode: 500, message: "Internal Server Error"};

exports.sendResponse = function(resp, responseCode) {
    if (!resp.headersSent) {
        resp.sendStatus(responseCode);
        resp.end();
    }
};

exports.sendJsonResponse = function(resp, responseCode, json) {
    if (!resp.headersSent) {
        resp.status(responseCode);
        resp.json(json);
        resp.end();
    }
};
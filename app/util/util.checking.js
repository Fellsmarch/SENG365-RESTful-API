
exports.checkNotEmpty = function(list, callbackFunc) {
    let foundErrors = false;
    for (let i = 0; i < list.length; i++) {
        if (!list[i]) {
            foundErrors = true;
        }
    }
    return callbackFunc(foundErrors);
};

exports.checkPresent = function(item) {
    return item !== "" && item != null;
};

exports.checkEmail = function(email, callbackFunc) {
    let regEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return callbackFunc(!regEx.test(email));
};


const HTTP_STATUS_OK = 200;
const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_FORBIDDEN = 403;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

const success = function (message = "Success!", data = {}, extraData = {}) {
    return {
        status: HTTP_STATUS_OK,
        message,
        data,
        ...extraData
    }
}
const notFound = function (message = "Not found!") {
    return {
        status: HTTP_STATUS_NOT_FOUND,
        message
    }
}
const unauthorized = function (message = "unauthorized") {
    return {
        status: HTTP_STATUS_UNAUTHORIZED,
        message
    }
}
const forbidden = function (message = "forbidden") {
    return {
        status: HTTP_STATUS_FORBIDDEN,
        message
    }
}
const internalServerError = function (message = "Internal server error!") {
    return {
        status: HTTP_STATUS_INTERNAL_SERVER_ERROR,
        message
    }
}
const badRequest = function (message = "Bas Request!") {
    return {
        status: HTTP_STATUS_BAD_REQUEST,
        message
    }
}

module.exports = {
    HTTP_STATUS_OK,
    HTTP_STATUS_BAD_REQUEST,
    HTTP_STATUS_UNAUTHORIZED,
    HTTP_STATUS_FORBIDDEN,
    HTTP_STATUS_NOT_FOUND,
    HTTP_STATUS_INTERNAL_SERVER_ERROR,
    success,
    unauthorized,
    internalServerError,
    badRequest,
    forbidden,
    notFound
}
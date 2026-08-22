function successResponse(data, message = 'Operation successful') {
    return {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
    };
}

function errorResponse(message, code = 10000) {
    return {
        success: false,
        error: { code, message },
        timestamp: new Date().toISOString(),
    };
}

module.exports = { successResponse, errorResponse };

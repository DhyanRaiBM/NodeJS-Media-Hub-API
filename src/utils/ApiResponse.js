class ApiResponse {
    constructor(
        statusCode,//<400 because >400 is handled in ApiError
        message = "Success",//success because failures are handled in ApiError
        data = {},//Response data
    ) {

        this.statusCode = statusCode;//usually <400
        this.message = message;
        this.data = data;
        this.success = statusCode < 400;//true if <400

    }
}

export { ApiResponse };
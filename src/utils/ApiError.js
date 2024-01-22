class ApiError extends Error {
    constructor(
        statusCode,//usually >400 because of an error
        message = "Something went wrong",//has a default message
        errors = [],//an array of errors
        stack = ""//usually empty initially
    ) {
        super(message);//Calls the super class constructor(Error) to initialize the main properties of the current instance
        this.statusCode = statusCode;//usually >400 because of an error
        this.data = null;//null because of an error
        this.success = false;//false because of an error
        this.errors = errors;//an array of errors

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);//Creates a .stack property on targetObject, which when accessed returns a string representing the location in the code at which Error.captureStackTrace() was called.
        }
    }
}

export { ApiError }
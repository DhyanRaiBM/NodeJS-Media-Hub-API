import { ApiResponse } from "../utils/ApiResponse.js";

// Define your error middleware
export const errorMiddleware = (err, req, res, next) => {

    console.log(err);
    res
        .status(err.statusCode || 400)
        .json(
            new ApiResponse(err.statusCode || 400, err.message)
        )

};

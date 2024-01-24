//-Two production level Approach :

//-Approach 1 -Using Promise :
export const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch(err => next(err));//if there is an error pass the control to the next middleware that accepts errors
    }
}




//-Approach 2 - Using Try catch :
// const asyncHandler = (requestHandler) => {
//     return async (req, res, next) => {
//         try {
//             asyncHandler(req, res, next);
//         } catch (error) {
//             res.status(error.code || 500);
//             res.json({
//                 success: false,
//                 message: error.message
//             })
//         }
//     }
// }
import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

//~Create tweet :
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    console.log(req.body);

    if (!content)
        throw new ApiError(400, "Tweet content is required")

    const tweet = await Tweet.create({
        content,
        owner: req?.user?._id
    })

    if (!tweet)
        throw new ApiError(500, "Failed to save tweet")

    res
        .status(200)
        .json(
            new ApiResponse(200, "Tweet Pubished successfully", tweet)
        )

})

//~Get user tweets:
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId)
        throw new ApiError(400, "UserId is required")

    const tweets = await Tweet.find({ owner: userId });

    if (!tweets)
        throw new ApiError(500, "Something went wrong while fetching tweets")

    res
        .status(200)
        .json(
            new ApiResponse(200, "Tweets fetched successfully", tweets)
        )

})

//~Update tweet :
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { newContent } = req.body;

    if (!tweetId)
        throw new ApiError(400, "Could not find tweetId");

    if (!newContent)
        throw new ApiError(400, "Content is required");

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            content: newContent
        },
        {
            new: true
        }
    )

    if (!updatedTweet)
        throw new ApiError(500, "Something went wrong while updating tweet");

    res
        .status(200)
        .json(
            new ApiResponse(200, "Tweet updated sucessfully", updatedTweet)
        )


})

//~Delete tweet :
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId)
        throw new ApiError(400, "Could not find tweetId");

    const reponse = await Tweet.findOneAndDelete(tweetId);

    if (!reponse)
        throw new ApiError(400, "Failed to delete tweet");

    res
        .status(200)
        .json(
            new ApiResponse(200, "Tweet deleted successfully", {})
        )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
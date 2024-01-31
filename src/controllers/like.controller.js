import mongoose from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

//~Toggle Video Like:
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId)
        throw new ApiError("VideoId is required");

    let like;
    let dislike;

    const videoLiked = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    console.log(videoLiked);

    if (videoLiked) {
        dislike = await Like.deleteOne({
            video: videoId,
            likedBy: req.user._id
        })

        if (!dislike)
            throw new ApiError("Failed to dislike video")
    } else {
        like = await Like.create({
            video: videoId,
            likedBy: req.user._id
        })

        if (!like)
            throw new ApiError("Failed to like video")
    }
    console.log(like);
    console.log(dislike);
    res
        .status(200)
        .json(
            new ApiResponse(200, `Video ${like ? "liked" : "disliked"} Succcessfully`)
        )

})

//~Toggle Comment Like :
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId)
        throw new ApiError("CommentId is required");

    let like;
    let dislike;

    const commentLiked = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if (commentLiked) {
        dislike = await Like.deleteOne({
            comment: commentId,
            likedBy: req.user._id
        })

        if (!dislike)
            throw new ApiError("Failed to dislike comment")
    } else {
        like = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })

        if (!like)
            throw new ApiError("Failed to like comment")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, `Comment ${like ? "liked" : "disliked"} Succcessfully`)
        )


})

//~Toggle Tweet Like :
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!tweetId)
        throw new ApiError("TweetId is required");

    let like;
    let dislike;

    const tweetLiked = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if (tweetLiked) {
        dislike = await Like.deleteOne({
            tweet: tweetId,
            likedBy: req.user._id
        })

        if (!dislike)
            throw new ApiError("Failed to dislike tweet")
    } else {
        like = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })

        if (!like)
            throw new ApiError("Failed to like tweet")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, `Tweet ${like ? "liked" : "disliked"} Succcessfully`)
        )


}
)

//~Get Liked Videos :
const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req?.user?._id;

    const videos = await Like.aggregate([
        {
            $match: { likedBy: new mongoose.Types.ObjectId(userId) }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind: "$video"
        },

    ]);

    if (!videos)
        throw new ApiError(400, "Could not fetch liked videos");

    res
        .status(200)
        .json(
            new ApiResponse(200, "Videos fetched successfully", videos)
        )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
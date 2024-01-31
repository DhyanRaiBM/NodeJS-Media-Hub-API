import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

//~Get Video Comments :
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Convert page and limit to integers
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Calculate the number of documents to skip
    const skip = (pageNumber - 1) * limitNumber;

    // Aggregate pipeline to retrieve comments for the specified video
    const aggregationPipeline = [
        {
            $match: { video: new mongoose.Types.ObjectId(videoId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            userName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                owner: 1,
            }
        },
        {
            $sort: { createdAt: -1 } // Sort comments by createdAt in descending order
        },
        {
            $skip: skip
        },
        {
            $limit: limitNumber
        }
    ];

    // Execute aggregation pipeline
    const comments = await Comment.aggregate(aggregationPipeline);


    if (!comments) {
        throw new ApiError(400, "Couldn't fetch comments")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, "Comments fetched successfully", comments)
        )

});


//~Add Comment :
const addComment = asyncHandler(async (req, res) => {
    const { comment } = req.body;
    const { videoId } = req.params;

    if (!comment)
        throw new ApiError(400, "Comment is required")

    if (!videoId)
        throw new ApiError(400, "VideoId is required")

    const createdComment = await Comment.create({
        content: comment,
        video: videoId,
        owner: req.user._id
    })

    if (!createdComment) {
        throw new ApiError(400, "Failed to create comment")
    }

    const aggregatedComment = await Comment.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(createdComment._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1

                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            }
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1

                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                }
            }
        }

    ])

    if (!aggregatedComment) {
        throw new ApiError(400, "Failed to create comment")
    }


    res
        .status(200)
        .json(
            new ApiResponse(200, "Comment created successfully", aggregatedComment),
        )
})

//~Update Comment :
const updateComment = asyncHandler(async (req, res) => {
    const { comment } = req.body;
    const { commentId } = req.params;

    const updatedComment = await Comment.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(commentId),
            }
        },
        {
            $set: {
                content: comment,
            }
        },

        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1

                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            }
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1

                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                }
            }
        }
    ])

    if (!updatedComment) {
        throw new ApiError(400, "Failed to update comment")
    }


    res
        .status(200)
        .json(
            new ApiResponse(200, "Comment updated successfully", updatedComment),
        )
})

//~Delete Comment :
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId)
        throw new ApiError(400, "CommentId required")

    const response = await Comment.findByIdAndDelete(commentId);

    if (!response) {
        throw new ApiError(400, "Failed to delete comment")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, "Comment deleted successfully", {})
        )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
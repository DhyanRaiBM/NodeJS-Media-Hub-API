import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

//~Get channel stats like total video views, total subscribers, total videos, total likes.
const getChannelStats = asyncHandler(async (req, res) => {

    const channelId = req.user._id;

    const pipeline = [
        // Match videos belonging to the channel
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        // Group stage to calculate aggregate values
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 }, // Count the number of videos
                totalViews: { $sum: "$views" }, // Sum up the views of all videos
            }
        },
        // Lookup stage to get the total likes
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        // Count the total likes
        {
            $addFields: {
                totalLikes: { $size: "$likes" }
            }
        }
    ];
    const stats = await Video.aggregate(pipeline);

    // Additional logic to get subscriber count
    const subscriberCount = await Subscription.countDocuments({ channel: channelId });

    // Construct the response object
    const channelStats = {
        totalVideos: stats.length > 0 ? stats[0].totalVideos : 0,
        totalViews: stats.length > 0 ? stats[0].totalViews : 0,
        totalLikes: stats.length > 0 ? stats[0].totalLikes : 0,
        totalSubscribers: subscriberCount
    };

    res
        .status(200)
        .json(
            new ApiResponse(200, "Statistics fetched successfully", channelStats)
        );

});


//~Get all channel videos :
const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user._id;

    if (!channelId) {
        throw new ApiError(400, "channelId is required");
    }

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
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
                            userName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
    ])

    if (!videos) {
        throw new ApiError(400, "Failed to fetch videos");
    }

    res
        .status(200)
        .json(
            new ApiResponse(200, "Successfully fetched videos", videos)
        )

})

export {
    getChannelStats,
    getChannelVideos
}
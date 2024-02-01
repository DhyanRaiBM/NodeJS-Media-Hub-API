import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

//~Toggle Channel Subscription:
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId)
        throw new ApiError("channelId is required");

    let subscribe;
    let unSubscribe;

    const channelSubscribed = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user._id
    })

    if (channelSubscribed) {
        unSubscribe = await Subscription.deleteOne({
            channel: channelId,
            subscriber: req.user._id
        })

        if (!unSubscribe)
            throw new ApiError("Failed to unSubscribe channel")
    } else {
        subscribe = await Subscription.create({
            channel: channelId,
            subscriber: req.user._id
        })

        if (!subscribe)
            throw new ApiError("Failed to like channel")
    }
    res
        .status(200)
        .json(
            new ApiResponse(200, `channel ${subscribe ? "subscribed" : "unsubscribed"} Succcessfully`)
        )

})

//~Controller to return subscriber list of a channel:
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;



    if (!channelId)
        throw new ApiError(400, "ChannelId is required")

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
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
                subscriber: {
                    $first: "$subscriber",
                }
            }
        }
    ])

    if (!subscribers)
        throw new ApiError(400, "Failed to fetch subscribers");

    res
        .status(200)
        .json(
            new ApiResponse(200, "Successfully fetched subscribers", subscribers[0])
        )
})

//~Controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId: subscriberId } = req.params


    if (!subscriberId)
        throw new ApiError(400, "SubscriberId is required")

    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
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
                channel: {
                    $first: "$channel",
                }
            }
        }
    ])

    if (!channels)
        throw new ApiError("Failed to fetch channels")

    res
        .status(200)
        .json(
            new ApiResponse(200, "Channels fetched successfully", channels[0])
        )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
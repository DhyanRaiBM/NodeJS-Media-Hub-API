
import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

//~Publish a video:
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    //get video, upload to cloudinary, create video,respond

    if (!title || !description) {
        throw new ApiError("Title and description both are required !")
    }
    //retreive the video and thumbnail

    const videolocalpath = req.files?.videoFile[0]?.path;
    const thumbnaillocalpath = req.files?.thumbnail[0]?.path;

    // console.log(videolocalpath, thumbnaillocalpath);

    if (!videolocalpath) {
        throw new ApiError(404, "Video is required!!!")
    }
    if (!thumbnaillocalpath) {
        throw new ApiError(404, "Thumbnail is required!!!")
    }
    //cloud 
    const video = await uploadOnCloudinary(videolocalpath);
    const thumbnail = await uploadOnCloudinary(thumbnaillocalpath);

    console.log(video, thumbnail);

    if (!video?.url) {
        throw new ApiError(500, "Error while uplaoding the video")
    }
    if (!thumbnail?.url) {
        throw new ApiError(500, "Error while uplaoding the thumbnail")
    }

    const newVideo = await Video.create({
        videoFile: video?.url,
        thumbnail: thumbnail?.url,
        title,
        description,
        duration: video?.duration,
        isPublished: true,
        owner: req.user?._id
    })

    return res
        .status(200)
        .json(new ApiResponse(200, "Video Published Successfully", newVideo))


})

//~Get a Video :
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // get video by id,respond 

    if (!videoId) throw new ApiError(400, "Vidoe Id is required");

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
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

    if (!video) throw new ApiError(404, "Video not found");

    res
        .status(200)
        .json(
            new ApiResponse(200, "Video fetched successfully", video[0])
        )



})

//~Update Video:
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body;

    if (!title || !description || !videoId)
        throw new ApiError(400, "All fields are required");

    const thumbnailLocalPath = req.file?.path;

    console.log(thumbnailLocalPath);

    if (!thumbnailLocalPath)
        throw new ApiError(500, "Error while uploading thumbnail")
    const videoToDeleteThumbnail = await Video.findById(videoId);

    const deletedResponse = await deleteFromCloudinary(videoToDeleteThumbnail.thumbnail);

    if (!deletedResponse) throw new ApiError(500, "Video Updation Failed");

    const thumbnail = uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail)
        throw new ApiError(500, "Error while uploading thumbnail")

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            title,
            description,
            thumbnail: thumbnail.url,
        },
        {
            new: true,
        }
    )

    if (!video)
        throw new ApiError(500, "Error while uploading video")

    res
        .status(200)
        .json(
            new ApiResponse(200, "Video updated successfully", video)
        )

})

//~Delete a video:
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId)
        throw new ApiError(400, "videoId required");

    const video = await Video.findById(videoId);

    if (!video)
        throw new ApiError("Video not found");

    const response = await Video.findOneAndDelete({ _id: video._id });


    if (!response) throw new ApiError(500, "Video deletion Failed");

    res
        .status(200)
        .json(
            new ApiResponse(200, "Video deleted successfully")
        )

})

//~Toggle publish status:
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId)
        throw new ApiError(400, "videoId required");

    const updatedVideo = await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                isPublished: {
                    $not: "$isPublished"
                }

            }
        },
        { new: true })

    if (!updatedVideo)
        throw new ApiError(400, "Something went wrong while updating video status");

    res
        .status(200)
        .json(
            new ApiResponse(200, "Toggle successfull", updatedVideo)
        )


})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
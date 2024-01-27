import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { response } from "express";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

//~Register controller :
const registerUser = asyncHandler(async (req, res, next) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const { userName, email, fullName, password } = req.body;

    if ([fullName, email, userName, password].some((field) => field === "")) {
        throw new ApiError(400, "All fields must are Required");
    }

    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existedUser) throw new ApiError(400, "User already exists");


    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    const user = await User.create({
        fullName,
        userName: userName.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) throw new ApiError(500, "Something went wrong while registring the user")

    res.status(200).json(
        new ApiResponse(
            200,
            "User Registered Successfully",
            createdUser
        )
    )

})


//~Login controller :
const loginUser = asyncHandler(async (req, res, next) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const { userName, email, password } = req.body;


    if ((!userName && !email) || !password) {
        return new ApiError(400, "Enter all fields");
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (!user) return new ApiError(400, "User not found");

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) return new ApiError(401, "Invalid password");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const cookieOptions = {
        secure: true, // Only transmit cookie over HTTPS
        httpOnly: true, // Cookie is not accessible via client-side scripts
        sameSite: 'Strict', // Restrict cookie to same site requests
        maxAge: 3600000, // Expiry time in milliseconds (e.g., 1 hour)
    };

    res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, "Logged in successfully", {
                user: loggedInUser,
                accessToken,
                refreshToken,
            })
        )

})

//~Logout controller :
const logoutUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { "refreshToken": "" }
        }
    )

    const cookieOptions = {
        secure: true, // Only transmit cookie over HTTPS
        httpOnly: true, // Cookie is not accessible via client-side scripts
        sameSite: 'Strict', // Restrict cookie to same site requests
        maxAge: 3600000, // Expiry time in milliseconds (e.g., 1 hour)
    };

    res
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(
            new ApiResponse(200, "Logged out successfully")
        )

})

//~Refresh Access Token :
const refreshAccessToken = asyncHandler(async (req, res) => {

    //Get the refresh token
    //verify the refresh token and get the user
    //check if the refresh token is equal to the refresh token in DB
    //if yes refresh the access token and refresh token 

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const cookieOptions = {
            secure: true, // Only transmit cookie over HTTPS
            httpOnly: true, // Cookie is not accessible via client-side scripts
            sameSite: 'Strict', // Restrict cookie to same site requests
            maxAge: 3600000, // Expiry time in milliseconds (e.g., 1 hour)
        };
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

//~Change current password :
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body



    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, "Password changed successfully", {}))
})

//~Get current user :
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            "User fetched successfully",
            req.user
        ))
})

//~Update account details :
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
            }
        },
        { new: true }

    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, "Account details updated successfully", user))
});


//~Update user avatar :
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const deletedResponse = await deleteFromCloudinary(req?.user?.avatar);

    if (!deletedResponse) throw new ApiError(500, "Avatar image Updation Failed");

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while updating avatar image")

    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Avatar image updated successfully", user)
        )
})

//~Update user cover image :
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    const deletedResponse = await deleteFromCloudinary(req?.user?.coverImage);

    if (!deletedResponse) throw new ApiError(500, "Cover image Updation Failed");

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while updating cover image")

    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Cover image updated successfully", user)
        )
})

//~Channel profile :
const getUserChannelProfile = asyncHandler(async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            throw new ApiError(404, "username must be provided");
        }

        const channel = await User.aggregate([
            {
                $match: { username: username.toLowerCase },//-Fetch only the matched document,in this case on 1
            },
            {
                $lookup: {
                    from: "subscriptions",//-The collection to which you wish to perform a left join
                    localField: "_id",//-The field in the users collection
                    foreignField: "channel",//-The field in the subscribers collection
                    as: "subscribers",//-The name of the field  which stores the returned data as an Array
                }
            },
            {
                $lookup: {
                    from: "subscriptions",//-The collection to which you wish to perform a left join
                    localField: "_id",//-The field in the users collection
                    foreignField: "subscriber",//-The field in the subscribers collection
                    as: "subscribedTo",//-The name of the field which stores the returned data as an Array
                }
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                        //- $size returns the size of the array
                        //- $ in "$subscribers" specifies that it is a field
                    },
                    subscribedToCount: {
                        $size: "$subscribedTo"
                        //- $size returns the size of the array
                        //- $ in "$subscribedTo" specifies that it is a field
                    },
                    isSubscribed: {
                        //- $cond MongoDB operator - refer to the docs
                        $cond: {
                            if: { $in: [req?.user._id, "$subscribers.subscriber"] },
                            //- $in operator checks if userId is present in $subscribers.subscriber
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                //-Used to specify what fields should be selected
                $project: {
                    fullName: 1,
                    username: 1,
                    subscribersCount: 1,
                    subscribedToCount: 1,
                    isSubscribed: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1
                }

            }
        ])

        console.log(channel);

        if (!channel?.length) {
            throw new ApiError(400, "Channel not found");
        }

        res
            .status(200)
            .json(
                new ApiResponse(200, "Channel fetched successfully", channel[0])
            )
    } catch (error) {
        console.log(error);
    }
})




export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateUserCoverImage,
    updateUserAvatar,
    updateAccountDetails,
    getCurrentUser,
    getUserChannelProfile
} 
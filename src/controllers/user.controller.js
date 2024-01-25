import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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



export { registerUser, loginUser, logoutUser } 
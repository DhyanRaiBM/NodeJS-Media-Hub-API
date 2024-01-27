import { Router } from "express";
import { loginUser, registerUser, logoutUser, refreshAccessToken, updateUserCoverImage, getUserChannelProfile } from "../controllers/user.controller.js";
import { uploadInLocal } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    uploadInLocal.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser
);

router.route("/login").post(loginUser);

//|Secure routes :
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/get-profile/:username").post(verifyJWT, getUserChannelProfile);


export default router;
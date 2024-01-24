import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { uploadInLocal } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
    uploadInLocal([
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


export default router;
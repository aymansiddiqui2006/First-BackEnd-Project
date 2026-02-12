import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
import {changeCurrentPassword, getCurrentUser, UserDataChange, UpdateAvatar, UpdateCoverImg} from "../controllers/updates.controller.js"
import {getUserChannelProfile} from "../controllers/subscription.controller.js"
import {watchHistory} from "../controllers/watchHistory.controller.js"
import { upload } from "../middleWare/multer.js";
import {  verifyJWT  } from "../middleWare/Auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT , logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").patch(verifyJWT , changeCurrentPassword)

router.route("/current-user").get(verifyJWT ,getCurrentUser)

router.route("/update-account").patch(verifyJWT ,UserDataChange)

router.route("/update-avatar").patch(verifyJWT ,upload.single("avatar"),UpdateAvatar)

router.route("/update-cover-image").patch(verifyJWT ,upload.single("coverImage"),UpdateCoverImg)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/watch-history").get(verifyJWT,watchHistory)


export default router
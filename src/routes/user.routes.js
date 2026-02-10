import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middleWare/multer.js";
import { verfyJWT } from "../middleWare/Auth.middleware.js";

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

//secureed routes
router.route("/logout").post(verfyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

export default router
import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, updateUserDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import  {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/update-information").post(verifyJWT, updateUserDetails)
router.route("/avatar-updating").post(verifyJWT,
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        }
    ]), updateUserAvatar
)
router.route("/coverImage-updating").post(verifyJWT,
    upload.fields([
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    updateUserCoverImage
)


export default router;
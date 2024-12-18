import { Router } from "express"
import { changePassword, getUserChennelProfile, getWatchHistory, LoginUser, LogoutUser, refreshAccessToken, updateAccountDetails, updateAvatar, updateCoverImage, UserRegister } from '../controllers/user.controller.js'
import {upload} from "../middleweres/multer.js"
import { verifyJWT } from "../middleweres/auth.middleware.js"

const router = Router()

router.route("/userRegister").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 2
        }
    ]),
    UserRegister
)

router.route("/login").post(LoginUser)


router.route("/logout").post(verifyJWT,LogoutUser)
router.route("/refreshAccessToken").post(refreshAccessToken)
router.route("/changePassword").post(verifyJWT, changePassword)
router.route("/updateAccountDetails").patch(verifyJWT,updateAccountDetails)
router.route("/updateAvatar").patch(verifyJWT, upload.single("avatar"), updateAvatar)
router.route("/updateCoverImage").patch(verifyJWT,upload.single("coverImage"), updateCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChennelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)

export default router
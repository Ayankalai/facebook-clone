import { Router } from "express"
import { getLikedVideos, toggleTweetLike, toggleVideoLike } from "../controllers/like.controller"
import { verifyJWT } from "../middleweres/auth.middleware"



const router = Router()

router.route("/toggleVideoLike").post(verifyJWT,toggleVideoLike)
router.route("/toggleTweetLike").post(verifyJWT,toggleTweetLike)
router.route("/getLikedVideos").post(verifyJWT,getLikedVideos)


export default router
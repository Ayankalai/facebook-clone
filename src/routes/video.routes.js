import { Router } from "express";
import { verifyJWT } from "../middleweres/auth.middleware.js";
import { deleteVideo, getAllVideos, getUserUploadedVideos, getVideoId, publishVideo, updateVideo } from "../controllers/video.controller.js";
import { upload } from "../middleweres/multer.js"


const router = Router()

router.route("/publishVideo").post(verifyJWT,upload.fields([
    {
        name:"videoFile",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]),publishVideo)

router.route("/videoId").get(verifyJWT,getVideoId)
router.route("/deleteVideo").delete(verifyJWT,deleteVideo)
router.route("/updateVideo").patch(verifyJWT,updateVideo)
router.route("/getAllVideos").get(getAllVideos)
router.route("/getuservideos").get(verifyJWT,getUserUploadedVideos)

export default router
import { Router } from "express";
import { verifyJWT } from "../middleweres/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";

const router = Router()

router.route("/getVideoComments").get(verifyJWT,getVideoComments)
router.route("/addComment").post(verifyJWT,addComment)
router.route("/updateComment").patch(verifyJWT,updateComment)
router.route("/deleteComment").patch(verifyJWT,deleteComment)

export default router
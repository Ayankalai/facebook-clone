import { Like } from "../models/like.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { userId } = req.user

    let existingLike = await Like.findOne({ video: videoId, likedBy: userId })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return ApiResponse.success(res, { message: "Like removed" })
    } else {
        const newLike = new Like({
            video: videoId,
            likedBy: userId
        })
        await newLike.save()
        return ApiResponse.success(res, { message: "Like added" })
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { userId } = req.user._id

    let existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return ApiResponse.success(res, { message: "Like removed" })
    } else {
        const newLike = new Like({
            tweet: tweetId,
            likedBy: userId
        })
        await newLike.save()
        return ApiResponse.success(res, { message: "Like added" })
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const { userId } = req.user._id

    const likedVideos = await Like.find({ likedBy: userId, video: { $ne: null } })
        .populate("video")
        .exec()

    return ApiResponse.success(res, likedVideos)
})

export {
    toggleVideoLike,
    toggleTweetLike,
    getLikedVideos
}

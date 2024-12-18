import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { apiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Invalid video ID")
    }

    const comments = await Comment.find({ video: videoId })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('owner', 'name')  
    return res.status(200).json(new ApiResponse(comments, "Comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body
    const userId = req.user.id 
   
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Invalid video ID")
    }

   
    const newComment = Comment.create({
        content,
        video: videoId,
        owner: userId
    })

    

    return res.status(201)
    .json(new ApiResponse(newComment, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new apiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findOneAndUpdate(
        {
            _id: new mongoose.Types.ObjectId(commentId),
            owner: new mongoose.Types.ObjectId(userId), 
        },
        { content },
        { new: true }
    );

    if (!comment) {
        throw new apiError(404, "Comment not found or unauthorized");
    }

    return res.status(200).json(new ApiResponse(comment, "Comment updated successfully"));
});


const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user.id  
    
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new apiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findByIdAndDelete(
        { _id: commentId, owner: userId },

    )

    if (!comment) {
        throw new apiError(404, "Comment not found or unauthorized")
    }

    return res.status(200).json(new ApiResponse(null, "Comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}

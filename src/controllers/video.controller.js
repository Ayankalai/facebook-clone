import mongoose from "mongoose";
import { asynchandler } from "../utils/asynchandaler.js";
import { apiError } from "../utils/apiError.js";
import uploasCloudinary from "../utils/cloudinary.js";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const publishVideo = asynchandler( async (req,res) => {
    console.log(req.user)

    const { title, description } = req.body;

    if (!title || !description) {
        throw new Error(400, "All fields are required");
    }
    // console.log(title,description)

    const videoFile = req.files?.videoFile[0]?.path;
    const thumbnail = req.files.thumbnail[0].path;

    if (!videoFile || !thumbnail) {
        throw new Error(400, "Video and thumbnail files are required.");
    }

    console.log("Video file path:", videoFile);
    console.log("Thumbnail file path:", thumbnail);

    const uploadedVideoFile = await uploasCloudinary(videoFile)
    const uploadedThumbnail = await uploasCloudinary(thumbnail)

    if (!uploadedVideoFile || !uploadedThumbnail) {
        throw new Error(500, " Error while fetching the data from cloudinary");
    }

    // console.log("duration:", uploadedVideoFile.duration);

    // console.log("cloudinary Thumbnail file path:", uploadedThumbnail.url);
    
    const video = await Video.create({
        title,
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        description,
        owner:req.user._id,
        inPublished: false,
        duration: uploadedVideoFile.duration

    })

    if (!video) {
        throw new Error(500,"Error while storing the data in the data base");
        
    }

    console.log(video)

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video uploaded successfully"
        )
    )
    
})

const getVideoId = asynchandler( async (req,res) => {

    console.log(req.params)
    const { videoId } = req.params

    if (!req.params) {
        throw new apiError(400,"video id not found")
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $project: {
                title:1,
                videoFile:1,
                thumbnail:1,
                description:1,
                duration:1,
                inPublished:1,
                owner:1
            }
        }
    ])

    if (!video) {
        throw new Error(404, "Video not found");
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "video retrived successfully"
        )
    )
   
})

const updateVideo = asynchandler( async (req,res) => {
    const { videoId } = req.params
    const { title, description } = req.body;

    const video = await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                title,
                description,
            }
        },
        {
            new: true
        }
    )

    if (!video) {
        throw new Error(404,"video not found")
    }

    const uploadThumbnail =  req.file?.thumbnail[0]?.path

    
    const thumbnail = await uploasCloudinary(uploadThumbnail)
    if (!thumbnail) {
        throw new Error("thumbnail not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            video,
            thumbnail,
            "video data update successfully"
        )
    )
})

const deleteVideo = asynchandler( async (req,res) => {
    
    const { videoId } = req.params

    const video = await Video.findById(videoId)
    if (!video) {
        throw new Error("video not found");
        
    }
    await video.remove()

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Video deleted successfully"
        )
    )

})

const getAllVideos = asynchandler(async (req,res) => {
    // console.log(req.user)
    const allVideos = await Video.find()
    console.log(allVideos)

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "All video fetch successFully",
            allVideos
        )
    )
})

const getUserUploadedVideos = asynchandler(async (req,res) => {

    const id = req.user._id
    console.log(id)
    
    const video = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $project: {
                title: 1,
                videoFile: 1,
                thumbnail: 1,
                description: 1,
                duration:1,
                views:1,
                inPublished: 1,
                owner: 1,

            }
        }
    ])

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "video fetch successfully"
        )
    )
})


export {
    publishVideo,
    getVideoId,
    updateVideo,
    deleteVideo,
    getAllVideos,
    getUserUploadedVideos
}

import mongoose, { Schema } from "mongoose";
import mongooseaggregatepaginate from 'mongoose-aggregate-paginate-v2'
const videoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            require: true
        },
        videoFile: {
            type: String, // Cloudinary url
            require: true
        },
        thumbnail: {
            type: String,
            require: true
        },
        description: {
            type: String,
            require: true
        },
        duration: {
            type: Number,
            require: true
        },
        views: {
            type: Number,
            default: 0
        },
        inPublished: {
            type: Boolean,
            require: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseaggregatepaginate)

export const Video = mongoose.model("Video",videoSchema)
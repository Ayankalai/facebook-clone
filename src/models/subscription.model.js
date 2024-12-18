import mongoose, { Schema } from "mongoose";

const scubcriptionSchema = new mongoose.Schema(
    {
        subcriber:{
            type: Schema.Types.ObjectId, // one who is subscring
            ref: "User"
        },
        channel : {
            type : Schema.Types.ObjectId,// creator
            ref: "User"
        }
    },
    {
        timestamps:true
    }
)

export const Subcription = mongoose.model("Subcription",scubcriptionSchema)
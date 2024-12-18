import {asynchandler} from "../utils/asynchandaler.js";
import {apiError} from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import  uploasCloudinary  from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

 
const UserRegister = asynchandler(async (req,res) => {
    
    const {username,fullname,email,password,ph} = req.body

    console.log(req.body);

    if (
        [username,email,password,ph,fullname].some((element) => 
            element?.trim === "")
    ) {
        throw new apiError(400,"All field are required")
    }

    const userExisted = await User.findOne({
        $or:[ {username}, {email},]
    })

    if (userExisted) {
        throw new apiError(409,"user all ready exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log("avatarLocalPath",avatarLocalPath)

    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    console.log("coverImageLocalPath",coverImageLocalPath)

    if (!avatarLocalPath) {
        throw new apiError(400,"avatar file is required")
    }

    const avatar = await uploasCloudinary(avatarLocalPath)
    console.log("avatar",avatar)
    const coverImage = await uploasCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new apiError(400,"avatar file is required")
    }

    const user = User.create({
        username,
        password,
        ph,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email: username.toLowerCase()
    })
    console.log("user: ",user)
    const createdUser = await User.findById((await user)._id).select(
        " -password -refreshToken "
    )
    console.log("createdUser: ",createdUser)
    console.log("user: ",(await user).password)

    if (!createdUser) {
        throw new apiError(500,"something went wrong while registering the user");
        
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            createdUser,
            "User Register successfully"
        )
    )
})



const LoginUser = asynchandler(async (req,res) => {

    const {username,password,email} = req.body
    // console.log("hhh",req.body)

    if (!email && !username) {
        throw new apiError(401,"username or email required");
        
    }
    const user = await User.findOne(
            {
                $or:[{email},{username}]
            }
        )

    if (!user) {
        throw new apiError(404,"Email or Username does not exist");
    }
    // console.log(user._id)

    const isPasswordValid = await user.isPasswordCorrect(password)
    console.log("isPasswordValid",isPasswordValid)

    if (!isPasswordValid) {
        throw new apiError(401, "Invalid user credentials")
    }
    
    const userdata = await User.findById(user._id)
    const AccessToken = await userdata.generateAccessToken()
    const RefreshToken = await userdata.generateRefreshToken()
    
    const loggedUser = await User.findById(user.id).select("  -password -refreshToken")
    console.log(loggedUser)

    const cookieOptions = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("AccessToken",AccessToken,cookieOptions)
    .cookie("RefreshToken",RefreshToken,cookieOptions)
    .json(
        {
            user : loggedUser,AccessToken,RefreshToken
        }
    )
})

const LogoutUser = asynchandler(async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          $unset: { refreshToken: 1 }
        },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json(new ApiResponse(404, "User not found"));
      }
  
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'Strict'
      };
  
      return res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, "User logged out successfully"));
    } catch (error) {
      console.error(error);
      return res.status(500).json(new ApiResponse(500, "Internal Server Error"));
    }
  });
  


const refreshAccessToken = asynchandler(async (req,res) => {
    const incomingRefreshToken = req.cookies?.RefreshToken || req.header("Authorization")?.replace("Bearer ","")
    // console.log(incomingRefreshToken)

    if (!incomingRefreshToken) {
        throw new apiError(404,"un Authorization user")
        
    }
    
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    console.log(decodedToken)
    // console.log(decodedToken._id)

    const user = await User.findById(decodedToken?._id)
    if (!user) {
        throw new apiError(404,"Invalid refresh token ")
        
    }
    
    console.log("user.refreshToken",user.refreshToken)
    if (incomingRefreshToken !== user.refreshToken) {
        throw new apiError(404,"expired refresh token ")
    }

    const newAccessToken = await user.generateAccessToken()
    const newRefreshToken = await user.generateRefreshToken()

    const cookieOptions = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",newAccessToken,cookieOptions)
    .cookie("newRefreshToken",newRefreshToken,cookieOptions)
    .json(
        new ApiResponse(
            200,
            newAccessToken,
            {refreshToken : newRefreshToken}
        )
    )
    

})


const changePassword = asynchandler(async (req,res) => {

    const { oldpassword, newpassword } = req.body
   
    

    const user = await User.findById(req.user._id)
    console.log(user)
    if (!user) {
        throw new apiError(404,"Unauthorize user");
        
    }
    const passworMatch = await user.isPasswordCorrect(oldpassword)
    if (!passworMatch) {
        throw new apiError(404," incorrect password ");
        
    }else{
        console.log(true)
    }

    user.password = newpassword
    // console.log("user.password",user.password)

    user.save({validateBeforeSave: false})

       

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Password change successfully"
        )
    )

})


const updateAccountDetails = asynchandler(async (req,res) => {
    
    // console.log(req.user)
    const { username, email,ph} = req.body
    console.log(req.body)

   
    const updatedUser = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                username: username,
                email: email,
                ph: ph
            }
        },
        {
            new: true
        }
    ).select(" -password -refreshToken")

    console.log("updateUser",updatedUser)

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            updatedUser,
            "Updated user successfully"
        )
    )


})

const updateAvatar = asynchandler(async (req,res) => {
     
    // console.log(req.user.avatar)

    const avatarLocalPath = req.file?.path
    // console.log(avatarLocalPath)

    if (!avatarLocalPath) {
        throw new apiError(400,"avatar is missing")
    }

    const avatar = await uploasCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new apiError(400,"avatar doesn't uploded in cloudinary")
    }
    // console.log("avatar", avatar)
    // console.log("avatar.url",avatar.url)

    const updatedAvatar = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select(" -password -refreshToken")
    if (!updatedAvatar) {
        throw new apiError(400,"Error while updating the avatar")
    }
    // console.log("updatedAvatar", updatedAvatar)

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "Avatar updated successfully"
        )
    )
})

const updateCoverImage = asynchandler(async (req,res) => {
  

    const CoverImageLocalPath = req.file?.path
    // console.log(CoverImageLocalPath)

    if (!CoverImageLocalPath) {
        throw new apiError(400,"avatar CoverImage is missing")
    }

    const CoverImage = await uploasCloudinary(CoverImageLocalPath)
    if (!CoverImage.url) {
        throw new apiError(400,"CoverImage doesn't uploded in cloudinary")
    }
    // console.log("CoverImage", CoverImage)
    // console.log("CoverImage.url",CoverImage.url)

    const updatedCoverImage = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                coverImage: CoverImage.url
            }
        },
        {
            new: true
        }
    ).select(" -password -refreshToken")
    if (!updatedCoverImage) {
        throw new apiError(400,"Error while updating the avatar")
    }
    console.log("updatedCoverImage", updatedCoverImage)

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            "CoverImage updated successfully"
        )
    )
})

const getUserChennelProfile = asynchandler(async (req,res) => {
    const { username } = req.params
    // console.log(req.params)
    
    // console.log(req.user)
    const chennal = await User.aggregate([
        {
            $match: {
                username: username
            }
        },
        {
            $lookup: {
                from: "subcriptions",
                localField:"_id",
                foreignField: "channel",
                as: "subscribers" // to find subscribers
            }
        },
        {
            $lookup: {
                from: "subcriptions",
                localField: "_id",
                foreignField: "subcriber",
                as: "subscribedTo" // to find how many chennal subscribed by perticular user
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                // user subcribed to other chennal
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1
            }
        }
    ])
    if (username !== req.user.username) {
        throw new apiError(400,"username not found")
    }
    console.log(chennal)

    if (!chennal.length) {
        throw new apiError(404,"chennel does not exit")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            chennal,
            "Channel profile retrieved successfully"
        )
    )

   
})



const getWatchHistory = asynchandler(async (req,res) => {
    
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: " _id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        email: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        // convert the array into object
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    // console.log(user)

    return res.status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "watchHistory fetch successfully"
        )
    )
})


export {
    UserRegister,
    LoginUser,
    LogoutUser,
    refreshAccessToken,
    changePassword,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getUserChennelProfile,
    getWatchHistory
}
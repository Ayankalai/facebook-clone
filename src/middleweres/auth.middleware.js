import { asynchandler } from "../utils/asynchandaler.js";
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";



const verifyJWT = asynchandler(async (req,res,next) => {
    const token = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ","")

    if (!token) {
      throw new apiError(401, "Unauthorized request")
    }
    const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

    const user= await User.findById(decodedToken?._id).select("-password -refreshToken")

    req.user = user;
    next()
})

export { verifyJWT }

import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
    {
        username: {
            type:String,
            require: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true
        },
        fullname: {
            type:String,
            require: true,
            trim: true,
            lowercase: true,
            index: true
        },
        email: {
            type:String,
            require: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        ph: {
            type:String,
            require: true,
        },
        avatar:{
            type: String,
            require: true
        },
        coverImage:{
            type: String,
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password: {
            type: String,
            require: [true,"Password is required"]
        },
        refreshToken: {
            type: String,
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        // console.log("password",this.password)
        this.password = await bcrypt.hash(this.password,10)
        next()
    }
    return next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    console.log("hhh")
    return jwt.sign(
        {
            _id : this._id,
            username: this.username,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function() {
    try {
        const refreshToken = jwt.sign(
            {
                _id: this._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        );

        this.refreshToken = refreshToken;
        await this.save();

        return refreshToken;
    } catch (error) {
        throw new Error('Error generating refresh token');
    }
};

export const User = mongoose.model("User",userSchema)
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import { use } from "react";


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        lower: true,
        trim: true,
        index: true,

    },
    email: {
        type: String,
        unique: true,
        required: true,
        lower: true,
        trim: true,
    },
    Fullname: {
        type: String,
        required: true,
        trim: true,
        index: true,

    },
    Avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,

    },
    watchHistry: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        unique: true,
        required: [true, "Please enter password"],
    },
    refreshToken: {
        type: String,
    }

}, { timestamps: true, })

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            Fullname: this.Fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


userSchema.methods.generateRefreshToken = function () { }

export const User = mongoose.model("User", userSchema)
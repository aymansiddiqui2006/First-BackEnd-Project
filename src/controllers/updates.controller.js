import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utility/cloudinary.js"
import { ApiResponse } from '../utility/APIresponse.js'


const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "oldPassword and newPassword are required");
    }


    const user = await User.findById(req.user?._id);

     if (!user) {
        throw new ApiError(401, "Unauthorized");
    }
    
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "old password not correct")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password change successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "current user fetched successfully"))

})

const UserDataChange = asyncHandler(async (req, res) => {
    const { Fullname, email } = req.body;

    if (!Fullname || !email) {
        throw new ApiError(400, "all fileds are require");
    }

    await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                Fullname,
                email: email,
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json(new ApiResponse(200, {}, "entity updated succefully"))

})

const UpdateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar not found !!")
    }

    const uploadAvatar = await uploadOnCloudinary(avatarLocalPath)
    if (!uploadAvatar.url) {
        throw new ApiError(400, "error while uploading the file")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: uploadAvatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json(new ApiResponse(200, user, "entity updated succefully"))

})

const UpdateCoverImg = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, " Image not found !!");
    }
    const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!uploadedCoverImage.url) {
        throw new ApiError(400, "error while uploading the file")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: uploadedCoverImage.url
            }
        },
        { new: true }
    ).select("-password")
    return res.status(200)
        .json(new ApiResponse(200, user, "entity updated succefully"))


})

export {
    changeCurrentPassword,
    getCurrentUser,
    UserDataChange,
    UpdateAvatar,
    UpdateCoverImg
}
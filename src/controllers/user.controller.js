import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utility/cloudinary.js"
import { ApiResponse } from '../utility/APIresponse.js'
import jwt from "jsonwebtoken"


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "something went wrong")
    }
}


const registerUser = asyncHandler(async (req, res) => {
    //get user detail from frontend
    //validation - not empty
    //chech if user already exists:username,email
    //check img or avatar
    //upload tehm to cloudinary ,avatar
    //create user oj-create entr in db
    //remove essential data from response
    //check user creation
    //return res

    const { username, Fullname, email, password } = req.body
    console.log('email', email);

    if (
        [Fullname, email, password, username].some(
            (field) =>
                !field || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All field are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // let coverImageLocalPath;
    // if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    //     coverImageLocalPath = req.file.coverImage[0]
    // }



    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar are required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar are required")
    }


    const user = await User.create({
        Fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    if (!createdUser) {
        throw new ApiError(500, "something went wrong on server while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Succesfully")
    )


})

const loginUser = asyncHandler(async (req, res) => {
    //req body->data
    //validation username and email
    //already exist find the user
    //password check
    //access and refresh tocken
    //send cookie

    const { email, username, password } = req.body || {};
    if (!(username || email)) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "user not exist")
    }

    const passwordValid = await user.isPasswordCorrect(password);

    if (!passwordValid) {
        throw new ApiError(401, "user password not correct")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.
        status(200).
        cookie("accessToken", accessToken, options).
        cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, {
                user: loggedInUser, accessToken, refreshToken
            },
                "user logged In successfully"
            )

        )


})

const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id, {
        $set: {
            refreshToken: undefined
        }

    }, {
        new: true
    }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user Logged Out successfully"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRfeshToken = req.cookie.refreshToken || req.body.refreshAccessToken

    if (!incomingRfeshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRfeshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "unauthorized user and invalid refresh token")
        }

        if (incomingRfeshToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token is used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, NewrefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", NewrefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: NewrefreshToken },
                    "Accessed token refreshed"

                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")
    }
})




// const changeCurrentPassword = asyncHandler(async (req, res) => {
//     const { oldPassword, newPassword } = req.body;

//     const user = await req.findById(req.user?._id);
//     const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

//     if (!isPasswordCorrect) {
//         throw new ApiError(401, "old password not correct")
//     }

//     user.password = newPassword;
//     await user.save({ validateBeforeSave: false });

//     return res
//         .status(200)
//         .json(new ApiResponse(200, {}, "password change successfully"))
// })

// const getCurrentUser = asyncHandler(async (req, res) => {
//     return res
//         .status(200)
//         .json(new ApiResponse(200, req.user, "current user fetched successfully"))

// })

// const UserDataChange = asyncHandler(async (req, res) => {
//     const { Fullname, username } = req.body;

//     if (!Fullname || !username) {
//         throw new ApiError(401, "all fileds are require");
//     }

//     await User.findByIdAndUpdate(req.user?._id,
//         {
//             $set: {
//                 Fullname,
//                 email: email,
//             }
//         },
//         { new: true }
//     ).select("-password")

//     return res.status(200)
//         .json(new ApiResponse(200, {}, "entity updated succefully"))

// })

// const UpdateAvatar = asyncHandler(async (req, res) => {
//     const avatarLocalPath = await avatar.file?.path

//     if (!avatarLocalPath) {
//         throw new ApiError(400, "Avatar not found !!")
//     }

//     const avatar = await uploadOnCloudinary(avatarLocalPath)
//     if (!avatar.url) {
//         throw new ApiError(400, "error while uploading the file")
//     }
//     const user=await User.findByIdAndUpdate(req.user?._id,
//         {
//             $set: {
//                 avatar: avatar.url
//             }
//         },
//         { new: true }
//     ).select("-password")

//     return res.status(200)
//         .json(new ApiResponse(200, user, "entity updated succefully"))
//     save()
// })

// const UpdateCoverImg = asyncHandler(async (req, res) => {
//     const coverImageLocalPath = file.body;

//     if (!coverImageLocalPath) {
//         throw new ApiError(400, " Image not found !!");
//     }
//     const coverImage = uploadOnCloudinary(coverImageLocalPath)

//     if (!coverImage.url) {
//         throw new ApiError(400, "error while uploading the file")
//     }
//     const user=await User.findByIdAndUpdate(req.user?._id,
//         {
//             $set: {
//                 coverImage: coverImage.url
//             }
//         },
//         { new: true }
//     ).select("-password")
//     return res.status(200)
//         .json(new ApiResponse(200, user, "entity updated succefully"))
//     save()

// })


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    // changeCurrentPassword,
    // getCurrentUser,
    // UserDataChange,
    // UpdateAvatar,
    // UpdateCoverImg
}
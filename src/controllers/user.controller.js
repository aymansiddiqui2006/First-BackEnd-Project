import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utility/cloudinary.js"
import {ApiResponse, APIresponse} from '../utility/APIresponse.js'


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
        { Fullname, email, password, username }.some((field) => {
            field?.trim == ""
        })
    ) {
        throw new ApiError(400, "All field are required")
    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }

    const avatarLocalPath = res.files?.avatar[0]?.path;
    const coverImageLocalPath = res.files?.coverImage[0]?.path;

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
        coverImage: coverImage.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    if(!createdUser){
        throw new ApiError(500,"something went wrong on server while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200 ,createdUser,"User registered Succesfully" )
    )


})

export { registerUser }
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Some went wrong while generating Access and Refresh Tokens")
    }
}


const registerUser = asyncHandler(async (req, res)=>{
    // get user details from frontend
    // validation - if the fields are empty
    // check if user already exists: username, email
    // check if user has uploaded the images or not: for avtar is must
    // upload them to cloudinary, avatar
    // create a user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const {fullName, email, password, username} = req.body
    // console.log(email);

    if ([fullName, email, username, password].some((field)=> field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    if (!email.includes("@")) {
        throw new ApiError(400, "Enter a valid email")
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if (req.files && Array.isArray[req.files.coverImage && req.files.coverImage.length > 0]) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // console.log(avatarLocalPath);
    // console.log(coverImageLocalPath);
    
    if (!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatar){
        throw new ApiError(400, "error occured while uploading to the cloudinary")
    }

    const user = await User.create({
        fullName,
        username,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        username: username.toLowerCase()
    })


    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered succesfully")
    )
})

const loginUser = asyncHandler(async (req, res)=>{
    // create a variable where you will store the user's input
    // get the email || username with password from the user
    // check if the user exist or not
    // compare them using bcrypt
    // if password matches then give access and refresh token
    // if not send a message that your password is incorrect

    const {email, username, password} = req.body

    if(!email || !username){
        throw new ApiError(400, "username or email is required")
    }

    const user = User.findOne({
        $or:[{email},{username}]
    })

    if(!user){
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invaild user credential")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedIn = User.findById(user._id).select("-password -refreshToken")

    const options ={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedIn, accessToken, refreshToken
            },
            "user logged in succesfully"
        )
    ) 
})

const logoutUser = asyncHandler(async (req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }
    )

    const options ={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
})

export {registerUser, loginUser, logoutUser}
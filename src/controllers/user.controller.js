import { asyncHandler } from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {apiResponse} from "../utils/apiResponse.js"
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };

    } catch (error) {
        throw new apiError(500, "failed to generate Access and Refresh token");
    }
}

const registerUser = asyncHandler( async(req, res)=>{
    const {fullName, email, userName, password} = req.body;
    if([fullName, email, userName, password].some(field => field?.trim() === "")){
        throw new apiError(400, "All fields are required!")
    }
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if(existedUser) throw new apiError(409, "Username or email already exists");
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    if(!avatarLocalPath) throw new apiError(400, "avatar is required");
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) throw new apiError(400, "avatar is required");

    const user = await User.create({
        fullName,
        email,
        userName: userName.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });
    const createdUser = await User.findOne({_id: user._id}).select("-password -refreshToken");
    if(!createdUser) throw new apiError(500, "Something went wrong went registering the user");

    return res.status(201).json(new apiResponse(200, createdUser, "User registered Successfully"));
})

const loginUser = asyncHandler( async(req, res)=>{
    const {userName, email, password} = req.body;

    if(!userName && !email) throw new apiError(400, "username or email is required");
    const user = await User.findOne({
        $or: [{userName}, {email}]
    });
    if(!user) throw new apiError(404, "user does not exist" );

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid) throw new apiError(401, "invalid user credentials");

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = user.toObject();
    delete loggedInUser.password;
    delete loggedInUser.refreshToken;

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new apiResponse(200, {
        user: loggedInUser, accessToken, refreshToken
    },"user logged in successfull" ))
})

const logoutUser = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(req.user._id, 
        {
            $set: {refreshToken: undefined}
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "logged out successfull"));
})

const reGenerateAccessToken = asyncHandler(async (req, res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken ;
    if(!incomingRefreshToken) throw new apiError(401, "unauthorized request");

    const decodedInfo = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decodedInfo?._id);
    if(!user) throw new apiError(401, "invalid refresh token");
    const {accessToken,  refreshToken} = await generateAccessAndRefreshToken(user._id);

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new apiResponse(200, {data: {accessToken, refreshToken}}, "Access token re-Generated"));
})

const changeCurrentPassword = asyncHandler(async()=>{
    const {oldPasssword, newPassword} = req.body;
    const user = await User.findById(req.user?._id);
    
})



export {registerUser, loginUser, logoutUser, reGenerateAccessToken}
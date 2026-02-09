import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    // example URL : /videos?page=2&limit=5&query=music&sortBy=views&sortType=desc&userId=123
    //TODO: get all videos based on query, sort, pagination

    const matchConditions = {
        isPublished: true,
    }
    if(userId){
        if(!isValidObjectId(userId)){
            throw new apiError(400, "user is invalid")
        }
        else{
            matchConditions.owner = new mongoose.Types.ObjectId(userId)
        }
    }

    if(query){
        matchConditions.$or = [ { tittle: { $regex: query, $options: "i" } }, { description: { $regex: query, $options: "i" } } ]
    }

    const sortOption = {};
    if(sortBy && sortType){
        sortOption[sortBy] = sortType === "asc" ? 1 : -1;
    }
    else{
        sortOption.createdAt = -1;
    }

    const videoAggregate = Video.aggregate([
        {
            $match: matchConditions
        },
        {
            $sort: sortOption
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "owner",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            userName: 1,
                            avatar: 1
                        }
                    }
                ]

            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$ownerDetails"
                }
            }
        }
    ])

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const videos = await Video.aggregatePaginate(videoAggregate, options);

    return res
    .status(200)
    .json(new apiResponse(200, videos, "videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/ApiError.js"
import { User } from "../models/user.model.js"
import { ApiResponse } from '../utility/APIresponse.js'

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "username missing");
    }
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"

            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribed_to"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedCount: {
                    $size: "$subscribed_to"
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $and: [
                                { $ne: [req.user?._id, null] },
                                { $in: [req.user?._id, "$subscribers.subscriber"] }
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                Fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelSubscribedCount: 1,
                avatar: 1,
                coverImage: 1,
                isSubscribed: 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exist")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, channel[0], "user channel fetched succesfully")
        )
})

export {
    getUserChannelProfile
}
import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        Subscriber: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true,
        },
        channel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true
        }

    },
    {
        timestamps: true
    }
)

export const Subscribe = mongoose.model("Subscribe", subscriptionSchema)
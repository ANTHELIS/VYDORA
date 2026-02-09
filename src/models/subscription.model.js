import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" // user who is subscribing
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" // which user or channel you have subscribed
    }
}, {timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)
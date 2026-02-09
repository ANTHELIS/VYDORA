import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        require: true
    },

}, {timestamps: true})

tweetSchema.plugin(mongooseAggregatePaginate)
export const Tweet = mongoose.model("Tweet", tweetSchema)
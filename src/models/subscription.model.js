import mongoose, { Schema } from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // one to whom 'subscriber' is subscribing
        ref: "User"
    }
}, { timestamps: true })



export const Subscription = mongoose.model("Subscription", subscriptionSchema)

const sub = new Subscription({
    subscriber: "65b2b2dbd5eb710290ab97d0",
    channel: "65b2b2dbd5eb710290ab97d0"
})

sub.save();
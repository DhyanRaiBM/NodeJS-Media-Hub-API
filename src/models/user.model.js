import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)


/* When you retrieve a document from the database or create a new one, Mongoose keeps track of the initial values of its fields.
As you modify fields on the document, Mongoose updates its internal state to reflect the changes.
When you call save(), Mongoose compares the current values of the fields with their initial values. If a field has been modified, isModified returns true; otherwise, it returns false */

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next();//- the next middleware in the sequence (or the actual save operation) should proceed.
})

userSchema.methods.isPasswordCorrect = async function (password) {
    //-This is used to add instance methods to the documents constructed from the schema. Instance methods are methods that you can call on individual document instances (i.e., user instances) created from the schema.
    return await bcrypt.compare(password, this.password)
}


userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },//-Payload
        process.env.ACCESS_TOKEN_SECRET,//-Secret
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }//-Expiry
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },//-Payload
        process.env.REFRESH_TOKEN_SECRET,//-Secret
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }//-Expiry
    )
}
export const User = mongoose.model("User", userSchema)
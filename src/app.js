import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN
}))

app.use(express.json({ limit: "16kb" })); //Json data limit
app.use(express.urlencoded({ extended: true, limit: "16kb" })); //Accept form or any urlencoded data from request body and add it as req.body
app.use(express.static("public"));
app.use(cookieParser());


//-Routes import :
import userRouter from './routes/user.routes.js'
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"


//-Routes declaration :
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)

//http://localhost:8000/api/v1/users/register

import { errorMiddleware } from './middlewares/error.middleware.js';
app.use(errorMiddleware);

export { app }
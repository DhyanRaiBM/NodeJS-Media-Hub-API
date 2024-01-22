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


export { app }
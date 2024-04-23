import dotenv from "dotenv"
import mongoose, { mongo } from "mongoose";
import express from "express";
import dbConnect from "./db/db.js";

dotenv.config(
    {
        path:"./.env"
    }
)

dbConnect()
// ;( async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     }
//     catch(error){
//         console.log(error)
//         throw error
//     }
// })()
import dotenv from "dotenv"
import mongoose, { mongo } from "mongoose";
import express from "express";
import dbConnect from "./db/db.js";
import { app } from "./app.js";

dotenv.config(
    {
        path:"./.env"
    }
)

dbConnect()
.then(()=>{
    app.on("error", (error)=>{
        console.log(`Error while starting app err${error}`)
        throw error
    })
    app.listen(process.env.PORT || 8000, ()=>{
        console.log("server is listening at "+ process.env.PORT)
    })
}).catch(err =>{
    console.log(`Error while listening to server ${err}`)
})
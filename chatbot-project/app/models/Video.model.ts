import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema({
    id:{
        type: String,
    },
    name:{
        type:String,
        required:true
    },
    
})
const mongoose = require ('mongoose')
const {ObjectId} = mongoose.Schema.Types
const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    body:{
        type:String,
        required:true
    },
    photo:{
        type:String,
        default:'no photo'
    },
    price:{
        type:String,
        required:true
    },
    quantite:{
        type:Number,
        required:true
    },
    marque:{
        type:String,
        required:true
    },
    taille:{
        type:String,
        required:true
    },
    type:{
        type:String,
        required:true
    },
    date_pub:{
        type:Date,
        default:Date.now()
    },
    postedBy:{
        type:ObjectId,
        ref:"User"
    }
})

module.exports =mongoose.model("Post",postSchema)
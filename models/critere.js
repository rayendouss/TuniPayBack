const mongoose = require ('mongoose')
const {ObjectId} = mongoose.Schema.Types
const critereSchema = new mongoose.Schema({
    postedBy:{
        type:ObjectId,
        ref:"User"
    },
    price:{
        type:Array,
        required:true
    },
    quantite:{
        type:Array,
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
})

module.exports =mongoose.model("Critere",critereSchema)
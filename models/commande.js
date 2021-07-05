const mongoose= require("mongoose")
const {ObjectId} = mongoose.Schema.Types
const commandeSchema= new mongoose.Schema({
    DateC:{
        type:Date,
        required:true
    },
    commandeBy:{
        type:ObjectId,
        ref:"User",
        required:true
    },
    listCommande: {
        type:ObjectId,
        ref:"Post",
        required:true
    },
    paiement:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:"en cours"
    },
    quantite:{
        type:Number,
        required:true
    }


})
mongoose.model("Commande",commandeSchema)
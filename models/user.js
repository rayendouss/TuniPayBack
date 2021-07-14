const mongoose= require("mongoose")

const userSchema= new mongoose.Schema({
    name:{
        type:String,
    required:true
    },
    email:{
        type:String,
    required:true
    },
    password:{
        type:String,
    required:true
    },
    address:{
        type:String,
       
    },
    resetPasswordlink:{
        type:String
        
    }
})

mongoose.model("User",userSchema)
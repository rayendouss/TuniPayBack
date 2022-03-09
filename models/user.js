const mongoose= require("mongoose")
const {ObjectId} = mongoose.Schema.Types
const userSchema= new mongoose.Schema({
    name:{
        type:String,
    required:true
    },
    lastname:{
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
        required:true
    },
    birth:{
        type:String,
        required:true
    },
    photo:{
        type:String,
         
    },
    genre : {
        type : String ,
        required : true
    },
    resetPasswordlink:{
        type:String
        
    },
    list_vues:[ 
       { type:ObjectId,ref:"User"}
     ],
  

})

mongoose.model("User",userSchema)
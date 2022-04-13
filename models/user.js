const mongoose= require("mongoose")
const {ObjectId} = mongoose.Schema.Types
const userSchema= new mongoose.Schema({
    name:{
        type:String,
    
    },
    lastname:{
        type:String,
    
    },
    email:{
        type:String,
    
    },
    password:{
        type:String,
    
    },
    address:{
        type:String,
        
    },
    birth:{
        type:String,
       
    },
    photo:{
        type:String,
         
    },
    genre : {
        type : String ,
        
    },
    resetPasswordlink:{
        type:String
        
    },
    list_vues:[ 
       { type:ObjectId,ref:"User"}
     ],
    status :{
        type : String ,
        default :""
    }
  

})

mongoose.model("User",userSchema)
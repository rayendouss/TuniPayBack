const express= require("express")
const router= express.Router()
const mongoose= require("mongoose")
const User= mongoose.model("User")
const jwt= require("jsonwebtoken")
const {JWT_SECRET}= require('../database/keys')
const requireLogin= require("../middleware/requireLogin")
router.get('/',requireLogin,(req,res)=>{
    res.send('hello')
})

router.post('/signup',(req,res)=>{
    const {name,email,password,address}=req.body
    if(!email || !password || !name || !address){
       return res.status(422).json({error:"please add the fileds"})
    }
    User.findOne({email:email}).then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:"user already exists"})
        }   
        const user = new User({
            email,
            name,
            password,
            address
        }) 
        user
        .save()
        .then(user=>{
            res.json({message:"successfuly saved",user})
        })
    })

})

router.post('/signin',(req,res)=>{
    const {email,password}=req.body
    if(!email || !password){
     return   res.status(422).json({error:"please add email or password"})
    }
    User.findOne({email:email,password:password})
    .then(user=>{
        if(user){
            const token = jwt.sign({_id:user._id},JWT_SECRET)
            res.json({token,user})
           // return res.json({message:"successfully signed in"})
        }
        else {
            return res.status(422).json({error:"invalid email or password"})
        }
    })
})

module.exports= router
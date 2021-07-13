const express= require("express")
const router= express.Router()
const mongoose= require("mongoose")
const User= mongoose.model("User")
const jwt= require("jsonwebtoken")
const {JWT_SECRET,JWT_ACCOUNT_ACTIVATION,EMAIL_FROM,CLIENT_URL,MAIL_KEY,JWT_RESET_PASSWORD}= require('../database/keys')
const requireLogin= require("../middleware/requireLogin")
const expressJwt = require('express-jwt');
const _ = require('lodash');
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');
const { validationResult } = require('express-validator');
const sgMail = require('@sendgrid/mail');
const { reset } = require("nodemon")
sgMail.setApiKey(MAIL_KEY)

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
            return res.status(500).json({error:"user already exists"})
        }   
        const token=jwt.sign(
            {
                name,
                email,
                password,
                address
            },
            JWT_ACCOUNT_ACTIVATION,
            {
                expiresIn:"30m"
            }
        )
        const emailData={
            from:EMAIL_FROM,
            to:email,
            subject:'Account activation link',
            html: `
            <h1>Please Click to activate your account </h1>
            <p>${CLIENT_URL}/activate/${token} </p>
            <hr/>
            <p>This email contain sensetive info </p>
            <p>${CLIENT_URL} </p> 
            `
        }
        sgMail.send(emailData).then(sent=>{
           
                res.json({message:"successfuly saved and mail activation has been sent",sent})
           
          
        }).catch(err=>{
            return res.status(400).json({
                error:err
            })
        })
       

     
    })

})

router.post('/activation',(req,res)=>{
    const {token}=req.body
  if(token) 
  {
       jwt.verify(token,JWT_ACCOUNT_ACTIVATION,
        (err,decoded)=>{
            if(err)
        { 
               return res.status(401).json({error:"token expired"})
        }
        else {
            const {name,email,password,address}=jwt.decode(token)
            const user = new User({
                email,
                name,
                password,
                address
            }) 
            user.save((err,user)=>{
                if(err){
                    return res.status(401).json({
                        error:"error in register"
                    })
                }
                else{
                    return res.status(200).json({
                        message:"successfully activated",user
                    })
                }
            }) 
        }
        })
    }else{
        return res.status(500).json({
            message:"error token"
        })
    }
    
       
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

router.post('/forgotpassword',(req,res)=>{
    const {email}=req.body
    if(!email ){
        
       return res.status(422).json({error:"please add the email"})
    }
  
      
   
    User.findOne({email:email}).then(user=>{
        if(!user) {
            return res.status(400).json({error:"email inexist"})
        }
        
    
        const token=jwt.sign(
            {
               _id:user._id
            },
            JWT_RESET_PASSWORD,
            {
                expiresIn:"30m"
            }
        )
        const emailData={
            from:EMAIL_FROM,
            to:email,
            subject:' RESET PASSWORD LINK',
            html: `
            <h1>Please Click to reset your password </h1>
            <p>${CLIENT_URL}/password/reset/${token} </p>
            <hr/>
            <p>This email contain sensetive info </p>
            <p>${CLIENT_URL} </p> 
            `
        }
     return user.updateOne({
         resetPasswordlink:token
     },(err,success)=>{
         if(err){
             res.status(500).json({error:err})
         }
         else 
         {
            sgMail.send(emailData).then(sent=>{
           
                res.json({message:" Email has been sent",email})
           
          
        })
         }
     })
    })  

     
    })

 router.put('/resetpassword',(req,res)=>{
     const {resetPasswordlink,newPassword} =req.body
     if(resetPasswordlink){
        
       jwt.verify(resetPasswordlink,JWT_RESET_PASSWORD,function(err,decoded){
             if(err){
                 return res.status(420).json({error:"expired token"})
             }
             User.findOne({resetPasswordlink:resetPasswordlink}).then((result)=>{
              
                 var user = new User({
                     _id:result._id,
                     name:result.name,
                     email:result.email,
                     address:result.address,
                     resetPasswordlink:"",
                     password:newPassword
                 })
                 User.findByIdAndUpdate(result._id,{$set:user},{new:true},(err,doc)=>{
                   if(err){
                    return res.status(422).json({message:err})
                   }
                   return res.status(200).json({message:"password changed ! you can login with the new password"})
                 })
             })
       })
     }

 })   



module.exports= router
const express= require("express")
const router= express.Router()
const mongoose= require("mongoose")
const User= mongoose.model("User")
const jwt= require("jsonwebtoken")
const {JWT_SECRET,JWT_ACCOUNT_ACTIVATION,EMAIL_FROM,CLIENT_URL,MAIL_KEY}= require('../database/keys')
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

module.exports= router
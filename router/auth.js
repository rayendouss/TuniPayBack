const express= require("express")
const router= express.Router()
const mongoose= require("mongoose")
const User= mongoose.model("User")
const jwt= require("jsonwebtoken")
const {JWT_SECRET,JWT_ACCOUNT_ACTIVATION,EMAIL_FROM,CLIENT_URL,MAIL_KEY,JWT_RESET_PASSWORD,GOOGLE_CLIENT}= require('../database/keys')
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

 const client = new OAuth2Client(GOOGLE_CLIENT);
// Google Login
router.post("/googlelogin", (req, res) => {
  const { idToken } = req.body;

  client
    .verifyIdToken({ idToken, audience: GOOGLE_CLIENT })
    .then(response => {
    
      // console.log('GOOGLE LOGIN RESPONSE',response)
      const { email_verified, name, email } = response.payload;
      if (email_verified) {
        User.findOne({ email }).exec((err, user) => {
          if (user) {
            const token = jwt.sign({ _id: user._id }, JWT_SECRET);
            const { _id, email, name ,photo} = user;
            return res.json({
              token,
              user: { _id, email, name,photo }
            });
          } else {
            let password = email + JWT_SECRET;
            user = new User({ name, email, password });
            user.save((err, data) => {
              if (err) {
                console.log('ERROR GOOGLE LOGIN ON USER SAVE', err);
                return res.status(400).json({
                  error: 'User signup failed with google'
                });
              }
              const token = jwt.sign(
                { _id: data._id },
              JWT_SECRET
              );
              const { _id, email, name } = data;
              return res.json({
                token,
                user: { _id, email, name }
              });
            });
          }
        });
      } else {
        return res.status(400).json({
          error: 'Google login failed. Try again'
        });
      }
    });
});

router.post('/FBlogin',(req,res)=>{
    console.log('FACEBOOK LOGIN REQ BODY', req.body);
    const { userID, accessToken } = req.body;
  
    const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
  
    return (
      fetch(url, {
        method: 'GET'
      })
        .then(response => response.json())
        // .then(response => console.log(response))
        .then(response => {
          const { email, name } = response;
          User.findOne({ email }).exec((err, user) => {
            if (user) {
              const token = jwt.sign({ _id: user._id }, JWT_SECRET);
              const { _id, email, name ,password} = user;
              return res.json({
                token,
                user: { _id, email, name, password }
              });
            } else {
              let password = email +JWT_SECRET;
              user = new User({ name, email, password });
              user.save((err, data) => {
                if (err) {
                  console.log('ERROR FACEBOOK LOGIN ON USER SAVE', err);
                  return res.status(400).json({
                    error: 'User signup failed with facebook'
                  });
                }
                const token = jwt.sign(
                  { _id: data._id },
                JWT_SECRET
                );
                const { _id, email, name } = data;
                return res.json({
                  token,
                  user: { _id, email, name }
                });
              });
            }
          });
        })
        .catch(error => {
          res.json({
            error: 'Facebook login failed. Try later'
          });
        })
    );
})

router.put('/updatePr',requireLogin,(req,res)=>{
  var user= new User({
    _id:req.body._id,
    name:req.body.name,
    lastname:req.body.lastname,
    birth:req.body.birth,
    genre:req.body.genre,
    email:req.body.email,
    address:req.body.address,
    photo: req.body.photo,
    password:req.body.password
})
User.findOne({_id:req.body._id},function (err,doc) {
  console.log(doc)
  console.log(req.user._id)
  if(doc._id.toString()==req.user._id.toString()){
  User.findByIdAndUpdate(doc._id,{$set:user},{new:true},(err,doc)=>{
      if(!err){
          res.send({user:doc})
      }
      else {
          console.log(err)
      }
  })
  }else {
      res.json("mchhowaAA")
    }
})

})

router.get('/allUser',requireLogin,(req,res)=>{
  User.find()
  .sort({_id:-1})
  .then(result=>{
    return  res.json({result})
  })
})

router.get('/userId/:id',requireLogin,(req,res)=>{
  User.findById({_id:req.params.id})
  .sort({_id:-1})
  .then(result=>{
    return  res.json(result)
  })
})

router.post('/addVue/:id',(req,res)=>{
  User.findOne({_id:req.params.id}).then(user=>{
    if(!user) {
        return res.status(400).json({error:"user inexist"})
    }
    console.log(req.body._id)
    User.findByIdAndUpdate(
     req.params.id
  ,{$push:{list_vues:req.body._id}},{new:true},(err,success)=>{
    return  res.json({user})
  })
  })
})

router.get('/listVue/:id',(req,res)=>{
  User.findOne({_id:req.params.id})
  .populate('list_vues',"_id")
  .then(user=>{
    if(!user) {
        return res.status(400).json({error:"user inexist"})
    }
   else{
    return res.json(user.list_vues)
   }
  })
})

router.post('/adminsignup',(req,res)=>{
  const {name,email,password,status,photo}=req.body

  User.findOne({email:email}).then((savedUser)=>{
      if(savedUser){
          return res.status(500).json({error:"user already exists"})
      }   
    else {
      const user = new User({
        email,
        name,
        password,
        status,photo
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

})

module.exports= router
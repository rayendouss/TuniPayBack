const express= require("express")
const router= express.Router()
const mongoose= require("mongoose")
var nodemailer = require('nodemailer');
const hbs = require("nodemailer-express-handlebars");
const path = require("path")
const Post= mongoose.model("Post")
const User= mongoose.model("User")
const Critere= mongoose.model("Critere")

const requireLogin= require("../middleware/requireLogin")
router.post('/createpost',requireLogin,(req,res)=>{
 
    const {title,body,photo,price,quantite,marqueV,tailleV,gender}= req.body
    if(!title || !body || !price ||!quantite ) {
        return res.status(422).json({error:"Please add all fields"})
    }
    req.user.password=undefined
    const post= new Post({
        title,
        body,
        photo,
        price,
        quantite,
        postedBy:req.user,
        marque:marqueV,
        taille:tailleV,
        type:gender
    })
    post.save().then(result => {
      
        res.status(200).json({post:result})
    }).catch((err)=> {
        res.status(500).json({err})
    })
})
router.get('/allposts/:type',(req,res)=>{
    
    var request={}
    switch(req.params.type){
        case "all":
            request={}
            break;
        case "men":
            request["type"]="men"
            break;
        case "women":
            request["type"]="women"
        break;
        case "kids":
            request["type"]="kids"
        break;
      
    }
 
    Post.find(request)
    .sort({_id:-1})
    .populate("postedBy","_id name email photo lastname")
    .then(result=>{
        console.log('dkhal')
        res.json({posts:result})
    })
})

router.get('/mypost',requireLogin,(req,res)=>{
    Post.find({postedBy:req.user})
    .sort({_id:-1})
    .populate("postedBy","_id name email")
    .then(result=>{
        res.json({mypost:result})
    })
})

router.get('/post/:id',requireLogin,(req,res)=>{
    Post.findById({_id:req.params.id})
   
    .populate("postedBy","_id name email lastname photo")
    .then(result=>{
        res.json({post:result})
    })
})

router.delete('/deleteP/:id',requireLogin,(req,res)=>{
    Post.findOne({_id:req.params.id})
    .populate("postedBy","_id")
    .exec((err,post)=>{
        if(err || !post){
            return res.status(422).json({error:err})
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
            post.remove()
            .then(result=>{
                Post.find({postedBy:req.user})
                .sort({_id:-1})
                .populate("postedBy","_id name email")
                .then(result=>{
                    res.json({posts:result})
                })
            }).catch(err => {
                console.log(err)
            })
        }
    })
})

router.get('/userpost/:id',requireLogin,(req,res)=>{
    Post.find({postedBy:req.params.id})
    .populate('postedBy',"name lastname photo")
    .then(result=>{
        res.json({post:result})
    })
})

router.post('/recherche',(req,res)=>{

    console.log('body',req.body.taille)
    var request ={}
    var sortx={}
    if(req.body.tri)
    { 
        switch(req.body.tri){
            case 1:
                sortx = { price: 1 }
                break;
            case 2:
                sortx = { price: -1 }
            break;
            case 3:
                sortx = { _id: -1 }
            break;
              case 4: 
                sortx = { _id: 1 }
            break;
                }

    }
    if(req.body.marqueV){
        request["marque"]=req.body.marqueV
    }
 
        switch(req.body.taille){
            case 0:
                request["taille"]="XS"
                break;
            case 1:
                request["taille"]="S"
                break;
            case 2:
                request["taille"]="M"
            break;
            case 3:
                request["taille"]="L"
            break;
              case 4: 
              request["taille"]="XL"
            break;
            case 5: 
              request["taille"]="XXL"
            break;
        }
     
    
    if(req.body.value){
        console.log("0",req.body.value[0],"1",req.body.value[1])
       if(req.body.value[0]>0&&req.body.value[1]<500)
       {
           request["price"]={"$gte":req.body.value[0],"$lte":req.body.value[1]}
       }else if (req.body.value[0]>0&&req.body.value[1]==500){
           request["price"]={"$gte":req.body.value[0]}
       } else if(req.body.value[1]<500 && req.body.value[0]==0){
           request["price"]={"$lte":req.body.value[1]}
       }
   }
   if(req.body.valueq){
       if(req.body.valueq[0]>0&&req.body.valueq[1]<40)
       {
           request["quantite"]={"$gte":req.body.valueq[0],"$lte":req.body.valueq[1]}
       }else if (req.body.valueq[0]>0){
           request["quantite"]={"$gte":req.body.valueq[0]}
       } else if(req.body.valueq[1]<40){
           request["quantite"]={"$lte":req.body.valueq[1]}
       }
   }

    Post.find(request).sort(sortx)
    .then(result=>{
        
        res.json({post:result})
    })
})

router.post('/sendMail/:id',(req,res)=>{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
               user: 'veepeetunisie@gmail.com',
               pass: '1Azertyuiop?'
           }
       });
       console.log("dkhal");
       Post.find({_id:req.params.id})
         .sort({ _id: -1 })
         .limit(5)
         .lean()
         .then((data) => {
           console.log("jeb",data);
           const bientosend = [data[0]];
           const envir = `http://localhost:3000/collections`;
           console.log(data.length);
           if (data.length > 0) {
             const mailOptions = {
               to: req.body.email,
               from: "veepeetunisie@gmail.com",
               subject: " Ne ratez pas les nouveaux articles pour vos commandes ",
               template: "index",
               context: {
                 envir,
                 bien: bientosend,
                
                 user: `rayen douss`,
               },
             };
             transporter.use(
               "compile",
               hbs({
                 viewEngine: {
                   extName: ".handlebars",
                   partialsDir: path.resolve("./service/mail"),
                   defaultLayout: false,
                 },
                 viewPath: path.resolve("./service/mail"),
                 extName: ".handlebars",
               })
             );
             transporter.sendMail(mailOptions, (err) => {
               if (err) {
                 console.log(err);
               } else {
              return res.status(200).json({msg:"mail envoyé"})
               }
             });
           }
         });
})

router.post('/notifposts',(req,res)=>{

 
    var taille={}
    switch(req.body.taille2){
        case 0:
            taille="XS"
            break;
        case 1:
            taille="S"
            break;
        case 2:
            taille="M"
        break;
        case 3:
            taille="L"
        break;
          case 4: 
          taille="XL"
        break;
        case 5: 
        taille="XXL"
        break;
    }
  
    const critere= new Critere({
      
        price:req.body.value2,
        quantite:req.body.valueq2,
        postedBy:req.body.ide,
        marque:req.body.marqueV2,
        taille
       
    })
    
  
    
    Critere.find({price:req.body.value2,quantite:req.body.valueq2,marque:req.body.marqueV2,taille:taille}).then(resc=>{
       
        if(resc.length>0){
            res.json({msg:"critere already exist"})
        }else {
            critere.save().then(result => {
      
        
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                           user: 'veepeetunisie@gmail.com',
                           pass: '1Azertyuiop?'
                       }
                   });
               
                   const mailOptions = {
                    to:req.body.email,
                    from: "veepeetunisie@gmail.com",
                    subject: " Ne ratez pas les nouveaux articles pour vos commandes ",
                    template: "critere",
                    context: {
                     
                     
                      
                    },
                  };
                  transporter.use(
                    "compile",
                    hbs({
                      viewEngine: {
                        extName: ".handlebars",
                        partialsDir: path.resolve("./service/"),
                        defaultLayout: false,
                      },
                      viewPath: path.resolve("./service/"),
                      extName: ".handlebars",
                    })
                  );
                  transporter.sendMail(mailOptions, (err) => {
                    if (err) {
                      console.log(err);
                    } else {
                   return res.status(200).json({msge:"mail envoyé"})
                    }
                  });
                
        }).catch((err)=> {
            res.status(500).json({err})
        })
        }
    })
   
})

router.get('/getmycritere/:id',(req,res)=>{
 Critere.find({postedBy:req.params.id})
 .sort({_id:-1})
 .then(result=>{
   res.json({critere:result})
    })
   
})

router.delete('/deletecritere/:id',(req,res)=>{
    Critere.deleteOne({_id:req.params.id})
    .then(result=>{
        Critere.find().then(results=>{
            res.json({critere:results})
        })
    })
})


router.get('/productname/:name',(req,res)=>{
    
  
 
    Post.find({marque:req.params.name,status:"verified"})
    .sort({_id:-1})
   
    .then(result=>{
        console.log('dkhal')
        res.json({posts:result})
    })
})


router.post('/createpost2',requireLogin,(req,res)=>{
 
    const {title,body,photo,price,quantite,marqueV,tailleV,gender}= req.body
    if(!title || !body || !price ||!quantite ) {
        return res.status(422).json({error:"Please add all fields"})
    }
    req.user.password=undefined
    const post= new Post({
        title,
        body,
        photo,
        price,
        quantite,
        postedBy:req.user,
        marque:marqueV,
        taille:tailleV,
        type:gender,
        status:"verified"
    })
    post.save().then(result => {
      
        res.status(200).json({post:result})
    }).catch((err)=> {
        res.status(500).json({err})
    })
})


module.exports= router
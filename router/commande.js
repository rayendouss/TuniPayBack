const express= require("express")
const router= express.Router()
const mongoose= require("mongoose")
const Commande= mongoose.model("Commande")
const Post= mongoose.model("Post")
const requireLogin= require("../middleware/requireLogin")
var nodemailer = require('nodemailer');
const hbs = require("nodemailer-express-handlebars");
const path = require("path")
router.post('/addCommande',requireLogin,(req,res)=>{
      const {listCommande,paiement,quantite}=req.body
    if(!listCommande || !paiement || !quantite ) {
        return res.status(422).json({error:"Please add all fields"})
    }
    req.user.password=undefined
   

    const commande= new Commande({
       DateC:new Date(),

        commandeBy:req.user,
        listCommande: req.body.listCommande,
        paiement:req.body.paiement,
        quantite:req.body.quantite,
        address:req.body.address
        
    })
    
       Post.findById({_id:listCommande._id})
        .then((resu)=>{
            
            var post = new Post({
                _id:resu._id,
                photo:resu.photo,
                title:resu.title,
                body:resu.body,
                price:resu.price,
                postedBy:resu.postedBy,
                quantite:resu.quantite-req.body.quantite
            })
            Post.findByIdAndUpdate(resu._id,{$set:post},{new:true},(err,doc)=>{
                commande.save().then(result => {
                    res.json({commande:result})
                })
            })
        })
  /*  commande.save().then(result => {
        res.json({commande:result})
    }).catch((err)=> {
        res.json({err})
    })*/
})

router.get('/allCommandes',requireLogin,(req,res)=>{
    Commande.find()
    .populate("commandeBy","_id name email lastname photo")
    .populate("listCommande")
 
    .then((result)=>{
        res.json({commandes:result})
    })
})

router.get('/commande/:id',(req,res)=>{
    Commande.findById({_id:req.params.id})
    .populate("commandeBy")
    .populate("listCommande")
   
    .then(result=>{
        res.json({commande:result})
    })
})

router.delete('/commande/:id',requireLogin,(req,res)=>{
    Commande.findByIdAndDelete({_id:req.params.id})
    .then(result=>{
        res.json({msg:"commande deleted"})
    })
})

router.get('/mycommande',requireLogin,(req,res)=>{
    Commande.find({commandeBy:req.user})
 
    .populate("commandeBy","_id name email lastname photo")
    .populate("listCommande","_id title photo price")
    .sort({_id:-1})
    .then(result=>{
        res.json({result})
    })
})
router.put('/addCommandeDateReception/:id',(req,res)=>{
    Commande.findOne({_id:req.params.id},function (err,doc) {
        console.log('doc',req.body)
        doc.date_Reception=req.body.dateR
        
    Commande.findOneAndUpdate({_id:doc._id},{$set:doc},{new:true},(err,result)=>{
        Commande.findOne({_id:doc.listCommande},function (err,res)    
        {
        
            var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                   user: 'veepeetunisie@gmail.com',
                   pass: '1Azertyuiop?'
               }
           });
        
           const envir = `http://localhost:3000/collections`;
         
            const mailOptions = {
              to: req.body.email,
              from: "veepeetunisie@gmail.com",
              subject: " Ne ratez pas les nouveaux articles pour vos commandes ",
              template: "index",
              context: {
                envir,
                photo: req.body.photo,
                marque:req.body.marque,
                type:req.body.type,
                taille:req.body.taille,
                quantite:req.body.quantite,
                price:req.body.quantite * parseInt(req.body.price,10),
                user: `rayen douss`,
                paiement:req.body.paiement,
                dateRec :req.body.date_rec.substr(0,10)
              },
            };
            console.log('mailOptions',mailOptions.context)
            transporter.use(
                "compile",
                hbs({
                  viewEngine: {
                    extName: ".handlebars",
                    partialsDir: path.resolve("./service/mail/commande"),
                    defaultLayout: false,
                  },
                  viewPath: path.resolve("./service/mail/commande"),
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
        })

        res.json({result})
    })
    })
})


router.get('/commandetraite',(req,res)=>{
    Commande.find({date_Reception:{$exists:true}})
    
    .populate("commandeBy","_id name email lastname photo")
    .populate("listCommande","_id title photo price")
    .sort({date_Reception:-1})
    .then(result=>{
        res.json({result})
    })
})
module.exports= router
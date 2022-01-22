const express= require("express")
const router= express.Router()
const mongoose= require("mongoose")
const Commande= mongoose.model("Commande")
const Post= mongoose.model("Post")
const requireLogin= require("../middleware/requireLogin")

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

router.get('/commande/:id',requireLogin,(req,res)=>{
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
module.exports= router
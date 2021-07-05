const express= require("express")
const router= express.Router()
const mongoose= require("mongoose")
const Commande= mongoose.model("Commande")
const requireLogin= require("../middleware/requireLogin")

router.post('/addCommande',requireLogin,(req,res)=>{
      const {listCommande,paiement}=req.body
    if(!listCommande || !paiement ) {
        return res.status(422).json({error:"Please add all fields"})
    }
    req.user.password=undefined
    const commande= new Commande({
       DateC:new Date(),

        commandeBy:req.user,
        listCommande: req.body.listCommande,
        paiement:req.body.paiement
        
    })
    commande.save().then(result => {
        res.json({commande:result})
    }).catch((err)=> {
        res.json({err})
    })
})
module.exports= router
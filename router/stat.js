const express= require("express")
const router= express.Router()
const mongoose= require("mongoose")
var nodemailer = require('nodemailer');
const hbs = require("nodemailer-express-handlebars");
const path = require("path")
const Post= mongoose.model("Post")
const User= mongoose.model("User")
const Commande= mongoose.model("Commande")
const Critere= mongoose.model("Critere")

router.get('/getNbnuser',(req,res)=>{
    Commande.aggregate(
        [{
            $group: {
                _id: "$paiement",
                count: {
                    $sum: 1
                }
        
            }
        }]
    ).then((stat) => {
        res.json(stat);
      });
})

router.get('/getbestproduct',(req,res)=>{
    Commande.aggregate(
        [
            {
              '$group': {
                '_id': '$listCommande', 
                'count': {
                  '$sum': 1
                }
              }
            }
          ]
    )
    
    .then((stat) => {
        
        res.json(stat);
      });
})


module.exports= router
const express= require("express")
const router= express.Router()
const mongoose= require("mongoose")
const Post= mongoose.model("Post")

const requireLogin= require("../middleware/requireLogin")
router.post('/createpost',requireLogin,(req,res)=>{
    const {title,body,photo,price,quantite}= req.body
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
        postedBy:req.user
    })
    post.save().then(result => {
        res.json({post:result})
    })
})
router.get('/allposts',requireLogin,(req,res)=>{
    Post.find()
    .populate("postedBy","_id name email")
    .then(result=>{
        res.json({posts:result})
    })
})

router.get('/mypost',requireLogin,(req,res)=>{
    Post.find({postedBy:req.user})
    .populate("postedBy","_id name email")
    .then(result=>{
        res.json({mypost:result})
    })
})


module.exports= router
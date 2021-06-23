const express = require ("express")
const mongoose=require('mongoose')
const{MONGOURI}= require("./database/keys")
const cors = require("cors")
const app = express()
const port = 5000
require ('./models/user')
app.use(express.json())
app.use(cors())
app.use(require('./router/auth'))

mongoose.connect(MONGOURI,{
    useUnifiedTopology: true , useNewUrlParser: true 
})
mongoose.connection.on('connected',()=>{
    console.log("connected to mongoDB atlas")
})
mongoose.connection.on('error',(err)=>{
    console.log("error connecting",err)
})


app.listen(port,()=>{
    console.log(`Server listening on port ${port}`);
})


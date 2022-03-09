const express = require ("express")
const mongoose=require('mongoose')

const{MONGOURI}= require("./database/keys")
const cors = require("cors")
const app = express()
const mailnotif = require('./service/mail/mailnotif');

const port = 5000
var cron = require('node-cron');

cron.schedule('*/1 * * * *', () => {

 // mailnotif.searchbiens()
});
require ('./models/user')
require ('./models/post')
require ('./models/commande')
require ('./models/critere')

app.use(express.json())
app.use(cors())
app.use(require('./router/auth'))
app.use(require('./router/post'))
app.use(require('./router/commande'))


mongoose.connect(MONGOURI,{
    useUnifiedTopology: true , useNewUrlParser: true ,useFindAndModify:true
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


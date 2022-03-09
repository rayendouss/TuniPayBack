var nodemailer = require('nodemailer');
const mongoose= require("mongoose")
const Post= require('../../models/post')
const hbs = require("nodemailer-express-handlebars");
const path = require("path")
var transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
        user: 'veepeetunisie@gmail.com',
        pass: '1Azertyuiop?'
    }
});

exports.searchbiens= ()=> {
    console.log("dkhal");
    Post.find()
      .sort({ _id: -1 })
      .limit(5)
      .lean()
      .then((data) => {
        console.log("jeb",data);
        const bientosend = [data[0], data[1], data[2], data[3], data[4]];
        const envir = `http://localhost:3000/collections`;
        console.log(data.length);
        if (data.length > 0) {
          const mailOptions = {
            to: "mohamedrayane.douss@esprit.tn",
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
              console.log("Client: 📧~", ` ✅`);
            }
          });
        }
      });
  };
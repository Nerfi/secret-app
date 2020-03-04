require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();
const port = 3000;
//adding mongoDB
const mongoose = require("mongoose");
//requiring encryption
const encrypt = require('mongoose-encryption');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

//1) connecting
//this is the default port "mongodb://localhost:27017/ + name of the db"
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true, useUnifiedTopology: true });

// 2) creatin schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

//using encrytion

//important to use this before the creatin of the model
//encryptedFileds is use to encrypt just some fields, the ones we want to
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedField: ['password'] });


// 3) creating model
const User = new mongoose.model("User", userSchema);




app.get("/", function(req,res){
  res.render("home");
});

app.get("/login", function(req,res){
  res.render("login");
});

app.post("/login", function(req,res){
  const username = req.body.username;
  const password = req.body.password;
  //checking to see if we have a user with those credentials in order to be able to login
  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err)
    } else {
      if(foundUser.password === password){
         res.render("secrets");
      }
    }
  })

});

app.get("/register", function(req,res){
  res.render("register");
});

app.post("/register", function(req, res){

    const newUser = new User({
      email: req.body.username,
      password: req.body.password
    })

  newUser.save((err) => err ?  console.log(err) : res.render("secrets") );
});


app.get("/submit", function(req,res){
  res.render("submit");
});




app.listen(port, function(req,res) {
  console.log("server running in port " + port);
});

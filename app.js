require('dotenv').config();
//hashing, not useful when using bcryp for salty password
//const md5 = require('md5');

const bcrypt = require("bcrypt");

//defining salt grams
const saltGrams = 10;


const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();
const port = 3000;
//adding mongoDB
const mongoose = require("mongoose");
//requiring encryption, not useful when we use hashing encryption
//const encrypt = require('mongoose-encryption');

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
//userSchema.plugin not useful when working whith hashing
//userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedField: ['password'] });


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
      if(foundUser){
          //callback function taken from the docs, in the docs as the second parameter we get 'hash', which in our case is foundUser.password, which is a hash, the one
          //that the callbakc wanted to compare to in our case foundUser.password
        bcrypt.compare(password, foundUser.password).then(function(result) {
      // result == true
      if(result == true){
         res.render("secrets");

      }
    });




      }
    }
  })

});

app.get("/register", function(req,res){
  res.render("register");
});

app.post("/register", function(req, res){

  bcrypt.hash(req.body.password, saltGrams, function(err, hash) {
    // Store hash in your password DB.
      const newUser = new User({
        email: req.body.username,
        //using md5 package in order to make this password encrypted by hashing,lecture 402
        //now usingthe hash that comes from the callback function we have implemented throught the docs,lesson 404
        password: hash
      })

    newUser.save((err) => err ?  console.log(err) : res.render("secrets") );

  });

});


app.get("/submit", function(req,res){
  res.render("submit");
});




app.listen(port, function(req,res) {
  console.log("server running in port " + port);
});

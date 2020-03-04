require('dotenv').config();
//hashing, not useful when using bcryp for salty password
//const md5 = require('md5');
//changed for passport level 5 security
//const bcrypt = require("bcrypt");

//defining salt grams
//level 5 passport and cookies
//onst saltGrams = 10;

//in order to use passport adn cookies
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


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
//using passport level 5 security
app.use(session({
  secret: "my secret.",
  resave: false,
  saveUninitialized: false
}))

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
//we are gonna include passport and cookies

});

app.get("/register", function(req,res){
  res.render("register");
});

app.post("/register", function(req, res){
//we are gonna include passport and cookies


});


app.get("/submit", function(req,res){
  res.render("submit");
});




app.listen(port, function(req,res) {
  console.log("server running in port " + port);
});

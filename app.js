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

//requiring google auth passport strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const port = 3000;
//adding mongoDB
const mongoose = require("mongoose");
//findOrCreate in order to use google passport, this method does not exist in the mongoose Db that's why we use this plugin
const findOrCreate = require('mongoose-findorcreate');

//requiring encryption, not useful when we use hashing encryption
//const encrypt = require('mongoose-encryption');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');

//1) connecting
//this is the default port "mongodb://localhost:27017/ + name of the db"
//using passport level 5 security
app.use(session({
  secret: "my secret.",
  resave: false,
  saveUninitialized: false
}));

//intializing passport
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true, useUnifiedTopology: true });
//in order to stop the error warning
mongoose.set('useCreateIndex', true);
// 2) creatin schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  //we added this in order to store the googleId of the logged user, this line is related with line 104
  googleId: String,
  //we're saying that each user can have many secrets, secrets is an array
  secrets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
});

//creating posts schema
const postSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String
});



//creating post model

const Post = new mongoose.model("Post", postSchema);

//initializing passpor local mongooose
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

//using encrytion

//important to use this before the creatin of the model
//encryptedFileds is use to encrypt just some fields, the ones we want to
//userSchema.plugin not useful when working whith hashing
//userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedField: ['password'] });


// 3) creating model
const User = new mongoose.model("User", userSchema);

//configuiring passport local
passport.use(User.createStrategy());

//passport.serializeUser(User.serializeUser());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
//for testing if the relationship DB works

//passport.deserializeUser(User.deserializeUser());

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//using google passport
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



app.get("/", function(req,res){
  res.render("home");
});


app.get('/auth/google',
    //use passport to authenticate the user with google strategy, which we have setted up above line82, reading the docs we obtaing this
  passport.authenticate('google', { scope: ['profile'] }
));


app.get('/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });


app.get("/login", function(req,res){
  res.render("login");
});

app.post("/login", function(req,res){
//we are gonna include passport and cookies
  const  user = new User({
    username: req.body.username,
    password: req.body.password
  });
  //login method comes from passport, read docs for more info
  req.login(user, function(err){
    if(err){
      console.log(err);
    } else {
      passport.authenticate("local")(req,res, function(){
      res.redirect("/secrets");
    })
    }

  });

});

app.get("/register", function(req,res){
  res.render("register");
});


app.get("/secrets", function(req,res){
  //we gonna allow all the users to see the secrets publish, "$ne" means not equal

  User.find({"secrets": {$ne: null}}).populate("secrets").exec(function(err, foundUser){
    if(err){
      console.log(err);
    } else {
      res.render("secrets", {usersWithSecrets: foundUser});
    }
  });


});


app.post("/register", function(req, res){
//we are gonna include passport and cookies
const username = req.body.username;
const password = req.body.password;

  User.register({username: username}, password,function(err,user){
  if(err) {
    console.log(err);
    res.redirect("/register");

  } else {
    passport.authenticate("local")(req,res, function(){
      res.redirect("/secrets");
    })
  }

  });

});


app.get("/submit", function(req,res){

  if(req.isAuthenticated()){
    res.render("submit");
  } else {
    res.redirect("/login");
  }

});


//letting the user publish a secret
app.post("/submit",  function(req, res){
  //taking what the user typed in
  const submitedSecret = req.body.secret;
  //let secrets = [];

    User.findById(req.user.id, async function(err, foundUser){
      if(err) {
        console.log(err);
      } else {
        console.log(typeof(foundUser.secrets));
        console.log(foundUser);
         //const found = foundUser.secrets;
        //JSON.stringify(found);
         //in the case there is no error we will be able to "touch" our schema throught foundUser parameter, that's why we can write foundUser.secret
        foundUser.secrets = submitedSecret;
        await foundUser.save().catch(err => console.log(err));
        res.redirect("/secrets");

      }
    });

});

app.get("/logout", function(req,res){
  ///deaunthenticate the user once he logsout
  req.logout(); // from the docs
  res.redirect("/");
});



app.listen(port, function(req,res) {
  console.log("server running in port " + port);
});

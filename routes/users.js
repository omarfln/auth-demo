var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload=(multer({dest:'./uploads'}));
var User=require('../models/user');
var passport =require('passport');
var LocalStrategy = require('passport-local').Strategy;
var nodeMailer=require('nodemailer');
const bcrypt = require('bcryptjs');

const {check, validationResult} = require('express-validator/check');
var { requireAuth, requireAdmin } = require('../middleware/authenticationMiddleware');

/* GET users listing. */
/*
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
*/
//////////////////
//Get all users: Authenticated users only

router.get('/all', requireAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const person = req.user || {};


    res.render('users', {
      users: users,
      person: person
    });
  } catch (error) {
    errors.push({ msg: 'Server error' });
  }
});
var upload = multer({ dest: './uploads' });

//Create user: Admin only



//Update user: Admin only
router.get('/edit/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.render('error', { message: 'User was not found.' });
    }
    res.render('editUser', { user: user });
  } catch (error) {
    res.render('error', { message: 'Server error: failed to load edit page.' });
  }
});

router.post('/update/:id', requireAdmin, async (req, res) => {
  try {
    const { name, email, uname, contact, role } = req.body;
    console.log(req.body)
    if (!name || !email || !uname || !contact || !role) {
      res.render('error', { message: 'All fields are required' });
      return;
    }
    const user = await User.findByIdAndUpdate(req.params.id, { name, email, uname, contact, role }, { new: true });
    if (!user) {
      res.render('error', { message: 'User not found' });
      return;
    }
    res.redirect('/users/all');
  } catch (error) {
    console.log(error);
    res.render('error', { message: 'Server issue: failed to update user.' });
    return;
  }
});

router.delete('/delete/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.render('error', { message: 'User not found' });
    }
    res.send('User deleted successfully.');
    res.redirect('/users/all');
  } catch (error) {
    console.log(error)
    res.render('error', { message: 'Server issue: unable to delete user' });
  }
});
/////////////////

router.get('/register', function(req, res, next) {
  res.render('register',{title:'Register'});
});
router.get('/login', function(req, res, next) {
  res.render('login',{title:'Login'});
});
router.post('/login',
  passport.authenticate('local',{failureRedirect:'/users/login',failureFlash:'Invalid Credentials'}),
  function(req,res){
    req.flash('success','You are now logged in');
    res.redirect('/users/all');
});

passport.serializeUser(function(user,done){
  done(null,user.id);
});
passport.deserializeUser(function(id,done){
  User.getUserById(id,function(err,user){
    done(err,user);
  });
}); 
passport.use(new LocalStrategy(function(username,password,done){
  User.getUserByUsername(username,function(err,user){
    if(err) throw err;
    if(!user){
      return done(null,false,{message:'unknown user'});
    }
    User.comparePassword(password,user.password,function(err,isMatch){
      if(err) return done(err);
      if(isMatch){
        return done(null,user);
      }
      else{
        return done(null,false,{message:'Invalid Password'});
      }
    });
  });
}));

router.post('/register',upload.single('profile'),[
  check('name','Name is empty!! Required').not().isEmpty(),
  check('email', 'Email required').not().isEmpty(),
  check('contact','contact length should be 10').not().isEmpty().isLength({max:10})
],function(req,res,next){
  var form={
    person:req.body.name,
    email:req.body.email,
    contact:req.body.contact,
    uname:req.body.username,
    pass:req.body.password
  };
  console.log(form)
  const errr = validationResult(req);
    if (!errr.isEmpty()) {
      console.log(errr);
      res.render('register',{errors:errr.errors,form:form});
    } else {
      var name=req.body.name;
      var email=req.body.email;
    var uname=req.body.username;
    var password=req.body.password;
    var contact=req.body.contact;
    if(req.file){
      var profileimage=req.file.filename;
    }
    else{
      var profileimage='noimage.jpg';
    }
    var newUser=new User({
      name:name,
      email:email,
      password:password,
      profileimage:profileimage,
      uname:uname,
      contact:contact
    });
    User.createUser(newUser,function(){
      console.log(newUser);
    });
    var transporter = nodeMailer.createTransport({
      service:'Gmail',
      auth:{
          user:'ankurlohiya3@gmail.com',
          pass:'******'
      }
  });
var mailOptions={
    from:'Deepankur Lohiya<ankurlohiya3@gmail.com>',
    to:`${email}`,
    subject:'Confirmation Email',
    text:'You have been sucessfully registered with us',
    html:`<ul><li>Name:${name}</li><li>Mobile No.:${contact}</li><li>Profile:${profileimage}</li></ul>`
}
transporter.sendMail(mailOptions,(err,info)=>{
    if(err){
        console.log(err);
    }
    else{
        console.log(`Mail Sent at ${req.body.email}`);
    }
});
  //res.location('/');
  res.redirect('/users/all');
}
});
router.get('/logout',function(req,res){
  req.logout();
  req.flash('success','You are now logged out');
  res.redirect('/users/login');
});
module.exports = router;
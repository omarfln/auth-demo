var mongoose=require('mongoose');
var bcrypt=require('bcryptjs');
var express = require('express');
const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;
const database = process.env.MONGO_DATABASE;
const host = process.env.MONGO_HOST;

const uri = `mongodb://${username}:${password}@${host}:27017/${database}?authSource=admin`;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB started...'))
    .catch(err => console.error(err));

/*
mongoose.connect('mongodb://localhost/login_database',{useNewUrlParser: true,useUnifiedTopology: true})
    .then(()=> console.log('Connection Established'))
    .catch((err)=>console.log(err))

 */
var db=mongoose.connection;
var userSchema=mongoose.Schema({
    name:{
        type:String,
        index:true
    },
    password:{
        type:String
    },
    email:{
        type:String
    },
    profileimage:{
        type:String
    },
    uname:{
        type:String
    },
    contact:{
        type:Number
    },
    role: {
        type: String,
        default: 'user', //Default value always user role
        enum: ['admin', 'user']
    }
});


var User=module.exports=mongoose.model('user',userSchema);
module.exports.getUserById=function(id,callback){
    User.findById(id,callback);
};
module.exports.getUserByUsername=function(username,callback){
    var query={uname:username}
    User.findOne(query,callback);
};

module.exports.comparePassword=function(candidatepassword,hash,callback){
    bcrypt.compare(candidatepassword,hash,function(err,isMatch){
        callback(null,isMatch);
    }); 
};
module.exports.createUser=function(newUser,callback){
    bcrypt.genSalt(10,function(err,salt){
        bcrypt.hash(newUser.password,salt,function(err,hash){
            newUser.password= hash
            newUser.save(callback);
        });
    });
}
 
const mongoose=require("mongoose")
const passportLocalMongoose = require('passport-local-mongoose');
const validator = require("validator")

const userSchema = mongoose.Schema({
name:{
    type:String,
    required:true,
    minLength:3,
    unique: true,
},
email:{
    type:String,
    required:true,
    unique: true,
    validate(value){
if(!validator.isEmail(value)){
throw new Error("invalid email")
}
    }
},
password:{
type:String,
required:true,
minLength:5

},
blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],

profileImage:{
    type:String,
    default:"null"
}
})
userSchema.plugin(passportLocalMongoose, { usernameField: 'name' });

const User = mongoose.model("User",userSchema)


module.exports=User;
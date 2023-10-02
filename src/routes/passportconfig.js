const LocalStrategy = require('passport-local').Strategy;
 const User = require("../models/users");
 const bcrypt = require('bcrypt');
exports.initializingPassport = (passport)=>{
 passport.use(new LocalStrategy({
    usernameField: 'name',
    passwordField: 'password',
  }, async (name , password,done)=>{

    try {
        const user = await User.findOne({name});
        if (!user) return done(null,false);
        const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return done(null, false);
        return done(null,user);
        
    } catch (error) {
        return done(error,false);
    }
   

 }));

 passport.serializeUser((user,done)=>{
done(null,user.id);
 });

 passport.deserializeUser(async(id,done)=>{
    try {
        const user = await User.findById(id);
        done(null,user);
    } catch (error) {
        done(error,false);
    }
     });

}
exports.isAuthenticated =(req,res ,next)=>{

    if (req.user) return next();
    res.redirect("/auth/login");
}
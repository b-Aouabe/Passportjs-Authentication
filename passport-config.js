if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const LocalStrategy = require('passport-local').Strategy
const googleStrategy = require("passport-google-oauth20").Strategy
const findOrCreate = require("mongoose-findorcreate")
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById, DBcollection){
    const authenticateUser = async (email, password, done)=>{
        const  user = await getUserByEmail(email)
        if(!user){
            return done(null, false, {message: "No user with that email"})
        }

        try {
            if (await bcrypt.compare(password, user.password)){
                return done(null, user, {message: "everything is working properly!"})
            }else{
                return done(null, false, {message: `Password incorrect` })
            }
        } catch (error) {
            return done(error)
        }
    }

    const googleAuthenticate = function(accessToken, refreshToken, profile, cb) {
        DBcollection.findOrCreate({ username: profile.emails[0].value, name: profile.displayName, googleId: profile.id }, function (err, user) {
          return cb(err, user)
        })
      }

    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser))

    passport.use(new googleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_KEY,
        callbackURL: "http://localhost:3000/auth/google/secrets1"
      }, googleAuthenticate))
      
    passport.serializeUser((user, done)=>done(null, user.id))
    passport.deserializeUser((id, done)=>done(null, getUserById(id)))
}

module.exports = initialize
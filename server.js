if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require("bcrypt")
const bodyParser = require("body-parser")
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const findOrCreate = require("mongoose-findorcreate")


//DB config:
mongoose.connect(process.env.DB_URL)
// s1TO1n7bDOE9a58S

const test_userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    name: String,
    googleId: String,
    password: String
})
test_userSchema.plugin(findOrCreate)


const Test_user = mongoose.model('test_user', test_userSchema)

// const user = new Test_user({
//     username: "boubkeraouabe@gmail.com",
//     password: "bobaob123"
// })

// user.save();

// const users = []

const initializePassport = require('./passport-config')
initializePassport(
                passport,
                email => Test_user.findOne({username: email}),
                id => Test_user.findById(id),
                Test_user)

// const initializePassport = require('./passport-config')
// initializePassport(
//   passport,
//   email => users.find(user => user.email === email),
//   id => users.find(user => user.id === id)
// )

const app = express()

app.set('view engine', 'ejs')
app.use(express.static("public"))


app.use(bodyParser.urlencoded({extended: true}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, //if nothing has changed don't resave the session variables
    saveUninitialized: false //don't save empty values
}))


app.use(passport.initialize())
app.use(passport.session())


// app.get('/', (req, res)=>{
//     res.render('index.ejs', {name: "Boubker AOUABE"});
// })

// app.get('/register', (req, res)=>{
//     res.render('register.ejs')
// })

// app.get('/login', (req, res)=>{
//     res.render('login.ejs')
// })

// app.post('/login', passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//     failureFlash: true
// }))

// app.post('/register', async (req, res)=>{
//     try {
//         const hashedPassword = await bcrypt.hash(req.body.password, 10) 
//         const user = new Test_user({
//             username: req.body.email,
//             password: hashedPassword
//         })
//         user.save().then(res.redirect('/login'));

//     } catch (error) {
//         res.redirect('/register')
//     }
// })
let user;
app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: user.name })
  })
  
  app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
  })
  
  app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),
    (req, res)=>{
      user = req.user
      res.redirect('/')
    }
  )
  
  app.get('/register', checkNotAuthenticated,  (req, res) => {
    res.render('register')
  })
  
  app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10) 
        const user = new Test_user({
            username: req.body.email,
            name: req.body.name,
            password: hashedPassword
        })
        user.save().then(res.redirect('/login'));
    } catch {
      res.redirect('/register')
    }
  })
  
  app.post('/logout', (req, res) => {
    req.logOut(err=> {
      if(err) return next(err)
    })
    res.redirect('/login')
  })

app.get('/auth/google', 
  passport.authenticate('google', { scope: ["profile", "email"] })
)

app.get('/auth/google/check', 
  passport.authenticate('google', { scope: ["profile", "email"] })
  
)

app.get('/auth/google/secrets1', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful Google authentication - handle the redirection here
    user = req.user
    console.log(`user: ${user}`)
    res.redirect('/');
  }
)

  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }

app.listen(3000, ()=>{
    console.log('server listenig on port 3000')
})

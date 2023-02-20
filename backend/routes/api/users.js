const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const router = express.Router();
const passport = require('passport');
const { loginUser, restoreUser } = require('../../config/passport');
const { isProduction } = require('../../config/keys');


/* GET users listing. */
router.get('/', function(req, res, next) {
  // res.send('respond with a resource');
  res.json({
    message: 'GET /api/users'
  });
});

router.post('/register', async(req,res,next) => {
  const user = await User.findOne({
    $or: [{email: req.body.email}, {username: req.body.username}]
  });

  if (user){
    //throw a 400 error
    const err = new Error("validation error");
    err.statusCode = 400;
    const errors = {};
    if(user.email === req.body.email) errors.email = "A user already has that email";
    if(user.username === req.body.username) errors.username = "A user already has that username";

    err.errors = errors;
    return next(err);
  }

  const newUser = new User({
    username: req.body.username,
    email: req.body.email
  });

  bcrypt.genSalt(10, (err, salt) => {
    if (err) throw err;
    bcrypt.hash(req.body.password, salt, async (err, hashedPassword)=> {
      try{
        newUser.hashedPassword = hashedPassword;
        const user = await newUser.save();
        return res.json(await loginUser(user));
      } catch(err) {
        next(err);
      }
    })
  })
});

router.post('/login', async (req, res, next) => {
  passport.authenticate('local', async function(err, user) {
    if (err) return next(err);
    if(!user) {
      const err = new Error('Invalid Credentials');
      err.statusCode = 400;
      err.errors = {email: 'Invalid Credentials'};
      return next(err);
    }
    return res.json(await loginUser(user));
  }) (req, res, next); 
})

router.get('/current', restoreUser, (req, res) => {
  if(!isProduction){
    const csrfToken = req.csrfToken();
    res.cookie('CSRF-TOKEN', csrfToken);
  }
  if(!req.user) return res.json(null);
  res.json({
    _id: req.user.id,
    username: req.user.username,
    email: req.user.email
  });
});

module.exports = router;

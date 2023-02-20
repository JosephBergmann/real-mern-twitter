const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const router = express.Router();

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
        return res.json({user});
      } catch(err) {
        next(err);
      }
    })
  })
});

module.exports = router;

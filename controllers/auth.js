const bcrypt = require('bcryptjs')
const User = require('../models/users')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const { ObjectID } = require('mongodb')
const { validationResult } = require('express-validator/check')

const transporter = nodemailer.createTransport({
  service : 'gmail',
  auth : {
    user : 'gunawanleomessi@gmail.com',
    pass : ''
  }
})


exports.getlogin = (req, res, next) => {
  oldEmail = req.body.email
  let message = req.flash('error')
  if(message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
      res.render('auth/login', {
        path: '/login',
        pageTitle : 'Login Page',
        isAuthenticated : req.session.isLoggedIn,
        errorMessage : message,
        oldEmail : oldEmail
      });
};

exports.postLogin = (req,res,next) => {
    const email = req.body.email
    const password = req.body.password
    User.findOne({email : email})
    .then(user => {
      if(!user) {
        req.flash('error', 'Invalid Email')
        return res.status(402).render('auth/login',{
          path :'/login',
          pageTitle : 'Login',
          oldEmail : email,
          errorMessage : 'Invalid Email'

        })
      }
      bcrypt.compare(password, user.password).then(result => {
        if(result) {
          req.session.isLoggedIn = true;
          req.session.user = user
          return req.session.save(err => {
            console.log(err)
            res.redirect('/')
          })
          
        }
        req.flash('error', 'Invalid Password')
        return res.status(402).render('auth/login',{
          path :'/login',
          pageTitle : 'Login',
          oldEmail : email,
          errorMessage : 'Invalid Password'
        })
      }).catch(err => {
        console.log(err)
        
      })
    })
    .catch(err => console.log(err))
}

exports.logOut = (req,res,next) => {
  req.session.destroy((err) => {
    console.log(err)
    res.redirect('/')
  })
}

exports.signUp = (req,res,next) => {
  email = ''
  let message = req.flash('error')
  if(message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/signup', {
    path : '/signup',
    pageTitle : 'Sign Up',
    isAuthenticated : false,
    errorMessage : message,
    oldEmail : email
  })
}

exports.postSignUp = (req,res,next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword
  const error = validationResult(req)
  if(!error.isEmpty()) {
    console.log(error.array())
    return res.status(422).render('auth/signup', {
      path : '/signup',
      pageTitle : 'Sign Up',
      isAuthenticated : false,
      errorMessage : error.array()[0].msg,
      oldEmail : email
    })
  }
 
    bcrypt.hash(password, 12).then(hashedPassword => {
      const user = new User({
        email : email,
        password : hashedPassword,
        cart : {items : []}
      })
      return user.save()
    })
    .then(result => {
      res.redirect('/login')
      return transporter.sendMail({
        to : email,
        from : 'gunawanleomessi@gmail.com',
        subject : 'Sign Up',
        html : '<h1>Sign Up for LocalHost Shopp App is succes</h1>'
      }, function(error,info) {
        if(error) {
          console.log(error)
        } else {
          console.log('Email Sent ' + info.response )
        }
      })    
    }).catch(err => {
      const error = new Error(err)
    error.httpStatusCode = 500;
    return next(error);
    })
  
}


exports.getReset = (req,res,next) => {
  let message = req.flash('error')
  if(message.length > 0) {
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/resetPassword', {
    path : '/reset-password',
    pageTitle : 'Reset Password',
    errorMessage : message
  })
}

exports.postReset = (req,res,next) => {
  crypto.randomBytes(32, (err, buffer)=> {
    if(err) {
      console.log(err)
      res.redirect('/reset')
    }
    const token = buffer.toString('hex')
    User.findOne({email : req.body.email}).then(user => {
      if(!user) {
        req.flash('error', 'No Email Found !')
        return res.redirect('/reset-password')
      }
      user.resetToken = token
      user.resetTokenExpiration = Date.now() + 3600000
      return user.save()
    }).then(result => {
      res.redirect('/login')
      transporter.sendMail({
        to : req.body.email,
        from : 'gunawanleomessi@gmail.com',
        subject : 'Password Reset',
        html :  `
        <p> You requested for a new Password</p>
        <p> Click this <a href="http://localhost:5000/reset/${token}">Link</a> for reset new Password
        `
      }, function(error,info) {
        if(error) {
          console.log(error)
        } else {
          console.log('Email Sent ' + info.response )
        }
      })   
    })
    .catch(err => {
      const error = new Error(err)
    error.httpStatusCode = 500;
    return next(error);
    })
  })
}

exports.getNewPass = (req,res,next) => {
  const token = req.params.token
  User.findOne({resetToken : token, resetTokenExpiration : {$gt : Date.now()}})
  .then(user => {
    let message = req.flash('error')
    if(message.length > 0) {
      message = message[0]
    } else {
      message = null
    }
    res.render('auth/resetPassForm', {
      path : 'new-password',
      pageTitle : 'Reset Password',
      errorMessage : message,
      userId : user._id.toString(),
      token : token
    })
  }).catch(err => {
    const error = new Error(err)
    error.httpStatusCode = 500;
    return next(error);
  })
 
}

exports.postNewpass = (req,res,next) => {
  const userId = req.body.userId;
  const password = req.body.password;
  const token = req.body.token;
  let resetUser;
  User.findOne({resetToken : token, resetTokenExpiration : {$gt : Date.now()}, _id : ObjectID(userId)})
  .then(user => {
    resetUser = user
    return bcrypt.hash(password, 12)
  }).then(hashedPassword=> {
    resetUser.password = hashedPassword
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save()

  }).then(result => {
    res.redirect('/login')
  }).catch(err => {
    const error = new Error(err)
    error.httpStatusCode = 500;
    return next(error);
  })
}
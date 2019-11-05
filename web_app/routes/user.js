// Copyright Asquared IoT Pvt. Ltd. 2019
// Asquared IoT Pvt. Ltd. Confidential Information
var express = require('express');
var router = express.Router();


const authMiddleware = (req, res, next) => {  
  if (!req.isAuthenticated()) {
    res.status(401).send('You are not authenticated')
  } else {
    return next()
  }
}

/* GET users listing. */
router.get("/api/user", authMiddleware, (req, res) => {  
  let user = users.find(user => {
    return user.id === req.session.passport.user
  })

  res.send({ user: user })
});

module.exports = router;

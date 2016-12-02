'use strict';

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const bcrypt = require('bcrypt-as-promised');
const knex = require('../knex');
const boom = require('boom');

const {
    camelizeKeys,
    decamelizeKeys
} = require('humps');


// YOUR CODE HERE
router.get('/token', function (req,res,next) {

})

router.post('/token', function (req, res, next) {
  const {email, password} = req.body;
  return knex('users')
  .where('email', email)
  .first()
  .then((result) => {
    var thisUser = result;
    // console.log(result, 'This is the result');
    if (!result) {
      return next(boom.create(400, 'Bad email or password'));
    } else {
      bcrypt.compare(password, result.hashed_password)
      .then((resultCompare) => {
        
        res.send({id: thisUser.id,
          email: thisUser.email
        });
      })
      .catch((err) => {
        console.log(err);
        next(boom.create(400, 'Bad email or password'));
      });
    }

    })
    res.send('email exists')
  })

module.exports = router;

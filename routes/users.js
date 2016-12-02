'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-as-promised');
const knex = require('../knex');
const boom = require('boom');

const {
    camelizeKeys,
    decamelizeKeys
} = require('humps');

// eslint-disable-next-line new-cap

router.post('/users', (req, res, next) => {
  const {email, password} = req.body;

  //TODO: validate email and password

  knex('users')
  .where('email', email)
  .first()
  .then((result) => {
    if (result) {
      res.send('Email already exists');
      throw boom.create(400, 'Email already exists');
    }
    return bcrypt.hash(password, 12);
  })
  .then((createdHash)=>{
    const {firstName, lastName} = req.body;
    knex('users')
    .insert({
      first_name: firstName,
      last_name: lastName,
      email: email,
      hashed_password: createdHash
    })
    .then(() => {
      return knex('users')
      .select('id', 'first_name', 'last_name', 'email')
      .where('email', email)
      .first()
      .then((result) => {
        res.set('Content-Type', 'application/json');
        const resultCamel = camelizeKeys(result);
        res.send(resultCamel);
      })
    })
  })
  .catch((err) => {
    next(err);
  })
})

module.exports = router;

'use strict';

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const bcrypt = require('bcrypt-as-promised');
const knex = require('../knex');
const boom = require('boom');
const jwt = require('jsonwebtoken');

const {
    camelizeKeys,
    decamelizeKeys
} = require('humps');


// YOUR CODE HERE
router.get('/token', function(req, res, next) {
    jwt.verify(req.cookies.token, process.env.JWT_SECRET, (err, decoded) => {
        if (decoded || err === null) {
            res.send(true)
        } else {
            res.send(false)
        }
    })
})

router.post('/token', function(req, res, next) {
    const {
        email,
        password
    } = req.body;
    return knex('users')
        .where('email', email)
        .first()
        .then((result) => {
            var thisUser = result;
            // console.log(result, 'This is the result');
            if (!thisUser) {
                return next(boom.create(400, 'Bad email or password'));
            } else {
                bcrypt.compare(password, thisUser.hashed_password)
                    .then((resultCompare) => {
                        var token = jwt.sign({
                            id: thisUser.id,
                            email: email
                            // password: thisUser.hashed_password
                        }, process.env.JWT_SECRET);

                        res.cookie('token', token, {
                            httpOnly: true
                        });
                        res.send(camelizeKeys({
                            id: thisUser.id,
                            email: thisUser.email,
                            first_name: thisUser.first_name,
                            last_name: thisUser.last_name,
                        }));
                    })
                    .catch((err) => {
                        console.log(err);
                        return next(boom.create(400, 'Bad email or password'));
                    });
            }

        })
})

router.delete('/token', function(req, res, next) {
    res.clearCookie('token');
    res.send(true);
})

module.exports = router;

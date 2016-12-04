'use strict';

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex');
const jwt = require('jsonwebtoken');
const boom = require('boom');

const {
    camelizeKeys,
    decamelizeKeys
} = require('humps');


router.get('/favorites', function(req, res, next) {
    jwt.verify(req.cookies.token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(boom.create(401, 'Unauthorized'))
        } else {
            console.log(decoded);
            knex('favorites')
                .join('books', 'favorites.book_id', '=', 'books.id')
                .where('favorites.user_id', decoded.id)
                .then((books) => {
                    res.send(camelizeKeys(books))
                })
        }
    })

})

router.get('/favorites/check', function(req, res, next) {
    const bookId = req.query.bookId;
    if (isNaN(bookId)) {
      return next(boom.create(401), 'Unauthorized');
    }

    jwt.verify(req.cookies.token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(boom.create(401, 'Unauthorized'))
      }
        knex('favorites')
            .join('books', 'favorites.book_id', '=', 'books.id')
            .where('favorites.user_id', decoded.id)
            .andWhere('books.id', bookId)
            .then((returnedBook) => {
              if (returnedBook.length) {
                return res.send(true)
              }else {
                res.send(false)
              }
            })
            .catch((err) => {
                return next(boom.create(401, 'Unauthorized'));
            })
        .catch((err) =>{
          return next(err);
        })
    })
})
module.exports = router;

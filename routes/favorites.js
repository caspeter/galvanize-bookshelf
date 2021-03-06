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
        return next(boom.create(400, 'Book ID must be an integer'));
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
                } else {
                    res.set('Content-Type', 'application/json')
                    res.send(false)
                }
            })
            .catch((err) => {
                return next(boom.create(401, 'Unauthorized'));
            })
            .catch((err) => {
                return next(err);
            })
    })
})

router.post('/favorites', function(req, res, next) {
    const bookId = req.body.bookId;
    if (isNaN(bookId)) {
        return next(boom.create(400, 'Book ID must be an integer'))
    }
    jwt.verify(req.cookies.token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(boom.create(401, 'Unauthorized'));
        }
        if (isNaN(bookId)) {
            return next(boom.create(401, 'Unauthorized'))
        }

        knex('books')
            .where('books.id', bookId)
            .then((book) => {
                if (book.length === 0) {
                    return next(boom.create(404, 'Book not found'))
                }
                knex('favorites')
                    .insert({
                        book_id: bookId,
                        user_id: decoded.id
                    }, ['id', 'book_id', 'user_id'])
                    .then((newFavorite) => {
                        res.set('Content-Type', 'application/json')
                        res.send(camelizeKeys(newFavorite[0]))
                    })
                    .catch(() => {
                        next(err);
                    })
            })
            .catch((err) => {
                next(err);
            })
    })
})

router.delete('/favorites', function(req, res, next) {
    const bookId = req.body.bookId;

    if (isNaN(bookId)) {
        return next(boom.create(400, 'Book ID must be an integer'))
    }

    jwt.verify(req.cookies.token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(boom.create(401, 'Unauthorized'))
        }

        if (isNaN(bookId)) {
            return next(boom.create(401, 'Unauthorized'))
        }

        knex('books')
            .where('books.id', bookId)
            .then((book) => {
                if (book.length === 0) {
                    return next(boom.create(404, 'Favorite not found'))
                }
                if (typeof(bookId) !== 'undefined') {
                    knex('favorites')
                        .del(['book_id', 'user_id'])
                        .where('favorites.book_id', bookId)
                        .andWhere('favorites.user_id', decoded.id)
                        .then((deletedFavorite) => {
                            return res.send(camelizeKeys(deletedFavorite[0]))
                        })
                        .catch((err) => {
                            next(err);
                        })
                }
            })
            .catch((err) => {
                next(err);
            })
    })
})


module.exports = router;

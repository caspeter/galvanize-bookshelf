'use strict';

const express = require('express');
const boom = require('boom');
const knex = require('../knex');

const {
    camelizeKeys,
    decamelizeKeys
} = require('humps');

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/books', (req, res, next) => {
    knex('books')
        .orderBy('title')
        .then((result) => {
            res.set('Content-Type', 'application/json')
            const booksCaps = camelizeKeys(result);
            res.send(booksCaps);
        })
        .catch((err) => {
            next(err)
        })
});

router.get('/books/:id', (req, res, next) => {
    if (isNaN(req.params.id) || req.params.id < 0) {
      return next(boom.create(404, 'Not Found'))
    }

    knex('books')
        .where('id', req.params.id)
        .first()
        .then((result) => {
            if (!result) {
                return next(boom.create(404, 'Not Found'));
            }

            res.set('Content-Type', 'application/json');
            var bookCaps = camelizeKeys(result);
            res.send(bookCaps);
        })
        .catch((err) => {
            return next(boom.create(404, 'Not Found'))
        })
});

router.post('/books', (req, res, next) => {
    const body = req.body;
    // const errors = {
    //   title: 'Title must not be blank',
    //   author: 'Author must not be blank',
    //   genre: 'Genre must not be blank',
    //   description: 'Description must not be blank',
    //   coverUrl: 'Cover URL must not be blank'
    // }
    // for(key in body){
    //   if (!body[key]) {
    //     return next(boom.create(400, errors[key]))
    //   }
    // }
    if (!body.title) {
      return next(boom.create(400, 'Title must not be blank'))
    }
    if (!body.author) {
      return next(boom.create(400, 'Author must not be blank'))
    }
    if (!body.genre) {
      return next(boom.create(400, 'Genre must not be blank'))
    }
    if (!body.description) {
      return next(boom.create(400, 'Description must not be blank'))
    }
    if (!body.coverUrl) {
      return next(boom.create(400, 'Cover URL must not be blank'))
    }

    const bookInfo = {
        "title": body.title,
        "author": body.author,
        "genre": body.genre,
        "description": body.description,
        "coverUrl": body.coverUrl
    };

    for (var key in bookInfo) {
        if (!bookInfo[key]) {
            return next();
        };
    };

    const insertBook = decamelizeKeys(bookInfo);

    knex('books')
        .insert(insertBook, '*')

    .then((newBook) => {
            res.set('Content-Type', 'application/json');
            const newBookCamel = camelizeKeys(newBook);
            res.send(newBookCamel[0]);
        })
        .catch((err) => {
            next(err);
        })
});

router.patch('/books/:id', (req, res, next) => {
    const body = req.body;

    if (isNaN(req.params.id)) {
      return next(boom.create(404, 'Not Found'))
    }

    const updateBookInfo = {
        // "id": req.params.id,
        "title": body.title,
        "author": body.author,
        "genre": body.genre,
        "description": body.description,
        "coverUrl": body.coverUrl
    }

    const updateBook = decamelizeKeys(updateBookInfo);

    return knex('books')
        .where('id', req.params.id)
        .first()
        .then((book) => {
            if (!book) {
                return next();
            }
            return knex('books')
                .update(updateBook, '*')
                .where('id', req.params.id)
                .then((updatedBook) => {
                    res.set('Content-Type', 'application/json');
                    const updatedBookCamel = camelizeKeys(updatedBook);
                    res.send(updatedBookCamel[0])
                })
                .catch((err) => {
                    next(err)
                })
        })
})

router.delete('/books/:id', (req, res, next) => {
  let book;

  if (isNaN(req.params.id)) {
    return next(boom.create(404, 'Not Found'))
  }

  knex('books')
    .where('id', req.params.id)
    .first()
    .then((selectedBook) => {
      if (!selectedBook) {
        return next();
      }

      book = camelizeKeys(selectedBook);

      return knex('books')
        .del()
        .where('id', req.params.id);
    })
    .then(() => {
      delete book.id;
      res.send(book);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;

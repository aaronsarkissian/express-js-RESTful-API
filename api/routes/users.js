const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Code = require('../models/code');
const checkAuth = require('../middleware/check-auth');

router.get('/', (req, res, next) => {
  const { offset, limit, fields } = req.Query;
  User.find()
    .select(fields)
    .skip(offset)
    .limit(limit)
    .exec()
    .then(doc => res.status(200).json(doc))
    .catch(error => res.status(500).json(error));
});

router.post('/signup', (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: 'Email already exist!',
        });
      }
      bcrypt.hash(req.body.password, 10, (error, hash) => {
        if (error) {
          return res.status(500).json(error);
        }
        const user = new User({
          _id: mongoose.Types.ObjectId(),
          email: req.body.email,
          name: req.body.name,
          age: req.body.age,
          country: req.body.country,
          password: hash,
          role: 'user',
        });
        user.save()
          .then(result => res.status(201).json({
            message: 'User Created',
            user: result,
          }))
          .catch(error => res.status(500).json(error));
      });
    });
});

router.post('/login', (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: 'Auth failed!',
          // if email does not exist
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (error, result) => {
        if (error) {
          return res.status(401).json({
            message: 'Auth failed!',
            // if password is missing
          });
        }
        if (result) {
          const token = jwt.sign({
            email: user[0].email,
            userID: user[0]._id,
            role: user[0].role,
          },
          process.env.JWT,
          {
            expiresIn: '1h',
          });
          return res.status(200).json({
            message: 'Auth successful!',
            token,
          });
        }
        return res.status(401).json({
          message: 'Auth failed!',
          // if password is wrong
        });
      });
    })
    .catch(error => res.status(500).json(error));
});

router.get('/:userID', (req, res, next) => {
  const id = req.params.userID;
  User.findById(id)
    .exec()
    .then((doc) => {
      if (doc) {
        return res.status(200).json(doc);
      }
      return res.status(404).json({
        message: 'Nothing found with the given ID',
      });
    })
    .catch(error => res.status(500).json(error));
});

router.get('/:userID/codes', (req, res, next) => {
  const id = req.params.userID;
  const { offset, limit, fields } = req.Query;
  Code.find({ user: id })
    .select(fields)
    .skip(offset)
    .limit(limit)
    .exec()
    .then((doc) => {
      if (doc) {
        return res.status(200).json(doc);
      }
      return res.status(404).json({
        message: 'Nothing found with the given ID',
      });
    })
    .catch(error => res.status(500).json(error));
});

router.patch('/:userID', checkAuth, (req, res, next) => {
  const id = req.params.userID;

  if (req.authorizedBody.userID !== id && req.authorizedBody.role === 'user') {
    return res.status(401).json({
      message: 'Not Authorized!',
    });
  }
  if (req.authorizedBody.role === 'user') {
    Object.assign(req.body, { role: 'user' });
  }

  const updater = () => {
    User.findByIdAndUpdate(id, { $set: req.body })
      .exec()
      .then(() => res.status(200).json({
        message: 'User Updated!',
      }))
      .catch(error => res.status(500).json(error));
  };
  if (req.body.password) {
    bcrypt.hash(req.body.password, 10, (error, hash) => {
      if (error) {
        return res.status(500).json(error);
      }
      req.body.password = hash;
      updater();
    });
  } else {
    updater();
  }
});

router.delete('/:userID', checkAuth, (req, res, next) => {
  const id = req.params.userID;

  if (req.authorizedBody.userID !== id && req.authorizedBody.role === 'user') {
    return res.status(401).json({
      message: 'Not Authorized!',
    });
  }
  User.findByIdAndRemove(id)
    .exec()
    .then((result) => {
      if (result) {
        return res.status(200).json({
          message: 'User Deleted!',
        });
      }
      return res.status(404).json({
        message: 'There is no User with the given ID!',
      });
    })
    .catch(error => res.status(500).json(error));
});

module.exports = router;

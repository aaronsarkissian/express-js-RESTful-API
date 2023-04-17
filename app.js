const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();

const queryValidator = require('./api/middleware/query-validator');

const usersRoutes = require('./api/routes/users');
const codesRoutes = require('./api/routes/codes');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(queryValidator);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    return res.status(200).json({});
  }
  return next();
});

app.use('/users', usersRoutes);
app.use('/codes', codesRoutes);

app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error,
  });
});

module.exports = app;

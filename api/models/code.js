const mongoose = require('mongoose');

const codeSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  language: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
  },
  sourceCode: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Code', codeSchema);

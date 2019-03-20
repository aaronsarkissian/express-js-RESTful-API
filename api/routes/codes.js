const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const User = require('../models/user');
const Code = require('../models/code');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'text/x-c'
    || file.mimetype === 'application/javascript'
  ) {
    cb(null, true);
  } else {
    cb('Wrong File type!', false);
  }
};

const upload = multer({ storage, fileFilter });

router.get('/', (req, res, next) => {
  const { offset, limit, fields } = req.Query;
  Code.find()
    .populate('user', '_id email name')
    .select(fields)
    .skip(offset)
    .limit(limit)
    .exec()
    .then(doc => res.status(200).json(doc))
    .catch(error => res.status(500).json(error));
});

router.post('/', checkAuth, upload.single('sourceCode'), (req, res, next) => {
  const { userID } = req.body;

  if (req.authorizedBody.userID !== userID && req.authorizedBody.role === 'user') {
    return res.status(401).json({
      message: 'Not Authorized!',
    });
  }
  User.findById(userID)
    .then((user) => {
      if (!user) { // null
        return res.status(404).json({
          message: 'User Not Found!',
        });
      }
      const code = new Code({
        _id: mongoose.Types.ObjectId(),
        language: req.body.language,
        user: req.body.userID,
        sourceCode: req.file.path,
      });
      return code.save();
    })
    .then(result => res.status(201).json({
      code: result,
    }))
    .catch(error => res.status(500).json(error));
});

router.get('/:codeID', (req, res, next) => {
  const id = req.params.codeID;
  Code.findById(id)
    .populate('user')
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

router.get('/uploads/:codeID', (req, res, next) => {
  const id = req.params.codeID;
  Code.findById(id)
    .exec()
    .then((doc) => {
      const fileName = doc.sourceCode;
      const options = {
        root: path.join(__dirname, '/../../'),
        dotfiles: 'deny',
      };
      if (fileName) {
        return res.status(200).sendFile(fileName, options);
      }
      return res.status(404).json({
        message: 'There is no sourceCode found with the given ID',
      });
    })
    .catch(error => res.status(500).json(error));
});

router.patch('/:codeID', checkAuth, upload.single('sourceCode'), (req, res, next) => {
  const id = req.params.codeID;
  const { userID } = req.body;

  if (req.authorizedBody.userID !== userID && req.authorizedBody.role === 'user') {
    return res.status(401).json({
      message: 'Not Authorized!',
    });
  }
  const updateObj = {};
  if (req.file) {
    Object.assign(updateObj, { sourceCode: req.file.path }, req.body);
  } else {
    Object.assign(updateObj, req.body);
  }
  Code.findByIdAndUpdate(id, { $set: updateObj })
    .exec()
    .then((result) => {
      const filePath = path.join(__dirname, '/../../', result.sourceCode);
      fs.unlink(filePath, () => res.status(200).json({
        message: 'Code updated!',
      }));
    })
    .catch(error => res.status(500).json(error));
});

router.delete('/:codeID', checkAuth, (req, res, next) => {
  const id = req.params.codeID;
  const { userID } = req.body;

  if (req.authorizedBody.userID !== userID && req.authorizedBody.role === 'user') {
    return res.status(401).json({
      message: 'Not Authorized!',
    });
  }
  Code.findByIdAndRemove(id)
    .exec()
    .then((result) => {
      if (result) {
        const filePath = path.join(__dirname, '/../../', result.sourceCode);
        fs.unlink(filePath, () => res.status(200).json({
          message: 'Code Deleted!',
        }));
      } else {
        return res.status(404).json({
          message: 'There is no Code with the given ID!',
        });
      }
    })
    .catch(error => res.status(500).json(error));
});

module.exports = router;

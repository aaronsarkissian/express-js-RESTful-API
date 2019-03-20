const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT);
    User.findById(decoded.userID)
      .select('_id role')
      .exec()
      .then((result) => {
        if (result.role === decoded.role && result._id.toString() === decoded.userID) {
          req.authorizedBody = decoded;
          return next();
        }
        return res.status(401).json({
          message: 'Auth failed!',
        });
      })
      .catch(error => res.status(500).json(error));
  } catch {
    return res.status(401).json({
      message: 'Auth failed!',
    });
  }
};

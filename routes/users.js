const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
//   try {
//     const user = await User.find({ where: { id: req.user.id } });
//     await user.addFollowing(parseInt(req.params.id, 10));
//     res.send('success');
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// });

module.exports = router;

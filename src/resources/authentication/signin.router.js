const router = require('express').Router();
const { OK } = require('http-status-codes');
const multer = require('multer');
const path = require('path');
const loader = multer({ dest: path.join(__dirname, 'tmp') });

const userService = require('../users/user.service');

router.post('/', loader.none(), async (req, res) => {
  const auth = await userService.authenticate(req.body);

  res.status(OK).json({
    message: 'Authenticated',
    ...auth
  });
});

module.exports = router;

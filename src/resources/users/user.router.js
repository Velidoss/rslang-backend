const { OK, NO_CONTENT } = require('http-status-codes');
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const {
  CLOUDINARY: { CLOUDINARY_AVATAR_UPLOAD_PRESET }
} = require('../../common/config');

const loader = multer({ dest: path.join(__dirname, 'tmp') });

const userService = require('./user.service');
const { id, user } = require('../../utils/validation/schemas');
const {
  validator,
  userIdValidator
} = require('../../utils/validation/validator');

router.post(
  '/',
  [loader.single('avatar'), validator(user, 'body')],
  async (req, res) => {
    console.log(req.file);
    const userToStore = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      avatar: '',
      avatarCloudinaryId: ''
    };
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        upload_preset: CLOUDINARY_AVATAR_UPLOAD_PRESET
      });
      userToStore.avatar = result.secure_url;
      userToStore.avatarCloudinaryId = result.public_id;
      fs.unlinkSync(req.file.path);
    }
    const userEntity = await userService.save(userToStore);
    res.status(OK).send(userEntity.toResponse());
  }
);

router.get(
  '/:id',
  userIdValidator,
  validator(id, 'params'),
  async (req, res) => {
    const userEntity = await userService.get(req.params.id);
    res.status(OK).send(userEntity.toResponse());
  }
);

router.put(
  '/:id',
  userIdValidator,
  validator(id, 'params'),
  validator(user, 'body'),
  async (req, res) => {
    const userEntity = await userService.update(req.userId, req.body);
    res.status(OK).send(userEntity.toResponse());
  }
);

router.delete(
  '/:id',
  userIdValidator,
  validator(id, 'params'),
  async (req, res) => {
    await userService.remove(req.params.id);
    res.sendStatus(NO_CONTENT);
  }
);

module.exports = router;

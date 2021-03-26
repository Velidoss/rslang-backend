const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { addMethods } = require('../../utils/toResponse');
const Schema = mongoose.Schema;
const {
  MIN_PASSWORD_LENGTH,
  USER_AVATAR_MAX_LENGTH
} = require('../../common/config');

const User = new Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: MIN_PASSWORD_LENGTH
    },
    avatar: {
      type: String,
      required: false,
      max: USER_AVATAR_MAX_LENGTH
    },
    avatarCloudinaryId: {
      type: String,
      required: false,
      max: USER_AVATAR_MAX_LENGTH
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'users' }
);

User.pre('save', async function preSave(next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

User.pre('findOneAndUpdate', async function preUpdate(next) {
  if (this._update.$set.password) {
    this._update.$set.password = await bcrypt.hash(
      this._update.$set.password,
      10
    );
  }

  next();
});

addMethods(User);

module.exports = mongoose.model('users', User);

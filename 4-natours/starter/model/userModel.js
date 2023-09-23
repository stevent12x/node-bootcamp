const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      validate: {
         validator: function (val) {
            return validator.isAlpha(val, 'en-US', { ignore: ' -' });
         },
         message: 'Name must be alphanumeric'
      }
   },
   email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Email must be valid']
   },
   photo: {
      type: String
   },
   role: {
      type: String,
      default: 'user'
   },
   password: {
      type: String,
      required: [true, 'Password is required'],
      minLength: [8, 'Password must be at least 8 characters'],
      select: false
   },
   passwordConfirm: {
      type: String,
      required: [true, 'Password confirmation is required'],
      validate: {
         validator: function (val) {
            return val === this.password;
         },
         message: 'Passwords do not match'
      }
   },
   passwordChangedAt: Date
});

userSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next();

   this.password = await bcrypt.hashSync(this.password, 12);
   this.passwordConfirm = undefined;
   next();
});

userSchema.methods.verifyPassword = async function (
   candidatePassword,
   userPassword
) {
   return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
   if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
         this.passwordChangedAt.getTime() / 1000,
         10
      );

      return JWTTimestamp < changedTimestamp;
   }

   return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

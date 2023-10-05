const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
   {
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
      passwordChangedAt: Date,
      passwordResetToken: String,
      passwordResetExpiresAt: Date,
      active: {
         type: Boolean,
         default: true,
         select: false
      }
   },
   {
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
   }
);

userSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next();

   this.password = await bcrypt.hashSync(this.password, 12);
   this.passwordConfirm = undefined;
   next();
});

userSchema.pre('save', function (next) {
   if (!this.isModified('password') || this.isNew) return next();

   // Make sure the db is updated after the token is issued
   this.passwordChangedAt = Date.now() - 1000;
   next();
});

userSchema.pre(/^find/, function (next) {
   this.find({ active: { $ne: false } });
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

userSchema.methods.createPasswordResetToken = function () {
   const token = crypto.randomBytes(32).toString('hex');

   this.passwordResetToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

   console.log({ token }, this.passwordResetToken);

   this.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000;

   return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

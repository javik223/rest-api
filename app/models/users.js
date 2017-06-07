let mongoose = require('mongoose');
mongoose.promise = global.Promise;
let Schema = mongoose.Schema;
let bcrypt = require('bcrypt-nodejs');

// User Schema
let UserSchema = new Schema({
   name: String,
   username: { type: String, required: true, index: { unique: true } },
   password: { type: String, require: true, select: false }
});

UserSchema.pre('save', function(next) {
  let user = this;

  // Hash the password only if the password has been changed or user is new
  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.hash(user.password, null, null, function(err, hash) {
    if (err) return next(err);
    
    // Change the password to the hashed version
    user.password = hash;
    next();
  });
})

// Method to compare a given password with the database hash
UserSchema.methods.comparePassword = function(password) {
  let user = this;
  return bcrypt.compareSync(password, user.password);
}

module.exports = mongoose.model('User', UserSchema);
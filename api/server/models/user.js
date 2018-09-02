var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    _id: { type: String, required: true, unique: true },
    username: { type: String, required: true, uppercase: true },
    emailid: { type: String, unique: true },
    password: { type: String, required: true },
    designation: { type: String, required: true, uppercase: true },
    level: { type: String, required: true },
    woffice: { type: String, required: true, uppercase: true },
    role: { type: String, required: true, uppercase: true },
    phone: { type: String },
    bankname: { type: String },
    bankacnumber: { type: String },
    bankbranch: { type: String }
});



userSchema.pre('save', function(next) {
    // do stuff
    var user = this;
    bcrypt.hash(user.password, null, null, function(err, hash) {
        if (err) {
            return next(err);
        } else {
            user.password = hash;
            next();
        }
    });
});

userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model("users", userSchema);
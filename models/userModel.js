const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require('bcrypt');
const crypto = require('crypto')

const UserSchema = mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please provide a name"],
	},
	email: {
		type: String,
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, "Please provide a valid email"],
	},
	photo: String,
	password: {
		type: String,
		required: [true, "Please provide a password"],
		minlength: 8,
        select: false
	},
	passwordConfirm: { 
        type: String, required: [true, 'Please confirm your password'],
        validate: [function(el){ return el === this.password}, 'Password doesn\'t match ']
    },
    passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: String,
	role: {
		type: String,
		enum: ['user', 'guide', 'lead-guide', 'admin'],
		required: true
	}
});

UserSchema.methods.correctPassword = async function(cPass, uPass) {
    return await bcrypt.compare(cPass, uPass)
}
// UserSchema.method('sayHello', function() {console.log('Hello'); return 'Hello';})
UserSchema.methods.changedPasswordAfter = function(jwtTimeStamp) {
    if (!this.passwordChangedAt)
        return false;
    return jwtTimeStamp < parseInt(this.passwordChangedAt.getTime()/1000, 10);
}

UserSchema.methods.generateResetToken = function() {
	const resetToken = crypto.randomBytes(32).toString("hex");
	this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

	this.passwordResetExpires = Date.now() + 10 *60*1000;
	return resetToken;
}

UserSchema.methods.tokenExpired = function () {
	return Date.now() < this.passwordResetExpires;
}

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 8);
    this.passwordConfirm = undefined;
    next();
})

const User = mongoose.model("Users", UserSchema);

module.exports = User; 

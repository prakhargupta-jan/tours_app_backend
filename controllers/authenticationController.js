const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/email");
const crypto = require('crypto')

const signToken = async (userID) =>
	await jwt.sign({ id: userID }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});

exports.setRole = (role) => {
	return (req, res, next) => {
		req.role = role;
		next();
	};
};

exports.signup = catchAsync(async (req, res, next) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
		role: req.role || "user",
	});
	const token = await jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
	res.status(201).json({
		status: "success",
		token,
		user: {
			name: newUser.name,
			email: newUser.email,
		},
	});
});

exports.signin = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password)
		return next(new AppError(`Please provide email and password`, 400));
	const user = await User.findOne({ email }).select("+password");

	// console.log(user.sayHello());
	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError(`Incorrect Email or Password`, 401));
	}
	const token = await signToken(user._id);
	res.status(200).json({
		status: "success",
		token,
	});
});

exports.protect = catchAsync(async (req, res, next) => {
	const bJWT = req.headers.authorization;
	if (!bJWT || !bJWT.startsWith("Bearer"))
		return next(
			new AppError(`Token not provided, User not logged in.`, 400)
		);

	const token = bJWT.split(" ")[1];
	const verified = await jwt.verify(token, process.env.JWT_SECRET);
	const user = await User.findById(verified.id);

	if (!user) next(new AppError(`User no longer exist`, 401));
	if (user.changedPasswordAfter(verified.iat))
		next(
			new AppError(
				`Password was changed after the token was issued, Relogin with correct password`,
				402
			)
		);
	req.user = user;
	next();
});

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		console.log(roles);
		console.log(`\'${req.user.role}\'`);
		if (!req.user.role)
			return next(new AppError(`User role not found in db`, 404));
		if (!roles.includes(req.user.role))
			return next(new AppError(`aukad se bahar`, 403));
		next();
	};
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
	if (!req.body.email) {
		next(new AppError(`Please provide a suitable email address`, 401));
	}
	const user = (await User.find({ email: req.body.email }))[0];

	if (!user)
		next(
			new AppError(
				`No user found associated with the given email address`,
				404
			)
		);
	const token = user.generateResetToken();
	await user.save({ validateBeforeSave: false });
	const emailOptions = {
		to: user.email,
		subject: "password reset link",
		message: `${req.protocol}://${req.hostname}:${process.env.PORT}/api/v1/users/reset-password/${token}\nValid for 10 minutes.`,
	};
	await sendEmail(emailOptions);
	res.status(201).json({
		status: "success",
		message: "check your email inbox",
	});
});
exports.resetPassword = catchAsync(async (req, res, next) => {
    if (!req.params.resetToken) {
        return next(new AppError(`no reset Token provided`, 400));
    }
    if (!req.body.password || !req.body.passwordConfirm) {
        return next(new AppError(`Please provide a suitable password and confirm password to update the password`, 400));
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex')

    const user = (await User.find({passwordResetToken: hashedToken}))[0];
    if (!user) {
        return next(new AppError('Wrong update link, Please check stuff from your end', 400));
    }
    if (user.tokenExpired()) {
        return next(new AppError(`Password Reset link expired`, 401));
    }
    
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(200).json({
        status: 'success',
        message: 'Please login with the new password to gain access'
    })
})

exports.updatePassword = async (req, res, next) => {
    const user = req.user;
    if (!req.body.password || !req.body.newPassword || !req.body.newPasswordConfirm)
        return next(new AppError(`please provide password, newPassword, newPasswordConfirm fields inorder to update Password`), 400);
    if (!user.correctPassword(req.body.password))
        return next(new AppError(`Wrong password provided \n if forgotten please go to /api/v1/user/forgot-password`, 403));
    user.password = req.body.newPassword;
    user.password = req.body.newPasswordConfirm;
    await user.save();
}
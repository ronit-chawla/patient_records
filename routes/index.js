require('dotenv').config();
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const isLoggedIn = require('../middleware');
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
//!index
router.get('/', (req, res) => res.redirect('/patients'));
//!login etc
//form
router.get('/register', (req, res) => {
	res.render('user/register');
});
//add user
router.post('/register', (req, res) => {
	const {
		username,
		email,
		password,
		confirmPassword
	} = req.body;
	if (password !== confirmPassword) {
		req.flash('error', "Passwords don't match");
		return res.redirect('/register');
	}
	let newUser = new User({ username, email });
	User.register(newUser, password, (err, user) => {
		if (err) {
			req.flash('error', err.message);
			return res.redirect('/register');
		}
		passport.authenticate('local')(req, res, () => {
			req.flash(
				'success',
				'Succesfully Created Your Account'
			);
			res.redirect('/');
		});
	});
});
//form
router.get('/login', (req, res) => {
	res.render('user/login');
});
//user login
router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect : '/patients',
		failureRedirect : '/login'
	}),
	(req, res) => {}
);
//logout
router.get('/logout', isLoggedIn, (req, res) => {
	req.logout();
	req.flash('success', 'Succesfully Logged You Out');
	res.redirect('/login');
});
//forgot password
router.get('/forgot', (req, res) => {
	res.render('forgot');
});
router.post('/forgot', (req, res, next) => {
	async.waterfall(
		[
			done => {
				crypto.randomBytes(20, function(err, buf) {
					const token = buf.toString('hex');
					done(err, token);
				});
			},
			(token, done) => {
				User.findOne(
					{ email: req.body.email },
					(err, user) => {
						if (!user) {
							req.flash(
								'error',
								'No account with that email address exists.'
							);
							return res.redirect('/forgot');
						}

						user.resetPasswordToken = token;
						user.resetPasswordExpires =
							Date.now() + 3600000; // 1 hour

						user.save(err => {
							done(err, token, user);
						});
					}
				);
			},
			(token, user, done) => {
				const smtpTransport = nodemailer.createTransport(
					{
						service : 'gmail',
						auth    : {
							user : 'resetp053@gmail.com',
							pass : process.env.GMAILPW
						}
					}
				);
				const mailOptions = {
					to      : user.email,
					from    : 'resetp053@gmail.com',
					subject :
						'Patient Records Password Reset',
					text    :
						'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
						'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
						'http://' +
						req.headers.host +
						'/reset/' +
						token +
						'\n\n' +
						'If you did not request this, please ignore this email and your password will remain unchanged.\n'
				};
				smtpTransport.sendMail(mailOptions, err => {
					req.flash(
						'success',
						`Email sent with further instructions`
					);
					req.flash(
						'warning',
						`If you are using gmail you may have allow lesser secure emails in your settings`
					);
					done(err, 'done');
				});
			}
		],
		err => {
			if (err) return next(err);
			res.redirect('/forgot');
		}
	);
});
//reset pass form
router.get('/reset/:token', (req, res) => {
	User.findOne(
		{
			resetPasswordToken   : req.params.token,
			resetPasswordExpires : { $gt: Date.now() }
		},
		(err, user) => {
			if (!user) {
				req.flash(
					'error',
					'Password reset token is invalid or has expired.'
				);
				return res.redirect('/forgot');
			}
			res.render('reset', {
				token : req.params.token
			});
		}
	);
});
//reset form submission
router.post('/reset/:token', (req, res) => {
	async.waterfall(
		[
			done => {
				User.findOne(
					{
						resetPasswordToken   :
							req.params.token,
						resetPasswordExpires : {
							$gt : Date.now()
						}
					},
					(err, user) => {
						if (!user) {
							req.flash(
								'error',
								'Password reset token is invalid or has expired.'
							);
							return res.redirect('back');
						}
						if (
							req.body.password ===
							req.body.confirm
						) {
							user.setPassword(
								req.body.password,
								err => {
									user.resetPasswordToken = undefined;
									user.resetPasswordExpires = undefined;

									user.save(err => {
										req.logIn(
											user,
											err => {
												done(
													err,
													user
												);
											}
										);
									});
								}
							);
						} else {
							req.flash(
								'error',
								'Passwords do not match.'
							);
							return res.redirect('back');
						}
					}
				);
			},
			(user, done) => {
				const smtpTransport = nodemailer.createTransport(
					{
						service : 'Gmail',
						auth    : {
							user : 'resetp053@gmail.com',
							pass : process.env.GMAILPW
						}
					}
				);
				const mailOptions = {
					to      : user.email,
					from    : 'resetp053@gmail.com',
					subject :
						'Your password has been changed',
					text    :
						'Hello,\n\n' +
						'This is a confirmation that the password for your account ' +
						user.email +
						' has just been changed.\n'
				};
				smtpTransport.sendMail(mailOptions, err => {
					req.flash(
						'success',
						'Success! Your password has been changed.'
					);
					done(err);
				});
			}
		],
		err => {
			res.redirect('/patients');
		}
	);
});
module.exports = router;

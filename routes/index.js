require('dotenv').config();
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const isLoggedIn = require('../middleware');
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
module.exports = router;

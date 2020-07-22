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
	const { username, email } = req.body;
	let newUser = new User({ username, email });
	User.register(
		newUser,
		req.body.password,
		(err, user) => {
			if (err) {
				return res.render('register');
			}
			passport.authenticate('local')(req, res, () => {
				res.redirect('/');
			});
		}
	);
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
	res.redirect('/login');
});
module.exports = router;

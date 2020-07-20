require('dotenv').config();
const express = require('express');
const router = express.Router();
const Patient = require('../models/patient');
const Report = require('../models/report');
const isLoggedIn = require('../middleware');
//index
router.get(
	'/',
	/*isLoggedIn,*/ (req, res) => {
		// if (req.query.search) {
		// 	const regex = new RegExp(
		// 		escapeRegex(req.query.search),
		// 		'gi'
		// 	);
		// 	Todo.find(
		// 		{
		// 			todo   : regex,
		// 			author : {
		// 				id       : req.user._id,
		// 				username : req.user.username
		// 			}
		// 		},
		// 		(err, allTodos) => {
		// 			if (err) {
		// 				req.flash('error', err.message);
		// 				return res.redirect('/');
		// 			} else {
		// 				if (allTodos.length < 1) {
		// 					req.flash(
		// 						'error',
		// 						'No Match Found'
		// 					);
		// 					return res.redirect('/');
		// 				}
		// 				res.render('index', {
		// 					allTodos
		// 				});
		// 			}
		// 		}
		// 	);
		// } else {
		Patient.find({}, (err, allPatients) => {
			if (err) {
				console.log(err);
			} else {
				res.render('patient/index', {
					allPatients
				});
			}
		});
		// }
	}
);
router.get(
	'/new',
	/*isLoggedIn,*/ (req, res) => {
		res.render('patient/new');
	}
);

//create
router.post(
	'/',
	/*isLoggedIn,*/ async (req, res) => {
		const { patient, report } = req.body;
		Patient.create(
			{
				...patient,
				doctor : {
					id       : req.user._id,
					username : req.user.username
				}
			},
			err => {
				if (err) {
					console.log(err);
					return res.redirect(back);
				}
			}
		);
		const pat = await Patient.find({ ...patient });
		Report.create(
			{
				...report,
				patient : {
					id   : pat.id,
					name : `${pat.firstName} ${pat.lastName}`
				}
			},
			err => {
				if (err) {
					console.log(err);
					return res.redirect(back);
				}
				return res.redirect(`/patients/${pat._id}`);
			}
		);
	}
);
//destroy
router.delete(
	'/:id',
	/*isLoggedIn,*/ async (req, res) => {
		const pat = await Patient.find({
			_id : req.params.id
		});
		Patient.findByIdAndRemove(pat, err => {
			if (err) {
				console.log(err);
				res.redirect('back');
			}
		});
		Report.deleteMany(
			{
				patient : {
					id   : pat.id,
					name : `${pat.firstName} ${pat.lastName}`
				}
			},
			err => {
				if (err) {
					console.log(err);
					res.redirect('back');
				} else {
					res.redirect('/patients');
				}
			}
		);
	}
);
//edit
router.get(
	'/:id/edit',
	/*isLoggedIn,*/ async (req, res) => {
		const foundPatient = await Patient.findById(
			req.params.id
		);
		res.render('edit', {
			patient : foundPatient
		});
	}
);
//update
router.put(
	'/:id',
	/*isLoggedIn,*/ (req, res) => {
		const { patient } = req.body;
		Patient.findByIdAndUpdate(
			req.params.id,
			{ ...patient },
			err => {
				if (err) {
					res.redirect('back');
				} else {
					res.redirect(
						`/patients/${req.params.id}`
					);
				}
			}
		);
	}
);

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
module.exports = router;

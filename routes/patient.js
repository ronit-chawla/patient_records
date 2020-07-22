require('dotenv').config();
const express = require('express');
const router = express.Router();
const Patient = require('../models/patient');
const Report = require('../models/report');
const isLoggedIn = require('../middleware');
//index
router.get('/', isLoggedIn, (req, res) => {
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
});
//show
router.get('/:id', (req, res) => {
	Patient.findById(req.params.id)
		.populate('reports')
		.exec((err, foundPat) => {
			if (err || !foundPat) {
				res.redirect('back');
			} else {
				res.render('patient/show', {
					patient : foundPat
				});
			}
		});
});
//new form
router.get('/new', isLoggedIn, (req, res) => {
	res.render('patient/new');
});

//create
router.post('/', isLoggedIn, (req, res) => {
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
	Patient.find(patient, (err, patient) => {
		if (err) {
			console.log(err);
			res.redirect('/patients');
		} else {
			Report.create(
				{
					...report
				},
				(err, report) => {
					if (err) {
						console.log(err);
						return res.redirect(back);
					}
					patient.reports.push(report);
					return res.redirect(
						`/patients/${patient._id}`
					);
				}
			);
		}
	});
});
//edit
router.get('/:id/edit', isLoggedIn, (req, res) => {
	Patient.findById(req.params.id, (err, foundPatient) => {
		if (err) {
			console.log(err);
			return res.redirect('back');
		}
		return res.render('patient/edit', {
			patient : foundPatient
		});
	});
});
//update
router.put('/:id', isLoggedIn, (req, res) => {
	const {
		name,
		age,
		gender,
		category,
		subCategory1,
		subCategory2
	} = req.body.patient;
	Patient.findById(req.params.id, (err, patient) => {
		if (err) {
			console.log(err);
			return res.redirect('back');
		}
		patient.name = name;
		patient.age = age;
		patient.gender = gender;
		patient.category = category;
		patient.subCategory1 = subCategory1;
		patient.subCategory2 = subCategory2;
		patient.save();
		res.redirect(`/patients/${patient._id}`);
	});
});
//destroy
router.delete('/:id', isLoggedIn, async (req, res) => {
	Patient.findByIdAndRemove(
		req.params._id,
		(err, deletedPat) => {
			if (err) {
				console.log(err);
				return res.redirect('back');
			}
			for (const report of deletedPat.reports) {
				Report.findByIdAndRemove(report.id);
			}
		}
	);
});
function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
module.exports = router;

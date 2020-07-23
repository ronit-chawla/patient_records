require('dotenv').config();
const express = require('express');
const router = express.Router();
const Patient = require('../models/patient');
const Report = require('../models/report');
const isLoggedIn = require('../middleware');
//index
router.get('/', isLoggedIn, (req, res) => {
	const {
		uhid         : uhidSearch,
		category     : categorySearch,
		subCategory1 : subCategory1Search,
		subCategory2 : subCategory2Search,
		firstName    : firstNameSearch,
		lastName     : lastNameSearch
	} = req.query;
	if (
		uhidSearch ||
		categorySearch ||
		subCategory1Search ||
		subCategory2Search ||
		firstNameSearch ||
		lastNameSearch
	) {
		const search = {};
		for (const key in req.query) {
			if (req.query[key]) {
				search[key] = new RegExp(
					escapeRegex(req.query[key]),
					'gi'
				);
			}
		}
		if (uhidSearch) {
			search.uhid = uhidSearch;
		}
		Patient.find(
			{
				...search,
				doctor : {
					id       : req.user._id,
					username : req.user.username
				}
			},
			(err, allPatients) => {
				if (err) {
					req.flash('error', err.message);
					return res.redirect('/');
				} else {
					if (allPatients.length < 1) {
						req.flash(
							'error',
							'No Match Found'
						);
						return res.redirect('/patients');
					}
					res.render('patient/index', {
						allPatients
					});
				}
			}
		);
	} else {
		Patient.find(
			{
				doctor : {
					id       : req.user._id,
					username : req.user.username
				}
			},
			(err, allPatients) => {
				if (err) {
					req.flash('error', err.message);
				} else {
					res.render('patient/index', {
						allPatients
					});
				}
			}
		);
	}
});
//new form
router.get('/new', isLoggedIn, (req, res) => {
	res.render('patient/new');
});

//create
router.post('/', isLoggedIn, (req, res) => {
	const { patient } = req.body;
	Patient.find(
		{ uhid: patient.uhid },
		(err, foundPatients) => {
			if (err) {
				req.flash('error', err.message);
				return res.redirect(back);
			} else {
				if (foundPatients.length > 0) {
					Patient.create(
						{
							...patient,
							doctor : {
								id       : req.user._id,
								username : req.user.username
							}
						},
						(err, patient) => {
							if (err) {
								req.flash(
									'error',
									err.message
								);
								return res.redirect(back);
							} else {
								req.flash(
									'same',
									'Created Patient. Patient with similar details already exists'
								);
								res.redirect(
									`/patients/${patient._id}`
								);
							}
						}
					);
				} else {
					Patient.create(
						{
							...patient,
							doctor : {
								id       : req.user._id,
								username : req.user.username
							}
						},
						(err, patient) => {
							if (err) {
								req.flash(
									'error',
									err.message
								);
								return res.redirect(back);
							} else {
								req.flash(
									'success',
									'Succesfully Created New Patient'
								);
								return res.redirect(
									`/patients/${patient._id}`
								);
							}
						}
					);
				}
			}
		}
	);
});

//edit
router.get('/:id/edit', isLoggedIn, (req, res) => {
	Patient.findById(req.params.id, (err, foundPatient) => {
		if (err) {
			req.flash('error', err.message);
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
		firstName,
		lastName,
		uhid,
		age,
		gender,
		category,
		subCategory1,
		subCategory2
	} = req.body.patient;
	Patient.findById(req.params.id, (err, patient) => {
		if (err) {
			req.flash('error', err.message);
			return res.redirect('back');
		}
		patient.firstName = firstName;
		patient.lastName = lastName;
		patient.age = age;
		patient.uhid = uhid;
		patient.gender = gender;
		patient.category = category;
		patient.subCategory1 = subCategory1;
		patient.subCategory2 = subCategory2;
		patient.save();
		req.flash('success', 'Succesfully Updated Patient');
		res.redirect(`/patients/${patient._id}`);
	});
});
//destroy
router.delete('/:id', isLoggedIn, async (req, res) => {
	Patient.findByIdAndRemove(
		req.params.id,
		(err, deletedPat) => {
			if (err) {
				req.flash('error', err.message);
				return res.redirect('back');
			}
			for (const report of deletedPat.reports) {
				Report.findByIdAndRemove(report);
			}
			req.flash(
				'success',
				'Succesfully Deleted Patient'
			);
			return res.redirect('/patients');
		}
	);
});
//show
router.get('/:id', isLoggedIn, (req, res) => {
	Patient.findById(req.params.id)
		.populate('reports')
		.exec((err, foundPat) => {
			if (err || !foundPat) {
				req.flash('error', 'No Patient Found');
				res.redirect('back');
			} else {
				res.render('patient/show', {
					patient : foundPat
				});
			}
		});
});
function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
module.exports = router;

require('dotenv').config();
const express = require('express');
const router = express.Router({ mergeParams: true });
const Patient = require('../models/patient');
const Report = require('../models/report');
const isLoggedIn = require('../middleware');

//new
router.get('/new', isLoggedIn, (req, res) => {
	Patient.findById(req.params.id, (err, patient) => {
		if (err) {
			console.log(err);
		} else {
			res.render('report/new', {
				patient
			});
		}
	});
});
//create
router.post('/', isLoggedIn, (req, res) => {
	const { report } = req.body;
	Patient.findById(req.params.id, (err, patient) => {
		if (err) {
			console.log(err);
			res.redirect('back');
		} else {
			Report.create(report, (err, report) => {
				if (err) {
					console.log(err);
					res.redirect('back');
				} else {
					patient.reports.push(report._id);
					console.log(patient.reports);
					patient.save();
					res.redirect(
						`/patients/${patient._id}`
					);
				}
			});
		}
	});
});
module.exports = router;

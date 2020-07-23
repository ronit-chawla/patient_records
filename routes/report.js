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
			req.flash('error', err.message);
			res.redirect('back');
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
			req.flash('error', err.message);
			res.redirect('back');
		} else {
			Report.create(report, (err, report) => {
				if (err) {
					req.flash('error', err.message);
					res.redirect('back');
				} else {
					patient.reports.push(report._id);
					patient.save();
					req.flash(
						'success',
						'Succesfully Created new Report'
					);
					res.redirect(
						`/patients/${patient._id}`
					);
				}
			});
		}
	});
});
//edit
router.get('/:report_id/edit', isLoggedIn, (req, res) => {
	Patient.findById(req.params.id, (err, patient) => {
		if (err || !patient) {
			req.flash('error', err.message);
			res.redirect('back');
		} else {
			Report.findById(
				req.params.report_id,
				(err, report) => {
					if (err || !report) {
						req.flash('error', err.message);
						res.redirect('back');
						res.redirect('back');
					} else {
						res.render('report/edit', {
							report,
							patient
						});
					}
				}
			);
		}
	});
});
//update
router.put('/:report_id', isLoggedIn, (req, res) => {
	Report.findById(req.params.report_id, (err, report) => {
		if (err) {
			res.flash('error', err.message);
			res.redirect('back');
		} else {
			report.summary = req.body.summary;
			report.save();
			req.flash(
				'success',
				'Succesfully Updated Report'
			);
			res.redirect(`/patients/${req.params.id}`);
		}
	});
	// Report.findByIdAndUpdate(
	// 	req.params.report_id,
	// 	req.body.report,
	// 	(err, updatedComment) => {
	// 		if (err) {
	// 			res.redirect('back');
	// 		} else {
	// 			res.redirect(`/patients/${req.params.id}`);
	// 		}
	// 	}
	// );
});
//destroy
router.delete('/:report_id', isLoggedIn, (req, res) => {
	Report.findByIdAndRemove(req.params.report_id, err => {
		if (err) {
			res.flash('error', err.message);
			res.redirect('back');
		} else {
			req.flash(
				'success',
				'Succesfully Deleted Report'
			);
			res.redirect(`/patients/${req.params.id}`);
		}
	});
});
module.exports = router;

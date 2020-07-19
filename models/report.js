const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
	date    : Date,
	summary : String,
	patient : {
		id : {
			type : mongoose.Schema.Types.ObjectId,
			ref  : 'Patient'
		}
	}
});
module.exports = mongoose.model('Report', ReportSchema);

const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
	date    : Date,
	summary : String
});
module.exports = mongoose.model('Report', ReportSchema);

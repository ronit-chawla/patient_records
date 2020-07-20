const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
	firstName    : String,
	lastName     : String,
	age          : Number,
	gender       : String,
	uhid         : String,
	category     : String,
	subCategory1 : String,
	subCategory2 : String,
	doctor       : {
		id       : {
			type : mongoose.Schema.Types.ObjectId,
			ref  : 'User'
		},
		username : String
	}
});
module.exports = mongoose.model('Patient', PatientSchema);

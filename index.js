//?require
require('dotenv').config();
const express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	methodOverride = require('method-override'),
	passport = require('passport'),
	LocalStrategy = require('passport-local'),
	User = require('./models/user'),
	passportLocalMongoose = require('passport-local-mongoose'),
	flash = require('connect-flash'),
	port = process.env.PORT || 3001;

//?require routes
const indexRoutes = require('./routes/index'),
	patientRoutes = require('./routes/patient'),
	reportRoutes = require('./routes/report');

//?mongoose config
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(
	process.env.DATABASEURL ||
		'mongodb://localhost:27017/patient_record_app'
);

//?app config
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(`${__dirname}/public`));
app.use(methodOverride('_method'));
app.use(flash());

//?passport config
app.use(
	require('express-session')({
		secret            :
			process.env.DOG || 'I want a dog',
		resave            : false,
		saveUninitialized : false
	})
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	res.locals.warning = req.flash('warning');
	next();
});
//?routes
app.use('/', indexRoutes);
app.use('/patients', patientRoutes);
app.use('/patients/:id/reports', reportRoutes);
//show
// app.get('/patients/:id', (req, res) => {
// 	Patient.findById(req.params.id)
// 		.populate('reports')
// 		.exec((err, foundPat) => {
// 			if (err || !foundPat) {
// 				res.redirect('back');
// 			} else {
// 				res.render('patient/show', {
// 					patient : foundPat
// 				});
// 			}
// 		});
// });

//?listen
app.listen(port, () => {
	console.log(`started `);
});

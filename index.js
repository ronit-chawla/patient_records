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
	port = process.env.PORT || 3001;

//?require routes
const indexRoutes = require('./routes/index'),
	patientRoutes = require('./routes/patient');

//?mongoose config
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(
	process.env.DATABASEURL ||
		'mongodb://localhost:27017/retina_record_app'
);

//?app config
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(`${__dirname}/public`));
app.use(methodOverride('_method'));

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
	next();
});

//?routes
app.use('/', indexRoutes);
app.use('/patients', patientRoutes);

//?listen
app.listen(port, () => {
	console.log(`started `);
});

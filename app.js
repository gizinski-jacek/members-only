require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcryptjs = require('bcryptjs');
const compression = require('compression');
const MongoStore = require('connect-mongo');
const sass = require('sass');
const result = sass.compile('public/stylesheets/style.scss');
const Member = require('./models/member');

const indexRouter = require('./routes/index');

const mongoose = require('mongoose');
const mongoDb = process.env.MONGODB_URI;
mongoose.connect(mongoDb, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

passport.use(
	new LocalStrategy((username, password, done) => {
		Member.findOne({ username: username }, (err, user) => {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false, { message: 'Incorrect username' });
			}
			comparePassword(password, user.password, (err, match) => {
				if (err) {
					return next(err);
				}
				if (match) {
					return done(null, user);
				} else {
					return done(null, false, { message: 'Incorrect password' });
				}
			});
		});
	})
);

const comparePassword = (password, hash, cb) => {
	bcryptjs.compare(password, hash, (err, equal) => {
		if (err) {
			return done(err);
		}
		cb(null, equal);
	});
};

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	Member.findById(id, (err, user) => {
		done(err, user);
	});
});

const sessionConfig = {
	secret: process.env.PASSPORT_SECRET,
	resave: false,
	saveUninitialized: true,
	store: MongoStore.create({ mongoUrl: mongoDb, collectionName: 'sessions' }),
	cookie: { maxAge: 1000 * 60 * 60 * 24 }, // One day
};

app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	next();
});

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;

const Message = require('../models/message');
const Member = require('../models/member');
const async = require('async');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const passport = require('passport');
const bcryptjs = require('bcryptjs');

exports.member_create_get = (req, res, next) => {
	res.render('sign-up-form', { title: 'Sign Up' });
};

exports.member_create_post = [
	body('firstname', 'First name can not be empty')
		.trim()
		.isLength({ min: 2, max: 16 })
		.escape(),
	body('lastname', 'Last name can not be empty')
		.trim()
		.isLength({ min: 2, max: 16 })
		.escape(),
	body('username', 'Username can not be empty')
		.trim()
		.isLength({ min: 4, max: 16 })
		.escape(),
	body('password', 'Password can not be empty')
		.trim()
		.isLength({ min: 4, max: 16 })
		.escape(),
	(req, res, next) => {
		const errors = validationResult(req);
		const newMember = new Member({
			first_name: req.body.firstname,
			last_name: req.body.lastname,
			username: req.body.username,
		});
		if (!errors.isEmpty()) {
			res.render('sign-up-form', {
				title: 'Sign Up',
				member: newMember,
				errors: errors.array(),
			});
			return;
		}
		bcryptjs.hashSync(req.body.password, 12, (err, hashedPass) => {
			if (err) {
				return next(err);
			}
			newMember.password = hashedPass;
			newMember.save((err) => {
				if (err) {
					return next(err);
				}
				res.redirect('/log-in');
			});
		});
	},
];

exports.member_log_in_get = (req, res, next) => {
	res.render('log-in', { title: 'Log In' });
};

exports.member_log_in_post = [
	passport.authenticate('local', {
		failureRedirect: '/log-in',
	}),
	(req, res, next) => {
		res.redirect(`/member/${req.user._id}`);
	},
];

exports.member_log_out_get = (req, res, next) => {
	req.logout();
	res.redirect('/');
};

exports.member_details_get = (req, res, next) => {
	if (req.isAuthenticated()) {
		if (!mongoose.Types.ObjectId.isValid(req.session.passport.user)) {
			let err = new Error('Invalid member ObjectId');
			err.status = 404;
			return next(err);
		}
		Member.findOne({
			username: req.params.username,
			_id: req.session.passport.user,
		}).exec((err, member) => {
			if (err) {
				return next(err);
			}
			if (member == null) {
				let err = new Error('Member was not found');
				err.status = 404;
				return next(err);
			}
			res.render('member-details', {
				title: 'Member Details',
				member: member,
			});
		});
	} else {
		res.redirect('/log-in');
	}
};

exports.member_details_post = (req, res, next) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.memberid)) {
		let err = new Error('Invalid member ObjectId');
		err.status = 404;
		return next(err);
	}
	body('membershipupgrade', 'Code field can not be empty')
		.trim()
		.isLength({ min: 8, max: 32 })
		.escape();
	Member.findById(req.params.memberid).exec((err, member) => {
		if (err) {
			return next(err);
		}
		if (member == null) {
			let err = new Error('Member was not found');
			err.status = 404;
			return next(err);
		}
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.render('member-details', {
				title: 'Member Details',
				member: member,
				errors: errors.array(),
			});
		}
		if (
			req.body.membershipupgrade !== process.env.MEMBER_CODE &&
			req.body.membershipupgrade !== process.env.LEADER_CODE
		) {
			let err = new Error('Password was incorrect');
			err.status = 401;
			return next(err);
		} else {
			if (req.body.membershipupgrade === process.env.MEMBER_CODE) {
				Member.findByIdAndUpdate(
					{ _id: req.params.memberid },
					{ membership: 'fighter' },
					(err, updatedMember) => {
						if (err) {
							return next(err);
						}
						res.redirect(updatedMember.url);
					}
				);
			}
			if (req.body.membershipupgrade === process.env.LEADER_CODE) {
				Member.findByIdAndUpdate(
					{ _id: req.params.memberid },
					{ membership: 'leader', leader: true },
					(err, updatedMember) => {
						if (err) {
							return next(err);
						}
						res.redirect(updatedMember.url);
					}
				);
			}
		}
	});
};

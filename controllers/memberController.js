const Message = require('../models/message');
const Member = require('../models/member');
const async = require('async');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const passport = require('passport');
const bcryptjs = require('bcryptjs');

exports.member_create_get = (req, res, next) => {
	req.logout();
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
	body('repeatpassword', 'Password can not be empty')
		.trim()
		.isLength({ min: 4, max: 16 })
		.escape()
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error('Passwords must match');
			}
			return true;
		}),
	(req, res, next) => {
		const errors = validationResult(req);
		const newMember = new Member({
			first_name: req.body.firstname,
			last_name: req.body.lastname,
			username: req.body.username,
		});
		Member.find({ username: req.body.username })
			.countDocuments()
			.exec((err, memberExists) => {
				if (err) {
					return next(err);
				}
				if (memberExists > 0) {
					res.render('sign-up-form', {
						title: 'Sign Up',
						member: newMember,
						errors: [{ msg: 'User already exists' }],
					});
					return;
				}
				if (!errors.isEmpty()) {
					res.render('sign-up-form', {
						title: 'Sign Up',
						member: newMember,
						errors: errors.array(),
					});
					return;
				}
				bcryptjs.hash(req.body.password, 12, (err, hashedPass) => {
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
			});
	},
];

exports.member_log_in_get = (req, res, next) => {
	if (!req.isAuthenticated()) {
		return res.render('log-in', { title: 'Log In' });
	}
	res.redirect(`/member/${req.user.username}`);
};

exports.member_log_in_post = [
	passport.authenticate('local', { failureRedirect: '/log-in' }),
	(req, res, next) => {
		if (!req.user) {
			return res.redirect('/log-in');
		}
		res.redirect(`/member/${req.user.username}`);
	},
];

exports.member_log_out_get = (req, res, next) => {
	req.logout();
	res.redirect('/');
};

exports.member_details_get = (req, res, next) => {
	if (!req.isAuthenticated()) {
		return res.redirect('/log-in');
	}
	if (!mongoose.Types.ObjectId.isValid(res.locals.currentUser._id)) {
		let err = new Error('Invalid member ObjectId');
		err.status = 404;
		return next(err);
	}
	Member.findById(res.locals.currentUser._id).exec((err, member) => {
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
};

exports.member_details_post = [
	body('memberpromotion', 'Code field can not be empty')
		.trim()
		.isLength({ min: 8, max: 32 })
		.escape(),
	(req, res, next) => {
		if (!req.isAuthenticated()) {
			return res.redirect('/log-in');
		}
		if (!mongoose.Types.ObjectId.isValid(res.locals.currentUser._id)) {
			let err = new Error('Invalid member ObjectId');
			err.status = 404;
			return next(err);
		}
		Member.findById(res.locals.currentUser._id).exec((err, member) => {
			if (err) {
				return next(err);
			}
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				res.render('member-details', {
					title: 'Member Details',
					member: member,
					errors: errors.array(),
				});
				return;
			}
			if (
				req.body.memberpromotion !== process.env.MEMBER_CODE &&
				req.body.memberpromotion !== process.env.LEADER_CODE
			) {
				res.render('member-details', {
					title: 'Member Details',
					member: member,
					errors: [{ msg: 'Incorrect promotion code' }],
				});
				return;
			} else {
				if (req.body.memberpromotion === process.env.MEMBER_CODE) {
					Member.findByIdAndUpdate(
						res.locals.currentUser._id,
						{ fighter: true },
						(err, updatedMember) => {
							if (err) {
								return next(err);
							}
							res.redirect(updatedMember.url);
						}
					);
					return;
				}
				if (req.body.memberpromotion === process.env.LEADER_CODE) {
					Member.findByIdAndUpdate(
						res.locals.currentUser._id,
						{ fighter: true, leader: true },
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
	},
];

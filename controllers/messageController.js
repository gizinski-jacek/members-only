const Message = require('../models/message');
const Member = require('../models/member');
const async = require('async');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

exports.message_list = (req, res, next) => {
	Message.find().exec((err, message_list) => {
		if (err) {
			return next(err);
		}
		res.render('index', {
			title: res.locals.currentUser ? 'Fight Club' : 'F Club',
			message_list: message_list,
		});
	});
};

exports.message_create_get = (req, res, next) => {
	if (!req.isAuthenticated()) {
		return res.redirect('log-in');
	}
	if (!res.locals.currentUser.fighter && !res.locals.currentUser.leader) {
		let err = new Error('Insufficient permissions to post a message');
		err.status = 401;
		return next(err);
	}
	res.render('message-form', { title: 'Post a Message' });
};

exports.message_create_post = [
	body('title', 'Title can not be empty')
		.trim()
		.isLength({ min: 4, max: 16 })
		.escape(),
	body('description', 'Message can not be empty')
		.trim()
		.isLength({ min: 8, max: 128 })
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
		const errors = validationResult(req);
		const newMessage = new Message({
			title: req.body.title,
			description: req.body.description,
			timestamp: Date.now(),
			author: res.locals.currentUser.username,
			authorid: res.locals.currentUser._id,
		});
		if (!errors.isEmpty()) {
			res.render('message-form', {
				title: 'Post Message',
				message: newMessage,
				errors: errors.array(),
			});
			return;
		}
		newMessage.save((err) => {
			if (err) {
				return next(err);
			}
			res.redirect('/');
		});
	},
];

exports.message_delete_get = (req, res, next) => {
	if (!req.isAuthenticated()) {
		return res.redirect('/log-in');
	}
	if (!mongoose.Types.ObjectId.isValid(req.params.messageid)) {
		let err = new Error('Invalid message ObjectId');
		err.status = 404;
		return next(err);
	}
	if (!mongoose.Types.ObjectId.isValid(res.locals.currentUser._id)) {
		let err = new Error('Invalid member ObjectId');
		err.status = 404;
		return next(err);
	}
	async.parallel(
		{
			message: (cb) => {
				Message.findById(req.params.messageid).exec(cb);
			},
			member: (cb) => {
				Member.findById(res.locals.currentUser._id).exec(cb);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.message == null) {
				let err = new Error('Message was not found');
				err.status = 404;
				return next(err);
			}
			if (results.member == null) {
				let err = new Error('Member was not found');
				err.status = 404;
				return next(err);
			}
			if (!results.member.leader) {
				let err = new Error(
					'Insufficient permissions to access this page'
				);
				err.status = 401;
				return next(err);
			}
			res.render('message-delete', {
				title: 'Delete Message',
				message: results.message,
			});
		}
	);
};

exports.message_delete_post = (req, res, next) => {
	if (!req.isAuthenticated()) {
		return res.redirect('/log-in');
	}
	if (!mongoose.Types.ObjectId.isValid(req.params.messageid)) {
		let err = new Error('Invalid message ObjectId');
		err.status = 404;
		return next(err);
	}
	if (!mongoose.Types.ObjectId.isValid(res.locals.currentUser._id)) {
		let err = new Error('Invalid member ObjectId');
		err.status = 404;
		return next(err);
	}
	async.parallel(
		{
			message: (cb) => {
				Message.findById(req.params.messageid).exec(cb);
			},
			member: (cb) => {
				Member.findById(res.locals.currentUser._id).exec(cb);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (!results.member.leader) {
				let err = new Error(
					'Insufficient permissions to perform this action'
				);
				err.status = 401;
				return next(err);
			}
			Message.findByIdAndDelete(req.params.messageid, (err) => {
				if (err) {
					return next(err);
				}
				res.redirect('/');
			});
		}
	);
};

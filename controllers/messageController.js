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
			title: 'Fight Club',
			message_list: message_list,
		});
	});
};

exports.message_create_get = (req, res, next) => {
	if (!req.isAuthenticated()) {
		return res.redirect('log-in');
	}
	res.render('message-form', { title: 'Post Message' });
};

exports.message_create_post = [
	body('title', 'Title can not be empty')
		.trim()
		.isLength({ min: 4, max: 16 })
		.escape(),
	body('text', 'Message can not be empty')
		.trim()
		.isLength({ min: 8, max: 128 })
		.escape(),
	(req, res, next) => {
		const errors = validationResult(req);
		const newMessage = new Message({
			title: req.body.title,
			text: req.body.text,
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

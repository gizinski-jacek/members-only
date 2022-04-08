#! /usr/bin/env node

// 'This script populates some test members and messages to your database.
// Specified database as argument - e.g.: populatedb mongodb + srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true'

const async = require('async');
const Member = require('./models/member');
const Message = require('./models/message');

const mongoose = require('mongoose');
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const members = [];
const messages = [];

const memberCreate = (
	first_name,
	last_name,
	username,
	password,
	fighter,
	leader,
	cb
) => {
	let memberdetail = {
		first_name: first_name,
		last_name: last_name,
		username: username,
		password: password,
		fighter: fighter,
		leader: leader,
	};

	const member = new Member(memberdetail);
	member.save(function (err) {
		if (err) {
			cb(err, null);
			return;
		}
		console.log('New Member: ' + member);
		members.push(member);
		console.log(members[0]._id);
		cb(null, member);
	});
};

const messageCreate = (
	title,
	description,
	timestamp,
	author,
	authorid,
	permanent,
	cb
) => {
	messagedetail = {
		title: title,
		description: description,
		timestamp: timestamp,
		author: author,
		authorid: authorid,
		permanent: permanent,
	};

	const message = new Message(messagedetail);

	message.save(function (err) {
		if (err) {
			cb(err, null);
			return;
		}
		console.log('New Message: ' + message);
		messages.push(message);
		cb(null, message);
	});
};

function createMembers(cb) {
	async.series(
		[
			function (callback) {
				memberCreate(
					'Angel',
					'Face',
					'angelF',
					'0999r21rth0v1m0a645w2c14gt1240tc',
					true,
					false,
					callback
				);
			},
			function (callback) {
				memberCreate(
					'Robert',
					'Paulson',
					'BobP',
					'05900mv2m5v03ga5mg4cm54a5v5cmg7q',
					true,
					false,
					callback
				);
			},
			function (callback) {
				memberCreate(
					'Jack',
					'Moore',
					'JackM',
					'v09un79854n98mht4t9ht52ycaw5646w',
					true,
					true,
					callback
				);
			},
		],
		// Optional callback
		cb
	);
}

function createMessages(cb) {
	async.parallel(
		[
			function (callback) {
				messageCreate(
					'Project Mayhem',
					'Guys, seriously. What is Project Mayhem?',
					Date.now(),
					members[2].username,
					members[2].username,
					true,
					callback
				);
			},
			function (callback) {
				messageCreate(
					'Project Mayhem',
					`First rule of Project Mayhem is you don't ask questions about Project Mayhem, sir!`,
					Date.now(),
					members[1].username,
					members[1].username,
					true,
					callback
				);
			},
			function (callback) {
				messageCreate(
					'Project Mayhem',
					`First rule of Project Mayhem is you don't ask questions about Project Mayhem, sir!`,
					Date.now(),
					members[0].username,
					members[0].username,
					true,
					callback
				);
			},
		],
		// optional callback
		cb
	);
}

async.series(
	[createMembers, createMessages],
	// Optional callback
	function (err, results) {
		if (err) {
			console.log('FINAL ERR: ' + err);
		}
		// All done, disconnect from database
		mongoose.connection.close();
	}
);

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
	title: { type: String, minlength: 4, maxlength: 16, required: true },
	text: { type: String, minlength: 8, maxlength: 128, required: true },
	timestamp: { type: Date, required: true },
	author: { type: String, required: true },
	authorid: { type: String, required: true },
});

// Virtual for message's URL
MessageSchema.virtual('url').get(function () {
	return this._id;
});

// Virtual for message's formatted date
MessageSchema.virtual('timestamp_formatted').get(function () {
	return this.timestamp.toLocaleString('en-GB');
});

module.exports = mongoose.model('Message', MessageSchema);

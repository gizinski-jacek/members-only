const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
	title: { type: String, minlength: 4, maxlength: 16, required: true },
	messagetext: { type: String, minlength: 8, maxlength: 128, required: true },
	timestamp: { type: Date, required: true },
	author: { type: String, required: true },
});

// Virtual for user's URL
MessageSchema.virtual('url').get(function () {
	return this._id;
});

module.exports = mongoose.model('Message', MessageSchema);

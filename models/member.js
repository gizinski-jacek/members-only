const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MemberSchema = new Schema({
	first_name: { type: String, minlength: 2, maxlength: 16, required: true },
	last_name: { type: String, minlength: 2, maxlength: 16, required: true },
	username: { type: String, minlength: 4, maxlength: 16, required: true },
	password: { type: String, required: true },
	recruit: { type: Boolean, default: true },
	fighter: { type: Boolean, default: false },
	leader: { type: Boolean, default: false },
});

// Virtual for user's URL
MemberSchema.virtual('url').get(function () {
	return '/member/' + this.username;
});

// Virtual for user's full name
MemberSchema.virtual('fullname').get(function () {
	return `${this.first_name} ${this.last_name}`;
});

// Virtual for user's current highest membership status
MemberSchema.virtual('memberstatus').get(function () {
	if (this.leader) {
		return 'Leader';
	}
	if (this.fighter) {
		return 'Fighter';
	}
	if (this.recruit) {
		return 'Recruit';
	}
});

module.exports = mongoose.model('Member', MemberSchema);

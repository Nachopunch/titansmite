var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pbsaveSchema = new Schema({
	title: String,
	picks: [],
	notes: String,
	album: String
});

module.exports = mongoose.model('pbsaves', pbsaveSchema);

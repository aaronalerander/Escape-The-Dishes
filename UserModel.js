const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Order = require("./OrderModel");

let userSchema = Schema({
	//Names will be strings between 1-30 characters
	//Must consist of only A-Z characters
	//Will be trimmed automatically (i.e., outer spacing removed)
	username: {
		type: String, 
		required: true,
		minlength: 1,
		maxlength: 30,
		match: /[A-Za-z]+/,
		trim: true
	},
	password: {
		type: String, 
		required: true,
		minlength: 1,
		maxlength: 30,
		match: /[A-Za-z]+/,
		trim: true
	},
	privacy:{
		type: Boolean,
		required: true
	}
});

//Instance method finds purchases of this user
userSchema.methods.findOrders = function(callback){
	this.model('Order').find()
	.where("buyer").equals(this._id)
	.exec(callback);
};

module.exports = mongoose.model("User", userSchema);

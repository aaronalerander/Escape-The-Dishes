const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let orderSchema = Schema({
	//Names will be strings between 1-30 characters
	//Must consist of only A-Z characters
    //Will be trimmed automatically (i.e., outer spacing removed)
  buyer:{type: Schema.Types.ObjectId, ref:"User"},
	name: {
		type: String,
		required: true,
		minlength: 1,
		maxlength: 30,
		match: /[A-Za-z]+/,
		trim: true
	},
	subtotal: {
		type: Number
	},
	total:{
		type: Number
    },
    fee:{
		type: Number
    },
    tax:{
		type: Number
    },
    items: Schema.Types.Mixed
});

module.exports = mongoose.model("Order", orderSchema);

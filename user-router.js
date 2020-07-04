const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId
const User = require("./UserModel");
const Order = require("./OrderModel");
const express = require('express');
let router = express.Router();

router.get("/", queryParser);
router.get("/", loadUsers);
router.get("/", respondUsers);

router.get("/current", respondCurrentUser);

router.get("/:uid", sendSingleUser);
router.post("/:uid", express.json(), saveUser);

//Load a user based on uid parameter
router.param("uid", function(req, res, next, value){
	let oid;
	console.log("This Finding user by ID: " + value);
	try{
		oid = new ObjectId(value);
	}catch(err){
		res.status(404).send("User ID " + value + " does not exist.");
		return;
	}

	User.findById(value, function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error reading user.");
			return;
		}

		if(!result){
			res.status(404).send("User ID " + value + " does not exist.");
			return;
		}

		console.log("Result:");
		console.log(result);
		req.user = result;
		result.findOrders(function(err, result){
			if(err){
				console.log(err);
				//we will assume we can go on from here
				//we loaded the user information successfully
				next();
				return;
			}
			console.log("Orders");
			console.log(result);
			req.user.orders = result;
			if(req.session.loggedin && req.session.username === req.user.username){
				req.user.ownprofile = true;
			}
			next();
		})
	});
});



//Save changes to a user that are given in request body
//More advanced parsing could be done here
//For example, updating only the fields included in body
//We should also person some data validation here too,
// possibly in a previous middleware
function saveUser(req, res, next){
	delete req.body._id; // this might be a problem
	req.user = Object.assign(req.user, req.body);
	req.user.save(function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error updating user.");
			return;
		}
		res.redirect('back');
	});
}


//Parse the query parameters
//limit: integer specifying maximum number of results to send back
//page: the page of results to send back (start is (page-1)*limit)
//name: string to find in user names to be considered a match
function queryParser(req, res, next){
	if(!req.query.name){
		req.query.name = "?";
	}
	next();
}

//Loads the correct set of users based on the query parameters
//Adds a users property to the response object
//This property is used later to send the response
function loadUsers(req, res, next){
	User.find()
    .where("username").regex(new RegExp(".*" + req.query.name + ".*", "i"))
    .where("privacy").equals(false)
	.exec(function(err, results){
		if(err){
			res.status(500).send("Error reading users.");
			console.log(err);
			return;
		}
		res.users = results;
		next();
		return;
	});
}


//Users the res.users property to send a response
//Sends either HTML or JSON, depending on Accepts header
function respondUsers(req, res, next){
	res.format({
		//"text/html": () => {res.render("pages/users", {users: res.users, loggedin : req.session.loggedin} )},
		"application/json": () => {res.status(200).json(res.users)}
	});
	next();
}


//Send the representation of a single user that is a property of the request object
//Sends either JSON or HTML, depending on Accepts header
function sendSingleUser(req, res, next){
	if(req.user.privacy === false || req.user.ownprofile === true){
		res.format({//i have to decline if private anf not user**********
			"application/json": function(){
				res.status(200).json(req.user);
			},
			"text/html": () => { res.render("pages/user", {user: req.user, loggedin : req.session.loggedin}); }
		});

		next();
	}else{
		res.status(404).send("Sorry you aint the user");
		next();
	}
}

//responds with the profile page
function respondCurrentUser(req, res, next){
	res.redirect("/users/" + req.session._id);
}

//Export the router object, so it can be mounted in the store-server.js file
module.exports = router;

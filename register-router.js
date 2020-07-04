const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId
const User = require("./UserModel");
const express = require('express');
let router = express.Router();

router.get("/", respondPage);

router.post("/", express.json(), createUser);

//responds witht the register page
function respondPage(req, res, next){
    res.render("pages/register", {error: res.locals.error});
}

//creates a new user and saves it to the database
function createUser(req, res, next){
    let u = new User();
    u.username = req.body.username;
    u.password = req.body.password;
    u.privacy = false;


    mongoose.connection.db.collection("users").findOne({username: u.username}, function(err, result){
		if(err)throw err;

		console.log(result);

		if(result){
            res.locals.error = true;
            respondPage(req, res, next);

		}else{
            u.save(function(err, result){
                if(err){
                    console.log(err);
                    res.status(500).send("Error creating user.");
                    return;
                }
                req.session.loggedin = true;
                req.session.username = u.username;
                req.session._id = result._id;
                console.log(req.session._id);
                res.locals.error = false;
                res.redirect("/");
            })
		}
	});
}

//Export the router object, so it can be mounted in the store-server.js file
module.exports = router;

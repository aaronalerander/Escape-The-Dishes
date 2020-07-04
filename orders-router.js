const mongoose = require("mongoose");
const ObjectId= require('mongoose').Types.ObjectId
const User = require("./UserModel");
const Order = require("./OrderModel");
const express = require('express');
let router = express.Router();

router.get("/", respondPage);
router.get("/:uid", sendSingleOrder);

router.post("/", express.json(), submitOrder);


//Load a user based on uid parameter
router.param("uid", function(req, res, next, value){
	let oid;
	console.log("Finding order by ID: " + value);
	try{
		oid = new ObjectId(value);
	}catch(err){
		res.status(404).send("Order ID " + value + " does not exist.");
		return;
	}
	
	Order.findById(value, function(err, result){
		if(err){
			console.log(err);
			res.status(500).send("Error reading Order.");
			return;
		}
		
		if(!result){
			res.status(404).send("Order ID " + value + " does not exist.");
			return;
		}
		
		console.log("Order:");
		console.log(result);
        req.order = result;
		User.findById(result.buyer ,function(err, result){
			if(err){
				console.log(err);
				//we will assume we can go on from here
				//we loaded the user information successfully
				next();
				return;
			}
			console.log("user:");
			console.log(result);
            req.order.buyer = result;
            if(req.session.loggedin && req.session.username === req.order.buyer.username){
                req.order.buyer.ownprofile = true;
            }
			next();
		})
	});
});

//function creates an order and saves to the database
function submitOrder(req, res, next){
    let o = new Order();
    o.buyer = req.session._id;
    o.name = req.body.restaurantName;
    o.subtotal = req.body.subtotal;
    o.total = req.body.total;
    o.fee = req.body.fee;
    o.tax = req.body.tax;
    o.items = req.body.order;
    o.save(function(err, result){
        if(err) throw err;
        console.log("order saved to database");
        res.status(200).send();
    })
}

//responds the orders form page
function respondPage(req, res, next){
    if(req.session.loggedin){
        res.render("pages/orderform"); 
    }else{
        res.status(404).send("Sorry you only logged in people can view");
    }
}

//sends a single order
function sendSingleOrder(req, res, next){
	if(req.order.buyer.privacy === false || req.order.buyer.ownprofile === true){
		res.format({
			"application/json": function(){
				res.status(200).json(req.user);
			},
			"text/html": () => { res.render("pages/order", {order: req.order, loggedin : req.session.loggedin}); }
		});
		
		next();
	}else{
		res.status(404).send("Sorry you aint the user or this is set to private");
		next();
	}
}

//Export the router object, so it can be mounted in the store-server.js file
module.exports = router;
const express = require('express');
const app = express();
const mongoose = require("mongoose");
const User = require("./UserModel");
const Order = require("./OrderModel");

const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/tokens',
    collection: 'sessions'
  });
app.use(session({ secret: 'some secret here', store: store }))
app.set("view engine", "pug");
app.use(express.urlencoded({extended: true}));

app.use(express.static("public"));

//sets routers
let registerRouter = require("./register-router");
app.use("/register", registerRouter);
let userRouter = require("./user-router");
app.use("/users", userRouter);
let ordersRouter = require("./orders-router");
app.use("/orders", ordersRouter);


//responds the main page
app.get("/", (req, res, next)=> {
     res.render("pages/index", {loggedin : req.session.loggedin}); 
});

//logs in user
app.post("/login", function(req, res, next){

	if(req.session.loggedin){
		res.redirect("/");
		return;
	}
	
	let username = req.body.username;
    let password = req.body.password;
	mongoose.connection.db.collection("users").findOne({username: username}, function(err, result){
		if(err)throw err;
		
		console.log(result);
		
		if(result){
			console.log();
            req.session.loggedin = true;
			req.session.username = username;
			req.session._id = result._id
			console.log("Username: " + username);
			console.log(result);
			res.redirect("/");
		}else{
			res.status(401).send("Not authorized. Invalid username.");
			return;
		}
	});
});


//logs out user
app.get("/logout", function(req, res, next){
	req.session.loggedin = false;
	res.redirect("/");
})


mongoose.connect('mongodb://localhost/a4', {useNewUrlParser: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    app.listen(3000);
    console.log("Server listening on port 3000");

});
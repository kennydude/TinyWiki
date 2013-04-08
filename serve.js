// TinyWiki by Express

// This is the Express powered version of TinyWiki
// Simply run via node and it will start up it's
// webserver and work magically

var express = require("express");

var app = express();

app.use(function(req, res, next){
	res.displayPage = function(template, c){
		c['root'] = "/";
		res.render(template, c);
	};
	req.root = "/";
	next();
});
app.use(express.bodyParser());

// Setup view engine
var	cons = require('consolidate'),
 	swig = require('swig');
swig.init({
	root: __dirname + '/design/',
	allowErrors: true
});
app.set('views', __dirname + '/design/');
app.engine('.html', cons.swig);
app.set('view engine', 'html');

// Add Main methods
var twiki = require("./lib/app.js");
for(method in twiki){
	if(method != "page" && method != "editor"){
		console.log("Adding endpoint " + method);
		app.get("/" + method, twiki[method]);
		app.post("/" +method, twiki[method]);
	}
}

// Add Extra methods
app.use("/design/", express.static(__dirname+"/design/"));
app.use("/images/", express.static(__dirname+"/images/"));
app.use("/app/", express.static(__dirname+"/lib/app/"));

// View Pages
app.get("/", function(req, res){
	req.params['page'] = "index";
	twiki["page"](req, res);
});
app.get("/:page", twiki["page"]);

// Editor
app.get("/edit/:page", twiki["editor"]);
app.post("/edit/:page", twiki["editor"]);

app.listen(3000);
console.log("Up! http://localhost:3000");

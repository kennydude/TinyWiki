#!/usr/bin/node

// Requires
var	qs = require("querystring"),
	path = require("path"),
	swig = require("swig"),
	app = require("./lib/app.js"),
	fs = require("fs");

swig.init({ "root" : "design" });

// Variables
var	get = qs.parse(process.env['QUERY_STRING']),
	root = path.dirname(process.env['SCRIPT_NAME']) + "/",
	page = get['page'];

var req = {
	"params" : {
		"page" : page
	},
	"query" : get,
	"method" : process.env['REQUEST_METHOD'],
	"root" : root
}, res = {
	"displayPage" : function(pagename, context){
		context['root'] = root;
		context['wikipage'] = page;
		context['get'] = get;
	
		// Output
		console.log("Content-Type: text/html");
		console.log("");
		console.log(swig.compileFile(pagename).render(context));
	},
	"status" : function(status){
		if(status == 404){
			console.log("Status: 404 Not Found");
		} else{
			console.log("Status: " + status );
		}
	},
	"end" : function(msg){
		console.log("Content-Type: text/plain");
		console.log("");
		console.log(msg);
	},
	"redirect" : function(new_url){
		console.log("Status: 302 OK");
		console.log("Location: " + root + new_url);
		console.log("");console.log("... redirecting");
	},
	"sendfile" : function(path){
		console.log("Content-type: text/javascript");console.log("");
		rstream = fs.createReadStream( path );
		rstream.pipe(process.stdout);
	}
};

function render(){
	if(page.indexOf("app/") == 0){
		if(page.indexOf("app/_/") == 0){
			// Active app page
			var appname = page.substring( "app/_/".length, page.indexOf("/", "app/_/".length));
			var module = require("./lib/app/" + appname + "/routes.js" );
			module[ page.substr( "app/_/".length + appname.length + 1 ) ](req, res);
			return;
		}

		var file = page.substr( "app/".length);
		var mime = {
			".js" : "text/javascript",
			".css" : "text/css",
			".txt" : "text/plain",
			".png" : "image/png"
		};
		console.log("Content-Type: " + mime[path.extname(file)]);
		console.log("");
		var fstream = fs.createReadStream( path.join("lib/app/", file ) );
		fstream.pipe(process.stdout);
	} else if(app[page] != undefined){
		app[page](req, res);
	} else if(page.indexOf("edit/") == 0){
		page = page.substring( "edit/".length );
		req.params['page'] = page;
		
		app["editor"](req, res);
	} else{
		app['page'](req, res);
	}
}

// POST data
if(process.env['REQUEST_METHOD'] == "POST"){
	var pdata = require("./lib/cgi-post.js");
	if(process.env['CONTENT_TYPE'].indexOf("urlencoded") != -1){
		pdata.qs(function(post){
			req['body'] = post;
			render();
		});
	} else if(process.env['CONTENT_TYPE'].indexOf("multipart") != -1){
		pdata.mpart(function(body, files){
			req['body'] = body;
			req['files'] = files;
			render();
		});
	} else{
		render();
	}
} else{
	render();
}


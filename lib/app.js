// TinyWiki
// Made by Joe Simpson

var	fs = require("fs"),
	marked = require("./marked.js"),
	path = require("path");

// This is the main core. Generalized to work from
// apache + express

module.exports = app = {};

app['__about'] = function(req, res){
	res.displayPage("about.html",{});
}

app['__help'] = function(req, res){
	res.displayPage("help.html",{});
}

app['__gallery'] = function(req, res){
	fs.readdir("images", function(err, files){
		if(req.query['format'] == "editor"){
			res.displayPage("editor-gallery.html", {"files":files});
		} else{
			res.displayPage("gallery.html", {"files":files});
		}
	});
};

app['__pages'] = function(req, res){
	fs.readdir("pages", function(err, files){
		f = [];
		for(x in files){
			f.push( files[x].substring(0, files[x].length - path.extname(files[x]).length ) );
		}
		if(req.query['format'] == "editor"){
			res.displayPage("editor-pages.html", {"files":f});
		} else{
			res.displayPage("pages.html", {"files":f});
		}
	});
};

app['__gallery_delete'] = function(req, res){
	if(req.query['sure']){
		fs.unlink( path.join("images", req.query['file']), function(err){
			res.redirect( "__gallery?deleted=true" );
		});
	} else{
		res.displayPage("confirm-delete.html", {"image": req.query['file']});
	}
};

app['__syntax'] = function(req, res){
	var mOpt = {"imageRoot" : req.root + "images/"};
	fs.readFile( path.join(__dirname,"syntax.md" ), function(err, contents){
		if(err){
			res.displayPage("error.html", { "error" : err });
		} else{
			var words = contents.toString().split(" ").length;
			var rtime = Math.round(words / 20) / 10;
			context = {
				"contents" : contents.toString(),
				"wikipage" : "__syntax",
				"time" : rtime,
				"words" : words,
				"get" : req.query
			};
			context['contents'] = marked(contents.toString(), mOpt);
			res.displayPage("page.html", context);	
		}
	});
}

app['page'] = function(req, res){
	var mOpt = {"imageRoot" : req.root + "images/"};

	var page = req.params['page'];
	if(page == ""){ page = "index"; }

	if(!fs.existsSync( path.join("pages", page + ".txt" ) ) ){
		res.status(404);
		res.displayPage("404.html", {"wikipage" : page,"request":"view:"+page});
	} else{
		fs.readFile( path.join("pages", page + ".txt" ), function(err, contents){
			if(err){
				res.displayPage("error.html", { "error" : err });
			} else{
				var words = contents.toString().split(" ").length;
				var rtime = Math.round(words / 20) / 10;
				context = {
					"contents" : contents.toString(),
					"wikipage" : page,
					"time" : rtime,
					"words" : words,
					"get" : req.query
				};
				if(contents.toString().indexOf("[app") == 0){
					context["appname"] = contents.toString().split("\n")[0].replace("[app ", "");
					context["appname"] = context["appname"].substring(0, context["appname"].indexOf("]"));
					res.displayPage("app.html", context);
				} else{
					context['contents'] = marked(contents.toString(), mOpt);
					res.displayPage("page.html", context);	
				}
			}
		});
	}
};

app['__image'] = function(req, res){
	file = req.files['userfile'];

	file['name'] = file['name'].replace(" ", "_");

	rstream = fs.createReadStream( file['path'] );
	wstream = fs.createWriteStream( path.join( "images",  file['name'] ) );
	rstream.pipe(wstream);
	rstream.on("end", function(){
		res.end("![Image]("+ file['name'] +")");
	});
};

app['editor'] = function(req, res){
	var mOpt = {"imageRoot" : req.root + "images/"};
	var page = req.params['page'];

	if(req.method == "POST"){
		if( req.body['action'] == "preview"){
			res.displayPage("editor.html", {
				"preview" : marked(req.body['contents'], mOpt),
				"contents" : req.body['contents'],
				"wikipage":page
			});
		} else{
			if(page == "__syntax")return;
			fs.writeFile( path.join("pages", page+".txt"), req.body['contents'], function(err){
				if(!err){
					if(req.query['format'] == "api"){
						res.end("ok");
					} else{
						res.redirect( page + "?saved=true" );
					}
				} else{
					if(req.query['format'] == "api"){
						res.end("failure");
					} else{
						res.displayPage("error.html", { "error" : err });
					}
				}
			});
		}
	} else{
		if(!fs.existsSync( path.join("pages", page + ".txt" ) ) && page != "__syntax" ){
			res.displayPage("editor.html", {"wikipage":page});
		} else{
			var file = path.join("pages", page + ".txt" );
			if(page == "__syntax"){ file = path.join(__dirname, "syntax.md"); }
			fs.readFile( file, function(err, contents){
				if(err){
					res.displayPage("error.html", { "error" : err });
				} else{
					context = { "contents" : contents, "wikipage":page };
					res.displayPage("editor.html", context);
				}
			});
		}
	}
};

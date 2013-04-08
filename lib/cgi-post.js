module.exports = post = function(cb){
	var pdata = [];
	
	process.stdin.resume();
	process.stdin.on('data', function(chunk) {
		pdata.push(chunk);
	});
	process.stdin.on('end', function(){
		cb(Buffer.concat(pdata));
	});
};

post['qs'] = function(cb){
	var qs = require("querystring");
	post(function(post){
		cb( qs.parse(post.toString()) );
	});
}
post['mpart'] = function(cb){
	post(function(post){
		var m = require("formidable");
		var 	form = new m.IncomingForm(),
			fields = {}, files = {};

		var x = process.env['CONTENT_TYPE'].match(/boundary=(?:"([^"]+)"|([^;]+))/i);
		form._initMultipart( x[1] || x[2] );

		form.on('field', function(name, value) {
				fields[name] = value;
			})
			.on('file', function(name, file) {
				files[name] = file;
			})
			.on("error", function(err){
				console.log("Status: 503");console.log("Content-Type: text/plain");console.log("");
				console.log(err);console.log(process.env);
			})
			.on("end",function(){
				cb(fields, files);
			});
		form.write(post);
		form._parser.end();
	});
}

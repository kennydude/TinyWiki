module.exports = app = {};

var spawn = require('child_process').spawn;

app['render'] = function(req, res){
	if(req.method != "POST" && !req['body']['map']){
		res.status(403);
		res.end("Invalid Request");
		return;
	}
	
	var map = JSON.parse(req.body['map']);
	
	var dot = "digraph G {\nrankdir=LR\n";
	
	// Count topics
	if(req.query['flat'] != "true"){
		var topics = 0;
		map.forEach(function(item){ if(item['parent'] == "n0"){ topics += 1; } } );

		// Now half of them will be on the left
		topics = Math.floor(topics/2);
		var counter = 0, i = 0;
	
		var setChildren = function(id){
			var i = 0;
			map.forEach(function(item){
				if(item['parent'] == id){
					map[i]['left'] = true;
					setChildren( item['id'] );
				}
				i+=1;
			});
		}
	
		map.forEach(function(item){
			if(item['parent'] == "n0" && counter < topics){
				map[i]['left'] = true;
				setChildren( item['id'] );
				counter += 1;
			}
			i++;
		});
	}

	// Now make the dot file
	map.forEach(function(item){
		dot += item['id'] + ' [label="' + item['label'] + '"]\n';
		if(item['parent']){
			if(item['left']){
				dot += item['id'] + ' -> ' + item['parent'] + " [arrowhead=none]\n";
			} else{
				dot += item['parent'] + ' -> ' + item['id'] + " [arrowhead=none]\n";
			}
		}
	});
	dot += '}';
	
	var format = req.query['format'] || "svg";
	var args = ['-T' + format];	

	if(format == "png"){
		// Web browsers don't seem to like it :(
		args.push('-o');
		args.push(__dirname+'/ex.png');
	}
	var proc = spawn("dot", args);
	
	var out = "";
	proc.stdout.on("data", function(data){
		out += data.toString()
	});
	proc.stdout.on("end", function(){
		res.end(out);
	});
	
	proc.stdin.write(dot);
	proc.stdin.end();
};

var flat = false, image = false;

function render_graph(){
	$(".loading").show();

	var contents = $("#appData").html();
	contents = contents.substr( "[app mindmap]".length + 2 );

	var g = [];
	var lines = contents.split("\n"), lno = 0;
	
	var first = true, lastIndent = 0, parentItem = undefined, parents = {}, lastItem = undefined;

	lines.forEach(function(line){
		
		var text = line.trim().substr(2);

		var indent = line.substr(0, line.indexOf("-")).length;	
		
		if(first == true){
			first = false;
		}
		if(indent > lastIndent){
			parents[ lastIndent ] = lastItem;
			parentItem = lastItem;
		} else if( indent < lastIndent ){
			for( var i = indent; i >= 0; i-- ){
				if(parents[i] != undefined && i < indent){
					parentItem = parents[i];
					break;
				}
			}
		}

		var node = {
			"id" : "n" + lno,
			"label" : text,
			"parent" : parentItem
		};
		g.push(node);

		lastItem = "n" + lno;
		lastIndent = indent;
		
		lno+=1;
	});

	var params = "?";
	params += "flat=" + flat;
	params += "&format=" + (image ? "png" : "svg");

	$.post(root + "app/_/mindmap/render" + params, {
		"map" : JSON.stringify(g)
	}, function(data){
		if(image){
			$("#map").html("");
			$("<img>").attr("src", root + "app/mindmap/ex.png" ).appendTo("#map");
		} else{
			$("#map").html(data);
		}
		$(".loading").hide();
	});
	
	console.log("Rendered");
}

$(document).ready(function(){
	console.log("TinyWiki Mindmap Viewer");
	$("#appArea").html("<br/><br/><div id='map'></div><br/><br/><br/><br/>");
	
	$("<style>").html("#map svg{width:100%}#map img{width:100%}.controls{ padding: 10px; }label{display: block; }").appendTo("head");	

	render_graph();

	var controls = $("<div>").addClass("controls").prependTo("#appArea");

	$("<div>").addClass("loading right hide").html("Loading...").prependTo(controls);

	var lbl = $("<label>").html('Push all to the left').appendTo(controls);	
	var chk = $("<input type=checkbox>").prependTo(lbl).on("change", function(){
		flat = $(this).is(":checked");
		render_graph();
	});
	
	var lbl = $("<label>").html('Render as image ').appendTo(controls);
	$("<abbr>").attr("title", "This is lower quality, but rendering errors are less likely. On shared servers, this may cause issues").html("?").appendTo(lbl);
	var chk = $("<input type=checkbox>").prependTo(lbl).on("change", function(){
		image = $(this).is(":checked");
		render_graph();
	});
	
});


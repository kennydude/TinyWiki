function domainName(d){
	return d.substring( d.indexOf("//") + 2, d.indexOf("/", d.indexOf("//")+2) )
}

function display_marks(content){
	$("#appArea").html("<br/>");
	
	$("<button>").text("Save").appendTo("#appArea").click(function(){
		$("#appData").html("[app bookmarks]\n\n" + to_md());
		saveContents();
		return false;
	});

	var lines = content.split("\n");
	lines.shift(); // We do not treat the first line because it would make actual markdown rendering break
	lines.forEach(function(line){
		// Line we want to use
		if(line.charAt(0) == "*" && line.charAt(1) == " "){
			var mark = {};
			mark['title'] = line.substring( line.indexOf("[") + 1, line.indexOf("]") );
			mark['link'] = line.substring( line.indexOf("(", line.indexOf("]")) + 1, line.indexOf(")", line.indexOf("]")) );
			mark['link'] = $("<span>").html(mark['link']).text();
			
			var dom = $("<div>").addClass("mark view real").appendTo("#appArea");

			$("<a href='#'>").addClass("right").attr("title", "Edit").click(function(){
				$(this).parent().toggleClass("view edit");
			}).html(edit_icon).prependTo(dom);
			
			var h = $("<h3>").addClass("hideOnEdit").appendTo(dom);
			$("<a>").addClass("link").attr("href", mark['link']).text(mark['title']).appendTo(h);
			
			$("<input>").addClass("line title showOnEdit").val(mark['title']).attr("placeholder", "Title").appendTo(dom).on("change", function(){
				$("h3", $(this).parent()).text($(this).val());
			});
			$("<input>").addClass("line linkE showOnEdit").val(mark['link']).attr("placeholder", "URL").appendTo(dom).on("change", function(){
				$(".link", $(this).parent()).attr("href", $(this).val());
				$(".domain", $(this).parent()).html( domainName( $(this).val() ) );
			});
			

			$("<div>").addClass("domain hideOnEdit").html( domainName(mark['link']) ).appendTo(dom);
		}
	});
	
	var dom = $("<div>").addClass("mark").html("New<br/>").appendTo("#appArea");
	$("<input>").addClass("line title").attr("placeholder", "Title").appendTo(dom);
	$("<input>").addClass("line linkE").attr("placeholder", "URL").appendTo(dom);
	$("<button>").html("Add").appendTo(dom).click(function(){
		display_marks( to_md(false) );
	});
}

function to_md(proper){
	if(proper == undefined){ proper = true; }
	var contents = "", f = "";
	if(proper == true){ f += ".real"; }
	$(".mark" + f).each(function(){
		var line = "* ";
		line += "[" + $(".title", this).val() + "]";
		line += "(" + $(".linkE", this).val() + ")";
		contents += line + "\n";
	});
	return contents.substr(0, contents.length-1);
}

$(document).ready(function(){
	console.log("TinyWiki Bookmark app");
	
	$("<link>").attr("href", "app/bookmarks.css").attr("rel", "stylesheet").appendTo("head");
	edit_icon = $(".editIcon").html().replace('fill="#FFF"', 'fill="#000"');
	
	var contents = $("#appData").html();
	contents = contents.substr( contents.indexOf("\n") + 1 ); // Remove [app bookmarks]
	display_marks(contents);

	$("<a href='#'>").html("Export as MD").click(function(){
		showLB("<textarea class='export'>"+to_md()+"</textarea>");
	}).appendTo(".moreBox .content");
});

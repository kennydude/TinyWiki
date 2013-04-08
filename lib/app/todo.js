var 	uppercase = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"],	
	edit_icon = undefined,
	date_regex = /[0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]/;

function display_tasks(contents, proper){
	if(proper==undefined){ proper = true; }
	$("#appArea").html("<br/>");

	$("<button>").html("Save").appendTo("#appArea").click(function(){
		$("#appData").html("[app todo]\n" + to_txt());
		saveContents();
		return false;
	});
	
	for(i in uppercase){
		$("<div>").addClass("area"+ uppercase[i]).appendTo("#appArea");
	}
	$("<div>").addClass("area").appendTo("#appArea");

	var lines = contents.split("\n");
	lines.forEach(function(line){
		var task = { "completed" : false, "priority" : "", "edit" : false };

		// Rule -1 - Edited	
		if(line.indexOf("E|") == 0 && !proper){
			task['edit'] = true;
			line = line.substr(2);
		}	

		// Rule 0 - Completed
		if(line.charAt(0) == "x" && line.charAt(1) == " "){
			task['completed'] = true;
			line = line.substr(2);
			console.log(line);
			if(line.substr(0,line.indexOf(" ")).match( date_regex )){
				task['done'] = line.substr(0,line.indexOf(" "));
				line = line.substr(line.indexOf(" ")+1);
			}
		}
	
		// Rule 1
		if(line.charAt(0) == "(" && line.charAt(2) == ")" && line.charAt(3) == " "){
			if(line.charAt(1).toUpperCase() == line.charAt(1)){
				task['priority'] = line.charAt(1);
				line = line.substr(4);
			}
		}

		// Rule 2
		if(line.substr(0,line.indexOf(" ")).match( date_regex )){
			task['date'] = line.substr(0,line.indexOf(" "));
			line = line.substr(line.indexOf(" ")+1);
		}

		// Due Date
		if(line.indexOf("due:") != -1){
			task['due'] = line.substr( line.indexOf("due:") + "due:".length).split(" ")[0];
			line = line.substr( 0, line.indexOf("due:") ) + line.substr( line.indexOf("due:") + "due:".length + task['due'].length ); // remove it
		}

		var dom = $("<div>").addClass("task view").appendTo("#appArea .area" + task['priority']);
		dom.addClass("priority" + task['priority']);
		if(task['edit'] == true){
			dom.toggleClass("view edit");
		}
		
		$("<span>").addClass("text hideOnEdit").text(line).appendTo(dom);
		$("<input type=text>").addClass("showOnEdit line").val(line).appendTo(dom).on("change", function(){
			$(".text", $(this).parent()).text($(this).val());
		}).css("width", dom.width() - 70);

		$("<a href='#'>").addClass("right").attr("title", "Edit").click(function(){
			$(this).parent().toggleClass("view edit");
		}).html(edit_icon).prependTo(dom);

		$("<input type=checkbox>").prependTo(dom).attr("checked", task['completed']).on("change", function(){
			if($(this).is(":checked")){
				$(this).parent().addClass("done");
				console.log($(".doneDate", $(this).parent()).val() == "");
				if($(".doneDate", $(this).parent()).val() == ""){
					var d = new Date();
					$(".doneDate", $(this).parent()).val(d.getFullYear() + "-" + ("0" + d.getMonth()).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) );
				}
			} else{
				$(this).parent().removeClass("done");
			}
		}).trigger("change").addClass("doneBox");

		var editbox = $("<div>").addClass("editbox showOnEdit").appendTo(dom);
		
		$("<input type=date>").addClass("mkDate").appendTo($("<label>").html("Created: ").appendTo(editbox)).val(task['date']);
		$("<input type=date>").addClass("doneDate").appendTo($("<label>").html("Done: ").appendTo(editbox)).val(task['done']);
		$("<input type=date>").addClass("dueDate").appendTo($("<label>").html("Due: ").appendTo(editbox)).val(task['due']);

		var sel = $("<select>").addClass("priority").html("<option value=''>None</option>").appendTo(editbox).on("change", function(){
			display_tasks(to_txt(false), false); // rerender
		});
		for(i in uppercase){
			var opt = $("<option>").attr("value", uppercase[i]).text("Priority " + uppercase[i]).appendTo(sel);
			if(uppercase[i] == task['priority']){
				opt.attr("selected", "selected");
			}
		}

		$("<button>").html("delete").click(function(){
			showLB("<h2>Are you sure?</h2><p>Once deleted and saved you cannot get me back</p><a id='deleteMeNow' href='#'>yes</a>");
			var self = $(this);
			$("#deleteMeNow").click(function(){
				self.parent().parent().remove();
				hideLB();
			});
		}).appendTo(editbox);
	});

	$("<input type=text>").addClass("line").attr("placeholder", "Add a new task").on("keyup", function(e){
		if(e.keyCode == 13){ // enter
			display_tasks(to_txt(false) + "\n" + $(this).val(), false); // rerender
		}
	}).appendTo("#appArea");
}

function to_txt(proper){
	if(proper==undefined){ proper = true; }
	output = "";
	$(".task").each(function(){
		var line = "";
		
		if(!proper && $(this).hasClass("edit")){
			line += "E|";
		}

		if($(".doneBox:checked", this).length > 0){
			line += "x ";
			var c = $(".doneDate", this).val();
			if(c.length > 0){ c += " "; }
			line += c;
		}
		
		if( $(".priority", this).val() != "" ){
			line += "(" + $(".priority", this).val() + ") ";
		}

		var c = $(".mkDate", this).val();
		if(c.length > 0){ c += " "; }
		line += c;

		line += $(".line", this).val();

		c = $(".dueDate", this).val();
		if(c.length > 0){ c = " due:" + c; }
		line += c;
		
		output += line + "\n";
	});
	return output.substr(0,output.length-1);
}

$(document).ready(function(){
	console.log("TinyWiki Todo App");
	$("<link>").attr("href", "app/todo.css").attr("rel", "stylesheet").appendTo("head");

	var contents = $("#appData").val();

	edit_icon = $(".editIcon").html().replace('fill="#FFF"', 'fill="#000"');
	
	contents = contents.substr( contents.indexOf("\n") + 1 ); // Remove [app todo]
	display_tasks(contents);

	$("<a href='#'>").html("Export as todo.txt").click(function(){
		showLB("<textarea class='export'>"+to_txt()+"</textarea>");
	}).appendTo(".moreBox");	
});

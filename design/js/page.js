function showLB(content){
	$(".lbC .c").html(content);
	$(".lbB, .lbC").fadeIn();
}
function hideLB(){
	$(".lbB, .lbC").fadeOut();
}

function saveContents(){
	$("#appSaveStatus").html("saving");
	$.post(root + "edit/" + page + "?format=api", { "contents" : $("#appData").val() }).done(function() {
		$("#appSaveStatus").html("ok");
	})
	.fail(function(){
		$("#appSaveStatus").html("failure");
	});
}

function insertText(txt){
	EDITOR.replaceSelection(EDITOR.getSelection() + txt);
}

$(document).ready(function(){
	console.log("ok");
	$("#theEditor").autogrow();
	$("#image").click(function(){
		$("#uploadfile").click();
		return false;
	});

	$(".lbB, .lbC .closeButton").click(function(){
		hideLB();
	});
	$("#link").click(function(){
		showLB("...");
		$(".lbC .c").load(root + "__pages?format=editor");
		return false;
	});
	$("#existImage").click(function(){
		showLB("...");
		$(".lbC .c").load(root + "__gallery?format=editor");
		return false;
	});

	$("#theEditor").filedrop({
		fallback_id : "uploadfile",
		url : root + "__image",
		uploadStarted: function(i, file, len){
			$("#load").fadeIn();
		},
		uploadFinished: function(i, file, response, time) {
			$("#load").fadeOut();
			insertText(response);
		}
	});
	
	if($("#theEditor").length > 0){
	
	EDITOR = CodeMirror.fromTextArea($("#theEditor").get(0),{
		lineWrapping : true,
		gutters : [ "editor_gutter" ]
	});
	var mkg = function(m){
		return $("<div>").addClass("egv").html(m);
	};
	var edxt = undefined;
	var ed_change = function(doc){
		if(edxt != undefined) clearTimeout(edxt);
		edxt = setTimeout(function(){
			var lines = doc.getValue("\n").split("\n");
			var lno = 0;
			lines.forEach(function(line){
				if(line.indexOf("#") == 0){
					EDITOR.setGutterMarker(lno, "editor_gutter", mkg("<strong>H</strong>").get(0));
				} else if(line.indexOf("!") == 0){
					var img = mkg("I");console.log(lno);
					var ix = $(".cm-string", $(".CodeMirror-lines pre").get(lno+1)).html();
					img.data("img", ix.substring(1, ix.length-1));
					img.mouseover(function(){
						console.log($(this).offset().top);
						$(".previewBox").css("top", $(this).offset().top).css("left", $(this).offset().left - $(".previewBox").width() - 10).html("<img src='"+root+"images/"+$(this).data("img")+"' />");
					});
					EDITOR.setGutterMarker(lno, "editor_gutter", img.get(0));
				} else {
					EDITOR.setGutterMarker(lno, "editor_gutter", null);
				}
				lno+=1;
			});
		}, 300);
	};
	EDITOR.on("change", ed_change);
	ed_change( EDITOR.getDoc() );

	}

	$(".more").click(function(){
		$(".moreBox").toggleClass("hide");
	});

	$("#outline").fracs("outline", {
		"crop":false,
		"styles": [
			{
				selector: 'header,footer,section,article',
				fillStyle: '#CCC'
			},
			{
				selector: 'h1,h2,h3,h4,h5',
				fillStyle: '#666'
			},
			{
				selector: 'p',
				fillStyle: '#EEE'
			},
			{
				selector: '.header',
				fillStyle: '#333'
			},
			{
				selector: 'textarea',
				strokeStyle: '#333',
				fillStyle: '#EEE'
			},
			{
				selector: 'input',
				fillStyle: '#CCC'
			}
		]
	});
});

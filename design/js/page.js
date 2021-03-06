function showLB(content){
	$(".lbC .c").html(content);
	$(".lbB, .lbC").fadeIn();
}
function hideLB(){
	$(".lbB, .lbC").fadeOut();
	$("body").trigger("lightbox-hide");
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

function showPB(txt, self){
	$(".previewBox").css("top", $(self).offset().top).css("left", $(self).offset().left - $(".previewBox").width() - 10).html(txt);
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
		indentWithTabs : true,
		disableSpellcheck : false,
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
				if(line.indexOf("[app") == 0 && lno == 0){
					var app = mkg("A");
					app.data("app", line.substring("[app ".length, line.indexOf("]") ));
					app.mouseover(function(){
						showPB("This page will use the app " + $(this).data("app") + " to display it's contents", this);
					});
					EDITOR.setGutterMarker(lno, "editor_gutter", app.get(0));
				} else if(line.indexOf("#") == 0){
					EDITOR.setGutterMarker(lno, "editor_gutter", mkg("<strong>H</strong>").get(0));
				} else if(line.indexOf("!") == 0){
					var img = mkg("I");console.log(lno);
					var ix = $(".cm-string", $(".CodeMirror-lines pre").get(lno+1)).html();
					img.data("img", ix.substring(1, ix.length-1));
					img.mouseover(function(){
						showPB("<img src='"+root+"images/"+$(this).data("img")+"' />", this);
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

!function(a){var b=function(m,f){var t,r,v,o,d,l,g,w=document,n="body",q=function(){},e=q,p={},c=0,k=10;g=!m.pop?[m]:m;l=f||q;function u(x,z,y){var j=w.createElement("script"),i=0;c++;j.onload=j.onreadystatechange=function(C){var B,A;if(!i&&(!this.readyState||this.readyState==="complete")){i=1;if(!y){h(z)}else{(B=function(){(y in a)?h(z):setTimeout(B,k);(A>k)?errorCounter++:A++})()}}};j.async=true;j.src=x;w[n].appendChild(j)}function h(i){i();if(!--c){l()}return true}(function s(){if(!w[n]){return setTimeout(s,k)}d=w.getElementsByTagName("script");for(t in d){if(!!d[t].src){p[d[t].src]=t}}for(t in g){if(!!g[t].pop){v=g[t][0];e=g[t][1]||e;o=g[t][2]||o}else{v=g[t]}(!p[v])?(u(v,e,o)):(e())}if(!c){l()}})()};a.require=b}(this);

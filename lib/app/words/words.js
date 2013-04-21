function start_test(){
	$("body").on("lightbox-hide", function(){
		$("#appArea").fadeIn();
	});

	var screen = $(this).closest(".screen");
	$("#appArea").hide();
	showLB("<h2>Start test for "+ $("h2",screen).html() +"</h2><p>Please pick a test</p><button class='startmatch'>Match 'em up</button>");
	$(".startmatch").click(function(){
		showLB("Loading match 'em up...");
		require("http://code.jquery.com/ui/1.10.2/jquery-ui.min.js", function(){
			// Now pick up to 5 words
			var mywords = $($(".word", screen).rand(5));
			showLB("<div class='wordlist'></div><div class='meaning'></div><div class='clear'><span class='results'></span></div>");
			var i = 0;
			mywords.each(function(){
				$("<div>").addClass("matchword word" + i).html($("h3",this).html()).appendTo(".wordlist");
				$("<div>").addClass("matchword").html($("p",this).html()).data("i", i).appendTo(".meaning");
				i++;
			});
			$(".meaning .matchword").shuffle().droppable({
				accept : function(el){ return $(el).hasClass("word" + $(this).data("i")); },
				drop: function( event, ui ) {
					var word = $(".word"+$(this).data("i"));
					word.fadeOut();
					$(this).addClass("success").html( "<strong>"+ word.html() + "</strong>: "+ $(this).html() );
					$(".results").html("Score: " + $(".matchword.success").size() + "/" + $(".wordlist .matchword").size());
				}
			});
			$(".wordlist .matchword").draggable({ revert: "invalid" });
		});
	});
}

function render_words(contents){
	$("#appArea").html("");
	var lines = contents.split("\n");
	
	var screen = undefined,
		word = undefined;

	lines.forEach(function(line){
		if(line.indexOf("##") == 0){
			// new word
			word = $("<div>").addClass("word").appendTo(screen);
			$("<h3>").text(line.substr(3)).appendTo(word);
		} else if(line.indexOf("#") == 0){
			// new screen
			screen = $("<div>").addClass("screen").appendTo("#appArea");
			$("<button>").addClass("right").attr("title","Test if you know the meaning of the words").text("test").appendTo(screen).click(start_test);
			$("<h2>").text(line.substr(2)).appendTo(screen);
		} else{
			$("<p>").text(line).appendTo(word);
		}
	});
}

$(document).ready(function(){
	console.log("TinyWiki Word List App");
	$("<link>").attr("href", "app/words/words.css").attr("rel", "stylesheet").appendTo("head");
	
	var contents = $("#appData").val();
	contents = contents.substr( contents.indexOf("\n") + 1 ); // Remove [app words]
	render_words(contents);
});

// Random script
/**
 * jQuery.rand v1.0
 * 
 * Randomly filters any number of elements from a jQuery set.
 * 
 * MIT License: @link http://www.afekenholm.se/license.txt
 * 
 * @author: Alexander Wallin (http://www.afekenholm.se)
 * @version: 1.0
 * @url: http://www.afekenholm.se/jquery-rand
 */
(function($){
    $.fn.rand = function(k){
        var b = this,
            n = b.size(),
            k = k ? parseInt(k) : 1;

        // Special cases
        if (k > n) return b.pushStack(b);
        else if (k == 1) return b.filter(":eq(" + Math.floor(Math.random()*n) + ")");

        // Create a randomized copy of the set of elements,
        // using Fisher-Yates sorting
        r = b.get();
        for (var i = 0; i < n - 1; i++) {
            var swap = Math.floor(Math.random() * (n - i)) + i;
            r[swap] = r.splice(i, 1, r[swap])[0];
        }
        r = r.slice(0, k);

        // Finally, filter jQuery stack
        return b.filter(function(i){
            return $.inArray(b.get(i), r) > -1;
        });
    };
})(jQuery);

// Now we use this to shuffle the meanings
// http://css-tricks.com/snippets/jquery/shuffle-dom-elements/
(function($){
 
    $.fn.shuffle = function() {
 
        var allElems = this.get(),
            getRandom = function(max) {
                return Math.floor(Math.random() * max);
            },
            shuffled = $.map(allElems, function(){
                var random = getRandom(allElems.length),
                    randEl = $(allElems[random]).clone(true)[0];
                allElems.splice(random, 1);
                return randEl;
           });
 
        this.each(function(i){
            $(this).replaceWith($(shuffled[i]));
        });
 
        return $(shuffled);
 
    };
 
})(jQuery);

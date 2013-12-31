var tt;
var userId, userName;

/*!
 * jQuery Cookie Plugin v1.3
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
(function ($, document, undefined) {

	var pluses = /\+/g;

	function raw(s) {
		return s;
	}

	function decoded(s) {
		return decodeURIComponent(s.replace(pluses, ' '));
	}

	var config = $.cookie = function (key, value, options) {

		// write
		if (value !== undefined) {
			options = $.extend({}, config.defaults, options);

			if (value === null) {
				options.expires = -1;
			}

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			value = config.json ? JSON.stringify(value) : String(value);

			return (document.cookie = [
				encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// read
		var decode = config.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			if (decode(parts.shift()) === key) {
				var cookie = decode(parts.join('='));
				return config.json ? JSON.parse(cookie) : cookie;
			}
		}

		return null;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) !== null) {
			$.cookie(key, null, options);
			return true;
		}
		return false;
	};

})(jQuery, document);


 /* Utility Function for Image Beacons to track interactions
    beacon = function(opts){    
    // Make sure we have a base object for opts    
    opts = opts || {};    
    // Setup defaults for options    
    opts.url = opts.url || null;    
    opts.vars = opts.vars || {};    
    opts.error = opts.error || function(){};    
    opts.success = opts.success || function(){};     
    // Split up vars object into an array    
    var varsArray = [];    
    for(var key in opts.vars){ varsArray.push(key+'='+encodeURIComponent(opts.vars[key])); }    
    // Build query string    
    var qString = varsArray.join('&');     
    // Create a beacon if a url is provided    
    if( opts.url )    {        
     // Create a brand NEW image object        
     var beacon = new Image();        
     // Attach the event handlers to the image object        
     if( beacon.onerror )        { beacon.onerror = opts.error; }        
     if( beacon.onload )        { beacon.onload  = opts.success; }                 
     // Attach the src for the script call        
     beacon.src = opts.url + '?' + qString;    }}

	 getPageId = function() {
       return  window.location.pathname;	   
	 }
	*/
//function to show the popover
function showPopover(target, it) {
	var top = target.position().top,
		left = target.position().left,
		width = it.outerWidth(),
		iWidth = target.outerWidth(),
		iHeight = target.outerHeight()
	
	if(it.is(":visible")){
		it.css({
			display: "none"
		}).addClass("hide").removeClass("in")
		target.removeClass("open")
	}
	else {
		it.css({
			display: "block",
			left: left-width+iWidth+18 + "px",
			top: top+iHeight+5 +"px"
		}).removeClass("hide").addClass("in")
		target.addClass("open")
	}
}

function toggleFont(font){
	$("body").removeClass("sans-serif")
	$("body").removeClass("serif")
	$("body").removeClass("mono")
	$("body").addClass(font)
}

function toggleBackground(bg){
	$("body").removeClass("white")
	$("body").removeClass("black")
	$("body").removeClass("yellow")
	$("body").addClass(bg)
}

function fontSize(size){
	$("body").css({
		fontSize: size + "px"
	})
}
function resizeColumns(e, ui){
	//calculate the size of each column
	var col1 = $(e.currentTarget).parent().children(".span6:first-child"),
		col2 = $(e.currentTarget).parent().children(".span6:nth-child(2)"),
		parent = $(e.currentTarget).parent(),
		col1W = ((ui.position.left)/parent.width()) * 100,
		col2W = (((parent.width()-ui.position.left)/parent.width()) * 100) - 4.12766
		
	col1.css("width", col1W + "%")
	col2.css("width", col2W + "%")
}


$(document).ready(function(){

    tt = new Date().getTime();
	//console.log("tt = "+ tt);

    userName = $.cookie('userName') || "Default User";	
    userId = $.cookie('userId') || "user000";

    
    // Swap all container types, if they remain
    $("div.container").addClass("container-fluid").addClass("contentBucket").removeClass("container");

    // Things to do with a valid structure/nav tier...
    if (thisTier) {

        var page = $("html");
        var body = $("html > body");    
        var prepend = '';  // for debugging, a callout to any replaced text (try '#')
            
// "Swipe" arrows
        
        if (thisTier._next) {
            body.prepend (
            $('<a class="swipe next" href="'+thisTier._next.url+'" alt="Next page"><i class="icon-chevron-right"></i></a>')
			.on({
				mouseover: function(){
					$(".swipe").addClass("active")
				},
				mouseout: function(){
					$(".swipe").removeClass("active")
				}
			})
            );
        }
        
        if (thisTier._prev) {
            body.prepend (
            $('<a class="swipe prev" href="'+thisTier._prev.url+'" alt="Previous page"><i class="icon-chevron-left"></i></a>')
   			.on({
				mouseover: function(){
					$(".swipe").addClass("active")
				},
				mouseout: function(){
					$(".swipe").removeClass("active")
				}
			})
            );
        }

        
// Navbar
        
        if (1) {        
            body.prepend (
            '<!-- Top Bar -->'+
            '<div class="topbar">'+
                '<div class="left-slot breadcrumbs">'+
                    '<ul class="crumbs"></ul>'+
                '</div>'+
                '<div class="dropdown breadcrumbDrop pull-left">'+
					'<a href="#" class="btn btn-mini dropdown-toggle" data-toggle="dropdown"><i class="icon-reorder"></i></a>'+
					'<ul class="crumbs dropdown-menu"></ul>'+
				'</div>'+
            '</div>'
            );
            
            var bcrumb = $(".crumbs");
            
            for (var tier = thisTier._parent; tier != null; tier = tier._parent) {
                bcrumb.prepend(
                '<li>'+
                    '<a href="'+tier.url+'">'+tier.title+'</a>'+
                    (tier != thisTier._parent ? ' <span class="divider visible-desktop">:</span>' : '' )+
                '</li>');
            }
                
        }
//controls for font-size, etc...
	var popoverStruct = $('<div class="dropdown-menu displayConfig pull-right noSwipe" />')
						.append($('<div class="popover-content" />')
							.append($('<form class="form-inline" />')
								.append('<label>Size</label>')
								.append($('<div class="slider" />')
									.slider({
										max: 24,
										step: 1,
										value: 13,
										min: 8
									})
									.on({
										slidechange: function(e, ui){
											fontSize(ui.value)
										}
									})
								)
								.append('<label>Font</label>')
								.append($('<div class="btn-group block" data-toggle="buttons-radio">')
								    .append($('<button type="button" class="btn sans-serif active">Aa</button>')
										.click(function(e){
											toggleFont("sans-serif")
										})
									)
								    .append($('<button type="button" class="btn serif">Aa</button>')
										.click(function(e){
											toggleFont("serif")
										})
									)
								    .append($('<button type="button" class="btn mono">Aa</button>')
										.click(function(e){
											toggleFont("mono")
										})
									)
							    )
								.append('<label>Background</label>')
								.append($('<div class="btn-group block" data-toggle="buttons-radio">')
								    .append($('<button type="button" class="btn white active">White</button>')
										.click(function(e){
											toggleBackground("white")
										})
									)
								    .append($('<button type="button" class="btn black">Black</button>')
										.click(function(e){
											toggleBackground("black")
										})
									)
								    .append($('<button type="button" class="btn yellow">Yellow</button>')
										.click(function(e){
											toggleBackground("yellow")
										})
									)
							    )
							)
						)
						
	var controls = $('<div class="controls" />')
					.append($('<div class="control index dropdown" />')
						.append('<a href="#" data-toggle="dropdown" class="dropdown-toggle"><i class="icon-list" /></a>')
						.append('<div class="dropdown-menu pull-right tableOfContents"><div class="scroll"><ul class="toc" role="menu"></ul></div></div>')
					)
					.append('<div class="divider" />')
					.append($('<div class="control notes" />')
						.append('<a href="#"><i class="icon-edit" /></a>')
					)
					.append($('<div class=" dropdown control display" />')
						.append('<a href="#" data-toggle="dropdown" class="dropdown-toggle"><i class="icon-font" /></a>')
						.append(popoverStruct)
						/*.click(function(e){
							e.preventDefault()
							showPopover($(e.currentTarget), popoverStruct)
						})*/
					)
					//.append(popoverStruct)
					.appendTo(".topbar")
// Steps dots
        if (thisTier.type == "objective") {
            $(".topbar").append (
            '<div class="steps"></div>'
            );

            var steps = $(".steps");
            for (var i = 0; i < thisTier._parent.children.length; i++) {
                steps.append(
                '<div class="step'+(i == thisTier.ordinal-1 ? ' active':'')+'">'+(i+1)+'</div>'
                );
            }          
        }

//resizable columns
	var container = $(".contentBucket").children(".row-fluid"),
		handle = $('<span class="resize-btn"><i class="icon-arrow-left"></i>&nbsp;<i class="icon-arrow-right"></i></span>')
		columnHandle = $('<div class="columnResize" />')
						.append(handle)
						.draggable({
							handle : handle,
							axis : "x",
							containment : "parent",
							grid : [(container.width()-80)/5, 0]
						})
						.css("height", $(window).height()-60 + "px")
						.on({
							drag: function(e, ui){
								resizeColumns(e, ui)
							}
						})
						.appendTo(container)

// TOC for module and chapter
        
        if ((thisTier.type == "module") || (thisTier.type == "chapter")) {
            var content = $(".mainContent");
            
            // Build TOC table
            
            content.append(
            '<table class="toc">'+
                '<thead></thead>'+
                '<tbody></tbody>'+
            '</table>'  
            );
            var toc = $(".toc > tbody");
            
            // Add entries
            
            for (var i = 0; i < thisTier.children.length; i++) {
                var child = thisTier.children[i];
                toc.append(
                '<tr '+(child.ignore?'class="ignore"':'')+'>'+
                    (child.ignore
                        ?('<td class="number">'+child.id+'</td>'+
                            '<td class="name">'+child.title+'</td>')
                        :('<td class="number"><a href="'+child.url+'">'+child.id+'</a></td>'+
                            '<td class="name"><a href="'+child.url+'">'+child.title+'</a></td>')
                    )+
                '</tr>'
                );
            }
        }
        
        
// TOC for book
		//console.log(thisTier)
        if (thisTier.type == "book") {
            var toc = $(".toc"); // must exist already
		}
		else {
			var toc = $(".dropdown-menu").find(".toc")
		}
	        
            
        function bookToc(tier, node, ignore) {
            // Pre-munge your strings, if needed
            
            var url = tier.url;
            var unit = tier.id;
            var title = tier.title;
            var style = tier.type;
            
            switch (tier.type) {
            case "book":
                url = '';
                unit = "TITLE";
                break;
            case "chapter":
                unit = "Chapter "+tier.ordinal;
                break;
            }
            
            ignore = ignore || tier.ignore;
            
            if (ignore) {
                url = '';
                style += ' ignore';
            }
            
            // List yourself as li

            if (tier.type == "book") {
                // skip!
            }
            else if (!url) {
                node.append(
                '<li class="'+style+'">'+unit+' - '+title+'</li>'
                );                
            }
            else {
                node.append(
                '<li class="'+style+'"><a href="'+url+'"><span class="num">'+unit+'</span><span class="title">'+title+'</span></a></li>'
                );
            }
            
            // Create ul container for children
            
            
            var ul = node;

            if (tier.type != "book") {
                ul = $('<ul></ul>').appendTo(node);
            }
            
            // Iterate over children
        
            if (tier.children) {
                for (var i = 0; i < tier.children.length; i++) {
                    bookToc(tier.children[i], ul, ignore);
                }
            }
        }
        var newTier = thisTier.type == "book" ? thisTier : thisTier.type == "chapter" ? thisTier : thisTier.type == "objective" ? thisTier._parent._parent : thisTier._parent
        toc && bookToc(newTier, toc, false)
        
        
// Hook up interactive indicators

        1 && $(".inter").each(function processTerms(index) {    
            var content = $(this);
            
            content.append (
            '<div class="inter-indy" title="This content is interactive: play with it!"><i class="icon-hand-up"></i></div>'
            );

        });
        
        
// Hook up asides

        1 && $(".term").each(function processTerms(index) {
            var term = $(this);
            var href = $(this).attr('href');
            term.attr('data-toggle', 'modal');
            
            var aside = $(href);
            aside.find(".content a").addClass('remote'); // and mark as remote (later we'll change target)
            var label = aside.find(".label").text();
            var content = aside.find(".content").html();
            //alert(label + ': ' + content);
        
            aside.remove();
            
            body.append(
'<div id="'+(href.substring(1))+'" class="noSwipe done modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">'+
	'<div class="modal-header">'+
		'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">x</button>'+
		'<h3 id="myModalLabel">'+(label)+'</h3>'+
	'</div>'+
	'<div class="modal-body">'+
		//'<p>'+
            content+
        //'</p>'+
	'</div>'+
	'<div class="modal-footer">'+
        '<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>'+
	'</div>'+
'</div>'        
            );
            
        });
        

// External links

        1 && $("a.remote").each(function processRemoteLinks(index) {
            // We marked some of these in "asides" earlier, but let's catch them all here in case they were bare in the text
            var link = $(this);
            link.attr('target', '_new'); // send remote links to new tab
        });
        
// Footer

        if (thisTier.type == "objective") {    
            var container = $(".contentBucket");
            container.append (
            '<footer>'+
                //'<hr/>'+
                '&copy; Pearson Education 2012'+
            '</footer>'
            );
        }
        
// CSS transition helper

        if (0) {
            body.prepend (
            '<div class="flippy">'+
                '<span>Flip</span>'+
            '</div>'
            );
            
            var flip = $(".flippy span");
            
            flip && flip.click(function(event){
                body.toggleClass("XXX");
                flip.toggleClass("active");
            });
        }
        
// Assorted replacements
        
        // Set the document title, if the browser allows it
        
        document.title = prepend + "NEFF: " + thisTier.title;
        
        // Set the tier ID, title, etc where we find it: catch-all pseudo-templating!
        
        $(".setId").text(prepend+thisTier.id);
        $(".setTitle").text(prepend+thisTier.title);
        $(".setOrd").text(prepend+thisTier.ordinal);
        if (thisTier._parent) {
            $(".setParentTitle").text(prepend+thisTier._parent.title);
            $(".setParentOrd").text(prepend+thisTier._parent.ordinal);
        }
        
        
// Real swipe gestures

        body.swipe && body.swipe({
            swipe:function(event, direction, distance, duration, fingerCount) {
                var url = '';
                switch (direction) {
                case 'right':
                    url = thisTier._prev.url;
                    break;
                case 'left':
                    url = thisTier._next.url;
                    break;
                }
                if (url) {
                    body.fadeOut(150, function redir() {
                        window.location.href = url;
                    });
                }
                else {
                    return false;
                }
            },
            
            //fingers:2,
            threshold:200, // pixels traveled: under this and it won't trigger
            maxTimeThreshold:600, // ms taken to complete gesture: over this and it won't trigger
            triggerOnTouchEnd:true, // Whether to wait for the gesture to finish
            allowPageScroll:"vertical",
            excludedElements:".inter,.noSwipe",
            
            dummy:0
        });

        
/* Beacon tracking

       beacon({ url : 'http://'+window.location.host+'/scripts/track', vars : { 'id':getPageId(), 'name':userId.replace(/"/g,''), 'itype':'p', 'screenSize':screen.width+'x'+screen.height, 'rand':Math.floor((Math.random()*100000)+1) }});
	   //console.log(userId.replace('"',''));
*/

    } // end if(thisTier)

//measure the length of the window and the length of the viewpane, then append a class to the body
	var wH = $(window).height(),
		bH = $("body").outerHeight()
	
	if(wH < bH){
		$("body").addClass("overflow")
	}
        
}); // end DOM ready

 $(window).bind('beforeunload', function(){
	 //console.log("in timetrack");
	 beacon({ url : 'http://'+window.location.host+'/scripts/track', vars : { 'id':getPageId(), 'name':userId.replace(/"/g,''), 'itype':'u', 'tt':(new Date().getTime() - tt)/10, 'rand':Math.floor((Math.random()*100000)+1) }});
 });


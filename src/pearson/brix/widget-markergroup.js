/* **************************************************************************
 * $Workfile:: widget-MarkerGroup.js                                        $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the {@link pearson.brix.MarkerGroup} bric.
 *
 * The MarkerGroup bric draws a group of labels at specified locations
 * in an {@link pearson.brix.SVGContainer}.
 *
 * Created on		June 26, 2013
 * @author			Leslie Bondaryk
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.MarkerGroup');

goog.require('pearson.utils.IEventManager');
goog.require('pearson.brix.SvgBric');

// Sample Label constructor configuration
(function()
{
	var markerConfig = {
			id: "markers0",
			marks: [
			{x: 8, y: 20, label: "An early year"},
			{x: 20, label: "a later year", key: "liteup"},
			{x: 45, label: "the latest year with a long description"}
			],
			type: "x"
		};
});

/**
 * Information needed to process a label in a MarkerGroup.
 *
 * @typedef {Object} pearson.brix.MarkerConfig
 * @property {number}	x		-The logical x coordinate for the left edge of this marker
 * @property {number}	y		-The logical y coordinate for the top edge of this marker
 * @property {string=}	label	-Optional label to display in the marker, otherwise
 * 								 the x or y coordinate value will be displayed depending
 * 								 on the type of MarkerGroup this marker is a part of.
 * @property {string|undefined}
 * 						key		-Optional highlight key for this marker.
 *
 * @todo A MarkerConfig is very similar to a LabelConfig used for labels
 * in a LabelGroup, perhaps we should merge them? -mjl
 */
pearson.brix.MarkerConfig;
	
/* **************************************************************************
 * MarkerGroup                                                         */ /**
 *
 * Constructor for a MarkerGroup bric.
 * If the scale functions are not set before this bric is drawn, it will
 * assume the data extents are 0 - 1.
 *
 * @constructor
 * @extends {pearson.brix.SvgBric}
 * @export
 *
 * @param {Object}		config			-The settings to configure this MarkerGroup
 * @param {string|undefined}
 * 						config.id		-String to uniquely identify this MarkerGroup.
 * 										 if undefined a unique id will be assigned.
 * @param {Array.<!pearson.brix.MarkerConfig>}
 *						config.marks	-An array describing each marker in the group.
 *										 
 * @param {string}		config.type		-orientation of the markers on the x-axis('x')
 * 										 or the y-axis ('y')
 * @param {string=}		config.mode		-whether the markers may be dragged ('drags') or
 * 										 not (undefined).
 * @param {!pearson.utils.IEventManager=}
 * 						eventManager	-The event manager to use for publishing events
 * 										 and subscribing to them.
 *
 * @classdesc
 * A MarkerGroup draws a group of markers at specified locations
 * in an SVGContainer.
 * The MarkerGroup is usually used on top of another bric which provides the
 * data extents and scale functions to convert data points to pixel positions
 * in the container. If the scale functions are not set before this bric is
 * drawn, it assumes the data extents are 0 - 1.
 *
 * @todo: role: a string which is one of "label", "distractor".
 * @todo: we need some sort of autowidth intelligence on these, but I don't
 * know how to reconcile that with giving user control over wrapping
 ****************************************************************************/
pearson.brix.MarkerGroup = function (config, eventManager)
{
	// call the base class constructor
	goog.base(this);

	/**
	 * A unique id for this instance of the MarkerGroup widget
	 * @type {string}
	 */
	this.id = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.MarkerGroup);

	/**
	 * Array of markers to be graphed, where each marker is an object in an array
	 * @type {!Array.<!pearson.brix.MarkerConfig>}
	 * @example
	 *   // 2 markers, first numerical, second shows string label:
	 *   [{x: -1.2, y: 2.0}, {x: 5, y: 5, label: "big data"}]
	 */
	this.marks = config.marks;

	/**
	 * The type specifies the orientation on each marker, and must be one of
	 *
	 *  - "x" for vertical markers positioned on the x axis
	 *  - "y" for horizontal markers positions on the y axis
	 *
	 * @type {string|undefined}
	 */
	this.type = config.type;
	
	/**
	 * The mode specifies whether markers can be dragged
	 *
	 *  - "drags" for for draggable
	 *
	 * @type {string|undefined}
	 */
	this.mode = config.mode;
	
	/**
	 * The event manager to use to publish (and subscribe to) events for this bric
	 * @type {!pearson.utils.IEventManager}
	 */
	this.eventManager = eventManager || pearson.utils.IEventManager.dummyEventManager;

	/**
	 * The event id published when a marker in this group is selected.
	 * @const
	 * @type {string}
	 */
	this.selectedEventId = this.id + '_markerSelected';
	
	/**
	 * The event details for this.selectedEventId events
	 * @typedef {Object} SelectedEventDetails
	 * @property {string|number} selectKey	-The key associated with the selected label if it has one,
	 *										 otherwise the label's index within the group.
	 */
	var SelectedEventDetails;
	
	/**
	 * The scale functions set explicitly for this MarkerGroup using setScale.
	 * If these are not null when draw is called they will be used to position
	 * the markers. Otherwise a data extent of [0,1] will be mapped to the given
	 * container area.
	 * @type Object
	 * @property {d3.baseScale}
	 *						xScale	-function to convert a horizontal data offset
	 *								 to the pixel offset into the data area.
	 * @property {d3.baseScale}
	 *						yScale	-function to convert a vertical data offset
	 *								 to the pixel offset into the data area.
	 * @private
	 */
	this.explicitScales_ = {xScale: null, yScale: null, axisType: null};
	
	/**
	 * Information about the last drawn instance of this line graph (from the draw method)
	 * @type {Object}
	 */
	this.lastdrawn =
		{
			container: null,
			size: {height: 0, width: 0},
			markerGroup: null,
			xScale: null,
			yScale: null,
			axisType: null,
			markerCollection: null,
		};
}; // end of MarkerGroup constructor
goog.inherits(pearson.brix.MarkerGroup, pearson.brix.SvgBric);

/**
 * Prefix to use when generating ids for instances of MarkerGroup.
 * @const
 * @type {string}
 */
pearson.brix.MarkerGroup.autoIdPrefix = "marker_auto_";

/* **************************************************************************
 * MarkerGroup.draw                                                    */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Draw this MarkerGroup in the given container.
 *
 * @param {!d3.selection}	container	-The container svg element to append
 * 										 this SvgBric element tree to.
 * @param {!pearson.utils.ISize}
 * 							size		-The size (in pixels) of the area this
 * 										 SvgBric has been allocated.
 ****************************************************************************/
pearson.brix.MarkerGroup.prototype.draw = function (container, size)
{
	this.lastdrawn.container = container;
	this.lastdrawn.size = size;
	var xScale = this.lastdrawn.xScale,
		yScale = this.lastdrawn.yScale;
	this.setLastdrawnScaleFns2ExplicitOrDefault_(size);

	var that = this;

	var markerContainer = container.append("g") //make a group to hold markers
		.attr("class", "bricMarkers")
		.attr("id", this.id);
		
	this.lastdrawn.markerGroup = markerContainer;

	/*
	This puts a solid bar above the graph, as I have seen in some UX designs.
	Not sure it's appropriate for something that slides though.
	markerContainer.append("rect")
		.attr("width",size.width)
		.attr("height", 0.35 * size.height)
		//we need to move this above the graph.  The 25% assumes
		//that the containing svg is drawn with the graph occupying the 
		//bottom 80%. TODO: make this work on all sides, not just top
		.attr("y", - 0.35 * size.height - markerHeight)
		.attr("class", "fill0");
		*/

	// Draw the data (each marker line and label)
	this.drawData_();
};

/* **************************************************************************
 * MarkerGroup.redraw                                                  */ /**
 *
 * Redraw the data as it may have been modified. It will be
 * redrawn into the same container area as it was last drawn.
 *
 ****************************************************************************/
pearson.brix.MarkerGroup.prototype.redraw = function ()
{
	this.drawData_();
};

/* **************************************************************************
 * markerGroup.drawData_                                               */ /**
 *
 * Draw the marker data (overwriting any existing data).
 * @private
 *
 ****************************************************************************/
pearson.brix.MarkerGroup.prototype.drawData_ = function ()
{
	// local var names are easier to read (shorter)

	var size = this.lastdrawn.size;
	var xScale = this.lastdrawn.xScale;
	var yScale = this.lastdrawn.yScale;
	var markerGroup = this.lastdrawn.markerGroup;

	var markerHeight = 8;
	var that = this;
	
	
	//label height is currently set to 25% of the box height
	var labelHt = d3.round(0.25 * size.height), labelWid = size.width / (this.marks.length + 1);
	//TODO: probably shouldn't hard set these, but I'm not sure how to set wrapping otherwise.
	//These look marginally ok. The 25% assumes that the containing svg is drawn with the graph 
	//occupying the bottom 80%. Even this is flawed, as it uses the graph data rectangle
	//and not the whole graph rendering rectangle.

		
	// bind the marker group collection to the data
	// the collection is used to highlight and unhighlight
	var markerCollection = markerGroup.selectAll("g.marker").data(this.marks);

	// create <g> elements for every marker
	markerCollection.enter() 
		//groups are good because we can have a marker line, an intersection dot, 
		//and a label, and anything else
		//that requires the same relative coordinates.
		.append("g").attr("class", "marker");
	
	//on redraw, get rid of any series which now have no data
	markerCollection.exit().remove();  

	markerCollection
		.attr("transform",
			function (d)
			{
				// check orientation on the markers, and move the 
				// group accordingly.  The numbers are used within the local brix scale.
				// If the markers are horizontal from the y axis, move the group to the 
				// y data value vertically, but stay at zero horizontally.  Otherwise, 
				// move the group to the x data value horizontally, but stay at 0 vertically.
				// TODO: logic here is a little flawed, it assumes that the axes is on the 
				// bottom and left of the graph - lb

				//Date formats apparently differ across platforms, so it's necessary to parse them out,
				//something like this.  We'll need to do this properly everywhere.
				// http://stackoverflow.com/questions/5324178/javascript-date-parsing-on-iphone
				var makeDate = function makeDate(dateString) 
				{
					var dateArr = dateString.split(/[- / :]/);
					return new Date(dateArr[0], dateArr[1]-1);
				};

				var xVal = d3.round(that.lastdrawn.xScale(that.type === "y" ? 0 : (that.axisType == "time" ? new Date(d.x): d.x)));
				var yVal = d3.round(that.type === "y" ? that.lastdrawn.yScale(d.y) : 0);

				return pearson.brix.utils.attrFnVal("translate", xVal, yVal);
				//move each group to the data point specified for the marker
			});

	//draw the horizontal or vertical marker line
	markerCollection.append("line") 
		.attr("class", "markers")
		.attr("x1", 0)
		.attr("x2", 
		//if the markers are horizontal from the y axis, then the 
		//second x point is the full width of the box.  Otherwise,
		//it stays at 0.
			(this.type === "y") ? size.width : 0)
		//starts at the top of the box, 0 pixels at top in SVG
		.attr("y1", 0)
		.attr("y2", 
		//if the markers are horizontal from the y axis, then the 
		//second y point is 0.  Otherwise, it's the full height of the graph rectangle.
			(this.type === "y") ? 0 : size.height);
		
		//if a full data point crossing is specified, put a dot there.
	markerCollection.append("circle")
		.attr("cx",
			function (d)
			{	
				// @todo this needs to be turned into a nested if statement that would hopefully be
				//       easier to understand. and I'm not sure the 1st condition is correct anyway. -mjl
				return d.x ? d3.round(that.lastdrawn.xScale(that.type === "y" ? (that.axisType == "time" ? new Date(d.x): d.x) : 0)) : -size.width;
			})
		.attr("cy",
			function (d)
			{	
				// if a y value is specified, and the markers are horizontal, put the dot at 0, which
				// will be on the edge of the correctly located marker group.  If the markers are vertical
				// put the dot on the y value vertically.  If no value is specified, draw them at the top
				// of the graph under the marker label.
				return d.y ? d3.round(that.lastdrawn.yScale(that.type === "y" ? 0 : d.y )) : -size.height;
			})
		.attr("r", 6);

	//draw the marker arrows (triangles)
	markerCollection.append("polygon") 
		.attr("points", 
			//if the markers are horizontal from the y axis, then the 
			//arrows point to the left on the right side.  Otherwise 
			//they point down from the top.  
			//TODO: accomodate other axis positions,since these assume top/right marker
			//placement.
			 (this.type === "y") ? 	"8,-8 8,8 " +  -markerHeight + ",0" : 
			 						"-8, " +  -markerHeight + " 8, " +  -markerHeight + " 0,6");

	//draw the marker boxes (rectangles)
	markerCollection.append("rect") 
		.attr("width", labelWid)
		.attr("height", labelHt)
		//we need to move this above the graph.  The 25% assumes
		//that the containing svg is drawn with the graph occupying the 
		//bottom 80%. TODO: make this work on all sides, not just top
		.attr("y", - labelHt - markerHeight + 1)
			//if the markers are horizontal from the y axis, then the 
			//arrows point to the left on the right side.  Otherwise 
			//they point down from the top.  
			//TODO: accomodate other axis positions,since these assume top/right marker
			//placement.
			//x position puts it at the start of the downward triangle
			//this also only works for marker labels on top
		.attr("x", -8);
		
  
	//draw data labels on the markers
	markerCollection.append("foreignObject")
		// if y markers, x value is all the way on the right side, otherwise, 
		// back up to the start of the down arrow
		.attr("x", this.type === "y" ? size.width : -8)
		// if y markers, y value is at the very top of the marker group, at 0, 
		// otherwise, move the label up to start at the top of the box, above
		// the line, plus some (-5)
		.attr("y", this.type === "y" ? 0 : (-labelHt - 5))
		.attr("width", labelWid)
		.attr("height", labelHt)
		.append("xhtml:body")
			//this interior body shouldn't inherit margins from page body
			.style("margin", "2px") 
			.append("div").attr("class", "markerLabel")
			.html(function (d, i)
				{
					// make the label from value, or, if a label is 
					// specified, use just that
					var xInfo = ('x' in d) ? ("x: " + (that.axisType == "time" ? d3.time.format("%b %Y")(new Date(d.x)): d.x) + "<br>") : "";
					var yInfo = ('y' in d) ? ("y: " + d.y + "<br>") : "";
					var labelInfo = ('label' in d) ? d.label : "";
					return xInfo + yInfo + labelInfo;
				}); 
		
	// autokey entries which have no key with the data index
	markerCollection.each(
			function (d, i)
			{ 
				// if there is no key assigned, make one from the index
				d.key = 'key' in d ? d.key : i.toString();
			});
	
	if (this.mode == "drags")
	{
		var dragBehavior = d3.behavior.drag()
			// todo: learn how to use d3 origin control on drags
			//.origin(function(d) { return d; })
			.on("drag",
				function (d, i)
				{
					//calculate new position in pixels, and convert back to local coordinates
					var xVal = xScale.invert(d3.event.x);

					/*
					@todo: it might be desirable to snap to data points when dragging 
					markers, but this requires the data from the graph to be fed to the marker object
					and I don't have a good strategy for that yet. This also allows you to update
					the y value on the marker.  There are issues here with multiple traces. It's kind of 
					a mess. But here's how! -lb
					xVal = that.snapTo(xData, size.width)(d3.event.x);
					xindex = xData.indexOf(xVal);
					d.y = yData[xindex];
					*/

					//if this is a time axis, then data is specified as a string, not the Date 
					//object returned by xScale.invert, so fix that up
					d.x = that.axisType == "time" ? xVal.toString() : d3.round(xVal,2);
					
					//and redraw with the new data
					that.redraw();
				})
			.on("dragend",
				function (d, i)
				{
					window.console.log("TODO: log fired marker " + d.key + " to position " + d.x);
				});

			markerCollection.call(dragBehavior);
	}

	markerCollection
		.on('click',
			function (d, i)
			{
				that.eventManager.publish(that.selectedEventId, {selectKey: d.key});
				that.lite(d.key);
			});

	this.lastdrawn.markerCollection = markerGroup.selectAll("g.marker");

}; // end of MarkerGroup.drawdata_()

/* **************************************************************************
 * MarkerGroup.setScale                                                */ /**
 *
 * Called to preempt the normal scale definition which is done when the
 * widget is drawn. This is usually called in order to force one widget
 * to use the scaling/data area calculated by another widget.
 *
 * @param {d3.anyScale}
 *						xScale	-function to convert a horizontal data offset
 *								 to the pixel offset into the data area.
 * @param {d3.anyScale}
 *						yScale	-function to convert a vertical data offset
 *								 to the pixel offset into the data area.
 *
 ****************************************************************************/
pearson.brix.MarkerGroup.prototype.setScale = function (xScale, yScale)
{
	this.explicitScales_.xScale = xScale;
	this.axisType = (xScale.domain()[0] instanceof Date) ? "time" : "linear";
	this.explicitScales_.yScale = yScale;
};

/* **************************************************************************
 * MarkerGroup.lite                                                    */ /**
 *
 * Highlight the label(s) associated w/ the given liteKey (key) and
 * remove any highlighting on all other labels.
 *
 * @param {string}	liteKey	-The key associated with the label(s) to be highlighted.
 *
 ****************************************************************************/
pearson.brix.MarkerGroup.prototype.lite = function (liteKey)
{
	window.console.log("TODO: log fired marker highlite " + liteKey);
	
	// Turn off all current highlights
	var allMarkers = this.lastdrawn.markerCollection;
	allMarkers
		.classed("lit", false);
	
	// create a filter function that will match all instances of the liteKey
	// then find the set that matches
	var matchesIndex = function (d, i) { return d.key === liteKey; };
	
	var markersToLite = allMarkers.filter(matchesIndex);

	// Highlight the labels w/ the matching key
	markersToLite
		.classed("lit", true);

	if (markersToLite.empty())
	{
		window.console.log("No key '" + liteKey + "' in MarkerGroup " + this.id );
	}
}; // end of MarkerGroup.lite()


/* **************************************************************************
 * MarkerGroup.setLastdrawnScaleFns2ExplicitOrDefault_                 */ /**
 *
 * Set this.lastdrawn.xScale and yScale to those stored in explicitScales
 * or to the default scale functions w/ a data domain of [0,1].
 * @private
 *
 * @param {!pearson.utils.ISize}
 * 						cntrSize	-The pixel size of the container given to draw().
 *
 ****************************************************************************/
pearson.brix.MarkerGroup.prototype.setLastdrawnScaleFns2ExplicitOrDefault_ = function (cntrSize)
{
	if (this.explicitScales_.xScale !== null)
	{
		this.lastdrawn.xScale = this.explicitScales_.xScale;
		this.lastdrawn.axisType = this.explicitScales_.xScale.scale;
	}
	else
	{
		// map the default x data domain [0,1] to the whole width of the container
		this.lastdrawn.xScale = d3.scale.linear().rangeRound([0, cntrSize.width]);
	}
	
	if (this.explicitScales_.yScale !== null)
	{
		this.lastdrawn.yScale = this.explicitScales_.yScale;
	}
	else
	{
		// map the default y data domain [0,1] to the whole height of the container
		// but from bottom to top
		this.lastdrawn.yScale = d3.scale.linear().rangeRound([cntrSize.height, 0]);
	}
}; // end of MarkerGroup.setLastdrawnScaleFns2ExplicitOrDefault_()

/* **************************************************************************
 * MarkerGroup.setOpacity                                              */ /**
 *
 * Set the opacity of the marker (show/hide)
 *
 * @param {number}		opacity		- opacity value to be set to (0: transparent, 1: opaque)
 * @param {number}		duration	- the duration of the transition in milliseconds
 * @param {number}		delay		- the delay before the transition starts in milliseconds
 *
 ****************************************************************************/
pearson.brix.MarkerGroup.prototype.setOpacity = function (opacity, duration, delay)
{

	var allMarkers = this.lastdrawn.markerCollection;

	allMarkers.transition()
		.style('opacity', opacity)
		.duration(duration).delay(delay);
};

/* **************************************************************************
 * MarkerGroup.snapTo                                                  */ /**
 *
 * Snap to a data value in the series, rather than open-ended drag positioning.
 *
 * @param {Array.<{x: (number|string), y: (number|string)}>}
 * 						data		-the data values to snap to as {x: val, y: val}
 * @param {Array}		range 		-two element array with the start and end point of the canvas
*
 ****************************************************************************/
pearson.brix.MarkerGroup.prototype.snapTo = function (data, range) 
{
	//relies on the cardinality of (number of points) of data 
	// uses the quantized scale in reverse to assign only points
	// in the data as values in the pixel coordinate domain 
	// accessible by mouse/touch moves across a container
	return d3.scale.quantize().domain(range).range(data); 
};



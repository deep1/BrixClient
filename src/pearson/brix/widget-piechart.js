/* **************************************************************************
 * $Workfile:: widget-piechart.js                                           $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the PieChart widget.
 *
 * The PieChart widget provides a line (or scatter) graph visualization
 * of sets of data points.
 *
 * Created on		August 20, 2013
 * @author			Leslie Bondaryk
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.PieChart');

goog.require('pearson.utils.IEventManager');
goog.require('pearson.brix.SvgBric');

// Sample BarChart constructor configuration
(function()
{
	var pc1Config = {
			id: "pc1",
			Data: [
			// y is used as key for the label to keep it consistent with Bar Chart data.  Bar Charts
			// and pie charts are two representations of the same kind of data.
				{x: 50, y: "brie"},
			  	{x: 30, y: "roquefort"},
			  	{x: 20, y: "venezuelan beaver cheese"}],
		};
});
	
/* **************************************************************************
 * PieChart                                                            */ /**
 *
 * The PieChart widget provides single or multiple series bar chart
 * visualization of sets of data points. Can create pyramid chart (two sided)
 * or grouped bar chart (several bars on the same label from different series - multivariate)
 *
 * @constructor
 * @extends {pearson.brix.SvgBric}
 * @export
 *
 * @param {Object}		config			-The settings to configure this PieChart
 * @param {string}		config.id		-String to uniquely identify this PieChart.
 * @param {Array.<{x: number, y: string, key: (string|undefined)}>}
 *						config.Data		-An array of series;
 *										 each series is an array of one or more percentages with names.
 *										 Either wedges or series can have a key label for highlighting.
 * @param {!pearson.utils.IEventManager=}
 * 						eventManager	-allows the object to emit events
 *
 * @note: Pie Charts could have a type: specifying donut charts instead.
 * For now, pie charts will always be drawn with a legend that shows the 
 * percentages of each wedge. Note that pie x values don't have to add up to
 * 100.  If they don't, d3 will calculate portions of 100%. 
 **************************************************************************/
pearson.brix.PieChart = function (config, eventManager)
{
	// call the base class constructor
	goog.base(this);

	/**
	 * A unique id for this instance of the bar chart widget
	 * @type {string}
	 */
	this.id = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.PieChart);

	/**
	 * Array of bar series, where each series is an array of objects/bars, and each object is a
	 * bar lengths and category w/ a {number/size} x and {string} y property.
	 * Negative bar lengths Mean bars should face the other way.
	 *
	 * @example
	 *   3 series, 1 bar each:
	 *   [[{y: "High Income", x: 5523.6}], [{yVal: "Middle Income", xVal: 1509.3}], [{y: "Low Income", x: 491.8}]]
	 * bar objects may also include an optional key: string in which case they will be given an ID that 
	 * associates them with other widget events in the page, such as clicks on the legend.
	 *
	 * @type {Array.<{x: number, y: string, key: (string|undefined)}>}
	 */
	this.data = config.Data;

	/**
	 * The scale functions set explicitly for this Image using setScale.
	 * Image doesn't use scale functions, but they may get used in a widget chain.
	 * Otherwise a data extent of [0,1] will be mapped to the given
	 * container area.
	 * @type {Object}
	 * @property {function(number): number}
	 *						xScale	-function to convert a horizontal data offset
	 *								 to the pixel offset into the data area.
	 * @property {function(number): number}
	 *						yScale	-function to convert a vertical data offset
	 *								 to the pixel offset into the data area.
	 * @private
	 */
	this.explicitScales_ = {xScale: null, yScale: null};

	// The config for the legend for this piechart
	var legendConfig =
		{
			type: "box",
			xPos: "left",
			yPos: "top",
			labels: this.getLegendLabels_()
		};

	/**
	 * The piechart always has a legend which will display the values of the
	 * wedge angles.
	 * @type {!pearson.brix.Legend}
	 */
	this.legend = new pearson.brix.Legend(legendConfig, this.eventManager);

	/**
	 * List of child widgets which are to be drawn before and after this
	 * bar chart's data in its data area.
	 * Child widgets are added using BarChart.append.
	 * @type {{beforeData: Array.<!pearson.brix.SvgBric>, afterData: Array.<!pearson.brix.SvgBric>}}
	 */
	this.childWidgets = {beforeData: [], afterData: []};
	
	/**
	 * The event manager to use to publish (and subscribe to) events for this bric
	 * @type {!pearson.utils.IEventManager}
	 */
	this.eventManager = eventManager || pearson.utils.IEventManager.dummyEventManager;

	/**
	 * The event id published when a wedge in the pie is selected.
	 * @const
	 * @type {string}
	 */
	this.selectedEventId = this.id + '_wedgeSelected';
	 
	/**
	 * Information about the last drawn instance of this pie chart 
	 * (values set during the draw method)
	 * @type {Object}
	 */
	this.lastdrawn =
		{
			container: null,
			size: {height: 0, width: 0},
			dataRect: new pearson.utils.Rect(0, 0, 0, 0),
			wedgeId: 'wedge',
			widgetGroup: null,
			axesR: null,
			axes: {
				// need to figure out how to give pie charts "axes" that allow things like
				// markers to be appended to them.  They don't get run through the normal 
				// Axes object. -lb
				group: null, 
				dataRect: new pearson.utils.Rect(0, 0, 0, 0),
			},
			xScale: null,
			yScale: null,
			wedges: null,
			graph: null,
		};
		
}; // end of PieChart constructor
goog.inherits(pearson.brix.PieChart, pearson.brix.SvgBric);

/**
 * Prefix to use when generating ids.
 * @const
 * @type {string}
 */
pearson.brix.PieChart.autoIdPrefix = "pie_auto_";


/* **************************************************************************
 * PieChart.draw                                                       */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Draw the PieChart bric into the specified area of the given container.
 *
 * @param {!d3.selection}	container	-The container svg element to append
 * 										 this SvgBric element tree to.
 * @param {!pearson.utils.ISize}
 * 							size		-The size (in pixels) of the area this
 * 										 SvgBric has been allocated.
 ****************************************************************************/
pearson.brix.PieChart.prototype.draw = function (container, size)
{
	this.lastdrawn.container = container;
	this.lastdrawn.size = size;
	
	this.setLastdrawnScaleFns2ExplicitOrDefault_(size);

	// size of the pie will be half of the smaller dimension of the available 
	// rectangle
	var padding = 20;
	var r = size.height > size.width ? (size.width/2 - padding) : (size.height/2 - padding);
	
	// pie should start 20 pixels from the left edge of box

	var offset = padding + r; //padding from the axes

	//set the dataRect to be the container
	this.lastdrawn.axes.dataRect = new pearson.utils.Rect(0, 0, 2*offset, 2*offset);
	this.lastdrawn.dataRect = this.lastdrawn.axes.dataRect;
	
	this.lastdrawn.axesR = r;

	// make a group to hold the image
	var pieGroup = container.append("g")
		.attr("class", "bricPie")
		.attr("id", this.id)
		.attr("transform", "translate(" + 2*offset + "," + 0 + ")");

	// draw a circle defining 100% of pie, for case where it's not 
	// all filled - this is the pie's "axes"
	this.lastdrawn.axes.group = pieGroup.append("g")
		.attr("transform", "translate(" + (-offset) + "," + offset + ")");

	// draw the axis circle
	this.lastdrawn.axes.group.append("circle")
		.attr("class", "axis")
		.attr("cx",0)
		.attr("cy",0)
		.attr("r",r);

	this.lastdrawn.widgetGroup = pieGroup;

	// Draw the legend on top of the piechart for now
	this.legend.draw(this.lastdrawn.widgetGroup, size);
	
	// Draw any 'before' child widgets that got appended before draw was called
	this.childWidgets.beforeData.forEach(this.drawWidget_, this);
	
	// Draw the data (traces and/or points as specified by the graph type)
	this.drawData_();

	// Draw any 'after' child widgets that got appended after draw was called
	this.childWidgets.afterData.forEach(this.drawWidget_, this);

}; // end of PieChart.draw()


/* **************************************************************************
 * PieChart.redraw                                                     */ /**
 *
 * Redraw the line graph data as it may have been modified. It will be
 * redrawn into the same container area as it was last drawn.
 * @export
 *
 ****************************************************************************/
pearson.brix.PieChart.prototype.redraw = function ()
{
	// TODO: We may want to create new axes if the changed data would cause their
	//       min/max to have changed, but for now we're going to keep them.

	// TODO: Do we want to allow calling redraw before draw (ie handle it gracefully
	//       by doing nothing? -mjl
	this.childWidgets.beforeData.forEach(this.redrawWidget_, this);
	
	this.drawData_();
	//
	// Update the legend labels and redraw it.
	this.legend.labels = this.getLegendLabels_();
	this.legend.redraw();

	this.childWidgets.afterData.forEach(this.redrawWidget_, this);
};

/* **************************************************************************
 * PieChart.drawWidget_                                                */ /**
 *
 * Draw the given child widget in this charts's data area.
 * This chart must have been drawn BEFORE this method is called or
 * bad things will happen.
 * @private
 *
 * @todo implement some form of error handling! -mjl
 *
 ****************************************************************************/
pearson.brix.PieChart.prototype.drawWidget_ = function (widget)
{
	widget.setScale(this.lastdrawn.xScale, this.lastdrawn.yScale);
	widget.draw(this.lastdrawn.axes.group, this.lastdrawn.dataRect.getSize());
};


/* **************************************************************************
 * PieChart.redrawWidget_                                              */ /**
 *
 * Redraw the given child widget.
 * This bar chart and this child widget must have been drawn BEFORE this
 * method is called or bad things will happen.
 * @private
 *
 * @todo implement some form of error handling! -mjl
 *
 ****************************************************************************/
pearson.brix.PieChart.prototype.redrawWidget_ = function (widget)
{
	widget.redraw();
};

/* **************************************************************************
 * PieChart.getLegendLabels_                                           */ /**
 *
 * Create an array of legend labels for the current data of this PieChart.
 * @private
 *
 * @returns {Array.<{content: string}>} Labels for a legend for this piechart
 *          matching the current data.
 *
 ****************************************************************************/
pearson.brix.PieChart.prototype.getLegendLabels_ = function ()
{
	// take the opportunity to make the legend labels while we're cycling through the data
	var legLabels = [];

	this.data.forEach(
			function (o, i) {
				if (o.y !== "white") {
				legLabels.push({content: o.y + " " + o.x + "%"});
				}
			});

	return legLabels;
};

/* **************************************************************************
 * PieChart.setScale                                                   */ /**
 *
 * Called to preempt the normal scale definition which is done when the
 * widget is drawn. This is usually called in order to force one widget
 * to use the scaling/data area calculated by another widget.
 *
 * @param {function(number): number}
 *						xScale	-function to convert a horizontal data offset
 *								 to the pixel offset into the data area.
 * @param {function(number): number}
 *						yScale	-function to convert a vertical data offset
 *								 to the pixel offset into the data area.
 *
 ****************************************************************************/
pearson.brix.PieChart.prototype.setScale = function (xScale, yScale)
{
	this.explicitScales_.xScale = xScale;
	this.explicitScales_.yScale = yScale;
};

/* **************************************************************************
 * PieChart.drawData_                                                  */ /**
 *
 * Draw the chart data (overwriting any existing data).
 * @private
 *
 ****************************************************************************/
pearson.brix.PieChart.prototype.drawData_ = function ()
{
	// local var names are easier to read (shorter)
	var xScale = this.lastdrawn.xScale;
	var yScale = this.lastdrawn.yScale;
	var size = this.lastdrawn.size;

	var that = this;
	
	// get the group that contains the graph lines
	var graph = this.lastdrawn.axes.group;
	
	// This section conditions the data 
	var sumData = 0,
		last = this.data.length;

	this.data.forEach(
			function (o, i) { sumData = sumData + Math.abs(o.x); });

	if (sumData<100)
	{
		// if the sum of all the data points does not add up to 100%, then
		// append a new data point to bring the total up to 100.
		// When this is drawn, the "last" point will be detected as
		// having extended the data range, and we'll color it white (blank).
		// This allows us to draw wedges instead of the whole pie. - lb
		this.data.push({x: 100 - sumData, y: "white"});
	}
	
	
	// if there is a negative data point (rotational angle chart), 
	// make it positive but draw it last instead of first, after the white part
	if (this.data[0].x < 0)
	{
		this.data[0].x = - this.data[0].x;
		//this only works if we assume that for angles, which can be 
		//negative, that there is only one in the data series.
		this.data.reverse();	
		last = 0;
	}

	//draw the series
	
	// create <path> arc elements using "axes" radius as a function
	var arc = d3.svg.arc()  
	        .outerRadius(this.lastdrawn.axesR);

	// d3 pie function creates arc data for us given a list of values
	var pieArcs = d3.layout.pie()           
		    .value(function (d) { return d.x; })
		    //null sort maintains order of input - critical for single value angles
			.sort(null);

	// bind all the series data to a group element w/ a wedge class
	// creating or removing group elements so that each wedge has its own group.
	var wedges = graph.selectAll("g.wedge") 
	        .data(pieArcs(this.data));           
	//associate the generated pie data (an array of arcs w/startAngle, endAngle and value props)
	wedges.enter()
	    .append("g")
	    .attr("class", function (d, i) {
				return "slice fill" + ((i == last) ? "White" : i);
			});    //color with predefined sequential colors

	//this creates the path using the associated data with the arc drawing function
	wedges.append("path")
	   .attr("d", arc);      

	//on redraw, get rid of any wedges which now have no data
	wedges.exit().remove();  

	// autokey entries which have no key with the data index for highlighting
	// can't use the y label because it might contain spaces. 
	wedges.each(function (d, i) { 
					// if there is no key assigned, make one from the index
					d.key = 'key' in d ? d.key : i.toString();
					});
	
	wedges.on('click',
				function (d, i)
				{
					that.eventManager.publish(that.selectedEventId, {selectKey: d.key});
				});
				
	//do a clean selection of the drawn data to store for the object properties
	this.lastdrawn.wedges = graph.selectAll("g.wedges");
};

/* **************************************************************************
 * PieChart.append                                                     */ /**
 *
 * Append the widget or widgets to this bar chart and draw it/them on top
 * of the data area and any widgets appended earlier. If append
 * is called before draw has been called, then the appended widget(s) will be
 * drawn when draw is called.
 * @export
 *
 * @param {!pearson.brix.SvgBric|Array.<!pearson.brix.SvgBric>}
 * 						svgWidgets	-The widget or array of widgets to be drawn in
 *									 this line graph's data area.
 * @param {string|undefined}
 * 						zOrder		-Optional. Specifies whether to append this
 * 									 widget to the list of widgets that are
 * 									 drawn before the graph data or the list that
 * 									 is drawn after. "after" | "before", defaults
 * 									 to "after".
 *
 ****************************************************************************/
pearson.brix.PieChart.prototype.append = function (svgWidgets, zOrder)
{
	if (!Array.isArray(svgWidgets))
	{
		this.append_one_(/**@type {!pearson.brix.SvgBric}*/ (svgWidgets), zOrder);
	}
	else
	{
		svgWidgets.forEach(function (w) {this.append_one_(w, zOrder);}, this);
	}

	// Deal w/ drawing the appended widgets before already drawn data.
	if (zOrder === "before" && this.lastdrawn.container != null)
	{
		// we need to remove the existing drawn elements and execute draw again
		var container = this.lastdrawn.container;
		var size = this.lastdrawn.size;
		var axes = this.lastdrawn.axes;
		this.clearLastdrawn_();
		axes.group.remove();
		this.draw(container, size);
	}
		
}; // end of BarChart.append()

/* **************************************************************************
 * PieChart.append_one_                                                */ /**
 *
 * Helper for append that does the work needed to append a single widget.
 * This can handle drawing the widget after the data even after the data
 * has been drawn, but it does not handle drawning the widget before when
 * the data has already been drawn, so the caller must deal with that situation.
 *
 * @param {!pearson.brix.SvgBric}
 * 						widget	-The widget which is to be drawn in this line
 *								 graph's data area.
 * @param {string|undefined}
 * 						zOrder	-Optional. Specifies whether to append this
 * 								 widget to the list of widgets that are
 * 								 drawn before the graph data or the list that
 * 								 is drawn after. "after" | "before", defaults
 * 								 to "after".
 *
 * @private
 *
 ****************************************************************************/
pearson.brix.PieChart.prototype.append_one_ = function (widget, zOrder)
{
	if (zOrder === "before")
	{
		this.childWidgets.beforeData.push(widget);
	}
	else
	{
		this.childWidgets.afterData.push(widget);
	
		if (this.lastdrawn.container !== null)
			this.drawWidget_(widget);
	}
		
} // end of BarChart.append_one_()

/* **************************************************************************
 * PieChart.setLastdrawnScaleFns2ExplicitOrDefault_                    */ /**
 *
 * Set this.lastdrawn.xScale and yScale to those stored in explicitScales
 * or to the default scale functions w/ a data domain of [0,1].
 * @private
 *
 * @param {!pearson.utils.ISize}
 * 						cntrSize	-The pixel size of the container given to draw().
 *
 ****************************************************************************/
pearson.brix.PieChart.prototype.setLastdrawnScaleFns2ExplicitOrDefault_ = function (cntrSize)
{
	if (this.explicitScales_.xScale !== null)
	{
		this.lastdrawn.xScale = this.explicitScales_.xScale;
	}
	else
	{
		// map the default x data domain [0,1] to the width of the pie, starting
		// from the padding edge - this is in lieu of real pie axes.  We'll have
		// to ponder this more carefully when solidifying pie charts.  Probably
		// it's useful to correlate the center of the pie to 0,0 on an x-y set of
		// over/underlaid cartesian axes. -lb

		this.lastdrawn.xScale = d3.scale.linear().rangeRound([20, 2*this.axesR]);
	}
	
	if (this.explicitScales_.yScale !== null)
	{
		this.lastdrawn.yScale = this.explicitScales_.yScale;
	}
	else
	{
		// map the default y data domain [0,1] to the width of the pie, starting
		// from the padding edge - this is in lieu of real pie axes
		this.lastdrawn.yScale = d3.scale.linear().rangeRound([2*this.axesR, 20]);
	}
}; // end of PieChart.setLastdrawnScaleFns2ExplicitOrDefault_()

/* **************************************************************************
 * PieChart.lite                                                       */ /**
 *
 * Highlight the members of the collection associated w/ the given liteKey (key) and
 * remove any highlighting on all other labels.
 * @export
 *
 * @param {string}	liteKey	-The key associated with the label(s) to be highlighted.
 *
 ****************************************************************************/
pearson.brix.PieChart.prototype.lite = function (liteKey)
{
	window.console.log("TODO: log fired PieChart highlite " + liteKey);
	
	// Turn off all current highlights
	var allWedges = this.lastdrawn.wedges;
	allWedges
		.classed("lit", false);
		

	// create a filter function that will match all instances of the liteKey
	// then find the set that matches
	var matchesKey = function (d, i) { return d.key === liteKey; };
	
	var wedgesToLite = allWedges.filter(matchesKey);

	// Highlight the labels w/ the matching key
	wedgesToLite
		.classed("lit", true);

	if (wedgesToLite.empty())
	{
		window.console.log("No key '" + liteKey + "' in pie chart " + this.id );
	}
};


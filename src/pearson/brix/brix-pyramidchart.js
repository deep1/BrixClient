/* **************************************************************************
 * $Workfile:: widget-pyramidchart.js                                           $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the {@link pearson.brix.PyramidChart} bric.
 *
 * The PyramidChart bric provides a double-sided horizontal bar chart visualization
 * of two sets of data points.
 *
 * Created on		October 18, 2013
 * @author			Leslie Bondaryk
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.PyramidChart');

goog.require('pearson.utils.IEventManager');
goog.require('pearson.brix.SvgBric');
goog.require('pearson.brix.AxisFormat');
goog.require('pearson.brix.PrototypeAxes');

// Sample Pyramid Chart constructor configuration
(function()
{
	var bc1Config = {
			id: "bc1",
			Data: [],
			dataLabels: ['Men', 'Women'],
			xAxisFormat: { // other axis options are set by default
						  	ticks: [5, 10, 15, 20],
							label: "Population (Millions)" },
			yAxisFormat: {  
							ticks: ['9-14','15-19','20-24'],
						   	label: "Age Group" },
		};
});
	
/* **************************************************************************
 * PyramidChart                                                            */ /**
 *
 * Constructor function for a PyramidChart bric.
 *
 * @constructor
 * @extends {pearson.brix.SvgBric}
 * @export
 *
 * @param {Object}		config			-The settings to configure this PyramidChart
 * @param {string}		config.id		-String to uniquely identify this PyramidChart.
 * @param {Array.<Array.<{x: number, y: string, key: (string|undefined)}>>}
 *						config.Data		-An array of 2 series;
 *										each series is an array of one or more bars with names.
 *										Either bars or series can have a key label for highlighting.
 * @param {pearson.brix.AxisFormat}
 *        				config.xAxisFormat -Format of the x axis of the two graphs.
 * @param {pearson.brix.AxisFormat}
 * 						config.yAxisFormat -Format of the y axis of the two graphs.
 * @param {!pearson.utils.IEventManager=}
 * 						eventManager	-allows the object to emit events
 *
 *
 * @classdesc
 * The PyramidChart bric is a special variant of the BarChart bric that takes
 * only two data sets and always displays the first in it's own bar chart with a
 * reverse axis.  Special handling only draws the label down the center 
 *
 **************************************************************************/
pearson.brix.PyramidChart = function (config, eventManager)
{
	// call the base class constructor
	goog.base(this);

	/**
	 * A unique id for this instance of the bar chart bric
	 * @type {string}
	 */
	this.id = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.PyramidChart);


	// call the base class constructor
	config.id = this.pyramidId_ + '_base';
	goog.base(this, config, eventManager);

	/**
	 * Array of bar series, where each series is an array of objects/bars, and each object is a
	 * bar lengths and category w/ a {number/size} x and {string} y property.
	 * There should always be two - additional series are ignored.
	 * @type {Array.<Array.<{x: number, y: string, key: (string|undefined)}>>}
	 *
	 * @example
	 *   // 2 series, 5 bars each:
	 *   [[{y: "5-9", x: 40}],
	 *    [{y: "10-14", x: 30}],
	 *    [{y: "15-19", x: 20}]]
	 * @example
	 *   // bar objects may also include an optional key: string in
	 *   // which case they will be given an ID that associates them
	 *   // with other bric events in the page, such as clicks on
	 *   // the legend.
	 */
	this.data = config.Data;

	/**
	 * The render type is one of:
	 *
	 *  - "grouped" for bars from multiple series with the same label, 
	 *    plotted side by side instead of on top of one another
	 *  - {null} for regular bars
	 *
	 * @type {string}
	 */
	this.type = config.type;

	
	// Configure left and right graphs
	var rightConfig = {
			Data: [this.data[0]],
			xAxisFormat: {	type: 'linear',
							ticks: 3,
							orientation: 'bottom',
							//label: config.xAxisFormat.label 
						},
			yAxisFormat: {	type: 'ordinal',
							orientation: 'left',
							ticks: 0,
							},
		};
	
	var leftConfig = {
	// the data needs to have an empty first data set, so the color cycles to the 
	// next in series from the right hand graph
	// @todo - we should be checking and padding so tht the y values are the
	// same for all sets of data or these graphs won't work! - lb
			Data: [[], this.data[1]], 
			xAxisFormat: {	type: 'linear',
							ticks: config.xAxisFormat.ticks,
							orientation: 'bottom',
							mode: 'reverse'
						},
			yAxisFormat: {	type: 'ordinal',
							orientation: 'right',
							ticks: config.yAxisFormat.ticks,
						},
		};
 
	/**
	 * The left and right bar charts comprising the pyramid chart
	 * @type {!pearson.brix.BarChart}
	 */
	this.rightGraph = new pearson.brix.BarChart(rightConfig);
	this.leftGraph = new pearson.brix.BarChart(leftConfig);

	/**
	 * The x and y axis labels
	 * @private
	 * @type {string}
	 */
	
	this.xLabel_ = config.xAxisFormat.label;
	this.yLabel_ = config.yAxisFormat.label;

	/**
     * Column width (in pixels) which is the full size display, with margins.
     * @note This sets the width at which captions display at full font size.
     * If not set, the default is for a two-column layout with even column widths.
     * @private
     * @type {number}
     */
    this.displayWidth_ = config.displayWidth || 477;
     
    // Draw the x axis label to measure it
	var xlabelRendered = d3.select('body')
						.append("div")
						.style('visibility', 'hidden')
						.style('width', this.displayWidth_ + "px")
						.attr("class", "axisLabel")
						.html(this.xLabel_);

	// Draw the y axis label to measure it
	var ylabelRendered = d3.select('body')
						.append("div")
						.style('visibility', 'hidden')
						.style('width', this.displayWidth_ + "px")
						.attr("class", "axisLabel")
						.html(this.yLabel_);

	// measure the  height, and set the associated size to match what was rendered
	// then remove the dummy rendering
	
	/**
     * The full size (in pixels) of the x and y labels
     * @private
     * @type {!pearson.utils.ISize}
     */
    this.xlabelSize_ = new pearson.utils.Size(xlabelRendered.node().offsetHeight,
		this.displayWidth_);
	xlabelRendered.remove();
	this.ylabelSize_ = new pearson.utils.Size(ylabelRendered.node().offsetHeight,
		this.displayWidth_);

	ylabelRendered.remove();

	/**
	 * List of child brix which are to be drawn before and after this
	 * bar chart's data in its data area.
	 * Child brix are added using PyramidChart.append.
	 * @type {{beforeData: Array.<!pearson.brix.SvgBric>, afterData: Array.<!pearson.brix.SvgBric>}}
	 */
	this.childBrix = {beforeData: [], afterData: []};
		
	/**
	 * The event manager to use to publish (and subscribe to) events for this bric
	 * @type {!pearson.utils.IEventManager}
	 */
	this.eventManager = eventManager || pearson.utils.IEventManager.dummyEventManager;

	//these aren't hooked up yet, but I expect bar graphs to eventually need
	//to fire drag events that let users change the data for the bar length
	//and drag events that let users sort the data differently, reordering the bars -lb
	/**
	 * The event id published when a row in this group is selected.
	 * @const
	 * @type {string}
	 */
	this.selectedEventId = this.id + '_barSelected';

	/**
	 * The event id published when a the order of the bars is changed.
	 * @const
	 * @type {string}
	 */
	this.sortedEventId = this.id + '_barSortChanged';
	
	
	/**
	 * Information about the last drawn instance of this line graph (from the draw method)
	 * @type {Object}
	 */
	this.lastdrawn =
		{
			container: null,
			size: {height: 0, width: 0},
			dataRect: new pearson.utils.Rect(0, 0, 0, 0),
			axes: null,
			xScale: null,
			yScale: null,
			groupScale: null,
			bandsize: null,
			bars: null,
			graph: null,
		};
}; // end of pyramidChart constructor

goog.inherits(pearson.brix.PyramidChart, pearson.brix.SvgBric);

/**
 * Prefix to use when generating ids for instances of PyramidChart.
 * @const
 * @type {string}
 */
pearson.brix.PyramidChart.autoIdPrefix = "pyramid_auto_";


/* **************************************************************************
 * PyramidChart.draw                                                       */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Draw this PyramidChart in the given container.
 *
 * @param {!d3.selection}	container	-The container svg element to append
 * 										 this SvgBric element tree to.
 * @param {!pearson.utils.ISize}
 * 							size		-The size (in pixels) of the area this
 * 										 SvgBric has been allocated.
 ****************************************************************************/
pearson.brix.PyramidChart.prototype.draw = function(container, size)
{
	this.lastdrawn.container = container;
	this.lastdrawn.size = size;
	
	// aliases of utility functions for readability
    var attrFnVal = pearson.brix.utils.attrFnVal;

    var that = this;

	var brixGroup = container.append("g")
		.attr("class", "brixPyramidChart")
		.attr("id", this.id);

	
	var barsId = this.id + '_bars';


	// Draw any 'before' child brix that got appended before draw was called
	this.childBrix.beforeData.forEach(this.drawBric_, this);

	
	// Draw the barcharts

	var leftGroup = brixGroup.append("g")
	.attr('class', 'leftChart')
			.attr('transform', attrFnVal('translate', 0, this.ylabelSize_.height));

	// it's important to render both graphs at the same width, with the same y axis data
	// so their scales match.  But we'll remove the ticks from one and scootch it over
	// so it shares labels with the other

	this.leftGraph.draw(leftGroup, {height: (size.height - this.xlabelSize_.height - this.ylabelSize_.height),
		width: (0.6 * size.width)});

	var leftWidth = leftGroup.node().getBBox().width;
	 
	var yAxisWidth = leftGroup.select('.y.axis').node().getBBox().width;
	
	var rightGroup = brixGroup.append("g")
	.attr('class', 'rightChart')
	// @TODO it should be correct to place
			.attr('transform', attrFnVal('translate', leftWidth - yAxisWidth + 10,
				this.ylabelSize_.height));


	this.rightGraph.draw(rightGroup, {height: (size.height - this.xlabelSize_.height - this.ylabelSize_.height),
		width: (0.6 * size.width)});
	
	// don't show the right set of tick labels since they are the same as the left
	rightGroup.selectAll('.y .tick text').remove();

	// Draw the x axis label below the graph
	var xLabelGroup = brixGroup.append("g")
		.attr('class','axis')
		.attr('transform', attrFnVal('translate', -yAxisWidth/2, size.height - this.xlabelSize_.height));

	// Draw the x axis label above the graph, in the center
	var yLabelGroup = brixGroup.append("g")
		.attr('class','axis')
		.attr('transform', attrFnVal('translate', 5 - yAxisWidth/2, 0));;

	xLabelGroup.append("foreignObject")
			.attr("width", this.xlabelSize_.width)
			.attr("height", this.ylabelSize_.height)
			.append("xhtml:body")
			// this interior body shouldn't inherit margins from page body
				.style("margin", "0px")
				.append('div')
				.attr('class','axisLabel')
				.html(this.xLabel_);

	yLabelGroup.append("foreignObject")
			.attr("width", this.ylabelSize_.width)
			.attr("height", this.ylabelSize_.height)
			.append("xhtml:body")
			// this interior body shouldn't inherit margins from page body
				.style("margin", "0px")
				.append('div')
				.attr('class','axisLabel')
				.html(this.yLabel_);

	// for now, let's make the datarect of the pyramid chart correspond to that of the 
	// right graph (arbitrary)
	this.lastdrawn.datarect = this.rightGraph.datarect;

	// Draw any 'after' child brix that got appended after draw was called
	this.childBrix.afterData.forEach(this.drawBric_, this);


	
}; // end of pearson.brix.PyramidChart.draw()


/* **************************************************************************
 * PyramidChart.redraw                                                     */ /**
 *
 * Redraw the chart data as it may have been modified. It will be
 * redrawn into the same container area as it was last drawn.
 * @export
 *
 ****************************************************************************/
pearson.brix.PyramidChart.prototype.redraw = function ()
{
	// TODO: We may want to create new axes if the changed data would cause their
	//       min/max to have changed, but for now we're going to keep them.

	this.childBrix.beforeData.forEach(this.redrawBric_, this);
	//this.drawData_();
	this.rightGraph.redraw();
	this.leftGraph.redraw();

	this.childBrix.afterData.forEach(this.redrawBric_, this);
};

/* **************************************************************************
 * PyramidChart.drawBric_                                                  */ /**
 *
 * Draw the given child bric in this chart's data area.
 * This chart must have been drawn BEFORE this method is called or
 * bad things will happen.
 *
 * @private
 *
 * @param {!pearson.brix.SvgBric}	bric	-The child bric to draw in the data area.
 *
 * @todo implement some form of error handling! -mjl
 *
 ****************************************************************************/
pearson.brix.PyramidChart.prototype.drawBric_ = function (bric)
{
	bric.setScale(this.lastdrawn.xScale, this.lastdrawn.yScale);
	bric.draw(this.lastdrawn.axes.group, this.lastdrawn.dataRect.getSize());
};


/* **************************************************************************
 * PyramidChart.redrawBric_                                                */ /**
 *
 * Redraw the given child bric.
 * This bar chart and this child bric must have been drawn BEFORE this
 * method is called or bad things will happen.
 *
 * @private
 *
 * @param {!pearson.brix.SvgBric}	bric	-The child bric to redraw.
 *
 * @todo implement some form of error handling! -mjl
 *
 ****************************************************************************/
pearson.brix.PyramidChart.prototype.redrawBric_ = function (bric)
{
	bric.redraw();
};

/* **************************************************************************
 * PyramidChart.drawData_                                                  */ /**
 *
 * Draw the chart data (overwriting any existing data).
 *
 * @private
 *
 ****************************************************************************/
pearson.brix.PyramidChart.prototype.drawData_ = function ()
{
	// local var names are easier to read (shorter)
	var xScale = this.lastdrawn.xScale;
	var yScale = this.lastdrawn.yScale;
	var bandsize = this.lastdrawn.bandsize;
	var groupScale = this.lastdrawn.groupScale;
	var that = this;
	/* I think we don't need any of this because the barCharts do their own. - lb
	// get the group that contains the graph lines
	var graph = this.lastdrawn.graph;
	
	//draw the series
	// bind all the series data to a group element w/ a series class
	// creating or removing group elements so that each series has its own group.
	var barSeries = graph.selectAll("g.series")
		.data(this.data);

	barSeries.enter()
		.append("g")
			.attr("class", function(d, i) {
					//give each series it's own color
					return "series fill" + i;
				});
	//on redraw, get rid of any series which now have no data
	barSeries.exit().remove();  

	// autokey entries which have no key with the data index for highlighting
	// can't use the y label because it might contain spaces. 
	barSeries.each(function (d, i) { 
					// if there is no key assigned, make one from the index
					d.key = 'key' in d ? d.key : i.toString();
					});
	//If it's a grouped barchart, shimmie out the bars by group
	//Bars will be thinner and the group will be centered around
	//the ordinal label. The whole series can be shifted up or down 
	//according to it's order.  TODO: make these sortable by max or
	//min value for any group label
	if (this.type == "grouped")
	{
		barSeries.attr("transform", function(d, i) {
				return "translate(0," + (groupScale(i)) + ")";
				});
	}
	

	// The series data is an array of values for each bar of the series
	// bind each series data element (bar length) to a child group element, 
	// one for each bar in the series. - mjl
	//	Enclose the bars in individual groups 
	// so you could choose to label the ends with data or label
	//  and have it stick to the bar by putting it in the same group -lb
	var bars = barSeries.selectAll("g.bar")
		.data(function(d) {return d;}); 	//drill down into the nested data

	bars.exit().remove();
 
	bars.enter()
		.append("g")
			.attr("class", "bar")
			.append("rect");
			
	// TODO: figure out a strategy for highlighting and selecting individual bars -lb 

	bars.transition().attr("transform",
				  function(d)
				  {
				// move each group to the x=0 position horizontally if it's a
				// positive bar, or start at it's negative x value if negative,
				// or at it's positive value if reversedx.
				// The negative value logic allows us to draw pyramid charts, normally bar 
				// charts are bin counts and all positive. 
				      var x = (d.x < 0 || that.lastdrawn.axes.xFmt.mode === "reverse") ? xScale(d.x) : xScale(0);
					  var y = yScale(d.y);
				      return "translate(" + x + "," + y + ")";
				  });
				  
	// Update the height and width of the bar rects based on the data points bound above.
	bars.select("rect").transition()
	//if grouped, each bar is only 1/(# groups) of the available height around 
	// an ordinal tickmark
		.attr("height", (this.type == "grouped") ? (bandsize / (this.data.length + 1)) : bandsize)
		.attr("width",
			  function(d)
			  {
				  return Math.abs(xScale(0) - xScale(d.x));
			  });
			  
	
	bars.on('click',
				function (d, i)
				{
					that.eventManager.publish(that.selectedEventId, {selectKey: d.key});
				});
				
	//do a clean selection of the drawn data to store for the object properties
	this.lastdrawn.bars = graph.selectAll("g.series");
	*/
};

/* **************************************************************************
 * PyramidChart.append                                                     */ /**
 *
 * Append the bric or brix to this bar chart and draw it/them on top
 * of the data area and any brix appended earlier. If append
 * is called before draw has been called, then the appended bric(s) will be
 * drawn when draw is called.
 * @export
 *
 * @param {!pearson.brix.SvgBric|Array.<!pearson.brix.SvgBric>}
 * 						svgBrix		-The bric or array of brix to be drawn in
 *									 this line graph's data area.
 * @param {string|undefined}
 * 						zOrder		-Optional. Specifies whether to append this
 * 									 bric to the list of brix that are
 * 									 drawn before the graph data or the list that
 * 									 is drawn after. "after" | "before", defaults
 * 									 to "after".
 *
 ****************************************************************************/
 pearson.brix.PyramidChart.prototype.append = function(svgBrix, zOrder)
{
	if (!Array.isArray(svgBrix))
	{
		this.append_one_(/**@type {!pearson.brix.SvgBric}*/ (svgBrix), zOrder);
	}
	else
	{
		svgBrix.forEach(function (w) {this.append_one_(w, zOrder);}, this);
	}

	// Deal w/ drawing the appended brix before already drawn data.
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
		
}; // end of pearson.brix.PyramidChart.append()

/* **************************************************************************
 * PyramidChart.append_one_                                                */ /**
 *
 * Helper for append that does the work needed to append a single bric.
 * This can handle drawing the bric after the data even after the data
 * has been drawn, but it does not handle drawning the bric before when
 * the data has already been drawn, so the caller must deal with that situation.
 *
 * @param {!pearson.brix.SvgBric}	
 * 						bric	-The bric which is to be drawn in this line
 *								 graph's data area.
 * @param {string|undefined}
 * 						zOrder	-Optional. Specifies whether to append this
 * 								 bric to the list of brix that are
 * 								 drawn before the graph data or the list that
 * 								 is drawn after. "after" | "before", defaults
 * 								 to "after".
 *
 * @private
 *
 ****************************************************************************/
pearson.brix.PyramidChart.prototype.append_one_ = function(bric, zOrder)
{
	if (zOrder === "before")
	{
		this.childBrix.beforeData.push(bric);
	}
	else
	{
		this.childBrix.afterData.push(bric);
	
		if (this.lastdrawn.container !== null)
			this.drawBric_(bric);
	}
		
} // end of pearson.brix.PyramidChart.append_one_()


/* **************************************************************************
 * PyramidChart.lite                                                       */ /**
 *
 * Highlight the members of the collection associated w/ the given liteKey (key) and
 * remove any highlighting on all other labels.
 * @export
 *
 * @param {string}	liteKey	-The key associated with the label(s) to be highlighted.
 *
 ****************************************************************************/
pearson.brix.PyramidChart.prototype.lite = function(liteKey)
{
	this.rightGraph.lite();
	this.leftGraph.lite();
};


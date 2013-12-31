/* **************************************************************************
 * $Workfile:: widget-barchart.js                                           $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the {@link pearson.brix.BarChart} bric.
 *
 * The Barchart bric provides a line (or scatter) graph visualization
 * of sets of data points.
 *
 * Created on		April 11, 2013
 * @author			Leslie Bondaryk
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.BarChart');

goog.require('pearson.utils.IEventManager');
goog.require('pearson.brix.SvgBric');
goog.require('pearson.brix.AxisFormat');
goog.require('pearson.brix.PrototypeAxes');

// Sample BarChart constructor configuration
(function()
{
	var bc1Config = {
			id: "bc1",
			Data: [],
			type: "grouped",
			xAxisFormat: { type: "linear",
                           mode: "reverse",
                           ticks: 5,
                           orientation: "bottom",
                           label: "linear bar value (%)" },
			yAxisFormat: { type: "ordinal",
                           ticks: 5,
                           orientation: "left",
                           label: "Bar category labels" },
		};
});
	
/* **************************************************************************
 * BarChart                                                            */ /**
 *
 * Constructor function for a BarChart bric.
 *
 * @constructor
 * @extends {pearson.brix.SvgBric}
 * @export
 *
 * @param {Object}		config			-The settings to configure this BarChart
 * @param {string}		config.id		-String to uniquely identify this BarChart.
 * @param {Array.<Array.<{x: number, y: string, key: (string|undefined)}>>}
 *						config.Data		-An array of series;
 *										 each series is an array of one or more bars with names.
 *										 Either bars or series can have a key label for highlighting.
 * @param {string}		config.type		-String specifying "grouped", or anything else (ignored)
 * @param {pearson.brix.AxisFormat}
 * 						config.xAxisFormat -Format of the x axis of the graph.
 * @param {pearson.brix.AxisFormat}
 * 						config.yAxisFormat -Format of the y axis of the graph.
 * @param {!pearson.utils.IEventManager=}
 * 						eventManager	-allows the object to emit events
 *
 * @note: One of the two axes must be ordinal for a bar graph. Only y is accomodated
 * for now.
 * There's a lot of logic in here to make sure that both positive and
 * negative values are accomodated.  Negative values have to count right to x=0
 * and positive must always count right from x=0. Currently all bar graphs are
 * assumed to layout horizontally.
 * @todo: vertical bar graphs (thermometers)
 * @todo: emit events when edges of bars are dragged to set a new value
 *
 * @classdesc
 * The BarChart bric provides single or multiple series bar chart
 * visualization of sets of data points. Can create pyramid chart (two sided)
 * or grouped bar chart (several bars on the same label from different series - multivariate)
 *
 **************************************************************************/
pearson.brix.BarChart = function (config, eventManager)
{
	// call the base class constructor
	goog.base(this);

	/**
	 * A unique id for this instance of the bar chart bric
     * @private
	 * @type {string}
	 */
	this.barId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.BarChart);

	/**
	 * Array of bar series, where each series is an array of objects/bars, and each object is a
	 * bar lengths and category w/ a {number/size} x and {string} y property.
	 * Negative bar lengths Mean bars should face the other way.
     * @private
	 * @type {Array.<Array.<{x: number, y: string, key: (string|undefined)}>>}
	 *
	 * @example
	 *   // 3 series, 1 bar each:
	 *   [[{y: "High Income", x: 5523.6}],
	 *    [{yVal: "Middle Income", xVal: 1509.3}],
	 *    [{y: "Low Income", x: 491.8}]]
	 * @example
	 *   // bar objects may also include an optional key: string in
	 *   // which case they will be given an ID that associates them
	 *   // with other bric events in the page, such as clicks on
	 *   // the legend.
	 */
	this.data_ = config.Data;

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

	/**
	 * Format of the x axis of the graph.
	 * @type {!pearson.brix.AxisFormat}
	 */
	this.xAxisFormat = config.xAxisFormat;

	/**
	 * Format of the y axis of the graph.
	 * @type {!pearson.brix.AxisFormat}
	 */
	this.yAxisFormat = config.yAxisFormat;

	/**
	 * List of child brix which are to be drawn before and after this
	 * bar chart's data in its data area.
	 * Child brix are added using BarChart.append.
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
	this.selectedEventId = pearson.brix.BarChart.getEventTopic('selected', this.barId_);

	/**
	 * The event id published when the order of the bars is changed.
	 * @const
	 * @type {string}
	 */
	this.reorderedEventId = pearson.brix.BarChart.getEventTopic('reordered', this.barId_);
	
	
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
} // end of barChart constructor
goog.inherits(pearson.brix.BarChart, pearson.brix.SvgBric);

/**
 * Prefix to use when generating ids for instances of BarChart.
 * @const
 * @type {string}
 */
pearson.brix.BarChart.autoIdPrefix = "bar_auto_";

/* **************************************************************************
 * BarChart.getEventTopic (static)                                     */ /**
 *
 * Get the topic that will be published for the specified event by a
 * BarChart bric with the specified id.
 * @export
 *
 * @param {string}  eventName       -The name of the event published by instances
 *                                   of this Bric.
 * @param {string}  instanceId      -The id of the Bric instance.
 *
 * @returns {string} The topic string for the given topic name published
 *                   by an instance of BarChart with the given instanceId.
 *
 * @throws {Error} If the eventName is not published by this bric or the
 *                 topic cannot be determined for any other reason.
 ****************************************************************************/
pearson.brix.BarChart.getEventTopic = function (eventName, instanceId)
{
    /**
     * Functions that return the topic of a published event given an id.
     * @type {Object.<string, function(string): string>}
     */
    var publishedEventTopics =
    {
        'selected': function (instanceId)
        {
            return instanceId + '_barSelected';
        },
        'reordered': function (instanceId)
        {
            return instanceId + '_barSortChanged';
        },
    };

    if (!(eventName in publishedEventTopics))
    {
        throw new Error("The requested event '" + eventName + "' is not published by BarChart brix");
    }

    return publishedEventTopics[eventName](instanceId);
};

/* **************************************************************************
 * BarChart.getId                                                      */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Returns the ID of this bric.
 *
 * @returns {string} The ID of this Bric.
 *
 ****************************************************************************/
pearson.brix.BarChart.prototype.getId = function ()
{
    return this.barId_;
};

/* **************************************************************************
 * BarChart.getData                                                    */ /**
 *
 * Get the data being used by this BarChart.
 *
 * @returns {Array.<Array.<{x: number, y: string, key: (string|undefined)}>>}
 * the data being used by this BarChart.
 *
 ****************************************************************************/
pearson.brix.BarChart.prototype.getData = function ()
{
    return this.data_;
};

/* **************************************************************************
 * BarChart.setData                                                    */ /**
 *
 * Set the data that this BarChart should display.
 *
 * @param {Array.<Array.<{x: number, y: string, key: (string|undefined)}>>}
 *                  newData         -The new data for this BarChart to display
 *
 ****************************************************************************/
pearson.brix.BarChart.prototype.setData = function (newData)
{
    this.data_ = newData;

    // If we're currently drawn someplace, redraw w/ the new data
    if (this.lastdrawn.container != null)
    {
        this.redraw();
    }
};

/* **************************************************************************
 * BarChart.setSeries                                                  */ /**
 *
 * Set one of the series that this BarChart should display.
 *
 * @param {number}  seriesIndex     -The (0-based) index of the series data to
 *                                   replace.
 * @param {Array.<{x: number, y: string, key: (string|undefined)}>}
 *                  newSeries       -The new series data
 *
 ****************************************************************************/
pearson.brix.BarChart.prototype.setSeries = function (seriesIndex, newSeries)
{
    this.data_[seriesIndex] = newSeries;

    // If we're currently drawn someplace, redraw w/ the new data
    if (this.lastdrawn.container != null)
    {
        this.redraw();
    }
};

/* **************************************************************************
 * BarChart.draw                                                       */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Draw this BarChart in the given container.
 *
 * @param {!d3.selection}	container	-The container svg element to append
 * 										 this SvgBric element tree to.
 * @param {!pearson.utils.ISize}
 * 							size		-The size (in pixels) of the area this
 * 										 SvgBric has been allocated.
 ****************************************************************************/
pearson.brix.BarChart.prototype.draw = function(container, size)
{
	this.lastdrawn.container = container;
	this.lastdrawn.size = size;
	
	// Create the axes (svg canvas) in the container
	var axesConfig = {
			id: this.barId_ + '_axes',
			size: this.lastdrawn.size,
			xAxisFormat: this.xAxisFormat,
			yAxisFormat: this.yAxisFormat,
		};

	//all the data in each dimension is merged to use for the domain  
	//on the axis (autoranging)
	var dataPts = d3.merge(this.data_);
	
	
	// Check to see whether ordinal scales will be generated in x or y
	// and whether explicit ticks are set, which overrides the autoranging
	if (axesConfig.xAxisFormat.type == 'ordinal')
	{
		var ordinalValueMap = d3.set(dataPts.map(function (pt) {return pt.x;}));
		axesConfig.xAxisFormat.extent = ordinalValueMap.values();
	}
	else
	{
		axesConfig.xAxisFormat.extent = d3.extent(dataPts, function(pt) {return pt.x;});
	}
	
	if (axesConfig.yAxisFormat.type == 'ordinal')
	{
		var ordinalValueMap = d3.set(dataPts.map(function (pt) {return pt.y;}));
		axesConfig.yAxisFormat.extent = ordinalValueMap.values();
		
	} 
	else
	{
		axesConfig.yAxisFormat.extent = d3.extent(dataPts, function(pt) {return pt.y;});
	}
	
	//make the axes for this graph - draw these first because these are the 
	//pieces that need extra unknown space for ticks, ticklabels, axis label
	this.lastdrawn.axes = new pearson.brix.PrototypeAxes(this.lastdrawn.container, axesConfig);
	//only draw axes if there aren't any yet
	/*
	if(!d3.select("#"+ axesConfig.id)[0][0]){
		this.lastdrawn.axes = new Axes(this.lastdrawn.container, axesConfig);
	}*/
	
	
	//inherit the dataRect from the axes container
	this.lastdrawn.dataRect = this.lastdrawn.axes.dataRect;
	
	// alias for axes once they've been rendered
	var axesDrawn = this.lastdrawn.axes;

	//inherit the x and y scales from the axes 
	this.lastdrawn.xScale = axesDrawn.xScale;
	this.lastdrawn.yScale = axesDrawn.yScale;
	var barsId = this.barId_ + '_bars';


	//get the size of the bars and spacing produced by ordinal scale
	//TODO: would need to be xScale if the bars are vertical
	this.lastdrawn.bandsize = axesDrawn.yScale.rangeBand();

	// Draw any 'before' child brix that got appended before draw was called
	this.childBrix.beforeData.forEach(this.drawBric_, this);

	var graph = axesDrawn.group.append("g") //make a group to hold bars
		.attr("class","brixBarChart").attr("id", barsId);

	this.lastdrawn.graph = graph;
	
	// Draw the data (traces and/or points as specified by the graph type)
	this.drawData_();

	// Draw any 'after' child brix that got appended after draw was called
	this.childBrix.afterData.forEach(this.drawBric_, this);
	
}; // end of pearson.brix.BarChart.draw()


/* **************************************************************************
 * BarChart.redraw                                                     */ /**
 *
 * Redraw the line graph data as it may have been modified. It will be
 * redrawn into the same container area as it was last drawn.
 * @export
 *
 ****************************************************************************/
pearson.brix.BarChart.prototype.redraw = function ()
{
	// TODO: We may want to create new axes if the changed data would cause their
	//       min/max to have changed, but for now we're going to keep them.

	// TODO: Do we want to allow calling redraw before draw (ie handle it gracefully
	//       by doing nothing? -mjl
	this.childBrix.beforeData.forEach(this.redrawBric_, this);
	this.drawData_();
	this.childBrix.afterData.forEach(this.redrawBric_, this);
};

/* **************************************************************************
 * BarChart.drawBric_                                                  */ /**
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
pearson.brix.BarChart.prototype.drawBric_ = function (bric)
{
	bric.setScale(this.lastdrawn.xScale, this.lastdrawn.yScale);
	bric.draw(this.lastdrawn.axes.group, this.lastdrawn.dataRect.getSize());
};


/* **************************************************************************
 * BarChart.redrawBric_                                                */ /**
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
pearson.brix.BarChart.prototype.redrawBric_ = function (bric)
{
	bric.redraw();
};

/* **************************************************************************
 * BarChart.drawData_                                                  */ /**
 *
 * Draw the chart data (overwriting any existing data).
 *
 * @private
 *
 ****************************************************************************/
pearson.brix.BarChart.prototype.drawData_ = function ()
{
	// local var names are easier to read (shorter)
	var xScale = this.lastdrawn.xScale;
	var yScale = this.lastdrawn.yScale;
	var bandsize = this.lastdrawn.bandsize;
	var that = this;
	
	// get the group that contains the graph lines
	var graph = this.lastdrawn.graph;
	
	
	if (this.type == "grouped")
	{
		//grouped bar charts find the common labels in each data set and draw non-overlapping
		//bars in a group, one bar in each series for that label.
		//The effect of the following code is to calculate a "subspacing" that fans
		//the individual bars in each label/group out around the central point for the data
		//label on the axis.
		var indices = [];

		for (var i = 0; i < this.data_.length; i++)
		{
			indices.push(i); //needed to space out grouped barcharts
		}

		// groupscale creates an extra ordinal set that encloses the data label,
		// one for each group (element/series in data array)
		// padding of 20% and no padding on the ends of the range
		var groupScale = d3.scale.ordinal()
			.domain(indices)
			.rangeRoundBands([1.1 * bandsize, 0], 0.05, 0.2);
			
			//TEST: The last index  should produce the topmost bar
			//appearing at y = 0
		//window.console.log("Grouped barChart last bar mapped to 0 offset: ",
			//groupScale(this.data_.length - 1) == 0);
	}

    // draw each series
	// bind all the series data to a group element w/ a series class
	// creating or removing group elements so that each series has its own group.
	var barSeries = graph.selectAll("g.series")
		.data(this.data_);

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
		.data(function(d) {return d;});	//drill down into the nested data

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
	// if grouped, each bar's height is only 1/(# groups + 1) of the available height around 
	// an ordinal tickmark. The +1 is to create a little space between bars
		.attr("height", (this.type == "grouped") ? (bandsize / (this.data_.length + 1)) : bandsize)
		.attr("width",
            function(d)
            {
				return Math.abs(xScale(0) - xScale(d.x));

            });
	
	barSeries.on('click',
				function (d, i)
				{
					that.eventManager.publish(that.selectedEventId, {selectKey: d.key});
					that.lite(d.key); //this will highlight the series
				});
				
	//do a clean selection of the drawn data to store for the object properties
	this.lastdrawn.bars = graph.selectAll("g.series");
};

/* **************************************************************************
 * BarChart.append                                                     */ /**
 *
 * Append the bric or brix to this bar chart and draw it/them on top
 * of the data area and any brix appended earlier. If append
 * is called before draw has been called, then the appended bric(s) will be
 * drawn when draw is called.
 * @export
 *
 * @param {!pearson.brix.SvgBric|Array.<!pearson.brix.SvgBric>}
 *                      svgBrix		-The bric or array of brix to be drawn in
 *                                   this line graph's data area.
 * @param {string|undefined}
 *                      zOrder		-Optional. Specifies whether to append this
 *                                   bric to the list of brix that are
 *                                   drawn before the graph data or the list that
 *                                   is drawn after. "after" | "before", defaults
 *                                   to "after".
 *
 ****************************************************************************/
pearson.brix.BarChart.prototype.append = function(svgBrix, zOrder)
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
	if (zOrder === "before" && this.lastdrawn.container !== null)
	{
		// we need to remove the existing drawn elements and execute draw again
		var container = this.lastdrawn.container;
		var size = this.lastdrawn.size;
		var axes = this.lastdrawn.axes;
		this.clearLastdrawn_();
		axes.group.remove();
		this.draw(container, size);
	}
		
}; // end of pearson.brix.BarChart.append()

/* **************************************************************************
 * BarChart.append_one_                                                */ /**
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
pearson.brix.BarChart.prototype.append_one_ = function(bric, zOrder)
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
		
} // end of pearson.brix.BarChart.append_one_()


/* **************************************************************************
 * BarChart.lite                                                       */ /**
 *
 * Highlight the members of the collection associated w/ the given liteKey (key) and
 * remove any highlighting on all other labels.
 * @export
 *
 * @param {string}	liteKey	-The key associated with the label(s) to be highlighted.
 *
 ****************************************************************************/
pearson.brix.BarChart.prototype.lite = function(liteKey)
{
	window.console.log("TODO: log fired BarChart highlite " + liteKey);
	
	// Turn off all current highlights
	var allBars = this.lastdrawn.bars;
	allBars
		.classed("lit", false).transition();

		
	//var allSeries = this.lastdrawn.series;
	//allSeries
		//.classed("lit", false);

	// create a filter function that will match all instances of the liteKey
	// then find the set that matches
	var matchesKey = function (d, i) { return d.key === liteKey; };
	
	var barsToLite = allBars.filter(matchesKey);

	// Highlight the labels w/ the matching key
	barsToLite
		.classed("lit", true).transition();


	if (barsToLite.empty())
	{
		window.console.log("No key '" + liteKey + "' in bar chart " + this.barId_ );
	}
};


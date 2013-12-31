/* **************************************************************************
 * $Workfile:: widget-linegraph.js                                          $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the LineGraph bric.
 *
 * The LineGraph bric provides a line (or scatter) graph visualization
 * of sets of data points.
 *
 * Created on       March 27, 2013
 * @author          Leslie Bondaryk
 * @author          Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.LineGraph');

goog.require('goog.object');
goog.require('pearson.utils.IEventManager');
goog.require('pearson.brix.SvgBric');
goog.require('pearson.brix.AxisFormat');
goog.require('pearson.brix.PrototypeAxes');

// Sample LineGraph constructor configuration
(function()
{
    var lineData1 = [
            { x:    1, y: 0.0011    },
            { x:  150, y: 0.02      },
            { x:  500, y: 0.2       },
            { x: 1300, y: 0.36      },
            { x: 1400, y: 0.34      },
            { x: 2000, y: 6.115367  },
            { x: 2005, y: 6.512276  },
            { x: 2010, y: 6.908688  }
        ]; // array of line data

    var lg1Config = {
            id: "lg1",
            Data: [lineData1],
            type: "lines",
            xAxisFormat: { type: "linear",
                           ticks: 5,
                           orientation: "bottom",
                           label: "one line with markup <span class='math'>y=x<sup>2</sup></span>" },
            yAxisFormat: { type: "linear",
                           ticks: 5,
                           orientation: "right",
                           label: "Labels can have extended chars (&mu;m)" },
        };
});

/* **************************************************************************
 * LineGraph                                                           */ /**
 *
 * The LineGraph bric provides a line (or scatter) graph visualization
 * of sets of data points.
 *
 * @constructor
 * @extends {pearson.brix.SvgBric}
 * @export
 *
 * @param {Object}      config          -The settings to configure this LineGraph
 * @param {string|undefined}
 *                      config.id       -String to uniquely identify this LineGraph.
 *                                       if undefined a unique id will be assigned.
 * @param {Array.<Array.<{x: number, y: number}>>}
 *                      config.Data     -An array of traces (lines on the graph);
 *                                       each trace is an array of points defining that trace.
 * @param {string}      config.type     -String specifying "lines", "points", or
 *                                       "lines+points" for traces.
 * @param {pearson.brix.AxisFormat}
 *                      config.xAxisFormat
 *                                      -Format of the x axis of the graph.
 * @param {pearson.brix.AxisFormat}
 *                      config.yAxisFormat
 *                                      -Format of the y axis of the graph.
 * @param {!pearson.utils.IEventManager=}
 *                      eventManager    -The event manager to use for publishing events
 *                                       and subscribing to them.
 *
 * @todo: need to add custom symbols or images for scatter plots.
 * @todo linegraphs must be selectable to highlight related graph elements and use
 *       for inputs for mc questions. For accessibility
 *       we will eventually have to figure out how to do this with they keyboard too -lb
 *
 ****************************************************************************/
pearson.brix.LineGraph = function (config, eventManager)
{
    // call the base class constructor
    goog.base(this);

    /**
     * A unique id for this instance of the line graph bric
     * @private
     * @type {string}
     */
    this.lgId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.LineGraph);

    /**
     * Logger for this Bric
     * @private
     * @type {goog.debug.Logger}
     */
    this.logger_ = goog.debug.Logger.getLogger('pearson.brix.LineGraph');

    /**
     * Array of traces to be graphed, where each trace is an array of points and each point is an
     * object w/ a {number} x and {number} y property.
     * @private
     * @type {Array.<Array.<{x: number, y: number}>>}
     * @example
     *   // here are 2 traces, 1st w/ 2 points, 2nd with 3 points:
     *   [ [{x: -1.2, y: 2.0} {x: 2, y: 3.1}], [{x: -2, y: -2}, {x: 0, y: 0}, {x: 2, y: 2}] ]
     */
    this.data_ = config.Data;

    /**
     * The render type is one of:
     *
     *  - "lines" for a line plot
     *  - "points" for a scatter plot
     *  - "lines+points" for interpolated plots
     *
     * @type {string}
     * @todo supply images as point glyphs
     */
    this.type = config.type;

    /**
     * The formatting to apply to the X axis.
     * @private
     * @type {pearson.brix.AxisFormat}
     */
    this.xAxisFormat_ = config.xAxisFormat;

    /**
     * The formatting to apply to the Y axis.
     * @private
     * @type {pearson.brix.AxisFormat}
     */
    this.yAxisFormat_ = config.yAxisFormat;

    /**
     * List of child brix which are to be drawn before and after this
     * line graph's data in its data area.
     * Child brix are added using LineGraph.append.
     * @type {{beforeData: Array.<!pearson.brix.SvgBric>, afterData: Array.<!pearson.brix.SvgBric>}}
     */
    this.childBrix = {beforeData: [], afterData: []};

    /**
     * The event manager to use to publish (and subscribe to) events for this bric
     * @type {!pearson.utils.IEventManager}
     */
    this.eventManager = eventManager || pearson.utils.IEventManager.dummyEventManager;

    /**
     * The event id published when a row in this group is selected.
     * @const
     * @type {string}
     */
    this.selectedEventId = pearson.brix.LineGraph.getEventTopic('selected', this.lgId_);

    /**
     * Information about the last drawn instance of this line graph (from the draw method)
     * @type {Object}
     */
    this.lastdrawn =
        {
            container: null,
            size: {height: 0, width: 0},
            dataRect: new pearson.utils.Rect(0, 0, 0, 0),
            linesId: this.lgId_ + '_lines',
            axes: null,
            xScale: null,
            yScale: null,
            graph: null,
            traces: null,
            series: null,
        };

}; // end of LineGraph constructor
goog.inherits(pearson.brix.LineGraph, pearson.brix.SvgBric);

/**
 * Prefix to use when generating ids for instances of LineGraph.
 * @const
 * @type {string}
 */
pearson.brix.LineGraph.autoIdPrefix = "lgrf_auto_";

/* **************************************************************************
 * LineGraph.getEventTopic (static)                                    */ /**
 *
 * Get the topic that will be published for the specified event by a
 * LineGraph bric with the specified id.
 * @export
 *
 * @param {string}  eventName       -The name of the event published by instances
 *                                   of this Bric.
 * @param {string}  instanceId      -The id of the Bric instance.
 *
 * @returns {string} The topic string for the given topic name published
 *                   by an instance of LineGraph with the given instanceId.
 *
 * @throws {Error} If the eventName is not published by this bric or the
 *                 topic cannot be determined for any other reason.
 ****************************************************************************/
pearson.brix.LineGraph.getEventTopic = function (eventName, instanceId)
{
    /**
     * Functions that return the topic of a published event given an id.
     * @type {Object.<string, function(string): string>}
     */
    var publishedEventTopics =
    {
        'selected': function (instanceId)
        {
            return instanceId + '_lineSelected';
        },
    };

    if (!(eventName in publishedEventTopics))
    {
        throw new Error("The requested event '" + eventName + "' is not published by LineGraph brix");
    }

    return publishedEventTopics[eventName](instanceId);
};

/* **************************************************************************
 * LineGraph.getId                                                     */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Returns the ID of this bric.
 *
 * @returns {string} The ID of this Bric.
 *
 ****************************************************************************/
pearson.brix.LineGraph.prototype.getId = function ()
{
    return this.lgId_;
};

/* **************************************************************************
 * LineGraph.getData                                                   */ /**
 *
 * Get the data being used by this LineGraph.
 *
 * @returns {Array.<Array.<{x: number, y: number}>>}
 * the data being used by this LineGraph.
 *
 ****************************************************************************/
pearson.brix.LineGraph.prototype.getData = function ()
{
    return this.data_;
};

/* **************************************************************************
 * LineGraph.setData                                                   */ /**
 *
 * Set the data that this LineGraph should display.
 *
 * @param {Array.<Array.<{x: number, y: number}>>}
 *                   newData        -The new data for this LineGraph to display
 * @param {boolean=} delayRedraw    -true to not redraw after setting data,
 *                                   default is false.
 *
 ****************************************************************************/
pearson.brix.LineGraph.prototype.setData = function (newData, delayRedraw)
{
    this.data_ = newData;

    // If we're currently drawn someplace, redraw w/ the new data
    if (!delayRedraw && this.lastdrawn.container !== null)
    {
        this.redraw();
    }
};

/* **************************************************************************
 * LineGraph.setTrace                                                  */ /**
 *
 * Set one of the series that this LineGraph should display.
 *
 * @param {number}   traceIndex     -The (0-based) index of the trace data to
 *                                   replace.
 * @param {Array.<{x: number, y: number}>}
 *                   newTrace       -The new trace data
 * @param {boolean=} delayRedraw    -true to not redraw after setting data,
 *                                   default is false.
 *
 ****************************************************************************/
pearson.brix.LineGraph.prototype.setTrace = function (traceIndex, newTrace, delayRedraw)
{
    this.data_[traceIndex] = newTrace;

    // If we're currently drawn someplace, redraw w/ the new data
    if (!delayRedraw && this.lastdrawn.container !== null)
    {
        this.redraw();
    }
};

/* **************************************************************************
 * LineGraph.setXAxisFormat                                            */ /**
 *
 * Set the format for the X axis. Unless specifically delayed, the LineGraph
 * will be refreshed so that the new formatting is rendered.
 *
 * @param {pearson.brix.AxisFormat}
 *                   newFormat      -The new format for the X axis
 * @param {boolean=} delayRedraw    -true to not redraw after setting the format,
 *                                   default is false.
 *
 ****************************************************************************/
pearson.brix.LineGraph.prototype.setXAxisFormat = function (newFormat, delayRedraw)
{
    this.xAxisFormat_ = newFormat;

    // If we're currently drawn someplace, refresh so the axis will be recreated
    if (!delayRedraw && this.lastdrawn.container != null)
    {
        this.refresh();
    }
};

/* **************************************************************************
 * LineGraph.setYAxisFormat                                            */ /**
 *
 * Set the format for the Y axis. Unless specifically delayed, the LineGraph
 * will be refreshed so that the new formatting is rendered.
 *
 * @param {pearson.brix.AxisFormat}
 *                   newFormat      -The new format for the Y axis
 * @param {boolean=} delayRedraw    -true to not redraw after setting the format,
 *                                   default is false.
 *
 ****************************************************************************/
pearson.brix.LineGraph.prototype.setYAxisFormat = function (newFormat, delayRedraw)
{
    this.yAxisFormat_ = newFormat;

    // If we're currently drawn someplace, refresh so the axis will be recreated
    if (!delayRedraw && this.lastdrawn.container != null)
    {
        this.refresh();
    }
};

/* **************************************************************************
 * LineGraph.clearLastdrawn_                                           */ /**
 *
 * Clear the lastdrawn property by setting all of its properties back to their
 * initial values.
 * @private
 *
 ****************************************************************************/
pearson.brix.LineGraph.prototype.clearLastdrawn_ = function ()
{
    this.lastdrawn.container = null;
    this.lastdrawn.size = {height: 0, width: 0};
    this.lastdrawn.dataRect = new pearson.utils.Rect(0, 0, 0, 0);
    this.lastdrawn.linesId = this.lgId_ + '_lines';
    this.lastdrawn.axes = null;
    this.lastdrawn.xScale = null;
    this.lastdrawn.yScale = null;
    this.lastdrawn.graph = null;
    this.lastdrawn.traces = null;
    this.lastdrawn.series = null;
};

/* **************************************************************************
 * LineGraph.draw                                                      */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Draw the LineGraph bric into the specified area of the given container.
 *
 * @param {!d3.selection}   container   -The container svg element to append
 *                                       this SvgBric element tree to.
 * @param {!pearson.utils.ISize}
 *                          size        -The size (in pixels) of the area this
 *                                       SvgBric has been allocated.
 ****************************************************************************/
pearson.brix.LineGraph.prototype.draw = function (container, size)
{
    this.lastdrawn.container = container;
    this.lastdrawn.size = size;

    // Create the axes (svg canvas) in the container
    var axesConfig = {
            id: this.lgId_ + '_axes',
            size: this.lastdrawn.size,
            xAxisFormat: /**@type {pearson.brix.AxisFormat}*/ ({}),
            yAxisFormat: /**@type {pearson.brix.AxisFormat}*/ ({}),
        };
    // use copies of the axis formats because the prototype axis may change them
    goog.object.extend(axesConfig.xAxisFormat, this.xAxisFormat_);
    goog.object.extend(axesConfig.yAxisFormat, this.yAxisFormat_);

    var dataPts = d3.merge(this.data_);
    axesConfig.xAxisFormat.extent = d3.extent(dataPts, function(pt) {return pt.x;});
    axesConfig.yAxisFormat.extent = d3.extent(dataPts, function(pt) {return pt.y;});

    //Check to see whether ordinal extent and ticks are needed
    if (axesConfig.xAxisFormat.type == 'ordinal')
    {
        var ordinalValueMap = d3.set(dataPts.map(function (pt) {return pt.x;}));
        // for ordinal graphs, the extent is the array of all values, not just ends
        axesConfig.xAxisFormat.extent = ordinalValueMap.values();

        // if the user hasn't specified explicit ticks, then
        // take every datalength/ticks value to construct that array bcause d3
        // ordinal graphs don't know how to do every nth tick automatically -lb
        if(!Array.isArray(axesConfig.xAxisFormat.ticks))
        {
        //count the number of points
            var pts = axesConfig.xAxisFormat.extent.length;
            var step = d3.round(pts/(axesConfig.xAxisFormat.ticks - 1));
            var calcTicks = [];
            var i = 0;
            while(i < pts)
            {
                // push every step-th value onto the ticks array
                calcTicks.push(axesConfig.xAxisFormat.extent[i]);
                i = i + step;
            }
            //then push the last point on the domain onto the ticks array
            calcTicks.push(axesConfig.xAxisFormat.extent[axesConfig.xAxisFormat.extent.length-1]);
            axesConfig.xAxisFormat.ticks = calcTicks;
        }
    }


    //todo: the y axis probably needs similar conditioning to the x axis settings,
    //ticks and extent are only synonymous if you are drawing ordinal charts, and even
    //then that's not a perfect assumption -lb
    if (axesConfig.yAxisFormat.type == 'ordinal' && !Array.isArray(axesConfig.yAxisFormat.ticks))
    {
        var ordinalValueMap = d3.set(dataPts.map(function (pt) {return pt.y;}));
        axesConfig.yAxisFormat.ticks = ordinalValueMap.values();
    }

    if (axesConfig.xAxisFormat.type == "time")
    {
        // it's unclear whether it's better to calculate the extent as the whole data range,
        // regardless of the hard-set ticks, and do all the truncation of the graph when
        // drawing axes, or if we should just truncate the calculated domain using ticks up
        // front.  Zoom and other redraw is likely impacted.  I've taken out the tick truncation  - lb
        //var graphDomain = Array.isArray(axesConfig.xAxisFormat.ticks) ? axesConfig.xAxisFormat.ticks : dataPts;

        // if ticks are an array, convert them to dates

        if (Array.isArray(axesConfig.xAxisFormat.ticks))
        {
            axesConfig.xAxisFormat.ticks = axesConfig.xAxisFormat.ticks.map(function (pt) {return new Date(pt);});
        }


        // convert the extent to dates
        var timeValueMap =   d3.set(dataPts.map(function (pt) {return new Date(pt.x);}));
        dataPts = timeValueMap.values();
        var extent = axesConfig.xAxisFormat.extent;
        var low = new Date(extent[0]), high = new Date(extent[1]);
        axesConfig.xAxisFormat.extent = [low, high];


    }

    //make the axes for this graph - draw these first because these are the
    //pieces that need extra unknown space for ticks, ticklabels, axis label
    this.lastdrawn.axes = new pearson.brix.PrototypeAxes(this.lastdrawn.container, axesConfig);

    //inherit the dataRect from the axes container
    this.lastdrawn.dataRect = this.lastdrawn.axes.dataRect;

    // alias for axes once they've been rendered
    var axesDrawn = this.lastdrawn.axes;

    //inherit the x and y scales from the axes container
    this.lastdrawn.xScale = axesDrawn.xScale;
    this.lastdrawn.yScale = axesDrawn.yScale;

    var linesId = this.lastdrawn.linesId;

    var clipId = linesId + "_clip";

    // Draw any 'before' child brix that got appended before draw was called
    this.childBrix.beforeData.forEach(this.drawBric_, this);

    var graph = axesDrawn.group.append("g") //make a group to hold new lines
        .attr("class", "widgetLineGraph").attr("id", linesId);


    graph.append("defs")
            .append("clipPath")
                .attr("id", clipId)
                .append("rect")
                    .attr("width", axesDrawn.dataRect.width)
                    .attr("height", axesDrawn.dataRect.height);

    // make a clippath, which is used in the case that we zoom or pan
    // the graph dynamically, or for data overflow into the tick and
    // label areas

    this.lastdrawn.graph = graph;

    // Draw the data (traces and/or points as specified by the graph type)
    this.drawData_();

    // Draw any 'after' child brix that got appended after draw was called
    this.childBrix.afterData.forEach(this.drawBric_, this);

}; // end of LineGraph.draw()

/* **************************************************************************
 * LineGraph.redraw                                                    */ /**
 *
 * Redraw the line graph data as it may have been modified. It will be
 * redrawn into the same container area as it was last drawn.
 * @export
 *
 ****************************************************************************/
pearson.brix.LineGraph.prototype.redraw = function ()
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
 * LineGraph.refresh                                                   */ /**
 *
 * Refresh the graph by clearing all elements and then recreating them.
 * This will even recompute axes if their formatting has changed or
 * the data extents have changed.
 * @export
 *
 ****************************************************************************/
pearson.brix.LineGraph.prototype.refresh = function ()
{
    // we need to remove the existing drawn elements and execute draw again
    var container = this.lastdrawn.container;
    var size = this.lastdrawn.size;
    var axes = this.lastdrawn.axes;
    this.clearLastdrawn_();
    axes.group.remove();
    this.draw(container, size);
};

/* **************************************************************************
 * LineGraph.drawBric_                                                 */ /**
 *
 * Draw the given child bric in this line graph's data area.
 * This line graph must have been drawn BEFORE this method is called or
 * bad things will happen.
 * @private
 *
 * @param {!pearson.brix.SvgBric}   bric    -The child bric to draw in the data area.
 *
 * @todo implement some form of error handling! -mjl
 *
 ****************************************************************************/
pearson.brix.LineGraph.prototype.drawBric_ = function (bric)
{
    bric.setScale(this.lastdrawn.xScale, this.lastdrawn.yScale);
    bric.draw(this.lastdrawn.axes.group, this.lastdrawn.dataRect.getSize());
};

/* **************************************************************************
 * LineGraph.redrawBric_                                               */ /**
 *
 * Redraw the given child bric.
 * This line graph and this child bric must have been drawn BEFORE this
 * method is called or bad things will happen.
 * @private
 *
 * @param {!pearson.brix.SvgBric}   bric    -The child bric to redraw.
 *
 * @todo implement some form of error handling! -mjl
 *
 ****************************************************************************/
pearson.brix.LineGraph.prototype.redrawBric_ = function (bric)
{
    bric.redraw();
};

/* **************************************************************************
 * LineGraph.drawData_                                                 */ /**
 *
 * Draw the line graph data (overwriting any existing line graph data).
 * @private
 *
 ****************************************************************************/
pearson.brix.LineGraph.prototype.drawData_ = function ()
{
    // local var names are easier to read (shorter)
    var linesId = this.lastdrawn.linesId;
    var xScale = this.lastdrawn.xScale;
    var yScale = this.lastdrawn.yScale;
    var that = this;

    // get the group that contains the graph lines
    var graph = this.lastdrawn.graph;

    var clipId = linesId + "_clip";

    // draw the trace(s)
    if (this.type == "lines" || this.type == "lines+points")
    {
        // d3 utility function for generating all the point to point paths
        // using the scales from the axes
        var line = d3.svg.line()
            // TODO: someday might want to add options for other interpolations -lb
            .interpolate("basis")
            // if the data is in date format, convert the values to date objects
            .x(function (d) {return xScale((that.xAxisFormat_.type == "time" ? new Date(d.x) : d.x));})
            .y(function (d) {return yScale(d.y);});

        // rebind the trace data to the trace groups
        var traces = graph.selectAll("g.traces")
            .data(this.data_);

        // get rid of any trace groups without data
        traces.exit().remove();

        // create trace groups for trace data that didn't exist when we last bound the data
        traces.enter().append("g")
            .attr("class", function(d, i) {return "traces stroke" + i;})
            .append("path")
            //pick the colors sequentially off the list

                .attr("clip-path", "url(#" + clipId + ")");

        // update the data on all traces, new and old
        traces.select("path")
            //use the line function defined above to set the path data
                .attr("d", function(d) {return line(d);});

        // autokey entries which have no key with the data index
        traces.each(function (d, i) {
                    // if there is no key assigned, make one from the index
                    d.key = 'key' in d ? d.key : i.toString();
                    });

        this.lastdrawn.traces = graph.selectAll("g.traces");

        traces.on('click',
                function (d, i)
                {
                    that.lite(d.key);
                    that.eventManager.publish(that.selectedEventId, {selectKey: d.key, index: i});
                });

    } // end if statement to draw lines

    // draw the points
    if (this.type == "points" || this.type == "lines+points")
    {
        // rebind the series data to the series groups
        var series = graph.selectAll("g.series")
            .data(this.data_);

        // get rid of any series groups without data
        series.exit().remove();

        // create series groups for series data that didn't exist when we last bound the data
        series.enter().append("g")
            .attr("class", function (d, i) {return "series fill" + i;})
            .attr("clip-path", "url(#" + clipId + ")");

        // autokey entries which have no key with the data index
        series.each(function (d, i) {
                    // if there is no key assigned, make one from the index
                    d.key = 'key' in d ? d.key : i.toString();
                    });

        // make a clean selection of all series (sets of points)
        // for subsequent use in highlighting
        this.lastdrawn.series = graph.selectAll("g.series");

        // rebind the point data of each series to the point groups
        // (the data of the series is an array of point data)
        var points = series.selectAll("g.points")
            .data(function (d) {return d;});

        // get rid of any point groups without data
        points.exit().remove();

        // create point groups for point data that didn't exist when we last bound the data
        points.enter().append("g")
            .attr("class", "points");

        // update the data on all points (new and old)
        points
            .attr("transform", function (d){
                        // move each symbol to the x,y coordinates in scale.  Special handling is required
                        // if the data is time strings, which must be turned into date objects
                        return "translate(" + xScale((that.xAxisFormat_.type == "time" ?
                            new Date(d.x) : d.x)) + "," + yScale(d.y) + ")";
                               })
            .append("path")
                .attr("d",
                    // j is the index of the series,
                    // i of the data point in the series
                    function(d, i, j)
                    {
                        //pick the shapes sequentially off the list
                        return (d3.svg.symbol().type(d3.svg.symbolTypes[j])());
                    });

        series.on('click',
                function (d, i)
                {
                    that.eventManager.publish(that.selectedEventId, {selectKey: d.key});
                });

    }// end of points drawing block
}; // end of LineGraph.drawData_()

/* **************************************************************************
 * LineGraph.append                                                    */ /**
 *
 * Append the bric or brix to this line graph and draw it/them on top
 * of the line graph's data area and any brix appended earlier. If append
 * is called before draw has been called, then the appended bric(s) will be
 * drawn when draw is called.
 * @export
 *
 * @param {!pearson.brix.SvgBric|Array.<!pearson.brix.SvgBric>}
 *                      svgBrix     -The bric or array of brix to be drawn in
 *                                   this line graph's data area.
 * @param {string=}
 *                      zOrder      -Optional. Specifies whether to append this
 *                                   bric to the list of brix that are
 *                                   drawn before the graph data or the list that
 *                                   is drawn after. "after" | "before", defaults
 *                                   to "after".
 *
 ****************************************************************************/
pearson.brix.LineGraph.prototype.append = function (svgBrix, zOrder)
{
    if (!Array.isArray(svgBrix))
    {
        this.append_one_(/**@type {!pearson.brix.SvgBric}*/ (svgBrix), zOrder);
    }
    else
    {
        svgBrix.forEach(function (bric) {this.append_one_(bric, zOrder);}, this);
    }

    // Deal w/ drawing the appended brix before already drawn data.
    if (zOrder === "before" && this.lastdrawn.container != null)
    {
        // we need to remove the existing drawn elements and execute draw again
        this.refresh();
    }

}; // end of LineGraph.append()

/* **************************************************************************
 * LineGraph.append_one_                                               */ /**
 *
 * Helper for append that does the work needed to append a single bric.
 * This can handle drawing the bric after the data even after the data
 * has been drawn, but it does not handle drawning the bric before when
 * the data has already been drawn, so the caller must deal with that situation.
 * @private
 *
 * @param {!pearson.brix.SvgBric}
 *                      bric    -The bric which is to be drawn in this line
 *                               graph's data area.
 * @param {string|undefined}
 *                      zOrder  -Optional. Specifies whether to append this
 *                               bric to the list of brix that are
 *                               drawn before the graph data or the list that
 *                               is drawn after. "after" | "before", defaults
 *                               to "after".
 *
 ****************************************************************************/
pearson.brix.LineGraph.prototype.append_one_ = function (bric, zOrder)
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

}; // end of LineGraph.append_one_()

/* **************************************************************************
 * LineGraph.lite                                                      */ /**
 *
 * Highlight the members of the collection associated w/ the given liteKey (key) and
 * remove any highlighting on all other labels.
 * @export
 *
 * @param {string}  liteKey -The key associated with the label(s) to be highlighted.
 *
 ****************************************************************************/
pearson.brix.LineGraph.prototype.lite = function (liteKey)
{
    this.logger_.fine('lite("' + liteKey + '") entered...');	

    // Turn off all current highlights
    var allTraces = this.lastdrawn.traces;
    allTraces
        .classed("lit", false);

    //var allSeries = this.lastdrawn.series;
    //allSeries
        //.classed("lit", false);

    // create a filter function that will match all instances of the liteKey
    // then find the set that matches
    var matchesKey = function (d, i) { return d.key === liteKey; };

    var linesToLite = allTraces.filter(matchesKey);

    // Highlight the labels w/ the matching key
    linesToLite
        .classed("lit", true);

    if (linesToLite.empty())
    {
        this.logger_.warning('lite: No key "' + liteKey + '" in LineGraph ' + this.lgId_);	
    }
};


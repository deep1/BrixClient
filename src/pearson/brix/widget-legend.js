/* **************************************************************************
 * $Workfile:: widget-legend.js                                             $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the {@link pearson.brix.Legend} bric.
 *
 * The Legend widget provides a line or box graph with the standard
 * fill color sequence and labels.
 *
 * Created on		April 22, 2013
 * @author			Leslie Bondaryk
 * @author			Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.Legend');

goog.require('pearson.utils.IEventManager');
goog.require('pearson.brix.SvgBric');

// Sample BarChart constructor configuration
(function()
{
	
	var legConfig = {
		xPos: "right", yPos: "top",
		labels: ["low income", "middle income", "high income"],
		type: "box",
		key: ["foo","bar","fred"]
	};
});
	
/* **************************************************************************
 * Legend                                                              */ /**
 *
 * Constructor function for a Legend bric.
 *
 * @constructor
 * @extends {pearson.brix.SvgBric}
 * @export
 *
 * @param {Object}		config			-The settings to configure this widget
 * @param {string|undefined}
 * 						config.id		-String to uniquely identify this Legend.
 * 										 if undefined a unique id will be assigned.
 * @param {Array.<string>}
 * 						config.labels	-strings for each label
 * @param {string}		config.type		-"box", or anything else (ignored) produces lines
 * @param {string}		config.xPos		-horizontal position in axes: "left" or "right"
 * @param {string}		config.yPos 	-vertical position in axes: "top" or "bottom"
 * @param {Array.<string>}
 * 						config.key		-strings to specify highlighting relationship
 *										 to other widgets
 * @param {!pearson.utils.IEventManager=}
 * 						eventManager	-The event manager to use for publishing events
 * 										 and subscribing to them.
 *
 * @classdesc
 * The Legend widget makes a legend for any series of labels. Should be callable
 * either standalone or from another widget that has options to generate a legend
 * from it's data.
 *
 * NOTES: Measures the number of characters in the longest label, then sizes
 * the box around it based on that.  Eventually might have to resize or rescale
 * axes to make room for this, but for now position it in one corner of axes.
 * @todo: need to add symbols for scatter plots, including custom images
 * @todo legends must be selectable to highlight related graph elements for accessibility
 *       we will eventually have to figure out how to do this with they keyboard too -lb
 **************************************************************************/
pearson.brix.Legend = function (config, eventManager)
{
	// call the base class constructor
	goog.base(this);

	/**
	 * A unique id for this instance of the widget
     * @private
	 * @type {string}
	 */
	this.legendId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.Legend);

    /**
     * Logger for this Bric
     * @private
     * @type {goog.debug.Logger}
     */
    this.logger_ = goog.debug.Logger.getLogger('pearson.brix.Legend');

	/**
	 * Array of strings for the labels, one per row 
	 * @private
	 * @type {Array}
	 */
	this.labels_ = config.labels;

	/**
	 * The render type is one of:
	 * <ul>
	 *  <li> "box" for small colored squares, typical for bar or chloropleth maps
	 *	<li> "lines" (ignored) for colored lines
	 * </ul>
	 * @type {string}
	 */
	this.type = config.type;

	/**
	 * @todo DOCUMENT ME! -leslie this needs to be described -mjl
	 * @type {string}
	 */
	this.xPos = config.xPos;

	/**
	 * @todo DOCUMENT ME! -leslie this needs to be described -mjl
	 * @type {string}
	 */
	this.yPos = config.yPos;

	/**
	 * @todo DOCUMENT ME! -leslie this needs to be described -mjl
	 * @type {string}
	 */
	this.key = config.key;
	
	/**
	 * The event manager to use to publish (and subscribe to) events for this widget
	 * @type {!pearson.utils.IEventManager}
	 */
	this.eventManager = eventManager || pearson.utils.IEventManager.dummyEventManager;

	/**
	 * The event id published when a row in this group is selected.
	 * @const
	 * @type {string}
	 */
    this.selectedEventId = pearson.brix.Legend.getEventTopic('selected', this.legendId_);

	/**
	 * Information about the last drawn instance of this widget (from the draw method)
	 * @type {Object}
	 */
	this.lastdrawn =
		{
			container: null,
			size: {height: 0, width: 0},
			legendRows: null,
		};
		
}; // end of Legend constructor
goog.inherits(pearson.brix.Legend, pearson.brix.SvgBric);

/**
 * Prefix to use when generating ids for instances of Legend.
 * @const
 * @type {string}
 */
pearson.brix.Legend.autoIdPrefix = "lgnd_auto_";

/* **************************************************************************
 * Legend.getEventTopic (static)                                       */ /**
 *
 * Get the topic that will be published for the specified event by a
 * Legend bric with the specified id.
 * @export
 *
 * @param {string}  eventName       -The name of the event published by instances
 *                                   of this Bric.
 * @param {string}  instanceId      -The id of the Bric instance.
 *
 * @returns {string} The topic string for the given topic name published
 *                   by an instance of Legend with the given instanceId.
 *
 * @throws {Error} If the eventName is not published by this bric or the
 *                 topic cannot be determined for any other reason.
 ****************************************************************************/
pearson.brix.Legend.getEventTopic = function (eventName, instanceId)
{
    /**
     * Functions that return the topic of a published event given an id.
     * @type {Object.<string, function(string): string>}
     */
    var publishedEventTopics =
    {
        'selected': function (instanceId)
        {
            return instanceId + '_legendSelected';
        },
    };

    if (!(eventName in publishedEventTopics))
    {
        throw new Error("The requested event '" + eventName + "' is not published by Legend brix");
    }

    return publishedEventTopics[eventName](instanceId);
};

/* **************************************************************************
 * Legend.getId                                                        */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Returns the ID of this bric.
 *
 * @returns {string} The ID of this Bric.
 *
 ****************************************************************************/
pearson.brix.Legend.prototype.getId = function ()
{
    return this.legendId_;
};

/* **************************************************************************
 * Legend.getLabels                                                    */ /**
 *
 * Get the labels being used by this Legend.
 *
 * @returns {Array.<{content: string}>}
 * the labels being used by this Legend.
 *
 ****************************************************************************/
pearson.brix.Legend.prototype.getLabels = function ()
{
    return this.labels_;
};

/* **************************************************************************
 * Legend.setLabels                                                    */ /**
 *
 * Set the data that this legend should display.
 *
 * @param {Array.<{content: string}>}
 *                   newLabels      -The new data for this LineGraph to display
 * @param {boolean=} delayRedraw    -true to not redraw after setting data,
 *                                   default is false.
 *
 ****************************************************************************/
pearson.brix.Legend.prototype.setLabels = function (newLabels, delayRedraw)
{
    this.labels_ = newLabels;

    // If we're currently drawn someplace, redraw w/ the new data
    if (!delayRedraw && this.lastdrawn.container !== null)
    {
        this.redraw();
    }
};

/* **************************************************************************
 * Legend.draw                                                         */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Draw this Legend in the given container.
 *
 * @param {!d3.selection}	container	-The container svg element to append
 *                                       this SvgBric element tree to.
 * @param {!pearson.utils.ISize}
 *							size		-The size (in pixels) of the area this
 *                                       SvgBric has been allocated.
 ****************************************************************************/
pearson.brix.Legend.prototype.draw = function (container, size)
{
	this.lastdrawn.container = container;
	this.lastdrawn.size = size;
	
	//make a new group to hold the legend
	this.legendBox = container.append("g")
	.attr("class","widgetLegend")
	.attr('id', this.legendId_);

	this.legendBox.append("rect").attr("x", -5).attr("y", -5)
	//create small padding around the contents at leading edge
	.attr("width", 0).attr("height", 0) //lineheight+padding x rows
	.attr("class", "legendBox");

	this.drawData_();

}; //end of Legend.draw

/* **************************************************************************
 * Legend.redraw                                                       */ /**
 *
 * Redraws in the event of a change or data update.
 * @export
 *
 ****************************************************************************/
pearson.brix.Legend.prototype.redraw = function ()
{
	this.drawData_();
};

/* **************************************************************************
 * Legend.drawData_                                                    */ /**
 *
 * Redraws in the event of a change or data update.
 * @private
 *
 ****************************************************************************/
pearson.brix.Legend.prototype.drawData_ = function ()
{
	//attractive length for the colored lines or boxes
	var boxLength = 15;
	//attractive spacing from edge of axes boxes (innerWid/Ht)
	//also used to space the enclosing legend box from the text
	var	inset = 10;
	//take the number of rows from the number of labels
	var rowCt = this.labels_.length;
	//calculate the height of the box that frames the whole legend
	//which should be as tall as the number of rows plus some padding
	var boxHeight = (boxLength + 6) * rowCt;
	
	//to calculate the width of the box big enough for the longest text string, we have to
	//render the string, get its bounding box, then remove it.
	//note: this is the simple algorithm and may fail because of proportional fonts, 
	//in which case we'll have to measure all labels.
	
	var longest = this.labels_.reduce(function (prev, cur) {
			return prev.content.length > cur.content.length ? prev : cur;
		}).content;
	var longBox = this.legendBox.append("g");
	longBox.append("text").text(longest).style('font-weight','bold');
	 
	this.boxWid = longBox.node().getBBox().width + inset/2 + boxLength + 10;

	//the box around the legend should be the width of the
	//longest piece of text + inset + the marker length
	//so it's always outside the text and markers, plus a little padding
	longBox.remove();
	
	
	//position the legend
	var xOffset = (this.xPos == "left") ? inset : (this.lastdrawn.size.width - this.boxWid - inset);
	//if the position is left, start the legend on the left margin edge,
	//otherwise start it across the graph box less its width less padding
	var yOffset = (this.yPos == "bottom") ? this.lastdrawn.size.height - boxHeight - inset : inset;
	//if the position is at the bottom, measure up from bottom of graph,
	//otherwise just space it down from the top.
	//move it to left/right/top/bottom position
	this.legendBox.attr('transform', 'translate(' + xOffset + ',' + yOffset + ')');

	//modify the white box for the legend to sit on
	this.legendBox.select('rect')
	//create small padding around the contents at leading edge
	.attr("width", this.boxWid).attr("height", boxHeight);
	
	// Draw the data (each marker line and label)
	
	var that = this;

	// determine the svg element name needed based on the type of legend
	var typeMarkerElementName = this.type == "box" ? "rect" : "line";

	//this selects all <g> elements with class legend  
	var legendRows = this.legendBox.selectAll("g.legend")
		.data(this.labels_); //associate the data to create stacked slices
	
	// get rid of any rows without data
	legendRows.exit().remove();
	
	// Create new rows with the correct element structure
	var enterRows = legendRows.enter() //this will create <g> elements for every data element
		.append("g") //create groups
			.attr("class", "legend");

	enterRows.append(typeMarkerElementName);
	enterRows.append("text");
	enterRows.on('click',
				function (d, i)
				{
                    that.lite(d.key);
					that.eventManager.publish(that.selectedEventId, {selectKey: d.key, index: i});
				});

	
	// Update the row elements to match the current data

	// autokey entries which have no key with the data index
	legendRows.each(function (d, i) { 
						//if there is no key assigned, make one from the index
						d.key = 'key' in d ? d.key : i.toString();
					});

	//each row contains a colored marker and a label.  They are spaced according to the
	//vertical size of the markers plus a little padding, 4px in this case
	//counting up from the bottom, make a group for each series and move to stacked position
	legendRows
		.attr("transform", function(d, i) {
					return "translate(0," + (rowCt - i - 1) * (boxLength+4) + ")";
				});

	if (this.type == "box")
	{
		var rowBoxes = legendRows.select("rect");
		rowBoxes
			.attr("x", 0)
			.attr("y", 0)
			//make the rectangle a square with width and height set to boxLength
			.attr("width", boxLength)
			.attr("height", boxLength)
			.attr("class", function(d, i) {
					return "fill" + i;
				});
	}
	else
	{
		var rowLines = legendRows.select("line");
		rowLines
			.attr("class", function(d, i) {
					return "traces stroke" + i;
				})
			.attr("x1", 0) //start at the left edge of box
			.attr("x2", boxLength) //set line width
			.attr("y1", boxLength / 2)
			.attr("y2", boxLength / 2);
	}

	var rowText = legendRows.select("text");
	rowText
		.attr("text-anchor", "start") //left align text
		.attr("class", "legendLabel")
		.attr("dx", boxLength + 4)
		//offset text to the right beyond marker by 4 px
		.attr("dy", boxLength/2 ) 
		//offset text down so it winds up in the middle of the marker
		.attr("alignment-baseline", "central")
		//and put the vertical center of the text on that midline
		.text(function(d, i) {
				return d.content; //get the label from legend array
			});
	
	this.lastdrawn.legendRows = this.legendBox.selectAll("g.legend");

}; //end of Legend.drawData_

/* **************************************************************************
 * Legend.drawBorderBox                                                 */ /**
 *
 * Legends that have a borderbox will need to remeasure and draw the box 
 * when the number of labels changes.
 *
 ****************************************************************************/
pearson.brix.Legend.prototype.drawBorderBox = function ()
{

};

/* **************************************************************************
 * Legend.setScale                                                     */ /**
 *
 * Legend's don't position by values given in the data domain, so the
 * scales provided to this bric by this function are not needed, and therefore
 * this function does nothing.
 * It exists because it is required of any SVG bric which is appended in or on
 * top of another bric.
 *
 * @param {function(number): number}
 *						xScale	-function to convert a horizontal data offset
 *								 to the pixel offset into the data area.
 * @param {function(number): number}
 *						yScale	-function to convert a vertical data offset
 *								 to the pixel offset into the data area.
 *
 ****************************************************************************/
pearson.brix.Legend.prototype.setScale = function (xScale, yScale)
{
};

/* **************************************************************************
 * Legend.lite                                                         */ /**
 *
 * Highlight the members of the collection associated w/ the given liteKey (key) and
 * remove any highlighting on all other labels.
 *
 * @param {string}	liteKey	-The key associated with the label(s) to be highlighted.
 *
 ****************************************************************************/
pearson.brix.Legend.prototype.lite = function (liteKey)
{
    this.logger_.fine('lite("' + liteKey + '") entered...');	
	
	// Turn off all current highlights
	var allRows = this.lastdrawn.legendRows;
	allRows
		.classed('lit', false);
		
	//var allSeries = this.lastdrawn.series;
	//allSeries
		//.classed("lit", false);

	// create a filter function that will match all instances of the liteKey
	// then find the set that matches
	var matchesKey = function (d, i) { return d.key === liteKey; };
	
	var rowsToLite = allRows.filter(matchesKey);

	// Highlight the labels w/ the matching key
	rowsToLite
		.classed('lit', true);

	if (rowsToLite.empty())
	{
        this.logger_.warning('lite: No key "' + liteKey + '" in legend ' + this.legendId_);	
	}
};


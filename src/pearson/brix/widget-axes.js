/* **************************************************************************
 * AxisFormat                                                           *//**
 *
 * An AxisFormat describes how to format the axis of a graph.
 * objects w/ these fields are arguments to the Axes contructor.
 * @interface
 *
 ****************************************************************************/
function AxisFormat()
{
	/**
	 * The type of axis defines its scale.
	 * <ul>
	 * <li> "linear" - ...
	 * <li> "log" - ...
	 * <li> "ordinal" - The values along the axis are determined by a
	 *                  discrete itemized list, calculated from the graphed data.
	 * <li> "time" - the values are a series of dates/times
	 * <li> "double positive" - axis that always counts up from zero,
	 *                          regardless of the sign of the data
	 * </ul>
	 * @type {string}
	 */
	this.type = "linear";

	/**
	 * The number of "ticks" to display along the axis including those
	 * at the ends of the axis. Should be a positive integer or zero and
	 * will be coerced to a valid value in an undefined way if not.
	 * Or if the type of axis is "ordinal" then ticks may be an array
	 * to be displayed evenly distributed along the axis.
	 * @type {number|Array.<*>}
	 */
	this.ticks = 5;

	/**
	 * The minimum and maximum data values expected for the axis in an
	 * array with the minimum as element 0 and the maximum as element 1.
	 * If undefined, will default to [0, 1], or the [min, max] of the ticks
	 * array if it is an array.
	 * @type {Array.<number>|undefined}
	 * TODO: find out why current behavior defaults a vertical axis to [0,1] and a horizontal axis to [1e-10,1] -mjl
	 */
	this.extent = [0, 1];

	/**
	 * There are 2 sets of orientation values, one for a horizontal (x) axis
	 * and one for a vertical (y) axis.
	 * <ul>
	 * <li> Horizontal (x) axis values
	 *   <ul>
	 *   <li> "top" - The axis should be displayed at the top of the display area
	 *   <li> "bottom" - The axis should be displayed at the bottom of the display area
	 *   </ul>
	 * <li> Vertical (y) axis values
	 *   <ul>
	 *   <li> "left" - The axis should be displayed at the left of the display area
	 *   <li> "right" - The axis should be displayed at the right of the display area
	 *   </ul>
	 * </ul>
	 * @type {string}
	 */
	this.orientation = "right";

	/**
	 * The label to display along the axis. It must be valid to be converted to
	 * html as the inner html of a span element. This allow the use of text
	 * markup and character entities in the label. Optional.
	 * @type {string|undefined}
	 */
	this.label = "Labels can have extended chars (&mu;m)";
} // end of AxisFormat


/* **************************************************************************
 * Axes                                                                 *//**
 *
 * Axes draw x-y axes in an SVG Container and provide scaling methods
 * to map data points into the area defined by the axes.
 * The bounds of each axis is defined by either the tick values or by
 * the data extents defined in that axis' AxisFormat.
 *
 * @constructor
 *
 * @param {!d3.selection}
 *						container			-The container svg element to append the axes element tree to.
 * @param {Object}		config				-The settings to configure these Axes.
 * @param {string}		config.id			-String to uniquely identify this Axes.
 * @param {Object}		config.size			-The height and width that the axes must fit within.
 * @param {number}		config.size.width	-The width (in pixels) to use for the Axes.
 * @param {number}		config.size.height	-The height (in pixels) to use for the Axes.
 * @param {AxisFormat}	config.xAxisFormat	-The formatting options for the horizontal (x) axis.
 * @param {AxisFormat}	config.yAxisFormat	-The formatting options for the vertical (y) axis.
 *
 ****************************************************************************/
function Axes(container, config)
{
	this.id = config.id;
	this.container = container;

	this.xFmt = config.xAxisFormat;
	this.yFmt = config.yAxisFormat;

	// Set defaults for missing axis extents
	// in case of log scale, I didn't make this zero - lgb
	if (!('extent' in this.xFmt))
		this.xFmt.extent = [1e-10, 1];

	// haven't seen a log scale in y so far, so I didn't add the tiny value here
	if (!('extent' in this.yFmt))
		this.yFmt.extent = [0, 1];
		
	this.xAxis = Axes.makeAxis(this.xFmt, config.size.width);
	this.yAxis = Axes.makeAxis(this.yFmt, config.size.height);
	
	this.adjustAxesToFit();
	
} // end of Axes constructor

/* **************************************************************************
 * Axes.makeAxis (static)                                               *//**
 *
 * Creates an Axis of the appropriate type.
 *
 ****************************************************************************/
Axes.makeAxis = function (format, distance)
{
	switch (format.type)
	{
		case 'linear':
			return new LinearAxis(format, distance);
		case 'log':
			return new LogAxis(format, distance);
		case 'ordinal':
			return new OrdinalAxis(format, distance);
		case 'time':
			return new TimeAxis(format, distance);
		default:
			console.log("An unsupported axis scale was requested (%s)", format.type);
			return null;
	}
};

/* **************************************************************************
 * Axes.adjustAxesToFit                                                 *//**
 *
 * Adjust the distance that the x and y axes span so they both fit in the
 * output view. This means that the distance of each needs to be reduced to
 * leave room for the other.
 *
 ****************************************************************************/
Axes.prototype.adjustAxesToFit = function ()
{
	var xAxisBox = this.xAxis.getBoundingBox(this.container);
	var yAxisBox = this.yAxis.getBoundingBox(this.container);

	xAxis.setDistance(xAxis.getDistance() - yAxisBox.width);
	

} // end of Axes.adjustAxesToFit()

/* **************************************************************************
 * Axis                                                                 *//**
 *
 * @constructor
 *
 * @param {AxisFormat}	format		-Format of the axis
 * @param {number}		distance	-The distance that the axis will span when rendered.
 *
 ****************************************************************************/
function Axis(format, distance)
{
	this.format = format;
	this.distance = distance;
	this.isVertical = format.orientation === 'left' || format.orientation === 'right';
	this.scale = this.createScale();
	this.generator = null;
	
	
	
	
	// The data area is the area that data points will be drawn in.
	var dataAreaWidth = config.size.width - this.margin.left - this.margin.right;
	var dataAreaHeight = config.size.height - this.margin.top - this.margin.bottom;

	var tickheight = 10;

	this.group = this.container.append("g") //make a group to hold new scaled widget with axes
		//.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		// push everything down so text doesn't slop over the top - We'll do this later after measurement
		.attr("id", this.id) //name it so it can be manipulated or highlighted later
		;

	
		// Format the ticks w/ the general format using a precision of 1 significant digit.
		var tickFormat = d3.format(".1");

		//set up the functions that will generate the x axis
		this.xAxis = d3.svg.axis() //a function that will create the axis and ticks and text labels
			.scale(this.xScale) //telling the axis to use the scale defined by the function x
			.orient(xOrient).tickSize(tickheight, 0).tickPadding(3).tickFormat(format);

		if (this.xFmt.type == "log")
		{
			this.xAxis.tickFormat(logFormat);
		}

		if (this.xFmt.type == "double positive")
		{
			this.leftXAxis = d3.svg.axis()
				.scale(leftPositive) //do the faux positive left-hand axis
				.orient(xOrient).tickSize(tickheight, 0).tickPadding(3).tickFormat(format);

			this.xAxis = d3.svg.axis()
				.scale(rightPositive) //do the real positive right-hand axis
				.orient(xOrient).tickSize(tickheight, 0).tickPadding(3).tickFormat(format);
		}

		//next set the ticks to absolute values or just a number of ticks
		if (this.xFmt.type == "double positive")
		{
			$.isArray(xTicks) ? (this.xAxis.tickValues(posTicks) && this.leftXAxis.tickValues(negTicks))
							  : (this.xAxis.ticks(xTicks - 2) && this.leftXAxis.ticks(2));
		}
		else
		{
			$.isArray(xTicks) ? (this.xAxis.tickValues(xTicks)) : (this.xAxis.ticks(xTicks));
		}

		//now draw the horizontal axis
		this.xaxis = this.group.append("g")
			.call(this.xAxis)
			.attr("transform", "translate(0," + ((xOrient == "bottom") ? dataAreaHeight : 0) + ")")
			//move it down if the axis is at the bottom of the graph
			.attr("class", "x axis");

		//if we want positive tick values radiating from 0, then make the negative half of the axis separately
		if (this.xFmt.type == "double positive")
		{
			this.xaxis.append("g").call(this.leftXAxis)
				.attr("transform", "translate(0," + ((xOrient == "bottom") ? dataAreaHeight : 0) + ")")
				//move it down if the axis is at the bottom of the graph
				.attr("class", "x axis");
				// make the x-axis label, if it exists
		}

		if (this.xFmt.label)
		{
			var xaxisDims = this.xaxis.node().getBBox();
			this.xLabelObj = this.xaxis.append("foreignObject")
				.attr("x", 0)
				.attr("y", ((xOrient == "top") ? (-1.5) : 1) * (xaxisDims.height + 2))
				.attr("width", dataAreaWidth).attr("height", 40);

			this.xLabelObj.append("xhtml:body").style("margin", "0px")
				//this interior body shouldn't inherit margins from page body
				.append("div").attr("class", "axisLabel").html(this.xFmt.label) //make the label
				;
		}

		var xHt = d3.round(this.group.select(".x.axis").node().getBBox().height);

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
} // end of Axis constructor

/* **************************************************************************
 * Axis.createScale                                                     *//**
 *
 * Updates this.scale based on the current properties of the Axis to be a
 * function which takes a data value along the axis and returns the position
 * in the view that corresponds to that data value.
 *
 ****************************************************************************/
Axis.prototype.createScale = function ()
{
	// Abstract method
	return null;
};

/* **************************************************************************
 * Axis.getBoundingBox                                                  *//**
 *
 * Returns the bounding box of the axis.
 *
 * @param {d3.selection}	container	-An element used to render the axis into
 *										 so it cam be measured, any elements
 *										 added will be removed on return.
 *
 ****************************************************************************/
Axis.prototype.getBoundingBox = function (container)
{
	// Create a group and generate the axis in it so it can be measured.
	var g = container.append("g");
	g.call(this.generate);
	var boundingBox = g.node().getBBox();
	
	g.remove();
	
	return boundingBox;
};

/* **************************************************************************
 * Axis.updateGenerator                                                 *//**
 *
 *
 ****************************************************************************/
Axis.prototype.updateGenerator = function ()
{
	// Abstract method
};

/* **************************************************************************
 * LinearAxis                                                           *//**
 *
 * @constructor
 * @extends {Axis}
 *
 * @param {AxisFormat}	format		-Format of the axis
 * @param {number}		distance	-The distance that the axis will span when rendered.
 *
 ****************************************************************************/
function LinearAxis(format, distance)
{
	// call the parent's constructor
	goog.base(format, distance);

} // end of LinearAxis constructor

// Set the base class of LinearAxis
goog.inherits(LinearAxis, Axis);

/* **************************************************************************
 * LinearAxis.createScale                                               *//**
 *
 * Returns a d3 scale function based on the current properties of the Axis
 * A d3 scale function takes a data value along the axis and returns the
 * position in the view that corresponds to that data value.
 *
 ****************************************************************************/
LinearAxis.prototype.createScale = function()
{
	//Check if explicit ticks are specified, and if so, use them as the mapped range of the graph width
	//ignore the actual data range
	var dataExtent = ($.isArray(xTicks)) ? d3.extent(xTicks) : this.xFmt.extent;

	// invert the vertical output coordinates so that data values increase as you go up.
	var viewExtent = this.isVertical ? [this.distance, 0] : [0, this.distance];
	
	var scale = d3.scale.linear()
						.domain(dataExtent)
						.rangeRound(viewExtent);
		
	return scale;
}

/* **************************************************************************
 * LinearAxis.updateGenerator                                           *//**
 *
 *
 ****************************************************************************/
LinearAxis.prototype.updateGenerator = function ()
{
	var tickheight = 10;
	
	// Format the ticks w/ the general format using a precision of 1 significant digit.
	var tickFormat = d3.format(".1");

	//set up the functions that will generate the x axis
	this.generate = d3.svg.axis() //a function that will create the axis and ticks and text labels
						  .scale(this.scale)
						  .orient(this.format.orientation)
						  .tickSize(tickheight, 0)
						  .tickPadding(3)
						  .tickFormat(format);
};

/* **************************************************************************
 * OrdinalAxis                                                          *//**
 *
 * @constructor
 * @extends {Axis}
 *
 * @param {AxisFormat}	format		-Format of the axis
 * @param {number}		distance	-The distance that the axis will span when rendered.
 *
 ****************************************************************************/
function OrdinalAxis(format, distance)
{
	// call the parent's constructor
	goog.base(format, distance);

} // end of OrdinalAxis constructor

// Set the base class of OrdinalAxis
goog.inherits(OrdinalAxis, Axis);

/* **************************************************************************
 * OrdinalAxis.createScale                                              *//**
 *
 * Returns a d3 scale function based on the current properties of the Axis
 * A d3 scale function takes a data value along the axis and returns the
 * position in the view that corresponds to that data value.
 *
 ****************************************************************************/
OrdinalAxis.prototype.createScale = function ()
{
	// invert the vertical output coordinates so that data values increase as you go up.
	var viewExtent = this.isVertical ? [this.distance, 0] : [0, this.distance];
	
	// viewExtent is broken into even spaces allowing for bar width and
	// a uniform white space between each, in this case, 20% white space
	var scale = d3.scale.ordinal()
						.domain(this.format.ticks)
						.rangeRoundBands(viewExtent, 0.4);
		
	return scale;
};

/* **************************************************************************
 * LogAxis                                                              *//**
 *
 * @constructor
 * @extends {Axis}
 *
 * @param {AxisFormat}	format		-Format of the axis
 * @param {number}		distance	-The distance that the axis will span when rendered.
 *
 ****************************************************************************/
function LogAxis(format, distance)
{
	// call the parent's constructor
	goog.base(format, distance);

} // end of LogAxis constructor

// Set the base class of LogAxis
goog.inherits(LogAxis, Axis);

/* **************************************************************************
 * LogAxis.createScale                                                  *//**
 *
 * Returns a d3 scale function based on the current properties of the Axis
 * A d3 scale function takes a data value along the axis and returns the
 * position in the view that corresponds to that data value.
 *
 ****************************************************************************/
LogAxis.prototype.createScale = function()
{
	//Check if explicit ticks are specified, and if so, use them as the mapped range of the graph width
	//ignore the actual data range
	var dataExtent = ($.isArray(xTicks)) ? d3.extent(xTicks) : this.xFmt.extent;

	// invert the vertical output coordinates so that data values increase as you go up.
	var viewExtent = this.isVertical ? [this.distance, 0] : [0, this.distance];
	
	//always start and end on even decades
	var low = Math.floor(Math.log(dataExtent[0]) / Math.log(10));
	var high = Math.ceil(Math.log(dataExtent[1]) / Math.log(10));

	var scale = d3.scale.log()
						.domain([0.99 * Math.pow(10, low), Math.pow(10, high)])
						.rangeRound(viewExtent);
		
	return scale;
};


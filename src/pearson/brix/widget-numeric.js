/* **************************************************************************
 * $Workfile:: widget-numeric.js                                            $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the {@link pearson.brix.Readout} and
 *               {@link pearson.brix.NumericInput} brix.
 *
 * [FILL IN SUMMARY DESCRIPTION OF WHAT IS IN THIS FILE]
 * @note the following text was in this file, I don't believe it is really
 * descriptive of this file anymore.
 *
 * HTML widgets
 * these are widgets that will just write as HTML fields, not SVG, although they can be used
 * inside foreign object containers to the extent that browsers will render them
 *
 * Created on		April 25, 2013
 * @author			Leslie Bondaryk
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.Readout');
goog.provide('pearson.brix.NumericInput');

goog.require('pearson.utils.IEventManager');
goog.require('pearson.brix.HtmlBric');


/* **************************************************************************
 * Readout                                                             */ /**
 *
 * Constructor function for a Readout bric.
 *
 * @constructor
 * @extends {pearson.brix.HtmlBric}
 * @export
 *
 * @param {Object}		config			-The settings to configure this Readout
 * @param {string|undefined}
 *      				config.id		-String to uniquely identify this Readou.
 *										 if undefined a unique id will be assigned.
 * @param {number} 		config.startVal	-[DESCRIPTION of config parameter needed]
 * @param {htmlString} 	config.unit		-[DESCRIPTION of config parameter needed]
 * @param {htmlString}	config.label	-[DESCRIPTION of config parameter needed]
 * @param {*} 			config.precision
 * 										-[DESCRIPTION of config parameter needed]
 * @param {!pearson.utils.IEventManager=}
 * 						eventManager	-The event manager to use for publishing events
 * 										 and subscribing to them. Currently unused.
 *
 * @classdesc
 * Readout bric is just a way to display calculated or event-driven text
 * in a page.  This is commonly used for meters, results, tests, updatable text, etc.
 * Formerly done as a text input so you can either display or type into it
 *
 ****************************************************************************/
pearson.brix.Readout = function (config, eventManager)
{
	// call the base class constructor
	goog.base(this);

	/**
	 * A unique id for this instance of the readout bric
	 * @private
	 * @type {string}
	 */
	this.readoutId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.Readout);

	this.node = config.node;
	this.startVal = config.startVal;
	this.unit = config.unit;
	//if the readout requires a unit to be appended, do so. String value.
	this.label = config.label;
	//if the readout requires a label to be prepended, do so. String value.
	// Define the ids of the events this widget broadcasts
	var precision = config.precision;

	//<span id="myID" class"dataLabel">numeric readout</span>;
	this.rootEl = this.node.append("span");
	//write a label in front of the input if there is one
	var readout = this.rootEl.html(this.label?this.label:"").attr("role","label");
	
	
	/* used to be input fields, but I switched to text per the design -lb
	this.rootEl
	.append("input")
	.style("max-width","40px")
	.style("direction","rtl")
	.attr("type","text")
	.property("value",this.startVal)
	.attr("align","right")
	.attr("size",size?size:6)
	.attr("id",this.readoutId_)
	; */
	
	this.rootEl.append("span")
		.attr("class", "dataLabel")
		.attr("id", this.readoutId_)
		.text(this.startVal);

	this.rootEl.append("span").html('\u2007' + (this.unit ? this.unit : ''));
	
	// TEST: the written text span is the start value
	window.console.log("text is the startVal:", d3.select("#" + this.readoutId_).text() == this.startVal, d3.select("#" + this.readoutId_).text());

}; //end Readout widget
goog.inherits(pearson.brix.Readout, pearson.brix.HtmlBric);

/**
 * Prefix to use when generating ids 
 * @const
 * @type {string}
 */
pearson.brix.Readout.autoIdPrefix = "readout_auto_";

/* **************************************************************************
 * Readout.setValue                                                    */ /**
 *
 * The Readout setValue method sets the value of the Readout
 * widget. This does NOT fire the changedValue event.
 *
 * @param {number} newValue	-The new value for the widget
 *
 ****************************************************************************/
pearson.brix.Readout.prototype.setValue = function (newValue)
{
	window.console.log("TODO: called setReadoutValue log", this.readoutId_, newValue);
	
	// The value is kept in the input element which was given an id
	d3.select("#" + this.readoutId_).text(newValue);
};


/* **************************************************************************
 * Readout.getValue                                                    */ /**
 *
 * The Readout getValue method gets the value of the Readout
 * widget. This does NOT fire the changedValue event.
 *
 ****************************************************************************/
pearson.brix.Readout.prototype.getValue = function ()
{
	// The value is kept in the input element which was given an id
	return d3.select("#" + this.readoutId_).text();
};

/* **************************************************************************
 * NumericInput                                                        */ /**
 *
 * Constructor function for a NumericInput bric.
 *
 * @constructor
 * @extends {pearson.brix.HtmlBric}
 * @export
 *
 * @param {Object}		config			-The settings to configure this NumericInput
 * @param {string|undefined}
 * 						config.id		-String to uniquely identify this NumericInput.
 * 										 if undefined a unique id will be assigned.
 * @param {number} 		config.node		-[DESCRIPTION of config parameter needed]
 * @param {number} 		config.startVal	-[DESCRIPTION of config parameter needed]
 * @param {number} 		config.minVal	-[DESCRIPTION of config parameter needed]
 * @param {number} 		config.maxVal	-[DESCRIPTION of config parameter needed]
 * @param {htmlString} 	config.unit		-[DESCRIPTION of config parameter needed]
 * @param {htmlString}	config.label	-[DESCRIPTION of config parameter needed]
 * @param {!pearson.utils.IEventManager=}
 * 						eventManager	-The event manager to use for publishing events
 * 										 and subscribing to them.
 *
 * @classdesc
 * A NumericInput widget...
 *
 ****************************************************************************/
pearson.brix.NumericInput = function (config, eventManager)
{
	// call the base class constructor
	goog.base(this);

	this.id = config.id;

	this.node = config.node;
	this.startVal = config.startVal;

	var minVal = config.minVal;
	var maxVal = config.maxVal;
	this.unit = config.unit;
	this.label = config.label;
	// Define the ids of the events the ButtonWidget uses
	this.changedValueEventId = this.id + 'Number';
	
	/**
	 * The event manager to use to publish (and subscribe to) events for this widget
	 * @type {!pearson.utils.IEventManager}
	 */
	this.eventManager = eventManager || pearson.utils.IEventManager.dummyEventManager;


	//this.rootEl = $('<div><input type="number" min="0" max="100" step="5" value="50"    id="numInput_0" class="dataLabel"></div>');
	this.rootEl = this.node.append("span");
	//write a label in front of the input if there is one
	this.rootEl.append("span").html(this.label ? this.label : "").attr("role", "label");
	this.rootEl.append("input")
		.attr("type", "number")
		.attr("min", minVal)
		.attr("max", maxVal)
		.attr("value", this.startVal)
		.attr("id", this.id)
		.attr("class", "dataLabel")
		;

	this.rootEl.append("span").html(this.unit ? this.unit : "");

	this.rootEl.on('change', function()
			{
		//this publishes the onChange event to the eventManager
		//passing along the updated value in the numeric field.
		//note that jQuery returns an array for selections, the
		//first element of which is the actual pointer to the
		//tag in the DOM
			that.eventManager.publish(this.changedValueEventId,
							{value: d3.select("#" + this.id)[0][0].value});
								} );

	// Define private handlers for subscribed events
	var that = this;
	function changedValueHandler(eventDetails)
	{
		that.setValue(eventDetails.value);
	}

	// Subscribe to own events, if appropriate
	eventManager.subscribe(this.changedValueEventId, changedValueHandler);
}; //end NumericInput widget
goog.inherits(pearson.brix.NumericInput, pearson.brix.HtmlBric);

/* **************************************************************************
 * NumericInput.getValue                                               */ /**
 *
 * The NumericInput getValue method returns the value of the NumericInput
 * widget.
 ****************************************************************************/
pearson.brix.NumericInput.prototype.getValue = function()
{
	// The value is kept in the input element which was given an id
	return d3.select("#" + this.id)[0][0].value;
};

/* **************************************************************************
 * NumericInput.setValue                                               */ /**
 *
 * The NumericInput setValue method sets the value of the NumericInput
 * widget. This does NOT fire the changedValue event.
 *
 * @param {number} newValue	-The new value for the widget
 *
 ****************************************************************************/
pearson.brix.NumericInput.prototype.setValue = function(newValue)
{
	window.console.log("TODO: called setNumericInputValue log", this.id, newValue);

	// The value is kept in the input element which was given an id
	d3.select("#" + this.id)[0][0].value = newValue;
};


/* **************************************************************************
 * $Workfile:: widget-button.js                                             $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the button bric.
 *
 * The button bric creates an HTML5 button which publishes (fires) an
 * event when clicked using the event manager.
 *
 * Created on		May 8, 2013
 * @author			Jordan Vishniac
 * @author			Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.Button');

goog.require('pearson.utils.IEventManager');
goog.require('pearson.brix.HtmlBric');

// Sample Button constructor configuration
(function()
{
	var button1Config = {
			id: "button1",
			text: "Hello World",
			enabled: true
		};
});
	
/* **************************************************************************
 * Button                                                              */ /**
 *
 * The Button widget creates a clickable html button that publishes events.
 *
 * @constructor
 * @extends {pearson.brix.HtmlBric}
 * @export
 *
 * @param {Object}		config			-The settings to configure this button
 * @param {string|undefined}
 * 						config.id		-String to uniquely identify this button
 * 										 if undefined a unique id will be assigned.
 * @param {string}		config.text		-The text to be displayed on the button
 * @param {bool}		config.enabled	-The initial enabled state of the button.
 * 										 Optional, defaults to true.
 * @param {!pearson.utils.IEventManager=}
 * 						eventManager	-The event manager to use for publishing events
 * 										 and subscribing to them.
 *
 **************************************************************************/
pearson.brix.Button = function (config, eventManager)
{
	// call the base class constructor
	goog.base(this);

	/**
	 * A unique id for this instance of the button bric
	 * @private
	 * @type {string}
	 */
	this.buttonId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.Button);

	/**
	 * The text displayed on the button. May be accessed using
	 * the methods getText and setText.
	 * @private
	 * @type {string}
	 */
	this.text_ = config.text || "";
	
	/**
	 * Determines whether the button should be enabled or disabled.
	 * May be accessed using the methods getEnabled, setEnabled.
	 * @private
	 * @type {boolean}
	 */
	this.enabled_ = config.enabled === false ? false : true;

	/**
	 * The event manager to use to publish (and subscribe to) events for this bric
	 * @type {!pearson.utils.IEventManager}
	 */
	this.eventManager = eventManager || pearson.utils.IEventManager.dummyEventManager;
	
	/**
	 * The event id published when this button is clicked.
	 * @const
	 * @type {string}
	 */
	this.pressedEventId = this.buttonId_ + '_Pressed';
	
	/**
	 * Information about the last drawn instance of this button (from the draw method)
	 * @type {Object}
	 */
	this.lastdrawn =
		{
			container: null,
			widgetGroup: null,
		};

}; // end of Button constructor
goog.inherits(pearson.brix.Button, pearson.brix.HtmlBric);

/**
 * Prefix to use when generating ids for instances of Button.
 * @const
 * @type {string}
 */
pearson.brix.Button.autoIdPrefix = "btn_auto_";

/* **************************************************************************
 * Button.draw                                                         */ /**
 *
 * Draw this Button in the given container.
 * @export
 *
 * @param {!d3.selection}
 *					container	-The container html element to append the button
 *								 element tree to.
 *
 ****************************************************************************/
pearson.brix.Button.prototype.draw = function (container)
{
	this.lastdrawn.container = container;

	var that = this;
	
	// make a div to hold the radio group
	var widgetGroup = container.append("div")
		.attr("class", "brixButton")
		.attr("id", this.buttonId_);

	var button = widgetGroup.append("button")
		.attr("type", "button")
		.attr("disabled", this.enabled_ ? null : "disabled")
		.text(this.text_);

	// publish pressed event when clicked
	button.on("click", function ()
						{
							that.eventManager.publish(that.pressedEventId);
						});

	this.lastdrawn.widgetGroup = widgetGroup;
};

/* **************************************************************************
 * Button.redraw                                                       */ /**
 *
 * Redraw the button using the current property values (such as text,
 * and enabled).
 * @export
 *
 ****************************************************************************/
pearson.brix.Button.prototype.redraw = function ()
{
	var button = this.lastdrawn.container.select("button");

	button
		.attr("disabled", this.enabled_ ? null : "disabled")
		.text(this.text_);
};

/* **************************************************************************
 * Button.getId                                                        */ /**
 *
 * Returns the ID of this Button.
 * @export
 *
 * @returns {string} Id of this Button
 *
 ****************************************************************************/
pearson.brix.Button.prototype.getId = function ()
{
	return this.buttonId_;
};

/* **************************************************************************
 * Button.setText                                                      */ /**
 *
 * This method sets the text displayed on the button to the given string
 * @export
 *
 * @param {string}		text	- the text to be displayed on the button
 *
 **************************************************************************/
pearson.brix.Button.prototype.setText = function (text)
{
	var textChanged = this.text_ !== text;
	this.text_ = text;

	if (textChanged && this.lastdrawn.widgetGroup)
	{
		this.redraw();
	}
};

/* **************************************************************************
 * Button.getText                                                      */ /**
 *
 * This method retrieves the text currently displayed on the button,
 * @export
 *
 **************************************************************************/
pearson.brix.Button.prototype.getText = function ()
{
	return this.text_;
};

/* **************************************************************************
 * Button.setEnabled                                                   */ /**
 *
 * This method sets the current enable state of the button.
 * @export
 *
 * @param {boolean}	newEnableState	-true to enable the button, false to disable it.
 *
 **************************************************************************/
pearson.brix.Button.prototype.setEnabled = function (newEnableState)
{
	// coerce newEnableState to be a bool
	newEnableState = newEnableState === true;
	var stateChanged = this.enabled_ !== newEnableState;
	this.enabled_ = newEnableState;

	if (stateChanged && this.lastdrawn.widgetGroup)
	{
		this.redraw();
	}
};

/* **************************************************************************
 * Button.getEnabled                                                   */ /**
 *
 * This method retrieves the current enable state of the button.
 * @export
 *
 **************************************************************************/
pearson.brix.Button.prototype.getEnabled = function ()
{
	return this.enabled_;
};


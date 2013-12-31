/* **************************************************************************
 * $Workfile:: widget-slider.js                                             $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the slider bric.
 *
 * The slider bric creates a Google Closure slider for setting a numerical value
 * from a range.
 *
 * Created on       April 15, 2013
 * @author          Leslie Bondaryk
 * @author          Michael Jay Lippert
 * @author          Young-Suk Ahn
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.Slider');

goog.require('goog.debug.Logger');
goog.require('goog.dom');
goog.require('goog.ui.Component');
goog.require('goog.ui.Slider');

goog.require('pearson.utils.IEventManager');
goog.require('pearson.brix.HtmlBric');

// Sample Slider constructor configuration
(function()
{
    var sl1Config = {
            id: "slider1",
            startVal: 2.5,
            minVal: 0,
            maxVal: 5,
            stepVal: 0.1,
            unit: "&micro;m",
            label: "diameter: ",
            width: '45%',
            format: String.fromCharCode(0x2007/*figure space*/) + '>5.2f', //pad formatted number w/ space that is same width as the numbers in the font
        };
});


/* **************************************************************************
 * UnitOpt                                                             */ /**
 *
 * This is the enumeration for unit displaying option. The unit can be 
 * prepended, appended or not displayed.
 *
 * @enum {number}
 *
 ****************************************************************************/
pearson.brix.UnitOpt =
{
    NONE: 0,
    PREPEND: 1,
    APPEND: 2
};

/* **************************************************************************
 * Slider                                                              */ /**
 *
 * Constructor for Slider brix.
 *
 * @constructor
 * @extends {pearson.brix.HtmlBric}
 * @export
 *
 * @param {Object}      config          -The settings to configure this Slider
 * @param {string|undefined}
 *                      config.id       -String to uniquely identify this Slider.
 *                                       if undefined a unique id will be assigned.
 * @param {number}      config.startVal -Starting value of slider
 * @param {number}      config.minVal   -Minimum value of slider
 * @param {number}      config.maxVal   -Maximum value of slider
 * @param {number}      config.stepVal  -Step size of slider
 * @param {htmlString|undefined}
 *                      config.label    -Text preceding the slider, optional
 * @param {htmlString|undefined}
 *                      config.unit     -Unit as displayed in the internal readout
 * @param {pearson.brix.UnitOpt|undefined}
 *                      config.unitOpt  -Unit display option
 * @param {function(number): string}
 *                      config.format   -{@link https://github.com/mbostock/d3/wiki/Formatting|formatting function}
 *                                       for displaying value in readout. 
 *                                       Set to null if does not want readout to be shown.
 * @param {string}
 *                      config.width    -The width of the slider in format: Nn{px|%}. E.g.: 90%, 200px
 * @param {!pearson.utils.IEventManager=}
 *                      eventManager    -The event manager to use for publishing events
 *                                       and subscribing to them.
 *
 * @classdesc
 * The Slider bric is implemented using the google closure slider. It is used
 * for setting a numerical value from a range.
 *
 * It publishes the following named events (use Slider.getEventTopic to get the
 * topic for a particular Slider instance):
 *   'value-changed' - When the value was changed
 *   'drag-start'    - When the user starts dragging the thumb
 *   'drag-end'      - When the user stopped dragging the thumb
 *
 **************************************************************************/
pearson.brix.Slider = function (config, eventManager)
{
    // call the base class constructor
    goog.base(this);

    /**
     * A logger to help debugging 
     * @private
     * @type {goog.debug.Logger}
     */
    this.logger_ = goog.debug.Logger.getLogger('pearson.brix.Slider');

    /**
     * A unique id for this instance of the slider bric
     * @private
     * @type {string}
     */
    this.sldrId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.Slider);

    // TODO: These all need comments describing what they are. -mjl 5/16/2013
    this.startVal = config.startVal;
    this.minVal = config.minVal;
    this.maxVal = config.maxVal;
    this.stepVal = config.stepVal;

    /**
     * Text unit to display next to the value readout. Position will
     * be determined by the unitOpt property.
     * @type {string}
     * @todo Currently for display only. Later could be used to multiply the value by a unit.
     */
    this.unit = config.unit || '';

    /**
     * Specify where the unit should be displayed in relation to the value.
     * @type {pearson.brix.UnitOpt}
     */
    this.unitOpt = config.unitOpt || pearson.brix.UnitOpt.APPEND;

    /**
     * Text to display before the readout and slider.  Currently for display only.
     * later could be used to multiply the value by a unit.
     * @type {string}
     */
    this.label = config.label;

    /**
     * Function to format the value of this slider for display by the readout.
     * @type {function(number): string}
     */
    this.format = (config.format) ? d3.format(config.format) : function(val){ return val.toString();};

    /**  
     * The width of the Slider in pixel
     * @type {number}
     */
    this.width = config.width || '90%';

    /**
     * The event manager to use to publish (and subscribe to) events for this widget
     * @type {!pearson.utils.IEventManager}
     */
    this.eventManager = eventManager || pearson.utils.IEventManager.dummyEventManager;

    /**
     * The event id (topic) published when the value of this slider changes.
     * @const
     * @type {string}
     */
    this.changedValueEventId = pearson.brix.Slider.getEventTopic('value-changed', this.sldrId_);
    
    /**
     * The event id (topic) published when the handle starts dragging.
     * @const
     * @type {string}
     */
    this.dragStartEventId = pearson.brix.Slider.getEventTopic('drag-start', this.sldrId_);

    /**
     * The event id (topic) published when the handle stops dragging.
     * @const
     * @type {string}
     */
    this.dragEndEventId = pearson.brix.Slider.getEventTopic('drag-end', this.sldrId_);

    /**
     * The event details for this.changedValueEventId events
     * @typedef {Object} ChangedValueEventDetails
     * @property {number} oldValue  -The previous value of this slider.
     * @property {number} newValue  -The new/current value of this slider.
     */

    /**
     * Information about the last drawn instance of this slider (from the draw method)
     * @type {Object}
     */
    this.lastdrawn =
        {
            /** @type {d3.selection} */     container: null,
            /** @type {Element} */          widgetGroup: null,
            /** @type {?number} */          value: null,
            /** @type {d3.selection} */     readOut: null,
            /** @type {goog.ui.Slider} */   sliderObj: null,
        };

    this.logger_.config('Slider with id:' + this.sldrId_ + ' created.');
}; // end of slider constructor
goog.inherits(pearson.brix.Slider, pearson.brix.HtmlBric);

/**
 * Prefix to use when generating ids for instances of Slider.
 * @const
 * @type {string}
 */
pearson.brix.Slider.autoIdPrefix = "sldr_auto_";


/* **************************************************************************
 * Slider.getEventTopic (static)                                       */ /**
 *
 * Get the topic that will be published for the specified event by a
 * Slider bric with the specified id.
 * @export
 *
 * @param {string}  eventName       -The name of the event published by instances
 *                                   of this Bric.
 * @param {string}  instanceId      -The id of the Bric instance.
 *
 * @returns {string} The topic string for the given topic name published
 *                   by an instance of Slider with the given
 *                   instanceId.
 *
 * @throws {Error} If the eventName is not published by this bric or the
 *                 topic cannot be determined for any other reason.
 ****************************************************************************/
pearson.brix.Slider.getEventTopic = function (eventName, instanceId)
{
    /**
     * Functions that return the topic of a published event given an id.
     * @type {Object.<string, function(string): string>}
     */
    var publishedEventTopics =
    {
        'value-changed': function (instanceId)
        {
            return instanceId + '_valueChanged';
        },
        'drag-start': function (instanceId)
        {
            return instanceId + '_dragStart';
        },
        'drag-end': function (instanceId)
        {
            return instanceId + '_dragEnd';
        },
    };

    if (!(eventName in publishedEventTopics))
    {
        throw new Error("The requested event '" + eventName + "' is not published by Slider brix");
    }

    return publishedEventTopics[eventName](instanceId);
};

/* **************************************************************************
 * Slider.getId                                                        */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Returns the ID of this bric.
 *
 * @returns {string} The ID of this Bric.
 *
 ****************************************************************************/
pearson.brix.Slider.prototype.getId = function ()
{
    return this.sldrId_;
};

/* **************************************************************************
 * Slider.draw                                                         */ /**
 *
 * The Slider allows the user to set a numeric value over some defined range.
 * @export
 *
 * @param {!d3.selection}   container   -The DOM element this slider will be
 *                                       created as the last child of.
 *
 ****************************************************************************/
pearson.brix.Slider.prototype.draw = function (container)
{
    this.lastdrawn.container = container;

    // Provide a reference to this Slider instance for use in any function expressions defined here.
    var that = this;

    // get the element from the d3 selection so we can use it w/ the closure-library slider functions
    var cntrElement = container.node();

    //var readOut = $("<span class='readout'>" + this.format(this.startVal) + "</span>");

    // @todo We should really change many of the classes that are used here -mjl 11/26/2013
    //       for example the top level div should have a class name of brix{classname} ie brixSlider
    //       the nested element class names don't need as much specifity as the css selector
    //       should refer to them as descendents of the div.brixSlider.
    //       A class of 'bric-round-corner' describes the formatting desired rather than the
    //       item being formatted. That isn't a good design separation.

    // All brix get a top level "grouping" element which gets a class identifying the bric type.
    var widgetGroup = container.append("div")
        .attr("class", "bricSlider-container")
        .attr("id", this.sldrId_)
        .attr("style", "width:"+ this.width);
    var widgetHeaderDiv = widgetGroup.append('div')
        .attr("class", "header");
    widgetHeaderDiv.append('span')
        .attr('role', 'label')
        .html(this.label ? this.label : "");

    // readout is enabled if format was provided
    var readOut = (this.format) ? widgetHeaderDiv.append('span')
            .attr("class", "readout")
            .html(this.getFormattedValue(this.unitOpt, this.startVal))
        : null;

    // @todo ysap I'd like to see a comment as to what the inline styling here is accomplishing. -mjl 11/26/2013
    var googSliderDiv = widgetGroup.append("div")
        .attr("class", "bricSlider-widget goog-slider")
        .attr("style", "position:relative; display:inline-block; width: 100%; height: 20px;");
    googSliderDiv.append('div') // rail (optional)
        .attr('class', 'bricSlider-rail bric-round-corner');
        // Below is sample from google site
        //.attr('style', "position:absolute;width:100%;top:9px;border:1px inset white; overflow:hidden;height:0");
    var thumbDiv = googSliderDiv.append('div')
        .attr('class', 'bricSlider-thumb goog-slider-thumb bric-round-corner');

    var trackDiv = widgetGroup.append("div")
        .attr("class", "track");
    trackDiv.append('div')
        .attr('class', 'range')
        .attr('style', 'float:right')
        .html(this.getFormattedValue(pearson.brix.UnitOpt.NONE, this.maxVal));
    trackDiv.append('div')
        .attr('class', 'range')
        .html(this.getFormattedValue(pearson.brix.UnitOpt.NONE, this.minVal));

    var sliderEl = googSliderDiv.node();

    this.lastdrawn.value = this.startVal;
    this.lastdrawn.widgetGroup = widgetGroup;
    this.lastdrawn.readOut = readOut;

    var googSlider = new goog.ui.Slider;

    // set the sliderObj right after it's created so there is no possible
    // race condition if it is referenced in on of the internal slider event handlers
    this.lastdrawn.sliderObj = googSlider;

    googSlider.setValue(this.startVal);
    googSlider.setMinimum(this.minVal);
    googSlider.setMaximum(this.maxVal);
    if (this.stepVal)
    {
        googSlider.setStep(this.stepVal);
        googSlider.setUnitIncrement(this.stepVal);
    }
    googSlider.decorate(sliderEl);
    googSlider.setMoveToPointEnabled(true); // Allows going to specific point when tapped over the rail

    googSlider.listen(goog.ui.Component.EventType.CHANGE, goog.bind(this.handleInternalSliderChanged_, this));
    googSlider.listen(goog.ui.SliderBase.EventType.DRAG_START, goog.bind(this.handleInternalDragStart_, this));
    googSlider.listen(goog.ui.SliderBase.EventType.DRAG_END, goog.bind(this.handleInternalDragEnd_, this));

}; // end of Slider.draw()

/* **************************************************************************
 * Slider.handleInternalSliderChanged_                                 */ /**
 *
 * Handle the CHANGED event from the google closure slider.
 *  - update this.lastdrawn.value
 *  - update the value readout display
 *  - publish 'valueChanged' event
 * @private
 ****************************************************************************/
pearson.brix.Slider.prototype.handleInternalSliderChanged_ = function ()
{
    // This publishes the CHANGE event to the eventManager
    // passing along the updated value in the numeric field.
    var newVal = this.lastdrawn.sliderObj.getValue();

    // we want to publish the 'valueChanged' event after the value has been changed
    var oldVal = this.lastdrawn.value;
    this.lastdrawn.value = newVal;

    var readOut = this.lastdrawn.widgetGroup.select('div.header span.readout');

    if (!readOut.empty())
    {
        readOut.html(this.getFormattedValue(this.unitOpt));
    }

    var eventDetail = {oldValue: oldVal, newValue: newVal};
    this.logger_.finer('Publishing to "' + this.changedValueEventId + '"" ' + JSON.stringify(eventDetail));
    this.eventManager.publish(this.changedValueEventId, eventDetail);
};

/* **************************************************************************
 * Slider.handleInternalDragStart_                                     */ /**
 *
 * Handle the DRAG_START event from the google closure slider.
 *  - publish 'dragStart' event
 * @private
 ****************************************************************************/
pearson.brix.Slider.prototype.handleInternalDragStart_ = function ()
{
    var curValue = this.lastdrawn.sliderObj.getValue();
    this.logger_.fine('Publishing to "' + this.dragStartEventId + '" value: ' + curValue);

    this.eventManager.publish(this.dragStartEventId, {value: curValue});
};

/* **************************************************************************
 * Slider.handleInternalDragEnd_                                       */ /**
 *
 * Handle the DRAG_END event from the google closure slider.
 *  - publish 'dragEnd' event
 * @private
 ****************************************************************************/
pearson.brix.Slider.prototype.handleInternalDragEnd_ = function ()
{
    var curValue = this.lastdrawn.sliderObj.getValue();

    this.logger_.fine('Publishing to "' + this.dragEndEventId+ '" value: ' + curValue);

    this.eventManager.publish(this.dragEndEventId, {value: curValue});
};

/* **************************************************************************
 * Slider.setEnabled                                                   */ /**
 *
 * This method sets the current enable state of the slider.
 * @export
 *
 * @param {boolean} newEnableState  -true to enable the slider, false to disable it.
 *
 **************************************************************************/
pearson.brix.Slider.prototype.setEnabled = function (newEnableState)
{
    if (!this.lastdrawn.sliderObj)
    {
        // If not drawn yet, nothing to do
        return;
    }
    var stateChanged = this.lastdrawn.sliderObj.isEnabled() !== newEnableState;

    if (stateChanged && this.lastdrawn.widgetGroup)
    {
        this.lastdrawn.sliderObj.setEnabled(newEnableState);
    }
};

/* **************************************************************************
 * Slider.isEnabled                                                    */ /**
 *
 * Returns the current enable state of the slider.
 * @export
 *
 * @return {boolean} true if enabled, false otherwise
 **************************************************************************/
pearson.brix.Slider.prototype.isEnabled = function ()
{
    if (!this.lastdrawn.sliderObj)
    {
        // If not drawn yet we consider that disabled
        return false;
    }
    return this.lastdrawn.sliderObj.isEnabled();
};

/* **************************************************************************
 * Slider.getValue                                                     */ /**
 *
 * The getValue method returns the current value of this Slider bric.
 * @export
 *
 * @return {number} Current value of this Slider.
 ****************************************************************************/
pearson.brix.Slider.prototype.getValue = function ()
{
    return this.lastdrawn.value;
};

/* **************************************************************************
 * Slider.setValue                                                     */ /**
 *
 * The setValue method sets the value of this Slider bric.
 * This fires the 'valueChanged' event if the value is valid.
 * @export
 *
 * @param {number} newValue -The new value for the bric
 *
 * @return {number} old value of this Slider before it was set to the new value.
 ****************************************************************************/
pearson.brix.Slider.prototype.setValue = function (newValue)
{
    var oldValue = this.lastdrawn.value;

    // The addEventListener(CHANGE) is called when sliderObj.setValue is called below
    // There is no need to set the readout again.
    this.lastdrawn.sliderObj.setValue(newValue);

    return oldValue;
};

/* **************************************************************************
 * Slider.getFormattedValue                                            */ /**
 *
 * The returns the formatted value with unit suffix. 
 * @export
 *
 * @param {pearson.brix.UnitOpt} unitOpt -Unit display placement option 
 * @param {number=}              value   -The value to format, if not provided,
 *                                        uses the current value of the slider.
 *
 * @return {string} the value formatted with the unit attached.
 *
 * @todo why does this method always override the instance unitOpt property, and
 * why not allow overriding the unit itself? It seems an odd mix of what should
 * just be a static method, and an instance method. -mjl 11/26/2013
 ****************************************************************************/
pearson.brix.Slider.prototype.getFormattedValue = function (unitOpt, value)
{
    var valueToFormat = (value !== undefined) ? value : this.lastdrawn.value;

    if (unitOpt === pearson.brix.UnitOpt.APPEND)
    {
        // @todo don't special case units which are degrees, if this type of functionality it desirable then generalize it. -mjl 11/26/2013
        // @todo why is the \u2007 character used here, is there some benefit over just using a regular space? -mjl 11/26/2013
        return this.format(valueToFormat) + (this.unit !== '\u00b0' /*&deg;*/ ? '\u2007' : '') + this.unit;
    }
    else if (unitOpt === pearson.brix.UnitOpt.PREPEND)
    {
        return this.unit  + this.format(valueToFormat);
    }
    return this.format(valueToFormat);
};



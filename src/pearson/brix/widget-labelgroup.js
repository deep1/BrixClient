/* **************************************************************************
 * $Workfile:: widget-labelgroup.js                                         $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the LabelGroup widget.
 *
 * The LabelGroup widget draws a group of labels at specified locations
 * in an SVGContainer.
 *
 * Created on       April 23, 2013
 * @author          Leslie Bondaryk
 * @author          Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.LabelGroup');

goog.require('pearson.brix.SvgBric');
goog.require('pearson.brix.ILightable');
goog.require('pearson.utils.IEventManager');

// Sample Label constructor configuration
(function()
{
    var lbl1Config = {
            id: "lbl1",
            type: "numbered",
            labels:
            [
                { content: "Pre-development",   xyPos: [ 0, -.25], width: 100 },
                { content: "Developing",        xyPos: [14, -.25], width:  80 },
                { content: "Modernizing",       xyPos: [27, -.25], width:  80 },
                { content: "Developed",         xyPos: [40, -.25], width:  70 },
                { content: "Post-development",  xyPos: [51, -.25], width: 100 },
            ],
        };
});

/**
 * Information needed to process a label in a LabelGroup.
 *
 * @typedef {Object} pearson.brix.LabelConfig
 * @property {htmlString}
 *                      content -string with HTML markup to be displayed by the label
 * @property {Array.<nummber>}
 *                      xyPos   -An 2 element array containing the x,y data coordinates
 *                               as elements 0 and 1 respectively for the top left
 *                               corner of the label
 * @property {number}   width   -The pixel width of the label
 *                               @todo we need a better way to deal w/ the width,
 *                                  than hard-coding it here. -lb
 * @property {string|undefined}
 *                      key     -optional string used to reference the label
 *                               in order to manipulate it (such as highlight it).
 *                               does not need to be unique, and if not all labels
 *                               with the same key will be addressed.
 */
pearson.brix.LabelConfig;

/* **************************************************************************
 * LabelGroup                                                          */ /**
 *
 * The LabelGroup widget draws a group of labels at specified locations
 * in an SVGContainer.
 * The LabelGroup is usually used on top of another widget which provides the
 * data extents and scale functions to convert data points to pixel positions
 * in the container. If the scale functions are not set before this widget is
 * drawn, it assumes the data extents are 0 - 1.
 *
 * @constructor
 * @extends {pearson.brix.SvgBric}
 * @implements {pearson.brix.ILightable}
 * @export
 *
 * @param {Object}      config          -The settings to configure this LabelGroup
 * @param {string|undefined}
 *                      config.id       -String to uniquely identify this LabelGroup.
 *                                       if undefined a unique id will be assigned.
 * @param {Array.<pearson.brix.LabelConfig>}
 *                      config.labels   -An array describing each label in the group.
 *
 * @param {string}      config.type     -string specifying "bullets" for dots, "numbered"
 *                                       for dots and #, "alpha" for letters, or anything
 *                                       else for just labels
 * @param {boolean}     config.question -flag specifying whether to use as a question
 * @param {!pearson.utils.IEventManager=}
 *                      eventManager    -The event manager to use for publishing events
 *                                       and subscribing to them.
 *
 * @todo: role: a string which is one of "label", "distractor".
 * @todo: we need some sort of autowidth intelligence on these, but I don't
 * know how to reconcile that with giving user control over wrapping
 ****************************************************************************/
pearson.brix.LabelGroup = function (config, eventManager)
{
    // call the base class constructor
    goog.base(this);

    /**
     * A unique id for this instance of the labelgroup widget
     * @private
     * @type {string}
     */
    this.lblgrpId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.LabelGroup);

    /**
     * Logger for this Bric
     * @private
     * @type {goog.debug.Logger}
     */
    this.logger_ = goog.debug.Logger.getLogger('pearson.brix.LabelGroup');

    /**
     * Array of traces to be graphed, where each trace is an array of points and each point is an
     * object w/ a {number} x and {number} y property.
     * @type {Array.<Array.<{x: number, y: number}>>}
     * @example
     *   // here are 2 traces, 1st w/ 2 points, 2nd with 3 points:
     *   [ [{x: -1.2, y: 2.0} {x: 2, y: 3.1}], [{x: -2, y: -2}, {x: 0, y: 0}, {x: 2, y: 2}] ]
     */

     // if we are using labels as a question input, get the labels from the choices property.
     // otherwise get them from the correctly named labels property
     // @todo This shouldn't be done this way. we should ALWAYS expect a labels property in config. -mjl
     /**
      * An array describing each label in the group, what it should display,
      * and where it should be displayed using data coordinate scale values.
      * @type {Array.<pearson.brix.LabelConfig>}
      */
    this.labels = config.question ? config.choices : config.labels;

    /**
     * The type specifies an adornment on each label or no adornment.
     * It must be one of:
     *
     * - "none" for no adornment
     * - "bullets" for a solid bullet adornment
     * - "numbered" for a bullet containing the index number adornment
     * - "latin-upper" for a bullet containing a sequential capital letter
     *
     * @type {string}
     */
    this.type = config.type || "none";

    /**
     * The event manager to use to publish (and subscribe to) events for this widget
     * @type {!pearson.utils.IEventManager}
     */
    this.eventManager = eventManager || pearson.utils.IEventManager.dummyEventManager;

    /**
     * The event id published when a label in this group is selected.
     * @const
     * @type {string}
     */
    this.selectedEventId = pearson.brix.LabelGroup.getEventTopic('selected', this.lblgrpId_);

    /**
     * The event details for this.selectedEventId events
     * @typedef {Object} SelectedEventDetails
     * @property {string} selectKey -The key associated with the selected label if it has one,
     *                               otherwise the label's index within the group as a string.
     * @property {number} index     -The index of the selected label in the group of labels
     */

    /**
     * The scale functions set explicitly for this LabelGroup using setScale.
     * If these are not null when draw is called they will be used to position
     * the labels. Otherwise a data extent of [0,1] will be mapped to the given
     * container area.
     * @type Object
     * @property {function(number): number}
     *                      xScale  -function to convert a horizontal data offset
     *                               to the pixel offset into the data area.
     * @property {function(number): number}
     *                      yScale  -function to convert a vertical data offset
     *                               to the pixel offset into the data area.
     * @private
     */
    this.explicitScales_ = {xScale: null, yScale: null};

    /**
     * Information about the last drawn instance of this line graph (from the draw method)
     * @type {Object}
     */
    this.lastdrawn =
        {
            container: null,
            size: {height: 0, width: 0},
            labelsId: this.lblgrpId_ + 'Labels',
            widgetGroup: null,
            xScale: null,
            yScale: null,
            labelCollection: null,
        };
} // end of LabelGroup constructor
goog.inherits(pearson.brix.LabelGroup, pearson.brix.SvgBric);

/**
 * Prefix to use when generating ids for instances of LabelGroup.
 * @const
 * @type {string}
 */
pearson.brix.LabelGroup.autoIdPrefix = 'lblg_auto_';

/* **************************************************************************
 * LabelGroup.getEventTopic (static)                                   */ /**
 *
 * Get the topic that will be published for the specified event by a
 * LabelGroup bric with the specified id.
 * @export
 *
 * @param {string}  eventName       -The name of the event published by instances
 *                                   of this Bric.
 * @param {string}  instanceId      -The id of the Bric instance.
 *
 * @returns {string} The topic string for the given topic name published
 *                   by an instance of LabelGroup with the given
 *                   instanceId.
 *
 * @throws {Error} If the eventName is not published by this bric or the
 *                 topic cannot be determined for any other reason.
 ****************************************************************************/
pearson.brix.LabelGroup.getEventTopic = function (eventName, instanceId)
{
    /**
     * Functions that return the topic of a published event given an id.
     * @type {Object.<string, function(string): string>}
     */
    var publishedEventTopics =
    {
        'selected': function (instanceId)
        {
            return instanceId + '_labelSelected';
        },
    };

    if (!(eventName in publishedEventTopics))
    {
        throw new Error("The requested event '" + eventName + "' is not published by LabelGroup brix");
    }

    return publishedEventTopics[eventName](instanceId);
};

/* **************************************************************************
 * LabelGroup.getId                                                    */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Returns the ID of this bric.
 *
 * @returns {string} The ID of this Bric.
 *
 ****************************************************************************/
pearson.brix.LabelGroup.prototype.getId = function ()
{
    return this.lblgrpId_;
};

/* **************************************************************************
 * LabelGroup.draw                                                     */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Draw this LabelGroup in the given container.
 *
 * @param {!d3.selection}   container   -The container svg element to append
 *                                       this SvgBric element tree to.
 * @param {!pearson.utils.ISize}
 *                          size        -The size (in pixels) of the area this
 *                                       SvgBric has been allocated.
 ****************************************************************************/
pearson.brix.LabelGroup.prototype.draw = function (container, size)
{
    this.lastdrawn.container = container;
    this.lastdrawn.size = size;

    this.setLastdrawnScaleFns2ExplicitOrDefault_(size);

    // local aliases for convenience
    var attrFnVal = pearson.brix.utils.attrFnVal;

    var that = this;
    var numLabels = this.labels.length;

    var labelsContainer = container.append("g") //make a group to hold labels
        .attr("class", "brixLabelGroup")
        .attr("id", this.lblgrpId_);

    this.lastdrawn.widgetGroup = labelsContainer;

    /*this filter can be used to add dropshadows to highlighted labels and bullets
    var filter = labelsContainer.append("defs").append("filter").attr("id", "drop-shadow");
    filter.append("feGaussianBlur").attr("in", "SourceAlpha").attr("stdDeviation", 2).attr("result", "blur");
    filter.append("feOffset").attr("in", "blur").attr("dx", 2).attr("dy", 2).attr("result", "offsetBlur");
    var merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "offsetBlur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");
    */

    // bind the label group collection to the label data
    // the collection is used to highlight and unhighlight
    var labelCollection = labelsContainer.selectAll("g.brixLabel").data(this.labels);

    // on the enter selection (create new ones from data labels) make
    // the groups. This is useful in case you want to pack more than just the
    // text label into the graup with the same relative positioning.
    labelCollection.enter()
        .append("g")
        .attr("class","brixLabel");

    //on redraw, get rid of any series which now have no data
    labelCollection.exit().remove();

    // autokey entries which have no key with the data index
    labelCollection.each(function (d, i) {
                    // if there is no key assigned, make one from the index
                    d.key = 'key' in d ? d.key : i.toString();
                    });

    // move the labels into position, but do it on the data collection, which
    // includes both the update and the enter selections, so you can drag them around
    // on a suitable event or redraw.
    labelCollection.attr("transform", function (d, i)  {
                    return attrFnVal("translate", that.lastdrawn.xScale(d.xyPos[0]),
                                                  that.lastdrawn.yScale(d.xyPos[1]));
                  });

    // write each label text as a foreignObject, to get wrapping and full HTML
    // rendering support
    labelCollection.append("foreignObject")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", function (d) { return d.width; })
        .attr("height", 200)
        .append("xhtml:body")
            .style("margin", "0px")
            //this interior body shouldn't inherit margins from page body
            .append("div")
                .attr("class", "descLabel")
                // if there are square bullets, make room for them in front of
                // the label text
                .classed("bullets", (this.type != "none") ? true : false)
                // .style("visibility",function(d,i) { return d.viz;})
                // I punted on the show/hide thing, but it could come back
                // in the way it does for callouts -lb
                .html(function (d) { return d.content; }); //make the label

    var radius = 17;
    var padding = 2;
    // bullets type just puts big circle markers on key areas of a diagram
    // a precursor to hotspot answertypes - the 34 pixel size is from UX in Dec. 2013
    if (this.type != "none")
    {
        labelCollection.append("circle")
            //.attr("class", "numSteps")
            .attr("r", radius)
            .attr("cx", radius + padding)
            .attr("cy", radius + padding);
    }

    // numbered bullets are what PM is referring to as stepped diagrams,
    // work with text labels or without, but there's a really stupid rendering
    // bug in Chrome when highlighting circles or anything that overlaps the
    // foreign object. Recommend using either numbers or text labels. -lb

    if (this.type !== "none")
    {
        var choiceIndex = this.getChoiceNumberToDisplayFn_();

        labelCollection.append("text")
        // the 25 and 27 serve to attractively center the text on the square on Chrome,
        // might need to be adjusted for other browsers
            .attr("x", radius + padding)
            .attr("y", radius + padding)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central")
            .text(function (d, i) {return choiceIndex(i);});
    }

    labelCollection.on('click',
                function (d, i)
                {
                    that.eventManager.publish(that.selectedEventId, {index: i, selectKey: d.key});
                    that.lite(d.key);
                });

    this.lastdrawn.labelCollection = labelsContainer.selectAll("g.brixLabel");

}; // end of LabelGroup.draw()

/* **************************************************************************
 * LabelGroup.redraw                                                   */ /**
 *
 * Redraw the labelgroup as it may have been changed (new content or position).
 * It will be redrawn into the same container area as it was last drawn.
 *
 * @note currently there are no features that require updates of data/position/etc.
 * to label groups, so redraw is empty.  Eventually, when we need to drag
 * labels around, we'll have to parcel out the redraw and draw methods. -lb
 *
 ****************************************************************************/
pearson.brix.LabelGroup.prototype.redraw = function ()
{
};

/* **************************************************************************
 * LabelGroup.setScale                                                 */ /**
 *
 * Called to preempt the normal scale definition which is done when the
 * widget is drawn. This is usually called in order to force one widget
 * to use the scaling/data area calculated by another widget.
 *
 * @param {function(number): number}
 *                      xScale  -function to convert a horizontal data offset
 *                               to the pixel offset into the data area.
 * @param {function(number): number}
 *                      yScale  -function to convert a vertical data offset
 *                               to the pixel offset into the data area.
 *
 ****************************************************************************/
pearson.brix.LabelGroup.prototype.setScale = function (xScale, yScale)
{
    this.explicitScales_.xScale = xScale;
    this.explicitScales_.yScale = yScale;
};

/* **************************************************************************
 * LabelGroup.lite                                                     */ /**
 *
 * Highlight the label(s) associated w/ the given liteKey (key) and
 * remove any highlighting on all other labels.
 * @export
 *
 * @param {string}  liteKey -The key associated with the label(s) to be highlighted.
 *
 ****************************************************************************/
pearson.brix.LabelGroup.prototype.lite = function (liteKey)
{
    this.logger_.fine('lite("' + liteKey + '") entered...');	

    // Turn off all current highlights
    var allLabels = this.lastdrawn.labelCollection;
    allLabels
        .classed("lit", false)
        // HACKALERT: swapping the display styles is just to force certain webkit and chrome
        // broswers to redraw the page when they don't want to. -lb
        .style('display','block');


    // create a filter function that will match all instances of the liteKey
    // then find the set that matches
    var matchesLabelIndex = function (d, i) { return d.key === liteKey; };

    var labelsToLite = allLabels.filter(matchesLabelIndex);

    // Highlight the labels w/ the matching key
    labelsToLite
        .classed("lit", true)
        // HACKALERT: swapping the display styles is just to force certain webkit and chrome
        // broswers to redraw the page when they don't want to.
        .style('display','inline');

    if (labelsToLite.empty())
    {
        this.logger_.warning('lite: No key "' + liteKey + '" in LabelGroup ' + this.lblgrpId_);	
    }
}; // end of LabelGroup.lite()

/* **************************************************************************
 * LabelGroup.selectedItem                                             */ /**
 *
 * Return the selected item's data in the select group.
 * @export
 *
 * @return {Object} the select group item data which is currently selected.
 *
 ****************************************************************************/
pearson.brix.LabelGroup.prototype.selectedItem = function ()
{
    var inputCollection = this.lastdrawn.widgetGroup;
    var selectedInput = inputCollection.selectAll(".lit");
    return !selectedInput.empty() ? selectedInput.datum() : null;
};

/* **************************************************************************
 * LabelGroup.setLastdrawnScaleFns2ExplicitOrDefault_                  */ /**
 *
 * Set this.lastdrawn.xScale and yScale to those stored in explicitScales
 * or to the default scale functions w/ a data domain of [0,1].
 *
 * @param {pearson.utils.ISize} cntrSize    -The pixel size of the container given to draw().
 * @private
 *
 ****************************************************************************/
pearson.brix.LabelGroup.prototype.setLastdrawnScaleFns2ExplicitOrDefault_ = function (cntrSize)
{
    if (this.explicitScales_.xScale !== null)
    {
        this.lastdrawn.xScale = this.explicitScales_.xScale;
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
}; // end of LabelGroup.setLastdrawnScaleFns2ExplicitOrDefault_()

/* **************************************************************************
 * LabelGroup.setOpacity                                               */ /**
 *
 * Set the opacity of the sketch
 * @export
 *
 * @param {number}      opacity     - opacity value to be set to (0: transparent, 1: opaque)
 * @param {number}      duration    - the duration of the transition in milliseconds
 * @param {number}      delay       - the delay before the transition starts in milliseconds
 *
 ****************************************************************************/
pearson.brix.LabelGroup.prototype.setOpacity = function (opacity, duration, delay)
{
    var xScale = this.lastdrawn.xScale;
    var yScale = this.lastdrawn.yScale;

    var allLabels = this.lastdrawn.labelCollection;

    allLabels.transition()
        .style('opacity', opacity)
        .duration(duration).delay(delay);
};

/* **************************************************************************
 * LabelGroup.getChoiceNumberToDisplayFn_                              */ /**
 *
 * Get a function which returns the string that should be prefixed to the
 * choice at a given index
 *
 * @private
 *
 ****************************************************************************/
pearson.brix.LabelGroup.prototype.getChoiceNumberToDisplayFn_ = function ()
{
    var formatIndexUsing =
    {
        "bullets": function (i)
                {
                    return "";
                },
        "latin-upper": function (i)
                {
                    return String.fromCharCode("A".charCodeAt(0) + i);
                },
        "latin-lower": function (i)
                {
                    return String.fromCharCode("a".charCodeAt(0) + i);
                },
        "numbered": function (i)
                {
                    return (i+1).toString();
                },
    };

    return (this.type in formatIndexUsing) ? formatIndexUsing[this.type]
                                           : formatIndexUsing["none"];
};


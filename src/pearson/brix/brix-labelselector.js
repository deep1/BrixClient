/* **************************************************************************
 * $Workfile:: brix-labelselector.js                                        $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the LabelSelector widget.
 *
 * The LabelSelector widget draws a collection of labels in an SVGContainer and
 * allows one of them to be selected.
 *
 * Created on       Sept 13, 2013
 * @author          Leslie Bondaryk
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.LabelSelector');

goog.require('pearson.brix.SvgBric');
goog.require('pearson.utils.IEventManager');

// Sample configuration objects for classes defined here
(function()
{
    // config for Carousel class
    var labelSelectorConfig =
        {
            id: "crsl1",
            labels: ["foo","bar","thing"],
            layout: "horizontal",
            itemMargin: {top: 4, bottom: 4, left: 2, right: 2},
            type: "numbered"
        };
});

/* **************************************************************************
 * LabelSelector                                                       */ /**
 *
 * The LabelSelector bric draws a collection of labels side by side in an
 * SVGContainer and allows one of them to be selected.
 *
 * @constructor
 * @extends {pearson.brix.SvgBric}
 * @implements {pearson.brix.ILightable}
 * @export
 *
 * @param {Object}      config          -The settings to configure this bric
 * @param {string|undefined}
 *                      config.id       -String to uniquely identify this LabelSelector.
 *                                       if undefined a unique id will be assigned.
 * @param {!Array.<string>|number}
 *                      config.labels   -The list of label strings to be presented by the Selector.
 * @param {string}      config.layout   -How the selector will layout the items (vertical or horizontal).
 * @param {{top: number, bottom: number, left: number, right: number}}
 *                      config.itemMargin
 *                                      -The margin around each label, note that the
 *                                       intra-item gap will be the sum of the left and right margin.
 * @param {string}      config.type     -'numbered', 'bullets' or null to auto number or bullet
 *
 * @param {!pearson.utils.IEventManager=}
 *                      eventManager    -The event manager to use for publishing events
 *                                       and subscribing to them.
 *
 ****************************************************************************/
pearson.brix.LabelSelector = function (config, eventManager)
{
    // call the base class constructor
    goog.base(this);

    /**
     * A unique id for this instance of the LabelSelector bric
     * @private
     * @type {string}
     */
    this.lsId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.LabelSelector);

    /**
     * Logger for this Bric
     * @private
     * @type {goog.debug.Logger}
     */
    this.logger_ = goog.debug.Logger.getLogger('pearson.brix.LabelSelector');

    /**
     * The list of label strings presented by the LabelSelector.
     * @type {!Array.<string>|number}
     */
    this.labels = config.labels;

    //this.assignMissingItemKeys_();

    /**
     * How the carousel will layout the items (vertical or horizontal).
     * @type {string}
     */
    this.layout = config.layout;

    /**
     * The margin around each item, note that the
     * intra-item gap will be the sum of the left and right margin.
     * @type {{top: number, bottom: number, left: number, right: number}}
     */
    this.itemMargin = config.itemMargin;

    /**
     * the margin around the entire label group of selectors. (in pixels)
     * @private
     * @const
     * @type {{top: number, bottom: number, left: number, right: number}}
     */
    this.selectorMargin_ = {top: 0, bottom: 0, left: 0, right: 0};

    /**
     * Should labels have numbers or bullets?
     * @type {string}
     */
    this.type = config.type;

    /**
     * The event manager to use to publish (and subscribe to) events for this widget
     * @type {!pearson.utils.IEventManager}
     */
    this.eventManager = eventManager || pearson.utils.IEventManager.dummyEventManager;

    // configuration for the labelItems LabelGroup.
    var labelConfig =
        {
            id: this.lsId_ + '_labels',
            type: this.type,
            labels: []  // will be populated by draw()
        };

    /**
     * The label group that draws the labels
     * @type {pearson.brix.LabelGroup}
     */
    this.labelItems = new pearson.brix.LabelGroup(labelConfig, this.eventManager);

    /**
     * The event id published when a label in this LabelSelector is selected.
     * @const
     * @type {string}
     */
	this.selectedEventId = pearson.brix.LabelSelector.getEventTopic('selected', this.lsId_);

    /**
     * Information about the last drawn instance of this image (from the draw method)
     * @type {Object}
     */
    this.lastdrawn =
        {
            container: null,
            size: {height: 0, width: 0},
            widgetGroup: null,
        };
}; // end of LabelSelector constructor
goog.inherits(pearson.brix.LabelSelector, pearson.brix.SvgBric);

/**
 * Prefix to use when generating ids for instances of LabelSelector.
 * @const
 * @type {string}
 */
pearson.brix.LabelSelector.autoIdPrefix = "labSel_auto_";

/* **************************************************************************
 * LabelSelector.getEventTopic (static)                                */ /**
 *
 * Get the topic that will be published for the specified event by a
 * LabelSelector bric with the specified id.
 * @export
 *
 * @param {string}  eventName       -The name of the event published by instances
 *                                   of this Bric.
 * @param {string}  instanceId      -The id of the Bric instance.
 *
 * @returns {string} The topic string for the given topic name published
 *                   by an instance of LabelSelector with the given instanceId.
 *
 * @throws {Error} If the eventName is not published by this bric or the
 *                 topic cannot be determined for any other reason.
 ****************************************************************************/
pearson.brix.LabelSelector.getEventTopic = function (eventName, instanceId)
{
    /**
     * Functions that return the topic of a published event given an id.
     * @type {Object.<string, function(string): string>}
     */
    var publishedEventTopics =
    {
        'selected': function (instanceId)
        {
            // use the selected event of the embedded LabelGroup bric
            return pearson.brix.LabelGroup.getEventTopic('selected', instanceId + '_labels');
        },
    };

    if (!(eventName in publishedEventTopics))
    {
        throw new Error("The requested event '" + eventName + "' is not published by LabelSelector brix");
    }

    return publishedEventTopics[eventName](instanceId);
};

/* **************************************************************************
 * LabelSelector.getId                                                 */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Returns the ID of this bric.
 *
 * @returns {string} The ID of this Bric.
 *
 ****************************************************************************/
pearson.brix.LabelSelector.prototype.getId = function ()
{
    return this.lsId_;
};

/* **************************************************************************
 * LabelSelector.draw                                                  */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Draw this LabelSelector in the given container.
 *
 * @param {!d3.selection}   container   -The container svg element to append
 *                                       this SvgBric element tree to.
 * @param {!pearson.utils.ISize}
 *                          size        -The size (in pixels) of the area this
 *                                       SvgBric has been allocated.
 ****************************************************************************/
pearson.brix.LabelSelector.prototype.draw = function (container, size)
{
    this.lastdrawn.container = container;
    this.lastdrawn.size = size;

    // aliases of utility functions for readability
    var attrFnVal = pearson.brix.utils.attrFnVal;

    var labelItemsLabels = this.labelItems.labels;

    // We don't support anything other than this.layout === "horizontal"

    // variables used by positionItem function below
    var itemSize = {height: 0, width: 0};

    var labelMargin = this.itemMargin;
    /** @const @type {number} */
    var SELECTOR_LEFT_MARGIN = this.selectorMargin_.left;
    /** @const @type {number} */
    var Y_PERC = 1 - d3.round(labelMargin.top / size.height, 2);

    /**
     * function used to place each item into its correct position
     * @type {function(*, number):Array.<number>}
     */
    var positionItem =
        function (d, i)
        {
            // these values are done as percentages of the height and width of the container
            // because the labelgroup is using the default 0-1 x and y scales.
            var x = SELECTOR_LEFT_MARGIN + labelMargin.left + i * (labelMargin.left + itemSize.width + labelMargin.right);
            var xPerc = x/size.width;
            return [xPerc, Y_PERC];
        };

    if (Array.isArray(this.labels))
    {
        // If labels is a set of strings, then divide the width evenly and put the label strings
        // into the labelgroup bric that will draw the labels.

        // Carve the width up for the n labels (use an arbitrarily picked constant height)
        var labelCnt = this.labels.length;
        var selectorWidth = size.width - this.selectorMargin_.left - this.selectorMargin_.right;
        // width of labels is width of container less selector margins divided by number of labels
        // then subtract label margins if there are any, and subtract 1 to show all borders: otherwise
        // the last one gets shoved off the edge of the svg window when full width and they overlap
        // each other
        var labelWidth = d3.round(selectorWidth / (labelCnt ? labelCnt : 1)) - (labelMargin.left + labelMargin.right) - 1;
        itemSize = {height: 34, width: labelWidth};

        this.labels.forEach(
                function (o, i) { labelItemsLabels[i] =
                                    {
                                        content: o,
                                        xyPos: positionItem(o, i),
                                        width: labelWidth
                                    };
                                });
    }
    else
    {
        // if labels is just a count of numerical labels, then spread them out one after the other
        // packed on the left 

        itemSize = {height: 34, width: 34};

        for (var i = this.labels - 1; i >= 0; i--)
        {
            labelItemsLabels[i] =
                {
                    content: "",
                    xyPos: positionItem("", i),
                    width: 0
                };
        }
    } // end if-else

    this.labelItems.draw(container, size);

    this.lastdrawn.widgetGroup = d3.select(this.lsId_);

}; // end of LabelSelector.draw()


/* **************************************************************************
 * LabelSelector.redraw                                                */ /**
 *
 * Redraw the labels as they may get updated text or order. It will be
 * redrawn into the same container area as it was last drawn.
 * @export
 *
 ****************************************************************************/
pearson.brix.LabelSelector.prototype.redraw = function ()
{
};

/* **************************************************************************
 * LabelSelector.selectItemAtIndex                                     */ /**
 *
 * Select the item in the carousel at the given index. If the item is
 * already selected, do nothing.
 * @export
 *
 * @param {number}  index   -the 0-based index of the item to flag as selected.
 *
 ****************************************************************************/
pearson.brix.LabelSelector.prototype.selectItemAtIndex = function (index)
{
    this.labelItems.lite(index.toString());

    this.eventManager.publish(this.selectedEventId, {index: index, selectKey: index.toString()});
};


/* **************************************************************************
 * LabelSelector.itemKeyToIndex                                        */ /**
 *
 * Find the first item in the list of items in this Carousel which has the
 * specified key and return its index. If no item has that key return null.
 * @export
 *
 * @param {string}  key     -The key of the item to find
 *
 * @return {?number} the index of the item in the list of items with the
 *          specified key.
 *
 ****************************************************************************/
pearson.brix.LabelSelector.prototype.itemKeyToIndex = function (key)
{
    var index = /** @type {number} */ (Number(key).valueOf());

    if (isNaN(index) && index >= 0 && index < this.labels.length)
    {
        return index;
    }

    return null;
};


/* **************************************************************************
 * LabelSelector.lite                                                  */ /**
 *
 * Highlight the label(s) associated w/ the given liteKey (key) and
 * remove any highlighting on all other labels.
 * @export
 *
 * @param {string}  liteKey -The key associated with the label(s) to be highlighted.
 *
 ****************************************************************************/
pearson.brix.LabelSelector.prototype.lite = function (liteKey)
{
    this.logger_.fine('lite("' + liteKey + '") entered...');	

    // todo: this works well when all the items are Images but not so well for other widget types
    this.labelItems.lite(liteKey);

}; // end of LabelSelector.lite()


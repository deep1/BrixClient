/* **************************************************************************
 * $Workfile:: widget-radiogroup.js                                         $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the RadioGroup bric.
 *
 * The RadioGroup bric draws a list of choices and allows the user to
 * select one of the choices.
 *
 * Created on       May 29, 2013
 * @author          Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.RadioGroup');

goog.require('goog.debug.Logger');

goog.require('pearson.utils.IEventManager');
goog.require('pearson.brix.HtmlBric');

// Sample configuration objects for classes defined here
(function()
{
    var Q1Choices =
    [
        {
            content: "Because as the population increases, the absolute number of births increases even though the growth rate stays constant.",
            answerKey: "correct"
        },
        {
            content: "Because the growth rate increases as the population rises.",
            answerKey: "wrong1"
        },
        {
            content: "Because the total fertility rate increases with population.",
            answerKey: "wrong2"

        },
        {
            content: "Because social behaviors change and people decide to have more children.",
            answerKey: "wrong3"
        }
    ];

    // RadioButton widget config
    var rbConfig =
        {
            id: "RG1",
            choices: Q1Choices,
            numberFormat: "latin-upper"
        };

    // RadioButtonQuestion widget config
    var rbqConfig =
    {
        id: "Q1",
        choices: Q1Choices,
        type: "randomized", //default, even if not specified
    };
});

/* **************************************************************************
 * RadioGroup                                                          */ /**
 *
 * Constructor function for RadioGroup widget instances.
 *
 * @constructor
 * @extends {pearson.brix.HtmlBric}
 * @implements {pearson.brix.IChoicePresenter}
 * @export
 *
 * @param {Object}      config          -The settings to configure this RadioGroup
 * @param {string|undefined}
 *                      config.id       -String to uniquely identify this RadioGroup.
 *                                       if undefined a unique id will be assigned.
 * @param {!Array.<!pearson.brix.KeyedAnswer>}
 *                      config.choices  -The list of choices (answers) to be presented by the RadioGroup.
 * @param {string|undefined}
 *                      config.numberFormat
 *                                      -The format for numbering the choices. default is "none"
 * @param {!pearson.utils.IEventManager=}
 *                      eventManager    -The event manager to use for publishing events
 *                                       and subscribing to them.
 *
 * @classdesc
 * The RadioGroup widget draws a list of choices and allows the user to
 * select one of the choices by selecting a radio button next to the choice.
 *
 ****************************************************************************/
pearson.brix.RadioGroup = function (config, eventManager)
{
    // call the base class constructor
    goog.base(this);

    /**
     * Logger for this Bric
     * @private
     * @type {goog.debug.Logger}
     */
    this.logger_ = goog.debug.Logger.getLogger('pearson.brix.MultipleChoiceQuestion');

    /**
     * A unique id for this instance of the radio group widget
     * @private
     * @type {string}
     */
    this.rgrpId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.RadioGroup);

    /**
     * The list of choices presented by the RadioGroup.
     * @type {!Array.<!pearson.brix.KeyedAnswer>}
     */
    this.choices = config.choices;

    /**
     * The format for numbering the choices.
     * "none", "latin-upper", "latin-lower", "number", "roman-lower-number"
     * @type {string}
     */
    this.numberFormat = config.numberFormat || "none";

    /**
     * The event manager to use to publish (and subscribe to) events for this widget
     * @type {!pearson.utils.IEventManager}
     */
    this.eventManager = eventManager || pearson.utils.IEventManager.dummyEventManager;

    /**
     * The event id published when an item in this carousel is selected.
     * @const
     * @type {string}
     */
    this.selectedEventId = pearson.brix.RadioGroup.getEventTopic('selected', this.rgrpId_);

    /**
     * The event details for this.selectedEventId events
     * @typedef {Object} SelectedEventDetails
     * @property {string} selectKey -The answerKey associated with the selected answer.
     * @property {number} index     -The index of the selected answer from the list of choices.
     */
    var SelectedEventDetails;

    /**
     * Information about the last drawn instance of this image (from the draw method)
     * @type {Object}
     */
    this.lastdrawn =
        {
            container: null,
            widgetGroup: null,
            choiceSelected: null,
        };
}; // end of RadioGroup constructor
goog.inherits(pearson.brix.RadioGroup, pearson.brix.HtmlBric);

/**
 * Prefix to use when generating ids for instances of RadioGroup.
 * @const
 * @type {string}
 */
pearson.brix.RadioGroup.autoIdPrefix = "rg_auto_";

/* **************************************************************************
 * RadioGroup.getEventTopic (static)                                   */ /**
 *
 * Get the topic that will be published for the specified event by a
 * RadioGroup bric with the specified id.
 * @export
 *
 * @param {string}  eventName       -The name of the event published by instances
 *                                   of this Bric.
 * @param {string}  instanceId      -The id of the Bric instance.
 *
 * @returns {string} The topic string for the given topic name published
 *                   by an instance of RadioGroup with the given instanceId.
 *
 * @throws {Error} If the eventName is not published by this bric or the
 *                 topic cannot be determined for any other reason.
 ****************************************************************************/
pearson.brix.RadioGroup.getEventTopic = function (eventName, instanceId)
{
    /**
     * Functions that return the topic of a published event given an id.
     * @type {Object.<string, function(string): string>}
     */
    var publishedEventTopics =
    {
        'selected': function (instanceId)
        {
            return instanceId + '_itemSelected';
        },
    };

    if (!(eventName in publishedEventTopics))
    {
        throw new Error("The requested event '" + eventName + "' is not published by RadioGroup brix");
    }

    return publishedEventTopics[eventName](instanceId);
};

/* **************************************************************************
 * RadioGroup.getId                                                    */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Returns the ID of this bric.
 *
 * @returns {string} The ID of this Bric.
 *
 ****************************************************************************/
pearson.brix.RadioGroup.prototype.getId = function ()
{
    return this.rgrpId_;
};

/* **************************************************************************
 * RadioGroup.draw                                                     */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Draw this RadioGroup in the given container.
 *
 * @param {!d3.selection}   container   -The container html element to append
 *                                       this HtmlBric element tree to.
 *
 ****************************************************************************/
pearson.brix.RadioGroup.prototype.draw = function (container)
{
    this.lastdrawn.container = container;

    var that = this;

    // make a div to hold the radio group
    var widgetGroup = container.append("div")
        .attr("class", "brixRadioGroup")
        .attr("id", this.rgrpId_);

    // We will use a table to provide structure for the radio group
    // and put each answer in its own row of the table.
    var table = widgetGroup.append("table")
        .attr("class", "questionTable");

    // create the table body to contain the answer rows
    var tbody = table.append("tbody");

    // Create a group for each item then draw the item in that group
    var ansRows = tbody.selectAll("tr").data(this.choices);
    ansRows.enter().append("tr");

    /** @type {d3DataFunc} */
    var getButtonId = function (d, i) {return that.rgrpId_ + "_btn" + i;};

    var choiceIndex = this.getChoiceNumberToDisplayFn_();
    var choiceSeparator = (this.numberFormat != 'none') ? ')' : '';

    var buttonCell = ansRows.append("td");
    buttonCell
        .append("input")
            .attr("id", getButtonId)
            .attr("type", "radio")
            .attr("name", this.rgrpId_)
            .attr("value", function (d) {return d.answerKey;});

    var labelCell = ansRows.append("td");

    var that_ = this;
    labelCell
        .append("label")
            .attr("for", getButtonId)
            .html(function (d, i)
                  {
                      var choiceLabel = '<span class="choiceLabel">' +
                                        choiceIndex(i) + choiceSeparator + '</span> ';
                      return  choiceLabel + d.content;
                  });

    var choiceInputs = widgetGroup.selectAll("input[name='" + this.rgrpId_ + "']");
    choiceInputs
        .on("change", function (d, i)
                {
                    that_.logger_.finer('Radio selected');
                    that.eventManager.publish(that.selectedEventId, {selectKey: d.answerKey, index: i});
                });

    this.lastdrawn.widgetGroup = widgetGroup;

}; // end of RadioGroup.draw()

/* **************************************************************************
 * RadioGroup.selectedItem                                             */ /**
 *
 * Return the selected choice in the radio group and its data,
 * or null if nothing has been selected. Used in multiple choice questions.
 * Note that this does not return the index of the checked item.
 * @export
 *
 * @return {Object} the radio group data corresponding to the choice
 * which is currently selected or null.
 *
 ****************************************************************************/
pearson.brix.RadioGroup.prototype.selectedItem = function ()
{
    var selectedInputSelector = "input[name='" + this.rgrpId_ + "']:checked";
    var selectedInput = this.lastdrawn.widgetGroup.select(selectedInputSelector);
    return !selectedInput.empty() ? selectedInput.datum() : null;
};

/* **************************************************************************
 * RadioGroup.selectedChoice                                           */ /**
 *
 * Return the choice element corresponding to the current selection in the
 * presenter or null if nothing has been selected.
 * Note that this does not return the index of the selected choice.
 *
 * @return {pearson.brix.KeyedAnswer} the element from the configuration
 * choice array corresponding to the choice which is currently selected or null.
 *
 ****************************************************************************/
pearson.brix.RadioGroup.prototype.selectedChoice = function ()
{
    return /**@type {pearson.brix.KeyedAnswer}*/ (this.selectedItem());
};

/* **************************************************************************
 * RadioGroup.getChoiceByKey                                           */ /**
 *
 * Return the choice element corresponding to the given key or null if the
 * key doesn't match any choice.
 *
 * @return {pearson.brix.KeyedAnswer} the element from the configuration
 * choice array corresponding to the given key, or null.
 *
 ****************************************************************************/
pearson.brix.RadioGroup.prototype.getChoiceByKey = function (key)
{
    var index = this.itemKeyToIndex(key);

    if (index === null)
    {
        return null;
    }

    return this.choices[index];
};

/* **************************************************************************
 * RadioGroup.selectChoice                                             */ /**
 *
 * Select the choice in the presenter represented by the given key or index.
 * If the choice is already selected, do nothing.
 *
 * @param {string|number}   choiceSelector  -Either the key (if a string) or
 *                                           the index (if a number) of the
 *                                           choice to be selected

 ****************************************************************************/
pearson.brix.RadioGroup.prototype.selectChoice = function (choiceSelector)
{
    var index;
    if (typeof choiceSelector === 'string')
    {
        index = this.itemKeyToIndex(choiceSelector);
        if (index === null)
        {
            return;
        }
    }
    else
    {
        index = choiceSelector;
    }

    this.selectItemAtIndex(index);
};

/* **************************************************************************
 * RadioGroup.flagChoice                                               */ /**
 *
 * Flag the choice with the given key in some way to make it stand out.
 * This is currently used to flag the correct answer after a question is answered.
 *
 * @param {string}  key     -The key that identifies the choice to be flagged
 *
 ****************************************************************************/
pearson.brix.RadioGroup.prototype.flagChoice = function (key)
{
    this.logger_.fine('flagChoice key="' + key + '"');

    // find the radio button in the group to be flagged
    var index = this.itemKeyToIndex(key);
    var choiceInputs = this.lastdrawn.widgetGroup.selectAll("input");
    var selectedInput = d3.select(choiceInputs[0][index]);
    var inputParent = d3.select(selectedInput.node().parentNode);

    // remove the radio button and replace it w/ an 'i' element
    // with a class that puts in a fontawesome glyph
    // the glyph swap is done in CSS but the class name must be right
    selectedInput.remove();
    inputParent.append('i').attr('class', 'icon-ok-sign');
};

/* **************************************************************************
 * RadioGroup.selectItemAtIndex                                        */ /**
 *
 * Select the choice in the radio group at the given index. If the choice is
 * already selected, do nothing.
 * @export
 *
 * @param {number}  index   -the 0-based index of the choice to mark as selected.
 *
 ****************************************************************************/
pearson.brix.RadioGroup.prototype.selectItemAtIndex = function (index)
{
    var choiceInputs = this.lastdrawn.widgetGroup.selectAll("input");
    var selectedInput = choiceInputs[0][index];

    if (selectedInput.checked)
    {
        return;
    }

    // choice at index is not selected, so select it and publish selected event
    selectedInput.checked = true;

    var d = /** @type {!pearson.brix.KeyedAnswer} */ (d3.select(selectedInput).datum());

    this.eventManager.publish(this.selectedEventId, {selectKey: d.answerKey, index: index});
};

/* **************************************************************************
 * RadioGroup.itemKeyToIndex                                           */ /**
 *
 * Find the first item (choice) in the list of items in this RadioGroup which
 * has the specified answer key and return its index. If no item has that key
 * return null.
 * @export
 *
 * @param {string}  key     -The key of the item (choice) to find
 *
 * @return {?number} the index of the item in the list of items with the
 *          specified key.
 *
 ****************************************************************************/
pearson.brix.RadioGroup.prototype.itemKeyToIndex = function (key)
{
    for (var i = this.choices.length - 1; i >= 0; --i)
    {
        if (this.choices[i].answerKey === key)
        {
            return i;
        }
    }

    return null;
};

/* **************************************************************************
 * RadioGroup.getChoiceNumberToDisplayFn_                              */ /**
 *
 * Get a function which returns the string that should be prefixed to the
 * choice at a given index
 *
 * @private
 *
 ****************************************************************************/
pearson.brix.RadioGroup.prototype.getChoiceNumberToDisplayFn_ = function ()
{
    var formatIndexUsing =
    {
        "none": function (i)
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
        "number": function (i)
                {
                    return (i+1).toString();
                },
    };

    return (this.numberFormat in formatIndexUsing) ? formatIndexUsing[this.numberFormat]
                                                   : formatIndexUsing["none"];
};


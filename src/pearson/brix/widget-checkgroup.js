/* **************************************************************************
 * $Workfile:: widget-checkgroup.js                                         $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the CheckGroup bric.
 *
 * The CheckGroup bric draws a list of choices and allows the user to
 * select one or more choices.
 * It is analogous to radio group, with the difference of using checkbox
 * and allowing multiple selections. Also it is possible to set the max
 * number of selections.
 *
 * Created on       July 29, 2013
 * @author          Young-Suk Ahn
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.CheckGroup');

goog.require('pearson.brix.HtmlBric');
goog.require('pearson.utils.IEventManager');

// Sample configuration objects for classes defined here
(function()
{
    var Q1Choices =
    [
        {
            content: "Because as the population increases, the absolute number of births increases even though the growth rate stays constant.",
            response: "Growth rate stays constant.",
            answerKey: "correct"
        },
        {
            content: "Because the growth rate increases as the population rises.",
            response: "Does the growth rate change with population size?",
            answerKey: "wrong1"
        },
        {
            content: "Because the total fertility rate increases with population.",
            response: "Does the fertility rate change with population size?",
            answerKey: "wrong2"

        },
        {
            content: "Because social behaviors change and people decide to have more children.",
            response: "This might happen but is it something is necessarily occurs?",
            answerKey: "wrong3"
        }
    ];

    // CheckButton widget config
    var cbConfig =
        {
            id: "RG1",
            choices: Q1Choices,
            numberFormat: "latin-upper"
        };

    // CheckButtonQuestion widget config
    var cbqConfig =
    {
        id: "Q1",
        choices: Q1Choices,
        type: "randomized", //default, even if not specified
    };
});

/**
 * Answers are presented to users by certain widgets that allow the user to
 * select one (or more of them).
 *
 * @typedef {Object} pearson.brix.Answer
 * @property {string}   content     -The content of the answer, which presents the
 *                                   meaning of the answer.
 * @property {string}   response    -The response is presented to the user when
 *                                   they choose this answer.
 * @property {string}   answerKey   -This is the unique ID that will be returned
 *                                   to the scoring engine to identify that the
 *                                   user has chosen this answer.
 *
 * @todo: the content currently must be text (a string) however, we are likely
 * to want to make the content be any widget.
 */
pearson.brix.Answer;


/* **************************************************************************
 * CheckGroup                                                          */ /**
 *
 * Constructor function for CheckGroup bric instances.
 *
 * @constructor
 * @extends {pearson.brix.HtmlBric}
 * @export
 *
 * @param {Object}      config          -The settings to configure this CheckGroup
 * @param {string|undefined}
 *                      config.id       -String to uniquely identify this CheckGroup.
 *                                       if undefined a unique id will be assigned.
 * @param {!Array.<!pearson.brix.Answer>}
 *                      config.choices  -The list of choices (answers) to be presented by the CheckGroup.
 * @param {number}      config.maxSelects
 *                                      -The maximum number of choices that can be selected
 *
 * @param {string|undefined}
 *                      config.numberFormat
 *                                      -The format for numbering the choices. default is "none"
 * @param {!pearson.utils.IEventManager=}
 *                      eventManager    -The event manager to use for publishing events
 *                                       and subscribing to them.
 *
 * @classdesc
 * The CheckGroup bric draws a list of choices and allows the user to
 * select one or more of the choices by checking a box next to the desired
 * choices.
 *
 ****************************************************************************/
pearson.brix.CheckGroup = function (config, eventManager)
{
    // call the base class constructor
    goog.base(this);

    /**
     * A unique id for this instance of the Check group widget
     * @private
     * @type {string}
     */
    this.cgId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.CheckGroup);

    /**
     * The maximum number of allowed selects.
     * @type {number}
     */
    this.maxSelects = config.maxSelects;

    /**
     * The list of choices presented by the CheckGroup.
     * @type {!Array.<!pearson.brix.Answer>}
     */
    this.choices = config.choices;

    /**
     * The format for numbering the choices.
     * "none", "latin-upper", "latin-lower", "number", "roman-lower-number"
     * @type {string}
     */
    this.numberFormat = config.numberFormat || 'none';

    /**
     * The event manager to use to publish (and subscribe to) events for this widget
     * @type {!pearson.utils.IEventManager}
     */
    this.eventManager = eventManager || pearson.utils.IEventManager.dummyEventManager;

    /**
     * The event id published when an item in this CheckGroup is selected.
     * @const
     * @type {string}
     */
    this.selectedEventId = pearson.brix.CheckGroup.getEventTopic('selected', this.cgId_);

    /**
     * This event id is published when the user tries to select more boxes than
     * are allowed by the maxSelects setting
     * @const
     * @type {string}
     */
    this.exceedSelectionEventId = pearson.brix.CheckGroup.getEventTopic('too-many-selections', this.cgId_);

    /**
     * The event details for this.selectedEventId events
     * @typedef {Object} SelectedEventDetails
     * @property {boolean}  isSelected  -true if the selectKey/index was selected or false
     *                                   if it was unselected.
     * @property {string}   key         -The answerKey associated with the changed selection.
     * @property {number}   index       -The index of the changed selection in the list of choices.
     * @property {number}   numSelected -The current total number of selected choices.
     * @property {string|undefined}
     *                      selectKey   -(deprecated) The answerKey associated with the selected answer.
     * @property {string|undefined}
     *                      unselectKey -(deprecated) The answerKey associated with the unselected answer.
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
}; // end of CheckGroup constructor
goog.inherits(pearson.brix.CheckGroup, pearson.brix.HtmlBric);

/**
 * Prefix to use when generating ids for instances of CheckGroup.
 * @const
 * @type {string}
 */
pearson.brix.CheckGroup.autoIdPrefix = "cg_auto_";

/* **************************************************************************
 * CheckGroup.getEventTopic (static)                                   */ /**
 *
 * Get the topic that will be published for the specified event by a
 * CheckGroup bric with the specified id.
 * @export
 *
 * @param {string}  eventName       -The name of the event published by instances
 *                                   of this Bric.
 * @param {string}  instanceId      -The id of the Bric instance.
 *
 * @returns {string} The topic string for the given topic name published
 *                   by an instance of CheckGroup with the given instanceId.
 *
 * @throws {Error} If the eventName is not published by this bric or the
 *                 topic cannot be determined for any other reason.
 ****************************************************************************/
pearson.brix.CheckGroup.getEventTopic = function (eventName, instanceId)
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
        'too-many-selections': function (instanceId)
        {
            return instanceId + '_exceedSelection';
        },
    };

    if (!(eventName in publishedEventTopics))
    {
        throw new Error("The requested event '" + eventName + "' is not published by CheckGroup brix");
    }

    return publishedEventTopics[eventName](instanceId);
};

/* **************************************************************************
 * CheckGroup.getId                                                    */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Returns the ID of this bric.
 *
 * @returns {string} The ID of this Bric.
 *
 ****************************************************************************/
pearson.brix.CheckGroup.prototype.getId = function ()
{
    return this.cgId_;
};

/* **************************************************************************
 * CheckGroup.draw                                                     */ /**
 *
 * Draw this CheckGroup in the given container.
 *
 * @param {!d3.selection}
 *                  container   -The container html element to append the Check
 *                               group element tree to.
 *
 ****************************************************************************/
pearson.brix.CheckGroup.prototype.draw = function (container)
{
    this.lastdrawn.container = container;

    var that = this;

    // make a div to hold the Check group
    var widgetGroup = container.append("div")
        .attr("class", "brixCheckGroup")
        .attr("id", this.cgId_);

    // We will use a table to provide structure for the Check group
    // and put each answer in its own row of the table.
    var table = widgetGroup.append("table")
        .attr("class", "questionTable");

    // create the table body to contain the answer rows
    var tbody = table.append("tbody");

    // Create a group for each item then draw the item in that group
    var ansRows = tbody.selectAll("tr").data(this.choices);
    ansRows.enter().append("tr");

    var getButtonId = function (d, i) {return that.id + "_btn" + i;};


    var choiceIndex = this.getChoiceNumberToDisplayFn_();
    var choiceSeparator = (this.numberFormat != 'none') ? ')' : ' ';

    var buttonCell = ansRows.append("td");

    buttonCell
        .append("input")
            .attr("id", getButtonId)
            .attr("type", "checkbox")
            .attr("name", this.cgId_)
            .attr("value", function (d) {return d.answerKey;});

    var labelCell = ansRows.append("td");

    labelCell
        .append("label")
            .attr("for", getButtonId)
            .html(function (d, i)
                  {
                      var choiceLabel = '<span class="choiceLabel">' +
                                        choiceIndex(i) + choiceSeparator + '</span> ';
                      return  choiceLabel + d.content;
                  });

    var choiceInputs = widgetGroup.selectAll("input[name='" + this.cgId_ + "']");

    // The reason I am using 'click' instead of 'chance' event is because preventDefault() work
    // on 'change' event and not on 'change'
    // * interestingly 'change' is triggered prior to 'click'
    choiceInputs
        .on('click', goog.bind(this.handleInternalCheckboxClick_, this));

    /*
    choiceInputs
        .on("change", function (d)
                {
                    var selInputs = that.selectedInputs_()[0];
                    var numSelected = (selInputs) ? selInputs.length : 0;
                    if (numSelected <= that.maxSelects) {
                        that.eventManager.publish(that.selectedEventId, {selectKey: d.answerKey, numSelected:numSelected});
                    }
                });
    */

    this.lastdrawn.widgetGroup = widgetGroup;

}; // end of CheckGroup.draw()

/* **************************************************************************
 * CheckGroup.handleInternalCheckboxClick_                             */ /**
 *
 * The d3 click event handler on the checkbox elements representing the
 * choices.
 *
 * @param {!pearson.brix.Answer} d  -The choice associated with the clicked
 *                                   checkbox.
 * @param {number}               i  -The index of the choice associated with
 *                                   the clicked checkbox.
 *
 ****************************************************************************/
pearson.brix.CheckGroup.prototype.handleInternalCheckboxClick_ = function (d, i)
{
    var selection = this.getSelectionState();
    var numSelected = selection.reduce(function (n, sel) { if (sel) {++n;} return n; }, 0);

    var selectedEventDetails =
        {
            isSelected: selection[i],
            key: d.answerKey,
            index: i,
            numSelected: selection.reduce(function (numSelected, isSelected) {if (isSelected) {++numSelected;} return numSelected;}, 0)
        };

    // Check if with this new selection, the max number of selection allowed has been exceeded
    if (selectedEventDetails.numSelected > this.maxSelects)
    {
        // This selection exceeded the max number of selections allowed
        this.eventManager.publish(this.exceedSelectionEventId, {max: this.maxSelects});

        // Don't allow the selection
        d3.event.preventDefault();

        return;
    }

    // Add the appropriate deprecated property for now
    if (selectedEventDetails.isSelected)
    {
        selectedEventDetails.selectKey = selectedEventDetails.key;
    }
    else
    {
        selectedEventDetails.unselectKey = selectedEventDetails.key;
    }

    this.eventManager.publish(this.selectedEventId, selectedEventDetails);
};

/* **************************************************************************
 * CheckGroup.selectedInputs_                                          */ /**
 *
 * Return the selected choice input nodes in the Check group.
 * @private
 *
 * @return {!d3.selection} the list of selected input nodes.
 *
 ****************************************************************************/
pearson.brix.CheckGroup.prototype.selectedInputs_ = function ()
{
    var selectedInputsSelector = "input[name='" + this.cgId_ + "']:checked";
    return this.lastdrawn.widgetGroup.selectAll(selectedInputsSelector);
};

/* **************************************************************************
 * CheckGroup.getSelectionState                                        */ /**
 *
 * Get an array of booleans representing each choice in this CheckGroup,
 * true if that choice is selected, false if that choice isn't selected.
 *
 * @returns {Array.<boolean>} Array of boolean's represented the selected
 * state of the choices in this CheckGroup.
 *
 ****************************************************************************/
pearson.brix.CheckGroup.prototype.getSelectionState = function ()
{
    var inputsSelector = "input[name='" + this.cgId_ + "']";
    var inputs = this.lastdrawn.widgetGroup.selectAll(inputsSelector);
    
    // I'm going to assume that the selection is in the correct order
    var selection = [];
    inputs.each(function ()
            {
                selection.push(this.checked);
            });

    return selection;
};

/* **************************************************************************
 * CheckGroup.selectedItems                                            */ /**
 *
 * Return the selected choice(s) in the Check group or null if nothing has
 * been selected.
 *
 * @return {Array.<pearson.brix.Answer>} the Check group choice(s) which
 *      is/are currently selected or null if no choices are selected.
 *
 * @todo Why return null for no selected choices instead of just an empty array?
 *
 ****************************************************************************/
pearson.brix.CheckGroup.prototype.selectedItems = function ()
{
    var selectedInputs = this.selectedInputs_();
    return !selectedInputs.empty() ? /**@type {!Array.<pearson.brix.Answer>}*/ (selectedInputs.data()) : null;
};

/* **************************************************************************
 * CheckGroup.selectItemAtIndex                                        */ /**
 *
 * Select the choice in the Check group at the given index. If the choice is
 * already selected, do nothing.
 *
 * @param {number}  index   -the 0-based index of the choice to mark as selected.
 *
 ****************************************************************************/
pearson.brix.CheckGroup.prototype.selectItemAtIndex = function (index)
{
    // Guard against exceeding max number of selects
    var selInputs = this.selectedInputs_()[0];
    var numSelected = (selInputs) ? selInputs.length : 0;
    if (numSelected >= this.maxSelects)
    {
        this.eventManager.publish(this.exceedSelectionEventId, {max: this.maxSelects});
        return;
    }

    var choiceInputs = this.lastdrawn.widgetGroup.selectAll("input");
    var selectedInput = choiceInputs[0][index];

    if (selectedInput.checked)
    {
        return;
    }

    // choice at index is not selected, so select it and publish selected event
    selectedInput.checked = true;

    // @todo: serialize all selected keys and send as array
    /**@type {pearson.brix.Answer}*/
    var d = d3.select(selectedInput).datum();
    this.eventManager.publish(this.selectedEventId,
                              {selectKey: d.answerKey, numSelected: numSelected});
};

/* **************************************************************************
 * CheckGroup.unselectItemAtIndex                                      */ /**
 *
 * Unselect the choice in this check group at the given index. If the choice is
 * already unselected, do nothing.
 *
 * @param {number}  index   -the 0-based index of the choice to mark as unselected.
 *
 ****************************************************************************/
pearson.brix.CheckGroup.prototype.unselectItemAtIndex = function (index)
{
    var choiceInputs = this.lastdrawn.widgetGroup.selectAll("input");
    var selectedInput = choiceInputs[0][index];

    if (!selectedInput.checked)
    {
        return;
    }

    // choice at index is not selected, so select it and publish selected event
    selectedInput.checked = false;

    // @todo: Maybe changing to 'changedEventId' to keep consistent with HTML and also
    //        the semantics supports checked as well as unchecked
    /**@type {pearson.brix.Answer}*/
    var d = d3.select(selectedInput).datum();
    this.eventManager.publish(this.selectedEventId, {unselectKey: d.answerKey});
};

/* **************************************************************************
 * CheckGroup.getChoiceNumberToDisplayFn_                              */ /**
 *
 * Get a function which returns the string that should be prefixed to the
 * choice at a given index
 * @private
 *
 ****************************************************************************/
pearson.brix.CheckGroup.prototype.getChoiceNumberToDisplayFn_ = function ()
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


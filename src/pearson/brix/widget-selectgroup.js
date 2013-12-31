/* **************************************************************************
 * $Workfile:: widget-selectgroup.js                                        $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the SelectGroup widget.
 *
 * The SelectGroup widget draws a list of choices and allows the user to
 * select one of the choices.
 *
 * Created on       June 12, 2013
 * @author          Leslie Bondaryk
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.SelectGroup');

goog.require('pearson.utils.IEventManager');
goog.require('pearson.brix.HtmlBric');

// Sample configuration objects for classes defined here
(function()
{
    var Q1Choices =
    [
        {
            content: "Dewatering and hydrofracking",
            answerKey: "correct",
            key: "litemeUp"
        },
        {
            content: "Dewatering and mining",
            response: "Mining is a term generally used to apply to removing solids from the ground.",
            answerKey: "wrong1"
        },
        {
            content: "Hydrofracking and gas distillation",
            response: "Distillation refers to the refinement of gas, not extraction.",
            answerKey: "wrong2"

        },
        {
            content: "Dewatering and coalbed methane leaching",
            response: "Coalbed leaching is an older technique.",
            answerKey: "wrong3"
        }
    ];

    // Select widget config
    var selConfig =
        {
            //id: "SEL1",
            choices: Q1Choices,
        };

    // SelectQuestion widget config
    var sqConfig =
    {
        id: "Q1",
        question: "<span id='selTarget'></span> are two examples of new tchniques being used to extract natural gas.",
        choices: Q1Choices,
        type: "randomized", //default, even if not specified
    };
});

/**
 * choices are presented through dropdown widgets that allow the user to
 * select one (or more of them). Nominally they need content.  But if they are
 * configured as a question they need an answerKey to go with each choice.  As with
 * other brix, they can optionally have an associative highlighting key.
 *
 * @typedef {Object} pearson.brix.Answer
 * @property {string}   content     -The content of the answer, which presents the
 *                                   meaning of the answer.
 * @property {string}   response    -The response is presented to the user when
 *                                   they choose/submit this answer.
 * @property {string}   answerKey   -This is the unique ID that will be returned
 *                                   to the scoring engine to identify that the
 *                                   user has chosen this answer
 * @property {string|undefined} key         -highlighting key saying which to select and which
 *                                   other things to select on the page.
 *
 * @todo: response isn't really used here, it comes from the answer database.
 * @todo: One important use of select is as a quiz-me version of a labeled diagram
 * or image.  We will need to layer these on top of SVG objects in SVG pixel positions.
 */
pearson.brix.Answer;


/* **************************************************************************
 * SelectGroup                                                         */ /**
 *
 * The SelectGroup widget draws a list of choices and allows the user to
 * select one of the choices.
 *
 * @constructor
 * @extends {pearson.brix.HtmlBric}
 * @implements {pearson.brix.IChoicePresenter}
 * @export
 *
 * @param {Object}      config          -The settings to configure this SelectGroup
 * @param {string|undefined}
 *                      config.id       -String to uniquely identify this SelectGroup.
 *                                       if undefined a unique id will be assigned.
 * @param {!Array.<!pearson.brix.Answer>}
 *                      config.choices  -The list of choices to be presented by the SelectGroup.
 *
 * @param {boolean}     config.question -A flag indicating whether the bric is
 *                                      to be configured as a question to the student
 * @param {!pearson.utils.IEventManager=}
 *                      eventManager    -The event manager to use for publishing events
 *                                       and subscribing to them.
 *
 * @note This class needs to be reviewed and refactored! I am making some cursory
 *       changes to allow it to continue to work as a presenter only because there
 *       are some demo pages which use it. Currently RadioGroup is the only
 *       'real' IChoicePresenter. -mjl 11/13/2013
 ****************************************************************************/
pearson.brix.SelectGroup = function (config, eventManager)
{
    // call the base class constructor
    goog.base(this);

    /**
     * A logger to help debugging 
     * @private
     * @type {goog.debug.Logger}
     */
    this.logger_ = goog.debug.Logger.getLogger('pearson.brix.SelectGroup');

    /**
     * A unique id for this instance of the radio group widget
     * @type {string}
     */
    this.sgId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.SelectGroup);

    /**
     * The list of choices presented by the RadioGroup.
     * @type {!Array.<!pearson.brix.Answer>}
     */
    this.choices = config.choices;

    this.question = config.question;

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
    this.selectedEventId = pearson.brix.SelectGroup.getEventTopic('selected', this.sgId_);

    /**
     * The event details for this.selectedEventId events
     * @typedef {Object} SelectedEventDetails
     * @property {string} selectKey -The answerKey associated with the selected answer.
     * @property {number} index     -The index of the selected answer from the list of choices.
     */
    var SelectedEventDetails;

    /**
     * Information about the last drawn instance of this button (from the draw method)
     * @type {Object}
     */
    this.lastdrawn =
        {
            /** @type {d3.selection} */ container: null,
            widgetGroup: null,
            options: null,
            choiceSelected: null,
        };

    this.logger_.config('SelectGroup dropdown with id:' + this.sgId_ + ' created.');

}; // end of SelectGroup constructor
goog.inherits(pearson.brix.SelectGroup, pearson.brix.HtmlBric);

/**
 * Prefix to use when generating ids for instances of SelectGroup.
 * @const
 * @type {string}
 */
pearson.brix.SelectGroup.autoIdPrefix = "sg_auto_";

/* **************************************************************************
 * SelectGroup.getEventTopic (static)                                  */ /**
 *
 * Get the topic that will be published for the specified event by a
 * SelectGroup bric with the specified id.
 * @export
 *
 * @param {string}  eventName       -The name of the event published by instances
 *                                   of this Bric.
 * @param {string}  instanceId      -The id of the Bric instance.
 *
 * @returns {string} The topic string for the given topic name published
 *                   by an instance of SelectGroup with the given instanceId.
 *
 * @throws {Error} If the eventName is not published by this bric or the
 *                 topic cannot be determined for any other reason.
 ****************************************************************************/
pearson.brix.SelectGroup.getEventTopic = function (eventName, instanceId)
{
    /**
     * Functions that return the topic of a published event given an id.
     * @type {Object.<string, function(string): string>}
     */
    var publishedEventTopics =
    {
        'selected': function (instanceId)
        {
            return instanceId + '_option';
        },
    };

    if (!(eventName in publishedEventTopics))
    {
        throw new Error("The requested event '" + eventName + "' is not published by SelectGroup brix");
    }

    return publishedEventTopics[eventName](instanceId);
};

/* **************************************************************************
 * SelectGroup.getId                                                   */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Returns the ID of this bric.
 *
 * @returns {string} The ID of this Bric.
 *
 ****************************************************************************/
pearson.brix.SelectGroup.prototype.getId = function ()
{
    return this.sgId_;
};

/* **************************************************************************
 * SelectGroup.draw                                                    */ /**
 *
 * Draw this SelectGroup in the given container.
 *
 * @param {!d3.selection}
 *                  container   -The container html element to which we
 *                              append the select element tree.
 *
 ****************************************************************************/
pearson.brix.SelectGroup.prototype.draw = function (container)
{
    this.lastdrawn.container = container;

    var that = this;

    // make a span to hold the select group
    // these are often used inline in sentences, so we don't want a block element.
    var widgetGroup = container.append("span")
        .attr("class", "widgetSelectGroup")
        .attr("id", this.sgId_);

    this.lastdrawn.widgetGroup = widgetGroup;

    var selectTag = widgetGroup.append("select")
                        .attr("name", this.sgId_)
                        //set the width to auto so it sizes to content
                        .style("width","auto");

    // Create the options from the choices data
    var options = selectTag.selectAll("option").data(this.choices);

    options.enter().append("option")
            //use html to populate the options so any markup is retained
            .html(function(d) { return d.content; });

    // autokey entries which have no key with the data index
    options.each(function (d, i) {
                    // if there is no key assigned, make one from the index
                    d.key = 'key' in d ? d.key : i.toString();
                    });

    options.attr("value", function (d) { return d.key; });

    selectTag.on('change',
                function ()
                {
                    var ed =
                        {
                            // the selected key is in the value, so figure out
                            // which entry you picked, and return it's value, that
                            // is the same as the key.  There's probably a more elegant
                            // way to do this with the datum associated, but it escaped me -lb
                            selectKey: options[0][this.selectedIndex].value,
                            index: this.selectedIndex
                        };
                    that.logger_.finer('publish ' + that.selectedEventId + ' event; selectKey:"' + ed.selectKey + '" index: ' + ed.index);
                    that.eventManager.publish(that.selectedEventId, ed);
                });

    //when the page first loads, we want the selectedIndex to be -1 for unanswered questions
    //which causes the dropdown to display a blank. This means that any choice,
    //even the first one in the list, represents a change.  Prolly want to do
    //this differently once we've implemented state. -lb

    if (this.question === true)
    {
        selectTag[0][0].selectedIndex = -1;
    }

    this.lastdrawn.options = options;


}; // end of SelectGroup.draw()

/* **************************************************************************
 * SelectGroup.lite                                                     */ /**
 *
 * Highlight the label(s) associated w/ the given liteKey (key) and
 * remove any highlighting on all other labels.
 *
 * @param {string}  liteKey -The key associated with the elements to be highlighted.
 *
 ****************************************************************************/
pearson.brix.SelectGroup.prototype.lite = function (liteKey)
{
    this.logger_.fine('lite("' + liteKey + '") entered...');

    //highlighting a dropdown means both selecting an element and
    //giving focus to the dropdown to call attention to it's possible
    //selection change
    this.lastdrawn.widgetGroup.select("select")[0][0].focus();
    var allOptions = this.lastdrawn.options;
    // turn off all selections
    allOptions.property("selected", false);

    // create a filter function that will match all instances of the liteKey
    var matchesKey = function (d, i) { return d.key === liteKey.toString(); };
    // then find the set that matches
    var pickMe = allOptions.filter(matchesKey);

    // select it the matching options
    pickMe.property("selected", true);


    if (pickMe.empty())
    {
        this.logger_.warning('lite: No key "' + liteKey + '" in SelectGroup ' + this.sgId_);
    }
}; // end of LabelGroup.lite()


/* **************************************************************************
 * SelectGroup.selectedItem                                            */ /**
 *
 * Return the selected item's data in the select group.
 *
 * @return {Object} the select group item data which is currently selected.
 *
 ****************************************************************************/
pearson.brix.SelectGroup.prototype.selectedItem = function ()
{
    var inputCollection = this.lastdrawn.widgetGroup.select("select");
    // selectedIndex is 0-based, but nth child is 1-based, so add 1
    var index = inputCollection[0][0].selectedIndex + 1;
    var selectedInput = inputCollection.selectAll(":nth-child(" + index + ")");

    return !selectedInput.empty() ? selectedInput.datum() : null;
};

/* **************************************************************************
 * SelectGroup.selectItemAtIndex                                       */ /**
 *
 * Select the choice in this select group at the given index. If the choice is
 * already selected, do nothing.
 * @export
 *
 * @param {number}  index   -the 0-based index of the choice to mark as selected.
 *
 ****************************************************************************/
pearson.brix.SelectGroup.prototype.selectItemAtIndex = function (index)
{
    this.logger_.fine('id: ' + this.getId() + ': selectItemAtIndex(' + index + ') entered...');

    var options = this.lastdrawn.widgetGroup.selectAll("select>option");
    var selectedOption = options[0][index];

    if (selectedOption.selected)
    {
        return;
    }

    // choice at index is not selected, so select it and publish selected event
    selectedOption.selected = true;

    var d = /** @type {!pearson.brix.Answer} */ (d3.select(selectedOption).datum());
    this.eventManager.publish(this.selectedEventId, {selectKey: d.answerKey, index: index});
};

/* **************************************************************************
 * SelectGroup.itemKeyToIndex                                          */ /**
 *
 * Find the first item (choice) in the list of items in this SelectGroup which
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
pearson.brix.SelectGroup.prototype.itemKeyToIndex = function (key)
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
 * SelectGroup.selectedChoice                                          */ /**
 *
 * Return the choice element corresponding to the current selection in the
 * presenter or null if nothing has been selected.
 * Note that this does not return the index of the selected choice.
 *
 * @return {pearson.brix.KeyedAnswer} the element from the configuration
 * choice array corresponding to the choice which is currently selected or null.
 *
 ****************************************************************************/
pearson.brix.SelectGroup.prototype.selectedChoice = function ()
{
    return this.selectedItem();
};

/* **************************************************************************
 * SelectGroup.getChoiceByKey                                          */ /**
 *
 * Return the choice element corresponding to the given key or null if the
 * key doesn't match any choice.
 *
 * @return {pearson.brix.KeyedAnswer} the element from the configuration
 * choice array corresponding to the given key, or null.
 *
 ****************************************************************************/
pearson.brix.SelectGroup.prototype.getChoiceByKey = function (key)
{
    var index = this.itemKeyToIndex(key);

    if (index === null)
    {
        return null;
    }

    return this.choices[index];
};

/* **************************************************************************
 * SelectGroup.selectChoice                                            */ /**
 *
 * Select the choice in the presenter represented by the given key or index.
 * If the choice is already selected, do nothing.
 *
 * @param {string|number}   choiceSelector  -Either the key (if a string) or
 *                                           the index (if a number) of the
 *                                           choice to be selected

 ****************************************************************************/
pearson.brix.SelectGroup.prototype.selectChoice = function (choiceSelector)
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
 * SelectGroup.flagChoice                                              */ /**
 *
 * Flag the choice with the given key in some way to make it stand out.
 * This is currently used to flag the correct answer.
 *
 * @param {string}  key     -The key that identifies the choice to be flagged
 *
 ****************************************************************************/
pearson.brix.SelectGroup.prototype.flagChoice = function (key)
{
};

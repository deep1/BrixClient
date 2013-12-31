/* **************************************************************************
 * $Workfile:: widget-multiplechoicequestion-old.js                         $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the MultipleChoiceQuestionOld bric.
 *
 * The MultipleChoiceQuestionOld bric displays a question and a set of possible
 * answers one of which must be selected and submitted to be scored.
 * It is for use by Prototype pages only, mostly to support those pages
 * that use the svgSize config property as a way to support using an SvgBric
 * as the presenterBric. This needs to be implemented differently, probably
 * by creating a wrapper HtmlBric for the SvgBric.
 *
 * Created on       May 29, 2013
 * @author          Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.MultipleChoiceQuestionOld');

goog.require('pearson.utils.IEventManager');
goog.require('pearson.utils.EventManager');
goog.require('pearson.brix.utils.SubmitManager');
goog.require('pearson.brix.HtmlBric');

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

    // RadioButton widget config
    var rbConfig =
        {
            id: "RG1",
            choices: Q1Choices,
            numberFormat: "latin-upper"
        };

    // MultipleChoiceQuestionOld widget config
    var mcqConfig =
    {
        id: "Q1",
        questionId: "SanVan003",
        question: "Why?",
        choices: Q1Choices,
        order: "randomized", //default, even if not specified
        widget: null, // or actually something such as: pearson.brix.RadioGroup,
        widgetConfig: { numberFormat: "latin-upper" } // id and choices will be added by MultipleChoiceQuestionOld
    };
});

/**
 * Answers are presented to users by certain brix that allow the user to
 * select one (or more of them).
 *
 * @typedef {Object} pearson.brix.Answer
 * @property {string}   content     -The content of the answer, which presents the
 *                                   meaning of the answer.
 * @property {string}   answerKey   -This is the unique ID that will be returned
 *                                   to the scoring engine to identify that the
 *                                   user has chosen this answer.
 *
 * @todo: the content currently must be text (a string) however, we are likely
 * to want to make the content be any bric.
 */
pearson.brix.Answer;


/* **************************************************************************
 * MultipleChoiceQuestionOld                                           */ /**
 *
 * Constructor function for MultipleChoiceQuestionOld brix.
 *
 * @constructor
 * @extends {pearson.brix.HtmlBric}
 * @implements {pearson.brix.IQuestionBric}
 * @export
 *
 * @param {Object}      config          -The settings to configure this MultipleChoiceQuestionOld
 * @param {string|undefined}
 *                      config.id       -String to uniquely identify this MultipleChoiceQuestionOld.
 *                                       if undefined a unique id will be assigned.
 * @param {string}      config.questionId
 *                                      -Scoring engine Id of this question
 * @param {htmlString}  config.question -The question being posed to the user which should
 *                                       be answered by choosing one of the presented choices.
 * @param {!Array.<!pearson.brix.Answer>}
 *                      config.choices  -The list of choices (answers) to be presented
 *                                       by the MultipleChoiceQuestionOld.
 * @param {string|undefined}
 *                      config.order    -The order in which the choices should be presented.
 *                                       either "randomized" or "ordered". Default is
 *                                       "randomized" if not specified.
 * @param {!function(new:pearson.brix.HtmlBric, Object, !pearson.utils.IEventManager=)}
 *                      config.widget   -The constructor for a widget that presents choices.
 * @param {!Object}     config.widgetConfig
 *                                      -The configuration object for the specified widget
 *                                       constructor without the id or choices properties which
 *                                       will be added by this question constructor.
 * @param {!pearson.utils.IEventManager=}
 *                      eventManager    -The event manager to use for publishing events
 *                                       and subscribing to them.
 *
 * @classdesc
 * The MultipleChoiceQuestionOld bric displays a question and a set of possible
 * answers one of which must be selected and submitted to be scored.
 *
 ****************************************************************************/
pearson.brix.MultipleChoiceQuestionOld = function (config, eventManager)
{
    // call the base class constructor
    goog.base(this);

    /**
     * A unique id for this instance of the multiple choice question bric
     * @private
     * @type {string}
     */
    this.mcqId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.MultipleChoiceQuestionOld);

    /**
     * The scoring engine id of this question.
     * (e.g. the sequence node id)
     * @type {string}
     */
    this.questionId = config.questionId;

    /**
     * The question text.
     * @type {htmlString}
     */
    this.question = config.question;

    /**
     * The configuration options for the bric that will display the choices that
     * answer this question.
     * Add an id and adjust the choices according to the question type and add them
     * to the config.
     * @type {Object}
     */
    var widgetConfig = config.widgetConfig;

    widgetConfig.id = this.mcqId_ + "_wdgt";

    var choices = config.choices;

    /** @todo these 2 instance variables need comments (and review and unit tests) -mjl */
    this.svgSize = config.svgSize;
    this.svgBaseBrix = config.svgBaseBrix;

    if (config.order === undefined || config.order === "randomized")
    {
        // clone the array before we rearrange it so we don't modify the
        // array passed in the config.
        choices = choices.slice(0);
        pearson.utils.randomizeArray(choices);
    }

    widgetConfig.choices = choices;

    /**
     * The bric used to present the choices that may be selected to answer
     * this question.
     * @type {!pearson.brix.HtmlBric}
     */
    this.choiceWidget = new config.widget(widgetConfig, eventManager);

    // The configuration options for the submit button
    var submitBtnConfig =
    {
        id: this.mcqId_ + "_sbmtBtn",
        text: "Select an answer",
        enabled: false
    };

    /**
     * The button bric which allows the answer to the question to be submitted
     * for scoring.
     * @type {!pearson.brix.Button}
     */
    this.submitButton = new pearson.brix.Button(submitBtnConfig, eventManager);

    /**
     * List of responses that have been received for all submitted
     * scoring requests.
     * @type {Array.<Object>}
     */
    this.responses = [];

    /**
     * The event manager to use to publish (and subscribe to) events for this bric
     * @type {!pearson.utils.IEventManager}
     */
    this.eventManager = eventManager || new pearson.utils.EventManager();

    /**
     * The event id published when a choice in this question is selected.
     * @const
     * @type {string}
     */
    this.selectedEventId = this.choiceWidget.selectedEventId;

    /**
     * The event details for this.selectedEventId events
     * @typedef {Object} SelectedEventDetails
     * @property {string} selectKey -The answerKey associated with the selected answer.
     */
    var SelectedEventDetails;

    /**
     * The event id published when the submit button is clicked.
     * @const
     * @type {string}
     */
    this.submitScoreRequestEventId = pearson.brix.MultipleChoiceQuestionOld.getEventTopic('submitScoreRequest', this.mcqId_);

    /**
     * The event details for this.submitScoreRequestEventId events
     * @typedef {Object} SubmitAnswerRequest
     * @property {Iuestion}         question    -This question widget
     * @property {string}           questionId  -The id which identifies this question to the scoring engine.
     * @property {string}           answerKey   -The answerKey associated with the selected answer.
     * @property {function(Object)} responseCallback
     *                                          -[optional] function to call with the response when it is
     *                                           returned by the scoring engine.
     */
    var SubmitAnswerRequest;

    // subscribe to events of our 'child' widgets
    eventManager.subscribe(this.submitButton.pressedEventId, goog.bind(this.handleSubmitRequested_, this));
    eventManager.subscribe(this.choiceWidget.selectedEventId, goog.bind(this.handleAnswerSelected_, this));

    /**
     * Information about the last drawn instance of this bric (from the draw method)
     * @type {Object}
     */
    this.lastdrawn =
        {
            container: null,
            widgetGroup: null,
        };
}; // end of MultipleChoiceQuestionOld constructor
goog.inherits(pearson.brix.MultipleChoiceQuestionOld, pearson.brix.HtmlBric);

/**
 * Prefix to use when generating ids for instances of MultipleChoiceQuestionOld.
 * @const
 * @type {string}
 */
pearson.brix.MultipleChoiceQuestionOld.autoIdPrefix = "mcQold_auto_";

/* **************************************************************************
 * MultipleChoiceQuestionOld.getEventTopic (static)                    */ /**
 *
 * Get the topic that will be published for the specified event by a
 * MultipleChoiceQuestionOld bric with the specified id.
 * @export
 *
 * @param {string}  eventName       -The name of the event published by instances
 *                                   of this Bric.
 * @param {string}  instanceId      -The id of the Bric instance.
 *
 * @returns {string} The topic string for the given topic name published
 *                   by an instance of MultipleChoiceQuestionOld with the given
 *                   instanceId.
 *
 * @throws {Error} If the eventName is not published by this bric or the
 *                 topic cannot be determined for any other reason.
 ****************************************************************************/
pearson.brix.MultipleChoiceQuestionOld.getEventTopic = function (eventName, instanceId)
{
    /**
     * Functions that return the topic of a published event given an id.
     * @type {Object.<string, function(string): string>}
     */
    var publishedEventTopics =
    {
        'selected': function (instanceId)
        {
            throw new Error("The requested event '" + eventName + "' can only be determined at runtime. The implementation of MultipleChoiceQuestionOld will need to be changed if this topic is required");
        },

        'submitScoreRequest': function (instanceId)
        {
            return instanceId + '_submitAnswerRequest';
        },
    };

    if (!(eventName in publishedEventTopics))
    {
        throw new Error("The requested event '" + eventName + "' is not published by MultipleChoiceQuestionOld brix");
    }

    return publishedEventTopics[eventName](instanceId);
};

/* **************************************************************************
 * MultipleChoiceQuestionOld.handleSubmitRequested_                    */ /**
 *
 * Handle the pressed event from the submit button which means that we want
 * to fire the submit answer requested event.
 * @private
 *
 ****************************************************************************/
pearson.brix.MultipleChoiceQuestionOld.prototype.handleSubmitRequested_ = function ()
{
    window.console.log('MCQ: handling submit requested');

    var submitAnsDetails =
        {
            question: this,
            questionId: this.questionId,
            answerKey: this.choiceWidget.selectedItem().answerKey,
            responseCallback: goog.bind(this.handleSubmitResponse_, this)
        };

    this.eventManager.publish(this.submitScoreRequestEventId, submitAnsDetails);
};

/* **************************************************************************
 * MultipleChoiceQuestionOld.handleAnswerSelected_                     */ /**
 *
 * Handle the selected event from the choice widget which means that the
 * submit button can be enabled.
 * @private
 *
 ****************************************************************************/
pearson.brix.MultipleChoiceQuestionOld.prototype.handleAnswerSelected_ = function ()
{
    window.console.log('MCQ: handling answer selected');

    this.submitButton.setText('Submit');
    this.submitButton.setEnabled(true);
};

/* **************************************************************************
 * MultipleChoiceQuestionOld.handleSubmitResponse_                     */ /**
 *
 * Handle the response to submitting an answer.
 *
 * @param {Object}  responseDetails -An object containing details about how
 *                                   the submitted answer was scored.
 * @private
 *
 ****************************************************************************/
pearson.brix.MultipleChoiceQuestionOld.prototype.handleSubmitResponse_ = function (responseDetails)
{
    window.console.log('MCQ: handling submit response');

    this.responses.push(responseDetails);

    var responseDiv = this.lastdrawn.widgetGroup.select('div.feedback');

    // this removes any previous feedback and only shows student the most recent
    var prevFeedback = this.lastdrawn.widgetGroup.selectAll('div.feedback > *');
    prevFeedback.remove();

    // For now just use the helper function to write the response.
    pearson.brix.utils.SubmitManager.appendResponseWithDefaultFormatting(responseDiv, responseDetails);
};

/* **************************************************************************
 * MultipleChoiceQuestionOld.draw                                      */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Draw this MultipleChoiceQuestionOld in the given container.
 *
 * @param {!d3.selection}   container   -The container html element to append
 *                                       this HtmlBric element tree to.
 ****************************************************************************/
pearson.brix.MultipleChoiceQuestionOld.prototype.draw = function (container)
{
    this.lastdrawn.container = container;

    // make a div to hold the select one question
    var widgetGroup = container.append("div")
        .attr("class", "brixMultipleChoiceQuestion")
        .attr("id", this.mcqId_);

    // use a fieldset (although w/o a form) to group the question and choices
    var qCntr = widgetGroup.append('fieldset');

    var question = qCntr.append('legend')
        .attr("class", "question")
        .html(this.question);

    var choiceWidgetCntr = qCntr.append("div")
        .attr("class", "choices")
        .attr("id", this.mcqId_ + "_choice_id");


    // check if it's an SVG widget with a size, in which case
    // create

    if (Array.isArray(this.svgSize))
    {
        var mcSVG = new pearson.brix.SVGContainer({
                node: choiceWidgetCntr,
                maxWid: this.svgSize[0],
                maxHt: this.svgSize[1]
            });

        if (this.svgBaseBrix)
        {
            this.svgBaseBrix.append(this.choiceWidget);
            mcSVG.append(this.svgBaseBrix);
        }
        else
        {
            mcSVG.append(this.choiceWidget)
        }
    }
    else
    {
        this.choiceWidget.draw(choiceWidgetCntr);
    }

    // make a target for feedback when the question is answered
    widgetGroup.append('div')
        .attr('class', 'feedback');

    // draw the submit button below
    var submitButtonCntr = widgetGroup.append("div")
        .attr("class", "submit");

    this.submitButton.draw(submitButtonCntr);

    this.lastdrawn.widgetGroup = widgetGroup;

}; // end of MultipleChoiceQuestionOld.draw()

/* **************************************************************************
 * MultipleChoiceQuestionOld.getId                                     */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Returns the ID of this bric.
 *
 * @returns {string} The ID of this Bric.
 *
 ****************************************************************************/
pearson.brix.MultipleChoiceQuestionOld.prototype.getId = function ()
{
    return this.mcqId_;
};

/* **************************************************************************
 * MultipleChoiceQuestionOld.selectedItem                              */ /**
 *
 * Return the selected choice from the choice widget or null if nothing has been
 * selected.
 * @export
 *
 * @return {Object} the choice which is currently selected or null.
 *
 ****************************************************************************/
pearson.brix.MultipleChoiceQuestionOld.prototype.selectedItem = function ()
{
    return this.choiceWidget.selectedItem();
};

/* **************************************************************************
 * MultipleChoiceQuestionOld.selectItemAtIndex                         */ /**
 *
 * Select the choice in the choice widget at the given index. If the choice is
 * already selected, do nothing. The index is the displayed choice index and
 * not the config choice index (in other words if the choices have been randomized
 * then the configuration index is NOT the displayed index).
 * @export
 *
 * @param {number}  index   -the 0-based index of the choice to mark as selected.
 *
 ****************************************************************************/
pearson.brix.MultipleChoiceQuestionOld.prototype.selectItemAtIndex = function (index)
{
    this.choiceWidget.selectItemAtIndex(index);
};


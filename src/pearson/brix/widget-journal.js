/* **************************************************************************
 * $Workfile:: widget-journal.js                                            $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the Journal bric.
 *
 * The Journal bric displays an textbox that allows text to be entered and
 * submitted.
 *
 * Created on       November 17, 2013
 * @author          Michael Jay Lippert
 *                  Seann Ives
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.Journal');

goog.require('goog.debug.Logger');

goog.require('pearson.brix.HtmlBric');
goog.require('pearson.utils.IEventManager');
goog.require('pearson.utils.EventManager');
goog.require('pearson.brix.utils.SubmitManager');

// Sample configuration objects for classes defined here
(function()
{
    // Journal bric config
    var jrnlConfig =
    {
        id: "Q1",
        journalId: "SanVan003",
        title: "Why?"
    };
});


/* **************************************************************************
 * Journal                                                             */ /**
 *
 * Constructor function for Journal brix.
 *
 * @constructor
 * @extends {pearson.brix.HtmlBric}
 * @export
 *
 * @param {Object}      config          -The settings to configure this Journal
 * @param {string|undefined}
 *                      config.id       -String to uniquely identify this Journal.
 *                                       if undefined a unique id will be assigned.
 * @param {string}      config.journalId
 *                                      -Id of this Journal when it is submitted that
 *                                       distinguishes it from other journal submissions.
 * @param {htmlString}  config.title    -The title to display above the journal edit box.
 *                                       This can give context to what is supposed to be
 *                                       entered.
 * @param {!pearson.utils.IEventManager=}
 *                      eventManager    -The event manager to use for publishing events
 *                                       and subscribing to them.
 * @param {!pearson.brix.BricWorks=}
 *                      bricWorks       -The BricWorks to use to create other brix used
 *                                       internally by this Journal bric.
 *
 * @classdesc
 * The Journal bric displays a question and a set of possible
 * answers one of which must be selected and submitted to be scored.
 *
 ****************************************************************************/
pearson.brix.Journal = function (config, eventManager, bricWorks)
{
    // call the base class constructor
    goog.base(this);

    /**
     * Logger for this Bric
     * @private
     * @type {goog.debug.Logger}
     */
    this.logger_ = goog.debug.Logger.getLogger('pearson.brix.Journal');

    // Without a valid BricWorks we can't construct this JournalBric
    if (!bricWorks)
    {
        var msg = 'Journal requires a valid BricWorks to create the Button brix that it uses';
        this.logger_.severe(msg);
        throw new Error(msg);
    }

    /**
     * A unique id for this instance of the journal bric
     * @private
     * @type {string}
     */
    this.jrnlId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.Journal);

    /**
     * The submission id of this journal.
     * (e.g. the sequence node id)
     * @private
     * @type {string}
     */  
    this.journalId_ = config.journalId;

    /**
     * The title text, displayed above the editbox.
     * @private
     * @type {htmlString}
     */
    this.title_ = config.title;

    // The configuration options for the submit button
    var submitBtnConfig =
    {
        id: this.jrnlId_ + "_sbmtBtn",
        text: "Submit",
        enabled: false
    };

    /**
     * The button bric which allows the journal entry to be submitted.
     * @type {!pearson.brix.Button}
     */
    this.submitButton = /**@type {!pearson.brix.Button}*/
                        (bricWorks.createBric(pearson.brix.BricTypes.BUTTON, submitBtnConfig));

    /**
     * List of responses that have been received for all submitted
     * scoring requests.
     * @private
     * @type {Array.<!pearson.brix.Journal.ResponseRecord>}
     */
    this.responses_ = [];
    /**
     * The event manager to use to publish (and subscribe to) events for this bric
     * @type {!pearson.utils.IEventManager}
     */
    this.eventManager = eventManager || new pearson.utils.EventManager();

    /**
     * The event id published when the submit button is clicked.
     * @const
     * @type {string}
     */
    this.submitScoreRequestEventId = pearson.brix.Journal.getEventTopic('submitScoreRequest', this.jrnlId_);

    /**
     * The event details for this.submitScoreRequestEventId events
     * @typedef {Object} SubmitAnswerRequest
     * @property {string}           submissionId -The id which identifies this journal to the scoring engine.
     * @property {Object}           answer       -The journal answer object
     * @property {string}           answer.entry -The journal entry text
     * @property {function(Object)} responseCallback
     *                                           -[optional] function to call with the response when it is
     *                                            returned by the scoring engine.
     */
    var SubmitAnswerRequest;

    // subscribe to events of our 'child' brix
    eventManager.subscribe(this.submitButton.pressedEventId, goog.bind(this.handleSubmitRequested_, this));

    /**
     * Information about the last drawn instance of this bric (from the draw method)
     * @type {Object}
     */
    this.lastdrawn_ =
        {
            container: null,
            bricGroup: null,
        };
}; // end of Journal constructor
goog.inherits(pearson.brix.Journal, pearson.brix.HtmlBric);

/**
 * Prefix to use when generating ids for instances of Journal.
 * @const
 * @type {string}
 */
pearson.brix.Journal.autoIdPrefix = "jrnl_auto_";

/* **************************************************************************
 * Journal.getEventTopic (static)                                      */ /**
 *
 * Get the topic that will be published for the specified event by a
 * Journal bric with the specified id.
 * @export
 *
 * @param {string}  eventName       -The name of the event published by instances
 *                                   of this Bric.
 * @param {string}  instanceId      -The id of the Bric instance.
 *
 * @returns {string} The topic string for the given topic name published
 *                   by an instance of Journal with the given
 *                   instanceId.
 *
 * @throws {Error} If the eventName is not published by this bric or the
 *                 topic cannot be determined for any other reason.
 ****************************************************************************/
pearson.brix.Journal.getEventTopic = function (eventName, instanceId)
{
    /**
     * Functions that return the topic of a published event given an id.
     * @type {Object.<string, function(string): string>}
     */
    var publishedEventTopics =
    {
        'submitScoreRequest': function (instanceId)
        {
            return instanceId + '_submitAnswerRequest';
        },
    };

    if (!(eventName in publishedEventTopics))
    {
        throw new Error("The requested event '" + eventName + "' is not published by Journal brix");
    }

    return publishedEventTopics[eventName](instanceId);
};

/* **************************************************************************
 * Journal.handleSubmitRequested_                                      */ /**
 *
 * Handle the pressed event from the submit button which means that we want
 * to fire the submit answer requested event. Although for a Journal all we
 * want to do is submit, we don't care about the response.
 * @private
 *
 ****************************************************************************/
pearson.brix.Journal.prototype.handleSubmitRequested_ = function ()
{
    this.logger_.fine('handling submit requested');

    var entry = this.lastdrawn_.bricGroup.select("textarea.entry");
    var entryText = entry.node().value;

    var submitAnsDetails =
        {
            submissionId: this.journalId_,
            answer: { 'entry': entryText },
            responseCallback: goog.bind(this.handleSubmitResponse_, this)
        };

    // Disable the submit button
    // at least for now we only allow submitting once.
    this.submitButton.setEnabled(false);

    this.eventManager.publish(this.submitScoreRequestEventId, submitAnsDetails);
};

/**
 * Record of the details of a submitted choice and the response received.
 * We're using the alwaysCorrect assessmentType for this so, barring
 * studentSubmission, the response will always be the same.  However, we
 * still want to know that we've gotten a response and this allows us to
 * alter alwaysCorrect later without also having to clean Journal up too much.
 *
 * @typedef {Object} pearson.brix.Journal.ResponseRecord
 * @property {{key: string}}
 *                      studentSubmission   -The answer object sent for evaluation
 * @property {number}   correctness         -correctness of the choice 0 incorrect
 *                                           to 1 completely correct (alwaysCorrect
 *                                           always returns 1)
 * @property {string}   feedback            -Feedback about the choice (generic feedback
 *                                           that journal currently ignores)
 * @property {number}   attemptsMade        -what attempt at answering the question
 *                                           this submission was.
 * @property {{key: string, feedback: string}|undefined}
 *                      correctAnswer       -optional property which is present only
 *                                           when the student submission was not
 *                                           correct AND no more attempts are allowed.
 */
pearson.brix.Journal.ResponseRecord;

/* **************************************************************************
 * Journal.handleSubmitResponse_                                       */ /**
 *
 * Handle the response to submitting an answer.
 * @private
 *
 * @param {Object}  responseDetails -An object containing details about how
 *                                   the submitted answer was scored.
 *
 ****************************************************************************/
pearson.brix.Journal.prototype.handleSubmitResponse_ = function (responseDetails)
{
    this.logger_.fine('handling submit response');
    this.logger_.finer('responseDetails: ' + JSON.stringify(responseDetails));

    // Extract the info from the responseDetails that we need in the response record
    /** @type {pearson.brix.MultipleChoiceQuestion.ResponseRecord} */
    var respRec =
        {
            studentSubmission: responseDetails['submitDetails'].entry,
            correctness: responseDetails['correctness'],
            feedback: responseDetails['feedback'],
            attemptsMade: responseDetails['attemptsMade']
        };

    if (responseDetails.correctAnswer)
    {
        respRec.correctAnswer = responseDetails.correctAnswer;
    }

    // add this response to the list of responses
    this.responses_.push(respRec);

    this.redrawFeedback_();    
};

/* **************************************************************************
 * Journal.getId                                                       */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Returns the ID of this bric.
 *
 * @returns {string} The ID of this Bric.
 *
 ****************************************************************************/
pearson.brix.Journal.prototype.getId = function ()
{
    return this.jrnlId_;
};

/**
 * Journal state object. This object represents the state
 * of a Journal bric and is returned by getState and is the
 * parameter to setState.
 *
 * @typedef {Object} pearson.brix.Journal.StateObject
 * @property {Array.<!pearson.brix.Journal.ResponseRecord>}
 *                      submissions         -The collection of responses to
 *                                           choices previously submitted.
 */
pearson.brix.Journal.StateObject;

/* **************************************************************************
 * Journal.getState                                     */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Get a state object that represents the current state of this object and
 * can be passed to restoreState.
 *
 * @returns {!pearson.brix.Journal.StateObject} Object that
 *          when passed back to this type of object's restoreState method
 *          will set its state to match the current state of this object.
 *
 ****************************************************************************/
pearson.brix.Journal.prototype.getState = function ()
{
    throw new Error('getState has not yet been implemented on Journals');
};

/* **************************************************************************
 * Journal.restoreState                                 */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Restores the state of this object to match the state object given.
 *
 * @param {!Object} state   -Object returned by the call to getState on
 *                           this type of an object representing the state
 *                           to be restored.
 *
 ****************************************************************************/
pearson.brix.Journal.prototype.restoreState = function (state)
{
    // @note: is this shallow array copy sufficient, or do we need to a deep copy? -mjl
    this.responses_ = state['submissions'].slice();

    this.attemptsMade_ = 0;
    if (this.responses_.length !== 0)
    {
        this.attemptsMade_ = this.responses_[this.responses_.length - 1]['attemptsMade'];
    }

    // If we're drawn, we need to redraw
    if (this.lastdrawn_.container != null)
    {
        this.redrawFeedback_();
    }
};

/* **************************************************************************
 * Journal.draw                                                        */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Draw this Journal in the given container.
 *
 * @param {!d3.selection}   container   -The container html element to append
 *                                       this HtmlBric element tree to.
 ****************************************************************************/
pearson.brix.Journal.prototype.draw = function (container)
{
    this.logger_.fine('drawing');

    var that = this;

    this.lastdrawn_.container = container;

    // make a div to hold the journal question
    var bricGroup = container.append('div')
        .attr('class', 'brixJournal');

    // use a fieldset (although w/o a form) to group the title
    var jCntr = bricGroup.append('fieldset');

    var title = jCntr.append('legend')
        .attr('class', 'title')
        .html(this.title_);

    // make a div to hold the textarea so we can size it appropriately
    var areaCntr = bricGroup.append('div')
        .attr('class', 'journalTextarea');

    var textentry = areaCntr.append('textarea')
        .attr('class', 'entry')
        .attr('placeholder', 'The response entered here will be saved to your notes and may be collected by your instructor if he/she requires it.')
        .attr('rows', '7');

    if (this.responses_.length !== 0)
    {
        // then get the last response and stick it in the textarea
        var lastResponse = this.responses_[this.responses_.length - 1];
        textentry.property('value', lastResponse.studentSubmission.entry);
        textentry.attr('disabled', 'disabled');
    }

    // we need a block container for the submit button and the attempts
    var submitAndAttemptsCntr = bricGroup.append('div');

    // draw the submit button below
    var submitButtonCntr = submitAndAttemptsCntr.append('div')
        .attr('class', 'submit')
        .style('display', 'inline-block');

    this.submitButton.draw(submitButtonCntr);

    var attemptsCntr = submitAndAttemptsCntr.append('span')
        .attr('class', 'attempts');

    // If we haven't submitted, listen for keyboard events on the
    // textarea and enable submit
    if (this.responses_.length === 0)
    {
        textentry.on('keypress', function ()
        {
            that.submitButton.setEnabled(true);
        });
    }

    this.lastdrawn_.bricGroup = bricGroup;

    // Drawing feedback depends on this.lastdrawn_.bricGroup
    this.drawFeedback_(bricGroup);

}; // end of Journal.draw()

/* **************************************************************************
 * Journal.drawFeedback_                                               */ /**
 *
 * Draw the feedback from the responses to prior attempts to answer this
 * question.
 * @private
 *
 * @param {!d3.selection}   cntr   -The container html element to append
 *                                  the feedback to.
 *
 ****************************************************************************/
pearson.brix.Journal.prototype.drawFeedback_ = function (cntr)
{
    this.logger_.fine('drawing feedback');
    // make a target for feedback when the question is answered
    cntr.append('div')
        .attr('class', 'feedback');

    this.redrawFeedback_();
};

/* **************************************************************************
 * Journal.redrawFeedback_                              */ /**
 *
 * Update the displayed response feedback.
 * @private
 *
 ****************************************************************************/
pearson.brix.Journal.prototype.redrawFeedback_ = function ()
{
    var feedbackCntr = this.lastdrawn_.bricGroup.select('div.feedback');

    // Currently we only display the feedback from the last response
    // so 1st remove any feedback being displayed
    var prevFeedback = this.lastdrawn_.bricGroup.selectAll('div.feedback > *');
    prevFeedback.remove();

    // If there's no responses then there's no feedback
    if (this.responses_.length === 0)
    {
        return;
    }

    // If there is a response, provide the default feedback
    feedbackCntr.append('div')
        .attr('class', 'feedback-correct')
        .text('Your entry is saved.');

};

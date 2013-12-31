/* **************************************************************************
 * $Workfile:: submitmanager.js                                             $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of a SubmitManager object.
 *
 * The SubmitManager does some stuff.
 *
 * Created on       June 4, 2013
 * @author          Seann Ives
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.utils.SubmitManager');

goog.require('goog.debug.Logger');
goog.require('pearson.utils.IEventManager');
goog.require('pearson.brix.utils.IAnswerMan');
goog.require('pearson.brix.utils.LocalAnswerMan');

/* **************************************************************************
 * SubmitManager                                                       */ /**
 *
 * Constructor function for the SubmitManager class
 *
 * @constructor
 *
 * @param {!pearson.utils.IEventManager}
 *                      eventManager    -The event manager to use for publishing events
 *                                       and subscribing to them.
 * @param {!pearson.brix.utils.IAnswerMan=}
 *                      answerMan       -The correctness engine to process the selected answer.
 *
 * @classdesc
 * The submit manager handles your submissions, yo.
 *
 * It listens (subscribes) for scoring requests from registered widgets,
 * handles getting the request to the scoring engine and processes the
 * response, returning that response to the requesting widget if there
 * is a callback associated w/ the request.
 *
 ****************************************************************************/
pearson.brix.utils.SubmitManager = function (eventManager, answerMan)
{
    /**
     * A logger to help debugging
     * @type {goog.debug.Logger}
     * @private
     */
    this.logger_ = goog.debug.Logger.getLogger('pearson.brix.utils.SubmitManager');

    /**
     * The answerMan provides feedback to submissions
     * @private
     * @type {!pearson.brix.utils.IAnswerMan}
     */
    this.answerMan_ = answerMan || new pearson.brix.utils.LocalAnswerMan();

    /**
     * The event manager to use to publish (and subscribe to) events
     * @type {!pearson.utils.IEventManager}
     */
    this.eventManager = eventManager;

    /**
     * map of all submitted answers awaiting a response from
     * the scoring engine.
     * @type {Object.<pearson.brix.Ipc.SequenceNodeKey, pearson.brix.utils.SubmitManager.PendingDetails>}
     * @private
     */
    this.requestsAwaitingResponse_ = {};
};

/**
 * The PendingDetails is the information about an outstanding
 * request for an activity to be scored by the scoring engine.
 *
 * @typedef {Object} pearson.brix.utils.SubmitManager.PendingDetails
 * @property {pearson.brix.Ipc.SequenceNodeKey}
 *                              sequenceNodeKey -The PAF Activity Id which identifies the
 *                                               activity being scored.
 * @property {string}           answer          -The 'key' of the chosen answer to be scored.
 * @property {number|undefined} value           -If the answer selection is not from a discrete list
 *                                               this is the numeric value chosen.
 * @property {function(Object)} responseCallback
 *                                              -The function to call w/ the response from
 *                                               the scoring engine.
 * @property {Object}           requestDetails  -The details from the score
 *                                               request event from the question widget.
 */
pearson.brix.utils.SubmitManager.PendingDetails;

/* **************************************************************************
 * SubmitManager.handleRequestsFrom                                    */ /**
 *
 * Register the given question widget w/ this SubmitManager to handle any
 * submitScoreRequest events the widget may publish.
 * @export
 *
 * @param {Object}  questionWidget      -The question widget that may submit a
 *                                       request for an answer to an activity to
 *                                       be scored.
 *
 ****************************************************************************/
pearson.brix.utils.SubmitManager.prototype.handleRequestsFrom = function(questionWidget)
{
    var that = this;
    this.eventManager.subscribe(questionWidget.submitScoreRequestEventId,
                                function (eventDetails) {that.handleScoreRequest_(eventDetails);});
};

/* **************************************************************************
 * SubmitManager.handleScoreRequest_                                   */ /**
 *
 * The event handler of this SubmitManager for submitScoreRequest events
 * from registered question widgets.
 *
 * @param {Object}  eventDetails        -The details of the score request must include:
 *                                       questionId and answerKey. Optionally it may
 *                                       also include a responseCallback, and any other
 *                                       properties that responseCallback may need.
 * @private
 *
 ****************************************************************************/
pearson.brix.utils.SubmitManager.prototype.handleScoreRequest_ = function(eventDetails)
{
    this.logger_.fine('handleScoreRequest_: ed.submissionId="' + eventDetails.submissionId + '"');
    this.logger_.finer('ed.answer=' + JSON.stringify(eventDetails.answer));

    // @todo reevaluate whether we still need this intermediary object -mjl 11/18/2013
    var pendingDetails =
        {
            sequenceNodeKey: eventDetails.submissionId,
            answer: eventDetails.answer,
            responseCallback: eventDetails.responseCallback,
            requestDetails: eventDetails,
        };

    if (this.requestsAwaitingResponse_[eventDetails.submissionId] !== undefined)
    {
        var msg = "there's already an outstanding submission request for the submission ID: " + eventDetails.submissionId;
        this.logger_.warning(msg);
        alert(msg);
    }

    this.requestsAwaitingResponse_[eventDetails.submissionId] = pendingDetails;

    this.answerMan_.scoreAnswer(pendingDetails.sequenceNodeKey,
                                pendingDetails.answer,
                                goog.bind(this.handleScoringResponse_, this, eventDetails.submissionId));
};

/* **************************************************************************
 * SubmitManager.handleScoringResponse_                                */ /**
 *
 * This is the callback passed to the scoring engine (IAnswerMan) which
 * is called with the results of scoring a particular answer.
 * @private
 *
 * @param {string}  submissionId        -The submission id of the request which
 *                                       this is a response to.
 * @param {pearson.brix.utils.ScoreResponse}
 *                  submissionResponse  -The response to the score request
 *
 ****************************************************************************/
pearson.brix.utils.SubmitManager.prototype.handleScoringResponse_ = function (submissionId, submissionResponse)
{
    // We handle the reply from the scoring engine
    // by removing the request from the list of pending requests
    // and calling the given callback if it exists
    var pendingDetails = this.requestsAwaitingResponse_[submissionId];
    delete this.requestsAwaitingResponse_[submissionId];

    if (typeof pendingDetails.responseCallback === 'function')
    {
        submissionResponse['submitDetails'] = pendingDetails.requestDetails;
        pendingDetails.responseCallback(submissionResponse);
    }
};

/* **************************************************************************
 * SubmitManager.appendResponseWithDefaultFormatting                   */ /**
 *
 * This is a temporary helper method to format the responses to submitted
 * answers.
 *
 * @note This function is attached to the SubmitManager just as a convenient
 * place for widgets to access it while the actual details of the response
 * are worked out. It might otherwise be a utility function or a static class
 * method on the base class of question widgets.
 * @export
 *
 * @param {!d3.selection}
 *                   container       -The html element to write the formatted
 *                                    response into.
 * @param {{correctness: number, feedback: string, submission: string}}
 *                   responseDetails -The response details returned by the
 *                                    scoring engine.
 *                                    The details must contain the following
 *                                    properties:
 *                                    correctness, submission, feedback.
 * @param {boolean=} outOfTries      -When true a correct response is formatted
 *                                    in a way that should be displayed following
 *                                    an incorrect response.
 *
 ****************************************************************************/
pearson.brix.utils.SubmitManager.appendResponseWithDefaultFormatting = function (container, responseDetails, outOfTries)
{
    var responseFormat = {
            correctAfterWrong: {
                icon: 'icon-check',
                answerPrefix: '"',
                answerSuffix:  '" is the correct answer. ',
                responseClass: 'feedback-correctAfterWrong'
            },
            correct: {
                icon: 'icon-ok-sign',
                answerPrefix: 'Correct. "',
                answerSuffix:  '" is the right answer. ',
                responseClass: 'feedback-correct'
            },
            incorrect: {
                icon: 'icon-wrong',
                answerPrefix: 'Incorrect. "',
                answerSuffix:  '" is not the right answer.',
                responseClass: 'feedback-incorrect'
            },
            partial: {
                icon: 'icon-adjust',
                answerPrefix: 'Partial credit. "',
                answerSuffix:  '" is partially correct. ',
                responseClass: 'feedback-partial'
            },
            unknown: {
                icon: 'icon-adjust',
                answerPrefix: "something has gone horribly awry - we can't score this answer.",
                responseClass: ''
            }
        };

    var ansType = 'unknown';
    if (typeof responseDetails.correctness === "number")
    {
        var correctness = responseDetails.correctness;
        if (correctness === 0)
        {
            ansType = 'incorrect';
        }
        else if (correctness === 1 && !outOfTries)
        {
            ansType = 'correct';
        }
        else if (correctness === 1 && outOfTries)
        {
            ansType = 'correctAfterWrong';
        }
        else if (correctness > 0 && correctness < 1)
        {
            ansType = 'partial';
        }
    }

    var responseHtml = "<i class='" + responseFormat[ansType].icon + "'></i> " +
                responseFormat[ansType].answerPrefix +
                (responseDetails.submission || "") +
                (responseFormat[ansType].answerSuffix || "") + " " +
                ('<div class="custom-feedback">' + responseDetails.feedback + '</div>' || "");

    // display the results of the submission in the given container
    container.append("div")
        .attr('class', responseFormat[ansType].responseClass)
        .html(responseHtml);
};


/* **************************************************************************
 * $Workfile:: widget-MultiSelectQuestion.js                             $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the MultiSelectQuestion widget.
 *
 * The MultiSelectQuestion widget displays a question and a set of possible
 * answers. 
 * This is analogous to MultipleChoiceQuestion with the difference that many 
 * selections (max configurable) is possible.
 *
 * Created on		July 29, 2013
 * @author			Young-Suk Ahn
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.MultiSelectQuestion');

goog.require('pearson.utils.IEventManager');
goog.require('pearson.utils.IEventManager');
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
	
	// CheckButton widget config
	var rbConfig =
		{
			id: "RG1",
			choices: Q1Choices,
			numberFormat: "latin-upper"
		};
	
	// MultiSelectQuestion widget config
	var mcqConfig =
	{
		id: "Q1",
		questionId: "SanVan003",
		question: "Why?",
		choices: Q1Choices,
		maxSelects: 2,
		order: "randomized", //default, even if not specified
		widget: pearson.brix.CheckGroup,
		widgetConfig: { numberFormat: "latin-upper" } // id and choices will be added by MultiSelectQuestion
	};
});

/**
 * Answers are presented to users by certain widgets that allow the user to
 * select one (or more of them).
 *
 * @typedef {Object} pearson.brix.Answer
 * @property {string}	content		-The content of the answer, which presents the
 * 									 meaning of the answer.
 * @property {string}	answerKey	-This is the unique ID that will be returned
 * 									 to the scoring engine to identify that the
 * 									 user has chosen this answer.
 *
 * @todo: the content currently must be text (a string) however, we are likely
 * to want to make the content be any widget.
 */
pearson.brix.Answer;


/* **************************************************************************
 * MultiSelectQuestion                                              */ /**
 *
 * Constructor function for MultiSelectQuestion brix.
 *
 * @constructor
 * @extends {pearson.brix.HtmlBric}
 * @implements {pearson.brix.IQuestionBric}
 * @export
 *
 * @param {Object}		config			-The settings to configure this MultiSelectQuestion
 * @param {string|undefined}
 * 						config.id		-String to uniquely identify this MultiSelectQuestion.
 * 										 if undefined a unique id will be assigned.
 * @param {string}		config.questionId
 * 										-Scoring engine Id of this question
 * @param {string}		config.question	-The question being posed to the user which should
 * 										 be answered by choosing one of the presented choices.
 * @param {!Array.<!pearson.brix.Answer>}
 *						config.choices	-The list of choices (answers) to be presented
 *										 by the MultiSelectQuestion.
 * @param {number}
 *						config.maxSelects -The maximum number of items that can be selected
 *
 * @param {string|undefined}
 *						config.order	-The order in which the choices should be presented.
 *										 either "randomized" or "ordered". Default is
 *										 "randomized" if not specified.
 * @param {!function(new:pearson.brix.HtmlBric, Object, !pearson.utils.IEventManager=)}
 * 						config.widget	-The constructor for a widget that presents choices.
 * @param {!Object}		config.widgetConfig
 * 										-The configuration object for the specified widget
 * 										 constructor without the id or choices properties which
 * 										 will be added by this question constructor.
 * @param {!pearson.utils.IEventManager=}
 * 						eventManager	-The event manager to use for publishing events
 * 										 and subscribing to them.
 *
 * @classdesc
 * The MultiSelectQuestion widget displays a question and a set of possible
 * answers one of which must be selected and submitted to be scored.
 *
 ****************************************************************************/
pearson.brix.MultiSelectQuestion = function (config, eventManager)
{
	// call the base class constructor
	goog.base(this);

	/**
	 * A unique id for this instance of the multiselect question bric
	 * @private
	 * @type {string}
	 */
	this.msqId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.MultiSelectQuestion);

	/**
	 * The scoring engine id of this question.
	 * @type {string}
	 */
	this.questionId = config.questionId;

	/**
	 * The question text.
	 * @type {string}
	 */
	this.question = config.question;

	/**
	 * The maximum number of allowed selects.
	 * @type {number}
	 */
	this.maxSelects = config.maxSelects;


	/**
	 * The configuration options for the bric that will display the choices that
	 * answer this question.
	 * Add an id and adjust the choices according to the question type and add them
	 * to the config.
	 * @type {!Object}
	 */
	var widgetConfig = config.widgetConfig;

	widgetConfig.id = this.msqId_ + "_wdgt";

	var choices = config.choices;

	if (config.order === undefined || config.order === "randomized")
	{
		// clone the array before we rearrange it so we don't modify the
		// array passed in the config.
		choices = choices.slice(0);
		pearson.utils.randomizeArray(choices);
	}

	widgetConfig.choices = choices;

	widgetConfig.maxSelects = this.maxSelects;

	/**
	 * The widget used to present the choices that may be selected to answer
	 * this question.
	 * @type {!pearson.brix.HtmlBric}
	 */
	this.choiceWidget = new config.widget(widgetConfig, eventManager);

	/**
	 * @todo DOCUMENT ME! -young suk this needs to be described -mjl
	 * @const
	 * @type {string}
	 */
	this.buttonPromptText = "Select an answer above";

	/**
	 * @todo DOCUMENT ME! -young suk this needs to be described -mjl
	 * @const
	 * @type {string}
	 */
	this.buttonSubmitText = "Submit Answer";

	// The configuration options for the submit button
	var submitBtnConfig =
	{
		id: this.msqId_ + "_sbmtBtn",
		text: this.buttonPromptText,
		enabled: false
	};

	/**
	 * The button widget which allows the answer to the question to be submitted
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
	 * @property {string} selectKey	-The answerKey associated with the selected answer.
	 */
	var SelectedEventDetails;

	/**
	 * The event id published when the submit button is clicked.
	 * @const
	 * @type {string}
	 */
	this.submitScoreRequestEventId = this.msqId_ + "_submitAnswerRequest";

	/**
	 * The event details for this.submitScoreRequestEventId events
	 * @typedef {Object} SubmitAnswerRequest
	 * @property {SelecOneQuestion} question	-This question widget
	 * @property {string} 			questionId	-The id which identifies this question to the scoring engine.
	 * @property {string} 			answerKey	-The answerKey associated with the selected answer.
	 * @property {function(Object)}	responseCallback
	 * 											-[optional] function to call with the response when it is
	 * 											 returned by the scoring engine.
	 */
	var SubmitAnswerRequest;

	// subscribe to events of our 'child' widgets
	eventManager.subscribe(this.submitButton.pressedEventId, goog.bind(this.handleSubmitRequested_, this));
	eventManager.subscribe(this.choiceWidget.selectedEventId, goog.bind(this.handleAnswerSelected_, this));
	eventManager.subscribe(this.choiceWidget.exceedSelectionEventId, goog.bind(this.handleExceedSelection_, this));

	/**
	 * Information about the last drawn instance of this widget (from the draw method)
	 * @type {Object}
	 */
	this.lastdrawn =
		{
			container: null,
			widgetGroup: null,
		};
}; // end of MultiSelectQuestion constructor
goog.inherits(pearson.brix.MultiSelectQuestion, pearson.brix.HtmlBric);

/**
 * Prefix to use when generating ids for instances of MultiSelectQuestion.
 * @const
 * @type {string}
 */
pearson.brix.MultiSelectQuestion.autoIdPrefix = "msQ_auto_";

/* **************************************************************************
 * MultiSelectQuestion.handleSubmitRequested_                          */ /**
 *
 * Handle the pressed event from the submit button which means that we want
 * to fire the submit answer requested event.
 * @private
 *
 ****************************************************************************/
pearson.brix.MultiSelectQuestion.prototype.handleSubmitRequested_ = function ()
{
	var answerKeys = [].map.call(this.choiceWidget.selectedItems(), function(item){
		return item.answerKey;
	});
	// NOTICE: the value of answerKey attribute is an array of keys
	var submitAnsDetails =
		{
			question: this,
			questionId: this.questionId,
			answerKey: answerKeys,
			responseCallback: goog.bind(this.handleSubmitResponse_, this)
		};

	this.eventManager.publish(this.submitScoreRequestEventId, submitAnsDetails);
};

/* **************************************************************************
 * MultiSelectQuestion.handleAnswerSelected_                           */ /**
 *
 * Handle the selected event from the choice widget which means that the
 * submit button can be enabled.
 * @private
 *
 * @param {Object}	eventDetails	-Details of the selection that occurred
 *
 ****************************************************************************/
pearson.brix.MultiSelectQuestion.prototype.handleAnswerSelected_ = function (eventDetails)
{
	if (eventDetails.numSelected > 0)
	{
	 	this.submitButton.setText(this.buttonSubmitText);
		this.submitButton.setEnabled(true);
	}  
	else 
	{
		this.submitButton.setText(this.buttonPromptText);
		this.submitButton.setEnabled(false);
	} 
};

/* **************************************************************************
 * MultiSelectQuestion.handleExceedSelection_                          */ /**
 *
 * Handle the exceedSelection event from the choice widget which means that the
 * user tried to select beyond the max number of selects.
 * @private
 *
 ****************************************************************************/
pearson.brix.MultiSelectQuestion.prototype.handleExceedSelection_ = function ()
{
	var responseDiv = this.lastdrawn.widgetGroup.select("div.responses");

	responseDiv.append("div")
		.html("Maximum number of options have been selected.");
};


/* **************************************************************************
 * MultiSelectQuestion.handleSubmitResponse_                           */ /**
 *
 * Handle the response to submitting an answer.
 * @private
 *
 * @param {Object}	responseDetails	-An object containing details about how
 * 									 the submitted answer was scored.
 *
 ****************************************************************************/
pearson.brix.MultiSelectQuestion.prototype.handleSubmitResponse_ = function (responseDetails)
{
	this.responses.push(responseDetails);

	var responseDiv = this.lastdrawn.widgetGroup.select("div.responses");

	// For now just use the helper function to write the response.
	//SubmitManager.appendResponseWithDefaultFormatting(responseDiv, responseDetails);
	// YSAP - Instead of the SubmitManager (who's agnostic of the rendering mechanism)
	//        its the MCQ that renders the answer feedback.
	responseDiv.append("div")
		.html(responseDetails.feedback);
};

/* **************************************************************************
 * MultiSelectQuestion.draw                                            */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Draw this MultiSelectQuestion in the given container.
 *
 * @param {!d3.selection}	container	-The container html element to append
 * 										 this HtmlBric element tree to.
 ****************************************************************************/
pearson.brix.MultiSelectQuestion.prototype.draw = function (container)
{
	this.lastdrawn.container = container;
	
	// make a div to hold the select one question
	// @todo [YSAP] - Let's make a catalog of all classes for styling.
	// @todo YSAP I think it's a bad idea to ever write another widget's class. -mjl 9/4/2013
	var widgetGroup = container.append("div")
		.attr("class", "widgetMultiSelectQuestion widgetMultipleChoiceQuestion")
		.attr("id", this.msqId_);

	var question = widgetGroup.append("p")
		.attr("class", "question")
		.text(this.question);
	
	var choiceWidgetCntr = widgetGroup.append("div")
		.attr("class", "choices");

	this.choiceWidget.draw(choiceWidgetCntr);

	var submitButtonCntr = widgetGroup.append("div")
		.attr("class", "submit");

	this.submitButton.draw(submitButtonCntr);

	widgetGroup.append("div")
		.attr("class", "responses");

	this.lastdrawn.widgetGroup = widgetGroup;

}; // end of MultiSelectQuestion.draw()

/* **************************************************************************
 * MultiSelectQuestion.getId                                           */ /**
 *
 * @inheritDoc
 * @export
 * @description The following is here until jsdoc supports the inheritDoc tag.
 * Returns the ID of this bric.
 *
 * @returns {string} The ID of this Bric.
 *
 ****************************************************************************/
pearson.brix.MultiSelectQuestion.prototype.getId = function ()
{
	return this.msqId_;
};

/* **************************************************************************
 * MultiSelectQuestion.selectedItems                                   */ /**
 *
 * Return the selected choice(s) in the question or null if nothing has
 * been selected.
 * @export
 *
 * @returns {Array.<pearson.brix.Answer>} an array of the choice(s) which
 * 		are currently selected or null if no choices are selected.
 *
 ****************************************************************************/
pearson.brix.MultiSelectQuestion.prototype.selectedItems = function ()
{
	return this.choiceWidget.selectedItems();
};

/* **************************************************************************
 * MultiSelectQuestion.selectItemAtIndex                               */ /**
 *
 * Select the choice in the choice widget at the given index. If the choice is
 * already selected, do nothing. The index is the displayed choice index and
 * not the config choice index (in other words if the choices have been randomized
 * then the configuration index is NOT the displayed index).
 * @export
 *
 * @param {number}	index	-the 0-based index of the choice to mark as selected.
 *
 ****************************************************************************/
pearson.brix.MultiSelectQuestion.prototype.selectItemAtIndex = function (index)
{
	this.choiceWidget.selectItemAtIndex(index);
};

/* **************************************************************************
 * MultiSelectQuestion.unselectItemAtIndex                            */ /**
 *
 * Unselects the choice in the choice widget at the given index. If the choice is
 * already unselected, do nothing. The index is the displayed choice index and
 * not the config choice index (in other words if the choices have been randomized
 * then the configuration index is NOT the displayed index).
 * @export
 *
 * @param {number}	index	-the 0-based index of the choice to unselect.
 *
 ****************************************************************************/
pearson.brix.MultiSelectQuestion.prototype.unselectItemAtIndex = function (index)
{
	this.choiceWidget.unselectItemAtIndex(index);
};

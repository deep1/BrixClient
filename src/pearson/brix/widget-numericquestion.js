/* **************************************************************************
 * $Workfile:: widget-numericquestion.js                                    $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the NumericQuestion bric.
 *
 * The NumericQuestion widget displays a question and a control
 * for entering a numeric answer (slider, text entry, data point) to be scored.
 * It also has facility for allowing several correct answers, or an answer
 * range.
 *
 * Created on		August 9, 2013
 * @author			Leslie Bondaryk
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.NumericQuestion');

goog.require('pearson.utils.IEventManager');
goog.require('pearson.brix.utils.SubmitManager');
goog.require('pearson.brix.HtmlBric');

// Sample configuration objects for classes defined here
(function()
{
	
	// numericquestion widget config
	var numqConfig =
	{
		//id: "Q1",
		questionId: "SanVan003",
		question: "How high does it go?",
		widget: null, // should be a constructor such as: pearson.brix.Slider,
		widgetConfig: {
			startVal: 12,
			minVal: 12.0,
			maxVal: 18.0,
			stepVal: .1,
			label: "Level:",
			format: d3.format('5.1f'),
			} // 
	};
});


/* **************************************************************************
 * NumericQuestion                                                     */ /**
 *
 * Constructor function for NumericQuestion brix.
 *
 * @constructor
 * @extends {pearson.brix.HtmlBric}
 * @implements {pearson.brix.IQuestionBric}
 * @export
 *
 * @param {Object}		config			-The settings to configure this NumericQuestion
 * @param {string|undefined}
 * 						config.id		-String to uniquely identify this NumericQuestion.
 * 										 if undefined a unique id will be assigned.
 * @param {string}		config.questionId
 * 										-Scoring engine Id of this question
 * @param {string}		config.question	-The HTML question being posed to the user which should
 * 										 be answered by choosing one of the presented choices.
 * @param {Array|undefined}		
 *						config.svgSize	-Two element array with the maxWidth and Height of the 
 *										 svg container, if the widget is an SVG widget.
 * @param {!function(Object, !pearson.utils.IEventManager=)}
 * 						config.widget	-The constructor for a widget that enables a numeric input.
 * @param {!Object}		config.widgetConfig
 * 										-The configuration object for the specified widget
 * 										 constructor without the id properties which
 * 										 will be added by this question constructor.
 * @param {!pearson.utils.IEventManager=}
 * 						eventManager	-The event manager to use for publishing events
 * 										 and subscribing to them.
 *
 * @classdesc
 * The NumericQuestion widget displays a question and a set of possible
 * answers one of which must be selected and submitted to be scored.
 *
 ****************************************************************************/
pearson.brix.NumericQuestion = function (config, eventManager)
{
	// call the base class constructor
	goog.base(this);

	/**
	 * A unique id for this instance of the select one question widget
	 * @type {string}
	 */
	this.id = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.NumericQuestion);

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
	 * The event manager to use to publish (and subscribe to) events for this widget
	 * @type {!pearson.utils.IEventManager}
	 */
	this.eventManager = eventManager || pearson.utils.IEventManager.dummyEventManager;

	var widgetConfig = config.widgetConfig;

	widgetConfig.id = this.id + "_wdgt";

	this.svgSize = config.svgSize;


	/**
	 * The widget used to present the numeric entry to answer
	 * this question.
	 * @type {!pearson.brix.HtmlBric}
	 */
	this.choiceWidget = new config.widget(widgetConfig, this.eventManager);

	// The configuration options for the submit button
	var submitBtnConfig =
	{
		id: this.id + "_sbmtBtn",
		text: "Select an answer",
		enabled: false
	};

	/**
	 * The button widget which allows the answer to the question to be submitted
	 * for scoring.
	 * @type {!pearson.brix.Button}
	 */
	this.submitButton = new pearson.brix.Button(submitBtnConfig, this.eventManager);

	/**
	 * List of responses that have been received for all submitted
	 * scoring requests.
	 * @type {Array.<Object>}
	 */
	this.responses = [];

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

	/**
	 * The event id published when the submit button is clicked.
	 * @const
	 * @type {string}
	 */
	this.submitScoreRequestEventId = this.id + "_submitAnswerRequest";

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

	// subscribe to events of our 'child' widgets
	var that = this;
	eventManager.subscribe(this.submitButton.pressedEventId, function () {that.handleSubmitRequested_();});
	eventManager.subscribe(this.choiceWidget.changedValueEventId, function () {that.handleAnswerSelected_();});

	/**
	 * Information about the last drawn instance of this widget (from the draw method)
	 * @type {Object}
	 */
	this.lastdrawn =
		{
			container: null,
			widgetGroup: null,
		};
}; // end of numericquestion constructor
goog.inherits(pearson.brix.NumericQuestion, pearson.brix.HtmlBric);

/**
 * Prefix to use when generating ids for instances of numericquestion.
 * @const
 * @type {string}
 */
pearson.brix.NumericQuestion.autoIdPrefix = "numQ_auto_";

/* **************************************************************************
 * NumericQuestion.handleSubmitRequested_                              */ /**
 *
 * Handle the pressed event from the submit button which means that we want
 * to fire the submit answer requested event.
 * @private
 *
 ****************************************************************************/
pearson.brix.NumericQuestion.prototype.handleSubmitRequested_ = function ()
{
	var that = this;
	var submitAnsDetails =
		{
			question: this,
			questionId: this.questionId,
			answerKey: "001",
			submissionValue: this.choiceWidget.getValue(),
			responseCallback: function (responseDetails) { that.handleSubmitResponse_(responseDetails); }
		};

	this.eventManager.publish(this.submitScoreRequestEventId, submitAnsDetails);
};

/* **************************************************************************
 * NumericQuestion.handleAnswerSelected_                               */ /**
 *
 * Handle the selected event from the choice widget which means that the
 * submit button can be enabled.
 * @private
 *
 ****************************************************************************/
pearson.brix.NumericQuestion.prototype.handleAnswerSelected_ = function ()
{
	this.submitButton.setText("Submit Answer");
	this.submitButton.setEnabled(true);
};

/* **************************************************************************
 * NumericQuestion.handleSubmitResponse_                               */ /**
 *
 * Handle the response to submitting an answer.
 * @private
 *
 * @param {Object}	responseDetails	-An object containing details about how
 * 									 the submitted answer was scored.
 *
 ****************************************************************************/
pearson.brix.NumericQuestion.prototype.handleSubmitResponse_ = function (responseDetails)
{
	this.responses.push(responseDetails);

	var responseDiv = this.lastdrawn.widgetGroup.select("div.responses");

	// For now just use the helper function to write the response.
	pearson.brix.utils.SubmitManager.appendResponseWithDefaultFormatting(responseDiv,
            /**@type {{correctness: number, feedback: string, submission: string}}*/ (responseDetails));
};

/* **************************************************************************
 * NumericQuestion.draw                                                */ /**
 *
 * Draw this numericquestion in the given container.
 * @export
 *
 * @param {!d3.selection}
 *					container	-The container html element to append the
 *								 question element tree to.
 *
 ****************************************************************************/
pearson.brix.NumericQuestion.prototype.draw = function (container)
{
	this.lastdrawn.container = container;
	
	// make a div to hold the select one question
	var widgetGroup = container.append("div")
		.attr("class", "widgetnumericquestion")
		.attr("id", this.id);

	var question = widgetGroup.append("p")
		.attr("class", "question")
		.html(this.question);
	
	var choiceWidgetCntr = widgetGroup.append("div")
		.attr("class", "choices")
		.attr("id", "choice_id");

	// check if it's an SVG widget with a size, in which case
	// create 

	if (Array.isArray(this.svgSize)){

		var mcSVG = new pearson.brix.SVGContainer({
			node: d3.select("#choice_id"),
			maxWid: this.svgSize[0],
			maxHt: this.svgSize[1]
		});

		mcSVG.append(this.choiceWidget);
	}
	
	else {
		this.choiceWidget.draw(choiceWidgetCntr);
	}

	// draw the submit button 

	this.submitButton.draw(choiceWidgetCntr);

	widgetGroup.append("div")
		.attr("class", "responses");

	this.lastdrawn.widgetGroup = widgetGroup;

}; // end of NumericQuestion.draw()


/* **************************************************************************
 * $Workfile:: answermanpolling.js                                          $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of a AnswerMan for Poll.
 *               
 * The AnswerProvider is direct replacement of AnsManager, but instead of
 * function, it is a class extending the BricBase class.
 *
 * Created on		July 9, 2013
 * @author			Young-Suk Ahn Park
 *
 * Copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.AnswerManPolling');


/* **************************************************************************
 * AnswerManPolling                                                    */ /**
 *
 * The AnswerMan widget creates a clickable html button that publishes events.
 *
 * @constructor
 * @export
 *
 **************************************************************************/
pearson.brix.AnswerManPolling = function ()
{
};

/* **************************************************************************
 * AnswerMan.submitAnswer                                              */ /**
 *
 * Mock scoring engine.
 * @export
 *
 * @param {string} 		sequenceNode	-The sequence node id of the activity being scored.
 * @param {string} 		studAnswerKey	-The student's answer key.
 * @param {string} 		studAnswerValue	-The student's answer value.
 *
 * @return {Object} - The object literal 
 * 			{submission:<the studAnswerKey>,
 *			feedback: <what will be displayed back to the student>,
 *			score: <the numeric score>}
 ****************************************************************************/
pearson.brix.AnswerManPolling.prototype.submitAnswer = function(sequenceNode, studAnswerKey, studAnswerValue) 
{
	if (!(studAnswerKey in this.statData))
	{
		this.statData[studAnswerKey] = 0;
	}

	// increment the count of times this answer was submitted
	++this.statData[studAnswerKey];

	var responseHtml = "<div class='alert alert-success'><i class='icon-ok-sign'></i> " +
		"OK " + studAnswerKey + " selected " + this.statData[studAnswerKey] + " times. </div>";

	var scored = {
					submission: studAnswerKey,
					feedback: responseHtml
				 };

	return scored;
};

/**
 * statData is in desperate need of a description! -mjl
 * Being defined like this makes it used by ALL instances of AnswerManPolling,
 * so what is it's purpose? Are you sure it shouldn't be an instance variable?
 * @type {Object}
 */
pearson.brix.AnswerManPolling.prototype.statData = {};

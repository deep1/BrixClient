/* **************************************************************************
 * $Workfile:: Neff12activitydb.js                                            $
 * *********************************************************************/ /**
 *
 * @fileoverview Defines a fake database used by the mock scoring engine.
 * This database is for the Neff Ch 12 Class Test demo problems.
 *
 * If it had been possible to read a local JSON file, this would not define
 * a global variable, the scoring engine would have processed a strict
 * JSON file.
 *
 * Created on		Sept 9, 2013
 * @author			Leslie Bondaryk
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

//goog.provide('pearson.brix.test.activitiesNeff');

// JSON FakeActiviyDB Document
/**
 * activities is a test object used as a scoring database.
 * It is an object whose keys are the sequenceNodeId's that identify
 * the activity being scored, and the value contains properties used by
 * the mock scoring engine {@link pearson.brix.AnswerMan}.
 * @type {Object}
 */
var activitiesNeff =
{		
	"Neff12001": 
		{ 
		question: "What happens to population growth rates when (on average) women have their first child later in life?",
		"answer0": {
				content: "Growth rates increase a little",
				score: 0,
				response: "If women start having children later, are they likely to have more children or fewer children over their lifetime?"
				},
		"answer1": {
				content: "Growth rates increase a lot",
				score: 0,
				response: "If women start having children later, are they likely to have more children or fewer children over their lifetime?"
				},
		"answer2": {
				content: "Growth rates are unaffected by this statistic",
				score: 0,
				response: "If women start having children later, are they as likely to have as many children as they would if they had started having children earlier?"
				},
		"answer3": {
				content: "Growth rates decline",
				score: 1,
				response: ""
				},
		"answer4": {
				content: "The important statistic is actually the average age of the father at first childbirth, so this statistic is meaningless",
				score: 0,
				response: "Is the period during which men are able to have children as restrictive as that of women?"
				}
		},
}; // end of pearson.brix.test.activities


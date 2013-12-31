/* **************************************************************************
 * $Workfile:: fakeactivitydb.js                                            $
 * *********************************************************************/ /**
 *
 * @fileoverview Defines a fake database used by the mock scoring engine.
 *
 * If it had been possible to read a local JSON file, this would not define
 * a global variable, the scoring engine would have processed a strict
 * JSON file.
 *
 * Created on		June 18, 2013
 * @author			Leslie Bondaryk
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.test.activities');
goog.provide('pearson.brix.test.extendActivityDb');

goog.require('goog.object');

// JSON FakeActiviyDB Document

/* **************************************************************************
 * extendActivityDb                                                    */ /**
 *
 * Extends the activities database with the additional activities defined
 * in the given object.
 * @export
 *
 * @param {!Object}		additionalActivities	-object containing additional
 * 												 activity answer keys for multiple
 * 												 choice questions.
 ****************************************************************************/
pearson.brix.test.extendActivityDb = function (additionalActivities)
{
	goog.object.extend(pearson.brix.test.activities, additionalActivities);
};

/**
 * activities is a test object used as a scoring database.
 * It is an object whose keys are the sequenceNodeId's that identify
 * the activity being scored, and the value contains properties used by
 * the mock scoring engine {@link pearson.brix.AnswerMan}.
 * @type {Object}
 */
pearson.brix.test.activities =
{		
	"louder": { 
		question: "How high does it go?",
		"001": {
				correctValue: 11,
				score: 1,
				response: "It's one louder."
				},
		},
	"energyUse": { 
		question: "Which country uses the most energy per capita?",
		a01: {
				content:  "US",
				score: 0,
				response: "The US leads overall energy use, but that's partly because of it's large population."
				},
		a02: {
				content:  "Canada",
				score: 0,
				response:  "The Canadians do consume power in a modern cultural fashion, but not excessively.",
				},
		a03: {
				content: "Brazil",
				score: 0,
				response:  "",
				},
		a04: {
				content: "Germany",
				score: 1,
				response:  "",
				},
		a05: {
				content: "Egypt",
				score: 0,
				response:  "",
				}
		},
	"co2Decrease": { 
		question: "What is the average seasonal decrease in CO2 concentration for these three years (high &minus; low)?",
		"001": {
				correctValue: 15.6,
				score: 1,
				response: "For example, in 1972, the difference was 335.5 &minus; 318.77 = 16.73."
				},
		},

	"co2Increase": { 
		question: "What is the average seasonal increase in CO2 concentration for these three years (high &minus; low)?",
		"001": {
				correctValue: 17.3,
				score: 1,
				response: "For example, between 1972 and 1973, the difference was 336.95 &minus; 318.77 = 18.18."
				},
		},

	"co2Yr": { 
		question: "What is the average seasonal increase in CO2 concentration for these three years (high &minus; low)?",
		"001": {
				correctValue: 1.7,
				score: 1,
				response: ""
				},
		},
	"bWarmA": { 
		question: "Why is B (Atlantic) warmer than A (Pacific)",
		answer000: {
				content:  "Because the gulf stream warms to water on the Atlantic coast",
				score: 1,
				response: ""
				},
		answer001: {
				content:  "Because it's shallower",
				score: 0,
				response:  "",
				},
		answer002: {
				content: "Because it's deeper",
				score: 0,
				response:  "",
				},
		answer003: {
				content: "Because it's saltier",
				score: 0,
				response:  "",
				}
		},

	"oceanRegion": { 
		question: "Which region stands out as having either the lowest or the highest overall value for each of the data shown?",
		a01: {
				content:  "Region A, upper Pacific Ocean",
				score: 0,
				response: "While dissolved oxygen and nitrate are extremes, tempeature and salinity are ganged tightly with other values."
				},
		a02: {
				content:  "Region B, upper Atlantic Ocean",
				score: 1,
				response:  "Temperature, salinity, and oxygen are all higher than the others for most depths, and nitrate is substantially lower.",
				},
		a03: {
				content: "Region C, equatorial Pacific Ocean",
				score: 0,
				response:  "",
				},
		a04: {
				content: "Region D, lower Atlantic Ocean",
				score: 0,
				response:  "",
				},
		a05: {
				content: "Region E, South Polar oceans",
				score: 0,
				response:  "",
				}
		},
	"cOxyE": { 
		question: "Why does C (Pacific) have less oxygent than E (by the South Pole)?",
		answer000: {
				content:  "It's colder",
				score: 1,
				response: ""
				},
		answer001: {
				content:  "It's shallower",
				score: 0,
				response:  "",
				},
		answer002: {
				content: "It's saltier",
				score: 0,
				response:  "",
				},
		answer003: {
				content: "Air currents bring more oxygen to the South Pole",
				score: 0,
				response:  "",
				}
		},
	"bSaltyA": { 
		question: "Why is B (Atlantic) warmer than A (Pacific)",
		answer000: {
				content: "The gulf stream carries salt to the mid Atlantic",
				score: 0,
				response: ""
				},
		answer001: {
				content:  "Minimal rainfall and a lot of evaporation occur in the Atlantic",
				score: 1,
				response:  "This area, the saltiest anywhere in the open ocean, is analogous to deserts on land, where little rainfall and a lot of evaporation occur. ",
				},
		answer002: {
				content: "Because it's shallower than the Pacific",
				score: 0,
				response:  "",
				},
		answer003: {
				content: "Because it's more oxygenated",
				score: 0,
				response:  "",
				}
		},

	"cWarmE": { 
		question: "In what month is the CO2 concentration usually the lowest?",
		answer000: {
				content: "Because it is more oxygenated",
				score: 0,
				response: ""
				},
		answer001: {
				content: "Because it is in the Pacific Ocean",
				score: 0,
				response:  "",
				},
		answer002: {
				content: "Because the equator is exposed to more sunlight during the year",
				score: 1,
				response:  "",
				},
		answer003: {
				content: "It is not warmer",
				score: 0,
				response:  "",
				}
		},
	"lowMonth": { 
		question: "In what month is the CO2 concentration usually the lowest?",
		answer000: {
				content: "August",
				score: 1,
				response: "When plants are in leaf and performing photosynthesis, CO<sub>2</sub> drops."
				},
		answer001: {
				content: "May",
				score: 0,
				response:  "You're looking for the lowest concentration, which will occur at the end of the vegitation growth season.",
				},
		answer002: {
				content: "January",
				score: 0,
				response:  "The concentration has little to do with the calendar.",
				},
		answer003: {
				content: "June-July",
				score: 0,
				response:  "You are close, but read the graph more carefully.",
				}
		},

	"highMonth": { 
		question: "In what month is the CO2 concentration usually the highest?",
		answer000: {
				content: "August",
				score: 0,
				response: "When plants are in leaf and performing photosynthesis, CO<sub>2</sub> drops."
				},
		answer001: {
				content: "May",
				score: 1,
				response:  "When plants are just starting their growth season, CO<sub>2</sub> is elevated.",
				},
		answer002: {
				content: "January",
				score: 0,
				response:  "The concentration has little to do with the calendar.",
				},
		answer003: {
				content: "June-July",
				score: 0,
				response:  "You are close, but read the graph more carefully.",
				}
		},



	"SanVan001": { 
		question: "Why does it take less and less time to add each additional billion people to the planet?",
		answer000: {
				content: "Because as the population increases, the absolute number of births increases even though the growth rate stays constant.",
				score: 1,
				response: "Growth rate stays constant."
				},
		answer001: {
				content: "Because the growth rate increases as the population rises.",
				score: 0,
				response:  "Does the growth rate change with population size?",
				},
		answer002: {
				content: "Because the total fertility rate increases with population.",
				score: 0,
				response:  "This might happen, but is it necessarily true?",
				},
		answer003: {
				content: "Because social behaviors change and people decide to have more children.",
				score: 0,
				response:  "This might happen, but is it necessarily true?",
				}
		},
		
	SanVan002: { 
		question: "If a tree falls in the forest, and no one is there to hear it, does it make a sound?",
		answer000: {
				content: "True",
				score: 1,
				response: "Very practical."
				},
		answer001: {
				content: "False",
				score: 0,
				response:  "Philosophically interesting, but not strictly true.",
				}
		},
		
	SanVan003: { 
		question: "It's important to rock. Set the volume to the appropriate level using the slider below.",
		answer000: {
				content: "0",
				score: 0,
				response: "That's no way to rock."
				},
		answer011: {
				content: "11",
				score: 1,
				response:  "It's one louder.",
				}
		},

	"SanVan004": { 
		question: "How do you *know* she's a witch?",
		"newt": {
				content: "Because she turned me into a newt.",
				score: 0,
				response: "You're not a newt now."
				},
		"nose": {
				content: "Because she has a long nose.",
				score: 0,
				response:  "Do not judge a witch by the length of their nose!",
				},
		"floats": {
				content: "Because she floats on water.",
				score: 1,
				response:  "Witches are lighter than water.",
				},
		"daylight": {
				content: "Because she's afraid of daylight.",
				score: 0,
				response:  "I believe you are thinking of vampires.",
				},
		},
	"ThrowTheBall": { 
		question: "Set the initial velocity and angle of the throw such that the player makes the basket.",
		"notright": {
				content: "",
				score: 0,
				response: "That velocity and angle will miss the basket."
				},
		"right": {
				content: "v<sub>i</sub> = 7.3, &theta; = 59&deg;",
				score: 1,
				response:  "Right on target.",
				}
		},
	"LabelsMC": { 
		question: "Which of these is on top.",
		"top": {
				content: "A",
				score: 1,
				response: "Glad you know which end is up."
				},
		"middle": {
				content: "B",
				score: 0.5,
				response:  "Try going all the way up.",
				},
		"bottom": {
				content: "C",
				score: 0,
				response:  "You seem to be upside down.",
				}
		},
	"Resist1": { 
		"question": "What is the change in resistance for a wire of greater cross-section?",
		"smaller": {
				content: "smaller resistance",
				score: 1,
				response:  "More area allows more room for electrons to move and pass charge."
				},
		"greater": {
				content: "greater resistance",
				score: 0,
				response:   "More area allows more room for electrons to move and pass charge.",
				},
		"same": {
				content: "the same resistance",
				score: 0,
				response:  "More area allows more room for electrons to move and pass charge.",
				}
		},
	"Resist2": {
		"question": "What is the change in resistance for a wire of shorter length?",
		"smaller": {
				content: "smaller resistance",
				score: 1,
				response:  "More length impedes electrons, making it harder to pass charge."
				},
		"greater": {
				content: "greater resistance",
				score: 0,
				response:   "More length impedes electrons, making it harder to pass charge.",
				},
		"same": {
				content: "the same resistance",
				score: 0,
				response:  "More length impedes electrons, making it harder to pass charge.",
				}
		},
	"mortality": {
		"question": "Disparities in health exist among racial groups because of ",
		"answer000": {
				content: "differing socioeconomic and environmental conditions",
				score: 1,
				response:  "A variety of conditions, including cultural perspectives, financial resources, and structural or societal barriers contribute to the imbalance.",
				},
		"answer001": {
				content: "availability/affordability of insurance",
				score: 2,
				response:  "This is certainly a contributing factor, but is it the only reason?",
				},
		"answer002": {
				content: "barriers to health literacy",
				score: 2,
				response:  "This is certainly a contributing factor, but is it the only reason?",
				},
		"answer003": {
				content: "linguistic barriers",
				score: 2,
				response:  "This is certainly a contributing factor, but is it the only reason?",
				},
		},
	// Chad's questions
	"pop200": {
		"question": "Based on the graph, what average population growth rate looks like the best predictor of population increases over the past 200 years",
		"answer000": {
				content: "0.5%",
				score: 0,
				response:  "That is not correct."
				},
		"answer001": {
				content: "1.0%",
				score: 1,
				response:   "Good guess...",
				},
		"answer002": {
				content: "1.5%",
				score: 0,
				response:  "That is not correct.",
				},
		"answer003": {
				content: "2.0%",
				score: 0,
				response:   "That is not correct.",
				},
		"answer004": {
				content: "2.5%",
				score: 0,
				response:  "That is not correct.",
				}
		},
	// End of Chad's stuff
	"http://hub.paf.pearson.com/resources/sequences/123/nodes/1": {
		"1": {
				content: "1",
				score: 1,
				response: "There can be only 1",
			},
		},
}; // end of pearson.brix.test.activities


/* **************************************************************************
 * $Workfile:: widget-callouts.js                                          $
 * **********************************************************************//**
 *
 * @fileoverview Implementation of the slider widget.
 *
 * The callout widget creates sequential keyed blobs of HTML for highlight
 * association with a labeled, keyed image.  Can be shown individually or as 
 * a table.
 *
 * Created on		April 16, 2013
 * @author			Leslie Bondaryk
 * @author			Michael Jay Lippert
 *
 * Copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

// Sample Callout constructor configuration
(function()
{
var callOutConfig = {
		id: "callme",
		node: d3.select("#steps"),
		textBits: [
		{content: 
		"1. In a closed circuit, (green) water is pumped at high pressure to the reactor core."},
		{content: 
		"2. Heat is generated by fission in the fuel rods in the reactor core, which heats the circulating water. Thick layers of concrete and steel or lead contain the reactor core’s radioactivity."},
		{content: 
		"3. In the steam generator, the energy from the heated water is used to boil water from a separate supply. The resulting steam moves through a pipe to a turbine."},
		{content: 
		"4. The steam turns the turbine, which is connected to an electricity generator. Power lines distribute the electricity. A typical reactor produces as much as a coal-fired power plant."},
		{content: 
		"5. A third supply of water is used to cool the steam so it condenses into water, which is pumped back to the steam generator."}
		]
	};
});
	
/* **************************************************************************
 * Callouts	                                                            *//**
 *
 * @constructor
 *
 * The callout widget creates HTML blobs of explanatory (callout) text. 
 * They are designed to be used with a keyed, interactive image and appear
 * either one at a time or highlighted one at a time when the user clicks on 
 * related tags over an image.
 *
 * @param {Object}		config			-The settings to configure this widget
 * @param {string}		config.id		-String to uniquely identify this widget
 * @param {string}		config.type		-String to specify table ("all") or box ("one")
*  
 * @param {Object}		config.textBits	- array of objects
 * @param {string}		config.textBits.headers - 
 * @param {string}		textBits.content.text- strings to be displayed in cols, may contain
 *										  tags or extended characters
 * @param {string}		textBits.content.key	- string used to relate the content
 *										  to other page elements (optional)
 *
 * NOTES: TODO there is a desire to show all text when in landscape, but just 
 * the highlighted text in portrait, and I'm not sure how best to achieve that.
 **************************************************************************/

function Callouts(config,eventManager)
{
	/**
	 * A unique id for this instance of the widget
	 * @type {string}
	 */
	this.id = config.id;
	this.textBits = config.textBits;
	this.type = config.type;
	this.eventManager = eventManager;
	// Define the ids of the events the slider uses
	this.selectedEventId = this.id + '_Callout';
	 	
} // end of barChart constructor


/* **************************************************************************
 * Callouts.draw                                                       *//**
 *
 * The Slider allows the user to set a numeric value over some defined range.
 *
 * @param {!d3.selection}
 *					container	-The container DOM element to append the slider
 * @param {node}		node		- d3 selection of target ID to write out slider
 *
 ****************************************************************************/
   

Callouts.prototype.draw = function (node) { //begin callout drawing method

	this.node = node;
	
	var numLabels = this.textBits.length;
	
	var that = this;
	//this.rootEl = <div>A bunch of text that swaps here and has visibility set</div>
	//TODO make the class or the style so that these stack up and only one is visible
	//use the event handlers
	this.rootEl = this.node.append("div").attr("id", that.id).style("display","block");
	
	if(this.type == "table"){
		var table = this.rootEl.append("table").attr("class", "data");
		
		if(this.textBits.headers){
			var headRow = table.append("thead").attr("class", "data").append("tr");
			headRow.selectAll("td").data(this.textBits.headers).enter()
				.append("td")
					.html(function(d) {
							return d;
							});
		}
	//Show the data in a table
	this.calloutCollection = table.append("tbody").selectAll("tr").data(this.textBits.content);
	var rows = this.calloutCollection.enter().append("tr")
	//creates as many rows as there are elements in textBits
		.attr("id", function(d,i) {
			return that.id + (d.key ? d.key : i);
			})
		.attr("class", "dataTable");

	rows.selectAll("td")
		.data(function(d) {
			return d3.values(d);
			}) 
	//values will return one entry for each key in the data.  So, if you
	//supply col0, col1, etc., you get multiple columns.
		.enter().append("td")
		.html(function(d) {
				return d;
				});
	} else {
		this.calloutCollection = this.rootEl.selectAll("span.callouts").data(that.textBits.content);
		this.calloutCollection.enter()
		.append("span")
		.attr("class","callOut")
		.text(function(d, i) {
				return d3.values(d);})//make the callouts
		.style("display","none") //all callouts start out hidden
		.attr("id",function(d,i) {
			return that.id + (d.key ? d.key : i);
			});

	console.log("Callouts made");

	//show the first one by default
	d3.select("#" + that.id + (that.textBits.content[0].key ? that.textBits.content[0].key : 0))
	.style("display","block");
	}
	
	this.calloutCollection.on('click',
		function (d, i)
			{
				that.eventManager.publish(that.selectedEventId, {labelIndex: (d.key ? d.key : i)});
			});
	

} //end Callouts object draw function

/* ********************************************************************
* calloutSwap                                                     *//**
*
* Updates the Callouts widget to display the text that matches 
* the currently selected index, lite.
*
* @param lite				the index or key specifying which of a
*							collection to lite up
*
* NOTES: this is currently all based on members of a collection having
* ID's that have the litekey or index appended to them after the ID. Maybe
* want to redo this based on properties? Handles either the one-at-a-time
* callOuts display or the table highlight display.
***********************************************************************/
Callouts.prototype.calloutSwap = function (lite)
	{
		console.log("TODO: fired callout swap log", lite);
		//hide all 
		var unset = d3.selectAll(".callOut");
		//TODO what I need is a better way to know which collection
		//of labels to turn off. Doing it by class seems lame.
		unset
			.style("display","none");
		
		var set = d3.selectAll("#" + this.id + lite);
		set
			.style("display","block");
		
		var unset = 
			d3.selectAll(".dataTable");
		//TODO what I need is a better way to know which collection
		//of labels to turn off. Doing it by class seems lame.
		unset
		.style("color",null)
		.style("border",null)
		.style("background-color",null);
		
		var set = d3.selectAll("#" + this.id + lite);
		set
			.style("font-weight", "500")
		//this slight bolding works in svg text, but is not really visible
		//in table text. On the up side, it doesn't change width so much,
		//so the letter spacing isn't necessary.
		//.style("letter-spacing","-.07em")
			.style("color", "#1d456e")
			.style("border", "2px solid #bce8f1")
			.style("background-color", "#E3EFFE");
	}

/* ********************************************************************
* calloutLite                                                     *//**
*
* Updates the Callouts widget to display the text that matches 
* the currently selected index, lite.
*
* @param lite				the index or key specifying which of a
*							collection to lite up
*
* NOTES: this is currently all based on members of a collection having
* ID's that have the litekey or index appended to them after the ID.
***********************************************************************/
Callouts.prototype.calloutLite = function (lite)
	{
		console.log("TODO: fired callout Lite log", lite);
		//hide all 
		var unset = 
			d3.selectAll(".dataTable");
		//TODO what I need is a better way to know which collection
		//of labels to turn off. Doing it by class seems lame.
		unset
		.style("color",null)
		.style("border",null)
		.style("background-color",null);
		
		var set = d3.selectAll("#" + this.id + lite);
		set
		.style("font-weight", "500")
		//this slight bolding works in svg text, but is not really visible
		//in table text. On the up side, it doesn't change width so much,
		//so the letter spacing isn't necessary.
		//.style("letter-spacing","-.07em")
		.style("color", "#1d456e")
		.style("border", "2px solid #bce8f1")
		.style("background-color", "#E3EFFE");
	
	}

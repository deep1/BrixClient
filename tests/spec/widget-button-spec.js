/* **************************************************************************
 * widget-button-spec.js                                                    $
 * **********************************************************************//**
 *
 * @fileoverview Button widget unit tests
 *
 * Created on		June 17, 2013
 * @author			Michael Jay Lippert
 *
 * Copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

'use strict';


(function () {
    var expect = chai.expect;

	var EventManager = pearson.utils.EventManager;
	var Button = pearson.brix.Button;

	var expectElementTree = function expectElementTree(topElement, treeDescr)
	{
		expectElement(topElement, treeDescr);

		if (treeDescr.children)
		{
			var childElements = topElement.node().children;
			for (var i = 0; i < treeDescr.children.length; ++i)
			{
				expectElementTree(d3.select(childElements[i]), treeDescr.children[i]);
			};
		}
		else if (treeDescr.foreach)
		{
			var childElements = topElement.node().children;
			for (var i = 0; i < treeDescr.foreach.items.length; ++i)
			{
				expectElementTree(d3.select(childElements[i]),
								  treeDescr.foreach.fn(treeDescr.foreach.items[i]));
			};
		}
	};

	var expectElement = function expectElement(element, descr)
	{
		descr.name && expect(element.node().nodeName).to.be.equal(descr.name);
		descr.class && expect(element.classed(descr.class), 'has class ' + descr.class).to.be.true;
	};

	// reference to The Great Race (http://www.youtube.com/watch?v=7xwkGNVOhNw)
    describe('Buttons: Push the button Max!', function () {
		var eventManager = null;

        describe('Creating a Button', function () {
			var configButton =
				{
					id: "btn1",
					text: "The Button"
				};
	
			var myButton = null;
			var pressedEventCount = 0;
			var lastPressedEventDetails = null;
			var logPressedEvent =
				function logPressedEvent(eventDetails)
				{
					++pressedEventCount;
					lastPressedEventDetails = eventDetails;
				};

			before(function () {
				eventManager = new EventManager();
				pressedEventCount = 0;
				lastPressedEventDetails = null;

				myButton = new Button(configButton, eventManager);
				eventManager.subscribe(myButton.pressedEventId, logPressedEvent);
			});
			
            it('should have the id that was specified in the config', function () {
                expect(myButton.getId()).to.equal(configButton.id);
            });

			it('should have the eventManager given to the constructor', function () {
                expect(myButton.eventManager).to.equal(eventManager);
			});

			it('should have an uninitialized lastdrawn property', function () {
                expect(myButton.lastdrawn).to.have.property('container').that.is.null;
                expect(myButton.lastdrawn).to.have.property('widgetGroup').that.is.null;
            });

			describe('DOM manipulation (create/update elements) tests', function () {
				var cntrNode = null;

				after(function () {
					// Clean up test modifications to the DOM
					cntrNode && d3.select(cntrNode).remove();
				});
					
				describe('.draw()', function () {
					before(function () {
						cntrNode = helper.createNewDiv();
						myButton.draw(d3.select(cntrNode));
					});
					
					it('should set the lastdrawn container property to the value passed in', function () {
						expect(myButton.lastdrawn.container.node()).to.deep.equal(cntrNode);
					});

					it('should have appended a div element with class \'brixButton\' to the container' +
					   ' and set the lastdrawn.widgetGroup to that d3 selection', function () {
						// get the last element of the container
						var last = d3.select(cntrNode).select(":last-child");
						expect(last.node().nodeName).to.equal('DIV');
						expect(last.classed('brixButton'), 'has class brixButton').to.be.true;
						expect(myButton.lastdrawn.widgetGroup.node()).to.deep.equal(last.node());
					});

					it('should create a table w/ a row for each choice', function () {
						/*
						 div.brixButton
						 	button[type='button']
						 */
						var tree =
							{ name: 'DIV', class: 'brixButton', children:
								[ { name: 'BUTTON'
								} ],
							};

						expectElementTree(myButton.lastdrawn.widgetGroup, tree);
					});
				});
			});	
		});
    });
})();

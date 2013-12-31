/* **************************************************************************
 * widget-radiogroup-spec.js                                                $
 * **********************************************************************//**
 *
 * @fileoverview RadioGroup widget unit tests
 *
 * Created on       June 13, 2013
 * @author          Leslie Bondaryk
 *
 * Copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

'use strict';


(function () {
    var expect = chai.expect;

    var EventManager = pearson.utils.EventManager;
    var SelectGroup = pearson.brix.SelectGroup;

    describe('SelectGroups: Pick one from column A', function () {
        var eventManager = null;

        describe('Creating a SelectGroup w/ 3 choices', function () {
            var configSelGrp =
            {
            id: "seas",
            choices: [
            {
            content: "Sea Surface Temperature",
            },
            {
            content: "Sea Height Anomoly", key: "deep",
            },
            {
            content: "Depth to 26&deg;C Isotherm",
            }]};


            var mySelectGroup = null;
            var selectEventCount = 0;
            var lastSelectEventDetails = null;
            var logSelectEvent =
                function logSelectEvent(eventDetails)
                {
                    ++selectEventCount;
                    lastSelectEventDetails = eventDetails;
                };
            //before clause sets the environment before the item is written
            before(function () {
                //Instantiate necessary objects like the eventManager, other vars
                eventManager = new EventManager();
                selectEventCount = 0;
                lastSelectEventDetails = null;

                //create a SelectGroup object with the above config and an eventManager
                mySelectGroup = new SelectGroup(configSelGrp, eventManager);
                eventManager.subscribe(mySelectGroup.changedValueEventId, logSelectEvent);
            });

            it('should have the id that was specified in the config', function () {
                expect(mySelectGroup.getId()).to.equal(configSelGrp.id);
            });
            //we may choose to add keys to dropdowns so they can participate in highlighting
            //in which case this test will have to invert - lb
            it('should not create keys for choices w/o a key', function () {
                expect(mySelectGroup.choices[0]).to.not.have.property('key');
                expect(mySelectGroup.choices[2]).to.not.have.property('key');
            });

            it('should leave existing keys on choices unchanged', function () {
                expect(mySelectGroup.choices[1]).to.have.property('key', 'deep').that.is.a('string');
            });

            it('should have the eventManager given to the constructor', function () {
                expect(mySelectGroup.eventManager).to.equal(eventManager);
            });

            it('should have an uninitialized lastdrawn property', function () {
                expect(mySelectGroup.lastdrawn).to.have.property('container').that.is.null;
                expect(mySelectGroup.lastdrawn).to.have.property('widgetGroup').that.is.null;
                expect(mySelectGroup.lastdrawn).to.have.property('choiceSelected').that.is.null;
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
                        mySelectGroup.draw(d3.select(cntrNode));
                    });

                    it('should set the lastdrawn container property to the value passed in', function () {
                        expect(mySelectGroup.lastdrawn.container.node()).to.deep.equal(cntrNode);
                    });

                    it('should have appended a span element with class \'widgetSelectGroup\' to the container' +
                       ' and set the lastdrawn.widgetGroup to that d3 selection', function () {
                        // get the last element of the container
                        var last = d3.select(cntrNode).select(":last-child");
                        expect(last.node().nodeName).to.equal('SPAN');
                        expect(last.classed('widgetSelectGroup'), 'has class widgetSelectGroup').to.be.true;
                        expect(mySelectGroup.lastdrawn.widgetGroup.node()).to.deep.equal(last.node());
                    });

                    //We could have a more manual test where we check that there are three
                    //options made for the three choices in the config.  But this actually
                    //checks the whole tree is created correctly.
                    it('should create a dropdown w/ an option for each choice', function () {
                        /*
                        Here's a visual layout of the HTML tree that should be drawn
                        by the SelectGroup widget

                         span.widgetSelectGroup[name=this.id]
                            select
                                option [value='answerKey']
                         */
                        var tree =
                            { name: 'SPAN', class: 'widgetSelectGroup', children:
                                [ { name: 'SELECT',
                                        foreach: { items: configSelGrp.choices,
                                                    fn: function (choice)
                                                           {
                                                               var choiceTree =
                                                                    { name: 'OPTION'};

                                                               return choiceTree;
                                                           }
                                                    }
                                        } ]
                            };

                        helper.expectElementTree(mySelectGroup.lastdrawn.widgetGroup, tree);
                    });
                });

                describe('.setSelectedIndex()', function () {
                    it.skip('should publish the selectgroup.changedValueEventId with the index', function () {
                        var prevSelectEventCount = selectEventCount;
                        mySelectGroup.setSelectedIndex(1);
                        expect(selectEventCount).is.equal(prevSelectEventCount + 1);
                        expect(lastSelectEventDetails.selectedIndex).is.equal(1);
                    });

                    it.skip('should change the selection when selecting an unselected item', function() {
                        // Arrange - item 1 is selected
                        mySelectGroup.setSelectedIndex(1);
                        var prevSelectEventCount = selectEventCount;
                        lastSelectEventDetails = null;
                        // Act - change the selection to item 2
                        mySelectGroup.setSelectedIndex(2);
                        // Assert - select event was published
                        expect(selectEventCount, "select event count").is.equal(prevSelectEventCount + 1);
                        expect(lastSelectEventDetails.selectedIndex).is.equal('ans3');
                    });

                    it.skip('should do nothing when selecting an already selected item (no event)', function() {
                        // Arrange - item 1 is selected
                        mySelectGroup.setSelectedIndex(1);
                        var prevSelectEventCount = selectEventCount;
                        lastSelectEventDetails = null;
                        // Act - re-select item 1
                        mySelectGroup.setSelectedIndex(1);
                        // Assert - select event was not published
                        expect(selectEventCount, "select event count").is.equal(prevSelectEventCount);
                        expect(lastSelectEventDetails).to.be.null;
                    });

                    it.skip('MANUAL TEST: should publish selectedEventId when selection is made w/ mouse or keyboard', function() {
                    });
                });

                describe('.getSelectedIndex()', function () {
                    before(function () {
                        cntrNode && d3.select(cntrNode).remove();
                        cntrNode = helper.createNewDiv();
                        mySelectGroup.draw(d3.select(cntrNode));
                    });

                    it.skip('should return null when no item is selected', function () {
                        expect(mySelectGroup.getSelectedIndex()).is.equal(-1);
                    });

                    it.skip('should return the selected choice, even after the choice has been changed', function () {
                        // 1st selection
                        mySelectGroup.setSelectedIndex(1);
                        expect(mySelectGroup.getSelectedIndex()).is.deep.equal(1);

                        // selection beyond length of array
                        mySelectGroup.setSelectedIndex(3);
                        expect(mySelectGroup.getSelectedIndex()).is.deep.equal(null);

                        // 3rd selection is before the current selection
                        mySelectGroup.setSelectedIndex(0);
                        expect(mySelectGroup.getSelectedIndex()).is.deep.equal(0);
                    });
                });
            });
        });
    });
})();

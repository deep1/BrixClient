/* **************************************************************************
 * widget-radiogroup-spec.js                                                $
 * **********************************************************************//**
 *
 * @fileoverview RadioGroup widget unit tests
 *
 * Created on       June 5, 2013
 * @author          Michael Jay Lippert
 *
 * Copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

'use strict';

(function () {
    var expect = chai.expect;

    var EventManager = pearson.utils.EventManager;
    var RadioGroup = pearson.brix.RadioGroup;

    describe('RadioGroups: broadcasting for an answer', function () {
        var eventManager = null;

        describe('Creating a RadioGroup w/ 4 choices', function () {
            var Q1Choices =
                [
                    {
                        content: "Because as the population increases, the absolute number of births increases even though the growth rate stays constant.",
                        response: "Growth rate stays constant.",
                        answerKey: "ans1"
                    },
                    {
                        content: "Because the growth rate increases as the population rises.",
                        response: "Does the growth rate change with population size?",
                        answerKey: "ans2",
                        key: "foo"
                    },
                    {
                        content: "Because the total fertility rate increases with population.",
                        response: "Does the fertility rate change with population size?",
                        answerKey: "ans3"

                    },
                    {
                        content: "Because social behaviors change and people decide to have more children.",
                        response: "This might happen but is it something is necessarily occurs?",
                        answerKey: "ans4"
                    }
                ];

            var configRadioGroup =
                {
                    id: "rg1",
                    choices: Q1Choices,
                    numberFormat: "latin-upper"
                };

            var myRadioGroup = null;
            var selectEventCount = 0;
            var lastSelectEventDetails = null;
            var logSelectEvent =
                function logSelectEvent(eventDetails)
                {
                    ++selectEventCount;
                    lastSelectEventDetails = eventDetails;
                };

            before(function () {
                eventManager = new EventManager();
                selectEventCount = 0;
                lastSelectEventDetails = null;

                myRadioGroup = new RadioGroup(configRadioGroup, eventManager);
                eventManager.subscribe(myRadioGroup.selectedEventId, logSelectEvent);
            });

            it('should have the id that was specified in the config', function () {
                expect(myRadioGroup.getId()).to.equal(configRadioGroup.id);
            });

            it('should not create keys for choices w/o a key', function () {
                expect(myRadioGroup.choices[0]).to.not.have.property('key');
                expect(myRadioGroup.choices[3]).to.not.have.property('key');
            });

            it('should leave existing keys on choices unchanged', function () {
                expect(myRadioGroup.choices[1]).to.have.property('key', 'foo').that.is.a('string');
            });

            it('should have the eventManager given to the constructor', function () {
                expect(myRadioGroup.eventManager).to.equal(eventManager);
            });

            it('should have an uninitialized lastdrawn property', function () {
                expect(myRadioGroup.lastdrawn).to.have.property('container').that.is.null;
                expect(myRadioGroup.lastdrawn).to.have.property('widgetGroup').that.is.null;
                expect(myRadioGroup.lastdrawn).to.have.property('choiceSelected').that.is.null;
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
                        myRadioGroup.draw(d3.select(cntrNode));
                    });

                    it('should set the lastdrawn container property to the value passed in', function () {
                        expect(myRadioGroup.lastdrawn.container.node()).to.deep.equal(cntrNode);
                    });

                    it('should have appended a div element with class \'brixRadioGroup\' to the container' +
                       ' and set the lastdrawn.widgetGroup to that d3 selection', function () {
                        // get the last element of the container
                        var last = d3.select(cntrNode).select(":last-child");
                        expect(last.node().nodeName).to.equal('DIV');
                        expect(last.classed('brixRadioGroup'), 'has class brixRadioGroup').to.be.true;
                        expect(myRadioGroup.lastdrawn.widgetGroup.node()).to.deep.equal(last.node());
                    });

                    it('should create a table w/ a row for each choice', function () {
                        /*
                         div.brixRadioGroup
                            table.questionTable
                                tbody
                                    foreach choice
                                        tr
                                            td
                                                input[type='radio'][name=this.id]
                                            td
                                                label
                         */
                        var tree =
                            { name: 'DIV', class: 'brixRadioGroup', children:
                                [ { name: 'TABLE', class: 'questionTable', children:
                                        [ { name: 'TBODY',
                                            foreach: { items: configRadioGroup.choices,
                                                       fn: function (choice)
                                                           {
                                                               var choiceTree =
                                                                    { name: 'TR', children:
                                                                        [ { name: 'TD', children:
                                                                            [ { name: 'INPUT' } ]
                                                                          },
                                                                          { name: 'TD', children:
                                                                            [ { name: 'LABEL' } ]
                                                                          },
                                                                        ]
                                                                    };

                                                               return choiceTree;
                                                           }
                                                     }
                                        } ]
                                } ],
                            };

                        helper.expectElementTree(myRadioGroup.lastdrawn.widgetGroup, tree);
                    });
                });

                describe('.selectItemAtIndex()', function () {
                    it('should publish the radiogroup.selectedEventId with the answer key of the item at that index', function () {
                        var prevSelectEventCount = selectEventCount;
                        myRadioGroup.selectItemAtIndex(1);
                        expect(selectEventCount).is.equal(prevSelectEventCount + 1);
                        expect(lastSelectEventDetails.selectKey).is.equal('ans2');
                        expect(lastSelectEventDetails.index).is.equal(1);
                    });

                    it('should change the selection when selecting an unselected item', function() {
                        // Arrange - item 1 is selected
                        myRadioGroup.selectItemAtIndex(1);
                        var prevSelectEventCount = selectEventCount;
                        lastSelectEventDetails = null;
                        // Act - change the selection to item 2
                        myRadioGroup.selectItemAtIndex(2);
                        // Assert - select event was published
                        expect(selectEventCount, "select event count").is.equal(prevSelectEventCount + 1);
                        expect(lastSelectEventDetails.selectKey).is.equal('ans3');
                        expect(lastSelectEventDetails.index).is.equal(2);
                    });

                    it('should do nothing when selecting an already selected item (no event)', function() {
                        // Arrange - item 1 is selected
                        myRadioGroup.selectItemAtIndex(1);
                        var prevSelectEventCount = selectEventCount;
                        lastSelectEventDetails = null;
                        // Act - re-select item 1
                        myRadioGroup.selectItemAtIndex(1);
                        // Assert - select event was not published
                        expect(selectEventCount, "select event count").is.equal(prevSelectEventCount);
                        expect(lastSelectEventDetails).to.be.null;
                    });

                    it.skip('MANUAL TEST: should publish selectedEventId when selection is made w/ mouse or keyboard', function() {
                    });
                });

                describe('.selectedItem()', function () {
                    before(function () {
                        cntrNode && d3.select(cntrNode).remove();
                        cntrNode = helper.createNewDiv();
                        myRadioGroup.draw(d3.select(cntrNode));
                    });

                    it('should return null when no item is selected', function () {
                        expect(myRadioGroup.selectedItem()).to.be.null;
                    });

                    it('should return the selected choice, even after the choice has been changed', function () {
                        // 1st selection
                        myRadioGroup.selectItemAtIndex(1);
                        expect(myRadioGroup.selectedItem()).is.deep.equal(myRadioGroup.choices[1]);

                        // 2nd selection is after the current selection
                        myRadioGroup.selectItemAtIndex(3);
                        expect(myRadioGroup.selectedItem()).is.deep.equal(myRadioGroup.choices[3]);

                        // 3rd selection is before the current selection
                        myRadioGroup.selectItemAtIndex(0);
                        expect(myRadioGroup.selectedItem()).is.deep.equal(myRadioGroup.choices[0]);
                    });
                });

                describe('IChoicePresenter interface', function () {
                    describe.skip('.selectedChoice', function () {
                        it('should return null when there is no selected choice', function () {
                        
                        });

                        it('should return the correct selected choice item from the array of choices given to the config', function () {
                        
                        });
                    });

                    describe.skip('.getChoiceByKey', function () {
                        it('should return null when the given key does not match any choice', function () {
                        
                        });

                        it('should return the correct matching choice item from the array of choices given to the config', function () {
                        
                        });
                    });

                    describe.skip('.selectChoice', function () {
                        it('should set the selected choice to the choice matching the given key and publish the selected event', function () {
                        
                        });

                        it('should do nothing when the choice matching the key is already selected', function () {
                        
                        });

                        it('should do nothing when there is no choice matching the given key', function () {
                        
                        });

                        it('should set the selected choice to the choice matching the given index and publish the selected event', function () {
                        
                        });

                        it('should do nothing when the choice at the given index is already selected', function () {
                        
                        });

                        it('should do nothing when there is no choice at the given index', function () {
                        
                        });
                    });
                
                    describe('.flagChoice', function () {
                        
                        before(function () {
                            cntrNode && d3.select(cntrNode).remove();
                            cntrNode = helper.createNewDiv();
                            myRadioGroup.draw(d3.select(cntrNode));
                        });

                        it('should swap the radio button matching the key with an icon', function () {

                            myRadioGroup.flagChoice('ans3');
                            var selectTheI = myRadioGroup.lastdrawn.widgetGroup.select('i:only-child');
                            var siblingCell = d3.select(selectTheI.node().parentNode.parentNode);
                            var qText = 'Because the total fertility rate increases with population.';
                           
                            // the i element is inserted, and it's alone in it's cell
                            expect(selectTheI[0].length).is.equal(1);
                            // the text in the adjacent cell matches the flag key but offset by the capital letters
                            expect(siblingCell.select('label').text().search(qText)).is.equal(3);
                        });
                    });
                
                });
            });
        });
    });
})();

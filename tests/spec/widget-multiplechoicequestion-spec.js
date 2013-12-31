/* **************************************************************************
 * widget-multiplechoicequestion-spec.js                                    $
 * **********************************************************************//**
 *
 * @fileoverview MultipleChoiceQuestion widget unit tests
 *
 * Created on       June 24, 2013
 * @author          Michael Jay Lippert
 *
 * Copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

'use strict';


(function () {
    var expect = chai.expect;

    var EventManager = pearson.utils.EventManager;
    var MultipleChoiceQuestion = pearson.brix.MultipleChoiceQuestion;
    var BricTypes = pearson.brix.BricTypes;
    var RadioGroup = pearson.brix.RadioGroup;
    var SelectGroup = pearson.brix.SelectGroup;

    // Create a bricworks that has molds for all the brix we need for this test
    var bricWorks = new pearson.brix.BricWorks();
    bricWorks.registerBricMold(BricTypes.MULTIPLECHOICEQUESTION, MultipleChoiceQuestion);
    bricWorks.registerBricMold(BricTypes.RADIOGROUP, RadioGroup);
    bricWorks.registerBricMold(BricTypes.SELECTGROUP, SelectGroup);
    bricWorks.registerBricMold(BricTypes.BUTTON, pearson.brix.Button);

    describe('MultipleChoiceQuestions: choose one and only one', function () {
        var eventManager = null;

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

        describe('Creating a RadioGroup MultipleChoiceQuestion w/ 4 randomized choices', function () {
            var configMultipleChoiceQuestion1 =
                {
                    id: "Q1",
                    question: "Wherefore?",
                    choices: Q1Choices,
                    order: "randomized",
                    presenterType: BricTypes.RADIOGROUP,
                    presenterConfig: { numberFormat: "latin-upper" },
                };

            var myMultipleChoiceQuestion = null;
            var selectEventCount = 0;
            var lastSelectEventDetails = null;
            var logSelectEvent =
                function logSelectEvent(eventDetails)
                {
                    ++selectEventCount;
                    lastSelectEventDetails = eventDetails;
                };

            before(function () {
                // Set the seed for future uses of Math.random so the results are
                // deterministic and we can test them.
                Math.seedrandom("MultipleChoiceQuestion");

                bricWorks.eventManager = new EventManager();
                selectEventCount = 0;
                lastSelectEventDetails = null;

                myMultipleChoiceQuestion = bricWorks.createBric(BricTypes.MULTIPLECHOICEQUESTION, configMultipleChoiceQuestion1);
                bricWorks.eventManager.subscribe(myMultipleChoiceQuestion.selectedEventId, logSelectEvent);
                //eventManager.subscribe(myMultipleChoiceQuestion.submitScoreRequestEventId, logScoreRequestEvent);
            });

            it('should have the id that was specified in the config', function () {
                expect(myMultipleChoiceQuestion.getId()).to.equal(configMultipleChoiceQuestion1.id);
            });

            it('should have a RadioGroup presenterBric', function () {
                expect(myMultipleChoiceQuestion.presenterBric).to.be.an.instanceof(RadioGroup);
            });

            it('should have randomized the choices', function () {
                // We set the random seed above so the randomization would be deterministic
                expect(myMultipleChoiceQuestion.presenterBric.choices[0], "1st choice").to.deep.equal(Q1Choices[3]);
                expect(myMultipleChoiceQuestion.presenterBric.choices[1], "2nd choice").to.deep.equal(Q1Choices[0]);
                expect(myMultipleChoiceQuestion.presenterBric.choices[2], "3rd choice").to.deep.equal(Q1Choices[2]);
                expect(myMultipleChoiceQuestion.presenterBric.choices[3], "4th choice").to.deep.equal(Q1Choices[1]);
            });

            it('should have the eventManager given to the constructor', function () {
                expect(myMultipleChoiceQuestion.eventManager).to.equal(bricWorks.eventManager);
            });

            it('should have an uninitialized private lastdrawn_ property', function () {
                expect(myMultipleChoiceQuestion.lastdrawn_).to.have.property('container').that.is.null;
                expect(myMultipleChoiceQuestion.lastdrawn_).to.have.property('bricGroup').that.is.null;
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
                        myMultipleChoiceQuestion.draw(d3.select(cntrNode));
                    });

                    it('should set the lastdrawn_ container property to the value passed in', function () {
                        expect(myMultipleChoiceQuestion.lastdrawn_.container.node()).to.deep.equal(cntrNode);
                    });

                    it('should have appended a div element with class \'brixMultipleChoiceQuestion\' to the container' +
                       ' and set the lastdrawn_.bricGroup to that d3 selection', function () {
                        // get the last element of the container
                        var last = d3.select(cntrNode).select(":last-child");
                        expect(last.node().nodeName).to.equal('DIV');
                        expect(last.classed('brixMultipleChoiceQuestion'), 'has class brixMultipleChoiceQuestion').to.be.true;
                        expect(myMultipleChoiceQuestion.lastdrawn_.bricGroup.node()).to.deep.equal(last.node());
                    });

                    it('should create a div with sections for the question, choices, button and responses', function () {
                        /*
                         div.brixMultipleChoiceQuestion
                            fieldset
                                legend.question
                                div.choices
                                    div.brixRadioGroup
                            div.feedback
                            div.submit
                                div.brixButton
                         */
                        var tree =
                            { name: 'DIV', class: 'brixMultipleChoiceQuestion', children:
                                [ { name: 'FIELDSET', children:
                                    [ { name: 'LEGEND', class: 'question' },
                                      { name: 'DIV', class: 'choices', children:
                                          [ { name: 'DIV', class: 'brixRadioGroup' } ] },
                                    ] },
                                  { name: 'DIV', children:
                                    [ { name: 'DIV', class: 'submit', children:
                                          [ { name: 'DIV', class: 'brixButton' } ] },
                                      { name: 'SPAN', class: 'attempts', children:
                                          [ { name: 'SPAN', class: 'count' },
                                            { name: 'SPAN', class: 'descr' },
                                          ] },
                                    ] },
                                  { name: 'DIV', class: 'feedback' },
                                ]
                            };

                        helper.expectElementTree(myMultipleChoiceQuestion.lastdrawn_.bricGroup, tree);
                    });
                });

                describe('.selectItemAtIndex()', function () {
                    it('should publish the multiplechoicequestion.selectedEventId with the answer key of the item at that index', function () {
                        var index = 1;
                        var expectedKey = myMultipleChoiceQuestion.presenterBric.choices[index].answerKey;
                        var prevSelectEventCount = selectEventCount;
                        myMultipleChoiceQuestion.selectItemAtIndex(index);
                        expect(selectEventCount).is.equal(prevSelectEventCount + 1);
                        expect(lastSelectEventDetails.selectKey).is.equal(expectedKey);
                    });

                    it('should change the selection when selecting an unselected item', function() {
                        var expectedKey = myMultipleChoiceQuestion.presenterBric.choices[2].answerKey;
                        // Arrange - item 1 is selected
                        myMultipleChoiceQuestion.selectItemAtIndex(1);
                        var prevSelectEventCount = selectEventCount;
                        lastSelectEventDetails = null;
                        // Act - change the selection to item 2
                        myMultipleChoiceQuestion.selectItemAtIndex(2);
                        // Assert - select event was published
                        expect(selectEventCount, "select event count").is.equal(prevSelectEventCount + 1);
                        expect(lastSelectEventDetails.selectKey).is.equal(expectedKey);
                    });

                    it('should do nothing when selecting an already selected item (no event)', function() {
                        // Arrange - item 1 is selected
                        myMultipleChoiceQuestion.selectItemAtIndex(1);
                        var prevSelectEventCount = selectEventCount;
                        lastSelectEventDetails = null;
                        // Act - re-select item 1
                        myMultipleChoiceQuestion.selectItemAtIndex(1);
                        // Assert - select event was not published
                        expect(selectEventCount, "select event count").is.equal(prevSelectEventCount);
                        expect(lastSelectEventDetails).to.be.null;
                    });

                    it.skip('TODO TEST: should create a new div with class "feedback" when the button is pressed', function() {
                    });
                    it.skip('TODO TEST: multiple attempts should overwrite the feedback div', function() {
                    });
                    it.skip('MANUAL TEST: should publish selectedEventId when selection is made w/ mouse or keyboard', function() {
                        // this has to be a manual test because manipulating the real keyboard and mouse
                        // cannot be automated.
                    });
                });

                describe('.selectedChoice()', function () {
                    before(function () {
                        cntrNode && d3.select(cntrNode).remove();
                        cntrNode = helper.createNewDiv();
                        myMultipleChoiceQuestion.draw(d3.select(cntrNode));
                    });

                    it('should return null when no item is selected', function () {
                        expect(myMultipleChoiceQuestion.selectedChoice()).to.be.null;
                    });

                    it('should return the selected choice, even after the choice has been changed', function () {
                        // 1st selection
                        myMultipleChoiceQuestion.selectItemAtIndex(1);
                        expect(myMultipleChoiceQuestion.selectedChoice()).is.deep.equal(myMultipleChoiceQuestion.presenterBric.choices[1]);

                        // 2nd selection is after the current selection
                        myMultipleChoiceQuestion.selectItemAtIndex(3);
                        expect(myMultipleChoiceQuestion.selectedChoice()).is.deep.equal(myMultipleChoiceQuestion.presenterBric.choices[3]);

                        // 3rd selection is before the current selection
                        myMultipleChoiceQuestion.selectItemAtIndex(0);
                        expect(myMultipleChoiceQuestion.selectedChoice()).is.deep.equal(myMultipleChoiceQuestion.presenterBric.choices[0]);
                    });
                });
            });
        });

        describe('Creating a SelectGroup MultipleChoiceQuestion w/ 4 ordered choices', function () {
            var configMultipleChoiceQuestion1 =
                {
                    id: "Q1",
                    question: "Whassup?",
                    choices: Q1Choices,
                    order: "ordered",
                    presenterType: BricTypes.SELECTGROUP,
                    presenterConfig: {},
                };

            var myMultipleChoiceQuestion = null;
            var selectEventCount = 0;
            var lastSelectEventDetails = null;
            var logSelectEvent =
                function logSelectEvent(eventDetails)
                {
                    ++selectEventCount;
                    lastSelectEventDetails = eventDetails;
                };

            before(function () {
                bricWorks.eventManager = new EventManager();
                selectEventCount = 0;
                lastSelectEventDetails = null;

                myMultipleChoiceQuestion = bricWorks.createBric(BricTypes.MULTIPLECHOICEQUESTION, configMultipleChoiceQuestion1);
                bricWorks.eventManager.subscribe(myMultipleChoiceQuestion.selectedEventId, logSelectEvent);
                //eventManager.subscribe(myMultipleChoiceQuestion.submitScoreRequestEventId, logScoreRequestEvent);
            });

            it('should have the id that was specified in the config', function () {
                expect(myMultipleChoiceQuestion.getId()).to.equal(configMultipleChoiceQuestion1.id);
            });

            it('should have a SelectGroup presenterBric', function () {
                expect(myMultipleChoiceQuestion.presenterBric).to.be.an.instanceof(SelectGroup);
            });

            it('should have randomized the choices', function () {
                // We set the random seed above so the randomization would be deterministic
                expect(myMultipleChoiceQuestion.presenterBric.choices[0], "1st choice").to.deep.equal(Q1Choices[0]);
                expect(myMultipleChoiceQuestion.presenterBric.choices[1], "2nd choice").to.deep.equal(Q1Choices[1]);
                expect(myMultipleChoiceQuestion.presenterBric.choices[2], "3rd choice").to.deep.equal(Q1Choices[2]);
                expect(myMultipleChoiceQuestion.presenterBric.choices[3], "4th choice").to.deep.equal(Q1Choices[3]);
            });

            it('should have the eventManager given to the constructor', function () {
                expect(myMultipleChoiceQuestion.eventManager).to.equal(bricWorks.eventManager);
            });

            it('should have an uninitialized private lastdrawn_ property', function () {
                expect(myMultipleChoiceQuestion.lastdrawn_).to.have.property('container').that.is.null;
                expect(myMultipleChoiceQuestion.lastdrawn_).to.have.property('bricGroup').that.is.null;
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
                        myMultipleChoiceQuestion.draw(d3.select(cntrNode));
                    });

                    it('should set the lastdrawn_ container property to the value passed in', function () {
                        expect(myMultipleChoiceQuestion.lastdrawn_.container.node()).to.deep.equal(cntrNode);
                    });

                    it('should have appended a div element with class \'brixMultipleChoiceQuestion\' to the container' +
                       ' and set the lastdrawn_.bricGroup to that d3 selection', function () {
                        // get the last element of the container
                        var last = d3.select(cntrNode).select(":last-child");
                        expect(last.node().nodeName).to.equal('DIV');
                        expect(last.classed('brixMultipleChoiceQuestion'), 'has class brixMultipleChoiceQuestion').to.be.true;
                        expect(myMultipleChoiceQuestion.lastdrawn_.bricGroup.node()).to.deep.equal(last.node());
                    });

                    it('should create a div with sections for the question, choices, button and responses', function () {
                        /*
                         div.brixMultipleChoiceQuestion
                            fieldset
                                legend.question
                                div.choices
                                    span.widgetSelectGroup
                            div.feedback
                            div.submit
                                div.brixButton
                         */
                        var tree =
                            { name: 'DIV', class: 'brixMultipleChoiceQuestion', children:
                                [ { name: 'FIELDSET', children:
                                    [ { name: 'LEGEND', class: 'question' },
                                        { name: 'DIV', class: 'choices', children:
                                            [ { name: 'SPAN', class: 'widgetSelectGroup' } ]
                                        },
                                    ] },
                                  { name: 'DIV', children:
                                    [ { name: 'DIV', class: 'submit', children:
                                          [ { name: 'DIV', class: 'brixButton' } ] },
                                      { name: 'SPAN', class: 'attempts', children:
                                          [ { name: 'SPAN', class: 'count' },
                                            { name: 'SPAN', class: 'descr' },
                                          ] },
                                    ] },
                                  { name: 'DIV', class: 'feedback' },
                                ]
                            };

                        helper.expectElementTree(myMultipleChoiceQuestion.lastdrawn_.bricGroup, tree);
                    });
                });

                // The SelectGroup bric doesn't support this method yet.
                describe.skip('.selectItemAtIndex()', function () {
                    it('should publish the multiplechoicequestion.selectedEventId with the answer key of the item at that index', function () {
                        var index = 1;
                        var expectedKey = myMultipleChoiceQuestion.presenterBric.choices[index].answerKey;
                        var prevSelectEventCount = selectEventCount;
                        myMultipleChoiceQuestion.selectItemAtIndex(index);
                        expect(selectEventCount).is.equal(prevSelectEventCount + 1);
                        expect(lastSelectEventDetails.selectKey).is.equal(expectedKey);
                    });

                    it('should change the selection when selecting an unselected item', function() {
                        var expectedKey = myMultipleChoiceQuestion.presenterBric.choices[2].answerKey;
                        // Arrange - item 1 is selected
                        myMultipleChoiceQuestion.selectItemAtIndex(1);
                        var prevSelectEventCount = selectEventCount;
                        lastSelectEventDetails = null;
                        // Act - change the selection to item 2
                        myMultipleChoiceQuestion.selectItemAtIndex(2);
                        // Assert - select event was published
                        expect(selectEventCount, "select event count").is.equal(prevSelectEventCount + 1);
                        expect(lastSelectEventDetails.selectKey).is.equal(expectedKey);
                    });

                    it('should do nothing when selecting an already selected item (no event)', function() {
                        // Arrange - item 1 is selected
                        myMultipleChoiceQuestion.selectItemAtIndex(1);
                        var prevSelectEventCount = selectEventCount;
                        lastSelectEventDetails = null;
                        // Act - re-select item 1
                        myMultipleChoiceQuestion.selectItemAtIndex(1);
                        // Assert - select event was not published
                        expect(selectEventCount, "select event count").is.equal(prevSelectEventCount);
                        expect(lastSelectEventDetails).to.be.null;
                    });

                    it.skip('MANUAL TEST: should publish selectedEventId when selection is made w/ mouse or keyboard', function() {
                    });
                });

                // The SelectGroup bric doesn't support this method yet.
                describe.skip('.selectedChoice()', function () {
                    before(function () {
                        cntrNode && d3.select(cntrNode).remove();
                        cntrNode = helper.createNewDiv();
                        myMultipleChoiceQuestion.draw(d3.select(cntrNode));
                    });

                    it('should return null when no item is selected', function () {
                        expect(myMultipleChoiceQuestion.selectedChoice()).to.be.null;
                    });

                    it('should return the selected choice, even after the choice has been changed', function () {
                        // 1st selection
                        myMultipleChoiceQuestion.selectItemAtIndex(1);
                        expect(myMultipleChoiceQuestion.selectedChoice()).is.deep.equal(myMultipleChoiceQuestion.presenterBric.choices[1]);

                        // 2nd selection is after the current selection
                        myMultipleChoiceQuestion.selectItemAtIndex(3);
                        expect(myMultipleChoiceQuestion.selectedChoice()).is.deep.equal(myMultipleChoiceQuestion.presenterBric.choices[3]);

                        // 3rd selection is before the current selection
                        myMultipleChoiceQuestion.selectItemAtIndex(0);
                        expect(myMultipleChoiceQuestion.selectedChoice()).is.deep.equal(myMultipleChoiceQuestion.presenterBric.choices[0]);
                    });
                });
            });
        });

        describe.skip('Submission and submit responses', function () {
            describe('before 1st choice is selected', function () {
                it('should have no choice selected', function () {
                
                });

                it('should have a disabled submit button', function () {
                
                });
            });

            describe('after initial choice is selected', function () {
                it('should no longer be subscribed to the choicepresenter\'s selected event', function () {
                
                });
            
                it('should have an enabled submit button', function () {
                
                });
            });

            describe('when submit button is pressed', function () {
                it('should publish the submitScoreRequestEventId w/ event details containing submissionId, answer and responseCallback properties', function () {
                
                });

                it('should disable the submit button', function () {
                
                });
            });

            describe('A MultipleChoiceQuesiton with unlimited attempts (maxAttempts = null or undefined)', function() {
                describe('when the choice submitted is correct', function() {
                    it('should display the feedback for that correct choice', function () {
                   
                    }); 

                    it('should display 1 attempt used', function () {
                   
                    });

                    it('should have a disabled submit button', function () {
                    
                    });

                    it('should call the choicepresenter flagChoice method w/ the key of the correct choice', function () {
                    
                    });
                });

                describe('when the choice submitted is incorrect', function() {
                    it('should display the feedback for that incorrect choice', function () {
                   
                    }); 

                    it('should not display anything about attempts', function () {
                   
                    });

                    it('should have an enabled submit button', function () {
                    
                    });
                });
            });
        
            describe('A MultipleChoiceQuesiton with a maximum of 2 attempts (maxAttempts = 2)', function() {
                describe('when the 1st choice submitted is correct', function() {
                    it('should display the feedback for that correct choice', function () {
                   
                    }); 

                    it('should display 1 attempt used', function () {
                   
                    });

                    it('should have a disabled submit button', function () {
                    
                    });

                    it('should call the choicepresenter flagChoice method w/ the key of the correct choice', function () {
                    
                    });
                });

                describe('when the 1st choice submitted is incorrect', function() {
                    it('should display the feedback for that incorrect choice', function () {
                   
                    }); 

                    it('should display 1 attempts remaining', function () {
                   
                    });

                    it('should have an enabled submit button', function () {
                    
                    });
                });
                
                describe('when the 2nd choice submitted is incorrect', function() {
                    it('should display the feedback for that incorrect choice', function () {
                   
                    }); 

                    it('should display the feedback for the correct choice', function () {
                   
                    }); 

                    it('should display 0 attempts remaining', function () {
                   
                    });

                    it('should have a disabled submit button', function () {
                    
                    });

                    it('should call the choicepresenter flagChoice method w/ the key of the correct choice', function () {
                    
                    });
                });
                
                describe('when the 2nd choice submitted is correct', function() {
                    it('should display the feedback for the correct choice', function () {
                   
                    }); 

                    it('should display 2 attempts used', function () {
                   
                    });

                    it('should have a disabled submit button', function () {
                    
                    });

                    it('should call the choicepresenter flagChoice method w/ the key of the correct choice', function () {
                    
                    });
                });
            });
        });
    });
})();

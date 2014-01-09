/* **************************************************************************
 * widget-journal-spec.js                                                   $
 * **********************************************************************//**
 *
 * @fileoverview Journal widget unit tests
 *
 * Created on       January 8, 2014
 * @author          Seann Ives
 *
 * Copyright (c) 2014 Pearson, All rights reserved.
 *
 * **************************************************************************/

'use strict';


(function () {
    var expect = chai.expect;

    var EventManager = pearson.utils.EventManager;
    var Journal = pearson.brix.Journal;
    var BricTypes = pearson.brix.BricTypes;

    // Create a bricworks that has molds for all the brix we need for this test
    var bricWorks = new pearson.brix.BricWorks();
    bricWorks.registerBricMold(BricTypes.JOURNAL, Journal);
    bricWorks.registerBricMold(BricTypes.BUTTON, pearson.brix.Button);

    describe.only('Journal: Tell me about your summer vacation', function () {
        var eventManager = null;


        describe('Creating a Journal', function () {
            var configJournal1 =
                {
                    id: "Q1",
                    
                };

            var myJournalQuestion = null;
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
                Math.seedrandom("Journal");

                bricWorks.eventManager = new EventManager();
                selectEventCount = 0;
                lastSelectEventDetails = null;

                myJournalQuestion = bricWorks.createBric(BricTypes.JOURNAL, configJournal1);
                bricWorks.eventManager.subscribe(myJournalQuestion.selectedEventId, logSelectEvent);
                //eventManager.subscribe(myJournalQuestion.submitScoreRequestEventId, logScoreRequestEvent);
            });

            it('should have the id that was specified in the config', function () {
                expect(myJournalQuestion.getId()).to.equal(configJournal1.id);
            });

            it('should have a title', function () {
                expect(myJournalQuestion.title_).to.equal(configJournal1.title);
            });

            it('should have the eventManager given to the constructor', function () {
                expect(myJournalQuestion.eventManager).to.equal(bricWorks.eventManager);
            });

            it('should have an uninitialized private lastdrawn_ property', function () {
                expect(myJournalQuestion.lastdrawn_).to.have.property('container').that.is.null;
                expect(myJournalQuestion.lastdrawn_).to.have.property('bricGroup').that.is.null;
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
                        myJournalQuestion.draw(d3.select(cntrNode));
                    });

                    it('should set the lastdrawn_ container property to the value passed in', function () {
                        expect(myJournalQuestion.lastdrawn_.container.node()).to.deep.equal(cntrNode);
                    });

                    it('should have appended a div element with class \'brixJournal\' to the container' +
                       ' and set the lastdrawn_.bricGroup to that d3 selection', function () {
                        // get the last element of the container
                        var last = d3.select(cntrNode).select(":last-child");
                        expect(last.node().nodeName).to.equal('DIV');
                        expect(last.classed('brixJournal'), 'has class brixJournal').to.be.true;
                        expect(myJournalQuestion.lastdrawn_.bricGroup.node()).to.deep.equal(last.node());
                    });

                    it('should create a div with sections for the textarea, button and feedback', function () {
                        /*
                         div.brixJournal
                            fieldset
                                legend.title
                            div.journalTextarea
                                textarea
                            div
                                div.submit
                                    div.brixButton
                                span.attempts
                            div.feedback
                         */    
                        var tree =
                            { name: 'DIV', class: 'brixJournal', children:
                                [ { name: 'FIELDSET', children:
                                    [ { name: 'LEGEND', class: 'title' } 
                                    ]
                                  },
                                  { name: 'DIV', class: 'journalTextarea', children:
                                    [ {name: 'TEXTAREA', class: 'entry'}
                                    ]
                                  },
                                  { name: 'DIV', children:
                                    [ { name: 'DIV', class: 'submit', children:
                                        [ { name: 'DIV', class: 'brixButton'}]
                                      },
                                      { name: 'SPAN', class: 'attempts'}
                                    ]
                                  },
                                  { name: 'DIV', class: 'feedback'
                                  }
                                ]
                            };
                        helper.expectElementTree(myJournalQuestion.lastdrawn_.bricGroup, tree);
                    });
                });
            });
        });


        describe.skip('Submission and submit responses', function () {
            describe('before anything is typed', function () {
                it('should have default text', function () {
                
                });

                it('should have a disabled submit button', function () {
                
                });
            });

            describe('after anything is typed', function () {
                it('should have an enabled submit button', function () {
                
                });
            });

            describe('when submit button is pressed', function () {
                it('should publish the submitScoreRequestEventId w/ event details containing submissionId, answer and responseCallback properties', function () {
                
                });

                it('should disable the submit button', function () {
                
                });
            });

        
            
        });
    });
})();

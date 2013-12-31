/* **************************************************************************
 * widget-slider-spec.js                                                    $
 * **********************************************************************//**
 *
 * @fileoverview Slider bric unit tests
 *
 * Created on       November 7, 2013
 * @author          Young-Suk Ahn
 *
 * Copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

// Requires for simulating events
goog.require('goog.style');
goog.require('goog.testing.events');

'use strict';

(function () {
    var expect = chai.expect;

    var EventManager = pearson.utils.EventManager;
    var Slider = pearson.brix.Slider;

    var moveSlider = function(slider, delta)
    {
        var googSlider = slider.lastdrawn.sliderObj;
        var offset = goog.style.getPageOffset(googSlider.valueThumb);
        var size = goog.style.getSize(googSlider.valueThumb);
        offset.x += size.width / 2;
        offset.y += size.height / 2;

        goog.testing.events.fireMouseDownEvent(googSlider.valueThumb);
        offset.x += size.width * delta;
        goog.testing.events.fireMouseMoveEvent(googSlider.valueThumb, offset);
        goog.testing.events.fireMouseUpEvent(googSlider.valueThumb);
    };

    describe('Sliders Bric', function () {
        var eventManager = null;

        describe('Creating a Slider w/ 4 choices', function () {
            var sliderConfig =
                {
                    id: "t1_1Val",
                    startVal: 0.5,
                    minVal: 0,
                    maxVal: 10,
                    stepVal: 0.1,
                    label: "Test Slider",
                    format: '5.2f',
                };
    
            var mySlider = null;
            var selectEventCount = 0;
            var lastSelectEventDetails = null;

            before(function () {
                eventManager = new EventManager();
                selectEventCount = 0;
                lastSelectEventDetails = null;

                mySlider = new Slider(sliderConfig, eventManager);
            });
            
            it('should have the id that was specified in the config', function () {
                expect(mySlider.getId()).to.equal(sliderConfig.id);
            });

            it('should have the eventManager given to the constructor', function () {
                expect(mySlider.eventManager).to.equal(eventManager);
            });

            it('should have an uninitialized lastdrawn property', function () {
                expect(mySlider.lastdrawn).to.have.property('container').that.is.null;
                expect(mySlider.lastdrawn).to.have.property('widgetGroup').that.is.null;
                expect(mySlider.lastdrawn).to.have.property('value').that.is.null;
            });

            describe('Exposed methods', function () {
                var cntrNode = null;

                before(function () {
                    cntrNode = helper.createNewDiv();
                    mySlider.draw(d3.select(cntrNode));
                });
                
                it('should have appended a div element with class \'brixSlider-container\' to the container' +
                   ' and set the lastdrawn.widgetGroup to that d3 selection after draw()', function () {
                    // get the last element of the container
                    var last = d3.select(cntrNode).select(":last-child");
                    expect(last.node().nodeName).to.equal('DIV');
                    expect(last.classed('bricSlider-container'), 'has class bricSlider-container').to.be.true;
                    expect(mySlider.lastdrawn.widgetGroup.node()).to.deep.equal(last.node());
                });

                it('should not alter value when disabled', function() {
                    // Check that a slider is enabled by default
                    expect(mySlider.isEnabled()).to.be.true;

                    var valToSet = 5;
                    mySlider.setValue(valToSet);
                    expect(mySlider.getValue()).to.equal(valToSet);

                    // Disable the slider and check its state
                    mySlider.setEnabled(false);
                    // setValue should work unaffected even when the slider is disabled.
                    moveSlider(mySlider, 3);
                    expect(mySlider.getValue()).to.equal(valToSet);

                    mySlider.setEnabled(true);
                    moveSlider(mySlider, 3);
                    expect(mySlider.getValue()).to.not.equal(valToSet);
                    console.log('Slider new val:'+ mySlider.getValue());
                });

                describe('Value Setter', function () {
                    it('should publish the Slider.valueChangeEventId with new value', function () {
                        var valueToSet = 2;
                        var prevValue = mySlider.getValue();

                        var wasPublished = false;
                        var stub = sinon.stub(eventManager, "publish", function(topic, evtDetails) {
                            expect(topic).to.equal(mySlider.changedValueEventId);
                            //expect(evtDetails).to.have.property('oldValue').that.equals(prevValue);
                            expect(evtDetails).to.have.property('newValue').that.equals(valueToSet);
                            wasPublished = true;
                        });
                        mySlider.setValue(valueToSet);
                        expect(mySlider.getValue()).is.equal(valueToSet);
                        expect(wasPublished).to.equal(true);
                        stub.restore();
                    });

                    it('should not change when the value is outside the min-max range', function() {
                        var valueToSet = sliderConfig + 1;
                        var prevValue = mySlider.getValue();
                        var stub = sinon.stub(eventManager, "publish", function(topic, evtDetails) {
                            throw new Error("Should not have published when value outside of valid range");
                        });
                        mySlider.setValue(valueToSet);
                        expect(mySlider.getValue()).is.equal(prevValue);
                        stub.restore();
                    });

                });


                describe('Event handler', function () {

                    it('should change value when dragged, and all three events must be published', function() {
                        var changeWasPublished = false;
                        var startWasPublished = false;
                        var endWasPublished = false;
                        var stub = sinon.stub(eventManager, "publish", function(topic, evtDetails) {
                            if (topic == mySlider.changedValueEventId)
                            {
                                changeWasPublished = true;
                            } else if (topic == mySlider.dragStartEventId)
                            {
                                startWasPublished = true;
                            } else if (topic == mySlider.dragEndEventId)
                            {
                                endWasPublished = true;
                            }
                        });

                        var theVal =  mySlider.getValue();
                        
                        moveSlider(mySlider, 3);

                        expect(changeWasPublished).to.equal(true);
                        expect(startWasPublished).to.equal(true);
                        expect(endWasPublished).to.equal(true);
                    });

                    it.skip('MANUAL TEST: should correctly step', function() {
                    });
                    
                });


                after(function () {
                    // Clean up test modifications to the DOM
                    cntrNode && d3.select(cntrNode).remove();
                });

            });

            
        });
    });
})();

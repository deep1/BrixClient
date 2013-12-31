/* **************************************************************************
 * $Workfile:: mortar-dataswap-spec.js                                      $
 * *********************************************************************/ /**
 *
 * @fileoverview Dataswap mortar unit tests
 *
 * Created on		December 4, 2013
 * @author			Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

'use strict';

(function () {
    var expect = chai.expect;

	var Dataswap = pearson.brix.mortar.Dataswap;

	var createMockEventManager = function ()
		{
			return {
				subscribe: function (topic, callback)
						{
							this.lastSubscribe.count++;
							this.lastSubscribe.topic = topic;
							this.lastSubscribe.callback = callback;
						},
				lastSubscribe: {count: 0, topic: undefined, callback: undefined}
			};
		};

    describe('Dataswap mortar: Don\'t use that one, use this one', function () {
		var eventManager = null;

        describe('Creating a Dataswap', function () {
            var eventManager = createMockEventManager();

            var dataswapConfig =
                {
                    topic: "yo momma",
                    "eventDetailsProperty": "newValue",
                    "valueBase": 1950,
                    "valueStep": 5,
                    "sourceDataArray": ['one', 'two'],
                    "targetBric": {getId: function () {return 'foo';}},
                    "dataPropertySetter": "setValue",
                };

            it('should subscribe to the given topic using the given eventmanager', function () {
                var dataswap = new Dataswap(dataswapConfig, eventManager);
                
                expect(eventManager.lastSubscribe.count).to.equal(1);
                expect(eventManager.lastSubscribe.topic).to.equal(dataswapConfig.topic);
            });
		});

        describe('Dataswap getting event w/ default numeric property (valueBase, valueStep & keyArray undefined)', function () {
            var eventManager = createMockEventManager();
            var mockBricWithData =
                {
                    getId: function () { return 'foo'; },
                    setData: function (newData) { this.setDataCount++; this.data = newData; },
                    setDataCount: 0,
                    data: "old data"
                };

            var dataswapConfig =
                {
                    "topic": "yo momma",
                    "eventDetailsProperty": "jamba",
                    "sourceDataArray": ['one', 'two', 'three'],
                    "targetBric": mockBricWithData,
                    "dataPropertySetter": "setData",
                };

            var dataswap = new Dataswap(dataswapConfig, eventManager);
            
            var eventArg = 1;
            describe('the 1st event with a numeric value of 1', function () {
                before(function () {
                    eventArg = 1;
                    eventManager.lastSubscribe.callback({selectKey: "wrong", index: -1, jamba: eventArg});
                });

                it('should call the dataPropertySetter of the targetBric', function () {
                    expect(mockBricWithData.setDataCount).to.equal(1);
                });

                it('should call the dataPropertySetter with the 2nd element from the sourceData', function () {
                    expect(mockBricWithData.data).to.equal(dataswapConfig.sourceDataArray[1]);
                });
            });

            describe('a 2nd event with a numeric value of 0', function () {
                before(function () {
                    eventArg = 0;
                    eventManager.lastSubscribe.callback({jamba: eventArg});
                });

                it('should call the dataPropertySetter of the targetBric a 2nd time', function () {
                    expect(mockBricWithData.setDataCount).to.equal(2);
                });

                it('should call the dataPropertySetter with the 1st element from the sourceData', function () {
                    expect(mockBricWithData.data).to.equal(dataswapConfig.sourceDataArray[0]);
                });
            });
		});

        describe('Dataswap getting event w/ valueBase=1950 and valueStep=15 numeric property (keyArray undefined)', function () {
            var eventManager = createMockEventManager();
            var mockBricWithData =
                {
                    getId: function () { return 'foo'; },
                    setData: function (newData) { this.setDataCount++; this.data = newData; },
                    setDataCount: 0,
                    data: "old data"
                };

            var dataswapConfig =
                {
                    "topic": "yo momma",
                    "eventDetailsProperty": "jamba",
                    "valueBase": 1950,
                    "valueStep": 15,
                    "sourceDataArray": ['one', 'two', 'three', 'four'],
                    "targetBric": mockBricWithData,
                    "dataPropertySetter": "setData",
                };

            var dataswap = new Dataswap(dataswapConfig, eventManager);
            
            var eventArg = 1;
            describe('the 1st event with a numeric value of 1950', function () {
                before(function () {
                    eventArg = 1950;
                    eventManager.lastSubscribe.callback({jamba: eventArg});
                });

                it('should call the dataPropertySetter of the targetBric', function () {
                    expect(mockBricWithData.setDataCount).to.equal(1);
                });

                it('should call the dataPropertySetter with the 1st element from the sourceData', function () {
                    expect(mockBricWithData.data).to.equal(dataswapConfig.sourceDataArray[0]);
                });
            });

            describe('a 2nd event with a numeric value of 1995', function () {
                before(function () {
                    eventArg = 1995;
                    eventManager.lastSubscribe.callback({jamba: eventArg});
                });

                it('should call the dataPropertySetter of the targetBric a 2nd time', function () {
                    expect(mockBricWithData.setDataCount).to.equal(2);
                });

                it('should call the dataPropertySetter with the 4th element from the sourceData', function () {
                    expect(mockBricWithData.data).to.equal(dataswapConfig.sourceDataArray[3]);
                });
            });

            describe('a 3rd event with a numeric value of 1990 which is not an even step value', function () {
                before(function () {
                    eventArg = 1990;
                    eventManager.lastSubscribe.callback({jamba: eventArg});
                });

                it('should call the dataPropertySetter of the targetBric a 3rd time', function () {
                    expect(mockBricWithData.setDataCount).to.equal(3);
                });

                it('should call the dataPropertySetter with the 4th (calculated index rounded to integer) element from the sourceData', function () {
                    expect(mockBricWithData.data).to.equal(dataswapConfig.sourceDataArray[3]);
                });
            });

            describe('a 4th event with a numeric value of 1985 which is not an even step value', function () {
                before(function () {
                    eventArg = 1985;
                    eventManager.lastSubscribe.callback({jamba: eventArg});
                });

                it('should call the dataPropertySetter of the targetBric a 4th time', function () {
                    expect(mockBricWithData.setDataCount).to.equal(4);
                });

                it('should call the dataPropertySetter with the 3rd (calculated index rounded to integer) element from the sourceData', function () {
                    expect(mockBricWithData.data).to.equal(dataswapConfig.sourceDataArray[2]);
                });
            });
		});

        describe('Dataswap getting event w/ a keyArray (color names in roygbiv order) for getting index from a string property', function () {
            var eventManager = createMockEventManager();
            var mockBricWithData =
                {
                    getId: function () { return 'foo'; },
                    setData: function (arg1, arg2, newData) { this.setDataCount++; this.arg1 = arg1; this.arg2 = arg2; this.data = newData; },
                    setDataCount: 0,
                    arg1: "foo",
                    arg2: "bar",
                    data: "old data"
                };

            var dataswapConfig =
                {
                    "topic": "yo momma",
                    "eventDetailsProperty": "jamba",
                    "keyArray": ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'],
                    "sourceDataArray": ['one', 'two', 'three', 'four', 'five', 'six', 'seven'],
                    "targetBric": mockBricWithData,
                    "dataPropertySetter": "setData",
                    "initialSetterArgs": ['jolly', 42]
                };

            var dataswap = new Dataswap(dataswapConfig, eventManager);
            
            var eventArg = 1;
            // test that string event values are properly looked up in the keyArray, 1st entry
            describe('the 1st event with a string value of "red"', function () {
                before(function () {
                    eventArg = 'red';
                    eventManager.lastSubscribe.callback({jamba: eventArg});
                });

                it('should call the dataPropertySetter of the targetBric', function () {
                    expect(mockBricWithData.setDataCount).to.equal(1);
                });

                it('should pass the initial setter args to the setter', function () {
                    expect(mockBricWithData.arg1).to.equal(dataswapConfig.initialSetterArgs[0]);
                    expect(mockBricWithData.arg2).to.equal(dataswapConfig.initialSetterArgs[1]);
                });

                it('should call the dataPropertySetter with the 1st element from the sourceData', function () {
                    expect(mockBricWithData.data).to.equal(dataswapConfig.sourceDataArray[0]);
                });
            });

            // test that string event values are properly looked up in the keyArray, last entry
            describe('a 2nd event with a string value of "violet"', function () {
                before(function () {
                    eventArg = 'violet';
                    eventManager.lastSubscribe.callback({jamba: eventArg});
                });

                it('should call the dataPropertySetter of the targetBric a 2nd time', function () {
                    expect(mockBricWithData.setDataCount).to.equal(2);
                });

                it('should call the dataPropertySetter with the 7th element from the sourceData', function () {
                    expect(mockBricWithData.data).to.equal(dataswapConfig.sourceDataArray[6]);
                });
            });

            // new source data
            var fruit = ['apple', 'orange', 'banana', 'kiwi', 'blueberry', 'plum', 'grape'];

            // test that setDataSource updates the target w/ the new data element at the last index sent
            describe('setDataSource w/ new data source of fruit names', function () {

                before(function () {
                    dataswap.setDataSource(fruit);
                });

                it('should call the dataPropertySetter of the targetBric a 3rd time', function () {
                    expect(mockBricWithData.setDataCount).to.equal(3);
                });

                it('should call the dataPropertySetter of the target with the value at the last index swapped, 7th element="grape"', function () {
                    expect(mockBricWithData.data).to.equal(fruit[6]);
                });
            });

            // test that the data source is really changed after setDataSource
            describe('a 3rd event with a string value of "green"', function () {
                before(function () {
                    eventArg = 'green';
                    eventManager.lastSubscribe.callback({jamba: eventArg});
                });

                it('should call the dataPropertySetter of the targetBric a 4th time', function () {
                    expect(mockBricWithData.setDataCount).to.equal(4);
                });

                it('should call the dataPropertySetter with the 4th element from the new sourceData="kiwi"', function () {
                    expect(mockBricWithData.data).to.equal(fruit[3]);
                });
            });
		});
    });
})();


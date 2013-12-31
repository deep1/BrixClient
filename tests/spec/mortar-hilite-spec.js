/* **************************************************************************
 * $Workfile:: mortar-hilite-spec.js                                        $
 * *********************************************************************/ /**
 *
 * @fileoverview Hilite mortar unit tests
 *
 * Created on		October 2, 2013
 * @author			Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

'use strict';

(function () {
    var expect = chai.expect;

	var Hilite = pearson.brix.mortar.Hilite;

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

    describe('Hilite mortar: Share the light', function () {
		var eventManager = null;

        describe('Creating a Hilite', function () {
            var eventManager = createMockEventManager();

            var hiliteConfig =
                {
                    topic: "yo momma",
                    eventDetailsProperty: "liteKey",
                    targetBric: {}
                };

            it('should subscribe to the given topic using the given eventmanager', function () {
                var hilite = new Hilite(hiliteConfig, eventManager);
                
                expect(eventManager.lastSubscribe.count).to.equal(1);
                expect(eventManager.lastSubscribe.topic).to.equal(hiliteConfig.topic);
            });
		});

        describe('Hilite should call the lite method of the given bric w/ the correct argument', function () {
            var eventManager = createMockEventManager();
            var mockLightableBric =
                {
                    lite: function (liteKey) { this.liteCallCount++; this.liteKey = liteKey; },
                    liteCallCount: 0,
                    liteKey: undefined
                };

            var hiliteConfig =
                {
                    topic: "yo momma",
                    eventDetailsProperty: "jamba",
                    targetBric: mockLightableBric
                };

            var hilite = new Hilite(hiliteConfig, eventManager);
            
            var liteArg = 'juice';
            eventManager.lastSubscribe.callback({liteKey: "wrong", jamba: liteArg});

            it('should call the lite method of the targetBric', function () {
                expect(mockLightableBric.liteCallCount).to.equal(1);
            });

            it('should pass the correct eventDetails property as the argument to lite', function () {
                expect(mockLightableBric.liteKey).to.equal(liteArg);
            });
		});
    });
})();


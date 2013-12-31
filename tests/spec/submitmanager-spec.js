/* **************************************************************************
 * submitmanager-spec.js                                                    $
 * **********************************************************************//**
 *
 * @fileoverview SubmitManager unit tests
 *
 * Created on		June 04, 2013
 * @author			Seann
 *
 * Copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

'use strict';


(function () {
    var expect = chai.expect;

	var SubmitManager = pearson.brix.utils.SubmitManager;
	var LocalAnswerMan = pearson.brix.utils.LocalAnswerMan;

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

    describe('SubmitManager tests', function () {
		describe('.handleRequestsFrom()', function () {
			var eventManager = createMockEventManager();
            var answerMan = new LocalAnswerMan();
            answerMan.registerAnswerKey("http://hub.paf.pearson.com/resources/sequences/123/nodes/1",
                                        {
                                            assessmentType: "multiplechoice",
                                            answers:
                                                {
                                                    "1":
                                                        {
                                                            score: 1,
                                                            response: "There can be only 1",
                                                        },
                                                }
                                        });
			var submitManager = new SubmitManager(eventManager, answerMan);
			var mockQWidget = {submitScoreRequestEventId: "foo"};
			submitManager.handleRequestsFrom(mockQWidget);

			it('should subscribe to the given widget\'s submitScoreRequestEventId', function () {
				expect(eventManager.lastSubscribe.topic).is.equal(mockQWidget.submitScoreRequestEventId);
			});

			it('should use a handler which scores the request and calls the given callback with the response', function () {
				// Arrange
				var returnedResponseDetails = null;
				var scoreEventDetails =
					{
						submissionId: "http://hub.paf.pearson.com/resources/sequences/123/nodes/1",
						answer: { key: "1" },
						responseCallback: function (responseDetails)
							{
								returnedResponseDetails = responseDetails;
							},
						foo: "bar"
					};
				// Act - pretend event was published by calling callback
				eventManager.lastSubscribe.callback(scoreEventDetails);
				// Assert
				expect(returnedResponseDetails.submitDetails).is.deep.equals(scoreEventDetails);
			});
		});
	});
})();

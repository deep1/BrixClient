/*****************************************************************************
 * Unit test for IPC.
 *
 *
 * @author Young-Suk Ahn Park 
 */

'use strict';

(function () {
    var expect = chai.expect;

    var DomHelper = pearson.utils.DomHelper;

    describe('IPC', function () {

        var ipcConfig = {ipsBaseUrl:"http://localhost:8088"};

        // For the creation of test divs
        var drixDivAttrs = [
            {
                id: "some_habitat_id1",
                class: "brix"
            },
            {
                id: "some_habitat_id2",
                class: "brix"
            }
        ];

        // For the creation of test divs, as well as testing the expected json from scan method 
        var expectedItems = [
            {
                assignmenturl: "http://content.api.pearson.com/resources/activity/12001",
                activityurl: "http://content.api.pearson.com/resources/activity/11001",
                containerid: "imgReactor",
                type: "brix",
            },
            {
                assignmenturl: "http://content.api.pearson.com/resources/activity/12002",
                activityurl: "http://content.api.pearson.com/resources/activity/11002",
                containerid: "steps",
                type: "brix",
            }
        ];

        var nonBrixDivAttrs = [
            {
                id: "some_habitat_id45",
                class: "papaya"
            }
        ];
        var notExpectedItems = [
            {
                assignmenturl: "http://content.api.pearson.com/resources/activity/92001",
                activityurl: "http://content.api.pearson.com/resources/activity/91001",
                containerid: "imgReactor",
                type: "brix",
            }];


        
        var div1, div2, div3;
        before(function () {
            div1 = helper.createNewDiv(drixDivAttrs[0], expectedItems[0]);
            div2 = helper.createNewDiv(drixDivAttrs[1], expectedItems[1]);
            div3 = helper.createNewDiv(nonBrixDivAttrs[0], notExpectedItems[0]);
        });

        after(function () {
            // Remove the crated divs 
            var bodyEl = document.getElementsByTagName('body')[0];
            bodyEl.removeChild(div1);
            bodyEl.removeChild(div2);
            bodyEl.removeChild(div3);
        });


        it('should correctly normalize list of items', function () {
            var itemsWithDuplicateTopics = helper.cloneObject(expectedItems);
            itemsWithDuplicateTopics.push({
                assignmenturl: "http://content.api.pearson.com/resources/activity/12001",
                activityurl: "http://content.api.pearson.com/resources/activity/11001",
                containerid: "sliderReactor",
                type: "brix"
            });
            var eventManager = new pearson.utils.EventManager();
            var ipc = new pearson.brix.Ipc(ipcConfig, eventManager);
            var normalized = ipc.normalizeByTopic(itemsWithDuplicateTopics);

            console.log("**NORM:" + JSON.stringify(normalized));

            expect(normalized.length).to.equal(2);
            expect(normalized[0].assignmenturl).to.equal(expectedItems[0].assignmenturl);
            expect(normalized[0]).to.not.have.property('containerid');
            expect(normalized[1].containerid).to.equal(expectedItems[1].containerid);
        });

        it('should properly initialize by subscribing to init topics (div & iframe mode)', function () {
            var eventManager = new pearson.utils.EventManager();
            var ipc = new pearson.brix.Ipc(ipcConfig, eventManager);
            var items = DomHelper.scanElements('brix', 'div');

            // Both should be set to true after init();
            var topicsSubscribed = [false,false, false];

            sinon.stub(eventManager, 'subscribe', function(topic, handler){
                // This stub method marks subscribed topics.
                //console.log("SUBS:"+topic);
                for (var i=0; i < expectedItems.length; i++)
                {
                    if (ipc.activityBindingReplyTopic(expectedItems[i]) == topic)
                    {
                        topicsSubscribed[i] = true;
                    }
                }
            });

            ipc.init(items);

            expect(ipc.items).to.deep.equal(expectedItems);
            expect(topicsSubscribed).to.deep.equal([true, true, false]);
        });


        it('should handle init messages (div & iframe mode)', function () {
            var eventManager = new pearson.utils.EventManager();
            var ipc = new pearson.brix.Ipc(ipcConfig, eventManager);
            var items = DomHelper.scanElements('brix', 'div');
            
            // Both should be set to true after init();
            var topicsUnsubscribed = [false,false, false];
            // Stubing the EM to monitor the unsubscription.
            sinon.stub(eventManager, 'unsubscribe', function(topic, handler){
                // This stub method marks unsubscribed topics.
                for (var i=0; i < expectedItems.length; i++)
                {
                    if (ipc.activityBindingReplyTopic(expectedItems[i]) == topic)
                    {
                        topicsUnsubscribed[i] = true;
                    }
                }
            });
            // Stubing the ipsProxy to return a test SequenceNode's targetActivity.
            sinon.stub(ipc.ipsProxy, "retrieveSequenceNode", function(seqNodeIdntifier, callback){
                var result = {
                    data: testSeqNodeBody.targetActivity
                };
                callback(null, result);
            });

            // Mocking the BrickLayer to count the invocations to 'build' method.
            // Notice we are using mock and not stub because we don't care about the behavior.
            // We only care that the function has been called once per item.
            var mockBrickLayer = sinon.mock(ipc.bricLayer);
            mockBrickLayer.expects('build').twice();

            ipc.init(items);

            // Sending fake messages to trigger init-topic subscribers
            for (var i=0; i < expectedItems.length; i++)
            {
                var currTopic = ipc.activityBindingReplyTopic(expectedItems[i]);

                var initMessage = {
                    status: "success",
                    data: {
                        asrequest: testSeqNodeReqMessage
                    }
                };
                eventManager.publish(currTopic, initMessage);
            }
            
            expect(topicsUnsubscribed).to.deep.equal([true, true, false]);

            // Verifying the expectation set in the mock object
            mockBrickLayer.verify();
        });


        it('should publish to AMC requesting sequence node identifier (iframe mode only)', function () {
            var eventManager = new pearson.utils.EventManager();
            var ipc = new pearson.brix.Ipc(ipcConfig, eventManager);
            var items = [ expectedItems[0] ];
            
            var itemChecklist = [false, false, false];
            // Stubing the EM to monitor the publishing.
            var originalPublishMethod = eventManager.publish;
            sinon.stub(eventManager, 'publish', function(topic, message)
            {
                //console.log('PUB('+topic+'):' + JSON.stringify(message));
                if (topic == '__system_pageLoaded')
                {
                    // We want this message to actually go through the real behavior
                    // to trigger the event (AMC topic) what we are actually interested.
                    originalPublishMethod.call(eventManager, topic, message);
                    return; // Do not continue with the rest of stub.
                }
                expect(topic).to.equal('AMC');

                for (var i=0; i < expectedItems.length; i++)
                {
                    if (expectedItems[i].assignmenturl == message.data.assignmenturl
                        && expectedItems[i].activityurl == message.data.activityurl)
                    {
                        itemChecklist[i] = true;
                    }
                }
            });

            ipc.init(items, "dummyContainerId");
            eventManager.publish('__system_pageLoaded');

            // In iframe mode, only one item (activity) is provided to the IPC
            expect(itemChecklist).to.deep.equal([true, false, false]);
        });
    });


})();

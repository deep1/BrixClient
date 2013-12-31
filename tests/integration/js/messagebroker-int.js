/*****************************************************************************
 * Unit test for MessageBroker.
 *
 * The unit test for MessageBroker requires use of iframes.
 * Due to iframe javascript loading requirements, the test must be run from
 * page hosted on a webserver, running directly from file will result in 
 * Javascript loading error in the Console.
 *
 * @author Young-Suk Ahn Park 
 */
 'use strict';

var iframeMessageCounter = {};

(function () {
    var expect = chai.expect;

    describe('MessageBroker', function () {

        var messageBroker = null;

        var containerDiv = null; // The container div is used to facilitate the removal of the object(iframes) elements

        before(function (done) {
            console.log("## TEST/MessageBroker/before:");
            containerDiv = helper.createNewDiv();
            var objNode1 = helper.createNewObject(containerDiv, "bric", "iframe_bricmock.html?id=ONE");
            var objNode2 = helper.createNewObject(containerDiv, "bric", "iframe_bricmock.html?id=TWO");
            var resizeNode = helper.createNewObject(containerDiv, "bric", "iframe_resize.html");

            messageBroker = new pearson.utils.MessageBroker();
            // The initialize() converts the objects into iframes, triggering message flow from child iframes.
            messageBroker.initialize({logLevel:4});
            console.log("## MessageBroker instantiated & inited.");

            // Wait for some time for message being passed around
            setTimeout(function(){
                console.log("## Waiting for a while until all messages being sent.");
                done();
                console.log("## Finished waiting for all messages being sent.");
                // @todo: for some reason this second spec, the done() does not work.
         
            }, 1000);
        });

        after(function () {
            console.log("## TEST/MessageBroker/after:");
            // Clean up test modifications to the DOM
            helper.removeAllChildren(containerDiv);
            // Releasing reference and registered event listeners in the Message Bro 
            messageBroker.disposeInternal();
        });

        it('should initialize the list of bricIframes with 3 iframes: 2 brix iframes and 1 resize iframe', function () {
            // @todo: find out what's the correct method for bricIframeMap
            expect(Object.keys(messageBroker.iframeCollection.frameCustomParams).length).to.equal(3);
        });

        // Each brix iframe publishes 2 messages: 1 is consumed by subscribers 
        // another one is discarded because the handler was unsubscribed
        it('should have received 4 bric messages: 2 consumed, 2 uncomsumed', function () {
            expect(messageBroker.messageEventCounter).to.equal(4);
        });

        it('should have received 1 resize messages', function () {
            expect(messageBroker.viewEventCounter).to.equal(1);

            var reziedNode = containerDiv.getElementsByTagName("iframe")[2];
            expect(reziedNode.style.width).to.equal("150px");
            expect(reziedNode.style.height).to.equal("250px");
        });

    });
    
    
})();

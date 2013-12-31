/*****************************************************************************
 * Integration test for IpsProxy making AJAX calls to the server.
 *
 * This test is integration test and is meant to run while IPS server is up.
 *
 * If you are getting error in the Browser console saying: 
 * "XMLHttpRequest cannot load http://localhost:8088/sequencenodes/. 
 * Origin null is not allowed by Access-Control-Allow-Origin"
 * 
 *
 * @author Young-Suk Ahn Park 
 */

'use strict';

(function () {
    var expect = chai.expect;

    var seqNodeKey = null;

    describe('Brix page (div-mode)', function () {

        before(function () {
        });


        it('should properly get brix config', function (done) {
            var eventManager = new pearson.utils.EventManager();
            var items = pearson.utils.DomHelper.scanElements('brix', 'div');

            var PAF = window.Ecourses.Paf;
            // FYI: AMS endpoint to get the sequence node is laspafurl + "/las-paf/sd/paf-service/sequencenode"

            var ipcConfig = {ipsBaseUrl:"http://localhost:8088"};
            var ipc = new pearson.brix.Ipc(ipcConfig, eventManager);

            var mockBrickLayer = sinon.mock(ipc.bricLayer);
            mockBrickLayer.expects('build').once();

            // Notice that ipc.init() comes before AMC.initialize()
            ipc.init(items);

            // In iframe, the requestbinding should not be provided
            PAF.AMC.initialize ({
                laspafurl : "http://localhost:9080",
                eventmanager : eventManager,
                requestbinding : items
            });

            mockBrickLayer.verify();
            done();
        });


    });

})();

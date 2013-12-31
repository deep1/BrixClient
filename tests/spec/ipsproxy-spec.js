/*****************************************************************************
 * Unit test for IpsProxy making AJAX calls to the server.
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

    var ipsProxyConfig = {serverBaseUrl:"http://localhost:8088"};
    var seqNodeKey = null;

    function endsWith(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    }

    describe('IPSProxy', function () {

        var ipsProxy = null;

        before(function () {

            ipsProxy = new pearson.brix.utils.IpsProxy(ipsProxyConfig);
        });


        it('should issue AJAX call to /sequencenodes for sequence node retrieval', function (done)
        {
            sinon.stub(goog.net.XhrIo, "send", function(url, callback, method, message, headers){
                expect(endsWith(url, '/sequencenodes')).to.be.true;
                expect(method).to.equal("POST");
                expect(headers).to.deep.equal({"Content-Type": "application/json" });
                callback({
                    target: {
                        isSuccess: function(){ return true; },
                        getResponseJson: function(){ return {data:"dummy"}; },
                    }
                });
            });

            ipsProxy.retrieveSequenceNode(testInitializationEnvelope, function(error, result){

                console.log("*ERROR*:"+JSON.stringify(error));
                console.log("*RESULT*:"+JSON.stringify(result));

                try {
                    expect(error).to.equal(null);
                    expect(result).to.be.an('object');
                    done();
                }
                catch (e)
                {
                    done(e);
                }
            });

            goog.net.XhrIo.send.restore();

        });


        it('should issue AJAX call to /interactions for posting interaction', function (done)
        {
            
            sinon.stub(goog.net.XhrIo, "send", function(url, callback, method, message, headers){
                expect(endsWith(url, '/interactions')).to.be.true;
                expect(method).to.equal("POST");
                expect(headers).to.deep.equal({"Content-Type": "application/json" });
                callback({
                    target: {
                        isSuccess: function(){ return true; },
                        getResponseJson: function(){ return {data:"dummy"}; },
                    }
                });
            });

            ipsProxy.postInteraction(testInteractionMessage, function(error, result){

                try {
                    expect(error).to.equal(null);
                    expect(result).to.be.an('object');
                    done();
                }
                catch (e)
                {
                    done(e);
                }
            });

            goog.net.XhrIo.send.restore();
        });

        it('should issue AJAX call to /submissions for posting submissions', function (done)
        {
            
            sinon.stub(goog.net.XhrIo, "send", function(url, callback, method, message, headers){
                expect(endsWith(url, '/submissions')).to.be.true;
                expect(method).to.equal("POST");
                expect(headers).to.deep.equal({"Content-Type": "application/json" });
                var mockResult = {
                    target: {
                        isSuccess: function(){ return true; },
                        getResponseJson: function(){ return {data:"dummy"}; },
                    }
                };
                callback(mockResult);
            });
            ipsProxy.postSubmission(testSubmissionMessage, function(error, result){

                try {
                    expect(error).to.equal(null);
                    expect(result).to.be.an('object');
                    done();
                }
                catch (e)
                {
                    done(e);
                }
            });

            goog.net.XhrIo.send.restore();
        });
    });

})();

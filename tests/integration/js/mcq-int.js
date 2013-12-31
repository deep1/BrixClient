/*****************************************************************************
 * Integration test for Submissions.
 *
 * This test is integration test and is meant to run while IPS server is up.
 *
 * If you are getting error in the browser console saying: 
 * "XMLHttpRequest cannot load http://localhost:8088/sequencenodes/. 
 * Origin null is not allowed by Access-Control-Allow-Origin"
 * Double check the server was configured to access CORS (Cross Origin Resource Sharing).
 * The IPS server was programmatic configured to allow CORS, but an HTTP proxy may override it.
 *
 * Any issue with related to sequence node mismatch try refreshing the Redis cache.
 *
 * @author Young-Suk Ahn Park 
 */

'use strict';

(function () {
    var expect = chai.expect;

    var seqNodeKey = null;

    describe('MCP page ', function () {

        var ipsProxy = null;
        var eventManager = new pearson.utils.EventManager();

        before(function (done) {
            ipsProxy = new pearson.brix.utils.IpsProxy({serverBaseUrl:"http://localhost:8088"});

            ipsProxy.retrieveSequenceNode(testInitializationEnvelope, function(error, result){
                try {
                    expect(error).to.equal(null);
                    expect(result).to.be.an('object');
                    seqNodeKey = result.data.sequenceNodeKey;

//window.console.log(JSON.stringify(result.data));

                    expect(result.data.activityConfig).to.have.property('containerConfig').and.not.null;
                    expect(result.data.activityConfig).to.have.property('maxAttempts').and.to.be.at.least(1);
                    
                    done();
                }
                catch (e)
                {
                    done(e);
                }
            });
        });
        
        describe('IpsAnswerMan ', function () {
            it('should receive scoring result on submission', function (done) {

                var scoreResponseHandler = function(scoringResponse) {
                    try
                    {
                        expect(scoringResponse.score).not.null;
                        done();
                    }
                    catch (e)
                    {
                        done(e);
                    }
                };
                var answerMan = new pearson.brix.utils.IpsAnswerMan(ipsProxy);
                var submitManager = new pearson.brix.utils.SubmitManager(eventManager, answerMan);
                answerMan.scoreAnswer(seqNodeKey, testSubmissionMessage.body.studentSubmission, scoreResponseHandler);

            });
        });

    });

})();

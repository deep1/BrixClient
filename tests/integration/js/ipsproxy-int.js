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
 * @author Young-Suk Ahn Park 
 */

'use strict';

(function () {
    var expect = chai.expect;

    var seqNodeKey = null;

    describe('IPSProxy', function () {

        var ipsProxy = null;
        before(function (done) {
            ipsProxy = new pearson.brix.utils.IpsProxy({serverBaseUrl:"http://localhost:8088"});

            ipsProxy.retrieveSequenceNode(testInitializationEnvelope, function(error, result){
                try {
                    expect(error).to.equal(null);
                    expect(result).to.be.an('object');
                    seqNodeKey = result.data.sequenceNodeKey;
                    done();
                }
                catch (e)
                {
                    done(e);
                }
            });
        });


        it('should check health', function (done) {
            ipsProxy.checkHealth(function(error, result){

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
        });


        it('should retrieve sequence node successfully', function (done) {
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
        });


        it('should post interaction data successfully', function (done) {
            var message = helper.cloneObject(testInteractionMessage);
            message.sequenceNodeKey = seqNodeKey;
            ipsProxy.postInteraction(message, function(error, result){
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
        });

        it('should return error on interaction when empty sequenceNodeKey is given', function (done) {
            var message = helper.cloneObject(testInteractionMessage);
            message.sequenceNodeKey = '';
            ipsProxy.postInteraction(message, function(error, result){

                try {
                    expect(result.code).to.equal(404);
                    done();
                }
                catch (e)
                {
                    done(e);
                }
            });
        });

        it('should return error on interaction when Empty Request Body is given', function (done) {
            var message = helper.cloneObject(testInteractionMessage);
            message.sequenceNodeKey = seqNodeKey;
            message.body = '';

            var expectedErrorMessage = 'the value of body must be an object';
            ipsProxy.postInteraction(message, function(error, result){

                try {
                    expect(result.code).to.equal(400);
                    expect(result.message).to.equal(expectedErrorMessage);
                    done();
                }
                catch (e)
                {
                    done(e);
                }
            });
        });

        ////////// post Submissions //////////
        
        it('should post submission data successfully', function (done) {

            var message = helper.cloneObject(testSubmissionMessage);
            // @todo - temp hack as the server expects 'submission' instead of 'key'
            message.body.studentSubmission.submission = message.body.studentSubmission.key;
            message.sequenceNodeKey = seqNodeKey;
            ipsProxy.postSubmission(message, function(error, result){

console.log("*EX.ERROR SUBM:"+JSON.stringify(error));
console.log("*EX.RESULT SUBM:"+JSON.stringify(result));
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
        });

        it('should return error on submission when empty sequenceNodeKey is given', function (done) {
            var message = helper.cloneObject(testSubmissionMessage);
            message.sequenceNodeKey = '';
            ipsProxy.postSubmission(message, function(error, result){

                console.log("*EX.ERROR*:"+JSON.stringify(error));
                console.log("*EX.RESULT*:"+JSON.stringify(result));

                try {
                    expect(result.code).to.equal(404);
                    done();
                }
                catch (e)
                {
                    done(e);
                }
            });
        });

        it('should return error on submission when Empty Request Body is given', function (done) {
            var message = helper.cloneObject(testSubmissionMessage);
            message.sequenceNodeKey = seqNodeKey;
            message.body = '';

            var expectedErrorMessage = 'the value of body must be an object';
            ipsProxy.postSubmission(message, function(error, result){

                console.log("*EX.ERROR*:"+JSON.stringify(error));
                console.log("*EX.RESULT*:"+JSON.stringify(result));

                try {
                    expect(result.code).to.equal(400);
                    expect(result.message).to.equal(expectedErrorMessage);
                    done();
                }
                catch (e)
                {
                    done(e);
                }
            });
        });
    });

})();

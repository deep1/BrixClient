/* **************************************************************************
 * $Workfile:: ipsproxy.js                                                  $
 * *********************************************************************/ /**
 *
 * @fileoverview Abstracts the communication with IPS.
 *
 * The IPSProxy encapsulates series of methods that wraps around AJAX calls
 * to remote IPS.
 *
 * Created on       Sept 19, 2013
 * @author          Young-Suk Ahn
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.utils.IpsProxy');

goog.require('goog.debug.Logger');
goog.require("goog.net.XhrIo");


/* **************************************************************************
 * IpsProxy                                                            */ /**
 *
 * The IPSProxy encapsulates series of methods that wraps around AJAX calls
 * to remote IPS.
 *
 * @constructor
 * @export
 *
 * @param {Object}      config          - The settings to configure this IpsProxy
 * @param {string|undefined}
 *                      config.serverBaseUrl - The URL to the IPS server.
 *
 ****************************************************************************/
pearson.brix.utils.IpsProxy = function (config)
{

    /**
     * A logger to help debugging
     * @type {goog.debug.Logger}
     * @private
     */
    this.logger_ = goog.debug.Logger.getLogger('pearson.brix.utils.IpsProxy');

    /**
     * The URL to the IPS server.
     * @type {string|undefined}
     */
    this.serverBaseUrl = config.serverBaseUrl;

};

/**
 * A callback function that is supplied to the IpsProxy that will be invoked
 * once the a response from the Ips has been received. It will be invoked
 * with 2 arguments (function(error, result), the 1st is an error object that
 * will be null if no error occurred, the 2nd is the successful result return
 * value from the Ips, which will be null if an error occurred.
 *
 * @typedef {function(*, *)} pearson.brix.utils.IpsProxy.CallbackFn
 */
pearson.brix.utils.IpsProxy.CallbackFn;

/**
 * The parameter information that is needed when sending a submission
 * (a student answer that will be corrected using an answerKey available
 * on the IPS), to the IPS. This object must conform to JSON standards.
 *
 * @typedef {Object} pearson.brix.utils.IpsProxy.SubmissionParam
 * @property {string}   sequenceNodeKey -Identifies the specific question,
 *                                       student and course.
 *                                       ex. "895af0ae2d8aa5bffba54ab0555d7461"
 * @property {string}   timestamp       -format "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
 * @property {string}   type            -must be "submission"
 * @property {{studentSubmission: *}}
 *                      body            -Contains the data specific to the
 *                                       question type being answered, for
 *                                       what the student's answer is.
 *
 * @note Why require that the timestamp and type be in the parameter info
 * given to the postSubmission method, couldn't those fields be filled in
 * by the postSubmission method? -mjl
 */
pearson.brix.utils.IpsProxy.SubmissionParam;

/* **************************************************************************
 * IpsProxy.checkHealth                                                */ /**
 *
 * Returns the server health status if the callback is called without error.
 * @export
 *
 * @param  {pearson.brix.utils.IpsProxy.CallbackFn}
 *                      callback -Function that is called when the async operation
 *                                is completed.
 ****************************************************************************/
pearson.brix.utils.IpsProxy.prototype.checkHealth = function (callback)
{

    var xhr = new goog.net.XhrIo();
    var ajaxCallback = function (e)
    {
        var xhr = /** @type {goog.net.XhrIo} */ (e.target);

        var error = null;
        var result = null;

        if (xhr.isSuccess())
        {
            result = xhr.getResponseJson();
        }
        else
        {
            error = {
                        message: xhr.getLastError(),
                        status: xhr.getStatus()
                    };
        }
        callback(error, result);
    };

    goog.net.XhrIo.send(this.serverBaseUrl + '/healthInfo', ajaxCallback, 'GET');
};

/* **************************************************************************
 * IpsProxy.retrieveSequenceNode                                       */ /**
 *
 * Retrieves sequence node content.
 * The input parameter is JSON object of format:
 * {
 *   header : {
 *       "Hub-Session": <session>,
 *       "Content-Type" : "application/vnd.pearson.paf.v1.node+json"
 *   },
 *   content : {
 *        "@context": "http://purl.org/pearson/paf/v1/ctx/core/SequenceNode",
 *        "@type": "SequenceNode",
 *        "targetBinding": <binding-id>
 *   },
 *   url: <url>,
 *   method: "POST"
 * }
 * @export
 *
 * @param  {Object}   param     Parameter that contains message to be passed
 *                              to the server as request body.
 * @param  {pearson.brix.utils.IpsProxy.CallbackFn}
 *                    callback  Function that is called when the async operation
 *                              is completed.
 ****************************************************************************/
pearson.brix.utils.IpsProxy.prototype.retrieveSequenceNode = function (param, callback)
{
    this.postMessage_(this.serverBaseUrl + '/sequencenodes', param, callback);
};

/* **************************************************************************
 * IpsProxy.postInteraction                                            */ /**
 *
 * Posts interaction data to the Brix server.
 * The input parameter is JSON object of format:
 * {
 *  "sequenceNodeKey": "895af0ae2d8aa5bffba54ab0555d7461",
 *  "timestamp": "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
 *  "type": "submission",
 *  "body":
 *    {
 *      "interactionData": "...some stuff..."
 *    }
 * }
 *
 * @export
 *
 * @param  {Object}   param     Parameter that contains message to be passed
 *                              to the server as request body.
 * @param  {pearson.brix.utils.IpsProxy.CallbackFn}
 *                    callback  Function that is called when the async operation
 *                              is completed.
 ****************************************************************************/
pearson.brix.utils.IpsProxy.prototype.postInteraction = function (param, callback)
{
    this.postMessage_(this.serverBaseUrl + '/sequencenodes/' + param.sequenceNodeKey + '/interactions', param, callback);
};

/* **************************************************************************
 * IpsProxy.postSubmission                                             */ /**
 *
 * Posts submission data (the answer selected by the student that she
 * has requested be corrected) to the Brix server.
 *
 * @param  {pearson.brix.utils.IpsProxy.SubmissionParam}
 *                      param       Parameter that contains message to be passed
 *                                  to the server as request body.
 *
 * @param  {pearson.brix.utils.IpsProxy.CallbackFn}
 *                      callback    Function that is called when the async operation
 *                                  is completed.
 ****************************************************************************/
pearson.brix.utils.IpsProxy.prototype.postSubmission = function (param, callback)
{
    this.postMessage_(this.serverBaseUrl + '/sequencenodes/' + param.sequenceNodeKey + '/submissions', param, callback);
};

/* **************************************************************************
 * IpsProxy.postMessage_                                               */ /**
 *
 * Makes a REST POST request with the provided parameters.
 * @private
 *
 * @param  {Object}   param     Parameter that contains message to be passed
 *                              to the server as request body.
 *
 * @param  {pearson.brix.utils.IpsProxy.CallbackFn}
 *                    callback  Function that is called when the async operation
 *                              is completed.
 ****************************************************************************/
pearson.brix.utils.IpsProxy.prototype.postMessage_ = function (url, param, callback)
{
    var xhr = new goog.net.XhrIo();
    var ajaxCallback = function (e)
    {
        var xhr = /** @type {goog.net.XhrIo} */ (e.target);

        var error = null;
        var result = null;
        if (xhr.isSuccess())
        {
            var response = xhr.getResponseJson();
            result = response;
        }
        else
        {
            error = {
                        message: xhr.getLastError(),
                        status: xhr.getStatus()
                    };
            result = xhr.getResponseBody();
            try
            {
                result = xhr.getResponseJson();
            }
            catch (jsonErr)
            {
                error.message = 'Could not parse response body into JSON';
            }
        }
        callback(error, result);
    };

    var message = JSON.stringify(param);

    this.logger_.fine('Making POST to server[' + url + '] with ' + message);

    // Another way of requesting is creating an XhrIo instance
    // passing it to goog event listner as
    // goog.events.listenOnce(xhr, goog.net.EventType.COMPLETE, function(e) {...}
    // and the do the actual send on the instance.
    goog.net.XhrIo.send(url, ajaxCallback, 'POST',
                        message, {"Content-Type": "application/json" });
};

/* **************************************************************************
 * $Workfile:: ipc.js                                                       $
 * *********************************************************************/ /**
 *
 * @fileoverview The Brix Item Player Client (IPC).
 *
 * The IPC is responsible listening for an initialization message that
 * is expected to be published by the AMC (Activity Manager Client),
 * using information in that message to retrieve brix configuration
 * specific to it's container (either the whole document or a container
 * iframe) and instantiating the brix defined in that configuration.
 *
 * Message structure as received By IPC from the AMC through EventManager
 * message = {
 *     status: <fail | success>
 *     sourcemessage: <message when there was error>
 *     data: {
 *         asrequest: {
 *             url: <url>
 *             method: <GET | POST>
 *             header: {
 *                 "Hub-Session": <data>
 *             },
 *             content: {
 *                 "nodeIndex": <index>
 *                 "targetBinding": <data>
 *             }
 *         }
 *     }
 * }
 * The 'asrequest' field represents the sequenceNodeIdentifier
 *
 * Created on       Sept 30, 2013
 * @author          Young-Suk Ahn
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/
goog.provide('pearson.brix.Ipc');

goog.require('goog.debug.Logger');

goog.require('pearson.brix.utils.IpsProxy');
goog.require('pearson.brix.utils.IpsAnswerMan');
goog.require('pearson.brix.BricLayer');


/* **************************************************************************
 * Ipc                                                                 */ /**
 *
 * The IPC (Item Player Client) listens for AMC's (Activity Manager Client)
 * sequenceNodeIdentifier. Upon receipt of the sequenceNodeIdentifier,
 * it retrieves the brix' containerConfig from IPS and
 * instantiates and wires the brix and mortars using the BricLayer.
 *
 * @constructor
 * @export
 *
 * @param {Object}      config            -The settings to configure the Ipc
 * @param {string}      config.ipsBaseUrl -The base url to access IPS w/ AJAX
 * @param {!pearson.utils.IEventManager}
 *                      eventManager      -The event manager to use for publishing events
 *                                         and subscribing to them.
 *
 ****************************************************************************/
pearson.brix.Ipc = function (config, eventManager)
{
    /**
     * A logger to help debugging
     * @type {goog.debug.Logger}
     * @private
     */
    this.logger_ = goog.debug.Logger.getLogger('pearson.brix.Ipc');

    if (!config.ipsBaseUrl)
    {
        var errorMessage = 'IPS server base URL not provided.';
        this.logger_.severe(errorMessage);
        throw new Error(errorMessage);
    }

    /**
     * The event manager to use to publish (and subscribe to) events
     * @type {!pearson.utils.IEventManager}
     */
    this.eventManager = eventManager;

    /**
     * The IpsProxy used by this Ipc to communicate w/ the IPS
     * @type {pearson.brix.utils.IpsProxy}
     */
    this.ipsProxy = new pearson.brix.utils.IpsProxy({"serverBaseUrl": config.ipsBaseUrl});

    /**
     * List of activity identification records used to obtain the sequence node id
     * from the AMC.
     *
     * @type {!Array.<{assignmenturl: string, activityurl: string, type: (string|undefined)}>}
     */
    this.items = [];

    /**
     * The container ID is used in the iframe mode.
     * Having a value will make the IPC to retrieve a specific conatinerId
     * from the IPS.
     * @type {?string}
     */
    this.containerId = null;

    /**
     * The AnserMan, in this case the IPS answerman.
     * @type {pearson.brix.utils.IAnswerMan}
     */
    this.answerMan = new pearson.brix.utils.IpsAnswerMan(this.ipsProxy);

     /**
     * The SubmitManager
     * @type {pearson.brix.utils.SubmitManager}
     */
    this.submitManager = new pearson.brix.utils.SubmitManager(eventManager, this.answerMan);

    /** 
     * BricLayer configuration. For the moment is null, left for future.
     * @type {Object}
     */
    var bricLayerConfig = null;

    /**
     * The BricLayer instance
     * @todo - Check if it changes to singleton
     * @type {!pearson.brix.BricLayer}
     */
    this.bricLayer = new pearson.brix.BricLayer(bricLayerConfig, eventManager, this.submitManager);
};

/**
 * The SequenceNodeKey is defined by the IPS and uniquely identifies this
 * PAF Activity, user (student) and course. The IPS adds it to the activity
 * config returned to the IPC.
 *
 * @typedef {string} pearson.brix.Ipc.SequenceNodeKey
 */
pearson.brix.Ipc.SequenceNodeKey;

/* **************************************************************************
 * Ipc.init                                                            */ /**
 *
 * Initializes the IPC depending on the different parameters are passed.
 * The different parameters defines the mode: div or iframe.
 * In div-mode, the items contains an array of possibly multiple items, and
 * the optional opt_containerId is not defined (or null).
 * In iframe-mode, there is only one single item and opt_containerId is passed
 * with the containerId for that particular iframe.
 *
 * IMPORTANT: The Ipc.init() should be called prior AMC's initialization.
 *            This is because IPC mus have subscribed before AMC publishes
 *            init messages.
 *
 * @export
 *
 * @param  {!Array.<Object>} items            Array of {assignmentId=<val>, itemid=<val>, type=<val>}
 * @param  {string=}         opt_containerId  The containerId that this IPC is
 *                                            handling. Only in iframe mode.
 *                                            Should be undefined (or null) in div mode.
 ****************************************************************************/
pearson.brix.Ipc.prototype.init = function (items, opt_containerId)
{
    if (!items || items.length === 0)
    {
        this.logger_.warning('Invalid items provided');
        throw new Error('Items should be valid array.');
    }
    this.items = this.normalizeByTopic(items);

    this.logger_.config('Processing items: '+ JSON.stringify(items));

    this.subscribeInitTopic();

    var that = this;
    if (opt_containerId)
    {
        // There should be only one element in the items
        if (this.items.length != 1)
        {
            throw new Error('In the iframe mode, there should be only one item but '
                + this.items.length + ' were provided.');
        }

        // This means that we are in Iframe mode
        this.containerId = opt_containerId;

        // IPS shall also subscribe to "pageLoaded" event that is originated
        // from the master page
        this.eventManager.subscribe('__system_pageLoaded', function (message) {
            that.logger_.config("Page loaded message received.");
            for (var i=0; i < that.items.length; i++)
            {
                var reqSeqNodeIdentifierMsg = {
                    type: "requestbinding",
                    replytopic : that.activityBindingReplyTopic(items[i]),
                    data : {
                        assignmenturl: items[i].assignmenturl,
                        activityurl: items[i].activityurl
                    }
                };
                that.eventManager.publish('AMC', reqSeqNodeIdentifierMsg);
            }
        });
    }
};

/* **************************************************************************
 * Ipc.normalizeByTopic                                                */ /**
 *
 * Returns the array where the redundant topic combination are removed.
 * For example array has:
 * [{assignmenturl="A", activityurl="B", containerid="rector"}
 * ,{assignmenturl="A", activityurl="B", containerid="step"}
 * ,{assignmenturl="A", activityurl="C", containerid="slider"}]
 * Then the array is merged as
 * [{assignmenturl="A", activityurl="B"}
 * ,{assignmenturl="A", activityurl="C", containerid="slider"}]
 * Notice that the repeated combination of assignmenturl="A", activityurl="B" were
 * merged into one.
 * This will guarantee that the bricLayer calls build() only once per same sequence node.
 *
 * @param  {!Array.<Object>} items  Array of {assignmentId=<val>, itemid=<val>, type=<val>}
 * @return {!Array.<Object>}        Normalized array.
 ****************************************************************************/
pearson.brix.Ipc.prototype.normalizeByTopic = function (items)
{
    // Dictionary to check for duplicates
    var dictionary = {};

    var result = [];
    for (var i=0; i < items.length; i++)
    {
        var topic = this.activityBindingReplyTopic(items[i]);
        var entryDic = dictionary[topic];
        if (entryDic)
        {
            if (entryDic.counter == 1)
            {
                // From the first element, remove the attributes other than those used for topics
                result[entryDic.firstIndex] = {
                    assignmenturl: result[entryDic.firstIndex].assignmenturl,
                    activityurl: result[entryDic.firstIndex].activityurl
                };
            }
            entryDic.counter++;
        }
        else
        {
            // It not found in the dictionary, push to the result array
            dictionary[topic] = {firstIndex: result.length, counter:1};
            result.push(items[i]);
        }
    }
    return result;
};

/* **************************************************************************
 * Ipc.activityBindingReplyTopic                                       */ /**
 *
 * Returns the topic name for the init event subscription.
 * Must be exactly same as laspaf.js's
 *
 * @param  {Object} item     An object that represents an item.
 *                           assignmenturl and activityurl properties are required.
 *
 * @return {string}          The topic name
 ****************************************************************************/
pearson.brix.Ipc.prototype.activityBindingReplyTopic = function (item)
{
    if (!item.assignmenturl || !item.activityurl)
    {
        var errMessage = 'Invalid argument required properties "assignmenturl" or "activityurl" not found.';
        this.logger_.config(errMessage);
        throw new Error(errMessage);
    }
    return 'init.' + item.assignmenturl + '.' + item.activityurl;
};


/* **************************************************************************
 * Ipc.subscribeInitTopic                                              */ /**
 *
 * Subscribes to initialization topic using the provided item(s) information
 * (formerly known as itemId)
 ****************************************************************************/
pearson.brix.Ipc.prototype.subscribeInitTopic = function ()
{
    var item;
    var that = this;
    // Iterate through items and subscribe
    for(var i = 0; i < this.items.length; i++)
    {
        item = this.items[i];

        // topic by virtue of closure
        var currTopic = this.activityBindingReplyTopic(item);

        // Anonymous function to create a scope for the currTopic to live as closure.
        // the topic is used to unsubscribe in the following lines
        (function(topic) {
            that.logger_.config("Subscribing to: " + topic);
            that.eventManager.subscribe(topic, function(initMessage) {
                that.logger_.config("Initialization message received for topic: " + topic);
                if (initMessage.status != 'success') // I.e., status == 'fail'
                {
                    that.logger_.warning("initMessage returned error status. " + JSON.stringify(initMessage));
                }
                else
                {
                    // Unsubscribe, initialization is no longer needed.
                    that.eventManager.unsubscribe(topic, this);

                    var date = new Date();
                    var seqNodeRequestMessage = {
                        sequenceNodeIdentifier: initMessage.data.asrequest,
                        timestamp: date.toISOString(),
                        type: "initialization",
                        body: {}
                    };
                    // add containerId if exists (e.g. Iframe mode)
                    if (that.containerId)
                    {
                        seqNodeRequestMessage.body.containerId = that.containerId;
                    }

                    that.logger_.finer("Invoking ipsProxy.retrieveSequenceNode: "+ JSON.stringify(seqNodeRequestMessage));
                    that.ipsProxy.retrieveSequenceNode(seqNodeRequestMessage, function (error, result){
                        // Build the building!
                        if (error)
                        {
                            // Handle server error
                            that.logger_.severe("ERROR on retrieveSequenceNode: "+ JSON.stringify(error));
                        }
                        else
                        {
                            // in the absence of error, result is containerConfig
                            that.logger_.fine("Building brix from : " + JSON.stringify(result.data['activityConfig']));
                            that.bricLayer.build(result.data['activityConfig']);
                            that.logger_.fine("Building brix completed.");
                        }
                    }); // Does the AJAX call to IPS

                }

            });
        })(currTopic);
    }
};

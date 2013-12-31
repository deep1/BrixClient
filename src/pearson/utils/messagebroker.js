/* **************************************************************************
 * $Workfile:: messagebroker.js                                             $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the MessageBroker

 * MessageBroker is the component that lives in the master document (html) and 
 * serves as a middleware that relays messages between iframes.
 *
 * There are two channels of events handled based on message type.
 * - 'message': to handle messages events including subscription, unsubscription, and publishing
 * - 'view':    to handler view events, mainly resize.
 *
 * Topic based messaging (channel 2) is implemented by EventManager.
 *
 * The message format is as follows (the inner structure 'data' is the actual payload sent by cements).
 * Notice that the message contains the topic.
 * 
 * Event = {
 *  source: <source>,
 *  data: {
 *      type: (view | message), 
 *      method: (specific to type),
 *      payload: (Object)
 *
 *      #case type='message'. This case is when the message is actually sent to EventManager
 *      method: (subscribe | unsubscribe | publish ),
 *      payload:{
 *          sendTime: <time was sent in unix format>
 *          topic: <the event manager's topic: objectId/event_name ("all-loaded" is reserved)>
 *          message: <specific data, usually collection of key-value pairs> 
 *      }
 *
 *      #case type='view'
 *      method: "set",
 *      payload:{
 *          width:<w>,
 *          height:<h>
 *      }
 *   }
 * }
 *
 *
 * Created on       July 11, 2013
 * @author          Young Suk Ahn Park
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.utils.IframeCollection');
goog.provide('pearson.utils.MessageBroker');

// Must include goog/diposable/disposable.js
goog.require('goog.Disposable');
goog.require('goog.debug.Logger');
goog.require('goog.debug.Logger.Level');

goog.require('pearson.utils.EventManager');
goog.require('pearson.utils.DomHelper');

/* **************************************************************************
 * IframeCollection                                                    */ /**
 *
 * Constructor function for IframeCollection instances.
 *
 * @constructor
 * @extends {goog.Disposable}
 * @export
 *
 * @classdesc
 * Abstract Data Type that specifically contains iframes.
 * This class serves as caching mechanism for the brix iframes. The collection
 * contains the iframe's  window object reference as well as payload with
 * the DOM node of the iframe. 
 *
 * @note Young Suk, This class doesn't look abstract to me -mjl
 *
 ****************************************************************************/
pearson.utils.IframeCollection = function ()
{
    // call the base class constructor
    goog.base(this);

    /**
     * List of (i)frames as obtained by the querySelectorAll(). 
     * @type {Array.<Element>}
     */
    this.framesList = null;

    /**
     * Array of objects that holds information associated to the frames. 
     * Contains {node: [reference to the iframe], subscribeHandler: [function that handles the received message]}
     * @type {Array.<{node: Element, subscribeHandler: function(Object)}>}
     */
    this.frameCustomParams = [];

};
goog.inherits(pearson.utils.IframeCollection, goog.Disposable);

/* **************************************************************************
 * IframeCollection.disposeInternal                                    */ /**
 *
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects. Classes that extend {@code goog.Disposable}
 * should override this method. Not reentrant.
 * To avoid calling it twice, it must only be called from the
 * subclass' {@code disposeInternal} method. Everywhere else the public
 * {@code dispose} method must be used. 
 *
 * Releases used resources: the list of iframe references
 * @override
 * @protected
 ****************************************************************************/
pearson.utils.IframeCollection.prototype.disposeInternal = function ()
{
    goog.base(this, 'disposeInternal');

    this.frameCustomParams = null;
};

/* **************************************************************************
 * IframeCollection.loadFrames                                        */ /**
 *
 * Loads the (i)frames of a specific class. These (i)frames are hosts brix.
 * The MessageBroker uses references to these (i)frames to send messages.
 *
 * @param {String} classAttr        The class for selecting the object element 
 *                                  to be converted. (i.e. 'bric')
 * 
 ****************************************************************************/
pearson.utils.IframeCollection.prototype.loadFrames = function (classAttr)
{
    this.framesList = document.querySelectorAll("iframe." + classAttr);

    // Also maintain an array that holds further information associated with  
    for (var i = 0; i < this.framesList.length; i++)
    {
        this.setFrameCustomParams(i, {node: this.framesList[i], subscribeHandler: null});
    }
};

/* **************************************************************************
 * IframeCollection.setFrameCustomParams                               */ /**
 * 
 * Sets user defined parameters to the (i)frame object. The parameter is used
 * to hold message handler function for subscription.
 * 
 * @param {number}  index   The index in the array that represent the cache 
 * @param {{node: Element, subscribeHandler: function(Object)}
 *                  value   The value of the payload to associate with the (i)frame
 * 
 ****************************************************************************/
pearson.utils.IframeCollection.prototype.setFrameCustomParams = function (index, value)
{
    this.frameCustomParams[index] = value;
};

/* **************************************************************************
 * IframeCollection.getFrameCustomParams                               */ /**
 * 
 * Gets the user defined parameters given the (i)frame object
 * 
 * @param  {Window} windowObj The reference of the iframe
 *
 * @return {Object} They payload value associated with this iframe
 ****************************************************************************/
pearson.utils.IframeCollection.prototype.getFrameCustomParams = function (windowObj)
{
    for (var i = 0; i < this.framesList.length; i++)
    {
        if (windowObj === this.framesList[i].contentWindow)
        {
            return this.frameCustomParams[i];
        }
    }
    return null;
};

/* **************************************************************************
 * IframeCollection.getFrameCustomParamsByIndex                        */ /**
 * 
 * Gets the user defined parameters given the (i)frame index.
 * 
 * @param  {number} index The index in the array of iframes
 *
 * @return {Object} They payload value associated with this iframe
 ****************************************************************************/
pearson.utils.IframeCollection.prototype.getFrameCustomParamsByIndex = function (index)
{
    return this.frameCustomParams[index];
};

/* **************************************************************************
 * pearson.utils.IframeCollection.resize                               */ /**
 *
 * Resizes the iframe node to a specific dimension.
 * @todo: Check that all user agents (browsers) that we intend to support
 *        behave correctly.
 *
 * @param {Window}  window      The window (iframe) object to be resized.
 * @param {pearson.utils.ISize}
 *                  dimension   The object that contains width and height attributes.
 * 
 ****************************************************************************/
pearson.utils.IframeCollection.prototype.resize = function (window, dimension)
{
    var frameEntry =  this.getFrameCustomParams(window);

    if (frameEntry)
    {
        var frameObject = frameEntry.node;
        frameObject.style.width = dimension.width + 'px';
        frameObject.style.height = dimension.height + 'px';
    }
};

/* **************************************************************************
 * MessageBroker                                                       */ /**
 *
 * Constructor function for MessageBroker instances.
 *
 * @constructor
 * @extends {goog.Disposable}
 * @export
 *
 * @param {Object}      config          -The settings to configure this MessageBroker
 * @param {!pearson.utils.DomHelper=}
 *                      domHelper       -A DOM helper which provides useful utilities
 *                                       to manipulate the DOM.
 *
 * @classdesc
 * The MessageBroker is the messaging component that bridges the EventManagers
 * in the iframes.
 *
 ****************************************************************************/
pearson.utils.MessageBroker = function (config, domHelper)
{
    // call the base class constructor
    //goog.base(this);

    // Auto call to the initialization method disabled 
    // favoring the use of MessageBroker as singleton.
    //this.initialize.apply(this, arguments);

    // If DomHelper is not explicitly provided, create a default one.
    // @todo: if not created, then it should not dispose either.
    /**
     * Flag whether this.domHelper was supplied or not, so we know if
     * we should dispose of it.
     * @private
     * @type {boolean}
     */
    this.domHelperWasProvided_ = domHelper ? true : false;

    /**
     * A logger to help debugging 
     * @type {goog.debug.Logger}
     * @private
     */
    this.logger_ = goog.debug.Logger.getLogger('pearson.utils.MessageBroker');

    /**
     * The DomHelper this message broker will use when needed.
     * @type {pearson.utils.DomHelper}
     */
    this.domHelper = domHelper !== undefined ? domHelper : pearson.utils.DomHelper;

    /**
     * The IFrameContainer. This object is used for the cache of frames.
     * @type {IframeCollection}
     */
    this.iframeCollection = new pearson.utils.IframeCollection();

    /**
     * The Number of bric messages received. Primarily for testing purpose.
     * @type {number}
     */
    this.messageEventCounter = 0;

    /**
     * The Number of resize messages received. Primarily for testing purpose.
     * @type {number}
     */
    this.viewEventCounter = 0;

    /**
     * The function attached to the windows event. Dispatches the incoming events
     * into appropriate channels.
     * @private
     * @type {Function}
     */
    this.channelDispatcher_ = null;


    /**
     * The map that contains channel handlers. Channel handlers are analogous to Commands in the Command pattern.
     * Currently there are two default channels: 
     * 'message' - to handle messages events including subscription, unsubscription, and publishing
     * 'view' - to handler view events, mainly resize.
     * It can later be extended by adding new function pointers that process channel messages.
     * @type {Array.<Function>}
     */
    this.channelHandlers = {};


    /**
     * The PubSub used internally to subscribe iframes and handle messages.
     * The pubSub object must have publish, subscribe an unsubscribe methods.
     * Currently is an instance of EventManager. Notice the constructor 
     * argument is false since it must not propagate the message to parent window. 
     * @type {!pearson.utils.IEventManager}
     */
    this.pubSub = new pearson.utils.EventManager(false);


    // Register the two default Channel Handlers
    var that = this;
    this.channelHandlers['message'] = function (evt)
    {
        if (evt.data.method === 'publish')
        {
            that.messageEventCounter++;
            that.publish(evt.data.payload.topic, evt);
        }
        else if (evt.data.method === 'subscribe')
        {
            that.subscribe(evt.data.payload.topic, evt.source);
        }
        else if (evt.data.method === 'unsubscribe')
        {
            that.unsubscribe(evt.data.payload.topic, evt.source);
        }
    };

    this.channelHandlers['view'] = function (evt)
    {
        that.viewEventCounter++;
        that.iframeCollection.resize(evt.source, evt.data.payload);
    };
    
}; // end of MessageBroker constructor
goog.inherits(pearson.utils.MessageBroker, goog.Disposable);


/* **************************************************************************
 * MessageBroker.initialize                                            */ /**
 *
 * The initialization does:
 * 1. registers the channelDispatcher to the windowEventListener
 * 2. Converts object nodes to iframe nodes
 * 3. Loads the bric iframes to the IfraemCollection
 *
 * @param {Object}  options           Options.
 * @param {number=} options.logLevel  The log level.
 * 
 ****************************************************************************/
pearson.utils.MessageBroker.prototype.initialize = function (options)
{
    if (options !== undefined)
    {
        if (options.logLevel !== undefined)
            this.logLevel = options.logLevel;
    }


    var _self = this;
    // Function defined here so we can access the this pointer
    // (aliased as _self)
    this.channelDispatcher_ = function(evt)
    {
        _self.logger_.fine("Message Received: " + evt.data);
        var chanHandler = _self.channelHandlers[evt.data.type];
        if (chanHandler)
        {
            chanHandler(evt);
        }
        else
        {
            _self.logger_.warning("Channel Handler for '" + evt.data.type +"' not found, ignoring!");
        }
    };


    // Listen to messages events
    window.addEventListener('message', this.channelDispatcher_);

    // Shall the host application do this manually??
    // Conversion of the Object to Iframe must come after the addEventListener.
    this.domHelper.convertObjectToIframeElement('bric');

    // Load iframes wich the specified class name
    this.iframeCollection.loadFrames('bric');
    this.logger_.config("MessageBroker initialized.");
};

/* **************************************************************************
 * MessageBroker.disposeInternal                                       */ /**
 *
 * Unregister the message event listener, and
 * releases used references (the list of iframes), and 
 ****************************************************************************/
pearson.utils.MessageBroker.prototype.disposeInternal = function ()
{
    goog.base(this, 'disposeInternal');

    // Disable Channel Dispatcher
    window.removeEventListener('message', this.channelDispatcher_);

    this.pubSub = null;

    this.iframeCollection.disposeInternal();
    //this.iframeCollection = null;
    this.logger_.config("MessageBroker disposed (listeners removed).");
};

/* **************************************************************************
 * MessageBroker.subscribe                                             */ /**
 *
 * Subscribes a window (iframe) to a specific topic.
 *
 * @param {string}  topic       The topic to subscribe to.
 * @param {Windows} windowsObj  The windows object to subscribe.
 *
 * @return {boolean} True if subscribed, false otherwise 
 *                   (If the windows is not part of the loaded iframe, it will
 *                   not be subscribed, and thus return false.)
 * 
 ****************************************************************************/
pearson.utils.MessageBroker.prototype.subscribe = function (topic, windowsObj)
{
    var frameEntry = this.iframeCollection.getFrameCustomParams(windowsObj);

    if (frameEntry === undefined)
    {
        return false;
    }

    // If message hanlder exists for this particular ifrmae, reuse it
    // This will avoid multiple subscription of the same iframe
    var subscribeHandler = frameEntry['subscribeHandler'];

    if (!subscribeHandler)
    {
        subscribeHandler = function(evt)
        {
            if ( frameEntry.node.contentWindow === evt.source)
            {
                this.logger_.fine("Skipping the iframe where the message was originated.");
                return;
            }
            this.logger_.fine("Posting message to an iframe");
            // Sending the entire message as is
            frameEntry.node.contentWindow.postMessage(evt.data, '*');
        };

        frameEntry['subscribeHandler'] = subscribeHandler;
    }

    this.pubSub.subscribe(topic, goog.bind(subscribeHandler, this));
    this.logger_.config("Frame '"+ frameEntry.node.src +"' subscribed to topic: [" + topic + "]");

    return true;
};

/* **************************************************************************
 * MessageBroker.unsubscribe                                           */ /**
 *
 * Subscribes a window to a specific topic.
 *
 * @param {string}  topic   The topic to subscribe to.
 * @param {Windows} evt     The windows object to subscribe.
 *
 * @return {boolean} True if subscribed, false otherwise 
 *                   (The unsubscription will return false if this particular 
 *                   iframe was never subscribed)
 * 
 ****************************************************************************/
pearson.utils.MessageBroker.prototype.unsubscribe = function (topic, windowsObj)
{
    var frameEntry = this.iframeCollection.getFrameCustomParams(windowsObj);

    if (frameEntry === undefined)
    {
        return false;
    }

    var subscribeHandler = frameEntry['subscribeHandler'];

    if (!subscribeHandler)
    {
        return false;
    }

    this.pubSub.unsubscribe(topic, subscribeHandler);
    this.logger_.config("Frame '"+ frameEntry.node.src +"' unsubscribed from topic: [" + topic + "]");

    return true;
};

/* **************************************************************************
 * MessageBroker.publish                                               */ /**
 *
 * Publishes message to the rest of iframes subscribed to the specified topic.
 *
 * @param {String} topic        The topic to publish the message.
 * @param {Object} message      The message to be published.
 * 
 ****************************************************************************/
pearson.utils.MessageBroker.prototype.publish = function (topic, evt)
{
    this.logger_.fine("Publishing message: " + JSON.stringify(evt.data.payload));
    this.pubSub.publish(topic, evt);
};


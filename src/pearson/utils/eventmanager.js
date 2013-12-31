/* **************************************************************************
 * $Workfile:: eventmanager.js                                              $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of an EventManager object.
 *
 * The EventManager implements the Observer pattern, aka (Publish/Subscribe)
 * as described here: http://msdn.microsoft.com/en-us/magazine/hh201955.aspx
 * A javascript implementation of this pattern is available at:
 * https://github.com/mroderick/PubSubJS
 *
 *
 * Created on		March 18, 2013
 * @author			Michael Jay Lippert
 * @author			Young Suk Ahn Park
 *
 * **************************************************************************/

goog.provide('pearson.utils.IEventManager');
goog.provide('pearson.utils.EventManager');

/* **************************************************************************
 * IEventManager                                                       */ /**
 *
 * Interface for event managers.
 *
 * @interface
 *
 ****************************************************************************/
pearson.utils.IEventManager = function () {};

/* **************************************************************************
 * IEventManager.publish                                               */ /**
 *
 * Notify the event manager that a particular event (topic) has occurred
 * so that the event manager can call the handlers of all subscribers to that
 * event (topic).
 *
 * @param {string}	eventId			-The identifier of the event being fired.
 *									 aka topic.
 * @param {Object=}	eventDetails	-The details of the event to be passed to each
 *									 subscriber's notification function. Its value
 *									 is specific to the particular event.
 *
 ****************************************************************************/
pearson.utils.IEventManager.prototype.publish = function (eventId, eventDetails) {};

/* **************************************************************************
 * IEventManager.subscribe                                             */ /**
 *
 * Request that when a particular event (topic) is published, the given
 * handler function will be called w/ that event's event details.
 *
 * @param {string}		eventId		-The identifier of the event that when fired
 *									 should invoke the given callback. aka topic.
 * @param {Function}	handler		-The function that will be called when the
 *									 event is fired.  
 *
 ****************************************************************************/
pearson.utils.IEventManager.prototype.subscribe = function (eventId, handler) {};

/* **************************************************************************
 * IEventManager.unsubscribe                                           */ /**
 *
 * EventManager class method to unsubscribe from an event that an object may fire.
 *
 * @param {string}		eventId		-The identifier of the event (aka topic)
 * 									 to unsubscribe from.
 * @param {Function}	handler		-The callback function to unsubscribe.  
 *
 ****************************************************************************/
pearson.utils.IEventManager.prototype.unsubscribe = function (eventId, handler) {};

/**
 * A dummy instance of IEventManager which does nothing. This is useful
 * as a value for IEventManager properties so they can be used w/o having
 * to check for null or undefined.
 * @type {!pearson.utils.IEventManager}
 */
pearson.utils.IEventManager.dummyEventManager = /** @type {!pearson.utils.IEventManager} */
	({
		publish: function () {},
		subscribe: function () {},
		unsubscribe: function () {}
	});

/* **************************************************************************
 * EventManager                                                        */ /**
 *
 * Constructor for the pearson EventManager which also contains
 * capabilities to work in an iframe w/ a "Message Broker" in the parent
 * to forward and receive events w/ EventManagers in other iframes.
 *
 * @constructor
 * @implements {pearson.utils.IEventManager}
 * @export
 *
 * @param {boolean=} publishToBroker	Whether or not to send message to the 
 * 										MessageBroker in the parent window,
 * 										the default is false.
 *
 * @classdesc
 * The event manager keeps track of subscribers of a particular topic (event)
 * so that when a publisher publishes that topic all of the subscribers can
 * be notified.
 * It also can work in an iframe w/ a "Message Broker" in the parent
 * to forward and receive events w/ EventManagers that live in other iframes.
 *
 * A single EventManager should be used for all events (in the page, or iframe).
 * This will allow one widget on a page to respond to an event published (fired)
 * by another widget on the page. It also will allow for multiple responses to
 * a single event.
 *
 ****************************************************************************/
pearson.utils.EventManager = function (publishToBroker)
{
	// Private Fields (should not be referenced except by EventManager methods)
	
	/**
	 * events_ associates eventIds with an array of publishers and an array of
	 * subscribers to that event.
	 * @type {Object.<string, pearson.utils.EventManager.ManagedEventInfo_>}
	 * @private
	 */
	this.events_ = {};

	/**
	 * The publishToBroker flag determines whether published events should
	 * be sent to the MessageBroker, which propogates the event to EventManager
	 * subscriptions in other iframes.
	 * @type {boolean}
	 * @private
	 */
	this.publishToBroker_ = (publishToBroker === undefined) ? false : publishToBroker;
};

/**
 * ManagedEventInfo_ is the information stored internally by the EventManager
 * for each subscribed eventId.
 *
 * @typedef {Object} ManagedEventInfo_
 * @property {Array.<Function>}	handlers	-List of subscribed handlers for an
 * 											 eventId.
 * @private
 */
pearson.utils.EventManager.ManagedEventInfo_;

/* **************************************************************************
 * EventManager.enablePublishToBroker                                  */ /**
 *
 * Method to enable or disable publishing the message to the MessageBroker
 * in the parent window.
 * @export
 *
 * @param {boolean} enable		-True enables, false disables.
 *								
 ****************************************************************************/
pearson.utils.EventManager.prototype.enablePublishToBroker = function (enable)
{
	this.publishToBroker_ = enable;
};

/* **************************************************************************
 * EventManager.subscribe                                              */ /**
 *
 * EventManager class method to subscribe to an event that an object may fire.
 * @export
 *
 * @param {string}		eventId		-The identifier of the event that when fired
 *									 should invoke the given callback. aka topic.
 * @param {Function} 	handler		-The function that will be called when the
 *									 event is fired.  
 *
 * @note
 * - We'll need to create some unique token if we want to allow unsubscribe.
 * - If you subscribe to the same callback multiple times, when the event is
 *   fired it will be called once for each subscription.
 ****************************************************************************/
pearson.utils.EventManager.prototype.subscribe = function (eventId, handler)
{
	// If the eventId has never been subscribed to, add it
	if (!(eventId in this.events_))
	{
		this.events_[eventId] =  { handlers: [] };
	}
	
	var event = this.events_[eventId];
	
	// Guard against duplicate subscription
	for(var i = 0, length = event.handlers.length; i < length; i++) 
	{
		if (event.handlers[i] === handler)
			return;
	}

	// Add the handler to the list of handlers of the eventId
	event.handlers.push(handler);

	// YSAP - Send to the parent window as well.
	// For the message structure see messagebroker.js
	if (this.publishToBroker_)
	{
		window.parent.postMessage({ type: "message",
									method: "subscribe",
									payload: {
										topic: eventId
									}
								  }, '*');	

		window.console.log("[" + location.href +
						   "] EventManager: subscription of topic '" 
						   + eventId + "' propagated to MessageBroker");
	}
};

/* **************************************************************************
 * EventManager.unsubscribe                                            */ /**
 *
 * EventManager class method to unsubscribe from an event that an object may fire.
 * @export
 *
 * @param {string}		eventId		-The identifier of the event (aka topic)
 * 									 to unsubscribe from.
 * @param {Function}	handler		-The callback function to unsubscribe.  
 *
 * @note
 * - We'll need to create some unique token if we want to allow unsubscribe.
 * - If you subscribe to the same callback multiple times, when the event is
 *   fired it will be called once for each subscription.
 ****************************************************************************/
pearson.utils.EventManager.prototype.unsubscribe = function (eventId, handler)
{
	var event = this.events_[eventId];

	if (!event)
	{
		return;
	}
	
	// Iterate over the array of handlers and remove the matching one
	for( var i = 0, length = event.handlers.length; i < length; i++) 
	{
		if (event.handlers[i] === handler)
		{
			event.handlers.splice( i, 1 );
					
			// Reduce the counter and length accordingly
			i--;
			length--;
		}
	}

	// YSAP - Send to the parent window as well.
	// For the message structure see messagebroker.js
	if (this.publishToBroker_)
	{
		// If the topic has zero subscribers (handlers)
		// then remove from the MessageBroker as well.
		if (event.handlers.length == 0)
		{
			window.parent.postMessage({ type: "message",
										method: "unsubscribe",
										payload: {
											topic: eventId
										}
									  }, '*');	

			window.console.log("[" + location.href +
							   "] EventManager: unsubscription of topic '" 
							   + eventId + "' propagated to MessageBroker");
		}
	}
};

/* **************************************************************************
 * EventManager.publishLocal_                                          */ /**
 *
 * EventManager class method to publish (fire) an event calling the
 * notification function of all subscribers of that event.
 * This method does not send message to the MessageBroker.
 * @private
 *
 * @param {string}	eventId			-The identifier of the event being fired.
 *									 aka topic.
 * @param {Object=}	eventDetails	-The details of the event to be passed to each
 *									 subscriber's notification function. Its value
 *									 is specific to the particular event.
 *
 ****************************************************************************/
pearson.utils.EventManager.prototype.publishLocal_ = function (eventId, eventDetails)
{
	// If there are no subscribers, do nothing
	if (eventId in this.events_)
	{
		var event = this.events_[eventId];

        // clone the handlers array in case it gets modified while we're publishing
        // this event
        var handlers = event.handlers.slice(0);
		
		// Call all the subscribed notification functions for this event
		for (var i = 0, n = handlers.length; i < n; ++i)
		{
			var handler = handlers[i];
			handler(eventDetails);
		}
	}
};

/* **************************************************************************
 * EventManager.publish                                                */ /**
 *
 * Besides publishing the event to the local subscribers, it also sends 
 * to the MessageBroker which is an message listener at parent window.
 * @export
 *
 * @param {string}	eventId			-The identifier of the event being fired.
 *									 aka topic.
 * @param {Object=}	eventDetails	-The details of the event to be passed to each
 *									 subscriber's notification function. Its value
 *									 is specific to the particular event.
 *
 ****************************************************************************/
pearson.utils.EventManager.prototype.publish = function (eventId, eventDetails)
{
	// Notify any "local" subscribers
	this.publishLocal_(eventId, eventDetails);

	// YSAP - Send to the parent window as well.
	// For the message structure see messagebroker.js
	if (this.publishToBroker_)
	{
		window.parent.postMessage(
			{
				type: "message",
				method: "publish",
				payload: {
					topic: eventId,
					message: eventDetails
				}
			}, '*');	
	}
};

/* **************************************************************************
 * EventManager.listenBroker                                           */ /**
 *
 * Start listening to the window's message event. 
 * Only required if the iframe contains bric that listens to events.
 * The iframe are supposed to invoke this method when all the objects are 
 * ready to handle events. 
 * @export
 *
 ****************************************************************************/
pearson.utils.EventManager.prototype.listenBroker = function ()
{
	var that = this;
	window.addEventListener('message',
			function (evt)
			{
				var data = evt.data;
				var here = location.href;
				if (data.type === 'message')
				{
					if (data.method === 'publish') {
						window.console.log("[" + here +
										   "] EventManager: Handling " +data.type + " message:" +
										   JSON.stringify(data));

						// Publish the remote event to any local subscribers
						that.publishLocal_(data.payload.topic, data.payload.message);
					}
				}
			},
			false
	);
};


/* **************************************************************************
 * $Workfile:: invoker.js                                                   $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the method invoker utility.
 *
 * The Invoker will call a method on an object w/ specified arguments
 * in response to an event.
 *
 * Created on		July 24, 2013
 * @author			Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

/* **************************************************************************
 * Invoker                                                             */ /**
 *
 * Constructor for an Invoker which is intended to be a singleton.
 *
 * @constructor
 *
 * @param {!EventManager} eventManager	-The event manager to use for publishing
 * 										 events and subscribing to them.
 *
 * @classdesc
 * The Invoker will call methods on registered objects when an event is
 * sent requesting that call.
 *
 **************************************************************************/
function Invoker(eventManager)
{
	/**
	 * The event manager to use to publish (and subscribe to) events for this widget
	 * @type {EventManager}
	 */
	this.eventManager = eventManager;

	/**
	 * The map of registered names to the objects they refer to.
	 * @type {Array.<!Object>}
	 */
	this.objectMap_ = {};

	/**
	 * The event id subscribed to whose handler will invoke the specifed method
	 * on a registered object.
	 * @const
	 * @type {string}
	 */
	this.invokeMethodEventId = "invoke";

	/**
	 * The event details for this.invokeMethodEventId events
	 * @typedef {Object}	InvokeMethodEventDetails
	 * @property {string}	objectName	-The registered name of the object whose method
	 * 									 is to be invoked.
	 * @property {string}	methodName	-The name of the method to invoke.
	 * @property {Array}	args		-An array of arguments to be passed to this
	 * 									 invocation of the method.
	 */

	// a reference for this instance to be used in local function expressions
	var that = this;

	eventManager.subscribe(this.invokeMethodEventId,
			function (ed)
			{
				// check for required properties
				if (!ed || !ed.objectName || !ed.methodName)
				{
					return;
				}

				that.invokeMethodOn(ed.objectName, ed.methodName, ed.args);
			});
}

/* **************************************************************************
 * Invoker.registerObject                                              */ /**
 *
 * [Description of registerObject]
 *
 * @param {string}	name		-[Description of name]
 * @param {Object}	obj			-[Description of obj]
 *
 ****************************************************************************/
Invoker.prototype.registerObject = function(name, obj)
{
	if (name in this.objectMap_)
	{
		throw "Attempted to register an object w/ an already registered name: '" +
			  name + "'";
	}

	this.objectMap_[name] = obj;
};

/* **************************************************************************
 * Invoker.invokeMethodOn                                              */ /**
 *
 * [Description of invokeMethodOn]
 *
 * @param {string}	objectName	-[Description of objectName]
 * @param {string}	methodName	-[Description of methodName]
 * @param {Array}	args		-[Description of args]
 *
 ****************************************************************************/
Invoker.prototype.invokeMethodOn = function(objectName, methodName, args)
{
	// Get the object
	if (!(objectName in this.objectMap_))
	{
		return;
	}
	var o = this.objectMap_[objectName];

	// Get the method
	if (!(methodName in o))
	{
		return;
	}
	var f = o[methodName];

	if (typeof f !== "function")
	{
		return;
	}

	// Make sure that args is an array
	if (typeof args !== "array")
	{
		args = [];
	}

	// Invoke the method on the object w/ the supplied arguments
	f.apply(o, args);
};


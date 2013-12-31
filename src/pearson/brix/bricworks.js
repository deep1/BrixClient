/* **************************************************************************
 * $Workfile:: bricworks.js                                                 $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the BricWorks bric factory.
 *
 * The BricWorks is a factory which creates brix.
 *
 * Created on		June 26, 2013
 * @author			Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.BricWorks');

goog.require('goog.object');
goog.require('pearson.utils.IEventManager');
goog.require('pearson.brix.Bric');
goog.require('pearson.brix.mortar.Mortar');


/* **************************************************************************
 * BricWorks                                                           */ /**
 *
 * Constructor function for the BricWorks factory.
 *
 * @constructor
 *
 * @param {Object}		config			-The settings to configure this BrixWorks.
 * @param {!pearson.utils.IEventManager=}
 * 						eventManager	-The event manager to use for publishing events
 * 										 and subscribing to them.
 *
 * @classdesc
 * A BricWorks is a factory which creates brix using the bricMolds and mortar
 * using mortarMixes which have been registered with the BricWorks.
 *
 ****************************************************************************/
pearson.brix.BricWorks = function (config, eventManager)
{
    /**
     * Logger for this BricWorks
     * @private
     * @type {goog.debug.Logger}
     */
    this.logger_ = goog.debug.Logger.getLogger('pearson.brix.BricWorks');

	/**
	 * The event manager to use to publish (and subscribe to) events for the
	 * created brix.
	 * @type {!pearson.utils.IEventManager}
	 */
	this.eventManager = eventManager || pearson.utils.IEventManager.dummyEventManager;

	/**
	 * The bricCatalogue is the reference to all of the brix that this BricWorks
	 * can manufacture.
	 * @type {Object.<string, function(new:pearson.brix.Bric, Object, !pearson.utils.IEventManager=, !pearson.brix.BricWorks=)>}
	 * @private
	 */
	this.bricCatalogue_ = {};

	/**
	 * The mortarCatalogue is the reference to all of the mortar types that this
	 * BricWorks can manufacture.
	 * @type {Object.<string, function(new:pearson.brix.mortar.Mortar, Object, !pearson.utils.IEventManager=)>}
	 * @private
	 */
	this.mortarCatalogue_ = {};

}; // end of BricWorks constructor

/* **************************************************************************
 * BricWorks.registerBricMold                                          */ /**
 *
 * Register the mold (constructor) used to create a bric.
 *
 * @param {string}
 * 					bricName	-The name of the bric that the given mold creates.
 * @param {function(new:pearson.brix.Bric, Object, !pearson.utils.IEventManager=, !pearson.brix.BricWorks=)}
 * 					bricMold	-A function which creates the named bric.
 *
 * @note This is currently set up for a bricMold to be a constructor.
 *       The initial idea that each file defining a bric would access the
 *       singleton BricWorks and register its mold isn't good since we
 *       aren't going put code to get executed on load in the various files. -mjl
 ****************************************************************************/
pearson.brix.BricWorks.prototype.registerBricMold = function (bricName, bricMold)
{
	// only non-empty strings are valid names
	if (!bricName || !goog.isString(bricName))
		return;

	this.bricCatalogue_[bricName] = bricMold;
};

/* **************************************************************************
 * BricWorks.registerMortarMix                                         */ /**
 *
 * Register the mix (constructor) used to create a mortar.
 *
 * @param {string}
 * 					mortarName	-The name of the mortar that the given mix creates.
 * @param {function(new:pearson.brix.mortar.Mortar, Object, !pearson.utils.IEventManager=)}
 * 					mortarMix	-A function which creates the named mortar.
 *
 ****************************************************************************/
pearson.brix.BricWorks.prototype.registerMortarMix = function (mortarName, mortarMix)
{
	// only non-empty strings are valid names
	if (!mortarName || !goog.isString(mortarName))
		return;

	this.mortarCatalogue_[mortarName] = mortarMix;
};

/* **************************************************************************
 * BricWorks.createBric                                                */ /**
 *
 * Create the specified type of bric.
 *
 * @param {string}	bricName	-The name of the bric desired.
 * @param {Object}	config		-The configuration for the specified bric.
 * @returns {pearson.brix.Bric} the newly created Bric.
 *
 ****************************************************************************/
pearson.brix.BricWorks.prototype.createBric = function (bricName, config)
{
	var bricMold = this.bricCatalogue_[bricName];

	return bricMold ? new bricMold(config, this.eventManager, this) : null;
};

/* **************************************************************************
 * BricWorks.createMortar                                              */ /**
 *
 * Create the specified type of mortar.
 *
 * @param {string}	mortarName	-The name of the mortar desired.
 * @param {Object}	config		-The configuration for the specified mortar.
 * @returns {pearson.brix.mortar.Mortar} the newly created Mortar.
 *
 ****************************************************************************/
pearson.brix.BricWorks.prototype.createMortar = function (mortarName, config)
{
	var mortarMix = this.mortarCatalogue_[mortarName];

	return mortarMix ? new mortarMix(config, this.eventManager) : null;
};

/* **************************************************************************
 * BricWorks.getBricTopic                                              */ /**
 *
 * Get the topic an instance of the named bric type would publish for the
 * requested event.
 *
 * @param {string}	bricName	-The name of the bric that publishes the event
 * @param {string}	eventName	-The name of the event published
 * @param {string}	instanceId	-The ID that was or will be given to the instance
 *                               of the bric that is publishing the event
 *
 * @returns {string} The topic of the event published by the described bric.
 *
 * @throws {Error} Will throw an error if the bric class doesn't support the
 *                 getting topics or that event is unknown or the topic can't
 *                 be returned for some other reason.
 ****************************************************************************/
pearson.brix.BricWorks.prototype.getBricTopic = function (bricName, eventName, instanceId)
{
	var bricMold = this.bricCatalogue_[bricName];
    
    if (!('getEventTopic' in bricMold))
    {
        var msg = "'" + bricName + "' brix do not support the static method 'getEventTopic'";
        this.logger_.warning(msg);
        throw new Error(msg);
    }

    return bricMold['getEventTopic'](eventName, instanceId);
};

/* **************************************************************************
 * BricWorks.getMoldCount                                              */ /**
 *
 * Get the number of bric molds that have been successfully registered w/ this
 * BricWorks. (This method is provided as a testing/debugging aid).
 *
 * @returns {number} the number of molds registered w/ this BricWorks
 *
 ****************************************************************************/
pearson.brix.BricWorks.prototype.getMoldCount = function ()
{
	return goog.object.getCount(this.bricCatalogue_);
};

/* **************************************************************************
 * BricWorks.getMixCount                                               */ /**
 *
 * Get the number of mortar mixes that have been successfully registered w/ this
 * BricWorks. (This method is provided as a testing/debugging aid).
 *
 * @returns {number} the number of mixes registered w/ this BricWorks
 *
 ****************************************************************************/
pearson.brix.BricWorks.prototype.getMixCount = function ()
{
	return goog.object.getCount(this.mortarCatalogue_);
};

/* **************************************************************************
 * BricWorks.hasMold                                                   */ /**
 *
 * Check whether a bric mold with the specified name has been registered.
 *
 * @param {Object}	bricName		-The name of the bric mold to check for.
 * 
 * @returns {boolean} true if a mold for a bric w/ that name has been
 * 		registered otherwise false;
 *
 ****************************************************************************/
pearson.brix.BricWorks.prototype.hasMold = function (bricName)
{
	return goog.object.containsKey(this.bricCatalogue_, bricName);
};

/* **************************************************************************
 * BricWorks.hasMix                                                    */ /**
 *
 * Check whether a mortar mix with the specified name has been registered.
 *
 * @param {Object}	mortarName		-The name of the mortar mix to check for.
 * 
 * @returns {boolean} true if a mix for a mortar w/ that name has been
 * 		registered otherwise false;
 *
 ****************************************************************************/
pearson.brix.BricWorks.prototype.hasMix = function (mortarName)
{
	return goog.object.containsKey(this.mortarCatalogue_, mortarName);
};


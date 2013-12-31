/* **************************************************************************
 * $Workfile:: mortar-hilite.js                                             $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the {@link pearson.brix.mortar.Hilite} mortar.
 *
 * Created on		October 1, 2013
 * @author			Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.mortar.Hilite');

goog.require('pearson.brix.mortar.Mortar');
goog.require('pearson.brix.ILightable');
goog.require('pearson.utils.IEventManager');

/* **************************************************************************
 * Hilite                                                              */ /**
 *
 * Constructor function for Hilite instances.
 *
 * @constructor
 * @extends {pearson.brix.mortar.Mortar}
 * @export
 *
 * @param {Object}		config			-The settings to configure this Hilite
 * @param {string|undefined}
 * 						config.id		-String to uniquely identify this Hilite.
 * 										 if undefined a unique id will be assigned.
 * @param {string}      config.topic    -The topic of the selection event published
 *                                       by a bric that should be responded to by
 *                                       calling the lite method of the target bric.
 * @param {string}      config.eventDetailsProperty
 *                                      -The name of the property of the eventDetails
 *                                       event argument to pass to the target bric's
 *                                       lite method.
 * @param {!pearson.brix.ILightable}
 *                      config.targetBric
 *                                      -Bric instance to highlight
 * @param {!pearson.utils.IEventManager=}
 * 						eventManager	-The event manager to use for publishing events
 * 										 and subscribing to them.
 *
 * @classdesc
 * A Hilite mortar responds to selection events of one Bric by calling the
 * lite method of another Bric.
 *
 * @note May want to enhance this class to handle highlighting an array of brix.
 *
 ****************************************************************************/
pearson.brix.mortar.Hilite = function (config, eventManager)
{
    // call the base class constructor
    goog.base(this);

    /**
     * The id of this Hilite mortar instance, as specified in the config.
     * @private
     * @type {string|undefined}
     */
    this.hiliteId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.mortar.Hilite);
    
    /**
     * The selection event topic to handle by highlighting the given Bric.
     * @private
     * @type {string}
     */
    this.topic_ = config['topic'];

    /**
     * The property name in the handled event's eventDetails to pass as an
     * argument to the given Bric's lite method.
     * @private
     * @type {string}
     */
    this.edPropName_ = config['eventDetailsProperty'];

    /**
     * The target bric instance to highlight.
     * @private
     * @type {!pearson.brix.ILightable}
     */
    this.targetBric_ = config['targetBric'];

	/**
	 * The event manager to use to publish (and subscribe to) events for this mortar
     * @private
	 * @type {!pearson.utils.IEventManager}
	 */
	this.eventManager_ = eventManager || pearson.utils.IEventManager.dummyEventManager;

    // Set up the selection event subscription
    this.eventManager_.subscribe(this.topic_, goog.bind(this.handleSelectionEvent_, this));
};
goog.inherits(pearson.brix.mortar.Hilite, pearson.brix.mortar.Mortar);

/**
 * Prefix to use when generating ids for instances of Hilite.
 * @const
 * @type {string}
 */
pearson.brix.mortar.Hilite.autoIdPrefix = 'hilite_auto_';

/* **************************************************************************
 * Hilite.handleSelectionEvent_                                        */ /**
 *
 * Handler for a selection event which will highlight the target bric.
 * @private
 *
 * @param {Object}	eventDetails		-The details of the selection event.
 *
 ****************************************************************************/
pearson.brix.mortar.Hilite.prototype.handleSelectionEvent_ = function (eventDetails)
{
    this.targetBric_.lite(eventDetails[this.edPropName_]);
};


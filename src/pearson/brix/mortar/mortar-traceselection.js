/* **************************************************************************
 * $Workfile:: mortar-traceselection.js                                     $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the {@link pearson.brix.mortar.TraceSelection} mortar.
 *
 * Created on       December 2, 2013
 * @author          Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.mortar.TraceSelection');

goog.require('pearson.brix.mortar.Mortar');
goog.require('pearson.brix.Bric');
goog.require('pearson.utils.IEventManager');

/* **************************************************************************
 * TraceSelection                                                      */ /**
 *
 * Constructor function for TraceSelection instances.
 *
 * @constructor
 * @extends {pearson.brix.mortar.Mortar}
 * @export
 *
 * @param {Object}      config            -The settings to configure this TraceSelection
 * @param {string|undefined}
 *                      config.id         -String to uniquely identify this TraceSelection.
 *                                         if undefined a unique id will be assigned.
 * @param {string}      config.topic      -The topic of the event published
 *                                         by a CheckGroup bric that should be responded
 *                                         to by calling the setTrace method of the target
 *                                         bric with the data from the data source array
 *                                         if selected or an empty array if unselected.
 * @param {!pearson.brix.Bric}
 *                      config.targetBric -Bric instance whose data is to be swapped
 * @param {!Array.<*>}  config.sourceDataArray
 *                                        -The array of data elements that are swapped in
 *                                         to the targetBric depending on the index
 *                                         determined from the event property.
 * @param {!pearson.utils.IEventManager=}
 *                      eventManager      -The event manager to use for publishing events
 *                                         and subscribing to them.
 *
 * @classdesc
 * A TraceSelection mortar responds to events of a CheckGroup Bric by 
 * calling setTrace on a LineGraph bric with either the data from the source data
 * array, or an empty array depending on whether the event was for selecting or for
 * unselecting a choice.
 *
 ****************************************************************************/
pearson.brix.mortar.TraceSelection = function (config, eventManager)
{
    // call the base class constructor
    goog.base(this);

    /**
     * Logger for this Bric
     * @private
     * @type {goog.debug.Logger}
     */
    this.logger_ = goog.debug.Logger.getLogger('pearson.brix.mortar.TraceSelection');

    /**
     * The id of this TraceSelection mortar instance, as specified in the config.
     * @private
     * @type {string|undefined}
     */
    this.trcselId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.mortar.TraceSelection);

    /**
     * The event topic to handle by setting or unsetting the trace data
     * on the given LineGraph Bric.
     * @private
     * @type {string}
     */
    this.topic_ = config['topic'];

    /**
     * The target bric instance (which must be a LineGraph) whose data is to be swapped.
     * @private
     * @type {!pearson.brix.Bric}
     */
    this.targetBric_ = config['targetBric'];

    /**
     * The array of data elements for the traces that may be set on the target LineGraph bric.
     * @private
     * @type {!Array.<*>}
     */
    this.dataSource_ = config['sourceDataArray'];

    if (!this.dataSource_)
    {
        this.logger_.severe('sourceDataArray is not an array');
    }

    // log the configuration of this mortar
    var configMsg =
        [ '',
          'initial property values for TraceSelection id: ' + this.trcselId_,
          '\ttopic: ' + this.topic_,
          '\ttargetBric.getId(): ' + this.targetBric_.getId(),
          '\tdataSource: contains ' + this.dataSource_.length + ' elements',
        ];
    this.logger_.config(configMsg.join('\n'));

    /**
     * The event manager to use to publish (and subscribe to) events for this mortar
     * @private
     * @type {!pearson.utils.IEventManager}
     */
    this.eventManager_ = eventManager || pearson.utils.IEventManager.dummyEventManager;

    // Set up the event subscription
    this.eventManager_.subscribe(this.topic_, goog.bind(this.handleEvent_, this));
};
goog.inherits(pearson.brix.mortar.TraceSelection, pearson.brix.mortar.Mortar);

/**
 * Prefix to use when generating ids for instances of TraceSelection.
 * @const
 * @type {string}
 */
pearson.brix.mortar.TraceSelection.autoIdPrefix = 'trcsel_auto_';

/* **************************************************************************
 * TraceSelection.handleEvent_                                         */ /**
 *
 * Handler for the event which triggers the data swap, ie setting the
 * new data on the target bric.
 * @private
 *
 * @param {Object}  eventDetails        -The details of the event.
 *
 ****************************************************************************/
pearson.brix.mortar.TraceSelection.prototype.handleEvent_ = function (eventDetails)
{
    this.logger_.finer('handleEvent_ eventDetails: ' + JSON.stringify(eventDetails));

    this.targetBric_.setTrace(eventDetails.index,
                              eventDetails.isSelected ? this.dataSource_[eventDetails.index] : []);
};

/* **************************************************************************
 * TraceSelection.setDataSource                                        */ /**
 *
 * Set the data source of this TraceSelection mortar.
 *
 * @param {!Array} newDataSource    -The new data source for this mortar
 *
 ****************************************************************************/
pearson.brix.mortar.TraceSelection.prototype.setDataSource = function (newDataSource)
{
    if (!newDataSource)
    {
        this.logger_.severe('newDataSource is not an array');
    }
    
    this.dataSource_ = newDataSource;
};


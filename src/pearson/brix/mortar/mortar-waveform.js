/* **************************************************************************
 * $Workfile:: mortar-WaveForm.js                                       $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the {@link pearson.brix.mortar.WaveForm} mortar.
 *
 * Created on		October 28, 2013
 * @author			Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.mortar.WaveForm');

goog.require('pearson.brix.mortar.Mortar');
goog.require('pearson.utils.IEventManager');

/* **************************************************************************
 * WaveForm                                                        */ /**
 *
 * Constructor function for WaveForm instances.
 *
 * @constructor
 * @extends {pearson.brix.mortar.Mortar}
 * @export
 *
 * @param {Object}		config			-The settings to configure this WaveForm
 * @param {string|undefined}
 *                      config.id		-String to uniquely identify this WaveForm.
 *                                       if undefined a unique id will be assigned.
 * @param {string}      config.freqTopic
 *                                      -The topic of the frequency changed event.
 * @param {string}      config.amplitudeTopic
 *                                      -The topic of the amplitude changed event.
 * @param {!pearson.brix.LineGraph}
 *                      config.targetBric
 *                                      -Bric instance whose data is to be replaced
 *                                       and redrawn to reflect new values.
 * @param {!pearson.utils.IEventManager=}
 *                      eventManager	-The event manager to use for publishing events
 *                                       and subscribing to them.
 *
 * @classdesc
 * An WaveForm mortar responds to selection events of one Bric by calling the
 * lite method of another Bric.
 *
 * @note May want to enhance this class to handle highlighting an array of brix.
 *
 ****************************************************************************/
pearson.brix.mortar.WaveForm = function (config, eventManager)
{
    // call the base class constructor
    goog.base(this);

    /**
     * Logger for this Bric
     * @private
     * @type {goog.debug.Logger}
     */
    this.logger_ = goog.debug.Logger.getLogger('pearson.brix.mortar.WaveForm');

    /**
     * The id of this WaveForm mortar instance, as specified in the config.
     * @private
     * @type {string|undefined}
     */
    this.waveFormId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.mortar.WaveForm);
    
     
     /**
     * The saturation topic to handle by updating number of harmonics, then 
     * recalculating the data and redrawing the target bric.
     * @private
     * @type {string}
     */
    this.saturationTopic_ = config['otherTopic'];

    /**
     * The frequency topic to handle by updating the total fertility rate, then 
     * recalculating the data and redrawing the target bric.
     * @private
     * @type {string}
     */
    this.freqTopic_ = config['freqTopic'];

     /**
     * The fertility topic to handle by updating the total fertility rate, then 
     * recalculating the data and redrawing the target bric.
     * @private
     * @type {string}
     */
    this.amplitudeTopic_ = config['amplitudeTopic'];

    /**
     * The target bric instance to draw the data.
     * @private
     * @type {!pearson.brix.Bric}
     */
    this.targetBric_ = config['targetBric'];
    
    this.targetReadout_ = config['targetReadout'];

    /**
     * The point data to be displayed in the target readout bric. 
     * @type {string}
     */
    this.point_ = d3.format(",.0f")(0);

     /**
     * The key for the initial population profile to use in calculating data. 
     * @type {string}
     */
    this.saturation_ = '0';

    /**
     * The frequency of the wave
     * @type {number}
     */
    this.frequency_ = 1000;

    /**
     * The initial amplitude of the wave
     * @type {number}
     */
    this.amplitude_ = 60;

    /**
     * The calculated data
     * @private
     * @type {Array.<Array.<{x: number, y: number}>>}
     */
    this.graphData_ = [];


    // Initialize the graph data by running the calculation once
    this.calcData_();
    this.updateTargetBric_();


	/**
	 * The event manager to use to publish (and subscribe to) events for this mortar
     * @private
	 * @type {!pearson.utils.IEventManager}
	 */
	this.eventManager_ = eventManager || pearson.utils.IEventManager.dummyEventManager;

    // Set up the selection event subscription
    this.eventManager_.subscribe(this.saturationTopic_, goog.bind(this.handleSaturationChangedEvent_, this));
    this.eventManager_.subscribe(this.freqTopic_, goog.bind(this.handleFrequencyChangedEvent_, this));
    this.eventManager_.subscribe(this.amplitudeTopic_, goog.bind(this.handleAmplitudeChangedEvent_, this));

    // log the configuration of this mortar
    var configMsg =
        [ '',
          'initial property values for WaveForm id: ' + this.waveFormId_,
          '\tsaturation topic: ' + this.saturationTopic_,
          '\tfrequency topic: ' + this.freqTopic_,
          '\tamplitude topic: ' + this.amplitudeTopic_,
          '\ttargetBric.getId(): ' + this.targetBric_.getId()
        ];
    this.logger_.config(configMsg.join('\n'));

};
goog.inherits(pearson.brix.mortar.WaveForm, pearson.brix.mortar.Mortar);

/**
 * Prefix to use when generating ids for instances of WaveForm.
 * @const
 * @type {string}
 */
pearson.brix.mortar.WaveForm.autoIdPrefix = 'WaveForm_auto_';

/* **************************************************************************
 * WaveForm.handleFrequencyChangedEvent_                               */ /**
 *
 * Handler for the [fill in this description]
 * @private
 *
 * @param {Object}  eventDetails        -The details of the slider change event.
 *
 ****************************************************************************/
pearson.brix.mortar.WaveForm.prototype.handleFrequencyChangedEvent_ = function (eventDetails)
{
    this.frequency_ = eventDetails.newValue;
    this.calcData_();
    this.updateTargetBric_();
};

/* **************************************************************************
 * WaveForm.handleAmplitudeChangedEvent_                               */ /**
 *
 * Handler for the [fill in this description]
 * @private
 *
 * @param {Object}  eventDetails        -The details of the slider change event.
 *
 ****************************************************************************/
pearson.brix.mortar.WaveForm.prototype.handleAmplitudeChangedEvent_ = function (eventDetails)
{
    this.amplitude_= eventDetails.newValue;
    this.calcData_();
    this.updateTargetBric_();
};

/* **************************************************************************
 * WaveForm.handleSaturationChangedEvent_                              */ /**
 *
 * Handler for the [fill in this description]
 * @private
 *
 * @param {Object}  eventDetails        -The details of the slider change event.
 *
 ****************************************************************************/
pearson.brix.mortar.WaveForm.prototype.handleSaturationChangedEvent_ = function (eventDetails)
{
    this.saturation_ = eventDetails.selectKey;
    this.calcData_();
    this.updateTargetBric_();
};


/* **************************************************************************
 * WaveForm.updateTargetBric_                                      */ /**
 *
 * Handler for the changed year value event which will display the data for
 * the new year in the target bric.
 * @private
 *
 ****************************************************************************/
pearson.brix.mortar.WaveForm.prototype.updateTargetBric_ = function ()
{
    this.targetBric_.setData(this.graphData_);
    //this.targetReadout_.setValue(this.point_);
};

/* **************************************************************************
 * WaveForm.calcData_                                                  */ /**
 *
 * Handler for the changed year value event which will display the data for
 * the new year in the target bric.
 * @private
 *
 ****************************************************************************/
pearson.brix.mortar.WaveForm.prototype.calcData_ = function ()
{
    this.logger_.fine('calcData_ entered...');

    // initialize the number of harmonics to calculate
    var harmonics = 0;
    switch(this.saturation_)
        {
        case "1":
        // partially saturated
            harmonics = 3;
            break;

        case "2":
        // highly saturated
            harmonics = 5;
            break;
            
        //fallthrough case for unsaturated (single wave).
        default:
            break;
        }
    
    var points = 500;
    var pi = Math.PI;
    var step = 0.00001;
   
    var dataSeries = [];
     
    // now fill up the fundamental and harmonic data arrays.

    for (var j = 0; j <= harmonics; j++) 
    {
        var harmonic = j + 1;
        var data = [];
        for (var i = 0 ; i <= points - 1; i++)
        {

            var t = i * step + step;
            data[i] = {x: t, y: (this.amplitude_/harmonic) * Math.sin(2 * pi * this.frequency_ * harmonic * t)};

        }

        dataSeries[j] = data;
        
    }
    
    this.graphData_ = dataSeries;
    this.point_ = d3.format(",.0f")(data[0].x);


};

/* **************************************************************************
 * $Workfile:: mortar-agestructure.js                                       $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the {@link pearson.brix.mortar.AgeStructure} mortar.
 *
 * Created on		October 28, 2013
 * @author			Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.mortar.AgeStructure');

goog.require('pearson.brix.mortar.Mortar');
goog.require('pearson.utils.IEventManager');

/* **************************************************************************
 * AgeStructure                                                        */ /**
 *
 * Constructor function for AgeStructure instances.
 *
 * @constructor
 * @extends {pearson.brix.mortar.Mortar}
 * @export
 *
 * @param {Object}		config			-The settings to configure this AgeStructure
 * @param {string|undefined}
 *                      config.id		-String to uniquely identify this AgeStructure.
 *                                       if undefined a unique id will be assigned.
 * @param {string}      config.yearTopic
 *                                      -The topic of the year changed event.
 * @param {string}      config.mortTopic
 *                                      -The topic of the mortality profile changed event.
 * @param {string}      config.fertilityTopic
 *                                      -The topic of the fertility rate changed event.
 * @param {string}      config.ageFirstBirthTopic
 *                                      -The topic of the age of first birth changed event.
 * @param {!pearson.brix.BarChart}
 *                      config.targetBricLeft
 * @param {!pearson.brix.BarChart}
 *                      config.targetBricRight
 * @param {!pearson.brix.Readout}
 *                      config.targetPopReadout
 * @param {!pearson.brix.Readout}
 *                      config.targetYearReadout
 
 *                                      -Bric instances whose data is to be replaced
 *                                       and redrawn to reflect new values.
 * @param {!pearson.utils.IEventManager=}
 *                      eventManager	-The event manager to use for publishing events
 *                                       and subscribing to them.
 *
 * @classdesc
 * An AgeStructure mortar responds to selection events of one Bric by calling the
 * lite method of another Bric.
 *
 * @note May want to enhance this class to handle highlighting an array of brix.
 *
 ****************************************************************************/
pearson.brix.mortar.AgeStructure = function (config, eventManager)
{
    // call the base class constructor
    goog.base(this);

    /**
     * The id of this AgeStructure mortar instance, as specified in the config.
     * @private
     * @type {string|undefined}
     */
    this.AgeStructureId_ = pearson.brix.utils.getIdFromConfigOrAuto(config, pearson.brix.mortar.AgeStructure);
    
    /**
     * The year topic to handle by updating the data and redrawing the target bric.
     * @private
     * @type {string}
     */
    this.yearTopic_ = config['yearTopic'];

     /**
     * The year slider object is needed so we can reset it's value on recalc.
     * @private
     * @type {!pearson.brix.Slider}
     */
    this.yearSlider_ = config['yearSlider'];

     /**
     * The initialPop topic to handle by updating the data and redrawing the target bric.
     * @private
     * @type {string}
     */
    //this.initialPopTopic_ = config['initialPopTopic'];

    /**
     * The initialMort topic to handle by updating the mortality profile, then 
     * recalculating the data and redrawing the target bric.
     * @private
     * @type {string}
     */
    //this.popDistributionTopic_ = config['popDistributionTopic'];
     
     /**
     * The initialMort topic to handle by updating the mortality profile, then 
     * recalculating the data and redrawing the target bric.
     * @private
     * @type {string}
     */
    this.mortTopic_ = config['mortTopic'];

    /**
     * The fertility topic to handle by updating the total fertility rate, then 
     * recalculating the data and redrawing the target bric.
     * @private
     * @type {string}
     */
    this.fertilityTopic_ = config['fertilityTopic'];

     /**
     * The fertility topic to handle by updating the total fertility rate, then 
     * recalculating the data and redrawing the target bric.
     * @private
     * @type {string}
     */
    this.ageFirstBirthTopic_ = config['ageFirstBirthTopic'];

    /**
     * The target bric left of the pyramid bar chart
     * @private
     * @type {!pearson.brix.BarChart}
     */
    this.targetBricLeft_ = config['targetBricLeft'];

    /**
     * The target bric right of the pyramid bar chart
     * @private
     * @type {!pearson.brix.BarChart}
     */
    this.targetBricRight_ = config['targetBricRight'];

    /**
     * The target bric readout of the total population
     * @private
     * @type {!pearson.brix.Readout}
     */
    this.targetPopReadout_ = config['targetPopReadout'];

    /**
     * The target bric readout for the displayed population year
     * @private
     * @type {!pearson.brix.Readout}
     */
    this.targetYearReadout_ = config['targetYearReadout'];

    /**
     * The population year that should be displayed in the target bric. 
     * @type {number}
     */
    this.year_ = 0;

    /**
     * The key for the mortality profile to use in calculating data. 
     * @type {string}
     */
    this.mortalityKey_ = '0';

     /**
     * The key for the initial population profile to use in calculating data. 
     * @type {string}
     */
    this.popDistributionKey_ = '0';

    /**
     * The initial total population that will be allocated to various ages
     * according to the selected distribution profile.
     * @type {number}
     */
    this.initialPop_ = 10000;

    /**
     * The total fertility rate that will be allocated to various ages
     * according to the selected age range.
     * @type {number}
     */
    this.totalFertilityRate_ = 2;

    /**
     * The index into the set of ages of first childbirth [15..20..}
     * determining the bottom of the fertile group of women.
     * @type {number}
     */
    this.ageFirstBirth_ = 0;

    /**
     * The calculated female population data
     * @private
     * @type {Array.<Array.<{x: number, y: number}>>}
     */
    this.populationWomen_ = [];

    /**
     * The calculated male population data
     * @private
     * @type {Array.<Array.<{x: number, y: number}>>}
     */
    this.populationMen_ = [];

    /**
     * The array of total population for each year
     * @type {Array}
     */
    this.totalPopulation = [[this.initialPop_]];

    // Init population data
    this.calcPopulation_();
    this.updateTargetBric_();

	/**
	 * The event manager to use to publish (and subscribe to) events for this mortar
     * @private
	 * @type {!pearson.utils.IEventManager}
	 */
	this.eventManager_ = eventManager || pearson.utils.IEventManager.dummyEventManager;

    // Set up the selection event subscription
    this.eventManager_.subscribe(this.yearTopic_, goog.bind(this.handleYearChangedEvent_, this));
    //this.eventManager_.subscribe(this.initialPopTopic_, goog.bind(this.handleInitialPopChangedEvent_, this));
    //this.eventManager_.subscribe(this.popDistributionTopic_, goog.bind(this.handlePopDistributionChangedEvent_, this));
    this.eventManager_.subscribe(this.mortTopic_, goog.bind(this.handleMortChangedEvent_, this));
    this.eventManager_.subscribe(this.fertilityTopic_, goog.bind(this.handleFertilityChangedEvent_, this));
    this.eventManager_.subscribe(this.ageFirstBirthTopic_, goog.bind(this.handleFirstBirthChangedEvent_, this));
};
goog.inherits(pearson.brix.mortar.AgeStructure, pearson.brix.mortar.Mortar);

/**
 * Prefix to use when generating ids for instances of AgeStructure.
 * @const
 * @type {string}
 */
pearson.brix.mortar.AgeStructure.autoIdPrefix = 'AgeStructure_auto_';

/* **************************************************************************
 * AgeStructure.handleYearChangedEvent_                                */ /**
 *
 * Handler for the changed year value event which will display the data for
 * the new year in the target bric.
 * @private
 *
 * @param {Object}	eventDetails		-The details of the slider change event.
 *
 ****************************************************************************/
pearson.brix.mortar.AgeStructure.prototype.handleYearChangedEvent_ = function (eventDetails)
{
    this.year_ = eventDetails.newValue;
    this.updateTargetBric_();
};

/* **************************************************************************
 * AgeStructure.handleInitialPopChangedEvent_                                */ /**
 *
 * Handler for the changed initial population value event which will 
 * recalculate the population data, and redisplay the data for
 * year0 in the target bric.
 * @private
 *
 * @param {Object}  eventDetails        -The details of the slider change event.
 *
 ****************************************************************************/
pearson.brix.mortar.AgeStructure.prototype.handleInitialPopChangedEvent_ = function (eventDetails)
{
    this.initialPop_ = eventDetails.newValue;
    this.calcPopulation_();
    this.year_ = 0;
    this.yearSlider_.setValue(this.year_);
    this.updateTargetBric_();
};

/* **************************************************************************
 * AgeStructure.handleFertilityChangedEvent_                                */ /**
 *
 * Handler for the changed fertility rate value event which will 
 * recalculate the population data, and redisplay the data for
 * year0 in the target bric.
 * @private
 *
 * @param {Object}  eventDetails        -The details of the slider change event.
 *
 ****************************************************************************/
pearson.brix.mortar.AgeStructure.prototype.handleFertilityChangedEvent_ = function (eventDetails)
{
    this.totalFertilityRate_ = eventDetails.selectKey;
    this.calcPopulation_();
    this.year_ = 0;
    this.yearSlider_.setValue(this.year_);
    this.updateTargetBric_();
};

/* **************************************************************************
 * AgeStructure.handleMortChangedEvent_                                */ /**
 *
 * Handler for the changed mortality profile value event which will 
 * recalculate the population data, and redisplay the data for
 * year0 in the target bric.
 * @private
 *
 * @param {Object}  eventDetails        -The details of the slider change event.
 *
 ****************************************************************************/
pearson.brix.mortar.AgeStructure.prototype.handleMortChangedEvent_ = function (eventDetails)
{
    this.mortalityKey_ = eventDetails.selectKey;
    this.calcPopulation_();
    this.year_ = 0;
    this.yearSlider_.setValue(this.year_);
    this.updateTargetBric_();
};

/* **************************************************************************
 * AgeStructure.handlePopDistributionChangedEvent_                                */ /**
 *
 * Handler for the changed mortality profile value event which will 
 * recalculate the population data, and redisplay the data for
 * year0 in the target bric.
 * @private
 *
 * @param {Object}  eventDetails        -The details of the slider change event.
 *
 ****************************************************************************/
pearson.brix.mortar.AgeStructure.prototype.handlePopDistributionChangedEvent_ = function (eventDetails)
{
    this.popDistributionKey_ = eventDetails.selectKey;
    this.calcPopulation_();
    this.year_ = 0;
    this.yearSlider_.setValue(this.year_);
    this.updateTargetBric_();
};
/* **************************************************************************
 * AgeStructure.handleFirstBirthChangedEvent_                            */ /**
 *
 * Handler for the changed mortality profile value event which will 
 * recalculate the population data, and redisplay the data for
 * year0 in the target bric.
 * @private
 *
 * @param {Object}  eventDetails        -The details of the slider change event.
 *
 ****************************************************************************/
pearson.brix.mortar.AgeStructure.prototype.handleFirstBirthChangedEvent_ = function (eventDetails)
{
    this.ageFirstBirth_ = eventDetails.index;
    this.calcPopulation_();
    this.year_ = 0;
    this.yearSlider_.setValue(this.year_);
    this.updateTargetBric_();
};

/* **************************************************************************
 * AgeStructure.updateTargetBric_                                      */ /**
 *
 * Handler for the changed year value event which will display the data for
 * the new year in the target bric.
 * @private
 *
 ****************************************************************************/
pearson.brix.mortar.AgeStructure.prototype.updateTargetBric_ = function ()
{

    this.targetBricLeft_.setData([[], this.populationWomen_[this.year_]]);
    //this.targetBricLeft_.redraw();
    this.targetBricRight_.setData([this.populationMen_[this.year_]]);
    //this.targetBricRight_.redraw();
    this.targetPopReadout_.setValue(this.totalPopulation[this.year_]);
    this.targetYearReadout_.setValue(this.year_);
};

/* **************************************************************************
 * AgeStructure.calculatePopulation_                                   */ /**
 *
 * Handler for the changed year value event which will display the data for
 * the new year in the target bric.
 * @private
 *
 ****************************************************************************/
pearson.brix.mortar.AgeStructure.prototype.calcPopulation_ = function ()
{
    // variables to set up the difference equation
    var years = 100;
    var n0 = this.initialPop_;    // total population - eventually slider
    var maxAge = 100;
    var endBearingAge = 50; //age at which women become infertile(ish)
    var startBearingAge = this.ageFirstBirth_ * 5 + 15; //might want to set this on slider
    var fertilityRate = Number(this.totalFertilityRate_); //# kids born per woman, on slider
    //death rate, A and B need to be set by a dropdown for 3 population types
    //and different A and B for men and women
    function mort(A,B,age)
        {
        return A * Math.exp(B * age);
        }
    //populations are 2-D array, first index is year up to 50, second is age group
    var populationW = [], populationM = [];
    var init = [], sum = 0;
    
    if (this.mortalityKey_ === "0")
    {
        var Aw = 0.0008, Bw= 0.06;
        var Am = 0.00081, Bm = 0.062;
    }
    else if (this.mortalityKey_ === "1")
    {
        var Aw = 0.0009, Bw = 0.062;
        var Am = 0.001, Bm = 0.062;
    }
    else
    {
        var Aw = 0.0035, Bw= 0.045;
        var Am = 0.004, Bm = 0.050;
    }

   
    // initialize the population at each age at year 0, Type I, II or III
   
    switch(this.popDistributionKey_)
        {
        case "0":
        // Sloped initial Popululation, Type I
            for (var a = 0; a <= maxAge; a++)
            {
                init[a] = {x: (1 - a/100), y: a};
            }
            init.forEach( function(o) { sum = o.x + sum; });
          
            for (var a = 0; a <= maxAge; a++)
            {
                init[a] = {x: n0 * init[a].x/(2 * sum), y: a};
            }
            break;

        case "1":
        // Uniform initial population, Type II
            for (var a = 0; a <= maxAge; a++)
            {
                init[a] = {x: n0/(2 * maxAge), y: a};
            }
            break;
            
        //fallthrough case for Type III.
        default:
            for (var a = 0; a <= maxAge; a++)
            {
                init[a] = {x: (a > 60 ? (init[a-1].x - 0.03) : (1 + (a + 1)/100)), y: a};
            }
            init.forEach( function(o) { sum = o.x + sum; });
             
            for (var a = 0; a <= maxAge; a++)
            {
                init[a] = {x: n0 * init[a].x/(2 * sum), y: a};
            }
            break;
        }
    
    // initialize population zero year
    populationW[0] = init;
    populationM[0] = init;
    this.totalPopulation[0] = n0;

    // now fill up the rest of the array
    for (var t = 1 ; t <= years; t++)
    {
        var popW = [], popM = [];
        var prevPopW = populationW[t - 1];
        var prevPopM = populationM[t - 1];
        var Nreproductive = 0;

        prevPopW.forEach( function(o,i)
            {
                // for each previous year's female population, count the population across the reproductive
                // female age range
                Nreproductive = (i < endBearingAge && i > startBearingAge) ? Nreproductive + o.x : Nreproductive;
            });

        var birth = Nreproductive * fertilityRate/(2 * (endBearingAge - startBearingAge));
        // Age 0-1 should be different, including the birth rate
        popW[0] = {x: birth - prevPopW[0].x * mort(Aw, Bw, 0), y: 0};
        popM[0] = {x: birth - prevPopM[0].x * mort(Am, Bm, 0), y: 0};
        
        for (var age = 1; age <= maxAge; age++)
        {
            //while it might be more efficient to count down, the difference equation 
            //only works if you bootstrap up. Each age's population is equal to the 
            //population of the previous age from last year, times (1 - death rate).
            popW[age] = {x: populationW[t - 1][age - 1].x * (1 - mort(Aw, Bw, age - 1)), y: age};
            popM[age] = {x: populationM[t - 1][age - 1].x * (1 - mort(Am, Bm, age - 1)), y: age};
        }
       
        populationW[t] = popW;
        populationM[t] = popM;

        var totalPop = 0;
        populationW[t].forEach( function(o) { totalPop = o.x + totalPop; });
        populationM[t].forEach( function(o) { totalPop = o.x + totalPop; });

        this.totalPopulation[t] = d3.format(",.0f")(totalPop);

    }

    
    this.populationWomen_ = populationW;
    this.populationMen_ = populationM;


};

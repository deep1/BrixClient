/* **************************************************************************
 * $Workfile:: briclayer.js                                                 $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the BricLayer.
 *
 * The BricLayer creates brix and connecting mortar as defined by a
 * master configuration object.
 *
 * Created on       September 10, 2013
 * @author          Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.BricLayer');
goog.provide('pearson.brix.BricTypes');
goog.provide('pearson.brix.MortarTypes');

goog.require('goog.object');
goog.require('pearson.utils.IEventManager');
goog.require('pearson.utils.EventManager');
goog.require('pearson.brix.utils.SubmitManager');
goog.require('pearson.brix.BricWorks');

// brix
goog.require('pearson.brix.Bric');
goog.require('pearson.brix.SVGContainer');
goog.require('pearson.brix.BarChart');
goog.require('pearson.brix.Button');
goog.require('pearson.brix.Callouts');
goog.require('pearson.brix.CaptionedImage');
goog.require('pearson.brix.Carousel');
goog.require('pearson.brix.CheckGroup');
goog.require('pearson.brix.Image');
goog.require('pearson.brix.ImageViewer');
goog.require('pearson.brix.Journal');
goog.require('pearson.brix.LabelCarousel');
goog.require('pearson.brix.LabelGroup');
goog.require('pearson.brix.LabelSelector');
goog.require('pearson.brix.Legend');
goog.require('pearson.brix.LineGraph');
goog.require('pearson.brix.MarkerGroup');
goog.require('pearson.brix.MultipleChoiceQuestion');
goog.require('pearson.brix.MultiSelectQuestion');
goog.require('pearson.brix.NumericInput');
goog.require('pearson.brix.NumericQuestion');
goog.require('pearson.brix.PieChart');
goog.require('pearson.brix.RadioGroup');
goog.require('pearson.brix.Readout');
goog.require('pearson.brix.SelectGroup');
goog.require('pearson.brix.Sketch');
goog.require('pearson.brix.Slider');

// mortar
goog.require('pearson.brix.mortar.Mortar');
goog.require('pearson.brix.mortar.Hilite');
goog.require('pearson.brix.mortar.Dataswap');

// these are prototype and specialized mortar that should become more generic eventually
goog.require('pearson.brix.mortar.TraceSelection');
goog.require('pearson.brix.mortar.AgeStructure');
goog.require('pearson.brix.mortar.WaveForm');

/* **************************************************************************
 * BricTypes                                                           */ /**
 *
 * This is the enumeration of all known bric types that will be registered
 * with the BricWorks instance of a BricLayer.
 *
 * @enum {string}
 *
 ****************************************************************************/
pearson.brix.BricTypes =
{
    SVGCONTAINER:           "SvgContainer",
    BARCHART:               "BarChart",
    BUTTON:                 "Button",
    CALLOUTS:               "Callouts",
    CAPTIONEDIMAGE:         "CaptionedImage",
    CAROUSEL:               "Carousel",
    CHECKGROUP:             "CheckGroup",
    IMAGE:                  "Image",
    IMAGEVIEWER:            "ImageViewer",
    JOURNAL:                "Journal",
    LABELCAROUSEL:          "LabelCarousel",
    LABELGROUP:             "LabelGroup",
    LABELSELECTOR:          "LabelSelector",
    LEGEND:                 "Legend",
    LINEGRAPH:              "LineGraph",
    MARKERGROUP:            "MarkerGroup",
    MULTIPLECHOICEQUESTION: "MultipleChoiceQuestion",
    MULTISELECTQUESTION:    "MultiSelectQuestion",
    NUMERICINPUT:           "NumericInput",
    NUMERICQUESTION:        "NumericQuestion",
    PIECHART:               "PieChart",
    RADIOGROUP:             "RadioGroup",
    READOUT:                "Readout",
    SELECTGROUP:            "SelectGroup",
    SKETCH:                 "Sketch",
    SLIDER:                 "Slider"
};

/* **************************************************************************
 * MortarTypes                                                         */ /**
 *
 * This is the enumeration of all known mortar types that will be registered
 * with the BricWorks instance of a BricLayer.
 *
 * @enum {string}
 *
 ****************************************************************************/
pearson.brix.MortarTypes =
{
    DATASWAP:               "Dataswap",
    HILITE:                 "Hilite",

    AGESTRUCTURE:           "AgeStructure",
    TRACESELECTION:         "TraceSelection",
    WAVEFORM:               "WaveForm", 
};


/* **************************************************************************
 * BricLayer                                                           */ /**
 *
 * Constructor function for the BricLayer factory.
 *
 * @constructor
 *
 * @param {Object}      config          -The settings to configure this BrixLayer.
 *                                       (there are none right now so this will
 *                                       usually be specified as null or an empty object.)
 * @param {!pearson.utils.IEventManager=}
 *                      eventManager    -The event manager to use for publishing events
 *                                       and subscribing to them.
 * @param {!pearson.brix.utils.SubmitManager=}
 *                      submitManager   -The submit manager to use for submitting
 *                                       scoring requests from question brix.
 *
 * @classdesc
 * A BricLayer creates brix and connecting mortar as defined by a master
 * configuration object.
 *
 ****************************************************************************/
pearson.brix.BricLayer = function (config, eventManager, submitManager)
{
    /**
     * Logger for this BricLayer
     * @private
     * @type {goog.debug.Logger}
     */
    this.logger_ = goog.debug.Logger.getLogger('pearson.brix.BricLayer');

    /**
     * The event manager to use to publish (and subscribe to) events for the
     * created brix and mortar.
     * @private
     * @type {!pearson.utils.IEventManager}
     */
    this.eventManager_ = eventManager || new pearson.utils.EventManager();

    /**
     * The submit manager to use for submitting scoring requests from question
     * brix.
     * @private
     * @type {pearson.brix.utils.SubmitManager}
     */
    this.submitManager_ = submitManager || null;

    /**
     * The bricWorks is the factory which builds all brix. It should
     * ONLY be accessed using the getBricWorks accessor function.
     * @private
     * @type {pearson.brix.BricWorks}
     */
    this.bricWorks_ = null;

}; // end of BricLayer constructor

/* **************************************************************************
 * BricLayer.getBricWorks                                              */ /**
 *
 * Get the BricWorks that is used by this BricLayer to create all brix.
 *
 * @returns {!pearson.brix.BricWorks}
 *
 ****************************************************************************/
pearson.brix.BricLayer.prototype.getBricWorks = function ()
{
    if (this.bricWorks_)
    {
        return this.bricWorks_;
    }

    // 1st time the BricWorks was accessed, so create it.
    var bricWorks = new pearson.brix.BricWorks(null, this.eventManager_);

    // register all brix
    var BricTypes = pearson.brix.BricTypes;
    bricWorks.registerBricMold(BricTypes.SVGCONTAINER, pearson.brix.SVGContainer);
    bricWorks.registerBricMold(BricTypes.BARCHART, pearson.brix.BarChart);
    bricWorks.registerBricMold(BricTypes.BUTTON, pearson.brix.Button);
    bricWorks.registerBricMold(BricTypes.CALLOUTS, pearson.brix.Callouts);
    bricWorks.registerBricMold(BricTypes.CAPTIONEDIMAGE, pearson.brix.CaptionedImage);
    bricWorks.registerBricMold(BricTypes.CAROUSEL, pearson.brix.Carousel);
    bricWorks.registerBricMold(BricTypes.CHECKGROUP, pearson.brix.CheckGroup);
    bricWorks.registerBricMold(BricTypes.IMAGE, pearson.brix.Image);
    bricWorks.registerBricMold(BricTypes.IMAGEVIEWER, pearson.brix.ImageViewer);
    bricWorks.registerBricMold(BricTypes.JOURNAL, pearson.brix.Journal);
    bricWorks.registerBricMold(BricTypes.LABELCAROUSEL, pearson.brix.LabelCarousel);
    bricWorks.registerBricMold(BricTypes.LABELGROUP, pearson.brix.LabelGroup);
    bricWorks.registerBricMold(BricTypes.LABELSELECTOR, pearson.brix.LabelSelector);
    bricWorks.registerBricMold(BricTypes.LEGEND, pearson.brix.Legend);
    bricWorks.registerBricMold(BricTypes.LINEGRAPH, pearson.brix.LineGraph);
    bricWorks.registerBricMold(BricTypes.MARKERGROUP, pearson.brix.MarkerGroup);
    bricWorks.registerBricMold(BricTypes.MULTIPLECHOICEQUESTION, pearson.brix.MultipleChoiceQuestion);
    bricWorks.registerBricMold(BricTypes.MULTISELECTQUESTION, pearson.brix.MultiSelectQuestion);
    bricWorks.registerBricMold(BricTypes.NUMERICINPUT, pearson.brix.NumericInput);
    bricWorks.registerBricMold(BricTypes.NUMERICQUESTION, pearson.brix.NumericQuestion);
    bricWorks.registerBricMold(BricTypes.PIECHART, pearson.brix.PieChart);
    bricWorks.registerBricMold(BricTypes.RADIOGROUP, pearson.brix.RadioGroup);
    bricWorks.registerBricMold(BricTypes.READOUT, pearson.brix.Readout);
    bricWorks.registerBricMold(BricTypes.SELECTGROUP, pearson.brix.SelectGroup);
    bricWorks.registerBricMold(BricTypes.SKETCH, pearson.brix.Sketch);
    bricWorks.registerBricMold(BricTypes.SLIDER, pearson.brix.Slider);

    // register all mortar
    var MortarTypes = pearson.brix.MortarTypes;
    bricWorks.registerMortarMix(MortarTypes.DATASWAP, pearson.brix.mortar.Dataswap);
    bricWorks.registerMortarMix(MortarTypes.HILITE, pearson.brix.mortar.Hilite);
    bricWorks.registerMortarMix(MortarTypes.AGESTRUCTURE, pearson.brix.mortar.AgeStructure);
    bricWorks.registerMortarMix(MortarTypes.TRACESELECTION, pearson.brix.mortar.TraceSelection);
    bricWorks.registerMortarMix(MortarTypes.WAVEFORM, pearson.brix.mortar.WaveForm);

    this.bricWorks_ = bricWorks;

    return this.bricWorks_;
};

/* **************************************************************************
 * BricLayer.build                                                     */ /**
 *
 * Create all of the brix and mortar as described in the given configuration
 * object.
 *
 * @param {Object}  activityConfig      -Configuration describing the brix and
 *                                       mortar to be created.
 *
 * @returns {Object} an object containing all of the created brix and mortar.
 *
 ****************************************************************************/
pearson.brix.BricLayer.prototype.build = function (activityConfig)
{
    /**
     * @dict
     */
    var building = {'info': {}, 'data': {}, 'brix': {}, 'mortar': {}};

    // Define the building info properties
    building['info']['sequenceNodeKey'] = activityConfig['sequenceNodeKey'];

    // optional info properties
    var maxAttempts = activityConfig['maxAttempts'];
    if (maxAttempts !== undefined)
    {
        building['info']['maxAttempts'] = maxAttempts;
    }
    var imgBaseUrl = activityConfig['imgBaseUrl'];
    if (imgBaseUrl !== undefined)
    {
        building['info']['imgBaseUrl'] = imgBaseUrl;
    }

    // Define the building data domain from the activityConfig
    if ('data' in activityConfig)
    {
        building['data'] = activityConfig['data'];
    }

    activityConfig['containerConfig'].forEach(goog.bind(this.buildContainer_, this, building));

    return building;
};

/* **************************************************************************
 * BricLayer.buildContainer_                                           */ /**
 *
 * Build all the brix and mortar specified by the given container config.
 * @private
 *
 * @param {Object}  building        -Object containing everything that's been
 *                                   built so far, and where all the new objects
 *                                   defined in this container are to be put.
 * @param {Object}  containerConfig -Configuration for all of the brix and connecting
 *                                   mortar in "container", that get rendered
 *                                   as children of a single element (usually a div).
 *
 ****************************************************************************/
pearson.brix.BricLayer.prototype.buildContainer_ = function (building, containerConfig)
{
    // build brix
    containerConfig['brixConfig'].forEach(goog.bind(this.buildBric_, this, building));

    // build mortar (mortarConfig is optional in an activity)
    var mortarConfig = containerConfig['mortarConfig'];
    if (mortarConfig !== undefined)
    {
        mortarConfig.forEach(goog.bind(this.buildMortar_, this, building));
    }

    // do hookup actions if there are any specified
    this.doActions_(containerConfig['hookupActions'], building);
};

/* **************************************************************************
 * BricLayer.buildBric_                                                */ /**
 *
 * Build the bric defined by the given configuration.
 * @private
 *
 * @param {Object}  building    -Object containing everything that's been
 *                               built so far, and where this new bric
 *                               is to be put.
 * @param {Object}  bricConfig  -Configuration for creating a bric.
 *
 ****************************************************************************/
pearson.brix.BricLayer.prototype.buildBric_ = function (building, bricConfig)
{
    var bricWorks = this.getBricWorks();
    var id = bricConfig['bricId'];
    var type = bricConfig['bricType'];
    var config = {};
    goog.object.extend(config, bricConfig['config']);

    this.doConfigFixup_(bricConfig['configFixup'], config, building);

    building['brix'][id] = bricWorks.createBric(type, config);

    if (building['brix'][id] === null)
    {
        this.logger_.warning('got null when creating a bric of type "' + type + '"');
    }

    // if config has state and bric has restoreState method pass the state to the bric
    if ('state' in bricConfig &&
        'restoreState' in building['brix'][id] &&
        goog.isFunction(building['brix'][id]['restoreState']))
    {
        building['brix'][id]['restoreState'](bricConfig['state']);
    }
};

/* **************************************************************************
 * BricLayer.buildMortar_                                              */ /**
 *
 * Build the mortar defined by the given configuration.
 * @private
 *
 * @param {Object}  building        -Object containing everything that's been
 *                                   built so far, and where this new mortar
 *                                   is to be put.
 * @param {Object}  mortarConfig    -Configuration for creating a mortar.
 *
 ****************************************************************************/
pearson.brix.BricLayer.prototype.buildMortar_ = function (building, mortarConfig)
{
    var bricWorks = this.getBricWorks();
    var id = mortarConfig['mortarId'];
    var type = mortarConfig['mortarType'];
    var config = {};
    goog.object.extend(config, mortarConfig['config']);

    this.doConfigFixup_(mortarConfig['configFixup'], config, building);

    building['mortar'][id] = bricWorks.createMortar(type, config);

    if (building['mortar'][id] === null)
    {
        this.logger_.warning('got null when creating a mortar of type "' + type + '"');
    }
};

/* **************************************************************************
 * BricLayer.doActions_                                                */ /**
 *
 * Process the list of config fixup actions on the given config object.
 * @private
 *
 * @param {Array.<Object>|undefined}
 *                  actionList   -array of actions to be done, may be undefined
 * @param {Object}  building    -the under construction (by the build method) building
 *
 ****************************************************************************/
pearson.brix.BricLayer.prototype.doActions_ = function (actionList, building)
{
    var actionHandlers = pearson.brix.BricLayer.actionHandlers;

    // if there's no list then no action exist to be done.
    if (actionList === undefined)
        return;

    actionList.forEach(function (action)
            {
                var actionType = action['type'];
                if (!(actionType in actionHandlers))
                {
                    throw new Error("Don't know how to process action type '" + actionType + "'");
                }

                var handler = goog.bind(actionHandlers[actionType], this, building);

                handler(action);
            }, this);
};

/* **************************************************************************
 * BricLayer.doConfigFixup_                                            */ /**
 *
 * Process the list of config fixup actions on the given config object.
 * @private
 *
 * @param {Array.<Object>|undefined}
 *                  fixupList   -array of fixups to be applied, may be undefined
 * @param {Object}  config      -the config object that is to be fixed up
 * @param {Object}  building    -the under construction (by the build method) building
 *
 ****************************************************************************/
pearson.brix.BricLayer.prototype.doConfigFixup_ = function (fixupList, config, building)
{
    var fixupHandlers = pearson.brix.BricLayer.configFixupHandlers;

    // if there's no list then no fixup is needed.
    if (fixupList === undefined)
        return;

    fixupList.forEach(function (fixup)
            {
                var fixupType = fixup['type'];
                if (!(fixupType in fixupHandlers))
                {
                    throw new Error("Don't know how to process configFixup type '" + fixupType + "'");
                }

                var handler = goog.bind(fixupHandlers[fixupType], this, config, building);

                handler(fixup);
            }, this);
};

/* **************************************************************************
 * BricLayer.getDynamicValue                                           */ /**
 *
 * Get the value defined by the given dynamic value config, using any objects
 * created so far by the BricLayer build method as needed.
 *
 * @param {Object}  building    -the under construction (by the build method) building
 * @param {Object}  dynamicValueConfig
 *                              -A dynamicValue config object that defines
 *                               the desired value.
 *
 * @returns {*} The value defined by the dynamicValueConfig
 ****************************************************************************/
pearson.brix.BricLayer.prototype.getDynamicValue = function (building, dynamicValueConfig)
{
    var dynamicValueHandlers = pearson.brix.BricLayer.dynamicValueHandlers;

    var dynValType = dynamicValueConfig['type'];
    if (!(dynValType in dynamicValueHandlers))
    {
        throw new Error("Don't know how to process dynamicValue of type '" + dynValType + "'");
    }

    var handler = goog.bind(dynamicValueHandlers[dynValType], this, building);

    return handler(dynamicValueConfig);
};

/* **************************************************************************
 * BricLayer.getRefObject                                              */ /**
 *
 * Returns the value (usually an object) identified by the given domain/refId.
 *
 * @param {Object}  building    -the under construction (by the build method) building
 * @param {string}  domain      -A string which identifies a scope in which the
 *                               refId can be used to identify an existing object.
 * @param {string}  refId       -The id that identifies a value in the specified domain.
 *
 * @returns {*} the value defined by the domain/refId.
 *
 * @note Currently the domain always refers to a property of the building, but
 * in the future it may refer to a database, or uri, or something else entirely.
 *
 ****************************************************************************/
pearson.brix.BricLayer.prototype.getRefObject = function (building, domain, refId)
{
    // right now all domains should refer to properties of the building
    if (!(domain in building))
    {
        throw new Error("The domain '" + domain + "' is unknown.");
    }

    return building[domain][refId];
};

/**
 * Functions to process the various types of actions.
 * They must be called as a member of the BricLayer with the building (under
 * construction) object and the action object.
 * @type {Object.<string, function(this: pearson.brix.BricLayer, Object, Object)>}
 */
pearson.brix.BricLayer.actionHandlers =
{
    /* **************************************************************************
     * actionHandlers.method-call                                          */ /**
     *
     * An action which calls a method of a particular instance object with a
     * given set of arguments.
     *
     * @this {pearson.brix.BricLayer}
     * @param {Object}  building    -the under construction (by the build method) building
     * @param {Object}  action       -the action object
     *
     ****************************************************************************/
    'method-call': function (building, action)
    {
        var instance = this.getDynamicValue(building, action['instance']);
        var args = action['args'].map(
               function (dynVal) { return this.getDynamicValue(building, dynVal); },
               this);

        instance[action['methodName']].apply(instance, args);
    },
};

/**
 * Functions to process the various types of configFixup.
 * They must be called as a member of the BricLayer with the config object,
 * the building (under construction) object and the fixup object.
 * Note the fixup object is last so a partial function can be constructed
 * which specifies the 1st 2 arguments.
 * @note: We may want to make these just generic actions and create a special
 *        domain for the config object that is being fixed up.
 * @type {Object.<string, function(this: pearson.brix.BricLayer, Object, Object, Object)>}
 */
pearson.brix.BricLayer.configFixupHandlers =
{
    /* **************************************************************************
     * configFixupHandlers.set-property                                    */ /**
     *
     * Function which defines a particular property on the config with a
     * specified dynamic value.
     *
     * @this {pearson.brix.BricLayer}
     * @param {Object}  config      -the config object that is to be fixed up
     * @param {Object}  building    -the under construction (by the build method) building
     * @param {Object}  fixup       -the set-property fixup object
     *
     ****************************************************************************/
    'set-property': function (config, building, fixup)
    {
        config[fixup['name']] = this.getDynamicValue(building, fixup['value']);
    },
};

/**
 * Functions to process the various types of dynamicValues.
 * They must be called as a member of the BricLayer with the building
 * (under construction) object and the dynamic value config object.
 * These functions return the desired value.
 * @type {Object.<string, function(this: pearson.brix.BricLayer, Object, Object):*>}
 */
pearson.brix.BricLayer.dynamicValueHandlers =
{
    /* **************************************************************************
     * dynamicValueHandlers.constant                                       */ /**
     *
     * Return the value property from the dynamicValue config.
     *
     * @this {pearson.brix.BricLayer}
     * @param {Object}  building    -the under construction (by the build method) building
     * @param {Object}  dynamicValueConfig
     *                              -the constant dynamicValue config object
     *
     * @returns {*} The value specified in the config.
     ****************************************************************************/
    'constant': function (building, dynamicValueConfig)
    {
        return dynamicValueConfig['value'];
    },

    /* **************************************************************************
     * dynamicValueHandlers.ref                                            */ /**
     *
     * Return some object specified by domain and id.
     *
     * @this {pearson.brix.BricLayer}
     * @param {Object}  building    -the under construction (by the build method) building
     * @param {Object}  dynamicValueConfig
     *                              -the ref dynamicValue config object
     *
     * @returns {*} The object/value specified.
     ****************************************************************************/
    'ref': function (building, dynamicValueConfig)
    {
        var o = this.getRefObject(building, dynamicValueConfig['domain'], dynamicValueConfig['refId']);
        return o;
    },

    /* **************************************************************************
     * dynamicValueHandlers.array                                          */ /**
     *
     * Return an array of the elements defined by the dynamic values in the
     * configuration elements array.
     *
     * @this {pearson.brix.BricLayer}
     * @param {Object}  building    -the under construction (by the build method) building
     * @param {Object}  dynamicValueConfig
     *                              -the array dynamicValue config object
     *
     * @returns {Array.<*>} The array of dynamic values specified.
     ****************************************************************************/
    'array': function (building, dynamicValueConfig)
    {
        var a = dynamicValueConfig['elements'].map(
               function (dynVal) { return this.getDynamicValue(building, dynVal); },
               this);

        return a;
    },

    /* **************************************************************************
     * dynamicValueHandlers.array-element                                  */ /**
     *
     * Return some object that is the element of an array which itself is
     * specified as a dynamic value.
     *
     * @this {pearson.brix.BricLayer}
     * @param {Object}  building    -the under construction (by the build method) building
     * @param {Object}  dynamicValueConfig
     *                              -the array-element dynamicValue config object
     *
     * @returns {*} The object/value specified.
     ****************************************************************************/
    'array-element': function (building, dynamicValueConfig)
    {
        var a = this.getDynamicValue(building, dynamicValueConfig['array']);
        var o = a[dynamicValueConfig['index']];
        return o;
    },

    /* **************************************************************************
     * dynamicValueHandlers.object                                          */ /**
     *
     * Return an object with properties defined by the list of names and associated
     * dynamic values from the configuration properties array.
     *
     * @this {pearson.brix.BricLayer}
     * @param {Object}  building    -the under construction (by the build method) building
     * @param {Object}  dynamicValueConfig
     *                              -the array dynamicValue config object
     *
     * @returns {Object} The defined object w/ properties defined by dynamic
     * values.
     ****************************************************************************/
    'object': function (building, dynamicValueConfig)
    {
        var o = {};
       dynamicValueConfig['properties'].forEach(
               function (prop) { o[prop['name']] = this.getDynamicValue(building, prop['value']); },
               this);

        return o;
    },

    /* **************************************************************************
     * dynamicValueHandlers.join                                           */ /**
     *
     * Return the concatenation of the elements defined by the dynamic values 
     * in the configuration parts array.
     *
     * @this {pearson.brix.BricLayer}
     * @param {Object}  building    -the under construction (by the build method) building
     * @param {Object}  dynamicValueConfig
     *                              -the join dynamicValue config object
     *
     * @returns {*} The concatenation of the values specified.
     ****************************************************************************/
    'join': function (building, dynamicValueConfig)
    {
        var a = dynamicValueConfig['parts'].map(
               function (dynVal) { return this.getDynamicValue(building, dynVal); },
               this);

        return a.join('');
    },

    /* **************************************************************************
     * dynamicValueHandlers.property-of-ref                                */ /**
     *
     * Return the value of a property of some specified object (the value may be
     * returned by an accessor method).
     *
     * @this {pearson.brix.BricLayer}
     * @param {Object}  building    -the under construction (by the build method) building
     * @param {Object}  dynamicValueConfig
     *                              -the property-of-ref dynamicValue config object
     *
     * @returns {*} The value of the property specified.
     ****************************************************************************/
    'property-of-ref': function (building, dynamicValueConfig)
    {
        var o = this.getRefObject(building, dynamicValueConfig['domain'], dynamicValueConfig['refId']);
        return o[dynamicValueConfig['accessor']]();
    },

    /* **************************************************************************
     * dynamicValueHandlers.brix-topic                                     */ /**
     *
     * Return the topic that would be published by an instance of a bric with
     * the given instance ID for the specified named event.
     *
     * @this {pearson.brix.BricLayer}
     * @param {Object}  building    -the under construction (by the build method) building
     * @param {Object}  dynamicValueConfig
     *                              -the brix-topic dynamicValue config object
     *
     * @returns {string} The topic string the bric publishes for the named event.
     ****************************************************************************/
    'brix-topic': function (building, dynamicValueConfig)
    {
        var bricType = dynamicValueConfig['bricType'];
        var instanceId = dynamicValueConfig['instanceId'];
        var eventName = dynamicValueConfig['eventName'];
        var bricWorks = this.getBricWorks();

        return bricWorks.getBricTopic(bricType, eventName, instanceId);
    },

    /* **************************************************************************
     * dynamicValueHandlers.submit-manager                                 */ /**
     *
     * Return this BricLayer's SubmitManager which may be null if no SubmitManager
     * was supplied to the BricLayer constructor.
     *
     * @this {pearson.brix.BricLayer}
     * @param {Object}  building    -the under construction (by the build method) building
     * @param {Object}  dynamicValueConfig
     *                              -the submit-manager dynamicValue config object
     *
     * @returns {pearson.brix.utils.SubmitManager} This BricLayer's SubmitManager
     ****************************************************************************/
    'submit-manager': function (building, dynamicValueConfig)
    {
        return this.submitManager_;
    },

    /* **************************************************************************
     * dynamicValueHandlers.d3select                                       */ /**
     *
     * Return the result from calling d3.select with the given selector.
     *
     * @this {pearson.brix.BricLayer}
     * @param {Object}  building    -the under construction (by the build method) building
     * @param {Object}  dynamicValueConfig
     *                              -the d3select dynamicValue config object
     *
     * @returns {*} The d3 selection specified.
     ****************************************************************************/
    'd3select': function (building, dynamicValueConfig)
    {
        var d3sel = d3.select(dynamicValueConfig['selector']);

        // an empty selection is likely to be unintended, log a warning
        if (d3sel.empty())
        {
            var msg = 'd3select dynamic value w/ selector "' + dynamicValueConfig['selector'] + '" was empty.';
            this.logger_.warning(msg);
        }

        return d3sel;
    },
};

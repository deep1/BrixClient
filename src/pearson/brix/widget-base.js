/* **************************************************************************
 * $Workfile:: widget-base.js                                               $
 * *********************************************************************/ /**
 *
 * @fileoverview Implementation of the utility functions and objects
 *               used by widgets.
 *
 * Created on       March 27, 2013
 * @author          Leslie Bondaryk
 * @author          Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.utils');
goog.provide('pearson.utils');
goog.provide('pearson.utils.Rect');
goog.provide('pearson.utils.Size');
goog.provide('pearson.brix.Bric');
goog.provide('pearson.brix.SvgBric');
goog.provide('pearson.brix.HtmlBric');
goog.provide('pearson.brix.ILightable');
goog.provide('pearson.brix.SVGContainer');

goog.require('goog.debug.Logger');
goog.require('goog.debug.Console');

/**
 * The pearson namespace is the top level namespace for all Pearson created
 * javascript variables.
 * @namespace {!Object} pearson
 */
pearson;
goog.exportSymbol('pearson', pearson);

/**
 * The pearson.utils namespace is where any utility class, function or variable
 * that is generic and has value across domains should be located.
 * @namespace {!Object} pearson.utils
 */
pearson.utils;

/**
 * The pearson.brix namespace contains all the classes and Msupport functions and
 * variables specific to the Brix widgets.
 * @namespace {!Object} pearson.brix
 */
pearson.brix;

/**
 * the pearson.brix.utils namespace contains utility classes and methods which
 * are specific to brix, and not of general use.
 * @namespace {!Object} pearson.brix.utils
 */
pearson.brix.utils;


/* **************************************************************************
 * Utilities
 * *********************************************************************/ /**
 * @todo These need to be moved out of global scope! -mjl
 * **************************************************************************/

/* **************************************************************************
 * pearson.utils.logToConsole                                          */ /**
 *
 * Have some of the logger messages go to the console.
 *
 * @param {boolean} enable      -true to start logging to the console, false
 *                               to stop.
 * @param {string}  levelName   -The name of the log level, ie 'ERROR' or 'FINE'
 *                               defaults to 'CONFIG'
 * @param {string}  logName     -The name that identifies the logger that should
 *                               output to the console.
 *
 ****************************************************************************/
pearson.utils.logToConsole = function (enable, levelName, logName)
{
    // create a new console only if we haven't already created one
    var debugConsole = pearson.utils.logToConsole.debugConsole;
    if (!debugConsole)
    {
        debugConsole = new goog.debug.Console();
        pearson.utils.logToConsole.debugConsole = debugConsole;
    }

    // Any value (but in particular undefined) means turn on logging
    if (enable !== false)
    {
        enable = true;
    }

    // Default the log level to 'CONFIG'
    levelName = levelName || 'CONFIG';
    var logLevel = goog.debug.Logger.Level.getPredefinedLevel(levelName);

    // Default the log name to the top of the pearson hierarchy
    logName = logName !== undefined ? logName : 'pearson';

    debugConsole.setCapturing(enable);
    goog.debug.Logger.getLogger(logName).setLevel(logLevel);
};

pearson.brix.utils.measure = function (container)
{
    if (!container)
        return { height: 0, width: 0 };

    //container.append('text').attr({x: -1000, y: -1000}).text(text);
    var bbox = container.node().getBBox();
    //container.remove();
    return { height: bbox.height,
             width:  bbox.width };
};

pearson.brix.utils.logFormat = function (d)
{
    //find the log base 10 (plus a little for zero padding)
    var x = (Math.log(d) / Math.log(10)) + 1e-6;
    //then see if the log has abscissa 1, and only return numbers for those, and even
    return (Math.abs(x - Math.floor(x)) < .1)&&(Math.floor(x)%2==0) ? d3.round(Math.log(d)/Math.log(10)) : "";
};

/* **************************************************************************
 * sign                                                                */ /**
 *
 * Return 1 for positive numbers, -1 for negative numbers and 0 for things
 * which are neither.
 *
 * @param {number}  x       -The number whose sign is to be returned
 *
 * @todo The algorithm may want to be tweaked because I'm not sure this is what
 * I'd want, I think I'd want 0 to return 1 not 0.
 * My reasoning is that to give y the same sign as x I would want to
 * write: y = sign(x) * abs(y);
 * so it is useful to consider 0 positive even though it isn't. -mjl
 ****************************************************************************/
pearson.brix.utils.sign = function (x)
{
    return x ? x < 0 ? -1 : 1 : 0;
};

/* **************************************************************************
 * attrFnVal                                                           */ /**
 *
 * Utility method that constructs a string function call given the
 * function name and arguments.
 *
 * @param {string}      fnName      -Function name that will be called.
 * @param {...number}   var_args    -Arguments for the function call.
 ****************************************************************************/
pearson.brix.utils.attrFnVal = function (fnName, var_args)
{
    // get the fn args into an Array
    var args = Array.prototype.slice.call(arguments, 1);

    var fnCallStr = fnName + '(';
    fnCallStr += args.join(',');
    fnCallStr += ')';

    return fnCallStr;
};

/* **************************************************************************
 * getIdFromConfigOrAuto                                               */ /**
 *
 * Utility method that returns the id property of the config object or
 * uses the autoIdCount and autoIdPrefix properties of the class to return
 * the next auto assigned id for that class.
 *
 * @param {Object}      config      -object containing optional string id property.
 * @param {Object}      autoIdClass -class object to supply the auto id
 *
 * @return {string} id from config or generated.
 *
 * @todo seems like this would be better as a static base class method once
 *       we have a base class for widgets.
 ****************************************************************************/
pearson.brix.utils.getIdFromConfigOrAuto = function getIdFromConfigOrAuto(config, autoIdClass)
{
    if (config.id !== undefined)
    {
        return config.id;
    }

    // Get the next auto id from the class
    // handle missing auto id properties
    if (!('autoIdCount' in autoIdClass))
    {
        autoIdClass.autoIdCount = 0;
    }

    if (!('autoIdPrefix' in autoIdClass))
    {
        //Testing if the naming the function expression so I can reference it here works - mjl
        //var idCnt = ++pearson.brix.utils.getIdFromConfigOrAuto.autoPrefixCount;
        var idCnt = ++getIdFromConfigOrAuto.autoPrefixCount;
        autoIdClass.autoIdPrefix = "auto" + idCnt + "_";
    }

    return autoIdClass.autoIdPrefix + (++autoIdClass.autoIdCount);
};

/**
 * Count of class autoIdPrefix properties that have been set by getIdFromConfigOrAuto.
 * @type {number}
 */
pearson.brix.utils.getIdFromConfigOrAuto.autoPrefixCount = 0;

/* **************************************************************************
 * randomizeArray                                                      */ /**
 *
 * Randomize the order of the elements of the given array.
 * @export
 *
 * @param {Array}   a       -The array whose elements are to be randomized
 *
 ****************************************************************************/
pearson.utils.randomizeArray = function (a)
{
    // We'll do this by assigning each element of the given array a random number
    // then sort by that number.
    var rndArray = [];

    for (var i = a.length - 1; i >= 0; --i)
    {
        rndArray[i] = { r: Math.random(), element: a[i] };
    }

    rndArray.sort(function (a, b) { return a.r - b.r; });

    for (var i = a.length - 1; i >= 0; --i)
    {
        a[i] = rndArray[i].element;
    };
};

/* **************************************************************************
 * Rect                                                                */ /**
 *
 * A Rect defines a rectangle on a plane whose coordinates increase down and
 * to the right.
 * It has a top, bottom, left, right, width and height.
 * @constructor
 * @export
 *
 * @param {number}  x       -The x-coordinate location of the left side of the rectangle.
 * @param {number}  y       -The y-coordinate location of the top side of the rectangle.
 * @param {number}  width   -A non-negative value that represents the Width of the rectangle.
 * @param {number}  height  -A non-negative value that represents the Height of the rectangle.
 *
 * @todo consider using javascript property accessor for width/height, so dependent properties stay consistent
 *
 ****************************************************************************/
pearson.utils.Rect = function (x, y, width, height)
{
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.top = y;
    this.left = x;
    this.bottom = this.top + height;
    this.right = this.left + width;
};

/* **************************************************************************
 * Rect.getSize                                                        */ /**
 *
 * Get the size of this rect in a Size object.
 * @export
 *
 * @return {pearson.utils.ISize}
 ****************************************************************************/
 pearson.utils.Rect.prototype.getSize = function ()
 {
    return { height: this.height, width: this.width };
 };

/* **************************************************************************
 * Rect.makeRect - static                                              */ /**
 *
 * Helper function to create a rect from any 2 vertical values (t,b,h) and
 * any 2 horizontal values (l,r,w). If 3 values are specified, the height
 * and width are the values that will be ignored (not checked that they match
 * the other 2 values).
 * @export
 *
 * @param {Object} definedBy    -object that must have 2 vertical values (t,b,h)
 *                               and 2 horizontal values (l,r,w).
 * @return {pearson.utils.Rect}
 ****************************************************************************/
pearson.utils.Rect.makeRect = function (definedBy)
{
    var vertCnt = 0;

    if ('t' in definedBy)
    {
        var haveT = true;
        ++vertCnt;
    }

    if ('b' in definedBy)
    {
        var haveB = true;
        ++vertCnt;
    }

    if ('h' in definedBy)
    {
        var haveH = true;
        ++vertCnt;
    }

    var horizCnt = 0;

    if ('l' in definedBy)
    {
        var haveL = true;
        ++horizCnt;
    }

    if ('r' in definedBy)
    {
        var haveR = true;
        ++horizCnt;
    }

    if ('w' in definedBy)
    {
        var haveW = true;
        ++horizCnt;
    }

    // todo: What is the appropriate abort mechanism? throw? if so throw what? -mjl
    if (vertCnt < 2)
        window.console.log("Cannot define rect, not enough vertical values", definedBy);

    if (horizCnt < 2)
        window.console.log("Cannot define rect, not enough horizontal values", definedBy);

    if (haveT)
    {
        var top = definedBy.t;
        var bottom = haveB ? definedBy.b : top + definedBy.h;
        var height = bottom - top;
    }
    else // must have B & H
    {
        var bottom = definedBy.b;
        var height = definedBy.h;
        var top = bottom - height;
    }

    if (haveL)
    {
        var left = definedBy.l;
        var right = haveR ? definedBy.r : left + definedBy.w;
        var width = right - left;
    }
    else // must have R & W
    {
        var right = definedBy.r;
        var width = definedBy.w;
        var left = right - width;
    }

    return new pearson.utils.Rect(left, top, width, height);
}; // end Rect.makeRect

/* **************************************************************************
 * ISize                                                               */ /**
 *
 * Pseudo interface for Size, which just requires height and width properties.
 * It is frequently easier to just create an object w/ those 2 properties
 * rather than ```new Size(h,w)```.
 * @note a real interface seems to also require calling a class constructor.
 *
 * @typedef {Object} pearson.utils.ISize
 * @property {number}   height  -The vertical dimension of the ISize in the common units
 * @property {number}   width   -The horizontal dimension of the ISize in the common units
 */
pearson.utils.ISize;


/* **************************************************************************
 * Size                                                                */ /**
 *
 * Size defines a 2 dimensional area. It has a height and a width in some
 * common unit such as pixels.
 *
 * @constructor
 * @export
 *
 * @param {number}  height  -The vertical dimension in the common units
 * @param {number}  width   -The horizontal dimension in the common units
 ****************************************************************************/
pearson.utils.Size = function (height, width)
{
    /**
     * The number of units that measures the vertical dimension.
     * @type {number}
     */
    this.height = height;

    /**
     * The number of units that measures the horizontal dimension.
     * @type {number}
     */
    this.width = width;
};

/* **************************************************************************
 * Size.matchRatioWithHeight                                           */ /**
 *
 * Return a Size with the specified height whose aspect ratio is the same as
 * that of the given size.
 * @export
 *
 * @param {number}  desiredHeight   -The vertical dimension of the Size to be returned.
 * @param {pearson.utils.ISize}
 *                  desiredRatio    -A Size whose ratio should be preserved in the returned Size.
 * @return {pearson.utils.ISize}
 ****************************************************************************/
pearson.utils.Size.matchRatioWithHeight = function (desiredHeight, desiredRatio)
{
    return {height: desiredHeight,
            width: desiredRatio.width * desiredHeight / desiredRatio.height};
};

/* **************************************************************************
 * Size.matchRatioWithWidth                                            */ /**
 *
 * Return a Size with the specified width whose aspect ratio is the same as
 * that of the given size.
 * @export
 *
 * @param {number}  desiredWidth    -The horizontal dimension of the Size to be returned.
 * @param {pearson.utils.ISize}
 *                  desiredRatio    -A Size whose ratio should be preserved in the returned Size.
 * @return {pearson.utils.ISize}
 ****************************************************************************/
pearson.utils.Size.matchRatioWithWidth = function (desiredWidth, desiredRatio)
{
    return {height: desiredRatio.height * desiredWidth / desiredRatio.width,
            width: desiredWidth};
};


/* **************************************************************************
 * Interfaces
 * **************************************************************************/

/* **************************************************************************
 * IWidget                                                             */ /**
 *
 * This was the 1st attempt at defining a widget interface, it should become
 * subsumed by other interfaces and base classes. It remains here until
 * that process is completed. -mjl
 *
 * IWidget defines the methods and properties that are expected to exist
 * on all widgets defined by this library.
 * @interface
 ****************************************************************************/
pearson.brix.IWidget = function () {};

/* **************************************************************************
 * IWidget.redraw                                                      */ /**
 *
 * Redraw the widget assuming its data may have been modified. It will be
 * redrawn into the same container area as it was last drawn.
 *
 ****************************************************************************/
pearson.brix.IWidget.prototype.redraw = function () {};

/* **************************************************************************
 * IWidget.setScale                                                    */ /**
 *
 * Called to preempt the normal scale definition which is done when the
 * widget is drawn. This is usually called in order to force one widget
 * to use the scaling/data area calculated by another widget.
 *
 * @param {function(number): number}
 *                      xScale  -function to convert a horizontal data offset
 *                               to the pixel offset into the data area.
 * @param {function(number): number}
 *                      yScale  -function to convert a vertical data offset
 *                               to the pixel offset into the data area.
 ****************************************************************************/
pearson.brix.IWidget.prototype.setScale = function (xScale, yScale) {};

/* **************************************************************************
 * IWidget.xScale                                                      */ /**
 *
 * Convert a data X position into a horizontal pixel position.
 *
 * @param {number}  dataX   -position along the X axis from the data domain.
 * @return {number} horizontal pixel offset corresponding to that data position.
 ****************************************************************************/
pearson.brix.IWidget.prototype.xScale = function (dataX) {};

/* **************************************************************************
 * IWidget.yScale                                                      */ /**
 *
 * Convert a data Y position into a vertical pixel position.
 *
 * @param {number}  dataY   -position along the Y axis from the data domain.
 * @return {number} vertical pixel offset corresponding to that data position.
 ****************************************************************************/
pearson.brix.IWidget.prototype.yScale = function (dataY) {};

 /**
 * Definition of the fields of the configuration object used by the
 * SVGContainer constructor.
 * documentation, not to be called/instantiated.
 * @constructor
 */
pearson.brix.SVGContainerConfig = function ()
{
    /**
     * The parent node for the created svg element
     * @type {!d3.selection}
     * @note may need to change this to be a standard DOM node object -lb
     */
    this.node = d3.select("html");

    /**
     * The maximum width of the svg container (in pixels)
     * @type {number}
     */
    this.maxWid = 0;

    /**
     * The maximum height of the svg container (in pixels)
     * @type {number}
     */
    this.maxHt = 0;
};

/* **************************************************************************
 * ILightable                                                          */ /**
 *
 * An ILightable bric supports the 'lite' method to highlight the element of
 * the bric that is associated with a given liteKey.
 * @interface
 ****************************************************************************/
pearson.brix.ILightable = function () {};

/* **************************************************************************
 * ILightable.lite                                                     */ /**
 *
 * Highlight the element identified by the given key, unhighlighting any
 * previously highlighted elements.
 *
 * @param {string}  liteKey -The key associated with the area to be highlighted.
 *
 ****************************************************************************/
pearson.brix.ILightable.prototype.lite = function (liteKey) {};

/* **************************************************************************
 * IState                                                              */ /**
 *
 * An IState bric supports the 'getState' and 'restoreState' methods.
 * @interface
 ****************************************************************************/
pearson.brix.IState = function () {};

/* **************************************************************************
 * IState.getState                                                     */ /**
 *
 * Get a state object that represents the current state of this object and
 * can be passed to restoreState.
 *
 * @returns {!Object} Object that when passed back to this type of object's
 *          restoreState method will set its state to match the current state
 *          of this object.
 *
 ****************************************************************************/
pearson.brix.IState.prototype.getState = function () {};

/* **************************************************************************
 * IState.restoreState                                                 */ /**
 *
 * Restores the state of this object to match the state object given.
 *
 * @param {!Object} state   -Object returned by the call to getState on
 *                           this type of an object representing the state
 *                           to be restored.
 *
 ****************************************************************************/
pearson.brix.IState.prototype.restoreState = function (state) {};


/**
 * KeyedAnswers are presented to users by certain brix that allow the user to
 * select one (or more of them).
 *
 * @typedef {Object} pearson.brix.KeyedAnswer
 * @property {htmlString}
 *                      content     -The content of the answer, which presents the
 *                                   meaning of the answer.
 * @property {string}   answerKey   -This is the unique ID that will be returned
 *                                   to the scoring engine to identify that the
 *                                   user has chosen this answer.
 *
 * @todo: the content currently must be text (an htmlString) however, we are likely
 * to want to also let the content be various bric types in the future.
 */
pearson.brix.KeyedAnswer;

/* **************************************************************************
 * IChoicePresenter                                                    */ /**
 *
 * An IChoicePresenter bric is one which may be used to present the choices
 * of a MultipleChoiceQuestion to the user.
 *
 * To serve this purpose it must be an HTMLBric that provides this interface
 * AND also supports certain config properties.
 *
 * The config properties it must support are:
 *  - {!Array.<!pearson.brix.KeyedAnswer>} choices
 *    The list of choices (answers) to be presented.
 *
 * @interface
 ****************************************************************************/
pearson.brix.IChoicePresenter = function () {};

/* **************************************************************************
 * IChoicePresenter.selectedEventId                                    */ /**
 *
 * The event id published when a choice is selected.
 *
 * The event details will contain the following properties:
 *  - {string} selectKey -The answerKey associated with the selected answer.
 *  - {number} index     -The index of the selected answer from the list of choices.
 *
 * @const
 * @type {string}
 *
 * @note Having this property may also imply that the class support the
 * static method getEventTopic and an event name of 'selected'.
 ****************************************************************************/
pearson.brix.IChoicePresenter.prototype.selectedEventId;

/* **************************************************************************
 * IChoicePresenter.selectedChoice                                     */ /**
 *
 * Return the choice element corresponding to the current selection in the
 * presenter or null if nothing has been selected.
 * Note that this does not return the index of the selected choice.
 *
 * @return {pearson.brix.KeyedAnswer} the element from the configuration
 * choice array corresponding to the choice which is currently selected or null.
 *
 ****************************************************************************/
pearson.brix.IChoicePresenter.prototype.selectedChoice = function () {};

/* **************************************************************************
 * IChoicePresenter.getChoiceByKey                                     */ /**
 *
 * Return the choice element corresponding to the given key or null if the
 * key doesn't match any choice.
 *
 * @return {pearson.brix.KeyedAnswer} the element from the configuration
 * choice array corresponding to the given key, or null.
 *
 ****************************************************************************/
pearson.brix.IChoicePresenter.prototype.getChoiceByKey = function (key) {};

/* **************************************************************************
 * IChoicePresenter.selectChoice                                       */ /**
 *
 * Select the choice in the presenter represented by the given key or index.
 * If the choice is already selected, do nothing.
 *
 * @param {string|number}   choiceSelector  -Either the key (if a string) or
 *                                           the index (if a number) of the
 *                                           choice to be selected

 ****************************************************************************/
pearson.brix.IChoicePresenter.prototype.selectChoice = function (choiceSelector) {};

/* **************************************************************************
 * IChoicePresenter.flagChoice                                         */ /**
 *
 * Flag the choice with the given key in some way to make it stand out.
 * This is currently used to flag the correct answer.
 *
 * @param {string}  key     -The key that identifies the choice to be flagged
 *
 ****************************************************************************/
pearson.brix.IChoicePresenter.prototype.flagChoice = function (key) {};


/* **************************************************************************
 * Abstract Base Classes
 * **************************************************************************/

/* **************************************************************************
 * BuildingBlock                                                       */ /**
 *
 * Base class constructor for Bric and Mortar ABCs, as a base unifying type.
 * This is for use as a parameter type when any building block could be
 * passed as the object.
 *
 *
 * @constructor
 *
 * @classdesc
 * A BuildingBlock is used as the base for ABCs like Bric and Mortar.
 *
 ****************************************************************************/
pearson.brix.BuildingBlock = function ()
{
};

/* **************************************************************************
 * Bric                                                                */ /**
 *
 * Base class constructor used only by derived Bric instances.
 *
 * @constructor
 * @extends {pearson.brix.BuildingBlock}
 *
 * @classdesc
 * A Bric is a building block "widget" which is capable of drawing itself
 * on a web page in an HTML element.
 *
 ****************************************************************************/
pearson.brix.Bric = function ()
{
};

/* **************************************************************************
 * Bric.getId                                                          */ /**
 *
 * Returns the ID of this bric.
 *
 * @returns {string} The ID of this Bric.
 *
 ****************************************************************************/
pearson.brix.Bric.prototype.getId = function ()
{
    // There is no id defined unless the derived class defines one and
    // overrides this method.
    return 'override in derived class for real id';
};


/* **************************************************************************
 * HtmlBric                                                            */ /**
 *
 * Base class constructor used only by derived HtmlBric instances.
 *
 * @constructor
 * @extends {pearson.brix.Bric}
 *
 * @classdesc
 * An HtmlBric is a Bric which is rendered using HTML tags.
 *
 ****************************************************************************/
pearson.brix.HtmlBric = function ()
{
    // call the base class constructor
    goog.base(this);
};
goog.inherits(pearson.brix.HtmlBric, pearson.brix.Bric);

/* **************************************************************************
 * HtmlBric.draw                                                       */ /**
 *
 * Draw this HtmlBric in the given container (must be an html element).
 * @abstract
 *
 * @param {!d3.selection}   container   -The container html element to append
 *                                       this HtmlBric element tree to.
 *
 ****************************************************************************/
pearson.brix.HtmlBric.prototype.draw = function (container) {};
pearson.brix.HtmlBric.prototype.draw = goog.abstractMethod;


/* **************************************************************************
 * SvgBric                                                             */ /**
 *
 * Base class constructor used only by derived SvgBric instances.
 *
 * @constructor
 * @extends {pearson.brix.Bric}
 *
 * @classdesc
 * An SvgBric is a Bric which is rendered using SVG tags, it is not drawn
 * directly into the web page, instead it is drawn in a specialized
 * SvgBric container {@link pearson.brix.SVGContainer}.
 *
 ****************************************************************************/
pearson.brix.SvgBric = function ()
{
    // call the base class constructor
    goog.base(this);
};
goog.inherits(pearson.brix.SvgBric, pearson.brix.Bric);

/* **************************************************************************
 * SvgBric.draw                                                        */ /**
 *
 * Draw this SvgBric in the given container (must be an svg element). The
 * container will be assumed to be the given size in pixels.
 * @abstract
 *
 * @param {!d3.selection}   container   -The container svg element to append
 *                                       this SvgBric element tree to.
 * @param {!pearson.utils.ISize}
 *                          size        -The size (in pixels) of the area this
 *                                       SvgBric has been allocated.
 *
 ****************************************************************************/
pearson.brix.SvgBric.prototype.draw = function (container, size) {};
pearson.brix.SvgBric.prototype.draw = goog.abstractMethod;


/* **************************************************************************
 * SVGContainer                                                        */ /**
 *
 * The SVGContainer creates an svg element and appends it as the last
 * child of the given node. The svg elements properties are set based on
 * the given configuration values.
 *
 * @constructor
 * @extends {pearson.brix.Bric}
 * @export
 *
 * @param {Object}          config          -The settings to configure this SVGContainer
 * @param {!d3.selection}   config.node     -The parent node for the created svg element
 * @param {pearson.utils.ISize}
 *                          config.maxSize  -The maximum size of the svg container (in pixels)
 * @param {number}          config.maxWid   -(deprecated: use maxSize) The maximum width of the svg container (in pixels)
 * @param {number}          config.maxHt    -(deprecated: use maxSize) The maximum width of the svg container (in pixels)
 *
 * @note Think about whether the SVGContainer is actually an HtmlBric. -mjl
 *
 ****************************************************************************/
pearson.brix.SVGContainer = function (config)
{
    // call the base class constructor
    goog.base(this);

    /**
     * Logger for this Bric
     * @private
     * @type {goog.debug.Logger}
     */
    this.logger_ = goog.debug.Logger.getLogger('pearson.brix.SVGContainer');

    /**
     * The parent node of the created svg element
     * @type {d3.selection}
     */
    this.parentNode = config.node;

    /**
     * The maximum size of this svg container (in pixels)
     * @type {!pearson.utils.ISize}
     */
    this.maxSize = config.maxSize || {height: config.maxHt, width: config.maxWid};

    // It's easy to specify the node incorrectly, lets call that out right away!
    if (this.parentNode.empty())
    {
        var errmsg = "SVGContainer parent node doesn't exist.";
        this.logger_.severe(errmsg);
        throw new Error(errmsg);
    }

    // todo: why is the container talking about graphs? in the comment below -mjl
    //maxWid, maxHt: the width and height of the graph region, without margins, integers

    // create the svg element for this container of the appropriate size and scaling
    var w = this.maxSize.width;
    var h = this.maxSize.height;
    /**
     * The svg element representing the container in the document
     * @type {d3.selection}
     */
    this.svgObj = this.parentNode.append("svg")             // append the new svg element to the parent node
        .attr("viewBox", [0, 0, w, h].join(' '))            // set its size
        .attr("preserveAspectRatio", "xMinYMin meet")       // make it scale correctly in single-column or phone layouts
        .style("max-width", w + "px")                       // max width works to make it lay out to scale
        .style("max-height", h + "px");                     // max height keeps it from forcing whitespace below
                                                            //  in most cases, but not on Safari or Android.  This is a documented
                                                            //  webkit bug, which they claim they will fix eventually:
                                                            //  https://bugs.webkit.org/show_bug.cgi?id=82489
                                                            //  A horrible Jquery workaround is documented at
                                                            //  http://www.brichards.co.uk/blog/webkit-svg-height-bug-workaround
};
goog.inherits(pearson.brix.SVGContainer, pearson.brix.Bric);

/* **************************************************************************
 * SVGContainer.append                                                 */ /**
 *
 * Append the given widgets to the container at the specified location
 * within it. If multiple widgets are passed in, the x and y scale of
 * the 1st widget will be set on the other widgets before calling draw.
 * @export
 *
 * @param {Object}  svgWidgets      -The widget or array of widgets to draw in the container
 * @param {Object=} location        -The location in the container where the
 *                                   widget should be placed. If not specified the entire
 *                                   container will be used.
 * @param {number}  location.topPercentOffset
 *                                  -Fraction offset of the top of the widget.
 * @param {number}  location.leftPercentOffset
 *                                  -Fraction offset of the left of the widget.
 * @param {number}  location.heightPercent
 *                                  -Fraction of container height for the widget height.
 * @param {number}  location.widthPercent
 *                                  -Fraction of container width for the widget width.
 *
 ****************************************************************************/
pearson.brix.SVGContainer.prototype.append = function (svgWidgets, location)
{
    if (!Array.isArray(svgWidgets))
    {
        this.append_one_(svgWidgets, location);
    }
    else
    {
        // When appending a group of widgets, the data scale of the 1st one
        // should be used by the rest of the widgets.
        for (var i = 0; i < svgWidgets.length; ++i)
        {
            if (i > 0)
            {
                svgWidgets[i].setScale(svgWidgets[0].xScale, svgWidgets[0].yScale);
            }

            this.append_one_(svgWidgets[i], location);
        }
    }
};

/* **************************************************************************
 * SVGContainer.append_one_                                            */ /**
 *
 * Private helper that appends the given widget to the container at the
 * specified location within it.
 *
 * @param {Object}  svgWidget       -The widget to draw in the container
 * @param {Object|undefined}
 *                  location        -optional. The location in the container where the
 *                                   widget should be placed. If not specified the entire
 *                                   container will be used.
 * @param {number}  location.topPercentOffset
 *                                  -Fraction offset of the top of the widget.
 * @param {number}  location.leftPercentOffset
 *                                  -Fraction offset of the left of the widget.
 * @param {number}  location.heightPercent
 *                                  -Fraction of container height for the widget height.
 * @param {number}  location.widthPercent
 *                                  -Fraction of container width for the widget width.
 *
 * @private
 *
 ****************************************************************************/
pearson.brix.SVGContainer.prototype.append_one_ = function (svgWidget, location)
{
    if (location === undefined)
    {
        location = {topPercentOffset: 0, leftPercentOffset: 0, heightPercent: 1, widthPercent: 1};
    }
    // create a group for the widget to draw into that we can then position
    var g = this.svgObj.append('g').attr("class", "brix");
    var h = d3.round(location.heightPercent * this.maxSize.height);
    var w = d3.round(location.widthPercent * this.maxSize.width);
    svgWidget.draw(g, {height: h, width: w});

    // position the widget
    var top = d3.round(location.topPercentOffset * this.maxSize.height);
    var left = d3.round(location.leftPercentOffset * this.maxSize.width);
    if (top !== 0 || left !== 0)
    {
        g.attr('transform', 'translate(' + left + ',' + top + ')');
    }
};


/* **************************************************************************
 * SVGContainer.remove                                            */ /**
 *
 * Removes the given bric from the container.
 *
 * @param {Object}	svgBric			-The bric to remove from the SVG container
 *
 * @private
 *
 ****************************************************************************/
pearson.brix.SVGContainer.prototype.remove = function (svgBric)
{
	svgBric.lastdrawn.container.remove();
	svgBric.lastdrawn.container = null;
	svgBric.lastdrawn.size = null;
	
};

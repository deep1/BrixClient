/* **************************************************************************
 * $Workfile:: d3.v3.externs.js                                             $
 * *********************************************************************/ /**
 *
 * @fileoverview Externs for d3 version 3
 *
 * Note that some functions use different return types depending on the number
 * of parameters passed in. In these cases, you may need to annotate the type
 * of the result in your code, so the JSCompiler understands which type you're
 * expecting. For example:
 *    <code>var elt = /** @type {Element} * / (foo.get(0));</code>
 *
 *
 * @see https://github.com/mbostock/d3/wiki/API-Reference
 * @externs
 *
 * **************************************************************************/

/**
 * An html string is expected to contain valid html, although it isn't enforced.
 *
 * @typedef {string} htmlString
 */
var htmlString;

/**
 * D3 uses CSS3 to select elements. For example, you can select by tag ("div"),
 * class (".awesome"), unique identifier ("#foo"), attribute ("[color=red]"),
 * or containment ("parent child"). Selectors can also be intersected
 * (".this.that" for logical AND) or unioned (".this, .that" for logical OR).
 *
 * @typedef {string} d3Selector
 */
var d3Selector;

/**
 * d3 data function is allowed for most of the d3.selection manipulation methods.
 * The 1st parameter is the datum associated w/ the element (d), the 2nd parameter
 * is the innermost index (i) of the element in the selection, the 3rd argument is
 * the next higher selection nesting index (j).
 * @note this type was meant to be used for the manipulation methods such as text
 * and attr, etc. However that seems to require typecasts for all of the anonymous
 * functions used w/ those methods. As that seems onerous, the annotations below now
 * just use {!Function}.
 * @typedef {function(*=, ...[number]): (string|number|boolean)} d3DataFunc
 */
var d3DataFunc;

var d3 = {
    "version": {},
    "ascending": function () {},
    "descending": function () {},
    "min": function () {},
    "max": function () {},
    "extent": function () {},
    "sum": function () {},
    "mean": function () {},
    "quantile": function () {},
    "median": function () {},
    "bisector": function () {},
    "bisectLeft": function () {},
    "bisectRight": function () {},
    "bisect": function () {},
    "shuffle": function () {},
    "permute": function () {},
    "zip": function () {},
    "transpose": function () {},
    "keys": function () {},
    "values": function () {},
    "entries": function () {},
    "merge": function () {},
    "range": function () {},
    "map": function () {},
    "nest": function () {},
    "set": function () {},
    "behavior": {
        "drag": function () {},
        "zoom": function () {}
    },
    "rebind": function () {},
    "dispatch": function () {},
    "event": function () {},
    "requote": function () {},

    "ns": {
        "prefix": {
            "svg": {},
            "xhtml": {},
            "xlink": {},
            "xml": {},
            "xmlns": {}
        },
        "qualify": function () {}
    },

	/**
	 * Selects the first element that matches the specified selector string,
	 * returning a single-element selection. If no elements in the current
	 * document match the specified selector, returns the empty selection.
	 * If multiple elements match the selector, only the first matching element
	 * (in document traversal order) will be selected.
	 *
	 * @param {d3Selector|Element} selector
	 * @returns {!d3.selection}
	 */
    "select": function (selector) {},

	/**
	 * Selects all elements that match the specified selector. The elements will
	 * be selected in document traversal order (top-to-bottom). If no elements
	 * in the current document match the specified selector, returns the empty selection.
	 * @param {d3Selector|Array.<Element>} selector
	 * @returns {!d3.selection}
	 */
    "selectAll": function (selector) {},

    "mouse": function () {},
    "touches": function () {},
    "hsl": function () {},
    "hcl": function () {},
    "lab": function () {},
    "rgb": function () {},
    "functor": function () {},
    "xhr": function () {},
    "dsv": function () {},
    "csv": function () {},
    "tsv": function () {},
    "timer": function () {},
    "formatPrefix": function () {},
    "round": function () {},
    "format": function () {},
    "geo": {
        "stream": function () {},
        "area": function () {},
        "bounds": function () {},
        "centroid": function () {},
        "conicEqualArea": function () {},
        "albers": function () {},
        "albersUsa": function () {},
        "path": function () {},
        "projection": function () {},
        "projectionMutator": function () {},
        "equirectangular": function () {},
        "rotation": function () {},
        "circle": function () {},
        "distance": function () {},
        "graticule": function () {},
        "greatArc": function () {},
        "interpolate": function () {},
        "length": function () {},
        "azimuthalEqualArea": function () {},
        "azimuthalEquidistant": function () {},
        "conicConformal": function () {},
        "conicEquidistant": function () {},
        "gnomonic": function () {},
        "mercator": function () {},
        "orthographic": function () {},
        "stereographic": function () {},
        "transverseMercator": function () {}
    },
    "geom": {
        "hull": function () {},
        "polygon": function () {},
        "delaunay": function () {},
        "voronoi": function () {},
        "quadtree": function () {}
    },
    "svg": {
        "line": function () {},
        "arc": function () {},
        "area": function () {},
        "chord": function () {},
        "diagonal": function () {},
        "symbol": function () {},
        "symbolTypes": {
            "0": {},
            "1": {},
            "2": {},
            "3": {},
            "4": {},
            "5": {}
        },
        "axis": function () {},
        "brush": function () {}
    },
    "interpolateRgb": function () {},
    "interpolateObject": function () {},
    "interpolateNumber": function () {},
    "interpolateString": function () {},
    "interpolate": function () {},
    "interpolators": {
        "0": function () {}
    },
    "interpolateArray": function () {},
    "ease": function () {},
    "interpolateHcl": function () {},
    "interpolateHsl": function () {},
    "interpolateLab": function () {},
    "interpolateRound": function () {},
    "transform": function () {},
    "interpolateTransform": function () {},
    "layout": {
        "bundle": function () {},
        "chord": function () {},
        "force": function () {},
        "hierarchy": function () {},
        "partition": function () {},
        "pie": function () {},
        "stack": function () {},
        "histogram": function () {},
        "tree": function () {},
        "pack": function () {},
        "cluster": function () {},
        "treemap": function () {}
    },
    "random": {
        "normal": function () {},
        "logNormal": function () {},
        "irwinHall": function () {}
    },
    "scale": {
//        "linear": function () {},
//        "log": function () {},
//        "pow": function () {},
        "sqrt": function () {},
//        "ordinal": function () {},
        "category10": function () {},
        "category20": function () {},
        "category20b": function () {},
        "category20c": function () {},
        "quantile": function () {},
//        "quantize": function () {},
        "threshold": function () {},
        "identity": function () {}
    },
    "transition": function () {},
    "time": {
        "year": function () {},
        "years": function () {},
        "day": function () {},
        "days": function () {},
        "dayOfYear": function () {},
        "sunday": function () {},
        "sundays": function () {},
        "sundayOfYear": function () {},
        "monday": function () {},
        "mondays": function () {},
        "mondayOfYear": function () {},
        "tuesday": function () {},
        "tuesdays": function () {},
        "tuesdayOfYear": function () {},
        "wednesday": function () {},
        "wednesdays": function () {},
        "wednesdayOfYear": function () {},
        "thursday": function () {},
        "thursdays": function () {},
        "thursdayOfYear": function () {},
        "friday": function () {},
        "fridays": function () {},
        "fridayOfYear": function () {},
        "saturday": function () {},
        "saturdays": function () {},
        "saturdayOfYear": function () {},
        "week": function () {},
        "weeks": function () {},
        "weekOfYear": function () {},
        "format": function () {},
        "second": function () {},
        "seconds": function () {},
        "minute": function () {},
        "minutes": function () {},
        "hour": function () {},
        "hours": function () {},
        "month": function () {},
        "months": function () {},
        "scale": function () {}
    },
    "text": function () {},
    "json": function () {},
    "html": function () {},
    "xml": function () {}
};

/* **************************************************************************
 * d3.selection                                                        */ /**
 * Selections are arrays of elements—literally. D3 binds additional methods to
 * the array so that you can apply operators to the selected elements, such as
 * setting an attribute on all the selected elements. One nuance is that
 * selections are grouped: rather than a one-dimensional array, each selection
 * is an array of arrays of elements. This preserves the hierarchical structure
 * of subselections. Most of the time, you can ignore this detail, but that's
 * why a single-element selection looks like [[node]] rather than [node].
 *
 * @constructor
 */
d3.selection = function () {};

/**
 * Sets the attribute with the specified name to the specified value on all selected elements.
 *
 * @param {string} name
 * @param {(?string|number|boolean|!Function)=} value
 * @returns {!d3.selection}
 */
d3.selection.prototype.attr = function (name, value) {};

/**
 * This operator is a convenience routine for setting the "class" attribute;
 * it understands that the "class" attribute is a set of tokens separated by
 * spaces. Under the hood, it will use the classList if available, for convenient
 * adding, removing and toggling of CSS classes.
 *
 * @param {string} name
 * @param {(boolean|!Function)=} value
 * @returns {!d3.selection}
 */
d3.selection.prototype.classed = function (name, value) {};

/**
 * If value is specified, sets the CSS style property with the specified
 * name to the specified value on all selected elements.
 * An optional priority may also be specified, either as null or the
 * string "important" (without the exclamation point).
 * @param {string} name
 * @param {?string|!Function=} value
 * @param {?string=} priority
 * @returns {!d3.selection}
 */
d3.selection.prototype.style = function (name, value, priority) {};

/**
 * Some HTML elements have special properties that are not addressable using
 * standard attributes or styles. For example, form text fields have a value
 * string property, and checkboxes have a checked boolean property. You can
 * use the property operator to get or set these properties, or any other
 * addressable field on the underlying element, such as className.
 *
 * @param {string} name
 * @param {*|!Function=} value
 * @returns {!d3.selection}
 */
d3.selection.prototype.property = function (name, value) {};

/**
 * The text operator is based on the textContent property; setting the text
 * content will replace any existing child elements.
 *
 * @param {(string|number|!Function)=} value
 * @returns {!d3.selection}
 */
d3.selection.prototype.text = function (value) {};

/**
 * The html operator is based on the innerHTML property; setting the inner HTML
 * content will replace any existing child elements. Also, you may prefer to
 * use the append or insert operators to create HTML content in a data-driven
 * way; this operator is intended for when you want a little bit of HTML,
 * say for rich formatting.
 *
 * @param {(htmlString|!Function)=} value
 * @returns {!d3.selection}
 */
d3.selection.prototype.html = function (value) {};

/**
 * Appends a new element with the specified name as the last child of each
 * element in the current selection, returning a new selection containing the
 * appended elements. Each new element inherits the data of the current elements,
 * if any, in the same manner as select for subselections.
 *
 * @param {string|!Function} name
 * @returns {!d3.selection}
 */
d3.selection.prototype.append = function (name) {};

/**
 * Inserts a new element with the specified name before the element matching
 * the specified before selector, for each element in the current selection,
 * returning a new selection containing the inserted elements. If the before
 * selector does not match any elements, then the new element will be the last
 * child as with append.
 *
 * @param {string|!Function} name
 * @param {d3Selector|!Function} before
 * @returns {!d3.selection}
 */
d3.selection.prototype.insert = function (name, before) {};

/**
 * Removes the elements in the current selection from the current document.
 * Returns the current selection (the same elements that were removed) which
 * are now "off-screen", detached from the DOM. Note that there is not
 * currently a dedicated API to add removed elements back to the document;
 * however, you can pass a function to selection.append or selection.insert
 * to re-add elements.
 *
 * @returns {!d3.selection}
 */
d3.selection.prototype.remove = function () {};

/**
 * Joins the specified array of data with the current selection. The specified
 * values is an array of data values, such as an array of numbers or objects,
 * or a function that returns an array of values. If a key function is not
 * specified, then the first datum in the specified array is assigned to the
 * first element in the current selection, the second datum to the second
 * selected element, and so on. When data is assigned to an element, it is
 * stored in the property __data__, thus making the data "sticky" so that the
 * data is available on re-selection.
 *
 * @param {(!Array.<*>|!Function)=} values
 * @param {!Function=} key
 * @returns {!d3.dataSelection|*}
 */
d3.selection.prototype.data = function (values, key) {};

/**
 * Gets or sets the bound data for each selected element.
 *
 * @param {(*|!Function)=} value
 * @returns {!d3.selection}
 */
d3.selection.prototype.datum = function (value) {};

/**
 * Filters the selection, returning a new selection that contains only the elements for which the specified selector is true. The selector may be specified either as a function or as a selector string, such as ".foo".
 *
 * @param {d3Selector} selector
 * @returns {!d3.selection}
 */
d3.selection.prototype.filter = function (selector) {};

/**
 * Sorts the elements in the current selection according to the specified
 * comparator function. The comparator function is passed two data elements
 * a and b to compare, returning either a negative, positive, or zero value.
 * If negative, then a should be before b; if positive, then a should be
 * after b; otherwise, a and b are considered equal and the order is
 * arbitrary. Note that the sort is not guaranteed to be stable; however,
 * it is guaranteed to have the same behavior as your browser's built-in
 * sort method on arrays.
 *
 * @param {!Function} comparator
 * @returns {!d3.selection}
 */
d3.selection.prototype.sort = function (comparator) {};

/**
 * Re-inserts elements into the document such that the document order
 * matches the selection order. This is equivalent to calling sort() if
 * the data is already sorted, but much faster.
 *
 * @returns {!d3.selection}
 */
d3.selection.prototype.order = function () {};

/**
 * Adds or removes an event listener to each element in the current selection,
 * for the specified type. The type is a string event type name, such as "click",
 * "mouseover", or "submit". The specified listener is invoked in the same
 * manner as other operator functions, being passed the current datum d and
 * index i, with the this context as the current DOM element.
 * An optional capture flag may be specified, which corresponds to the W3C
 * useCapture flag.
 *
 * @param {string} type
 * @param {!Function=} listener
 * @param {boolean=} capture
 * @returns {!d3.selection}
 */
d3.selection.prototype.on = function (type, listener, capture) {};

/**
 * Starts a transition for the current selection. Transitions behave much
 * like selections, except operators animate smoothly over time rather
 * than applying instantaneously.
 *
 * @returns {!d3.transitionSelection}
 */
d3.selection.prototype.transition = function () {};

/**
 * Immediately interrupts the current transition, if any. Does not cancel
 * any scheduled transitions that have not yet started.
 *
 * @returns {!d3.selection}
 */
d3.selection.prototype.interrupt = function () {};

/**
 * Invokes the specified function for each element in the current selection,
 * passing in the current datum d and index i, with the this context of the
 * current DOM element. This operator is used internally by nearly every other
 * operator, and can be used to invoke arbitrary code for each selected element.
 * The each operator can be used to process selections recursively, by using
 * d3.select(this) within the callback function.
 *
 * @param {!Function} fn
 * @return {!d3.selection}
 */
d3.selection.prototype.each = function (fn) {};

/**
 * Invokes the specified function once, passing in the current selection along
 * with any optional arguments. The call operator always returns the current
 * selection, regardless of the return value of the specified function. The
 * call operator is identical to invoking a function by hand; but it makes it
 * easier to use method chaining.
 *
 * @param {function(!d3.selection, ...)} fn
 * @param {...} var_args
 * @return {!d3.selection}
 */
d3.selection.prototype.call = function (fn, var_args) {};

/**
 * Returns true if the current selection is empty; a selection is empty
 * if it contains no non-null elements.
 *
 * @returns {boolean}
 */
d3.selection.prototype.empty = function () {};

/**
 * Returns the first non-null element in the current selection.
 * If the selection is empty, returns null.
 * @returns {Element}
 */
d3.selection.prototype.node = function () {};

/**
 * Returns the total number of elements in the current selection.
 * @returns {number}
 */
d3.selection.prototype.size = function () {};

/**
 * For each element in the current selection, selects the first descendant
 * element that matches the specified selector string. If no element matches
 * the specified selector for the current element, the element at the current
 * index will be null in the returned selection;
 *
 * @param {d3Selector} selector
 * @returns {!d3.selection}
 */
d3.selection.prototype.select = function (selector) {};

/**
 * For each element in the current selection, selects descendant elements that
 * match the specified selector string. The returned selection is grouped by
 * the ancestor node in the current selection. If no element matches the specified
 * selector for the current element, the group at the current index will be
 * empty in the returned selection. The subselection does not inherit data
 * from the current selection;
 *
 * @param {d3Selector} selector
 * @returns {!d3.selection}
 */
d3.selection.prototype.selectAll = function (selector) {};


/* **************************************************************************
 * d3.dataSelection                                                    */ /**
 * The selection returned by the d3.selection.data method has some
 * additional functionality (namely enter and exit methods).
 * @constructor
 * @extends {d3.selection}
 */
d3.dataSelection = function () {};

/**
 * @returns {!d3.enterSelection}
 */
d3.dataSelection.prototype.enter = function() {};

/**
 * Returns the exiting selection: existing DOM elements in the current selection
 * for which no new data element was found. 
 * The exiting selection defines all the normal operators, though typically the
 * main one you'll want to use is remove; the other operators exist primarily so
 * you can define an exiting transition as desired.
 *
 * @returns {!d3.selection}
 */
d3.dataSelection.prototype.exit = function() {};

/* **************************************************************************
 * d3.enterSelection                                                   */ /**
 * The selection returned by the d3.dataSelection.enter method has limited
 * functionality, that this class represents.
 * @constructor
 */
d3.enterSelection = function () {};

/**
 * @param {string|!Function} name
 * @returns {!d3.selection}
 */
d3.enterSelection.prototype.append = function(name) {};

/**
 * @param {string|!Function} name
 * @param {d3Selector|!Function} before
 * @returns {!d3.selection}
 */
d3.enterSelection.prototype.insert = function(name, before) {};

/**
 * @param {d3Selector} selector
 * @returns {!d3.selection}
 */
d3.enterSelection.prototype.select = function(selector) {};

/** 
 * @param {function(!d3.selection, ...)} fn
 * @param {...} var_args
 * @return {!d3.selection}
 */
d3.enterSelection.prototype.call = function(fn, var_args) {};

/**
 * Returns true if the current selection is empty; a selection is empty
 * if it contains no non-null elements.
 *
 * @returns {boolean}
 */
d3.enterSelection.prototype.empty = function() {};

/* **************************************************************************
 * d3.transitionSelection                                              */ /**
 * A transition is a special type of selection where the operators apply
 * smoothly over time rather than instantaneously. You derive a transition
 * from a selection using the transition operator. While transitions
 * generally support the same operators as selections (such as attr and
 * style), not all operators are supported; for example, you must append
 * elements before a transition starts. A remove operator is provided for
 * convenient removal of elements when the transition ends.
 *
 * @constructor
 * @extends {d3.selection}
 */
d3.transitionSelection = function () {};

/**
 * Specifies the transition delay in milliseconds. If delay is a constant, then
 * all elements are given the same delay; otherwise, if delay is a function,
 * then the function is evaluated for each selected element (in order), being
 * passed the current datum d and the current index i, with the this context as
 * the current DOM element. The function's return value is then used to set
 * each element's delay. The default delay is 0.
 *
 * @param {number|!Function} delay
 * @returns {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.delay = function (delay) {};

/**
 * Specifies per-element duration in milliseconds. If duration is a constant,
 * then all elements are given the same duration; otherwise, if duration is a
 * function, then the function is evaluated for each selected element (in order),
 * being passed the current datum d and the current index i, with the this
 * context as the current DOM element. The function's return value is then used
 * to set each element's duration. The default duration is 250ms.
 *
 * @param {number|!Function} duration
 * @returns {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.duration = function (duration) {};

/**
 * Specifies the transition easing function. If value is a function, it is used
 * to ease the current parametric timing value t in the range [0,1]; otherwise,
 * value is assumed to be a string and the arguments are passed to the d3.ease
 * method to generate an easing function. The default easing function
 * is "cubic-in-out".
 *
 * @param {string|!Function} value
 * @param {...} var_args
 * @returns {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.ease = function (value, var_args) {};

/**
 * Sets the attribute with the specified name to the specified value on all selected elements.
 * @override
 *
 * @param {string} name
 * @param {(?string|number|boolean|!Function)=} value
 * @returns {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.attr = function (name, value) {};

/**
 * This operator is a convenience routine for setting the "class" attribute;
 * it understands that the "class" attribute is a set of tokens separated by
 * spaces. Under the hood, it will use the classList if available, for convenient
 * adding, removing and toggling of CSS classes.
 * @override
 *
 * @param {string} name
 * @param {(boolean|!Function)=} value
 * @returns {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.classed = function (name, value) {};

/**
 * If value is specified, sets the CSS style property with the specified
 * name to the specified value on all selected elements.
 * An optional priority may also be specified, either as null or the
 * string "important" (without the exclamation point).
 * @override
 *
 * @param {string} name
 * @param {?string|!Function=} value
 * @param {?string=} priority
 * @returns {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.style = function (name, value, priority) {};

/**
 * Some HTML elements have special properties that are not addressable using
 * standard attributes or styles. For example, form text fields have a value
 * string property, and checkboxes have a checked boolean property. You can
 * use the property operator to get or set these properties, or any other
 * addressable field on the underlying element, such as className.
 * @override
 *
 * @param {string} name
 * @param {*|!Function=} value
 * @returns {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.property = function (name, value) {};

/**
 * The text operator is based on the textContent property; setting the text
 * content will replace any existing child elements.
 * @override
 *
 * @param {(string|number|!Function)=} value
 * @returns {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.text = function (value) {};

/**
 * The html operator is based on the innerHTML property; setting the inner HTML
 * content will replace any existing child elements. Also, you may prefer to
 * use the append or insert operators to create HTML content in a data-driven
 * way; this operator is intended for when you want a little bit of HTML,
 * say for rich formatting.
 * @override
 *
 * @param {(htmlString|!Function)=} value
 * @returns {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.html = function (value) {};

/**
 * Removes the elements in the current selection from the current document.
 * Returns the current selection (the same elements that were removed) which
 * are now "off-screen", detached from the DOM. Note that there is not
 * currently a dedicated API to add removed elements back to the document;
 * however, you can pass a function to selection.append or selection.insert
 * to re-add elements.
 * @override
 *
 * @returns {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.remove = function () {};

/**
 * Gets or sets the bound data for each selected element.
 * @override
 *
 * @param {(*|!Function)=} value
 * @returns {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.datum = function (value) {};

/**
 * Filters the selection, returning a new selection that contains only the elements for which the specified selector is true. The selector may be specified either as a function or as a selector string, such as ".foo".
 * @override
 *
 * @param {d3Selector} selector
 * @returns {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.filter = function (selector) {};

/**
 * Sorts the elements in the current selection according to the specified
 * comparator function. The comparator function is passed two data elements
 * a and b to compare, returning either a negative, positive, or zero value.
 * If negative, then a should be before b; if positive, then a should be
 * after b; otherwise, a and b are considered equal and the order is
 * arbitrary. Note that the sort is not guaranteed to be stable; however,
 * it is guaranteed to have the same behavior as your browser's built-in
 * sort method on arrays.
 * @override
 *
 * @param {!Function} comparator
 * @returns {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.sort = function (comparator) {};

/**
 * Re-inserts elements into the document such that the document order
 * matches the selection order. This is equivalent to calling sort() if
 * the data is already sorted, but much faster.
 * @override
 *
 * @returns {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.order = function () {};

/**
 * Adds or removes an event listener to each element in the current selection,
 * for the specified type. The type is a string event type name, such as "click",
 * "mouseover", or "submit". The specified listener is invoked in the same
 * manner as other operator functions, being passed the current datum d and
 * index i, with the this context as the current DOM element.
 * An optional capture flag may be specified, which corresponds to the W3C
 * useCapture flag.
 * @override
 *
 * @param {string} type
 * @param {!Function=} listener
 * @param {boolean=} capture
 * @returns {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.on = function (type, listener, capture) {};

/**
 * Immediately interrupts the current transition, if any. Does not cancel
 * any scheduled transitions that have not yet started.
 * @override
 *
 * @returns {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.interrupt = function () {};

/**
 * Invokes the specified function for each element in the current selection,
 * passing in the current datum d and index i, with the this context of the
 * current DOM element. This operator is used internally by nearly every other
 * operator, and can be used to invoke arbitrary code for each selected element.
 * The each operator can be used to process selections recursively, by using
 * d3.select(this) within the callback function.
 * @override
 *
 * @param {!Function} fn
 * @return {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.each = function (fn) {};

/**
 * Invokes the specified function once, passing in the current selection along
 * with any optional arguments. The call operator always returns the current
 * selection, regardless of the return value of the specified function. The
 * call operator is identical to invoking a function by hand; but it makes it
 * easier to use method chaining.
 * @override
 *
 * @param {function(!d3.selection, ...)} fn
 * @param {...} var_args
 * @return {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.call = function (fn, var_args) {};

/**
 * For each element in the current selection, selects the first descendant
 * element that matches the specified selector string. If no element matches
 * the specified selector for the current element, the element at the current
 * index will be null in the returned selection;
 * @override
 *
 * @param {d3Selector} selector
 * @returns {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.select = function (selector) {};

/**
 * For each element in the current selection, selects descendant elements that
 * match the specified selector string. The returned selection is grouped by
 * the ancestor node in the current selection. If no element matches the specified
 * selector for the current element, the group at the current index will be
 * empty in the returned selection. The subselection does not inherit data
 * from the current selection;
 * @override
 *
 * @param {d3Selector} selector
 * @returns {!d3.transitionSelection}
 */
d3.transitionSelection.prototype.selectAll = function (selector) {};


/* **************************************************************************
 * d3.linearScale                                                      */ /**
 * Given a value x in the input domain, returns the corresponding value
 * in the output range.
 *
 * @typedef {function(number): number} d3.linearScale
 */
d3.linearScale;

/**
 * @type {!d3.linearScale}
 */
var linearScale;

linearScale.invert = function () {};

/**
 * Sets the scale's input domain to the specified
 * array of numbers. The array must contain two or more numbers.
 *
 * @param {Array.<number>=} numbers
 * @returns {!d3.linearScale}
 */
linearScale.domain = function (numbers) {};

/**
 * If values is specified, sets the scale's output range to the specified
 * array of values. The array must contain two or more values, to match
 * the cardinality of the input domain, otherwise the longer of the two
 * is truncated to match the other. The elements in the given array need
 * not be numbers; any value that is supported by the underlying
 * interpolator will work.
 *
 * @param {Array.<*>=} values
 * @returns {!d3.linearScale}
 */
linearScale.range = function (values) {};

/**
 * Sets the scale's output range to the specified array of values, while
 * also setting the scale's interpolator to d3.interpolateRound. This is
 * a convenience routine for when the values output by the scale should
 * be exact integers, such as to avoid antialiasing artifacts.
 *
 * @param {Array.<number>} values
 * @returns {!d3.linearScale}
 */
linearScale.rangeRound = function (values) {};

linearScale.interpolate = function () {};
linearScale.clamp = function () {};
linearScale.nice = function () {};
linearScale.ticks = function () {};
linearScale.tickFormat = function () {};
linearScale.copy = function () {};

/**
 * @returns {!d3.linearScale}
 */
d3.scale.linear = function () {};

/* **************************************************************************
 * d3.powScale                                                         */ /**
 * Given a value x in the input domain, returns the corresponding value
 * in the output range.
 *
 * @typedef {function(number): number} d3.powScale
 */
d3.powScale;

/**
 * @type {!d3.powScale}
 */
var powScale;

powScale.invert = function () {};

/**
 * Sets the scale's input domain to the specified
 * array of numbers. The array must contain two or more numbers.
 *
 * @param {Array.<number>=} numbers
 * @returns {!d3.powScale}
 */
powScale.domain = function (numbers) {};

/**
 * If values is specified, sets the scale's output range to the specified
 * array of values. The array must contain two or more values, to match
 * the cardinality of the input domain, otherwise the longer of the two
 * is truncated to match the other. The elements in the given array need
 * not be numbers; any value that is supported by the underlying
 * interpolator will work.
 *
 * @param {Array.<*>=} values
 * @returns {!d3.powScale}
 */
powScale.range = function (values) {};

/**
 * Sets the scale's output range to the specified array of values, while
 * also setting the scale's interpolator to d3.interpolateRound. This is
 * a convenience routine for when the values output by the scale should
 * be exact integers, such as to avoid antialiasing artifacts.
 *
 * @param {Array.<number>} values
 * @returns {!d3.powScale}
 */
powScale.rangeRound = function (values) {};

powScale.interpolate = function () {};
powScale.clamp = function () {};
powScale.nice = function () {};
powScale.ticks = function () {};
powScale.tickFormat = function () {};
powScale.exponent = function () {};
powScale.copy = function () {};

/**
 * @returns {!d3.powScale}
 */
d3.scale.pow = function () {};

/* **************************************************************************
 * d3.logScale                                                         */ /**
 * Given a value x in the input domain, returns the corresponding value
 * in the output range.
 *
 * @typedef {function(number): number} d3.logScale
 */
d3.logScale;

/**
 * @type {!d3.logScale}
 */
var logScale;

logScale.invert = function () {};

/**
 * Sets the scale's input domain to the specified
 * array of numbers. The array must contain two or more numbers.
 *
 * @param {Array.<number>=} numbers
 * @returns {!d3.logScale}
 */
logScale.domain = function (numbers) {};

/**
 * If values is specified, sets the scale's output range to the specified
 * array of values. The array must contain two or more values, to match
 * the cardinality of the input domain, otherwise the longer of the two
 * is truncated to match the other. The elements in the given array need
 * not be numbers; any value that is supported by the underlying
 * interpolator will work.
 *
 * @param {Array.<*>=} values
 * @returns {!d3.logScale}
 */
logScale.range = function (values) {};

/**
 * Sets the scale's output range to the specified array of values, while
 * also setting the scale's interpolator to d3.interpolateRound. This is
 * a convenience routine for when the values output by the scale should
 * be exact integers, such as to avoid antialiasing artifacts.
 *
 * @param {Array.<number>} values
 * @returns {!d3.logScale}
 */
logScale.rangeRound = function (values) {};

logScale.interpolate = function () {};
logScale.clamp = function () {};
logScale.nice = function () {};
logScale.ticks = function () {};
logScale.tickFormat = function () {};
logScale.copy = function () {};

/**
 * @returns {!d3.logScale}
 */
d3.scale.log = function () {};

/* **************************************************************************
 * d3.quantizeScale                                                    */ /**
 * Given a value x in the input domain, returns the corresponding value
 * in the output range.
 *
 * @typedef {function(number): number} d3.quantizeScale
 */
d3.quantizeScale;

/**
 * Quantize scales are a variant of linear scales with a discrete rather
 * than continuous range. The input domain is still continuous, and divided
 * into uniform segments based on the number of values in (the cardinality of)
 * the output range. The mapping is linear in that the output range value y
 * can be expressed as a linear function of the input domain value x: y = mx + b.
 * @type {!d3.quantizeScale}
 */
var quantizeScale;

/**
 * Returns the extent of values in the input domain [x0, x1] for the
 * corresponding value in the output range y, representing the inverse
 * mapping from range to domain.
 *
 * @param {number} y
 * @returns {Array.<number>}
 */
quantizeScale.invertExtent = function (y) {};

/**
 * Sets the scale's input domain to the specified
 * array of numbers. The array must contain two or more numbers.
 *
 * @param {Array.<number>=} numbers
 * @returns {!d3.quantizeScale}
 */
quantizeScale.domain = function (numbers) {};

/**
 * If values is specified, sets the scale's output range to the specified
 * array of values. The array must contain two or more values, to match
 * the cardinality of the input domain, otherwise the longer of the two
 * is truncated to match the other. The elements in the given array need
 * not be numbers; any value that is supported by the underlying
 * interpolator will work.
 *
 * @param {Array.<*>=} values
 * @returns {!d3.quantizeScale}
 */
quantizeScale.range = function (values) {};

/**
 * Constructs a new quantize scale with the default domain [0,1] and the
 * default range [0,1]. Thus, the default quantize scale is equivalent to
 * the round function for numbers; for example quantize(0.49) returns 0,
 * and quantize(0.51) returns 1.
 *
 * @returns {!d3.quantizeScale}
 */
d3.scale.quantize = function () {};

/* **************************************************************************
 * d3.ordinalScale                                                     */ /**
 * Given a value x in the input domain, returns the corresponding value
 * in the output range.
 *
 * @typedef {function(*): number} d3.ordinalScale
 */
d3.ordinalScale;

/**
 * @type {!d3.ordinalScale}
 */
var ordinalScale;

/**
 * Sets the input domain of the ordinal scale to the specified array of
 * values. The first element in values will be mapped to the first element
 * in the output range, the second domain value to the second range value,
 * and so on. Domain values are stored internally in an associative array
 * as a mapping from value to index; the resulting index is then used to
 * retrieve a value from the output range.
 *
 * @param {Array.<string>=} values
 * @returns {!d3.ordinalScale}
 */
ordinalScale.domain = function (values) {};

/**
 * Sets the output range of the ordinal scale to the specified array of
 * values. The first element in the domain will be mapped to the first
 * element in values, the second domain value to the second range value,
 * and so on. If there are fewer elements in the range than in the domain,
 * the scale will recycle values from the start of the range.
 * @override
 *
 * @param {Array.<*>=} values
 * @returns {!d3.ordinalScale}
 */
ordinalScale.range = function (values) {};

/**
 *
 * @param {!Array.<number>} interval
 * @param {number=} padding
 * @returns {!d3.ordinalScale}
 */
ordinalScale.rangePoints = function (interval, padding) {};

/**
 * Sets the output range from the specified continuous interval.
 * The array interval contains two elements representing the
 * minimum and maximum numeric value.
 *
 * @param {!Array.<number>} interval
 * @param {number=} padding
 * @param {number=} outerPadding
 * @returns {!d3.ordinalScale}
 */
ordinalScale.rangeBands = function (interval, padding, outerPadding) {};

/**
 * Like rangeBands, except guarantees that the band width and offset
 * are integer values, so as to avoid antialiasing artifacts.
 *
 * @param {!Array.<number>} interval
 * @param {number=} padding
 * @param {number=} outerPadding
 * @returns {!d3.ordinalScale}
 */
ordinalScale.rangeRoundBands = function (interval, padding, outerPadding) {};

/**
 * Returns the band width. When the scale’s range is configured with
 * rangeBands or rangeRoundBands, the scale returns the lower value
 * for the given input. The upper value can then be computed by
 * offsetting by the band width. If the scale’s range is set using
 * range or rangePoints, the band width is zero.
 *
 * @returns {number}
 */
ordinalScale.rangeBand = function () {};

/**
 * Returns a two-element array representing the extent of the scale's
 * range, i.e., the smallest and largest values.
 *
 * @returns {Array}
 */
ordinalScale.rangeExtent = function () {};

/**
 * Returns an exact copy of this ordinal scale. Changes to this scale
 * will not affect the returned scale, and vice versa.
 *
 * @returns {!d3.ordinalScale}
 */
ordinalScale.copy = function () {};

/**
 * @returns {!d3.ordinalScale}
 */
d3.scale.ordinal = function () {};

/* **************************************************************************
 * d3.anyScale                                                         */ /**
 * @typedef {!d3.linearScale|
 *           !d3.powScale|
 *           !d3.logScale|
 *           !d3.quantizeScale|
 *           !d3.ordinalScale} d3.anyScale
 */
d3.anyScale;

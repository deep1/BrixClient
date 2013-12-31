/* **************************************************************************
 * helper.js                                                                $
 * **********************************************************************//**
 *
 * @fileoverview Helper functions for use w/ the mocha tests.
 *
 * Created on       May 29, 2013
 * @author          Michael Jay Lippert
 *
 * Copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

'use strict';

// Note: this is a name in the global space. I'm still not sure of the best
// way to do this. -mjl
// For now, to add a new helper function, define a local variable in the function
// below, and then add a property with that value in the returned object.
var helper = (function () {
    var expect = chai.expect;

    var SVGContainer = pearson.brix.SVGContainer;

    /* **************************************************************************
     * createNewDiv                                                         *//**
     *
     * createNewDiv will append a new div element to the document body and
     * return that div.
     *
     * @param {Object=} opt_attribs Array of name value pair for the attributes
     * @param {Object=} opt_data     rray of name value pair for the dataset
     *
     * @return {Element}       the newly created div element
     *
     ****************************************************************************/
    var createNewDiv = function createNewDiv(opt_attribs, opt_data)
    {
        var body = d3.select("body");
        var divNode = body.append("div").node();

        if (opt_attribs)
        {
            for (var prop in opt_attribs)
            {
                divNode.setAttribute(prop, opt_attribs[prop]);
            }
        }
        if (opt_data)
        {
            for (var prop in opt_data)
            {
                divNode.setAttribute('data-' + prop, opt_data[prop]);
            }
        }
        return divNode;
    };


    /* **************************************************************************
     * createNewObject                                                      *//**
     *
     * createNewObject will create a new object element from the document and
     * return that object.
     * The caller is responsible of attaching the returned element.
     *
     * @param {DOM} containerEl        The element which the new node will be appended as child
     * @param {string} classAttrVal    Value for the class attribute
     * @param {string} dataAttrVal     Value for the data attribute
     * @param {<Object>=} opt_params   Array of name value pair for the params
     * @return {Element} the newly created object element
     *
     ****************************************************************************/
    var createNewObject = function createNewObject(containerEl, classAttrVal, dataAttrVal, opt_params)
    {
        var objectEl = document.createElement("object");
        containerEl.appendChild(objectEl);
        if (classAttrVal) {
            objectEl.setAttribute("class", classAttrVal);
        }
        if (dataAttrVal) {
            objectEl.setAttribute("data", dataAttrVal);
        }

        if (opt_params)
        {
            // Generate inner param elements 
            for (var prop in opt_params)
            {
                var paramEl = document.createElement("param");
                paramEl.setAttribute('name', prop);
                paramEl.setAttribute('value', opt_params[prop]);
                objectEl.appendChild(paramEl);
            }
        }
        
        
        return objectEl;
    };

    /* **************************************************************************
     * appendChild                                                          *//**
     *
     * appendChild will append a new object element to the document body and
     * return that object.
     *
     * @param {string} id           Id of element to append the childNode
     * @param {DOMNode} childNode   The element to append
     * @return {Element} the newly created object element
     *
     ****************************************************************************/
    var appendChild = function(id, childNode)
    {
        var parentEl = document.getElementById(id);
        parentEl.appendChild(childNode);
    };

    /* **************************************************************************
     * removeAllChildren                                                    *//**
     *
     * removeAllChildren will remove all children of a given element with id.
     *
     * @param {string} id           Id of element which all child elements will be removed
     * @return {Element} the newly created object element
     *
     ****************************************************************************/
    var removeAllChildren = function(node)
    {
        var myNode = node;
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }
    };

    /* **************************************************************************
     * createNewSvgContainer                                                *//**
     *
     * createNewSvgContainer removes the node initially specified in config.node
     * and resets config.node to a new node (created using createNewDiv), then
     * creates and returns an SVGContainer using that config.
     *
     * @param {Object} config           -A config object for SVGContainer.
     * @param {d3.selection}
     *                  config.node     -null, or an existing node to be removed.
     * @param {number}  config.maxWid   -The maximum width of the svg container (in pixels)
     * @param {number}  config.maxHt    -The maximum width of the svg container (in pixels)
     *
     * @return {SVGContainer} the newly created SVGContainer
     *
     ****************************************************************************/
    var createNewSvgContainer = function createNewSvgContainer(config)
    {
        // Clean up node from previous test
        config.node && config.node.remove();
        // Get a reference to an empty div to create the widget in.
        config.node = d3.select(createNewDiv());
        // Create an empty svg container to be able to append a LineGraph to.
        return new SVGContainer(config);
    };

    /* **************************************************************************
     * expectElementTree                                                    *//**
     *
     * Unit test helper which tests that a given DOM element matches the
     * given tree description.
     *
     * A tree description is an object that describes the attributes of the DOM
     * element that should be verified, including an array of child tree descriptions
     * which must match the children of the given DOM element.
     *
     * Uses the private helper method expectElement to verify all of the attributes
     * of the DOM element except the child elements.
     *
     * See expectElement for the list of properties that will be verified on the
     * actual DOM element (not including children).
     *
     * Also supported is the optional property 'children' which is an array of element
     * descriptions.
     * or the optional property 'foreach' which is an object with the properties
     * 'items' and 'fn'. This is used to get a tree description for one child of
     * the parent DOM element for each item in 'items'. The function in 'fn'
     * will return the tree description for the particular item it is given.
     *
     * Currently specifying both 'children' and 'foreach' is not supported.
     *
     * @param {Object}  topElement  -DOM element that must match the description.
     * @param {Object}  treeDescr   -Description of the DOM element tree that is expected.
     *
     ****************************************************************************/
    var expectElementTree = function expectElementTree(topElement, treeDescr)
    {
        expectElement(topElement, treeDescr);

        if (treeDescr.children)
        {
            var childElements = getChildren_(topElement.node());
            for (var i = 0; i < treeDescr.children.length; ++i)
            {
                expectElementTree(d3.select(childElements[i]), treeDescr.children[i]);
            };
        }
        else if (treeDescr.foreach)
        {
            var childElements = topElement.node().children;
            for (var i = 0; i < treeDescr.foreach.items.length; ++i)
            {
                expectElementTree(d3.select(childElements[i]),
                                  treeDescr.foreach.fn(treeDescr.foreach.items[i]));
            };
        }
    };

    /* **************************************************************************
     * getChildren_                                                        */ /**
     *
     * Private helper function work around the bug in Chrome where SVGElements
     * which are supposed to implement Element properties and methods, don't
     * implement the children property.
     * @private
     *
     * @param {Element} element     -The element whose child element collection
     *                               is to be returned.
     *
     * @returns {Array|HTMLCollection} ordered list of the child elements
     *
     ****************************************************************************/
    var getChildren_ = function (element)
    {
        if (element.children)
        {
            return element.children;
        }

        // Workaround bug in Chrome where SVG elements don't implement the children property
        var childElements = [];

        for (var e = element.firstElementChild; e !== null; e = e.nextElementSibling)
        {
            childElements.push(e);
        }

        return childElements;
    };

    /* **************************************************************************
     * expectElement                                                        *//**
     *
     * Test the attributes of the given DOM element against what is specified
     * by the given description.
     *
     * Supported description properties are:
     * name - The name of the element
     * class - The element has this class
     *
     * @param {Object}  element     -The DOM element to test.
     * @param {Object}  descr       -The list of attributes to verify on the DOM element.
     * @private
     *
     ****************************************************************************/
    var expectElement = function expectElement(element, descr)
    {
        descr.name && expect(element.node().nodeName).to.be.equal(descr.name);
        descr.class && expect(element.classed(descr.class), 'has class ' + descr.class).to.be.true;
    };

    /***************************************************************************
     * Clones a JSON object.
     * 
     * @param {Object} obj      The JSON object to clone.
     ****************************************************************************/
    var cloneObject = function cloneObject(obj)
    {
        return JSON.parse(JSON.stringify(obj));
    };

    return {
        createNewDiv: createNewDiv,
        createNewSvgContainer: createNewSvgContainer,
        createNewObject: createNewObject,
        appendChild: appendChild,
        removeAllChildren: removeAllChildren,
        expectElementTree: expectElementTree,
        cloneObject: cloneObject,
    };

})();
